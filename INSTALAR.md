# Como instalar o visual novo no live (Loja Integrada)

Onde: painel da loja, **Configurações > Códigos HTML personalizados**, campo do **cabeçalho (`<head>`)**, uma vez só, **para "todas as páginas exceto checkout"** (se o painel não tiver essa escolha, o código se protege sozinho: no checkout ele não faz nada e não pede nenhum arquivo).
O texto abaixo é uma cópia de `front/cabecalho-snippet.html`. Troque `COMMIT` pelo **hash completo** do commit (40 letras e números, `git rev-parse HEAD`), nunca `@main` nem hash curto: o jsDelivr guarda `@main` por até 12 horas e um hash curto pode ser ambíguo.

```html
<!-- Loren Metais: visual novo. Código do cabeçalho (head) do painel, em "todas as páginas exceto checkout". Troque COMMIT pelo hash COMPLETO do commit (40 letras e números). Detalhes em INSTALAR.md -->
<script>
(function () {
  if (/\/(checkout|pagamento)/i.test(location.pathname)) return;   // checkout: este código não faz nada e não pede nenhum arquivo
  var BASE = 'https://cdn.jsdelivr.net/gh/eduserpa/loren-metais-front@COMMIT/';
  var PERCENTUAL = 100;   // % das visitas que veem o visual novo; a escolha fica guardada no visitante (?lm=novo ou ?lm=antigo força, para teste)
  var CSS_MS = 5000;      // o CSS tem este tempo para chegar; senão a loja abre inteira no visual antigo
  var JS_MS = 4000;       // depois do CSS, o loren.js tem este tempo para chegar; senão também volta ao visual antigo
  var MONTA_MS = 8000;    // e, depois do fim do HTML, este tempo para montar o cabeçalho (monta no ready do tema; devagar é aceito, parado não)
  var t0 = Date.now(), h = document.documentElement, head = document.head || h;
  var grupo; try {
    var f = (location.search.match(/[?&]lm=(novo|antigo)/) || [])[1]; if (f) localStorage.setItem('lm_forca', f);
    f = localStorage.getItem('lm_forca'); grupo = parseInt(localStorage.getItem('lm_grupo'), 10);
    if (isNaN(grupo)) { grupo = Math.floor(Math.random() * 100); localStorage.setItem('lm_grupo', grupo); }
    if (f) grupo = f === 'novo' ? 0 : 100;
  } catch (e) { grupo = 100; }
  if (PERCENTUAL < 100 && grupo >= PERCENTUAL) return;   // fora da amostra: visual antigo, nada é pedido
  var aviso = function (nome, motivo) {   // evento no dataLayer (o GTM/GA4 conta quantas visitas caíram no visual antigo); repete no load porque o tema recria o dataLayer mais abaixo
    var ev = { event: nome, lm_motivo: motivo, lm_ms: Date.now() - t0 }, envia = function () { try { var d = window.dataLayer = window.dataLayer || []; if (d.indexOf(ev) < 0) d.push(ev); } catch (e) {} };
    envia(); addEventListener('load', envia);
  };
  // cortes de downloads inúteis do tema, antes de o ready dele rodar (jQuery já existe aqui): o .load de cada item do menu e da página /ofertas-especiais (404),
  // e o $.ajax('../') que baixa a home inteira só para preencher o contato do cabeçalho do carrinho (só a página do carrinho usa)
  var $ = window.jQuery;
  if ($ && $.fn.load && !$.fn.load.__lm) {
    var carrega = $.fn.load, ajax = $.ajax;
    $.fn.load = function (url) { return typeof url === 'string' && (/^\/ofertas-especiais/.test(url) || this.closest('.mega-recebe').length) ? this : carrega.apply(this, arguments); };
    $.fn.load.__lm = true;
    $.ajax = function (o) { return o && o.url === '../' && !/\/carrinho/.test(location.pathname) ? $.Deferred().promise() : ajax.apply(this, arguments); };
  }
  // enquanto decide, a página fica escondida (no máximo CSS_MS)
  var esconde = document.createElement('style'); esconde.textContent = 'html.lm-carregando body,html.lm-carregando body *{visibility:hidden!important}';
  head.appendChild(esconde); h.classList.add('lm-carregando');
  var meus = [esconde], feito = false;
  var poe = function (tag, atributos) { var e = document.createElement(tag); for (var k in atributos) e.setAttribute(k, atributos[k]); head.appendChild(e); meus.push(e); return e; };
  var desliga = function (motivo) {   // visual antigo inteiro nesta visita: tira a classe, o CSS e o JS, e o loren.js, se chegar, não faz nada
    if (feito) return; feito = true; window.__lmDesliga = true;
    h.classList.remove('lm-novo', 'lm-pronto', 'lm-carregando');
    meus.forEach(function (e) { if (e.parentNode) e.parentNode.removeChild(e); });
    aviso('lm_falha', motivo);
  };
  var mostra = function () { if (!feito) h.classList.add('lm-pronto'); };   // rede de segurança: a página aparece no máximo 6 s depois de abrir
  setTimeout(mostra, 6000);
  document.addEventListener('DOMContentLoaded', function () { setTimeout(mostra, 3000); });
  poe('link', { rel: 'preconnect', href: 'https://cdn.jsdelivr.net', crossorigin: '' });
  poe('link', { rel: 'preload', as: 'script', crossorigin: 'anonymous', fetchpriority: 'high', href: BASE + 'loren.js' });   // o JS baixa junto com o CSS (sem isto o navegador o segura até o fim do HTML)
  var faltam = 0, pronto = function () {
    if (feito) return; clearTimeout(limite);
    h.classList.add('lm-novo'); h.classList.remove('lm-carregando'); esconde.parentNode.removeChild(esconde);
    var chegou = false, js = poe('script', { src: BASE + 'loren.js', crossorigin: 'anonymous', fetchpriority: 'high' });
    js.onload = function () { chegou = true; }; js.onerror = function () { desliga('js_erro'); };
    setTimeout(function () { if (!chegou) desliga('js_lento'); }, JS_MS);
    window.addEventListener('error', function (e) { if (!window.__lmMontou && /loren-metais-front/.test(e.filename || '')) desliga('js_excecao'); });   // o loren.js quebrou antes de montar
    var confere = function () { setTimeout(function () { if (!window.__lmMontou) desliga('js_nao_montou'); }, MONTA_MS); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', confere); else confere();
  };
  var limite = setTimeout(function () { desliga('css_lento'); }, CSS_MS);
  ['brand-tokens.css', 'loren.css', 'produto.css', 'categoria.css', 'paginas.css', 'modais.css'].forEach(function (a) {
    faltam++; var l = poe('link', { rel: 'stylesheet', href: BASE + a });
    l.onload = function () { if (!--faltam) pronto(); }; l.onerror = function () { desliga('css_erro'); };
  });
  // fontes e banner da home (a 1ª arte do carrossel é a LCP): não bloqueiam nada
  poe('link', { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:wght@700&family=Inter:wght@400;600;700&display=swap' });
  poe('link', { rel: 'preload', as: 'font', type: 'font/woff2', crossorigin: '', href: 'https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2' });
  poe('link', { rel: 'preload', as: 'font', type: 'font/woff2', crossorigin: '', href: 'https://fonts.gstatic.com/s/barlowsemicondensed/v16/wlpigxjLBV1hqnzfr-F8sEYMB0Yybp0mudRfw6-_B2sl.woff2' });
  if (/^\/(home)?$/.test(location.pathname)) poe('link', { rel: 'preload', as: 'image', fetchpriority: 'high', href: BASE + 'banners/fabrica-' + (matchMedia('(max-width: 767px)').matches ? 'celular' : '1920') + '.avif' });
})();
</script>
```

## Como funciona

1. **Nada é carregado antes de decidir.** O código não tem `<link>` nem `<script src>` escritos no HTML. Ele cria os elementos por JavaScript e, enquanto decide (no máximo `CSS_MS`), esconde a página (`html.lm-carregando`). Um `<link rel=stylesheet>` escrito no head bloqueia a pintura: com o jsDelivr travado a loja ficava em branco por minutos (medido no estudo de 05/11).
2. **Caminho feliz.** Os 6 CSS (`brand-tokens`, `loren`, `produto`, `categoria`, `paginas`, `modais`) e o `loren.js` baixam em paralelo. Quando os 6 CSS chegam, entra `html.lm-novo` e entra o `loren.js`, que monta cabeçalho, vantagens e o resto e liga `html.lm-pronto`. Todo o CSS só vale dentro de `html.lm-novo` (inclusive os ícones), então CSS carregado sem a classe não muda nada.
3. **Se o CSS não chegar em `CSS_MS` (5 s) ou der erro**: o código tira a classe, remove os `<link>` e a loja abre inteira no visual antigo, naquela visita. O `loren.js`, se chegar depois, vê `window.__lmDesliga` e não faz nada (foi isso que misturou os dois visuais na primeira versão do estudo).
4. **Se o `loren.js` não chegar em `JS_MS` (4 s depois do CSS), der erro de rede, lançar exceção antes de montar, ou não montar em `MONTA_MS` (8 s) depois do fim do HTML**: o mesmo plano B (tira tudo, visual antigo).
5. **Aviso.** Cada plano B empurra um evento no `dataLayer`: `lm_falha` com `lm_motivo` = `css_lento`, `css_erro`, `js_lento`, `js_erro`, `js_excecao` ou `js_nao_montou` (e `lm_ms`). Para contar no GA4 falta um acionador no GTM para esse evento (a cargo da Wednesday/Maestro).
6. **Rede de segurança de exibição**: `html.lm-pronto` entra sozinho no máximo 6 s depois de abrir, ou 3 s depois do fim do HTML. O cabeçalho antigo só some do ar quando o novo existe (ou enquanto a página está escondida, com o espaço do novo reservado), então um JS que falhe em silêncio não deixa a loja sem logo, busca e carrinho.
7. **Checkout e pagamento**: o código encerra na primeira linha. Nenhuma requisição ao jsDelivr (testado com `/checkout/...`).

## Ligar para parte das visitas

`PERCENTUAL` (no topo do código) é a % das visitas que vê o visual novo. O sorteio (0 a 99) é feito uma vez e fica guardado no visitante (`localStorage.lm_grupo`), então cada pessoa vê sempre a mesma versão. Quem fica de fora vê o site atual e não baixa nenhum arquivo nosso. Sem `localStorage` (navegação privada restrita) o visitante cai no visual antigo, a menos que `PERCENTUAL` seja 100.
Para testar: `?lm=novo` ou `?lm=antigo` na URL força a versão naquele navegador (fica guardado em `lm_forca`; para soltar, apague a chave `lm_forca`).
Plano sugerido pelo estudo: começar com `PERCENTUAL = 10` a `20` por 1 a 2 semanas, comparar vendas e orçamentos entre as duas versões (o `dataLayer` não marca o grupo; para comparar no GA4 é preciso um acionador/dimensão que leia `localStorage.lm_grupo`, a cargo da Wednesday) e só então 100. Trocar o percentual exige editar o painel.

## Cortes de downloads inúteis do tema (no próprio código do cabeçalho)

Rodam antes do `ready` do tema (o jQuery já existe nesse ponto):
- `.load` de cada item do menu (a página inteira de cada categoria baixada por AJAX só para um cartão de submenu que o visual novo esconde) e `.load('/ofertas-especiais ...')` (a página dá 404);
- `$.ajax({url: '../'})` (baixa a home inteira para preencher o contato do cabeçalho do carrinho): só segue na página do carrinho.
Medido (rede 1,6 Mbps, 05/11, `dev/teste-carregador.mjs`, sem o kit FontAwesome): categoria 4248 KB / 231 imagens (original) para **2039 KB / 73 imagens**; produto 4344 KB / 228 para **2285 KB / 59** (o código anterior chegava a 3332 / 125 e 3229 / 116).

## O que saiu do código em 05/11 (e por quê)

- **Lazy por MutationObserver** (e a retirada de `.has-zoom`): sem efeito medido (85 para 87 imagens). A retirada de `.has-zoom` custava ~2 imagens.
- **Adiar o Google (`Node.prototype`)**: atrasava o GTM em ~2,7 s, ganho de TBT não conclusivo, e mexe em funções nativas.

## Medir e testar

- Falhas simuladas: `QUEM=Rocky MODO=<normal|lento|travado|fora|jsfalha|jsmudo|cssfalha> [ATRASO=ms] [THROTTLE=1] [SEMKIT=1] [PERCENTUAL=10 GRUPO=n FORCA=novo] node dev/teste-carregador.mjs`. Ele cola o código no HTML real da loja (antes do script do kit), serve os arquivos do jsDelivr a partir de `front/` (`@TESTE`) e imprime classes do `<html>` ao longo do tempo, evento, cabeçalho novo/antigo visível, CLS e rede. Resultados de 05/11 em `dev/prints-rocky/CARREGADOR.md`.
- `HOVER=1 QUEM=Rocky node previa_real.mjs dev/lista-qa.txt <pasta> "$(cat dev/validador.js)"` roda o validador visual (0 erros em 6 páginas x 390/820/1440). `LIVE=1` mede desempenho mas não roda o validador.
- Depois de colar: abrir a loja em janela anônima, rolar até o fim e voltar; conferir no DevTools que no checkout não há requisição a `jsdelivr.net/gh/eduserpa`.
- **Tirar do ar**: apagar o bloco do painel. O site volta ao que era (nada do tema foi alterado).

## Limites conhecidos

- O LCP no celular não chega a 2,5 s sem controlar o HTML do tema (a página só aparece quando o JS monta; estudo de 05/11). Não perseguido.
- Se o `loren.js` montar parte do cabeçalho e depois falhar, o plano B pode deixar peças soltas na página; o caso comum (JS que nem chega ou quebra ao carregar) é tratado.
- O primeiro CSS leva ~1,1 a 1,8 s para chegar na rede de teste (5 passadas, 1,6 Mbps, 150 ms, CPU 4x); `CSS_MS = 5000` dá quase 3 vezes o pior caso medido. A 2,5 s o limite disparou sob carga e misturou os visuais no estudo; por isso 5 s e o `loren.js` desligado quando o plano B já valeu.
