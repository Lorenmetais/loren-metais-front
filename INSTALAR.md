# Como instalar o visual novo no live (Loja Integrada)

Onde: painel da loja, **Configurações > Códigos HTML personalizados**, no campo do **cabeçalho (`<head>`)**, uma vez só.
O mesmo código serve para o teste (favorito "Prévia Loren") e para o live: a diferença é só o `COMMIT` da linha do jsDelivr.

```html
<!-- Loren Metais: visual novo. Fora do checkout e do pagamento a página fica como está. -->
<script>
(function () {
  if (/\/(checkout|pagamento)/i.test(location.pathname)) return;
  var h = document.documentElement;
  h.classList.add('lm-novo');                                  // liga o visual novo antes do HTML aparecer
  var mostra = function () { h.classList.add('lm-pronto'); };     // se o JS falhar ou a rede for lenta, a página aparece inteira:
  setTimeout(mostra, 6000);                                        // no máximo 6 s depois de abrir
  document.addEventListener('DOMContentLoaded', function () { setTimeout(mostra, 3000); });  // ou 3 s depois de o HTML terminar (o que vier primeiro)
})();
</script>
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://cdn.jsdelivr.net/gh/eduserpa/loren-metais-front@COMMIT/brand-tokens.css">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:wght@600;700&family=Inter:wght@400;600;700&display=swap">
<link rel="preload" as="font" type="font/woff2" crossorigin href="https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2">
<link rel="preload" as="font" type="font/woff2" crossorigin href="https://fonts.gstatic.com/s/barlowsemicondensed/v16/wlpigxjLBV1hqnzfr-F8sEYMB0Yybp0mudRfp66_B2sl.woff2">
<link rel="preload" as="font" type="font/woff2" crossorigin href="https://fonts.gstatic.com/s/barlowsemicondensed/v16/wlpigxjLBV1hqnzfr-F8sEYMB0Yybp0mudRfw6-_B2sl.woff2">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/eduserpa/loren-metais-front@COMMIT/loren.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/eduserpa/loren-metais-front@COMMIT/produto.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/eduserpa/loren-metais-front@COMMIT/categoria.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/eduserpa/loren-metais-front@COMMIT/paginas.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/eduserpa/loren-metais-front@COMMIT/modais.css">
<script defer src="https://cdn.jsdelivr.net/gh/eduserpa/loren-metais-front@COMMIT/loren.js"></script>
```

Troque `COMMIT` pelo código do último commit do repositório (7 letras/números, o mesmo que o favorito usa). Nunca use `@main`: o jsDelivr guarda o `@main` em cache por até 12 horas.

## Como funciona (para quem for mexer)

1. **Antes do HTML**: o `<script>` acima liga `html.lm-novo`. Todo o `loren.css` só vale dentro dessa classe; no checkout a classe não liga, então nada muda lá.
2. **CSS no head**: os 5 arquivos de CSS entram juntos (cada um só vale na sua página, pela classe do `body`), então nenhuma regra chega depois da página pronta.
3. **JS com `defer`**: o `loren.js` monta as peças (cabeçalho, vantagens, faixa para empresas, quem somos, chat) e carrega o JS da página (`produto.js`, `categoria.js`, `paginas.js`, `modais.js`). Ao terminar liga `html.lm-pronto`.
4. **Até `html.lm-pronto`** o `loren.css` reserva o espaço do que o JS monta (topo, vantagens, banner, faixa para empresas) e esconde o que o JS troca; ao ligar a classe, o espaço reservado dá lugar à peça real, com a mesma altura. Por isso não há salto.
5. **Se o JS falhar** (rede, jsDelivr fora): o `<script>` do topo liga `html.lm-pronto` sozinho, no máximo 6 s depois de abrir a página ou 3 s depois de o HTML terminar de carregar (o que vier primeiro) e a página aparece com o CSS novo e o conteúdo do tema, sem ficar em branco.

**Fontes**: a linha `fonts.googleapis.com` repete o `@import` do `loren.css` de propósito (a fonte começa a baixar em paralelo com o CSS, não depois dele) e os 3 `preload` são os arquivos do subconjunto latino (Inter variável 400/600/700 e Barlow Semi Condensed 600 e 700). Se o Google trocar a versão do arquivo (`v16`, `v20`), o `preload` só deixa de ajudar; nada quebra.

## Conferir depois de colar

- Abrir a loja em janela anônima, rolar até o fim e voltar: sem salto no topo, sem texto solto no celular.
- `node previa_real.mjs dev/lista-qa.txt <pasta>` com `LIVE=1` mede o CLS das 6 páginas (meta: menor que 0,1). O relatório de números fica em `dev/prints-rocky/CLS.md`.
- Tirar do ar: apagar o bloco do painel. O site volta ao que era (nada do tema foi alterado).
