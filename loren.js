// Loren Metais, visual novo (03/11). Liga html.lm-novo, troca a logo e monta os blocos novos do wireframe:
// barra curta, link de orçamento no topo, Obras no menu, vantagens, categorias, faixa para empresas, quem somos e um
// único botão de WhatsApp. Fora do checkout e do pagamento: lá o site segue exatamente como hoje.
(() => {
  if (/\/checkout|\/pagamento/i.test(location.pathname)) return;
  const BASE = document.currentScript?.src.replace(/[^/]*$/, '') || '';
  const LOGO = BASE + 'logo.svg';  // no teste inline, previa_real troca esta linha pelo SVG embutido
  const WA = 'https://api.whatsapp.com/send/?phone=5519992306593&text=' + encodeURIComponent('Olá! Vim pelo site da Loren Metais e gostaria de atendimento.');
  const ORC = 'data-toggle="modal" data-target="#modal_consulte"';  // o mesmo formulário de orçamento que o site já tem
  const ico = (d) => `<span class="lm-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg></span>`;
  document.documentElement.classList.add('lm-novo');
  // um par de arquivos por tipo de página (cada agente mexe no seu): categoria.* (categoria e busca), produto.*
  const pagina = () => { const c = document.body.className; return /pagina-categoria|pagina-busca/.test(c) ? 'categoria' : /pagina-produto/.test(c) ? 'produto' : /pagina-inicial/.test(c) ? '' : 'paginas'; };  // paginas.*: institucionais, carrinho, conta (Marty)
  const extra = () => { const n = pagina(); if (!n || !BASE) return; const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = BASE + n + '.css'; document.head.append(l); const j = document.createElement('script'); j.src = BASE + n + '.js'; document.head.append(j); };

  const monta = () => {
    if (document.body.dataset.lm) return; document.body.dataset.lm = '1';
    document.querySelectorAll('#cabecalho .logo img').forEach((img) => { img.src = LOGO; img.removeAttribute('srcset'); });
    // cabeçalho nosso (Eduardo 04/11: o do tema "doido e horrível"): logo | busca da loja | conta, orçamento, carrinho.
    // A busca (#form-buscar, com o autocompletar) e o menu do celular do tema são MOVIDOS para cá, não copiados.
    const cab = document.querySelector('#cabecalho');
    if (cab && !cab.querySelector('.lm-topo')) {
      const i = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
      cab.insertAdjacentHTML('afterbegin', `<div class="lm-topo"><div class="lm-wrap lm-topo__linha">
        <button type="button" class="lm-topo__menu" aria-label="Abrir o menu">${i('<path d="M3 6h18M3 12h18M3 18h18"/>')}</button>
        <a class="lm-topo__logo" href="/" aria-label="Loren Metais, página inicial"><img src="${LOGO}" alt="Loren Metais" width="203" height="46"></a>
        <div class="lm-topo__busca"></div>
        <nav class="lm-topo__acoes" aria-label="Conta e carrinho">
          <a href="/conta/index" class="lm-topo__conta">${i('<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>')}<span>Minha conta</span></a>
          <a href="#" class="lm-topo__orc" ${ORC}>${i('<path d="M6 3h9l3 3v15H6z"/><path d="M9 10h6M9 14h6M9 18h4"/>')}<span>Pedir orçamento</span></a>
          <a href="/carrinho/index" class="lm-topo__carrinho">${i('<path d="M3 4h2l2.4 11h10.2L20 7H6.2"/><circle cx="9" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/>')}<span>Carrinho</span><b class="lm-qtd">0</b></a>
        </nav></div></div>`);
      const topo = cab.querySelector('.lm-topo');
      const form = document.querySelector('#form-buscar');
      if (form) { topo.querySelector('.lm-topo__busca').append(form); const q = form.querySelector('input'); if (q) q.placeholder = q.placeholder || 'Buscar'; }
      const menuCel = document.querySelector('#cabecalho .menu.superior.visible-phone'); if (menuCel) topo.append(menuCel);
      const atalho = document.querySelector('.atalho-menu');
      topo.querySelector('.lm-topo__menu').addEventListener('click', () => atalho ? atalho.click() : menuCel && menuCel.classList.toggle('lm-aberto'));
      // quantidade do carrinho: espelha o contador do tema (ele continua atualizando escondido)
      const qtd = document.querySelector('#cabecalho .qtd-carrinho'); const alvo = topo.querySelector('.lm-qtd');
      const copia = () => { const n = parseInt((qtd?.textContent || '0').replace(/\D/g, '')) || 0; alvo.textContent = n; alvo.hidden = !n; };
      copia(); if (qtd) new MutationObserver(copia).observe(qtd, { childList: true, characterData: true, subtree: true });
    }
    // barra do topo: troca os contatos repetidos por uma frase
    const tb = document.querySelector('#topbar .container');
    document.querySelector('#topbar') && document.body.prepend(document.querySelector('#topbar'));  // no HTML a barra vem no fim da página
    if (tb) tb.insertAdjacentHTML('afterbegin', '<div class="lm-barra">Direto da fábrica · Envio em 24h para todo o Brasil · 10% de desconto no Pix ou boleto</div>');
    // pedir orçamento ao lado da conta
    document.querySelector('#cabecalho .acoes-conta')?.insertAdjacentHTML('beforeend', `<li class="lm-li-orc"><a class="lm-orc" href="#" ${ORC}>Pedir orçamento</a></li>`);
    // Obras finalizadas no fim do menu
    document.querySelector('.full.menu .nivel-um')?.insertAdjacentHTML('beforeend', '<li class="lm-obras"><a href="/pagina/obras-finalizadas.html">Obras finalizadas</a></li>');
    // botão de chat igual ao da Conceito (floating-contact), em azul: abre WhatsApp e e-mail; o WhatsApp abre a janela
    // de assuntos com "Online agora" no horário comercial
    const svgWA = '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16.004 2.667c-7.363 0-13.333 5.97-13.333 13.333 0 2.353.615 4.646 1.782 6.667L2.667 29.333l6.822-1.79a13.27 13.27 0 0 0 6.515 1.72h.006c7.363 0 13.333-5.97 13.333-13.333s-5.97-13.263-13.339-13.263Zm0 24.4h-.005a11.06 11.06 0 0 1-5.635-1.542l-.404-.24-4.05 1.062 1.082-3.95-.264-.406a11.04 11.04 0 0 1-1.694-5.87c0-6.11 4.973-11.084 11.09-11.084 2.964 0 5.75 1.156 7.844 3.253a11.02 11.02 0 0 1 3.245 7.84c-.002 6.112-4.976 11.087-11.11 11.087Zm6.083-8.302c-.334-.167-1.975-.975-2.28-1.086-.306-.111-.529-.167-.751.167-.223.334-.863 1.086-1.058 1.309-.195.223-.39.25-.723.083-.334-.167-1.409-.52-2.684-1.657-.992-.885-1.663-1.978-1.858-2.312-.195-.334-.02-.514.146-.68.15-.15.334-.39.5-.585.167-.195.223-.334.334-.556.111-.223.056-.417-.028-.584-.083-.167-.751-1.81-1.029-2.479-.271-.65-.546-.563-.751-.573-.195-.01-.417-.012-.64-.012-.223 0-.584.083-.89.417-.306.334-1.168 1.14-1.168 2.782 0 1.642 1.196 3.229 1.362 3.452.167.223 2.354 3.596 5.706 5.043.797.344 1.42.55 1.905.704.8.255 1.529.219 2.104.133.642-.096 1.975-.808 2.253-1.587.278-.78.278-1.448.195-1.587-.083-.14-.306-.223-.64-.39Z"/></svg>';
    const tico = (d) => `<svg viewBox="0 0 20 20" aria-hidden="true"><g transform="scale(0.8333)" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</g></svg>`;
    const wa = (t) => 'https://wa.me/5519992306593?text=' + encodeURIComponent(t);
    const assuntos = [
      ['Orçamento de produto', 'Olá! Vim pelo site da Loren Metais e gostaria de um orçamento. Pode me ajudar?', '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>'],
      ['Dúvida técnica / medidas', 'Olá! Estou com uma dúvida técnica sobre um produto (medidas, material ou instalação). Pode me ajudar?', '<path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2"/><path d="m11.5 9.5 2-2"/><path d="m8.5 6.5 2-2"/><path d="m17.5 15.5 2-2"/>'],
      ['Acompanhar meu pedido', 'Olá! Gostaria de acompanhar o status do meu pedido. Já te passo o número em seguida.', '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>'],
      ['Compras corporativas', 'Olá! Sou de uma empresa e tenho interesse em compras corporativas. Podemos conversar sobre condições e prazos?', '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'],
      ['Outro assunto', 'Olá! Vim pelo site e gostaria de falar com vocês.', '<path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"/>'],
    ];
    const mail = 'mailto:vendas@lorenmetais.com.br?subject=' + encodeURIComponent('Contato pelo site') + '&body=' + encodeURIComponent('Não esqueça de informar sua razão social e CNPJ.') + '%0A%0A';
    document.body.insertAdjacentHTML('beforeend', `<aside class="lm-chat" data-open="false" aria-label="Contato rápido">
      <button type="button" class="lm-chat__abre" aria-label="Fale conosco" aria-expanded="false"><svg class="lm-chat__i-chat" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H9l-4.4 3.3A1 1 0 0 1 3 19.5V5a1 1 0 0 1 1-1Z"/></svg><svg class="lm-chat__i-fecha" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
      <div class="lm-chat__dial"><button type="button" class="lm-chat__canal lm-chat__canal--wa" aria-label="Falar pelo WhatsApp">${svgWA}</button><a class="lm-chat__canal lm-chat__canal--email" href="${mail}" aria-label="Falar por e-mail (informe razão social e CNPJ no corpo do e-mail)"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm1.4 2 7.1 5.6a.8.8 0 0 0 1 0L19.6 7H4.4ZM4 8.4V17h16V8.4l-6.9 5.44a2.8 2.8 0 0 1-3.44 0L4 8.4Z"/></svg><span class="lm-chat__dica" role="tooltip">Não esqueça de informar sua razão social e CNPJ no corpo do e-mail.</span></a></div>
    </aside><dialog class="lm-chat__janela" aria-labelledby="lm-chat-titulo"><div class="lm-chat__topo">${svgWA}<div class="lm-chat__titulos"><h2 id="lm-chat-titulo">Fale conosco no WhatsApp</h2><span class="lm-chat__online" hidden><span class="lm-chat__ponto"></span>Online agora</span></div><button type="button" class="lm-chat__fechar" aria-label="Fechar"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M11.18 12.03a.6.6 0 0 0 .85-.85L8.85 8l3.18-3.18a.6.6 0 0 0-.85-.85L8 7.15 4.83 3.98a.6.6 0 0 0-.85.85L7.15 8l-3.17 3.18a.6.6 0 0 0 .85.85L8 8.85Z" fill="currentColor"/></svg></button></div>
      <ul class="lm-chat__assuntos">${assuntos.map(([n, t, d]) => `<li><a href="${wa(t)}" target="_blank" rel="noopener noreferrer">${tico(d)}${n}</a></li>`).join('')}</ul></dialog>`);
    const chat = document.querySelector('.lm-chat'), abre = chat.querySelector('.lm-chat__abre'), janela = document.querySelector('.lm-chat__janela'), dica = chat.querySelector('.lm-chat__dica');
    let dicaT;
    const fechaDial = () => { chat.dataset.open = 'false'; abre.setAttribute('aria-expanded', 'false'); abre.setAttribute('aria-label', 'Fale conosco'); dica.classList.remove('is-visible'); clearTimeout(dicaT); };
    abre.addEventListener('click', () => {
      const aberto = chat.dataset.open === 'true';
      chat.dataset.open = aberto ? 'false' : 'true'; abre.setAttribute('aria-expanded', String(!aberto)); abre.setAttribute('aria-label', aberto ? 'Fale conosco' : 'Fechar opções de contato');
      clearTimeout(dicaT); dica.classList.toggle('is-visible', !aberto);  // no toque não há hover: a dica aparece sozinha por 3 s
      if (!aberto) dicaT = setTimeout(() => dica.classList.remove('is-visible'), 3000);
    });
    chat.querySelector('.lm-chat__canal--wa').addEventListener('click', () => {
      // online de segunda a sexta, 8h às 17h48 (horário de Brasília), fora de feriados nacionais (mesma regra da Conceito)
      const br = new Date(Date.now() + new Date().getTimezoneOffset() * 60000 - 3 * 3600000), m = br.getHours() * 60 + br.getMinutes();
      const dia = String(br.getDate()).padStart(2, '0') + '-' + String(br.getMonth() + 1).padStart(2, '0');
      janela.querySelector('.lm-chat__online').hidden = !(m >= 480 && m <= 1068 && br.getDay() % 6 && !['01-01', '21-04', '01-05', '07-09', '12-10', '02-11', '15-11', '25-12'].includes(dia));
      fechaDial(); janela.showModal();
    });
    janela.querySelector('.lm-chat__fechar').addEventListener('click', () => janela.close());
    janela.addEventListener('click', (e) => { if (e.target === janela) janela.close(); });  // clique fora da caixa fecha
    document.addEventListener('click', (e) => { if (!chat.contains(e.target)) fechaDial(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && chat.dataset.open === 'true') { fechaDial(); abre.focus(); } });

    const inicio = /^\/(home)?$/.test(location.pathname);
    if (!inicio) return;
    // banners novos (Ellie 04/11): no celular, a versão vertical; no computador, a versão nítida enquanto o painel não for
    // atualizado. A troca é pelo texto alternativo do banner no painel (mesmo nome), então a ordem e os links continuam os do painel.
    const BANNERS = { 'compre direto pela fábrica': 'fabrica', 'clínicas hospitalares': 'clinicas', 'cozinhas industriais': 'cozinhas',
      'shoppings e industrias': 'shoppings', 'shoppings e indústrias': 'shoppings', 'empresas': 'empresas', 'quem somos': 'quem-somos' };
    const celular = matchMedia('(max-width: 767px)').matches;
    document.querySelectorAll('.secao-banners .banner.cheio img').forEach((img) => {
      const n = BANNERS[(img.alt || '').trim().toLowerCase()]; if (!n || !BASE) return;
      const arq = BASE + 'banners/' + n + (celular ? '-celular' : '-1920');  // AVIF bem comprimido; JPG só se o navegador não abrir AVIF
      img.onerror = () => { img.onerror = null; img.src = arq + '.jpg'; }; img.src = arq + '.avif'; img.removeAttribute('srcset');
    });
    // vitrines: mostra 8 (4 no celular) e um botão para ver o resto
    document.querySelectorAll('#corpo .listagem.com-caixa > ul').forEach((ul) => {
      if (ul.children.length <= 4) return;
      ul.classList.add('lm-recolhe');
      ul.insertAdjacentHTML('afterend', '<button type="button" class="lm-btn2 lm-mais">Ver mais produtos</button>');
      ul.nextElementSibling.addEventListener('click', (e) => { ul.classList.remove('lm-recolhe'); e.currentTarget.remove(); });
    });
    const banners = document.querySelector('.secao-banners');
    // vantagens em HTML no lugar dos 4 mini banners
    banners?.insertAdjacentHTML('afterend', `<section class="lm-vant"><div class="lm-wrap">
      <div class="lm-item">${ico('<path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6"/>')}<p style="margin:0"><b>Direto do fabricante</b><small>Preço de fábrica, sem intermediário</small></p></div>
      <div class="lm-item">${ico('<path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>')}<p style="margin:0"><b>Entrega em todo o Brasil</b><small>Envio em 24h</small></p></div>
      <div class="lm-item">${ico('<path d="M19 5 5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>')}<p style="margin:0"><b>10% no Pix ou boleto</b><small>Desconto aplicado no checkout</small></p></div>
      <div class="lm-item">${ico('<rect x="2" y="5" width="20" height="14"/><path d="M2 10h20M6 15h4"/>')}<p style="margin:0"><b>Até 4x no cartão</b><small>Sem juros</small></p></div></div></section>`);
    // (Compre por categoria saiu em 04/11, pedido do Eduardo: os produtos vêm direto)
    // as 3 vitrines estão numa caixa só: a faixa entra depois da 1ª lista (e do seu Ver mais), não depois da caixa
    const v1 = document.querySelector('#corpo .listagem.com-caixa > ul'); const depois = v1?.nextElementSibling?.classList.contains('lm-mais') ? v1.nextElementSibling : v1;
    depois?.insertAdjacentHTML('afterend', `<section class="lm-b2b" style="margin-inline:calc(50% - 50vw)"><div class="lm-wrap"><div><h2>Compra para obra, empresa ou licitação?</h2><p>Mande a lista de itens e receba preço especial de fábrica, com nota fiscal e prazo de entrega.</p></div>
      <div class="lm-acs"><a class="lm-btn" href="#" ${ORC}>Pedir orçamento</a><a class="lm-btn2" href="${WA}" target="_blank" rel="noopener">Falar no WhatsApp</a></div></div></section>`);
    // quem somos antes da newsletter
    document.querySelector('#barraNewsletter')?.insertAdjacentHTML('beforebegin', `<section class="lm-sec lm-cinza lm-pq"><div class="lm-wrap"><div><span class="lm-tag">Quem somos</span><h2>Fabricante em Indaiatuba, perto de Viracopos</h2><p>Torneiras clínicas, linha hospitalar e acessibilidade para banheiros, clínicas, hospitais, escolas e cozinhas.</p><a class="lm-btn" style="background:var(--lm-onda-escura);color:#fff" href="/pagina/obras-finalizadas.html">Ver obras finalizadas</a></div>
      <ul><li><b>Fabricação própria</b><span>Produtos com peças de reposição e pós-venda.</span></li><li><b>Linha de acessibilidade</b><span>Barras de apoio, assentos e torneiras para banheiros PNE.</span></li><li><b>Retirada agendada</b><span>Centro de distribuição em Indaiatuba, a 500 m da rodovia.</span></li></ul></div></section>`);
  };
  const tudo = () => { extra(); monta(); };
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', tudo) : tudo();
})();
