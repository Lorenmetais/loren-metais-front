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
  const pagina = () => { const c = document.body.className; return /pagina-categoria|pagina-busca/.test(c) ? 'categoria' : /pagina-produto/.test(c) ? 'produto' : ''; };
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
