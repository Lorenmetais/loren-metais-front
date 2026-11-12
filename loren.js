// Loren Metais, visual novo (03/11). Liga html.lm-novo, troca a logo e monta os blocos novos do wireframe:
// barra curta, link de orçamento no topo, Obras no menu, vantagens, categorias, faixa para empresas, quem somos e um
// único botão de WhatsApp. Fora do checkout e do pagamento: lá o site segue exatamente como hoje.
(() => {
  if (/\/checkout|\/pagamento/i.test(location.pathname) || window.__lmDesliga) return;  // __lmDesliga: o código do cabeçalho já voltou esta visita ao visual antigo (CSS ou JS demorou demais)
  const BASE = document.currentScript?.src.replace(/[^/]*$/, '') || '';
  const V = document.currentScript?.src.match(/\?[^#]*/)?.[0] || '';   // o ?v= do código do cabeçalho: os CSS/JS da página vão com o mesmo (mesma URL do preload; ver cabecalho-snippet.html)
  const MIN = /-min\.js(\?|$)/.test(document.currentScript?.src || '') ? '-min' : '';   // carregado como loren-min.js (código do cabeçalho, ramo producao-min): os outros CSS/JS também vão minificados
  const LOGO = BASE + 'logo.svg';  // no teste inline, previa_real troca esta linha pelo SVG embutido
  const WA = 'https://api.whatsapp.com/send/?phone=5519992306593&text=' + encodeURIComponent('Olá! Vim pelo site da Loren Metais e gostaria de atendimento.');
  const ORC = 'data-toggle="modal" data-target="#modal_consulte"';  // o mesmo formulário de orçamento que o site já tem
  const ico = (d) => `<span class="lm-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg></span>`;
  document.documentElement.classList.add('lm-novo');
  /* Wednesday 11/11: pré-carrega a próxima página (como a Conceito, snippets/speculation-rules) com PREFETCH só do HTML, no
     hover de ~200 ms ou no toque (moderate). Sem prerender: ele rodaria os scripts da página, analytics junto. Só links do
     mesmo site; fora carrinho, checkout, pagamento, conta, adicionar, links com ?, âncoras, nova aba e o .lm-troca. */
  if (HTMLScriptElement.supports?.('speculationrules')) {
    const regra = document.createElement('script'); regra.type = 'speculationrules';
    regra.textContent = JSON.stringify({ prefetch: [{ where: { and: [{ href_matches: '/*' }, { not: { selector_matches: 'a[href*="?"], a[href^="#"], a[target="_blank"], .lm-troca, a[href*="/carrinho"], a[href*="/checkout"], a[href*="/pagamento"], a[href*="/conta"], a[href*="adicionar"]' } }] }, eagerness: 'moderate' }] });
    document.head.append(regra);
  }
  // entrada pelo favorito "Prévia Loren" (só loren.css e loren.js, sem o código do cabeçalho): o loren.css não tem @import, então traz aqui os tokens e as fontes que faltarem
  const poeLink = (parte, href) => { if (!BASE || document.querySelector(`link[href*="${parte}"]`)) return; const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = href; document.head.append(l); };
  poeLink(`/brand-tokens${MIN}.css`, BASE + 'brand-tokens' + MIN + '.css' + V);
  // O tema (LI.methods.menuWithOffers) faz, para CADA item do menu, $(...).load(urlDaCategoria + ' seletor'): baixa a página inteira da categoria por AJAX e a transforma em DOM
  // só para aproveitar 1 cartão do "produto em destaque" do submenu, que o visual novo esconde. Era a causa de ~14 downloads de HTML e ~110 miniaturas (~0,9 MB) em TODA página.
  // Roda antes do ready do tema (loren.js é defer): este .load específico (dentro de .mega-recebe) vira nada; qualquer outro .load do site segue igual.
  if (window.jQuery && !window.jQuery.fn.load.__lm) {
    const loadOriginal = window.jQuery.fn.load;
    window.jQuery.fn.load = function (url, ...resto) { return typeof url === 'string' && this.closest('.mega-recebe').length ? this : loadOriginal.call(this, url, ...resto); };
    window.jQuery.fn.load.__lm = true;
  }
  // Seletor de quantidade padrão (.lm-qtd, estilo no loren.css): pill de 48 com − à esquerda e + à direita, sempre visíveis (toque de 44), o número no meio, mínimo 1.
  // lmQtd(input) ENVOLVE o input que o tema já tem (não recria, então os eventos do tema continuam valendo) e, ao clicar, dispara input e change para o tema recalcular.
  // Devolve o <span class="lm-qtd"> (ou null se o input já foi tratado). Vale para qualquer input de quantidade: produto, carrinho, janela de produto adicionado.
  window.lmQtd = (input) => {
    if (!input || input.closest('.lm-qtd')) return null;
    const min = Math.max(1, parseInt(input.getAttribute('min'), 10) || 1), max = parseInt(input.getAttribute('max'), 10) || Infinity;
    const caixa = document.createElement('span'); caixa.className = 'lm-qtd';
    const botao = (cls, rotulo, d) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'lm-qtd__btn ' + cls; b.setAttribute('aria-label', rotulo); b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + d + '"/></svg>'; return b; };
    const menos = botao('lm-qtd__menos', 'Diminuir a quantidade', 'M5 12h14'), mais = botao('lm-qtd__mais', 'Aumentar a quantidade', 'M12 5v14M5 12h14');
    input.before(caixa); caixa.append(menos, input, mais); caixa.parentElement.classList.add('lm-tem-qtd');  // classe no pai para o loren.css (sem :has()) input.setAttribute('min', String(min)); input.setAttribute('inputmode', 'numeric');
    const valor = () => Math.max(min, Math.min(max, parseInt(input.value, 10) || min));
    const atualiza = () => { menos.disabled = valor() <= min; mais.disabled = valor() >= max; };
    const muda = (n) => { input.value = n; ['input', 'change'].forEach((t) => input.dispatchEvent(new Event(t, { bubbles: true }))); atualiza(); };
    menos.addEventListener('click', () => muda(valor() - 1)); mais.addEventListener('click', () => muda(valor() + 1));
    input.addEventListener('change', () => { if (String(valor()) !== input.value) input.value = valor(); atualiza(); }); input.addEventListener('input', atualiza);
    atualiza(); return caixa;
  };
  // onde o loren.js reconhece sozinho: a quantidade da página de produto (o carrinho e a janela de produto adicionado chamam lmQtd(input))
  const qtdAuto = () => document.querySelectorAll('.pagina-produto input.qtde-carrinho, .pagina-produto .qtde-adicionar-carrinho input').forEach(window.lmQtd);
  // Cabeçalho de página (Ellie 04/11): trilha + h1 + linha de apoio numa faixa só (.lm-pagcab, estilo no loren.css). Quem chama escolhe o h1 e o apoio
  // (paginas.js: institucionais, conta, carrinho, 404; categoria.js: categoria e busca). Só MOVE elementos, não cria texto; o <small> do título vira <p>.
  // lmPagcab(h1, { apoio: elemento da linha de apoio (ou o <small> do h1), leitura: true na coluna de leitura de 760 }) devolve o <header> ou null
  window.lmPagcab = (h1, { apoio = null, leitura = false } = {}) => {
    const corpo = document.querySelector('#corpo'); if (!corpo || !h1 || corpo.querySelector('.lm-pagcab')) return null;
    const base = corpo.querySelector(':scope > .conteiner') || h1.closest('.conteiner') || corpo;
    const cab = document.createElement('header'); cab.className = 'lm-pagcab' + (leitura ? ' lm-pagcab--leitura' : ''); cab.innerHTML = '<div class="lm-pagcab__in"></div>';
    const dentro = cab.firstChild, trilha = corpo.querySelector('.breadcrumbs'); apoio = apoio || h1.querySelector('small');
    if (trilha) dentro.append(trilha);
    dentro.append(h1);
    if (apoio) { if (apoio.tagName === 'SMALL') { const p = document.createElement('p'); p.textContent = apoio.textContent.trim(); apoio.remove(); apoio = p; } apoio.classList.add('lm-pagcab__apoio'); dentro.append(apoio); }
    base.prepend(cab); document.body.classList.add('lm-com-cab');
    const temTexto = (e) => !!e.textContent.trim() || !!e.querySelector('img, input, select, textarea, table, form, iframe, svg');
    corpo.querySelectorAll('.cabecalho-interno, .box-destaque').forEach((e) => { if (!temTexto(e)) e.classList.add('lm-vazio-cab'); });  // caixas do tema que ficaram vazias
    return cab;
  };
  // Selo de segurança (Eduardo 09/11: os PNGs da LI no rodapé estavam borrados): ícone em SVG no azul da marca + 2 linhas de texto, estilo .lm-selo no loren.css
  // (claro por padrão; escuro dentro do #rodape). window.lmSelo('ssl' | 'google') devolve o HTML; o carrinho (paginas.js) usa o mesmo.
  window.lmSelo = (tipo) => {
    const svg = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
    return tipo === 'google'
      ? `<a class="lm-selo" href="https://transparencyreport.google.com/safe-browsing/search?url=www.lorenmetais.com.br" target="_blank" rel="noopener noreferrer">${svg('<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="m9 12 2 2 4-4"/>')}<span><small>Verificado pelo</small><b>Google Safe Browsing</b></span></a>`
      : `<span class="lm-selo">${svg('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/><path d="M12 15v2"/>')}<span><small>Site seguro</small><b>Certificado SSL</b></span></span>`;
  };
  // um par de arquivos por tipo de página (cada agente mexe no seu): categoria.* (categoria e busca), produto.*
  const pagina = () => { const c = document.body.className; return /pagina-categoria|pagina-busca|pagina-marca/.test(c) ? 'categoria' : /pagina-produto/.test(c) ? 'produto' : /pagina-inicial/.test(c) ? '' : /pagina-conta|pagina-pedido|pagina-favorito/.test(c) ? 'conta' : 'paginas'; };  // paginas.*: institucionais, carrinho, conta (Marty)
  // modais.* (formulários em janela, como o Pedir orçamento) vale em toda página
  // CSS e JS da página e o modais: no live o código do cabeçalho já aplicou o CSS e pré-carregou o JS; aqui entra o que faltar e o JS roda, depois do ready do tema. Devolve uma promessa para o html.lm-pronto esperar
  const extra = () => { if (!BASE) return Promise.resolve(); const espera = []; const nova = (el) => { espera.push(new Promise((ok) => { el.onload = el.onerror = ok; })); document.head.append(el); };
    for (const n of [pagina(), 'modais'].filter(Boolean)) {
      const ja = document.querySelector(`link[rel="stylesheet"][href*="/${n}${MIN}.css"]`); if (ja) { if (!ja.sheet && !ja.dataset.fim) espera.push(new Promise((ok) => { ja.addEventListener('load', ok); ja.addEventListener('error', ok); })); } else { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = BASE + n + MIN + '.css' + V; nova(l); }
      if (!document.querySelector(`script[src*="/${n}${MIN}.js"]`)) { const j = document.createElement('script'); j.src = BASE + n + MIN + '.js' + V; nova(j); } }
    return Promise.all(espera); };

  const monta = () => {
    if (document.body.dataset.lm) return; document.body.dataset.lm = '1';
    // newsletter (rodapé, coluna, janela): o tema enviava vazio, "abc" e "abc@x" sem aviso (Wednesday 09/11). Antes do tema (fase de captura), e-mail inválido não sai e o navegador mostra o aviso
    const emailOk = (v) => /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(v.trim());
    document.querySelectorAll('.newsletter-cadastro input[name="email"]').forEach((i) => { i.type = 'email'; i.autocomplete = 'email'; if (!i.labels?.length && !i.getAttribute('aria-label')) i.setAttribute('aria-label', 'Seu e-mail para receber novidades');  /* só placeholder não é rótulo */ i.addEventListener('input', () => i.setCustomValidity('')); });
    const barra = (e, i) => { if (!i || emailOk(i.value)) return; e.preventDefault(); e.stopImmediatePropagation(); i.setCustomValidity(i.value.trim() ? 'Confira o e-mail, por exemplo: nome@empresa.com.br' : 'Digite o seu e-mail'); i.reportValidity(); };
    document.addEventListener('click', (e) => { const b = e.target.closest('.newsletter-assinar'); if (b) barra(e, b.parentElement.querySelector('input[name="email"]')); }, true);
    document.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.matches?.('.newsletter-cadastro input[name="email"]')) barra(e, e.target); }, true);
    if (/pagina-conta|pagina-pedido|pagina-favorito/.test(document.body.className) && !document.querySelector('.pedido-finalizado')) document.body.classList.add('lm-conta');  // o layout da área logada depende desta classe: entra antes de a página aparecer (o conta.js aceita que ela já exista)
    document.querySelectorAll('#cabecalho .logo img').forEach((img) => { img.src = LOGO; img.removeAttribute('srcset'); });
    // Pague com (Eduardo 09/11): os ícones do tema (sprites pequenos) e as caixas brancas do Pix e do Mercado Pago viram logos brancos da mesma altura (SVG em front/pagamento,
    // máscara no loren.css); o boleto entra uma vez só. A lista sai do que o painel mostra hoje; meio sem SVG (Elo) vai pelo nome, em texto no mesmo estilo
    const pag = document.querySelector('#rodape .pagamento'), ul = pag?.querySelector('.bandeiras-pagamento');
    if (ul) {
      const nomes = { visa: 'Visa', mastercard: 'Mastercard', amex: 'American Express', diners: 'Diners Club', elo: 'Elo', hipercard: 'Hipercard', boleto: 'Boleto', mercadopago: 'Mercado Pago', pix: 'Pix' };
      const svg = { visa: 'visa', mastercard: 'mastercard', amex: 'americanexpress', diners: 'dinersclub', boleto: 'boleto', mercadopago: 'mercadopago', pix: 'pix' };
      const tem = [...ul.querySelectorAll('.icone-pagamento')].map((i) => [...i.classList].find((c) => c !== 'icone-pagamento'));
      pag.querySelectorAll('.gateways-rodape img').forEach((img) => tem.push(/boleto/.test(img.className) ? 'boleto' : /pix/.test(img.className) ? 'pix' : /mercadopago/.test(img.className) ? 'mercadopago' : ''));
      const lista = [...new Set(tem.filter(Boolean))];
      ul.classList.add('lm-pag');
      // cada meio num selo do mesmo tamanho (Eduardo 09/11: padronizar; Pix e Mercado Pago só com o símbolo)
      ul.innerHTML = lista.map((n) => `<li title="${nomes[n] || n}">${svg[n] ? `<span class="lm-pag__logo" style="--lm-pag-svg: url(${BASE}pagamento/${svg[n]}.svg)" role="img" aria-label="${nomes[n] || n}"></span>` : `<span class="lm-pag__texto">${nomes[n] || n}</span>`}</li>`).join('');
      pag.querySelector('.gateways-rodape')?.remove();
    }
    const selos = document.querySelector('#rodape .selos > ul'); if (selos) selos.innerHTML = `<li>${window.lmSelo('ssl')}</li><li>${window.lmSelo('google')}</li>`;  // os PNGs da LI saem; o link do Google ia para uma URL antiga
    // crédito discreto da Lucerpy no fim do rodapé, igual ao da Conceito (Eduardo 09/11); o "<3" vem do CSS, o leitor de tela ouve "carinho"
    const direitos = [...document.querySelectorAll('p')].find((p) => /Todos os direitos reservados/.test(p.textContent));
    if (!window.__lucerpyEasterEggShown) {   // assinatura da Lucerpy no console, a mesma da Conceito e do lucerpy.com.br
      window.__lucerpyEasterEggShown = true;
      // depois do load e dos erros dos apps do painel, para ficar no fim do console
      const assina = () => setTimeout(() => console.log('%cGostou do que viu? Entre em contato: lucerpy@lucerpy.com.br\n\n"O desenvolvimento de uma inteligência artificial completa pode significar o fim da raça humana."\n— Stephen Hawking', 'color:#A1A1AA; font-size:12px;'), 3000);
      document.readyState === 'complete' ? assina() : addEventListener('load', assina);
    }
    if (direitos && !document.querySelector('.lm-credito')) direitos.closest('.conteiner')?.insertAdjacentHTML('beforeend', '<p class="lm-credito">Feito com <span class="lm-credito__cor" aria-hidden="true"></span><span class="lm-credito__sr">carinho</span> por <a href="https://lucerpy.com.br/" target="_blank" rel="noopener">Lucerpy</a></p>');
    // Lighthouse 12/11 (acessibilidade): o miolo de toda página vira o landmark main; o coração do cartão ganha nome; a marca do tema no rodapé
    // (o tema a põe depois, por JS: de novo no load) ganha alt, e a altura fixa de 25 px que a achatava sai no loren.css
    document.querySelector('#corpo')?.setAttribute('role', 'main');
    const nomeia = () => {
      document.querySelectorAll('.listagem-item a.adic-favo:not([aria-label])').forEach((a) => a.setAttribute('aria-label', `Adicionar ${a.closest('.listagem-item').querySelector('.nome-produto')?.textContent.trim() || 'o produto'} aos favoritos`));
      document.querySelectorAll('#cr-alpha-theme img:not([alt])').forEach((img) => { img.alt = 'Alpha Theme'; });
      // marcas da plataforma no rodapé (Loja Integrada, Alpha Theme): width/height do próprio arquivo (unsized-images); a altura real sai do loren.css (height: auto)
      document.querySelectorAll('#rodape .cr img:not([height])').forEach((img) => { if (img.naturalWidth) { img.setAttribute('width', img.naturalWidth); img.setAttribute('height', img.naturalHeight); } });
    };
    nomeia(); if (document.readyState !== 'complete') addEventListener('load', nomeia, { once: true });
    // cartão "Preço sob consulta": o botão aparece como CONSULTAR (loren.css); o leitor de tela também ouve isso, e não o "Adicionar" do tema
    document.querySelectorAll('.listagem-item:has(.preco-produto > .titulo) .acoes-produto .botao-comprar').forEach((b) => b.setAttribute('aria-label', 'Consultar ' + (b.closest('.listagem-item').querySelector('.nome-produto')?.textContent.trim() || '')));
    // cabeçalho nosso (Eduardo 04/11: o do tema "doido e horrível"): logo | busca da loja | conta, orçamento, carrinho.
    // A busca (#form-buscar, com o autocompletar) e o menu do celular do tema são MOVIDOS para cá, não copiados.
    const cab = document.querySelector('#cabecalho');
    if (cab && !cab.querySelector('.lm-topo')) {
      const i = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
      cab.classList.add('lm-com-topo');  // o loren.css esconde o cabeçalho antigo por esta classe (com :has(), navegador sem suporte mostrava os dois)
      cab.insertAdjacentHTML('afterbegin', `<div class="lm-topo"><div class="lm-wrap lm-topo__linha">
        <button type="button" class="lm-topo__menu" aria-label="Abrir o menu">${i('<path d="M3 6h18M3 12h18M3 18h18"/>')}</button>
        <a class="lm-topo__logo" href="/" aria-label="Loren Metais, página inicial"><img src="${LOGO}" alt="Loren Metais" width="203" height="46"></a>
        <div class="lm-topo__busca"></div>
        <nav class="lm-topo__acoes" aria-label="Conta e carrinho">
          <a href="/conta/index" class="lm-topo__conta" aria-label="Minha conta">${i('<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>')}<span>Minha conta</span></a>
          <a href="#" class="lm-topo__orc" ${ORC}>${i('<path d="M6 3h9l3 3v15H6z"/><path d="M9 10h6M9 14h6M9 18h4"/>')}<span>Pedir orçamento</span></a>
          <a href="/carrinho/index" class="lm-topo__carrinho" aria-label="Carrinho">${i('<path d="M3 4h2l2.4 11h10.2L20 7H6.2"/><circle cx="9" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/>')}<span>Carrinho</span><b class="lm-topo__qtd">0</b></a>
        </nav></div></div>`);
      const topo = cab.querySelector('.lm-topo');
      // o menu de categorias cola logo abaixo do topo (loren.css, --lm-topo-h): a altura real, que muda com a largura (81 no computador, 2 linhas no tablet; Wednesday 09/11: a 768 o menu ficava embaixo da busca)
      let topoH = -1;  // só grava quando a altura muda (cada gravação no <html> recalcula o estilo da página toda)
      if (window.ResizeObserver) new ResizeObserver(() => { const h = topo.offsetHeight; if (h !== topoH) document.documentElement.style.setProperty('--lm-topo-h', (topoH = h) + 'px'); }).observe(topo);
      const form = document.querySelector('#form-buscar');
      if (form) { topo.querySelector('.lm-topo__busca').append(form); const q = form.querySelector('input'); if (q) q.placeholder = q.placeholder || 'Buscar'; }
      const menuCel = document.querySelector('#cabecalho .menu.superior.visible-phone'); if (menuCel) topo.append(menuCel);
      const atalho = document.querySelector('.atalho-menu');
      topo.querySelector('.lm-topo__menu').addEventListener('click', () => atalho ? atalho.click() : menuCel && menuCel.classList.toggle('lm-aberto'));
      // quantidade do carrinho: espelha o contador do tema (ele continua atualizando escondido)
      const qtd = document.querySelector('#cabecalho .qtd-carrinho'); const alvo = topo.querySelector('.lm-topo__qtd');
      const copia = () => { const n = parseInt((qtd?.textContent || '0').replace(/\D/g, '')) || 0; alvo.textContent = n; alvo.hidden = !n; };
      copia(); if (qtd) new MutationObserver(copia).observe(qtd, { childList: true, characterData: true, subtree: true });
    }
    /* Wednesday 11/11: busca com categorias (COMPARATIVO #5, como a busca preditiva da Conceito): blocos "Categorias" (até 4) e
       "Páginas" (até 3) acima dos produtos, com o termo em <mark>. Sem chamada extra: categorias e páginas saem do menu e do rodapé
       da própria página, lidos uma vez. De 2 a 4 letras só elas (local); de 5 em diante, junto com os produtos do tema (a mesma
       chamada de sempre, minLength 5 do tema). Embrulha o autocomplete do tema (jQuery UI): source, _renderMenu, _renderItem;
       o select do tema já vai para item.url. Leitor de tela: combobox + listbox/option, aria-activedescendant no campo,
       cabeçalhos fora da navegação (aria-hidden) e o tipo no aria-label de cada opção; avisos em português. */
    const buscaQ = document.querySelector('#auto-complete');
    const embrulhaBusca = () => {
      const $ = window.jQuery, inst = $?.fn?.autocomplete && $(buscaQ).autocomplete('instance');
      if (!inst || inst.lmCat) return; inst.lmCat = true;
      const norm = (t) => t.split('').map((c) => c.normalize('NFD')[0].toLowerCase()).join('');  // mesma posição de cada letra: dá para marcar no texto original
      let lista;
      const listas = () => lista || (lista = (() => {
        const visto = new Set(), cat = [], pag = [];
        for (const a of document.querySelectorAll('.menu.superior a[href], #rodape a[href]')) {
          const nome = a.textContent.trim().replace(/\s+/g, ' '); let u; try { u = new URL(a.href); } catch (e) { continue; }
          if (!nome || u.origin !== location.origin || u.hash || /^\/(home)?$/.test(u.pathname) || /agradecemos/.test(u.pathname)) continue;
          const pg = u.pathname.startsWith('/pagina/'), chave = (pg ? 'p' : 'c') + norm(nome);
          if ((!pg && u.pathname.split('/').length !== 2) || visto.has(chave)) continue;
          visto.add(chave); (pg ? pag : cat).push({ lm: pg ? 'pagina' : 'categoria', label: nome, value: nome, url: u.href, n: norm(nome) });
        }
        return { cat, pag };
      })());
      const acha = (termo) => {
        const p = norm(termo).split(/\s+/).filter(Boolean); const { cat, pag } = listas();
        const bate = (l, max) => l.filter((x) => p.every((w) => x.n.includes(w))).sort((a, b) => b.n.startsWith(p[0]) - a.n.startsWith(p[0])).slice(0, max);
        return [...bate(cat, 4), ...bate(pag, 3)];
      };
      const fonte = inst.options.source, desenha = inst._renderItem;
      inst.option({ minLength: 2, messages: { noResults: 'Nenhuma sugestão.', results: (n) => `${n} ${n > 1 ? 'sugestões' : 'sugestão'}. Use as setas para cima e para baixo.` },
        source: (req, resp) => { const loc = acha(req.term); req.term.trim().length < 5 ? resp(loc) : fonte.call(inst, req, (prod) => resp([...loc, ...(prod || [])])); } });
      // o termo em <mark>, só em nós de texto (nada de innerHTML com o que a pessoa digitou)
      const marca = (el, termo) => {
        const t0 = norm(termo).split(/\s+/).filter(Boolean), p = t0.filter((w) => w.length > 2 || t0.length === 1); if (!p.length) return;   // "barra de apoio": o "de" não marca
        const nos = []; const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); while (w.nextNode()) nos.push(w.currentNode);
        for (const no of nos) {
          const t = norm(no.data), r = [];
          for (const x of p) for (let i = t.indexOf(x); i > -1; i = t.indexOf(x, i + x.length)) r.push([i, i + x.length]);
          r.sort((a, b) => b[0] - a[0]).filter((x, k, l) => !k || x[1] <= l[k - 1][0]).forEach(([i, f]) => {   // do fim para o começo, sem sobrepor
            const m = document.createElement('mark'); const meio = no.splitText(i); meio.splitText(f - i); m.append(meio.cloneNode()); meio.replaceWith(m); });
        }
      };
      const TIT = { categoria: 'Categorias', pagina: 'Páginas', produto: 'Produtos' };
      const ICO = { categoria: '<path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/>', pagina: '<path d="M6 3h9l3 3v15H6z"/><path d="M9 10h6M9 14h6"/>' };
      inst._renderItem = function (ul, item) {
        // li sem papel (a opção é o filho, como o jQuery UI marca); o tipo vai no nome da opção
        if (!item.lm) {   // o nome do produto vai para um <span>: solto, cada pedaço do <mark> virava uma célula da grade (foto | nome)
          const li = desenha.call(this, ul, item).attr('role', 'none'), a = li.children().first().attr('aria-label', 'Produto: ' + item.value);
          li.find('img').attr('alt', ''); a.append($('<span>').append(a.contents().filter((k, n) => !n.classList?.contains('img')))); return li; }   // .not('.img') descartaria os nós de texto
        return $('<li role="none">')
          .append($('<div>').attr('aria-label', (item.lm === 'pagina' ? 'Página: ' : 'Categoria: ') + item.label).append(`<span class="img lm-sug-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true">${ICO[item.lm]}</svg></span>`, $('<span>').text(item.label))).appendTo(ul);
      };
      inst._renderMenu = function (ul, items) {
        const varios = new Set(items.map((x) => x.lm || 'produto')).size > 1; let g;
        items.forEach((item) => { const t = item.lm || 'produto'; if (varios && t !== g) $('<li class="lm-sug-tit" role="presentation" aria-hidden="true">').text(TIT[(g = t)]).appendTo(ul); this._renderItemData(ul, item); });
        marca(ul[0], this.term || '');
      };
      const m = inst.menu; m.option('items', '> :not(.lm-sug-tit)'); m.options.role = 'listbox'; m.element.attr('role', 'listbox').attr('aria-label', 'Sugestões da busca');
      buscaQ.setAttribute('role', 'combobox'); buscaQ.setAttribute('aria-autocomplete', 'list'); buscaQ.setAttribute('aria-expanded', 'false'); buscaQ.setAttribute('aria-controls', m.element.uniqueId().attr('id'));
      if (!buscaQ.getAttribute('aria-label')) buscaQ.setAttribute('aria-label', 'Buscar produtos, categorias e páginas');
      m.element.on('menufocus', (e, ui) => buscaQ.setAttribute('aria-activedescendant', ui.item.children('.ui-menu-item-wrapper').attr('id') || '')).on('menublur', () => buscaQ.removeAttribute('aria-activedescendant'));
      $(buscaQ).on('autocompleteopen', () => buscaQ.setAttribute('aria-expanded', 'true')).on('autocompleteclose', () => { buscaQ.setAttribute('aria-expanded', 'false'); buscaQ.removeAttribute('aria-activedescendant'); });
    };
    if (buscaQ) { embrulhaBusca(); buscaQ.addEventListener('focus', embrulhaBusca); }   // o tema pode criar o autocomplete depois de nós
    // barra do topo: troca os contatos repetidos por uma frase
    const tb = document.querySelector('#topbar .container');
    document.querySelector('#topbar') && document.body.prepend(document.querySelector('#topbar'));  // no HTML a barra vem no fim da página
    if (tb) tb.insertAdjacentHTML('afterbegin', '<div class="lm-barra">Direto da fábrica · Enviamos para todo o Brasil · Atendimento pelo WhatsApp</div>');
    // "Voltar à interface anterior" (Eduardo 10/11): grava a escolha como o ?lm=antigo e recarrega uma vez, sem o ?lm= no endereço; o código do cabeçalho tem o "Ver a nova interface".
    // Computador e tablet: na barra de cima; celular: no fim da gaveta do menu (loren.css, .lm-troca)
    const volta = () => { let u = location.href.replace(/([?&])lm=(novo|antigo)&?/, '$1').replace(/[?&](#|$)/, '$1');
      try { localStorage.setItem('lm_forca', 'antigo'); } catch (e) { u = u.replace(/(#|$)/, (/\?/.test(u) ? '&' : '?') + 'lm=antigo$1'); }
      u === location.href ? location.reload() : location.replace(u); };
    for (const lugar of [document.querySelector('.lm-barra'), document.querySelector('.lm-topo .menu.superior.visible-phone .wrap')].filter(Boolean)) {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'lm-troca'; b.textContent = 'Voltar à interface anterior'; b.addEventListener('click', volta); lugar.append(b); }
    // Obras finalizadas no fim do menu
    document.querySelector('.full.menu .nivel-um')?.insertAdjacentHTML('beforeend', '<li class="lm-menu-obras"><a href="/pagina/obras-finalizadas.html">Obras finalizadas</a></li>');
    // O chat não é caminho crítico: monta quando o navegador estiver livre (depois do 1º pintar), no máximo 1,5 s depois
    const montaChat = () => {
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
    // produto: a caixa de compra já tem os contatos (orçamento); enquanto ela está na tela o chat sai, para não cobrir título, preço e botões no celular e no tablet (loren.css; Marty 09/11)
    const compra = document.querySelectorAll('.pagina-produto .produto > .row-fluid > .span6')[1];
    if (compra && window.IntersectionObserver) new IntersectionObserver(([e]) => chat.classList.toggle('lm-chat--some', e.isIntersecting)).observe(compra);
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

    };
    (window.requestIdleCallback || ((f) => setTimeout(f, 200)))(montaChat, { timeout: 1500 });
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
      img.width = celular ? 750 : 1920; img.height = celular ? 960 : 505;  // o tamanho já na tag reserva o espaço antes de a imagem chegar
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
      <div class="lm-item">${ico('<path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6"/>')}<p><b>Direto do fabricante</b><small>Preço de fábrica, sem intermediário</small></p></div>
      <div class="lm-item">${ico('<path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>')}<p><b>Entrega em todo o Brasil</b><small>Despacho rápido</small></p></div>
      <div class="lm-item">${ico('<path d="M19 5 5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>')}<p><b>Atendimento pelo WhatsApp</b><small>Fale direto com a fábrica</small></p></div>
      <div class="lm-item">${ico('<rect x="2" y="5" width="20" height="14"/><path d="M2 10h20M6 15h4"/>')}<p><b>Até 4x no cartão</b><small>Sem juros</small></p></div></div></section>`);
    // (Compre por categoria saiu em 04/11, pedido do Eduardo: os produtos vêm direto)
    // as 3 vitrines estão numa caixa só: a faixa entra depois da 1ª lista (e do seu Ver mais), não depois da caixa
    const v1 = document.querySelector('#corpo .listagem.com-caixa > ul'); const depois = v1?.nextElementSibling?.classList.contains('lm-mais') ? v1.nextElementSibling : v1;
    // .lm-full vai de borda a borda com 50vw, que inclui a barra de rolagem vertical (17 px no Windows): o CSS desconta a metade
    // dela (--lm-rolagem). Sem isso a faixa passava 9 px da tela e aparecia a rolagem horizontal (Eduardo 11/11; Ellie)
    // Lighthouse 12/11: medir logo depois de mexer no DOM forçava um layout (54 ms), e regravar a variável no <html> a cada mudança de altura
    // recalculava o estilo da página toda. O ResizeObserver já chama uma vez depois do layout; só grava quando a largura da barra muda.
    let rol = -1;
    const rolagem = () => { const r = innerWidth - document.documentElement.clientWidth; if (r !== rol) document.documentElement.style.setProperty('--lm-rolagem', (rol = r) + 'px'); };
    window.ResizeObserver ? new ResizeObserver(rolagem).observe(document.documentElement) : requestAnimationFrame(rolagem);
    depois?.insertAdjacentHTML('afterend', `<section class="lm-b2b lm-full"><div class="lm-wrap"><div><h2>Compra para obra, empresa ou licitação?</h2><p>Mande a lista de itens e receba preço especial de fábrica, com nota fiscal e prazo de entrega.</p></div>
      <div class="lm-acs"><a class="lm-btn" href="#" ${ORC}>Pedir orçamento</a><a class="lm-btn2" href="${WA}" target="_blank" rel="noopener">Falar no WhatsApp</a></div></div></section>`);
    // quem somos antes da newsletter
    document.querySelector('#barraNewsletter')?.insertAdjacentHTML('beforebegin', `<section class="lm-sec lm-cinza lm-pq"><div class="lm-wrap"><div><span class="lm-tag">Quem somos</span><h2>Fabricante em Indaiatuba, perto de Viracopos</h2><p>Torneiras clínicas, linha hospitalar e acessibilidade para banheiros, clínicas, hospitais, escolas e cozinhas.</p><a class="lm-btn" style="background:var(--lm-onda-escura);color:#fff" href="/pagina/obras-finalizadas.html">Ver obras finalizadas</a></div>
      <ul><li><b>Fabricação própria</b><span>Produtos com peças de reposição e pós-venda.</span></li><li><b>Linha de acessibilidade</b><span>Barras de apoio, assentos e torneiras para banheiros PNE.</span></li><li><b>Retirada agendada</b><span>Centro de distribuição em Indaiatuba, a 500 m da rodovia.</span></li></ul></div></section>`);
  };
  // Espera as 3 faces do site de verdade (document.fonts.ready resolve na hora, antes de a fonte começar a baixar, e a troca de fonte depois de revelar a página dá salto de texto)
  const fontesProntas = () => { try { return Promise.all(['400 1em Inter', '600 1em Inter', '700 1em "Barlow Semi Condensed"'].map((f) => document.fonts.load(f))).catch(() => 0); } catch (e) { return 0; } };   // fonte que falha (404, bloqueada) não segura a página
  // html.lm-pronto: o loren.css reserva o espaço do que o JS monta e esconde o que ele troca até esta classe (até lá fica a casca); o código do cabeçalho só desfaz tudo (visual antigo) se o JS falhar ou ficar parado
  // Revela quando o CSS e o JS da página chegaram (lentidão não é falha: antes, um teto de 2,5 s revelava sem eles e, na rede ruim, o produto.css/js chegavam depois e
  // mexiam o topo, CLS 0,25; Marty 09/11); 30 s só para arquivo travado. As fontes esperam no máximo 1 s (eram 2,5; medido ao vivo em 12/11, 18 cargas de cache frio: as
  // fontes, pré-carregadas no cabeçalho, ficaram prontas 0,2 a 1,1 s ANTES de o JS montar, então a espera real foi zero; o teto só pega rede ruim, e as fontes de reserva do brand-tokens.css seguram o salto).
  const teto = (p, ms) => Promise.race([p, new Promise((ok) => setTimeout(ok, ms))]);
  let foi = false;
  const tudo = () => { if (foi || window.__lmDesliga) return; foi = true; const carga = extra(); monta(); window.__lmMontou = true; qtdAuto(); Promise.all([teto(carga, 30000), teto(fontesProntas(), 1000)]).then(() => document.documentElement.classList.add('lm-pronto')); };
  // o tema monta o menu e a gaveta no ready do jQuery (LI.methods.otherCategories joga para "Outros" tudo que passa de 6 itens, inclusive o nosso Obras finalizadas): entramos depois dele
  // Também sem o ready: no jQuery antigo do tema, uma exceção num ready anterior (EmailJS bloqueado: 'emailjs is not defined') para a fila e o nosso nunca rodaria (Ellie 09/11).
  // Então tudo() roda também depois de qualquer erro de script, no load e já, se o ready do jQuery já passou; a trava 'foi' faz rodar uma vez só.
  const vai = () => setTimeout(tudo, 0);
  const arranca = () => { const $ = window.jQuery; if (!$) return tudo(); $(vai); if ($.isReady) vai(); addEventListener('error', vai); addEventListener('load', vai); };
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', arranca) : arranca();
})();
