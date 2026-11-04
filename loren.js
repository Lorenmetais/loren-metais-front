// Loren Metais, visual novo (03/11). Liga html.lm-novo, troca a logo e monta os blocos novos do wireframe:
// barra curta, link de orçamento no topo, Obras no menu, vantagens, categorias, faixa para empresas, quem somos e um
// único botão de WhatsApp. Fora do checkout e do pagamento: lá o site segue exatamente como hoje.
(() => {
  if (/\/checkout|\/pagamento/i.test(location.pathname)) return;
  const BASE = document.currentScript?.src.replace(/[^/]*$/, '') || '';
  const WA = 'https://api.whatsapp.com/send/?phone=5519992306593&text=' + encodeURIComponent('Olá! Vim pelo site da Loren Metais e gostaria de atendimento.');
  const ORC = 'data-toggle="modal" data-target="#modal_consulte"';  // o mesmo formulário de orçamento que o site já tem
  const ico = (d) => `<span class="lm-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg></span>`;
  document.documentElement.classList.add('lm-novo');
  // um par de arquivos por tipo de página (cada agente mexe no seu): categoria.* (categoria e busca), produto.*
  const pagina = () => { const c = document.body.className; return /pagina-categoria|pagina-busca/.test(c) ? 'categoria' : /pagina-produto/.test(c) ? 'produto' : ''; };
  const extra = () => { const n = pagina(); if (!n || !BASE) return; const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = BASE + n + '.css'; document.head.append(l); const j = document.createElement('script'); j.src = BASE + n + '.js'; document.head.append(j); };

  const monta = () => {
    if (document.body.dataset.lm) return; document.body.dataset.lm = '1';
    document.querySelectorAll('#cabecalho .logo img').forEach((img) => { img.src = BASE + 'logo.svg'; img.removeAttribute('srcset'); });
    // barra do topo: troca os contatos repetidos por uma frase
    const tb = document.querySelector('#topbar .container');
    document.querySelector('#topbar') && document.body.prepend(document.querySelector('#topbar'));  // no HTML a barra vem no fim da página
    if (tb) tb.insertAdjacentHTML('afterbegin', '<div class="lm-barra">Direto da fábrica · Envio em 24h para todo o Brasil · 10% de desconto no Pix ou boleto</div>');
    // pedir orçamento ao lado da conta
    document.querySelector('#cabecalho .acoes-conta')?.insertAdjacentHTML('beforeend', `<li class="lm-li-orc"><a class="lm-orc" href="#" ${ORC}>Pedir orçamento</a></li>`);
    // Obras finalizadas no fim do menu
    document.querySelector('.full.menu .nivel-um')?.insertAdjacentHTML('beforeend', '<li class="lm-obras"><a href="/pagina/obras-finalizadas.html">Obras finalizadas</a></li>');
    // um botão só de WhatsApp
    document.body.insertAdjacentHTML('beforeend', `<a class="lm-wa" href="${WA}" target="_blank" rel="noopener" aria-label="Falar no WhatsApp"><svg viewBox="0 0 32 32"><path d="M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3Zm0 23.7c-2 0-4-.6-5.7-1.6l-.4-.2-3.9 1 1-3.8-.3-.4A10.7 10.7 0 1 1 16 26.7Zm5.9-8c-.3-.2-1.9-1-2.2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7 0a8.7 8.7 0 0 1-4.3-3.8c-.3-.6.3-.5.9-1.7.1-.2 0-.4 0-.5l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6a1.2 1.2 0 0 0-.9.4 3.6 3.6 0 0 0-1.1 2.7 6.3 6.3 0 0 0 1.3 3.3 14.4 14.4 0 0 0 5.5 4.9c2 .9 2.9 1 3.9.8a3.3 3.3 0 0 0 2.2-1.5 2.7 2.7 0 0 0 .2-1.5c-.1-.2-.3-.3-.6-.4Z"/></svg></a>`);

    const inicio = /^\/(home)?$/.test(location.pathname);
    if (!inicio) return;
    // banners novos (Ellie 04/11): no celular, a versão vertical; no computador, a versão nítida enquanto o painel não for
    // atualizado. A troca é pelo texto alternativo do banner no painel (mesmo nome), então a ordem e os links continuam os do painel.
    const BANNERS = { 'compre direto pela fábrica': 'fabrica', 'clínicas hospitalares': 'clinicas', 'cozinhas industriais': 'cozinhas',
      'shoppings e industrias': 'shoppings', 'shoppings e indústrias': 'shoppings', 'empresas': 'empresas', 'quem somos': 'quem-somos' };
    const celular = matchMedia('(max-width: 767px)').matches;
    document.querySelectorAll('.secao-banners .banner.cheio img').forEach((img) => {
      const n = BANNERS[(img.alt || '').trim().toLowerCase()]; if (!n || !BASE) return;
      img.src = BASE + 'banners/' + n + (celular ? '-celular.jpg' : '-1920.jpg'); img.removeAttribute('srcset');
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
    // categorias: as mesmas do menu (nomes e links vêm da loja, sem nada fixo)
    const cats = [...document.querySelectorAll('.full.menu .nivel-um > li:not(.categoria-paginas):not(.other-categories):not(.lm-obras) > a')].slice(0, 6);
    if (cats.length) document.querySelector('.lm-vant')?.insertAdjacentHTML('afterend', `<section class="lm-sec"><div class="lm-wrap"><h2>Compre por categoria</h2><div class="lm-cats">${cats.map((a) => `<a href="${a.href}"><b>${a.textContent.trim()}</b><span>Ver produtos →</span></a>`).join('')}</div></div></section>`);
    // faixa para empresas depois da 1ª vitrine
    const vitrines = document.querySelectorAll('#corpo .listagem.com-caixa');
    vitrines[0]?.insertAdjacentHTML('afterend', `<section class="lm-b2b" style="margin-inline:calc(50% - 50vw)"><div class="lm-wrap"><div><h2>Compra para obra, empresa ou licitação?</h2><p>Mande a lista de itens e receba preço especial de fábrica, com nota fiscal e prazo de entrega.</p></div>
      <div class="lm-acs"><a class="lm-btn" href="#" ${ORC}>Pedir orçamento</a><a class="lm-btn2" href="${WA}" target="_blank" rel="noopener">Falar no WhatsApp</a></div></div></section>`);
    // quem somos antes da newsletter
    document.querySelector('#barraNewsletter')?.insertAdjacentHTML('beforebegin', `<section class="lm-sec lm-cinza lm-pq"><div class="lm-wrap"><div><span class="lm-tag">Quem somos</span><h2>Fabricante em Indaiatuba, perto de Viracopos</h2><p>Torneiras clínicas, linha hospitalar e acessibilidade para banheiros, clínicas, hospitais, escolas e cozinhas.</p><a class="lm-btn" style="background:var(--lm-onda-escura);color:#fff" href="/pagina/obras-finalizadas.html">Ver obras finalizadas</a></div>
      <ul><li><b>Fabricação própria</b><span>Produtos com peças de reposição e pós-venda.</span></li><li><b>Linha de acessibilidade</b><span>Barras de apoio, assentos e torneiras para banheiros PNE.</span></li><li><b>Retirada agendada</b><span>Centro de distribuição em Indaiatuba, a 500 m da rodovia.</span></li></ul></div></section>`);
  };
  const tudo = () => { extra(); monta(); };
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', tudo) : tudo();
})();
