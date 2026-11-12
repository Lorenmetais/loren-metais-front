// Loren Metais, página de categoria, de busca e de marca (carregado pelo loren.js). Só reorganiza o que a loja já mostra:
// nenhum texto é apagado, escondido ou reescrito. Título + 1º parágrafo no topo, subcategorias em chips, barra
// Filtrar/Ordenar, coluna de 240 px no computador e o resto da descrição + perguntas num bloco "Saiba mais" depois da lista.
// Substitui o script antigo do painel que copiava um parágrafo da descrição para cima da lista (.texto-descricao).
(() => {
  const b = document.body;
  if (!/pagina-categoria|pagina-busca|pagina-marca/.test(b.className) || b.dataset.lmCat) return;
  const sec = document.querySelector('#corpo .secao-principal');
  const conteudo = sec?.querySelector(':scope > .conteudo');
  const lista = conteudo?.querySelector('#listagemProdutos');  // a página tem outros #listagemProdutos (vitrines do menu)
  if (!conteudo || !lista) {
    // busca sem resultado (sem lista): cabeçalho de página com o h1 de texto da própria página (lmPagcab do loren.js)
    // e as dicas ("Tente palavras menos específicas...") no texto secundário (Ellie 04/11)
    if (/pagina-busca/.test(b.className)) {
      b.dataset.lmCat = '1';
      const h1 = document.querySelector('#corpo h1');
      if (h1 && window.lmPagcab) window.lmPagcab(h1);
      document.querySelectorAll('#corpo li').forEach((li) => { if (/^tente\s/i.test(li.textContent.trim())) li.closest('ul, ol')?.classList.add('lm-busca-dicas'); });
      document.querySelector('#corpo .conteudo a.botao.secundario')?.classList.add('lm-btn2');  // Voltar a home: o secundário da base
      b.classList.add('lm-busca-vazia');
    }
    return;
  }
  b.dataset.lmCat = '1';
  const coluna = sec.querySelector(':scope > .coluna');
  const limpa = (t) => t.replace(/\s+/g, ' ').trim();

  // topo: título, 1º parágrafo da descrição e chips, na largura toda (antes das colunas)
  const topo = document.createElement('div'); topo.className = 'lm-cat-topo';
  const h1 = conteudo.querySelector('h1') || document.querySelector('.marca-info > h1'); if (h1) topo.append(h1);  // marca: o nome é o h1 da .marca-info
  sec.before(topo);
  // classes no lugar de :has no categoria.css (navegador antigo descarta a regra inteira): sem coluna, a lista usa a largura
  // toda; a .marca-info que ficou sem nada depois que o h1 saiu some
  if (!coluna) sec.classList.add('lm-cat-sem-coluna');
  const marcaInfo = document.querySelector('.marca-info'); if (marcaInfo && !marcaInfo.children.length) marcaInfo.classList.add('lm-marca-vazia');

  // descrição: componente do menu lateral com título + parágrafos (não o da newsletter)
  const comp = [...(coluna?.querySelectorAll('.componente:not(.newsletter) > .interno') || [])].find((c) => c.querySelector(':scope > h4.titulo') && c.querySelector(':scope > p, :scope > h3'));
  // cópias feitas pelo script antigo do painel: ele está duas vezes na página e uma das cópias pode chegar depois
  const textos = comp ? [...comp.querySelectorAll(':scope > p')].map((p) => limpa(p.textContent)) : [];
  const velho = (v) => {
    if (textos.includes(limpa(v.textContent))) v.remove();  // repete um parágrafo que já aparece
    else { textos.push(limpa(v.textContent)); v.className = 'lm-cat-intro'; topo.append(v); }
  };
  lista.querySelectorAll(':scope > .texto-descricao').forEach(velho);
  new MutationObserver((ms) => ms.forEach((m) => m.addedNodes.forEach((n) => n.classList?.contains('texto-descricao') && velho(n)))).observe(lista, { childList: true });
  if (comp) {
    const filhos = [...comp.children].filter((n) => !n.matches('h4.titulo'));
    const intro = filhos.find((n) => n.tagName === 'P');
    if (intro) { intro.classList.add('lm-cat-intro'); topo.append(intro); }
    const resto = filhos.filter((n) => n !== intro);
    if (resto.length) {
      const guia = document.createElement('div'); guia.className = 'lm-cat-guia';
      const faq = document.createElement('div'); faq.className = 'lm-cat-faq';
      // FAQ em acordeão (Ellie 11/11, #61 do comparativo, como na Conceito), só com o texto que a categoria já tem. Começa num
      // título "Perguntas/Dúvidas frequentes" ou "FAQ"; sem esse título, só com 2 ou mais perguntas que tenham resposta. Pergunta =
      // título (h3 a h5) ou parágrafo todo em negrito; fora do bloco de FAQ, ela precisa terminar com "?". Sem pergunta, nada muda.
      const txt = (n) => limpa(n.textContent);
      const ehTitFaq = (n) => /^(H[2-5]|P)$/.test(n.tagName) && /^(perguntas|d[uú]vidas) frequentes|^faq\b/i.test(txt(n)) && txt(n).length < 60;
      const negrito = (n) => n.tagName === 'P' && txt(n) && [...n.childNodes].every((c) => (c.nodeType === 3 && !c.textContent.trim()) || /^(STRONG|B)$/.test(c.nodeName) || c.nodeName === 'BR');
      const ehPerg = (n, dentro) => (/^H[3-5]$/.test(n.tagName) || negrito(n)) && txt(n).length < 200 && (dentro || /\?$/.test(txt(n)));
      const ini = resto.findIndex(ehTitFaq);
      const perguntas = resto.filter((n, i) => ehPerg(n, ini >= 0 && i > ini) && /\S/.test(txt(resto[i + 1] || { textContent: '' })) && !ehPerg(resto[i + 1] || n, true));
      const comeca = ini >= 0 ? ini : perguntas.length >= 2 ? resto.indexOf(perguntas[0]) : -1;
      const pares = [];
      resto.forEach((n, i) => {
        if (comeca < 0 || i < comeca) { guia.append(n); return; }
        if (i === ini) { n.className = 'lm-cat-faq-tit'; faq.append(n); return; }
        if (perguntas.includes(n)) {
          const d = document.createElement('details'), s = document.createElement('summary'), r = document.createElement('div');
          s.innerHTML = '<span></span><svg class="lm-cat-faq-seta" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
          s.firstChild.textContent = txt(n); r.className = 'lm-cat-faq-resp'; d.append(s, r); faq.append(d); n.remove(); pares.push([txt(n), r]); return;
        }
        (faq.lastElementChild?.tagName === 'DETAILS' ? faq.lastElementChild.querySelector('.lm-cat-faq-resp') : faq).append(n);
      });
      // os mesmos pares em dados estruturados (FAQPage), como a Conceito faz
      if (pares.length) document.head.insertAdjacentHTML('beforeend', `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: pares.map(([q, r]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: txt(r) } })) }).replace(/</g, '\u003c')}</script>`);
      const saiba = document.createElement('section'); saiba.className = 'lm-cat-saiba';
      saiba.innerHTML = `<h2>Saiba mais sobre ${h1 ? limpa(h1.textContent).toLowerCase() : 'a categoria'}</h2>`;
      const cols = document.createElement('div'); cols.className = 'lm-cat-cols';
      if (guia.childElementCount) cols.append(guia);
      if (faq.childElementCount) cols.append(faq);
      saiba.append(cols); sec.after(saiba);
    }
    // sobra só o título do componente, que repete o h1
    if (![...comp.children].some((n) => !n.matches('h4.titulo'))) comp.closest('.componente').classList.add('lm-cat-vazio');
  }

  // chips (só no celular, onde a coluna fica fechada): subcategorias da categoria ativa ou, sem subcategoria, as outras
  // categorias do menu lateral. Os links são os do menu da loja.
  const ativo = coluna?.querySelector('.menu.lateral:not(.outras) li.ativo');
  const subs = ativo ? [...ativo.querySelectorAll(':scope ul a')] : [];
  const outras = [...(coluna?.querySelectorAll('.menu.lateral.outras > .nivel-um > li > a') || [])];
  const fonte = subs.length ? subs : outras;
  if (fonte.length) {
    const chips = document.createElement('nav'); chips.className = 'lm-cat-chips lm-so-cel';  // no computador a coluna já mostra a mesma lista
    chips.setAttribute('aria-label', 'Categorias');
    chips.innerHTML = fonte.map((a) => `<a href="${a.href}">${limpa(a.textContent)}</a>`).join('');
    topo.append(chips);
  }

  // parágrafo longo: corta em 4 linhas no celular e 5 no computador, com Ler mais / Ler menos (o texto continua no HTML)
  topo.querySelectorAll('.lm-cat-intro').forEach((p) => {
    if (limpa(p.textContent).length <= 350) return;
    p.classList.add('lm-cat-corta');
    p.insertAdjacentHTML('afterend', '<button type="button" class="lm-cat-mais" aria-expanded="false">Ler mais</button>');
    const bt = p.nextElementSibling;
    bt.addEventListener('click', () => { const on = p.classList.toggle('lm-aberto'); bt.textContent = on ? 'Ler menos' : 'Ler mais'; bt.setAttribute('aria-expanded', on); });
    // o Ler mais só aparece quando o corte esconde texto: na faixa larga (64rem, 12/11) um texto curto cabe nas 5 linhas
    new ResizeObserver(() => { bt.hidden = !p.classList.contains('lm-aberto') && p.scrollHeight <= p.clientHeight + 1; }).observe(p);
  });

  // cabeçalho de página (lmPagcab do loren.js): trilha + h1 + o 1º parágrafo com o Ler mais como linha de apoio, na
  // faixa; os chips (celular) ficam logo abaixo, no .lm-cat-topo (Ellie 04/11)
  if (h1 && window.lmPagcab) {
    const ap = document.createElement('div'); ap.className = 'lm-cat-apoio';
    topo.querySelectorAll(':scope > .lm-cat-intro, :scope > .lm-cat-mais').forEach((n) => ap.append(n));
    window.lmPagcab(h1, ap.childElementCount ? { apoio: ap } : {});
    if (!topo.childElementCount) topo.classList.add('lm-cat-topo-vazio');
    else if ([...topo.children].every((n) => n.classList.contains('lm-cat-chips'))) topo.classList.add('lm-cat-topo-chips');  // só chips: some a ≥1024 (categoria.css)
  }

  // preço: a LI aceita qualquer faixa em fq=price_range:min-max (testado 04/11), então as faixas fixas viram mínimo/máximo
  const preco = coluna?.querySelector('.faceta-preco .filtro');
  if (preco) {
    const fq = new URL(location.href).searchParams.getAll('fq').find((v) => v.startsWith('price_range:'));
    const [mi, ma] = fq ? fq.slice(12).split('-').map(Number) : [];
    const campo = (n, rot, v) => `<label>${rot}<input class="lm-campo" type="number" name="${n}" min="0" step="1" inputmode="numeric" placeholder="R$" value="${v > 0 && v < 999999 ? Math.round(v) : ''}"></label>`;
    preco.querySelector('.atributo-lista').insertAdjacentHTML('beforebegin', `<form class="lm-preco">${campo('min', 'Mínimo', mi)}${campo('max', 'Máximo', ma)}<button type="submit" class="botao principal">Filtrar</button>${fq ? '<a class="lm-preco-limpa" href="#">Limpar preço</a>' : ''}</form>`);
    preco.classList.add('lm-preco-livre');
    const vai = (faixa) => {
      const u = new URL(location.href); const resto = u.searchParams.getAll('fq').filter((v) => !v.startsWith('price_range:'));
      u.searchParams.delete('fq'); u.searchParams.delete('pagina'); resto.forEach((v) => u.searchParams.append('fq', v));
      if (faixa) u.searchParams.append('fq', 'price_range:' + faixa);
      location.href = u.href;
    };
    const f = preco.querySelector('.lm-preco');
    f.addEventListener('submit', (e) => { e.preventDefault(); const a = +f.min.value || 0, z = +f.max.value || 999999; vai(Math.min(a, z) + '-' + Math.max(a, z)); });
    f.querySelector('.lm-preco-limpa')?.addEventListener('click', (e) => { e.preventDefault(); vai(''); });
  }

  // newsletter no fim da coluna (na busca ela vem antes dos filtros)
  const news = coluna?.querySelector('.newsletter')?.closest('.row-fluid');
  if (news && news.parentElement === coluna) { news.classList.add('lm-cat-news'); coluna.append(news); }

  // paginação de baixo vira a última linha da grade: o espaço até a newsletter conta do fim da lista (48/32, --lm-sec)
  const rodape = conteudo.querySelector('.ordenar-listagem.rodape'), ul = lista.querySelector(':scope > ul');
  if (rodape && ul && rodape.querySelector('.pagination a:not([href="#"])')) { const li = document.createElement('li'); li.className = 'lm-cat-pag'; li.append(rodape); ul.append(li); }
  else rodape?.classList.add('lm-cat-sem-pag');  // uma página só: nada a paginar
  // reticências da paginação: o tema as marca como página atual (li.active)
  conteudo.querySelectorAll('.pagination li').forEach((li) => { if (li.textContent.trim() === '...') li.classList.add('lm-cat-reticencias'); });
  // anterior/próxima são só o ícone: nome para o leitor de tela (Lighthouse link-name, 12/11)
  conteudo.querySelectorAll('.pagination a[rel="prev"], .pagination a[rel="next"]').forEach((a) => a.setAttribute('aria-label', a.rel === 'prev' ? 'Página anterior' : 'Próxima página'));
  // os títulos da coluna (h4 do tema, "Filtrar por Preço") vêm logo depois do h1: nível 2 para o leitor de tela (Lighthouse heading-order, 12/11)
  coluna?.querySelectorAll('h4.titulo').forEach((h) => h.setAttribute('aria-level', '2'));

  // o Ordenar do tema é só a seta: nome para o leitor de tela (validação da Wednesday 12/11)
  document.getElementById('botaoOrdenar')?.setAttribute('aria-label', 'Ordenar produtos');
  // barra Filtrar/Ordenar: o Ordenar é o da loja; o Filtrar abre a coluna (filtros + categorias) no celular
  const barra = conteudo.querySelector('.ordenar-listagem.topo');
  if (barra && coluna?.querySelector('.filtro')) {
    barra.insertAdjacentHTML('afterbegin', '<button type="button" class="lm-cat-filtrar" aria-expanded="false">Filtrar</button>');
    coluna.insertAdjacentHTML('afterbegin', '<button type="button" class="lm-cat-fechar" aria-label="Fechar filtros">Fechar</button>');
    const bt = barra.querySelector('.lm-cat-filtrar');
    const abre = (on) => { b.classList.toggle('lm-filtros', on); bt.setAttribute('aria-expanded', on); };
    bt.addEventListener('click', () => abre(true));
    coluna.querySelector('.lm-cat-fechar').addEventListener('click', () => abre(false));
  }
  if (barra && !barra.querySelector('.input-append, .lm-cat-filtrar')) barra.classList.add('lm-cat-barra-vazia');  // marca: só a paginação repetida, e a de baixo basta
  b.classList.add('lm-cat');
})();
