# Relatório semanal privado de métricas

O workflow `.github/workflows/weekly-website-report.yml` envia às segundas-feiras, às 09:00 no horário de Brasília (12:00 UTC), um resumo dos últimos sete dias completos, comparado com a semana anterior. Também pode ser executado manualmente pela aba **Actions**.

O relatório inclui sessões, usuários, visualizações, sessões engajadas, taxa de engajamento, canais, páginas, cliques orgânicos, impressões, CTR, posição média, consultas e páginas de pesquisa. Ele é enviado apenas ao destinatário configurado em `REPORT_EMAIL`; os dados não são publicados em artefatos nem em comentários. Os logs não imprimem os números do relatório.

## 1. Ativar GA4 e Search Console

1. Crie ou selecione uma propriedade do Google Analytics 4 para `https://mnl-nox.github.io/mnl-nox/`.
2. Adicione a tag de medição do GA4 ao site usando o ID no formato `G-XXXXXXXXXX`. O site ainda não envia eventos de analytics até esse ID ser configurado.
3. Adicione/verifique `https://mnl-nox.github.io/mnl-nox/` no Google Search Console. Para essa URL de propriedade, mantenha a URL exata com a barra final.
4. Crie uma conta de serviço no Google Cloud e habilite **Google Analytics Data API** e **Google Search Console API**.
5. Conceda o e-mail da conta de serviço acesso de leitor à propriedade GA4 e permissão adequada de leitura à propriedade Search Console.
6. Guarde o JSON da chave da conta de serviço como segredo do GitHub. Nunca o commite no repositório.

## 2. Configurar GitHub Actions

Em **Settings → Secrets and variables → Actions**, crie os seguintes *secrets*:

- `REPORT_EMAIL`: endereço que deve receber o relatório. Não é gravado nos arquivos do repositório.
- `SMTP_HOST`: servidor SMTP do provedor de e-mail.
- `SMTP_PORT`: normalmente `465` para SSL.
- `SMTP_USERNAME`: conta de envio SMTP.
- `SMTP_PASSWORD`: senha de aplicativo ou credencial SMTP. Não use nem compartilhe sua senha principal em conversas.
- `GOOGLE_SERVICE_ACCOUNT_JSON`: conteúdo JSON completo da chave de serviço.

Crie as seguintes *variables* (não são credenciais):

- `GA4_PROPERTY_ID`: ID numérico da propriedade GA4, sem o prefixo `properties/`.
- `GSC_SITE_URL`: `https://mnl-nox.github.io/mnl-nox/`.

O relatório só é enviado quando todas as configurações e permissões estão válidas. O workflow falha explicitamente se faltar alguma variável ou se as APIs recusarem acesso.

## 3. Métricas e limites

- **CTR** é calculado pelo Search Console como cliques divididos por impressões nos resultados de pesquisa.
- Cliques em links dentro do site podem ser medidos no GA4 quando a tag estiver ativa e a medição aprimorada estiver configurada. Cliques em anúncios/campanhas são métricas diferentes.
- O Search Console pode apresentar atraso de alguns dias; dados recentes podem estar incompletos.
- GitHub Pages não fornece métricas completas de visitantes por si só. Sem GA4 configurado, os números de tráfego do site não existem para este relatório.
- O relatório usa acesso somente leitura e envia e-mail apenas para o endereço privado em `REPORT_EMAIL`.

## 4. Verificar o envio

Depois de cadastrar secrets e variables, abra **Actions → Weekly private website metrics → Run workflow**. Confirme o resultado do job e a chegada do e-mail. O primeiro envio manual serve como teste; o cron semanal segue automaticamente depois disso.
