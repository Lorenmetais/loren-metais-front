# Como instalar o visual novo na loja (Loja Integrada)

Desde 18/11 o código do visual novo está **todo no GitHub**. No painel da Loja Integrada fica **1 entrada fixa** (~600 caracteres) que não muda mais: ela pede ao GitHub Pages o `esqueleto.css` (casca e esqueleto da 1ª pintura) e o `inicio.js` (sorteio, plano B e o carregador do resto), e o `inicio.js` busca o resto (CSS, JavaScript, imagens, fontes) no jsDelivr pelo **hash do commit** do ramo `producao-min`. Nada do tema é alterado: apagar a entrada devolve a loja ao que era.

## Antes de começar

- **Acesso:** administrador do painel da loja.
- **Publicar = levar o commit aprovado para o ramo `producao`:** `git push origin <hash completo>:producao`. Daí em diante é automático (aba **Actions** do GitHub, tudo em verde):
  1. `min-producao.yml` gera os `-min` (terser e clean-css) e publica o ramo `producao-min`; no fim gera o `esqueleto.css` (`node painel/esqueleto.js`) e o `inicio.js` (com o jsDelivr apontando para o hash desse `producao-min`), minifica os dois e empurra para o ramo `fichas`, que é o GitHub Pages;
  2. `checkout-pages.yml` continua publicando o `checkout.css` no mesmo ramo `fichas` (os dois empurram com até 3 tentativas);
  3. `purge-producao.yml` continua limpando o `@producao` no jsDelivr.
- **Teste rápido:** abra `https://lorenmetais.github.io/loren-metais-front/inicio.js` e `https://lorenmetais.github.io/loren-metais-front/esqueleto.css`. Tem que aparecer código (o `inicio.js` com `@<hash>/` do `producao-min` dentro), não uma página de erro.

## Instalar (uma vez)

1. No painel: **Configurações > Códigos HTML personalizados > Incluir código HTML**. Crie **1 entrada** com o trecho abaixo (cópia de `painel/TRECHO-FIXO.html`), local **cabeçalho (`<head>`)**, páginas **todas as páginas exceto checkout**. Salve.
2. **Apague as entradas antigas** do visual novo (`PARTE 1 de 2`, `PARTE 2 de 2` e, se houver, a parte 3). Ficar com as antigas e a nova ao mesmo tempo carregaria o visual 2 vezes.
3. Espere a loja publicar (a ajuda da LI fala em 15 a 30 minutos) e faça a conferência abaixo.

```html
<!-- Loren Metais, visual novo: trecho FIXO (não mexer). O código está no GitHub (inicio.js e esqueleto.css, publicados pelo min-producao.yml no Pages). -->
<link rel="preconnect" href="https://lorenmetais.github.io">
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<script>setTimeout(function(){var l=document.getElementById('lm-esq');if(l&&!l.sheet)l.remove()},3000)</script>
<link id="lm-esq" rel="stylesheet" fetchpriority="high" href="https://lorenmetais.github.io/loren-metais-front/esqueleto.css">
<script src="https://lorenmetais.github.io/loren-metais-front/inicio.js"></script>
```

O que o trecho faz: os 2 `preconnect` adiantam a conexão; o `<link>` do `esqueleto.css` **bloqueia a pintura de propósito** (prioridade alta), para o visual antigo nunca aparecer antes do novo; o `<script>` síncrono do `inicio.js` liga o visual novo antes do `<body>`. Se o Pages não entregar o CSS em 3 s, o `setTimeout` tira o `<link>`; o `inicio.js` confere `--lm-esq` antes de ligar o novo e, sem o esqueleto, fica no visual antigo naquela visita e manda `lm_falha` com `esqueleto`.

## Conferir depois de instalar (5 minutos, em janela anônima)

1. Abra `https://www.lorenmetais.com.br/`. Primeiro aparece um esqueleto cinza com a logo; em seguida, o visual novo. Navegue por uma categoria, um produto (o frete tem o campo de CEP), a busca e o carrinho.
2. No DevTools (F12) > aba Rede: `esqueleto.css` e `inicio.js` vêm de `lorenmetais.github.io`; o resto vem de `cdn.jsdelivr.net/gh/Lorenmetais/loren-metais-front@<hash>/` (40 letras e números, não `@producao`).
3. Vá até o checkout (carrinho > Finalizar compra): ele não muda e não há pedido a `jsdelivr.net/gh/`.
4. Saída de emergência só no seu navegador: abra qualquer página com `?lm=antigo` (fica no visual antigo nesse navegador até abrir com `?lm=novo`).

## Desinstalar (tirar do ar)

- **Apague (ou desative) a entrada única no painel e salve.** Na carga seguinte a loja volta ao que era. As chaves `lm_grupo` e `lm_forca2` que ficam no navegador dos visitantes não fazem nada sem o código.
- **Desligar para os visitantes sem mexer no painel:** troque `var PERCENTUAL = 100;` por `0` no `inicio.js`, commit e publique no `producao` (vale em até ~10 min, o cache do Pages).
- **Proteção automática:** se o Pages ou o jsDelivr falharem de verdade numa visita, aquela visita volta sozinha ao visual antigo (veja **Como funciona** e **Limites conhecidos**). Não é preciso fazer nada.

## Atualizar para uma versão nova

**Nunca mexe no painel:** aprove o commit na prévia (`main`) e rode `git push origin <hash completo>:producao`. As Actions geram o `producao-min`, o `inicio.js` novo (apontando para o hash novo) e o `esqueleto.css` no Pages. O Pages manda o navegador guardar por 10 minutos: em até ~10 min depois da Action toda visita usa a versão nova, e os arquivos do jsDelivr vêm pelo hash (imutáveis: sem purge e sem mistura de versões).

- **Voltar uma versão:** `git push --force origin <hash anterior>:producao`. As Actions republicam tudo do commit anterior.
- **Mudar o esqueleto, o carregador, o `PERCENTUAL` ou o plano B** = mudar `painel/esqueleto.js` ou `inicio.js` e publicar como acima. O trecho do painel não muda.
- **Imagens e fontes:** se mudar o conteúdo de uma, troque também o nome do arquivo (o navegador pode guardá-las por dias).

## O código

- `painel/TRECHO-FIXO.html`: a entrada única do painel (acima).
- `inicio.js`: sorteio e `PERCENTUAL`, `?lm=antigo` (emergência), plano B (`lm_falha`), carregador dos CSS e JS pelo jsDelivr, cortes de downloads inúteis do tema, preload do banner só na `/` e os nós `#lm-*-cedo` do celular. No fonte ficam `@COMMIT/`, `MIN = ''` e `V` de hora em hora; o `min-producao.yml` troca por `@<hash do producao-min>/`, `-min` e `V = ''`.
- `painel/esqueleto.js`: `node painel/esqueleto.js > esqueleto.css` gera a casca e o esqueleto de cada página (as listas de retângulos), as regras do conteúdo cedo do celular, a fonte de reserva e `:root{--lm-esq:1}`.
- `previa-loren.user.js` (prévia do `main`, só no navegador de quem a liga): troca o código do ar pelo do `main` no mesmo ponto do `<head>` (o `esqueleto.css` vira o do `painel/esqueleto.js` do `main` e roda o `inicio.js` do `main` no lugar do do Pages).
- Aposentados em 18/11 e fora do repositório: `cabecalho-snippet.html`, `cabecalho-parte3.html` e `painel/gera.py` (geravam as 3 entradas antigas do painel; estão no commit ca5e2f4, e os textos das entradas em `dev/qa-wed/velocidade/pacote/`).

## Como funciona

Regra do Eduardo (05/11): a visita normal **nunca** vê o visual antigo, nem por um instante. O visual antigo só aparece se o CDN falhar de verdade (plano B).

1. **Casca síncrona.** O `inicio.js` (síncrono, depois do `esqueleto.css`) liga `html.lm-novo` antes do `<body>`; o `esqueleto.css` traz a casca (com a logo embutida) e o esqueleto de cada página, e a primeira pintura já é o visual novo. O esqueleto vale em todas as páginas: início, categoria, busca, marca, produto, institucionais, 404, carrinho e login, no computador, no tablet (início, categoria e produto) e no celular. O CSS do esqueleto é gerado na hora a partir de listas curtas de retângulos (função `esq`); medidas em `dev/qa-ellie/esqueleto/` e `dev/qa-wed/esqueleto/`. As alturas são as de `loren.css` (seção "carregamento sem quebra"); se mudarem lá, mude aqui.
2. **Só o esqueleto e o `inicio.js` bloqueiam a pintura** (os dois do Pages; o CSS tem o fallback de 3 s). O jsDelivr nunca bloqueia: os arquivos dele são pedidos por JavaScript, em paralelo: `brand-tokens.css` e `loren.css` (os dois que decidem), `loren.js` (preload) e as fontes. O CSS e o JS da página (`produto`, `categoria`, `paginas`, `conta`, `modais`, só o que a página usa) o `loren.js` baixa e espera antes de revelar.
3. **Caminho feliz.** Os dois CSS chegam, o `loren.js` entra, monta cabeçalho, vantagens e o resto e liga `html.lm-pronto`; a casca sai e a página revelada ocupa o mesmo lugar (sem salto). Todo o CSS só vale dentro de `html.lm-novo`, inclusive os ícones e a casca. O CSS da página (produto ou categoria, pelo `type` que o tema escreve no head) e o `modais.css` entram assim que os 2 CSS chegam; o JS deles só é pré-carregado (`rel=preload`) e o `loren.js` o roda depois do ready do tema. Isso exige o `modais.css` **sem `:has()`**: com ele, o CSS aplicado cedo deixava os handlers de ready do tema 2 a 5 s mais lentos (medido em 09/11, `dev/prints-rocky/pronto/`).
4. **Lentidão não é falha (Eduardo, 09/11).** Enquanto o CSS, o `loren.js` ou a montagem não vêm, a visita fica na casca nova; depois de 2 s aparece um carregando discreto (círculo azul, só CSS, no centro da tela). O visual antigo só entra em **erro de verdade** (um dos 2 CSS ou o `loren.js` dá erro de rede, ou o `loren.js` lança exceção antes de montar) ou se **uma etapa ficar parada `TETO_MS` (40 s)**: o CSS desde o início do código, o `loren.js` depois do CSS, a montagem depois do fim do HTML. Aí o código tira a classe, a casca, os `<link>` e o `<script>`, e a loja abre inteira no visual antigo naquela visita; o `loren.js`, se chegar depois, vê `window.__lmDesliga` e não faz nada.
5. **Aviso.** Cada plano B empurra um evento no `dataLayer`: `lm_falha` com `lm_motivo` = `css_erro`, `css_parado`, `js_erro`, `js_parado`, `js_excecao` ou `js_nao_montou` (e `lm_ms`). Para contar no GA4 falta um acionador no GTM para esse evento.
6. **Sem revelação forçada.** A página só aparece quando o `loren.js` monta e liga `html.lm-pronto` (a antiga "rede de segurança" de 6 s revelava a página sem o cabeçalho novo, com peças do antigo à vista, e saiu). O `loren.js` arranca no ready do jQuery e também depois de qualquer erro de script e no `load`: no jQuery antigo do tema, uma exceção num ready anterior (EmailJS bloqueado) parava a fila e a página ficava na casca.
7. **Checkout e pagamento.** O código encerra na primeira linha: nenhuma requisição ao jsDelivr, nenhuma classe (testado com `/checkout/...`). A Loja Integrada também não roda o código do painel no checkout. A prévia do checkout para a equipe é o favorito **Prévia checkout** (`previa-favorito.html`): põe `html.lm-ck` e carrega `checkout.css` do ramo producao.

### Folga do teto (medido em 09/11, 3G ruim: 400 kbps, 400 ms, CPU 6x, 3 passadas de início, categoria e produto)

- Nenhuma das 9 cargas caiu no antigo nem mostrou um quadro dele. Casca em 8 a 9,6 s; página completa 22,8 a 25 s (produto e categoria) e 42,4 a 42,8 s (início, onde o fim do HTML do próprio tema leva 42 s).
- Etapa mais lenta, contada como o código conta: o CSS chegou 19,5 s depois do início do código (início); o `loren.js` chegou antes do CSS; a montagem levou até 9 s depois do fim do HTML (produto). Com `TETO_MS` de 40 s, a folga é de 20,5 s (2 vezes o pior caso) no CSS e 31 s na montagem.
- Dados: `dev/prints-rocky/pronto/diag-9-ruim.jsonl`; medidor `medir-pronto.mjs` (`CENARIOS=ruim`).

## Saída de emergência (sem botões)

- **Sem botões de troca (Eduardo 18/11):** saíram o "Ver a nova interface" (visual de hoje), o "Voltar à interface anterior" (visual novo) e a marca `?lm=equipe`.
- **`?lm=antigo`** em qualquer página deixa aquele navegador no visual antigo (guardado em `localStorage.lm_forca2`); **`?lm=novo`** desfaz. Só para a equipe, em emergência.
- A chave mudou de `lm_forca` para `lm_forca2` de propósito: quem tinha clicado no antigo "Voltar à interface anterior" ficaria preso no visual antigo, sem botão para sair; com a chave nova, essa escolha velha não vale mais.

## Ligar para parte das visitas

`PERCENTUAL` (no `inicio.js`) é a % das visitas que vê o visual novo: **100 desde 18/11**. O sorteio (0 a 99) é feito uma vez e fica guardado no visitante (`localStorage.lm_grupo`); sem `localStorage`, o visitante conta como 99 (entra com 100). Para mudar: edite o `inicio.js` e publique (não mexe no painel).
O código manda ao `dataLayer` 1 evento `lm_visual` por visita, com `lm_grupo` (`novo` ou `antigo`) e `lm_motivo` (`sorteio` ou `forcado`), sem dado pessoal. Segmento no GA4: `dev/MEDICAO-10.md`.

## Cortes de downloads inúteis do tema (no `inicio.js`)

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
- Se o `loren.js` montar parte do cabeçalho e depois falhar, o plano B pode deixar peças soltas na página; o caso comum (JS que nem chega ou quebra ao carregar) é tratado.
- A casca imita o cabeçalho com uma imagem (logo) e um fundo; o JS depois troca pelo cabeçalho real na mesma altura. Se a altura do cabeçalho mudar em `loren.css`, a casca precisa mudar junto.
- **Pages travado (sem responder) no `inicio.js`:** o `<script>` é síncrono; se o Pages aceitar a conexão e não responder, o navegador espera por ele. Erro rápido (404, fora do ar, DNS) não trava: a visita abre no visual antigo. O fallback de 3 s cobre só o CSS.
