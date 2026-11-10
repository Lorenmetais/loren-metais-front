# Como instalar o visual novo na loja (Loja Integrada)

O visual novo é um código que vai no painel da Loja Integrada, em **2 entradas** (o campo aceita 15.000 caracteres por entrada). Ele busca o resto (CSS, JavaScript, imagens, fontes) neste repositório pelo jsDelivr. Nada do tema é alterado: apagar o código devolve a loja ao que era.

## Antes de começar

- **Acesso:** administrador do painel da loja.
- **O hash do commit:** 40 letras e números, do repositório `github.com/eduserpa/loren-metais-front`. No GitHub: aba **Commits**, botão de copiar ao lado do commit (copia o hash completo); no terminal: `git rev-parse HEAD`. Use sempre o hash completo, nunca `main` nem o hash curto: o jsDelivr guarda `@main` por até 12 horas e um hash curto pode ser ambíguo.
- **Se o repositório mudou de conta** (transferência para o GitHub da empresa): troque `eduserpa` pela conta nova na linha `var BASE` do código.
- **Teste rápido do hash:** abra `https://cdn.jsdelivr.net/gh/eduserpa/loren-metais-front@<hash>/loren.css` no navegador. Tem que aparecer texto de CSS, não uma página de erro.

## Instalar (5 passos)

O código da seção **O código** (abaixo) é a versão legível, com comentários, e passa de 15.000 caracteres. No painel ele vai **enxuto e em 2 partes**: a parte 1 tem a lógica e a casca básica; a parte 2, só o esqueleto. A ordem das 2 entradas não importa.

1. Gere as 2 partes do commit, na pasta deste repositório: `python painel/gera.py <hash completo> --saida <pasta>`. Precisa de Python 3 e do git; se houver Node, ele também confere a sintaxe. O script divide o código, tira comentários e recuo, troca `COMMIT` pelo hash e põe `PERCENTUAL = 0`, e grava `COLAR-NO-PAINEL-1.html` e `COLAR-NO-PAINEL-2.html` na pasta indicada. Cada parte tem que ficar abaixo de 14.500 caracteres; o script recusa se passar.
2. Se quiser outro `PERCENTUAL`, troque `var PERCENTUAL = 0;` na parte 1: `0` = ninguém vê o novo, só quem abrir com `?lm=novo` (para testar no ar); `10` a `20` = começo recomendado; `100` = todas as visitas. Detalhes em **Ligar para parte das visitas**.
3. No painel: **Configurações > Códigos HTML personalizados > Incluir código HTML**. Crie **2 entradas**, uma com cada arquivo inteiro (da linha `<!-- Loren Metais ...` até `</script>`). Nas duas: local **cabeçalho (`<head>`)**; páginas **todas as páginas exceto checkout** (se o painel não oferecer essa escolha, tudo bem: no checkout o código não faz nada e não pede nenhum arquivo). Salve. Não mexa nos outros códigos que já estão no painel.
4. Espere a loja publicar (a ajuda da LI fala em 15 a 30 minutos).
5. Faça a conferência abaixo (a equipe tem `node dev/conferir-painel.mjs`, que faz as verificações e escreve OK/ERRO).

## Conferir depois de colar (5 minutos, em janela anônima)

1. Abra `https://www.lorenmetais.com.br/?lm=novo`. Primeiro aparece um esqueleto cinza com a logo; em seguida, o visual novo. Navegue por uma categoria, um produto (o frete tem o campo de CEP), a busca e o carrinho.
2. Em outra janela anônima, abra a loja **sem** `?lm`. Com `PERCENTUAL = 0`, ela tem que estar exatamente como antes.
3. Vá até o checkout (carrinho > Finalizar compra): ele não muda. No DevTools (F12) > aba Rede, não pode haver pedido a `jsdelivr.net/gh/`.
4. **Se com `?lm=novo` nada mudar:** confira se as 2 entradas estão salvas e se cada uma termina em `</script>` (o campo corta acima de 15.000 caracteres); confira também o hash (passo do teste rápido). Só a parte 1 já liga o visual novo (sem o esqueleto); só a parte 2 não muda nada.
5. Para voltar ao visual antigo só no seu navegador: abra qualquer página com `?lm=antigo`.

## Desinstalar (tirar do ar)

- **Apague (ou desative) as 2 entradas no painel e salve.** Na carga seguinte a loja volta ao que era. Não sobra nada que mude a loja: as chaves `lm_grupo`, `lm_forca` e `lm_equipe` que ficam no navegador dos visitantes não fazem nada sem o código.
- **Desligar para os visitantes sem apagar:** troque para `var PERCENTUAL = 0;` na parte 1 e salve. Quem abriu com `?lm=novo` continua vendo o novo até abrir com `?lm=antigo`.
- **Proteção automática:** se o jsDelivr falhar de verdade numa visita, aquela visita volta sozinha ao visual antigo (veja **Como funciona**, itens 4 e 5). Não é preciso fazer nada.

## Atualizar para uma versão nova

Quando sair um commit novo: se o arquivo `cabecalho-snippet.html` **não** mudou nele, basta trocar o hash (40 letras e números) na parte 1, logo depois de `loren-metais-front@`. Se mudou, gere as 2 partes de novo (passo 1), mantenha o `PERCENTUAL` que estava e troque as 2 entradas. Depois, repita a conferência.

## O código

Cópia de `front/cabecalho-snippet.html` (as duas têm que ser iguais).

```html
<!-- Loren Metais: visual novo. Código do cabeçalho (head) do painel, em "todas as páginas exceto checkout". Troque COMMIT pelo hash COMPLETO do commit (40 letras e números). Detalhes em INSTALAR.md -->
<script>
(function () {
  if (/\/(checkout|pagamento)/i.test(location.pathname)) return;   // checkout: este código não faz nada e não pede nenhum arquivo
  var BASE = 'https://cdn.jsdelivr.net/gh/eduserpa/loren-metais-front@COMMIT/';
  var PERCENTUAL = 100;   // % das visitas que veem o visual novo; a escolha fica guardada no visitante (?lm=novo ou ?lm=antigo força, para teste)
  var TETO_MS = 40000;    // lentidão não é falha: o antigo só entra em erro real ou com uma etapa parada este tempo (CSS, JS depois do CSS, montagem depois do HTML)
  var BOTAO_PUBLICO = false;   // "Ver a nova interface" no visual de hoje: false = só no navegador marcado com ?lm=equipe (?lm=equipe-sair desmarca); true = para todo visitante
  var t0 = Date.now(), h = document.documentElement, head = document.head || h;
  // grupo 0 a 99 sorteado e guardado no visitante; ?lm=novo vale -1 (entra até com PERCENTUAL = 0) e ?lm=antigo 100 (fica fora até com 100); sem localStorage, 99 (só entra com 100)
  var f = (location.search.match(/[?&]lm=(novo|antigo)/) || [])[1], eq = (location.search.match(/[?&]lm=equipe(-sair)?(&|$)/) || [])[0], equipe = false, grupo; try {
    if (eq) /sair/.test(eq) ? localStorage.removeItem('lm_equipe') : localStorage.setItem('lm_equipe', '1');   // a marca da equipe só mostra o botão; não muda o visual
    equipe = !!localStorage.getItem('lm_equipe');
    if (f) localStorage.setItem('lm_forca', f);
    f = localStorage.getItem('lm_forca'); grupo = parseInt(localStorage.getItem('lm_grupo'), 10);
    if (isNaN(grupo)) { grupo = Math.floor(Math.random() * 100); localStorage.setItem('lm_grupo', grupo); }
  } catch (e) { grupo = 99; equipe = !!eq && !/sair/.test(eq); }
  if (f) grupo = f === 'novo' ? -1 : 100;
  if (grupo >= PERCENTUAL) {   // fora da amostra: visual antigo, nada é pedido; só um botão discreto para o visitante ligar o novo (o loren.js tem o de voltar)
    // grava a escolha como o ?lm= e recarrega uma vez, já sem o ?lm= no endereço (ele venceria a escolha); sem localStorage, vai pelo ?lm=
    if (BOTAO_PUBLICO || equipe) document.addEventListener('DOMContentLoaded', function () {
      var alvo = document.querySelector('#topbar .contatos_head'), b = document.createElement('button'), st = document.createElement('style');
      if (!alvo || !alvo.offsetWidth) alvo = document.querySelector('.atalhos-mobile');   // celular: a faixa do painel some e o topo é a barra de atalhos
      if (!alvo) return;
      st.textContent = '.lm-troca{background:none;border:0;padding:0;font:inherit;font-size:13px;text-decoration:underline;text-underline-offset:3px;cursor:pointer}'
        + '#topbar .lm-troca{position:relative;top:11px;margin-left:10px;color:#f6f6f6}'
        + '.atalhos-mobile{position:relative}.atalhos-mobile .lm-troca{position:absolute;left:calc(50% - 40px);top:50%;transform:translate(-50%,-50%);color:#333;white-space:nowrap}'
        + '#topbar .lm-troca{top:9px;margin-left:12px;padding:2px 10px;border-radius:999px;background:#fff;color:#303136;font-weight:700;text-decoration:none}#topbar .lm-troca:hover{text-decoration:underline}.atalhos-mobile .lm-troca{padding:12px 4px}.lm-troca:focus-visible{outline:2px solid #303136;outline-offset:2px}';   // Ellie 10/11: pílula branca na faixa verde (contraste 12:1), toque de ~40 px no celular
      b.type = 'button'; b.className = 'lm-troca lm-troca--legado'; b.textContent = 'Ver a nova interface';
      b.onclick = function () { var u = location.href.replace(/([?&])lm=(novo|antigo)&?/, '$1').replace(/[?&](#|$)/, '$1');
        try { localStorage.setItem('lm_forca', 'novo'); } catch (e) { u = u.replace(/(#|$)/, (/\?/.test(u) ? '&' : '?') + 'lm=novo$1'); }
        u === location.href ? location.reload() : location.replace(u); };
      head.appendChild(st); alvo.appendChild(b);
    });
    return;
  }
  var aviso = function (nome, motivo) {   // evento no dataLayer (o GTM/GA4 conta quantas visitas caíram no visual antigo); repete no load porque o tema recria o dataLayer mais abaixo
    var ev = { event: nome, lm_motivo: motivo, lm_ms: Date.now() - t0 }, envia = function () { try { var d = window.dataLayer = window.dataLayer || []; if (d.indexOf(ev) < 0) d.push(ev); } catch (e) {} };
    envia(); addEventListener('load', envia);
  };
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
  // CASCA: html.lm-novo liga AGORA, sem esperar rede, e este CSS pequeno pinta a primeira tela já no visual novo (barra escura, cabeçalho branco com a logo, resto escondido, espaço reservado
  // na altura exata das peças que o loren.js monta). Quando o loren.css chega ele traz as mesmas regras; ao ligar html.lm-pronto a casca sai. Só em falha real do CDN a loja volta ao visual antigo.
  var casca = document.createElement('style');
  // ESQUELETO: cada página é uma lista de retângulos "x y largura altura cor [n/dx/dy]" num pseudo-elemento, sem DOM novo; o último da lista fica por cima.
  // Sem unidade = px; _ = espaço dentro de calc; cor 1-5 = --g1..--g5 (com b, medido da borda e não do conteúdo); n/dx/dy repete o retângulo n vezes andando dx e dy.
  // Medidas: Ellie (dev/qa-ellie/esqueleto/MEDIDAS.md e MEDIDAS-2.md) e Wednesday (dev/qa-wed/esqueleto/MEDIDAS.md); y a partir do fim do topo (>= 768) ou do cabeçalho (celular)
  var esq = function (pag, pad, alt, rs, hc) {   // hc: classe do <html> que a regra exige (página pelo endereço)
    var L = [], l = function (f) { return L.map(f).join(); };
    rs.split(';').forEach(function (r) {
      if (!r) return; r = r.split(' '); var k = (r[5] || '1').split('/');
      for (var i = 0; i < k[0]; i++) L.unshift([0, 1, 2, 3].map(function (j) { var v = r[j].replace(/_/g, ' '); return /^[\d.]+$/.test(v) ? +v + i * (k[j + 1] || 0) + 'px' : v; }).concat(r[4]));
    });
    return (hc ? 'html.lm-novo.' + hc + ':not(.lm-pronto) ' : '§') + 'body' + pag + ' #cabecalho::after{padding:0 ' + pad + ';height:' + alt + ';background-image:' + l(function (r) { return 'var(--g' + r[4][0] + ')'; }) + ';background-origin:' + l(function (r) { return r[4][1] ? 'border-box' : 'content-box'; })
      + ';background-size:' + l(function (r) { return r[2] + ' ' + r[3]; }) + ';background-position:' + l(function (r) { return r[0] + ' ' + r[1]; }) + '}';
  };
  var K = function (n, g, y, a, c) { for (var o = [], i = 0; i < n; i++) o.push(+(100 * i / (n - 1)).toFixed(3) + '% ' + y + ' calc((100%_-_' + (n - 1) * g + 'px)/' + n + ') ' + a + ' ' + c); return o.join(';') + ';'; },   // n colunas iguais com vão g
    FX = function (y, a) { return '0 ' + y + ' 100% ' + a + ' 4b;'; }, COL = function (y) { return '0 ' + y + ' 140 20 1;0 ' + (y + 40) + ' 200 14 2 6/0/36;'; },   // faixa (.lm-pagcab) e coluna de filtros
    W3 = 'calc((100vw_-_384px)/3)', G3 = function (y, a) { return '272 ' + y + ' ' + W3 + ' ' + a + ' 2;calc(288px_+_' + W3 + ') ' + y + ' ' + W3 + ' ' + a + ' 2;calc(304px_+_2*' + W3 + ') ' + y + ' ' + W3 + ' ' + a + ' 2'; },
    C = function (w) { return 'calc(50%_-_' + (380 - w / 2) + 'px)'; },   // na coluna de leitura de 760, centrada
    P = 'max(40px,calc(50% - 600px))', T = 'clamp(24px,4vw,40px)', E3 = ':is(.pagina-inicial,.pagina-categoria,.pagina-produto)',
    E = ':is(.pagina-inicial,.pagina-categoria,.pagina-produto,.pagina-busca,.pagina-marca,.pagina-pagina,.pagina-carrinho,.pagina-login,:not([class*=pagina-]))',   // sem classe = 404
    M = '0 19 90 12 1 5/122;0 49 100% 1 5b;', TT = '0 78 180 12 1;0 129 360 32 1;', AP = '0 191 640 14 2;0 218 480 14 2;',   // M = linha do menu; TT = trilha e título na faixa; AP = 2 linhas de apoio
    CAT = M + FX(50, 342) + TT + AP + COL(440) + '100% 448 180 48 2;', BUS = M + FX(50, 170) + TT + COL(293) + '100% 275 180 48 2;', MAR = M + FX(50, 170) + TT,
    GAL = function (y, d, n, b) { return '22 ' + y + ' 44 44 2;0 ' + (y + d) + ' 88 88 2 ' + n + '/0/96;22 ' + (y + b) + ' 44 44 2;'; }, PRO = M + '0 78 240 12 1;', CX = M + FX(50, 168) + '0 84 360 32 1;0 149 400 14 2;',   // GAL = setas e n miniaturas (medidas 10/11); CX = faixa sem trilha, com apoio (carrinho, login)
    MT = '0 0 100% 48 2;0 63 100% 1 5b;0 83 90 12 1 5/122;0 113 100% 1 5b;', TC = '0 20 140 12 1;0 57 200 28 1;', CC = FX(0, 150) + '0 21 200 28 1;0 73 300 12 2 2/0/24;',   // tablet: busca e menu; celular: trilha e título
    ft = 'calc(56.36vw_-_149px)', cx = 'calc(56.36vw_-_13px) ', cw = 'calc(43.64vw_-_67px)', fq = 'calc(92vw_-_171px)', gq = 'calc(46vw_-_16px)', hq = 'calc(46vw_-_120px)', tq = 'calc(46vw_+_16px) ';
  // institucionais com linhas de apoio (faixa mais alta) e Obras finalizadas (cartões na largura toda): mesma classe no body, então vale o endereço
  var pg = { 'obras-finalizadas': 'lm-obras', acessibilidade: 'lm-ap1', 'agradecemos-o-seu-contato': 'lm-ap1', 'seguranca-e-privacidade': 'lm-ap2' }[(location.pathname.match(/^\/pagina\/([\w-]+)\.html/) || [])[1]];
  if (pg) h.classList.add(pg);
  var PG = function (a, d) { return M + FX(50, 170 + d) + C(180) + ' 78 180 12 1;' + C(360) + ' 129 360 32 1;' + C(640) + ' 191 640 14 2 ' + a + '/0/27;50% ' + (273 + d) + ' 760 14 2 8/0/27'; },   // a linhas de apoio, d px a mais na faixa
    PC = function (a, d) { return FX(0, 122 + d) + TC + '0 105 300 12 2 ' + a + '/0/24;0 ' + (159 + d) + ' 100% 12 2 8/0/26'; };
  casca.textContent = ("§body{visibility:hidden;background:#fff!important}§body,§body *,§body *::before,§body *::after{font-family:Inter,sans-serif!important}§body::before{content:'';display:block;visibility:visible;height:33px;background:#303136}§#cabecalho{padding:0!important;border:0!important;margin:0!important}§#cabecalho>*,§#topbar,§#full-page-loading{display:none!important}§#cabecalho::before{content:'';display:block;visibility:visible;height:81px;border-bottom:1px solid #e3e3e6;background:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 611.34 138.7' role='img'%3E%3Cg transform='translate(-103.546,-14.701) scale(0.639171)'%3E%3Cpath fill='%2381BBD3' d='M239.12 24.0 C219.62 113.04 295.89 90.46 328.12 144.12 C329.82 75.77 264.98 81.15 239.12 24.0Z'/%3E%3Cpath fill='%23009EA4' d='M178.62 62.62 C180.39 191.05 274.13 136.34 335.75 199.62 C316.21 105.91 228.74 135.8 178.62 62.62Z'/%3E%3Cpath fill='%23018086' d='M162.5 138.5 C187.54 258.42 267.3 188.99 335.0 236.88 C300.75 152.67 222.63 195.11 162.5 138.5Z'/%3E%3C/g%3E%3Cg transform='translate(127.344,-225.150)'%3E%3Cpath fill='%231394B1' transform='translate(18,258) scale(0.043224,0.043272) translate(-84,1653)' d='M505 -1619V-324H761V0H84V-1619Z M1825 -671Q1825 -427 1813.5 -325.5Q1802 -224 1741.5 -140Q1681 -56 1578 -11Q1475 34 1338 34Q1208 34 1104.5 -8.5Q1001 -51 938 -136Q875 -221 863 -321Q851 -421 851 -671V-948Q851 -1192 862.5 -1293.5Q874 -1395 934.5 -1479Q995 -1563 1098 -1608Q1201 -1653 1338 -1653Q1468 -1653 1571.5 -1610.5Q1675 -1568 1738 -1483Q1801 -1398 1813 -1298Q1825 -1198 1825 -948ZM1404 -1203Q1404 -1316 1391.5 -1347.5Q1379 -1379 1340 -1379Q1307 -1379 1289.5 -1353.5Q1272 -1328 1272 -1203V-447Q1272 -306 1283.5 -273Q1295 -240 1337 -240Q1380 -240 1392 -278Q1404 -316 1404 -459Z M1982 -1619H2280Q2578 -1619 2683.5 -1596Q2789 -1573 2855.5 -1478.5Q2922 -1384 2922 -1177Q2922 -988 2875 -923Q2828 -858 2690 -845Q2815 -814 2858 -762Q2901 -710 2911.5 -666.5Q2922 -623 2922 -427V0H2531V-538Q2531 -668 2510.5 -699Q2490 -730 2403 -730V0H1982ZM2403 -1342V-982Q2474 -982 2502.5 -1001.5Q2531 -1021 2531 -1128V-1217Q2531 -1294 2503.5 -1318Q2476 -1342 2403 -1342Z M3085 -1619H3787V-1295H3506V-988H3769V-680H3506V-324H3815V0H3085Z M4876 -1619V0H4507L4288 -736V0H3936V-1619H4288L4524 -890V-1619Z M6344 -1619V0H5976V-1093L5829 0H5568L5413 -1068V0H5045V-1619H5590Q5614 -1473 5641 -1275L5699 -863L5795 -1619Z M6513 -1619H7215V-1295H6934V-988H7197V-680H6934V-324H7243V0H6513Z M8212 -1619V-1295H7962V0H7541V-1295H7292V-1619Z M9035 -1619 9276 0H8845L8824 -291H8673L8648 0H8212L8426 -1619ZM8812 -578Q8780 -853 8748 -1257Q8684 -793 8668 -578Z M9769 -1619V0H9348V-1619Z M10830 -1129H10439V-1249Q10439 -1333 10424 -1356Q10409 -1379 10374 -1379Q10336 -1379 10316.5 -1348Q10297 -1317 10297 -1254Q10297 -1173 10319 -1132Q10340 -1091 10438 -1033Q10719 -866 10792 -759Q10865 -652 10865 -414Q10865 -241 10824.5 -159Q10784 -77 10668 -21.5Q10552 34 10398 34Q10229 34 10109.5 -30Q9990 -94 9953 -193Q9916 -292 9916 -474V-580H10307V-383Q10307 -292 10323.5 -266Q10340 -240 10382 -240Q10424 -240 10444.5 -273Q10465 -306 10465 -371Q10465 -514 10426 -558Q10386 -602 10229 -705Q10072 -809 10021 -856Q9970 -903 9936.5 -986Q9903 -1069 9903 -1198Q9903 -1384 9950.5 -1470Q9998 -1556 10104 -1604.5Q10210 -1653 10360 -1653Q10524 -1653 10639.5 -1600Q10755 -1547 10792.5 -1466.5Q10830 -1386 10830 -1193Z'/%3E%3C/g%3E%3C/svg%3E\") no-repeat max(40px,calc(50% - 498.5px)) 17px/203px 46px}§.secao-banners::after{content:'';display:block;height:115px}@keyframes lm-gira{to{transform:rotate(360deg)}}@keyframes lm-surge{to{opacity:1}}§body::after{content:'';position:fixed;left:50%;top:50%;width:28px;height:28px;margin:-14px 0 0 -14px;border:3px solid #e3e3e6;border-top-color:#1394B1;border-radius:50%;visibility:visible;opacity:0;animation:lm-surge .3s 2s forwards,lm-gira .9s linear infinite}"
    + "html.lm-novo{--b:calc(100vw*505/1920);--g1:linear-gradient(#e6e7ea 0 0);--g2:linear-gradient(#f0f1f3 0 0);--g3:linear-gradient(#eef0f2 0 0);--g4:linear-gradient(#f6f6f7 0 0);--g5:linear-gradient(#e3e3e6 0 0)}"
    + '§body' + E + ' #cabecalho::after{content:"";display:block;visibility:visible;box-sizing:border-box;background:#fff no-repeat}@media(min-width:1280px){'
    + esq('.pagina-categoria', P, '1013px', CAT + '272 504 220 509 2 4/236')
    + esq('.pagina-busca', P, '780px', BUS + '272 331 220 449 2 4/236')
    + esq('.pagina-marca', P, '794px', MAR + '0 267 288 527 2 4/304')
    + esq('.pagina-produto', P, '760px', PRO + GAL(118, 53, 5, 533) + '104 118 577 577 3;713 151 487 28 1;713 191 400 28 1;713 231 300 28 1;713 374 200 40 1;713 438 487 48 2 2/0/64')
    + '}@media(min-width:1024px) and (max-width:1279px){'
    + esq('.pagina-categoria', P, '971px', CAT + G3(504, 467))
    + esq('.pagina-busca', P, '788px', BUS + G3(331, 457))
    + esq('.pagina-marca', P, '825px', MAR + K(3, 16, 267, 558, 2))
    + esq('.pagina-produto', P, '640px', PRO + GAL(118, 74, 3, 384) + '104 118 ' + ft + ' ' + ft + ' 3;' + cx + '151 ' + cw + ' 28 1;' + cx + '191 calc(' + cw + '*.8) 28 1;' + cx + '355 200 40 1;' + cx + '419 ' + cw + ' 48 2 2/0/64')
    + '}@media(min-width:1024px){§body' + E + '::after{display:none}'
    + esq('.pagina-inicial', P, 'calc(var(--b) + 767px)', M + '0 50 100% var(--b) 3b;' + K(4, 16, 'calc(var(--b)_+_74px)', 90, 2) + '0 calc(var(--b)_+_214px) 220 28 1;' + K(4, 16, 'calc(var(--b)_+_269px)', 498, 2))
    + esq('.pagina-pagina', P, '490px', PG(0, 0)) + esq('.pagina-pagina', P, '533px', PG(1, 43), 'lm-ap1') + esq('.pagina-pagina', P, '560px', PG(2, 70), 'lm-ap2')
    + esq('.pagina-pagina', P, '980px', M + FX(50, 170) + TT + '0 267 100% 700 4;0 267 58.33% 525 3;0 795 172 172 2 3/176;calc(100%_-_33px) 314 calc(41.67%_-_66px) 28 1', 'lm-obras')
    + esq(':not([class*=pagina-])', P, '290px', M + FX(50, 240) + TT + AP)
    + esq('.pagina-carrinho.lm-vazio', P, 'calc(100vh - 266px)', M + '50% calc(50vh_-_162px) 300 28 1;50% calc(50vh_-_76px) 175 48 1')   // a caixa do tema mede 100vh - 340, com título e botão no meio
    + esq('.pagina-carrinho', P, '862px', CX + '0 265 100% 524 3;0 265 100% 38 1;23 320 98 92 2;100% 814 208 48 1;calc(100%_-_220px) 814 256 48 2')
    + esq('.pagina-login', P, '687px', CX + K(2, 24, 265, 422, 3) + '33 298 300 28 1;33 547 calc(50%_-_78px) 48 1')
    + '}@media(min-width:1100px){'   // busca sem resultado: o título com o termo quebra em 2 linhas abaixo de ~1100 (medido com qzxyqa)
    + esq('.pagina-busca.lm-vazio', P, '543px', M + FX(50, 172) + TT + '0 269 560 274 3;33 306 300 20 1;33 352 400 14 2 3/0/30;33 463 179 48 1')
    + '}@media(min-width:1024px) and (max-width:1099px){'
    + esq('.pagina-busca.lm-vazio', P, '596px', M + FX(50, 224) + TT + '0 181 240 32 1;0 322 560 274 3;33 359 300 20 1;33 404 400 14 2 3/0/30;33 515 179 48 1')
    + '}@media(min-width:768px) and (max-width:1023px){§#cabecalho::before{height:79px;border:0;background-position:' + T + ' 16px}§body' + E3 + '::after{display:none}'
    + esq(E, T, '114px', MT)
    + esq('.pagina-inicial', T, 'calc(var(--b) + 857px)', MT + '0 114 100% var(--b) 3b;' + K(2, 16, 'calc(var(--b)_+_138px)', 74, 2) + K(2, 16, 'calc(var(--b)_+_228px)', 74, 2) + '0 calc(var(--b)_+_352px) 220 28 1;' + K(4, 16, 'calc(var(--b)_+_1.96vw_+_388px)', 454, 2))
    + esq('.pagina-categoria', T, '1114px', MT + FX(114, 336) + '0 142 180 12 1;0 189 360 32 1;0 248 600 14 2;0 275 450 14 2;0 473 96 36 2 3/104;0 566 160 48 2;100% 566 180 48 2;' + K(3, 16, 635, 'calc(30.67vw_+_243px)', 2))
    + esq('.pagina-produto', T, 'calc(92vw + 343px)', MT + '0 142 240 12 1;' + GAL(182, 80, 4, 492) + '104 182 ' + fq + ' ' + fq + ' 3;0 calc(92vw_+_43px) 100% 300 3;33 calc(92vw_+_76px) 400 28 1;33 calc(92vw_+_116px) 300 28 1')
    + '}@media(min-width:900px) and (max-width:1023px){'
    + esq('.pagina-categoria', T, '1180px', MT + FX(114, 343) + '0 142 180 12 1;0 189 360 32 1;0 248 600 14 2;0 275 450 14 2;0 481 96 36 2 3/104;0 574 160 48 2;100% 574 180 48 2;' + K(3, 16, 643, 'min(calc(30.67vw_+_243px),537px)', 2))
    + esq('.pagina-produto', T, '563px', MT + '0 142 240 12 1;' + GAL(182, 78, 2, 296) + '104 182 ' + hq + ' ' + hq + ' 3;' + tq + '215 ' + gq + ' 28 1;' + tq + '255 300 28 1;' + tq + '387 200 40 1;' + tq + '451 ' + gq + ' 48 2 2/0/64')
    + '}@media(max-width:767px){§body' + E + '::after{display:none}'
    + esq('.pagina-categoria', '16px', '861px', FX(0, 256) + TC + '0 105 300 12 2;0 129 240 12 2;0 296 96 36 2 3/104;' + K(2, 8, 364, 48, 2) + K(2, 8, 433, 428, 2))
    + esq('.pagina-busca', '16px', '628px', FX(0, 122) + TC + K(2, 8, 161, 48, 2) + K(2, 8, 230, 398, 2))
    + esq('.pagina-marca', '16px', '569px', FX(0, 122) + TC + K(2, 8, 153, 416, 2))
    + esq('.pagina-produto', '16px', '727px', '0 20 200 12 1;0 56 90% 24 1;0 88 75% 24 1;0 120 50% 24 1;0 160 120 12 2;0 193 100% 390 3;0 631 140 32 1;0 679 100% 48 2')
    + esq('.pagina-inicial', '16px', 'calc(128vw + 588px)', '0 0 100% 128vw 3b;0 calc(128vw_+_52px) 75vw 56 2;calc(75vw_+_8px) calc(128vw_+_52px) 75vw 56 2;0 calc(128vw_+_142px) 160 24 1;' + K(2, 8, 'calc(128vw_+_185px)', 403, 2))
    + esq('.pagina-pagina', '16px', '360px', PC(0, 0)) + esq('.pagina-pagina', '16px', '400px', PC(1, 40), 'lm-ap1') + esq('.pagina-pagina', '16px', '424px', PC(2, 64), 'lm-ap2')
    + esq('.pagina-pagina', '16px', '540px', FX(0, 122) + TC + '0 152 100% 268 3;' + K(3, 4, 425, 112, 2), 'lm-obras')
    + esq(':not([class*=pagina-])', '16px', '210px', FX(0, 210) + TC + '0 110 100% 12 2 3/0/24')
    + esq('.pagina-carrinho', '16px', '801px', CC + '0 182 100% 433 3;0 636 100% 165 3')
    + esq('.pagina-busca.lm-vazio', '16px', '485px', FX(0, 198) + TC + '0 229 100% 256 3;17 258 250 18 1;17 300 280 12 2 3/0/30;17 412 calc(100%_-_34px) 48 1')
    + esq('.pagina-carrinho.lm-vazio', '16px', '219px', '50% 58 220 20 1;50% 139 175 48 1')
    + esq('.pagina-login', '16px', '585px', CC + '0 181 100% 404 3;17 206 200 28 1;17 453 calc(100%_-_34px) 48 1')
    + "}@media(max-width:767px){§body::before{height:50px}§#cabecalho::before{height:125px;background-position:72px 16px;background-size:150px 34px}§.secao-banners::after{height:72px}}").replace(/§/g, 'html.lm-novo:not(.lm-pronto) ');
  // busca sem resultado e carrinho vazio têm outro esqueleto (lm-vazio no body): só o fim do HTML diz qual é
  document.addEventListener('DOMContentLoaded', function () { var b = document.body; if (/pagina-busca/.test(b.className) && !document.querySelector('#corpo #listagemProdutos') || document.querySelector('.pagina-carrinho .caixa-destaque')) b.classList.add('lm-vazio'); });
  head.appendChild(casca); meus.push(casca); h.classList.add('lm-novo');

  var poe = function (tag, atributos) { var e = document.createElement(tag); for (var k in atributos) e.setAttribute(k, atributos[k]); head.appendChild(e); meus.push(e); return e; };
  var desliga = function (motivo) {   // visual antigo inteiro nesta visita: tira a classe, o CSS e o JS, e o loren.js, se chegar, não faz nada
    if (feito) return; feito = true; window.__lmDesliga = true;
    h.classList.remove('lm-novo', 'lm-pronto');
    meus.forEach(function (e) { if (e.parentNode) e.parentNode.removeChild(e); });
    aviso('lm_falha', motivo);
  };
  poe('link', { rel: 'preconnect', href: 'https://cdn.jsdelivr.net', crossorigin: '' });
  poe('link', { rel: 'preload', as: 'script', crossorigin: 'anonymous', fetchpriority: 'high', href: BASE + 'loren.js' });   // o JS baixa junto com o CSS (sem isto o navegador o segura até o fim do HTML)
  var faltam = 0, pronto = function () {
    if (feito) return; clearTimeout(limite);
    var chegou = false, js = poe('script', { src: BASE + 'loren.js', crossorigin: 'anonymous', fetchpriority: 'high' });
    js.onload = function () { chegou = true; }; js.onerror = function () { desliga('js_erro'); };
    setTimeout(function () { if (!chegou) desliga('js_parado'); }, TETO_MS);
    window.addEventListener('error', function (e) { if (!window.__lmMontou && /loren-metais-front/.test(e.filename || '')) desliga('js_excecao'); });   // o loren.js quebrou antes de montar
    var confere = function () { setTimeout(function () { if (!window.__lmMontou) desliga('js_nao_montou'); }, TETO_MS); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', confere); else confere();
    // CSS e JS da página e o modais: saem agora, depois dos 2 CSS (antes só depois do fim do HTML, pelo loren.js; pedidos junto com o loren.css, atrasavam o loren.css em ~1 s no celular lento).
    // O CSS já vale (0,3 a 0,8 s a menos no produto, 09/11; exige o modais.css SEM :has(), que com ele os handlers de ready do tema ficavam 2 a 5 s mais lentos); data-fim avisa o loren.js
    // que o load ou o erro já passou. O JS só pré-carrega: quem o roda é o loren.js, depois do ready do tema.
    [{ product: 'produto', category: 'categoria' }[tipo], 'modais'].forEach(function (n) {
      if (!n) return; var l = poe('link', { rel: 'stylesheet', href: BASE + n + '.css' });
      l.onload = l.onerror = function () { l.setAttribute('data-fim', '1'); };
      poe('link', { rel: 'preload', as: 'script', href: BASE + n + '.js' });
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
  ['brand-tokens.css', 'loren.css'].forEach(   // só o que decide o visual; o CSS e o JS da página (produto, categoria, modais) são pré-carregados em pronto() e o loren.js os aplica e espera antes de revelar
  function (a) {
    faltam++; var l = poe('link', { rel: 'stylesheet', href: BASE + a });
    l.onload = function () { if (!--faltam) pronto(); }; l.onerror = function () { desliga('css_erro'); };
  });
  // fontes (servidas do nosso repositório, as mesmas URLs do @font-face do brand-tokens.css) e banner da home (a 1ª arte do carrossel é a LCP): não bloqueiam nada
  ['inter-latin', 'barlow-sc-700-latin'].forEach(function (n) { poe('link', { rel: 'preload', as: 'font', type: 'font/woff2', crossorigin: '', href: BASE + 'fontes/' + n + '.woff2' }); });
  if (/^\/(home)?$/.test(location.pathname)) poe('link', { rel: 'preload', as: 'image', fetchpriority: 'high', href: BASE + 'banners/fabrica-' + (matchMedia('(max-width: 767px)').matches ? 'celular' : '1920') + '.avif' });
})();
</script>
```

## Como funciona

Regra do Eduardo (05/11): a visita normal **nunca** vê o visual antigo, nem por um instante. O visual antigo só aparece se o CDN falhar de verdade (plano B).

1. **Casca síncrona.** O código liga `html.lm-novo` na hora (antes do `<body>`, sem esperar rede) e coloca no head um CSS inline (`casca`, com a logo embutida e o esqueleto de cada página): barra escura de 33 px (50 no celular), cabeçalho branco de 81 px (125 no celular) com a logo, o resto da página escondido (`visibility`, que não conta como salto) e o espaço das peças que o JS monta já reservado (vantagens, 115/72 px). A primeira pintura já é o visual novo, sem depender do jsDelivr. Em cima dela, um **esqueleto** (retângulos cinza na posição das peças, num pseudo-elemento, sem DOM novo) em todas as páginas: início, categoria, busca, marca, produto, institucionais, 404, carrinho e login, no computador, no tablet (início, categoria e produto) e no celular. O CSS do esqueleto é gerado na hora a partir de listas curtas de retângulos (função `esq`); medidas em `dev/qa-ellie/esqueleto/` e `dev/qa-wed/esqueleto/`. As alturas são as de `loren.css` (seção "carregamento sem quebra"); se mudarem lá, mude aqui.
2. **Nada escrito no HTML.** Não há `<link>` nem `<script src>` no código do painel: um `<link rel=stylesheet>` no head bloqueia a pintura (jsDelivr travado = loja em branco por minutos, estudo de 05/11). Os arquivos são pedidos por JavaScript, em paralelo: `brand-tokens.css` e `loren.css` (os dois que decidem), `loren.js` (preload) e as fontes. O CSS e o JS da página (`produto`, `categoria`, `paginas`, `conta`, `modais`, só o que a página usa) o `loren.js` baixa e espera antes de revelar.
3. **Caminho feliz.** Os dois CSS chegam, o `loren.js` entra, monta cabeçalho, vantagens e o resto e liga `html.lm-pronto`; a casca sai e a página revelada ocupa o mesmo lugar (sem salto). Todo o CSS só vale dentro de `html.lm-novo`, inclusive os ícones e a casca. O CSS da página (produto ou categoria, pelo `type` que o tema escreve no head) e o `modais.css` entram assim que os 2 CSS chegam; o JS deles só é pré-carregado (`rel=preload`) e o `loren.js` o roda depois do ready do tema. Isso exige o `modais.css` **sem `:has()`**: com ele, o CSS aplicado cedo deixava os handlers de ready do tema 2 a 5 s mais lentos (medido em 09/11, `dev/prints-rocky/pronto/`).
4. **Lentidão não é falha (Eduardo, 09/11).** Enquanto o CSS, o `loren.js` ou a montagem não vêm, a visita fica na casca nova; depois de 2 s aparece um carregando discreto (círculo azul, só CSS, no centro da tela). O visual antigo só entra em **erro de verdade** (um dos 2 CSS ou o `loren.js` dá erro de rede, ou o `loren.js` lança exceção antes de montar) ou se **uma etapa ficar parada `TETO_MS` (40 s)**: o CSS desde o início do código, o `loren.js` depois do CSS, a montagem depois do fim do HTML. Aí o código tira a classe, a casca, os `<link>` e o `<script>`, e a loja abre inteira no visual antigo naquela visita; o `loren.js`, se chegar depois, vê `window.__lmDesliga` e não faz nada.
5. **Aviso.** Cada plano B empurra um evento no `dataLayer`: `lm_falha` com `lm_motivo` = `css_erro`, `css_parado`, `js_erro`, `js_parado`, `js_excecao` ou `js_nao_montou` (e `lm_ms`). Para contar no GA4 falta um acionador no GTM para esse evento.
6. **Sem revelação forçada.** A página só aparece quando o `loren.js` monta e liga `html.lm-pronto` (a antiga "rede de segurança" de 6 s revelava a página sem o cabeçalho novo, com peças do antigo à vista, e saiu). O `loren.js` arranca no ready do jQuery e também depois de qualquer erro de script e no `load`: no jQuery antigo do tema, uma exceção num ready anterior (EmailJS bloqueado) parava a fila e a página ficava na casca.
7. **Checkout e pagamento.** O código encerra na primeira linha: nenhuma requisição ao jsDelivr, nenhuma classe (testado com `/checkout/...`).

### Folga do teto (medido em 09/11, 3G ruim: 400 kbps, 400 ms, CPU 6x, 3 passadas de início, categoria e produto)

- Nenhuma das 9 cargas caiu no antigo nem mostrou um quadro dele. Casca em 8 a 9,6 s; página completa 22,8 a 25 s (produto e categoria) e 42,4 a 42,8 s (início, onde o fim do HTML do próprio tema leva 42 s).
- Etapa mais lenta, contada como o código conta: o CSS chegou 19,5 s depois do início do código (início); o `loren.js` chegou antes do CSS; a montagem levou até 9 s depois do fim do HTML (produto). Com `TETO_MS` de 40 s, a folga é de 20,5 s (2 vezes o pior caso) no CSS e 31 s na montagem.
- Dados: `dev/prints-rocky/pronto/diag-9-ruim.jsonl`; medidor `medir-pronto.mjs` (`CENARIOS=ruim`).

## Botão da equipe (trocar de interface sem mexer no painel)

- **No visual novo:** aparece sempre um "Voltar à interface anterior". No computador e no tablet ele fica na barra escura de cima; no celular, no fim do menu aberto.
- **No visual de hoje:** o "Ver a nova interface" aparece **só no navegador marcado da equipe**. Para marcar, abra uma vez `https://www.lorenmetais.com.br/?lm=equipe` em cada navegador e aparelho. A marca (`localStorage.lm_equipe`) não muda o visual sozinha; ela só faz o botão aparecer, em qualquer página. Para desmarcar: `?lm=equipe-sair`. Sem a marca, o visitante não vê nada.
- **O que o botão faz:** grava a mesma escolha do `?lm=novo` / `?lm=antigo` (`lm_forca`) e recarrega a página uma vez, já sem o `?lm=` no endereço. No checkout não aparece.
- **Abrir o botão a todos os visitantes:** troque `var BOTAO_PUBLICO = false;` por `true` na parte 1 e salve.

## Ligar para parte das visitas

`PERCENTUAL` (no topo do código) é a % das visitas que vê o visual novo. O sorteio (0 a 99) é feito uma vez e fica guardado no visitante (`localStorage.lm_grupo`), então cada pessoa vê sempre a mesma versão. Quem fica de fora vê o site atual e não baixa nenhum arquivo nosso. Sem `localStorage` (navegação privada restrita) o visitante cai no visual antigo, a menos que `PERCENTUAL` seja 100.
Para testar: `?lm=novo` ou `?lm=antigo` na URL força a versão naquele navegador, com qualquer `PERCENTUAL` (com `PERCENTUAL = 0` ninguém vê o novo, só quem abrir com `?lm=novo`) (fica guardado em `lm_forca`; para soltar, apague a chave `lm_forca`).
Plano sugerido pelo estudo: começar com `PERCENTUAL = 10` a `20` por 1 a 2 semanas, comparar vendas e orçamentos entre as duas versões (o `dataLayer` não marca o grupo; para comparar no GA4 é preciso um acionador/dimensão que leia `localStorage.lm_grupo`, a cargo da Wednesday) e só então 100. Trocar o percentual exige editar o painel.

## Cortes de downloads inúteis do tema (no próprio código do cabeçalho)

Rodam antes do `ready` do tema (o jQuery já existe nesse ponto):
- `.load` de cada item do menu (a página inteira de cada categoria baixada por AJAX só para um cartão de submenu que o visual novo esconde) e `.load('/ofertas-especiais ...')` (a página dá 404);
- `$.ajax({url: '../'})` (baixa a home inteira para preencher o contato do cabeçalho do carrinho): só segue na página do carrinho.
Medido (rede 1,6 Mbps, 05/11, `dev/teste-carregador.mjs`, sem o kit FontAwesome): categoria 4248 KB / 231 imagens (original) para **2039 KB / 73 imagens**; produto 4344 KB / 228 para **2285 KB / 59** (o código anterior chegava a 3332 / 125 e 3229 / 116).

## O que saiu do código em 05/11 (e por quê)

- **Lazy por MutationObserver** (e a retirada de `.has-zoom`): sem efeito medido (85 para 87 imagens). A retirada de `.has-zoom` custava ~2 imagens.
- **Adiar o Google (`Node.prototype`)**: atrasava o GTM em ~2,7 s, ganho de TBT não conclusivo, e mexe em funções nativas.

## Medir e testar (para a equipe; os arquivos de `dev/` ficam fora deste repositório)

- Falhas simuladas: `QUEM=Rocky MODO=<normal|lento|travado|fora|jsfalha|jsmudo|cssfalha> [ATRASO=ms] [THROTTLE=1] [SEMKIT=1] [PERCENTUAL=10 GRUPO=n FORCA=novo] node dev/teste-carregador.mjs`. Ele cola o código no HTML real da loja (antes do script do kit), serve os arquivos do jsDelivr a partir de `front/` (`@TESTE`) e imprime classes do `<html>` ao longo do tempo, evento, cabeçalho novo/antigo visível, CLS e rede. Resultados de 05/11 em `dev/prints-rocky/CARREGADOR.md`.
- `HOVER=1 QUEM=Rocky node previa_real.mjs dev/lista-qa.txt <pasta> "$(cat dev/validador.js)"` roda o validador visual (0 erros em 6 páginas x 390/820/1440). `LIVE=1` mede desempenho mas não roda o validador.
- Depois de colar e para tirar do ar: seções **Conferir depois de colar** e **Desinstalar**, no começo desta página.

## Limites conhecidos

- **Teto da Loja Integrada:** o HTML do tema trava em scripts síncronos (kit FontAwesome, GTM, Clarity) e o conteúdo novo completo só aparece quando o `loren.js` monta no ready do tema (DCL de ~5 a 7 s no celular lento). A casca melhora o primeiro quadro, não o LCP; o LCP no celular não chega a 2,5 s sem controlar o HTML do tema.
- **Tamanho do campo do painel:** 15.000 caracteres por entrada (o painel mostra a contagem; visto pelo Eduardo em 10/11). Por isso o código vai em 2 partes enxutas (sem comentários e recuo, por `painel/gera.py`): parte 1 com ~11.500 caracteres, parte 2 com ~9.700.
- Se o `loren.js` montar parte do cabeçalho e depois falhar, o plano B pode deixar peças soltas na página; o caso comum (JS que nem chega ou quebra ao carregar) é tratado.
- A casca imita o cabeçalho com uma imagem (logo) e um fundo; o JS depois troca pelo cabeçalho real na mesma altura. Se a altura do cabeçalho mudar em `loren.css`, a casca precisa mudar junto.
