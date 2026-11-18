// Loren Metais: visual novo, o código que roda no <head> de toda página (menos o checkout). Wednesday 18/11: saiu do painel da LI para o repositório.
// O painel tem só um trecho fixo (painel/TRECHO-FIXO.html): pede o esqueleto.css e este arquivo, os dois do GitHub Pages (o navegador guarda 10 min).
// O min-producao.yml o publica lá minificado, com COMMIT trocado pelo hash do producao-min (jsDelivr pelo hash: imutável, sem purge) e MIN = '-min'.
// Mudar o PERCENTUAL, o esqueleto ou o carregador = commit no producao; nada no painel. Detalhes em INSTALAR.md
(function () {
  if (/\/(checkout|pagamento)/i.test(location.pathname)) return;   // checkout: este código não faz nada e não pede nenhum arquivo (a LI nem roda o painel lá; a prévia do checkout é o favorito em previa-favorito.html)
  var BASE = 'https://cdn.jsdelivr.net/gh/Lorenmetais/loren-metais-front@COMMIT/';   // o min-producao.yml troca COMMIT pelo hash do producao-min ao publicar no Pages (a prévia, pelo hash do main); publicar = levar o commit aprovado para o ramo producao
  var V = '?v=' + Math.floor(Date.now() / 36e5);   // publicado: '' (o min-producao.yml troca; o hash na URL já versiona). Aqui, de hora em hora: só vale se alguém apontar o BASE para um ramo (o jsDelivr guarda @ramo 7 dias)
  var MIN = '';   // '-min': CSS e JS minificados do producao-min (o min-producao.yml troca isto ao publicar; a prévia usa os de sempre). Não '.min': o jsDelivr minifica .min sozinho e serviu versão VELHA (12/11). O loren.js segue o que o carregou
  var PERCENTUAL = 100;   // Eduardo 18/11: todas as visitas veem o visual novo; % das visitas que veem o novo (o sorteio fica guardado no visitante)
  var TETO_MS = 40000;    // lentidão não é falha: o antigo só entra em erro real ou com uma etapa parada este tempo (CSS, JS depois do CSS, montagem depois do HTML)
  var t0 = Date.now(), h = document.documentElement, head = document.head || h;
  // grupo 0 a 99 sorteado e guardado no visitante; sem localStorage, 99 (entra com 100). Sem botões de troca (Eduardo 18/11): ?lm=antigo é a saída de
  // emergência escondida (fica fora até com 100; fica guardado); ?lm=novo desfaz. A chave é lm_forca2: a lm_forca antiga guardava o clique no
  // "Voltar à interface anterior" (botão que saiu) e prenderia essas pessoas no visual antigo sem saída
  var f = (location.search.match(/[?&]lm=(novo|antigo)/) || [])[1], grupo; try {
    if (f) localStorage.setItem('lm_forca2', f);
    f = localStorage.getItem('lm_forca2'); grupo = parseInt(localStorage.getItem('lm_grupo'), 10);
    if (isNaN(grupo)) { grupo = Math.floor(Math.random() * 100); localStorage.setItem('lm_grupo', grupo); }
  } catch (e) { grupo = 99; }
  if (f) grupo = f === 'novo' ? -1 : 100;
  var empurra = function (ev) {   // evento no dataLayer; repete no load porque o tema recria o dataLayer mais abaixo
    var envia = function () { try { var d = window.dataLayer = window.dataLayer || []; if (d.indexOf(ev) < 0) d.push(ev); } catch (e) {} };
    envia(); addEventListener('load', envia);
  };
  // medição por grupo: 1 evento lm_visual por visita (aba), para o GA4 comparar conversão e abandono entre os visuais; sem dado pessoal.
  // lm_motivo: forcado (?lm=) ou sorteio. Repete na mesma visita só se o visual ou o motivo mudar
  var lmv = { event: 'lm_visual', lm_grupo: grupo >= PERCENTUAL ? 'antigo' : 'novo', lm_motivo: f ? 'forcado' : 'sorteio' }, kv = lmv.lm_grupo + lmv.lm_motivo;
  try { if (sessionStorage.getItem('lm_visual') !== kv) { sessionStorage.setItem('lm_visual', kv); empurra(lmv); } } catch (e) { empurra(lmv); }
  if (grupo >= PERCENTUAL) return;   // fora da amostra (ou ?lm=antigo): visual antigo, nada é pedido
  if (!getComputedStyle(h).getPropertyValue('--lm-esq')) return empurra({ event: 'lm_falha', lm_motivo: 'esqueleto', lm_ms: Date.now() - t0 });
  var aviso = function (nome, motivo) { empurra({ event: nome, lm_motivo: motivo, lm_ms: Date.now() - t0 }); };   // o GTM/GA4 conta quantas visitas caíram no visual antigo (plano B)
  // cortes de downloads inúteis do tema, antes de o ready dele rodar (jQuery já existe aqui): o .load de cada item do menu, de links javascript:; (CORS no console) e da página /ofertas-especiais (404),
  // e o $.ajax('../') que baixa a home inteira só para preencher o contato do cabeçalho do carrinho (só a página do carrinho usa)
  var $ = window.jQuery;
  if ($ && $.fn.load && !$.fn.load.__lm) {
    var carrega = $.fn.load, ajax = $.ajax;
    $.fn.load = function (url) { return typeof url === 'string' && (/^(\/ofertas-especiais|javascript:)/.test(url) || this.closest('.mega-recebe').length) ? this : carrega.apply(this, arguments); };
    $.fn.load.__lm = true;
    $.ajax = function (o) { return o && o.url === '../' && !/\/carrinho/.test(location.pathname) ? $.Deferred().promise() : ajax.apply(this, arguments); };
  }
  var meus = [], feito = false;
  // ESQUELETO: o esqueleto.css (GitHub Pages, tag fixa no painel, antes deste script) já chegou: o navegador só roda este script depois dele. Ele pinta a primeira
  // tela já no visual novo (regras sob html.lm-novo, que este script liga agora) até o html.lm-pronto. Fonte: painel/esqueleto.js. Sem ele (Pages fora ou mais de 3 s:
  // o painel tira a tag), fica no visual antigo: ligar o novo sem esqueleto faria o antigo piscar
  // institucionais com linhas de apoio (faixa mais alta) e Obras finalizadas (cartões na largura toda): mesma classe no body, então vale o endereço
  var pg = { 'obras-finalizadas': 'lm-obras', acessibilidade: 'lm-ap1', 'agradecemos-o-seu-contato': 'lm-ap1', 'seguranca-e-privacidade': 'lm-ap2' }[(location.pathname.match(/^\/pagina\/([\w-]+)\.html/) || [])[1]];
  if (pg) h.classList.add(pg);
  // busca sem resultado e carrinho vazio têm outro esqueleto (lm-vazio no body): só o fim do HTML diz qual é
  document.addEventListener('DOMContentLoaded', function () { var b = document.body; if (/pagina-busca/.test(b.className) && !document.querySelector('#corpo #listagemProdutos') || document.querySelector('.pagina-carrinho .caixa-destaque')) b.classList.add('lm-vazio'); });
  h.classList.add('lm-novo');

  var poe = function (tag, atributos) { var e = document.createElement(tag); for (var k in atributos) e.setAttribute(k, atributos[k]); head.appendChild(e); meus.push(e); return e; };
  var desliga = function (motivo) {   // visual antigo inteiro nesta visita: tira a classe, o CSS e o JS, e o loren.js, se chegar, não faz nada
    if (feito) return; feito = true; window.__lmDesliga = true;
    h.classList.remove('lm-novo', 'lm-pronto');
    meus.forEach(function (e) { if (e.parentNode) e.parentNode.removeChild(e); });
    aviso('lm_falha', motivo);
  };
  poe('link', { rel: 'preconnect', href: 'https://cdn.jsdelivr.net', crossorigin: '' });   // fontes e loren.js (pedidos com CORS)
  poe('link', { rel: 'preconnect', href: 'https://cdn.jsdelivr.net' });   // CSS e JS da página (sem CORS): o navegador abre outra conexão para eles
  poe('link', { rel: 'preload', as: 'script', crossorigin: 'anonymous', fetchpriority: 'high', href: BASE + 'loren' + MIN + '.js' + V });   // o JS baixa junto com o CSS (sem isto o navegador o segura até o fim do HTML)
  var faltam = 0, pronto = function () {
    if (feito) return; clearTimeout(limite);
    var chegou = false, js = poe('script', { src: BASE + 'loren' + MIN + '.js' + V, crossorigin: 'anonymous', fetchpriority: 'high' });
    js.onload = function () { chegou = true; }; js.onerror = function () { desliga('js_erro'); };
    setTimeout(function () { if (!chegou) desliga('js_parado'); }, TETO_MS);
    window.addEventListener('error', function (e) { if (!window.__lmMontou && /loren-metais-front/.test(e.filename || '')) desliga('js_excecao'); });   // o loren.js quebrou antes de montar
    var confere = function () { setTimeout(function () { if (!window.__lmMontou) desliga('js_nao_montou'); }, TETO_MS); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', confere); else confere();
    // CSS e JS da página e o modais: saem agora, depois dos 2 CSS (antes só depois do fim do HTML, pelo loren.js; pedidos junto com o loren.css, atrasavam o loren.css em ~1 s no celular lento).
    // O CSS já vale (0,3 a 0,8 s a menos no produto, 09/11; exige o modais.css SEM :has(), que com ele os handlers de ready do tema ficavam 2 a 5 s mais lentos); data-fim avisa o loren.js
    // que o load ou o erro já passou. O JS só pré-carrega: quem o roda é o loren.js, depois do ready do tema.
    [{ product: 'produto', category: 'categoria' }[tipo], 'modais'].forEach(function (n) {
      if (!n) return; var l = poe('link', { rel: 'stylesheet', href: BASE + n + MIN + '.css' + V });
      l.onload = l.onerror = function () { l.setAttribute('data-fim', '1'); };
      poe('link', { rel: 'preload', as: 'script', href: BASE + n + MIN + '.js' + V });
    });
  };
  var tipo = ''; for (var s = document.scripts, i = s.length - 1; i >= 0 && !tipo; i--) { var m = /page: \{[^}]*type: '(\w+)'/.exec(s[i].text); if (m) tipo = m[1]; }   // o tipo da página vem do script de métricas do tema, no head
  // Next Reviews (síncrono, fim do corpo) só roda no produto: fora dele o <script> perde o tipo antes de rodar e o CSS sai (home: fim do HTML 10,3 > 3,7 s). Vale no plano B
  if (tipo && tipo !== 'product') {
    var corta = new MutationObserver(function (ms) { for (var a = 0; a < ms.length; a++) for (var b = 0, ns = ms[a].addedNodes; b < ns.length; b++) { var n = ns[b];
      if (n.tagName === 'SCRIPT' && /reviews_cdn\/reviews\.js/.test(n.src)) { n.type = 'javascript/blocked'; if (n.parentNode) n.parentNode.removeChild(n); }
      else if (n.tagName === 'LINK' && /reviews_cdn\/reviews\.css/.test(n.href)) n.media = 'not all'; } });
    corta.observe(h, { childList: true, subtree: true }); document.addEventListener('DOMContentLoaded', function () { corta.disconnect(); });
  }
  // frete: o painel troca o 2º .cep por uma frase no ready; este ready (registrado antes) guarda os nós e o de dentro, logo depois do do painel, os devolve. Vale no plano B
  if ($ && tipo === 'product') $(function () { var c = document.getElementsByClassName('cep')[1]; if (!c) return; var nos = [].slice.call(c.childNodes);
    $(function () { if (/frete no carrinho/.test(c.textContent)) { c.innerHTML = ''; for (var i = 0; i < nos.length; i++) c.appendChild(nos[i]); } }); });
  var limite = setTimeout(function () { desliga('css_parado'); }, TETO_MS);
  ['brand-tokens', 'loren'].forEach(   // só o que decide o visual; o CSS e o JS da página (produto, categoria, modais) são pré-carregados em pronto() e o loren.js os aplica e espera antes de revelar
  function (a) {
    faltam++; var l = poe('link', { rel: 'stylesheet', href: BASE + a + MIN + '.css' + V });
    l.onload = function () { if (!--faltam) pronto(); }; l.onerror = function () { desliga('css_erro'); };
  });
  // fontes (servidas do nosso repositório, as mesmas URLs do @font-face do brand-tokens.css) e banner da home (a 1ª arte do carrossel é a LCP): não bloqueiam nada
  ['inter-latin', 'barlow-sc-700-latin'].forEach(function (n) { poe('link', { rel: 'preload', as: 'font', type: 'font/woff2', crossorigin: '', href: BASE + 'fontes/' + n + '.woff2' }); });
  if (/^\/(home)?$/.test(location.pathname)) poe('link', { rel: 'preload', as: 'image', fetchpriority: 'high', href: BASE + 'banners/fabrica-' + (matchMedia('(max-width: 767px)').matches ? 'celular' : '1920') + '.avif' });
  // CONTEÚDO CEDO (só no celular; as regras estão no esqueleto.css): o texto ou o banner do tema copiado num nó nosso, no lugar e no tamanho finais, para o LCP sair
  // no esqueleto. O categoria.js (#lm-intro-cedo) e o lmPagcab do loren.js (#lm-apoio-cedo) adotam o MESMO nó: sem novo LCP nem pulo
  var home = /^\/(home)?$/.test(location.pathname);
  if (matchMedia('(max-width: 767px)').matches) (function () {
    var mo, el, fonte, poe = function () {
      var b = document.body; if (!b) return;
      if (!el) {   // o tipo da página pela classe do body (o 404 não tem classe pagina-)
        var c = b.className;
        fonte = home ? '' : /pagina-categoria/.test(c) ? '.componente:not(.newsletter) > .interno > h4.titulo ~ p' : /pagina-login/.test(c) ? 'h1.titulo > small' : !/pagina-/.test(c) ? '.box-destaque > h1 + p' : null;
        if (fonte == null) return mo.disconnect();
        el = document.createElement(home ? 'img' : 'p');
        if (home) { el.id = 'lm-banner-cedo'; el.alt = ''; el.setAttribute('fetchpriority', 'high'); el.src = BASE + 'banners/fabrica-celular.avif'; } else el.id = /pagina-categoria/.test(c) ? 'lm-intro-cedo' : 'lm-apoio-cedo';
        el.setAttribute('aria-hidden', 'true'); el.style.display = 'none';   // só a regra do esqueleto o mostra
      }
      if (fonte) {   // o texto do tema, puro; com tags ou ⠀ não (a versão final o troca e o texto mudaria no pronto)
        var p = document.querySelector(fonte); if (!p) return;
        if (p.children.length || /⠀/.test(p.textContent)) return mo.disconnect();
        el.textContent = p.textContent.replace(/\s+/g, ' ').trim();
        if (p.nextSibling || p.parentNode.nextSibling) mo.disconnect();
      } else mo.disconnect();
      if (!el.parentNode) b.insertBefore(el, home ? b.firstChild : null);
    };
    mo = new MutationObserver(poe); mo.observe(h, { childList: true, subtree: true }); poe();
    document.addEventListener('DOMContentLoaded', function () { poe(); mo.disconnect(); });
  })();
})();
