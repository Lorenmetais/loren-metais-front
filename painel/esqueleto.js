// Gera o esqueleto.css (Wednesday 18/11): o CSS do esqueleto que antes ia em linha no painel (as 3 entradas que o painel/gera.py gerava; aposentados em 18/11).
// Uso: node painel/esqueleto.js > esqueleto.css   (o min-producao.yml roda, minifica e publica no GitHub Pages; o painel o pede numa tag fixa, bloqueando a pintura:
// é o que garante que o visual antigo nunca pisca). Todas as regras exigem html.lm-novo e somem no html.lm-pronto: quem fica no visual antigo só baixa o arquivo.
// --lm-esq: o inicio.js confere que este CSS chegou antes de ligar o visual novo (sem ele, fica no antigo).
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
var PG = function (a, d) { return M + FX(50, 170 + d) + C(180) + ' 78 180 12 1;' + C(360) + ' 129 360 32 1;' + C(640) + ' 191 640 14 2 ' + a + '/0/27;50% ' + (273 + d) + ' 760 14 2 8/0/27'; },   // a linhas de apoio, d px a mais na faixa
  PC = function (a, d) { return FX(0, 122 + d) + TC + '0 105 300 12 2 ' + a + '/0/24;0 ' + (159 + d) + ' 100% 12 2 8/0/26'; };
var css = ("§body{visibility:hidden;background:#fff!important}§body,§body *,§body *::before,§body *::after{font-family:Inter,sans-serif!important}§body::before{content:'';display:block;visibility:visible;height:33px;background:#303136}§#cabecalho{padding:0!important;border:0!important;margin:0!important}§#cabecalho>*,§#topbar,§#full-page-loading{display:none!important}§#cabecalho::before{content:'';display:block;visibility:visible;height:81px;border-bottom:1px solid #e3e3e6;background:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 611.34 138.7' role='img'%3E%3Cg transform='translate(-103.546,-14.701) scale(0.639171)'%3E%3Cpath fill='%2381BBD3' d='M239.12 24.0 C219.62 113.04 295.89 90.46 328.12 144.12 C329.82 75.77 264.98 81.15 239.12 24.0Z'/%3E%3Cpath fill='%23009EA4' d='M178.62 62.62 C180.39 191.05 274.13 136.34 335.75 199.62 C316.21 105.91 228.74 135.8 178.62 62.62Z'/%3E%3Cpath fill='%23018086' d='M162.5 138.5 C187.54 258.42 267.3 188.99 335.0 236.88 C300.75 152.67 222.63 195.11 162.5 138.5Z'/%3E%3C/g%3E%3Cg transform='translate(127.344,-225.150)'%3E%3Cpath fill='%231394B1' transform='translate(18,258) scale(0.043224,0.043272) translate(-84,1653)' d='M505 -1619V-324H761V0H84V-1619Z M1825 -671Q1825 -427 1813.5 -325.5Q1802 -224 1741.5 -140Q1681 -56 1578 -11Q1475 34 1338 34Q1208 34 1104.5 -8.5Q1001 -51 938 -136Q875 -221 863 -321Q851 -421 851 -671V-948Q851 -1192 862.5 -1293.5Q874 -1395 934.5 -1479Q995 -1563 1098 -1608Q1201 -1653 1338 -1653Q1468 -1653 1571.5 -1610.5Q1675 -1568 1738 -1483Q1801 -1398 1813 -1298Q1825 -1198 1825 -948ZM1404 -1203Q1404 -1316 1391.5 -1347.5Q1379 -1379 1340 -1379Q1307 -1379 1289.5 -1353.5Q1272 -1328 1272 -1203V-447Q1272 -306 1283.5 -273Q1295 -240 1337 -240Q1380 -240 1392 -278Q1404 -316 1404 -459Z M1982 -1619H2280Q2578 -1619 2683.5 -1596Q2789 -1573 2855.5 -1478.5Q2922 -1384 2922 -1177Q2922 -988 2875 -923Q2828 -858 2690 -845Q2815 -814 2858 -762Q2901 -710 2911.5 -666.5Q2922 -623 2922 -427V0H2531V-538Q2531 -668 2510.5 -699Q2490 -730 2403 -730V0H1982ZM2403 -1342V-982Q2474 -982 2502.5 -1001.5Q2531 -1021 2531 -1128V-1217Q2531 -1294 2503.5 -1318Q2476 -1342 2403 -1342Z M3085 -1619H3787V-1295H3506V-988H3769V-680H3506V-324H3815V0H3085Z M4876 -1619V0H4507L4288 -736V0H3936V-1619H4288L4524 -890V-1619Z M6344 -1619V0H5976V-1093L5829 0H5568L5413 -1068V0H5045V-1619H5590Q5614 -1473 5641 -1275L5699 -863L5795 -1619Z M6513 -1619H7215V-1295H6934V-988H7197V-680H6934V-324H7243V0H6513Z M8212 -1619V-1295H7962V0H7541V-1295H7292V-1619Z M9035 -1619 9276 0H8845L8824 -291H8673L8648 0H8212L8426 -1619ZM8812 -578Q8780 -853 8748 -1257Q8684 -793 8668 -578Z M9769 -1619V0H9348V-1619Z M10830 -1129H10439V-1249Q10439 -1333 10424 -1356Q10409 -1379 10374 -1379Q10336 -1379 10316.5 -1348Q10297 -1317 10297 -1254Q10297 -1173 10319 -1132Q10340 -1091 10438 -1033Q10719 -866 10792 -759Q10865 -652 10865 -414Q10865 -241 10824.5 -159Q10784 -77 10668 -21.5Q10552 34 10398 34Q10229 34 10109.5 -30Q9990 -94 9953 -193Q9916 -292 9916 -474V-580H10307V-383Q10307 -292 10323.5 -266Q10340 -240 10382 -240Q10424 -240 10444.5 -273Q10465 -306 10465 -371Q10465 -514 10426 -558Q10386 -602 10229 -705Q10072 -809 10021 -856Q9970 -903 9936.5 -986Q9903 -1069 9903 -1198Q9903 -1384 9950.5 -1470Q9998 -1556 10104 -1604.5Q10210 -1653 10360 -1653Q10524 -1653 10639.5 -1600Q10755 -1547 10792.5 -1466.5Q10830 -1386 10830 -1193Z'/%3E%3C/g%3E%3C/svg%3E\") no-repeat max(40px,calc(50% - 498.5px)) 17px/203px 46px}§.secao-banners::after{content:'';display:block;height:115px}@keyframes lm-gira{to{transform:rotate(360deg)}}@keyframes lm-surge{to{opacity:1}}§body::after{content:'';position:fixed;left:50%;top:50%;width:28px;height:28px;margin:-14px 0 0 -14px;border:3px solid #e3e3e6;border-top-color:#1394B1;border-radius:50%;visibility:visible;opacity:0;animation:lm-surge .3s 2s forwards,lm-gira .9s linear infinite}"
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
// PARTE 3 (só no celular): o conteúdo principal já no esqueleto (foto do produto, 2 primeiras fotos da busca e da marca, banner do início, texto da categoria, apoio do login e do 404).
// O inicio.js cria os nós #lm-banner-cedo, #lm-intro-cedo e #lm-apoio-cedo. Medidas e porquês: dev/qa-wed/velocidade/RESPOSTA-1711.md
var S = 'html.lm-novo:not(.lm-pronto) ', LB = 'body:is(.pagina-busca,.pagina-marca) #listagemProdutos>ul>li:first-child>ul>li:nth-child';
var p3 = ''
  // produto: a foto principal do tema (chega em ~1 s) no lugar e no tamanho exatos da 1ª foto da galeria nova
  + S + 'body.pagina-produto #imagemProduto{position:fixed!important;visibility:visible;left:17px;top:369px;width:calc(100vw - 34px)!important;height:calc(100vw - 34px)!important;max-width:none!important;max-height:none!important;margin:0!important;padding:0;border:0;object-fit:contain;background:#fff;z-index:1;transform:none}'
  // busca e marca: as fotos dos 2 primeiros cards (as do tema) no lugar e no tamanho exatos dos cards novos (lado 50vw - 38; o 2º em 50vw + 5)
  + S + LB + '(-n+2) .imagem-principal{position:fixed!important;visibility:visible;left:17px;top:406px;width:calc(50vw - 38px)!important;height:calc(50vw - 38px)!important;max-width:none!important;max-height:none!important;margin:0!important;object-fit:contain;background:#fff;z-index:1}'
  + S + LB + '(2) .imagem-principal{left:calc(50vw + 5px)}' + S + LB.replace('.pagina-busca,', '') + '(-n+2) .imagem-principal{top:329px}'
  // início: o nosso 1º banner (a mesma URL do carrossel novo: sem baixar duas vezes) no lugar dele
  + S + '#lm-banner-cedo{display:block!important;visibility:visible;position:absolute;left:0;top:175px;width:100vw;height:128vw;z-index:1}'
  // categoria: o texto da descrição no lugar e no corte da intro nova (o categoria.js adota este mesmo nó como a intro)
  + S + "#lm-intro-cedo{display:-webkit-box!important;-webkit-box-orient:vertical;-webkit-line-clamp:4;visibility:visible;position:fixed;left:16px;top:280px;width:calc(100vw - 32px);max-height:90px;overflow:hidden;margin:0;background:#F6F6F7;z-index:1;font:400 14px/1.6 'Inter','Inter Reserva',sans-serif!important;color:#6B6C72;text-align:left}"
  // login e 404: o texto de apoio da faixa do título (o mesmo texto do tema) no lugar dele
  + S + "#lm-apoio-cedo{display:block!important;visibility:visible;position:fixed;left:16px;top:280px;width:calc(100vw - 32px);margin:0;background:#F6F6F7;z-index:1;font:400 16px/24px 'Inter','Inter Reserva',sans-serif!important;color:#6B6C72;text-align:left}"
  + S + 'body.pagina-login #lm-apoio-cedo{top:244px}';
process.stdout.write(':root{--lm-esq:1}' + "@font-face{font-family:'Inter Reserva';font-weight:400 500;src:local('Arial'),local('ArialMT'),local('Helvetica');size-adjust:105.06%;ascent-override:92.21%;descent-override:22.96%;line-gap-override:0%}" + css + '@media(max-width:767px){' + p3 + '}\n');
