    const menuToggle=document.getElementById('menuToggle');
    const navLinks=document.getElementById('navLinks');
    menuToggle.addEventListener('click',()=>{const open=navLinks.classList.toggle('open');menuToggle.setAttribute('aria-expanded',String(open));menuToggle.textContent=open?'FECHAR −':'MENU +';});
    navLinks.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{navLinks.classList.remove('open');menuToggle.setAttribute('aria-expanded','false');menuToggle.textContent='MENU +';}));
    document.getElementById('year').textContent=new Date().getFullYear();
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}),{threshold:.12});
    document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
