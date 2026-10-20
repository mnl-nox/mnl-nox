#!/usr/bin/env python3
"""Send a private weekly GA4 + Google Search Console summary by email."""
from __future__ import annotations

import json
import os
import smtplib
import sys
from datetime import date, timedelta
from email.message import EmailMessage
from html import escape

from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import DateRange, Dimension, Metric, Filter, FilterExpression
from google.oauth2 import service_account
from googleapiclient.discovery import build

SCOPES = [
    "https://www.googleapis.com/auth/analytics.readonly",
    "https://www.googleapis.com/auth/webmasters.readonly",
]


def required(name: str) -> str:
    value = os.environ.get(name, "").strip()
    if not value:
        raise RuntimeError(f"Required GitHub Actions secret/variable is missing: {name}")
    return value


def service_credentials():
    raw = required("GOOGLE_SERVICE_ACCOUNT_JSON")
    info = json.loads(raw)
    return service_account.Credentials.from_service_account_info(info, scopes=SCOPES)


def ga_report(client, property_id: str, start: str, end: str, metrics: list[str], dimensions: list[str] | None = None, event_name: str | None = None):
    from google.analytics.data_v1beta.types import RunReportRequest
    request_args = {
        "property": f"properties/{property_id}",
        "date_ranges": [DateRange(start_date=start, end_date=end)],
        "dimensions": [Dimension(name=name) for name in (dimensions or [])],
        "metrics": [Metric(name=name) for name in metrics],
        "limit": 10 if dimensions else 1,
    }
    if event_name:
        request_args["dimension_filter"] = FilterExpression(
            filter=Filter(
                field_name="eventName",
                string_filter=Filter.StringFilter(
                    value=event_name,
                    match_type=Filter.StringFilter.MatchType.EXACT,
                ),
            )
        )
    request = RunReportRequest(**request_args)
    response = client.run_report(request)
    return [
        {
            "dimensions": [v.value for v in row.dimension_values],
            "metrics": [v.value for v in row.metric_values],
        }
        for row in response.rows
    ]


def gsc_report(service, site_url: str, start: str, end: str, dimensions: list[str] | None = None, limit: int = 10):
    payload = {"startDate": start, "endDate": end, "rowLimit": limit}
    if dimensions:
        payload["dimensions"] = dimensions
    response = service.searchanalytics().query(siteUrl=site_url, body=payload).execute()
    return response.get("rows", [])


def fmt_int(value) -> str:
    try:
        return f"{float(value):,.0f}".replace(",", ".")
    except (TypeError, ValueError):
        return "0"


def fmt_pct(value) -> str:
    try:
        return f"{float(value) * 100:.2f}%".replace(".", ",")
    except (TypeError, ValueError):
        return "0,00%"


def delta(current, previous) -> str:
    try:
        c, p = float(current), float(previous)
        if p == 0:
            return "novo" if c > 0 else "—"
        change = (c - p) / p * 100
        return f"{change:+.1f}%".replace(".", ",")
    except (TypeError, ValueError):
        return "—"


def table(headers, rows):
    head = "".join(f"<th>{escape(str(h))}</th>" for h in headers)
    body = "".join("<tr>" + "".join(f"<td>{escape(str(cell))}</td>" for cell in row) + "</tr>" for row in rows)
    return f"<table><thead><tr>{head}</tr></thead><tbody>{body}</tbody></table>"


def main():
    email_to = required("REPORT_EMAIL")
    smtp_host = required("SMTP_HOST")
    smtp_user = required("SMTP_USERNAME")
    smtp_password = required("SMTP_PASSWORD")
    smtp_port = int(os.environ.get("SMTP_PORT") or "465")
    property_id = required("GA4_PROPERTY_ID")
    site_url = required("GSC_SITE_URL")

    end_date = date.today() - timedelta(days=1)
    start_date = end_date - timedelta(days=6)
    prev_end = start_date - timedelta(days=1)
    prev_start = prev_end - timedelta(days=6)
    start, end = start_date.isoformat(), end_date.isoformat()
    prev_start_s, prev_end_s = prev_start.isoformat(), prev_end.isoformat()

    creds = service_credentials()
    ga = BetaAnalyticsDataClient(credentials=creds)
    gsc = build("searchconsole", "v1", credentials=creds, cache_discovery=False)

    ga_metrics = ["sessions", "totalUsers", "screenPageViews", "engagedSessions", "engagementRate"]
    current = ga_report(ga, property_id, start, end, ga_metrics)
    previous = ga_report(ga, property_id, prev_start_s, prev_end_s, ga_metrics)
    cur = current[0]["metrics"] if current else ["0", "0", "0", "0", "0"]
    prev = previous[0]["metrics"] if previous else ["0", "0", "0", "0", "0"]
    current_click_rows = ga_report(ga, property_id, start, end, ["eventCount"], event_name="portfolio_click")
    previous_click_rows = ga_report(ga, property_id, prev_start_s, prev_end_s, ["eventCount"], event_name="portfolio_click")
    current_clicks = float(current_click_rows[0]["metrics"][0]) if current_click_rows else 0
    previous_clicks = float(previous_click_rows[0]["metrics"][0]) if previous_click_rows else 0
    current_sessions = float(cur[0]) if cur else 0
    previous_sessions = float(prev[0]) if prev else 0
    click_rate = current_clicks / current_sessions if current_sessions else 0
    previous_click_rate = previous_clicks / previous_sessions if previous_sessions else 0
    labels = ["Sessões", "Usuários", "Visualizações de página", "Sessões engajadas", "Taxa de engajamento"]
    ga_rows = []
    for i, label in enumerate(labels):
        value = fmt_pct(cur[i]) if i == 4 else fmt_int(cur[i])
        before = fmt_pct(prev[i]) if i == 4 else fmt_int(prev[i])
        ga_rows.append([label, value, before, delta(cur[i], prev[i])])
    ga_rows.extend([
        ["Cliques em links rastreados", fmt_int(current_clicks), fmt_int(previous_clicks), delta(current_clicks, previous_clicks)],
        ["Cliques por sessão (taxa de interação)", fmt_pct(click_rate), fmt_pct(previous_click_rate), delta(click_rate, previous_click_rate)],
    ])

    channels = ga_report(ga, property_id, start, end, ["sessions", "totalUsers"], ["sessionDefaultChannelGroup"])
    channel_rows = [[row["dimensions"][0], fmt_int(row["metrics"][0]), fmt_int(row["metrics"][1])] for row in channels]

    pages = ga_report(ga, property_id, start, end, ["screenPageViews", "sessions"], ["pagePath"])
    page_rows = [[row["dimensions"][0], fmt_int(row["metrics"][0]), fmt_int(row["metrics"][1])] for row in pages]

    search_current = gsc_report(gsc, site_url, start, end)
    search_previous = gsc_report(gsc, site_url, prev_start_s, prev_end_s)
    sc = search_current[0] if search_current else {}
    sp = search_previous[0] if search_previous else {}
    search_rows = [
        ["Cliques orgânicos", fmt_int(sc.get("clicks", 0)), fmt_int(sp.get("clicks", 0)), delta(sc.get("clicks", 0), sp.get("clicks", 0))],
        ["Impressões", fmt_int(sc.get("impressions", 0)), fmt_int(sp.get("impressions", 0)), delta(sc.get("impressions", 0), sp.get("impressions", 0))],
        ["CTR média", fmt_pct(sc.get("ctr", 0)), fmt_pct(sp.get("ctr", 0)), delta(sc.get("ctr", 0), sp.get("ctr", 0))],
        ["Posição média", f'{float(sc.get("position", 0)):.1f}'.replace(".", ","), f'{float(sp.get("position", 0)):.1f}'.replace(".", ","), "menor é melhor"],
    ]
    queries = gsc_report(gsc, site_url, start, end, ["query"], 10)
    query_rows = [[r.get("keys", ["—"])[0], fmt_int(r.get("clicks", 0)), fmt_int(r.get("impressions", 0)), fmt_pct(r.get("ctr", 0))] for r in queries]
    search_pages = gsc_report(gsc, site_url, start, end, ["page"], 10)
    search_page_rows = [[r.get("keys", ["—"])[0], fmt_int(r.get("clicks", 0)), fmt_int(r.get("impressions", 0)), fmt_pct(r.get("ctr", 0))] for r in search_pages]

    period = f"{start_date.strftime('%d/%m/%Y')}–{end_date.strftime('%d/%m/%Y')}"
    html = f"""<!doctype html><html lang="pt-BR"><meta charset="utf-8"><body style="font-family:Arial,sans-serif;color:#17212b;line-height:1.5">
    <h1>Relatório semanal do portfólio MNL-NOX</h1><p><strong>Período:</strong> {escape(period)} · comparação com os 7 dias anteriores.</p>
    <h2>Google Analytics 4</h2>{table(["Métrica","Período atual","Período anterior","Variação"], ga_rows)}
    <h2>Origens do tráfego</h2>{table(["Canal","Sessões","Usuários"], channel_rows or [["Sem dados", "—", "—"]])}
    <h2>Páginas mais acessadas</h2>{table(["Página","Visualizações","Sessões"], page_rows or [["Sem dados", "—", "—"]])}
    <h2>Google Search Console</h2>{table(["Métrica","Período atual","Período anterior","Variação"], search_rows)}
    <h2>Consultas de pesquisa</h2>{table(["Consulta","Cliques","Impressões","CTR"], query_rows or [["Sem dados", "—", "—", "—"]])}
    <h2>Páginas nos resultados de pesquisa</h2>{table(["Página","Cliques","Impressões","CTR"], search_page_rows or [["Sem dados", "—", "—", "—"]])}
    <p style="color:#52616d;font-size:12px">Fonte: GA4 e Google Search Console. CTR é a taxa de cliques nos resultados de pesquisa. Os dados podem sofrer atraso de processamento. Este relatório foi enviado apenas ao destinatário configurado no segredo REPORT_EMAIL.</p>
    <style>body{max-width:900px;margin:24px auto;padding:0 16px}h2{margin-top:28px;color:#087b4b}table{border-collapse:collapse;width:100%;margin:12px 0 24px}th,td{padding:9px;text-align:left;border:1px solid #d2dbe2;font-size:13px}th{background:#eaf0f3}</style>
    </body></html>"""
    text_lines = [
        f"Relatório semanal MNL-NOX — {period}",
        "",
        "GA4",
        *[f"{r[0]}: {r[1]} (anterior {r[2]}, variação {r[3]})" for r in ga_rows],
        "",
        "Google Search Console",
        *[f"{r[0]}: {r[1]} (anterior {r[2]}, variação {r[3]})" for r in search_rows],
        "",
        "Relatório completo em HTML. Fonte: GA4 e Google Search Console.",
    ]
    msg = EmailMessage()
    msg["Subject"] = f"MNL-NOX | Métricas semanais | {period}"
    msg["From"] = smtp_user
    msg["To"] = email_to
    msg.set_content("\n".join(text_lines))
    msg.add_alternative(html, subtype="html")
    with smtplib.SMTP_SSL(smtp_host, smtp_port, timeout=30) as server:
        server.login(smtp_user, smtp_password)
        server.send_message(msg)
    print("Weekly report sent successfully to the configured recipient.")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"Report failed: {type(exc).__name__}: {exc}", file=sys.stderr)
        sys.exit(1)
