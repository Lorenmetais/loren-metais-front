// Loren Metais, páginas institucionais, carrinho e conta (carregado pelo loren.js). Só reorganiza e estiliza:
// nenhum texto é apagado ou reescrito.
(() => {
  const b = document.body;
  if (b.dataset.lmPag) return;
  b.dataset.lmPag = '1';
  const temTexto = (e) => e.textContent.replace(/[\s​⠀]/g, '') !== '';

  // institucionais (/pagina/...): texto colado do Word vira coluna de leitura; Obras finalizadas vira grade de cards
  const caixa = b.classList.contains('pagina-pagina') && document.querySelector('#corpo .caixa-sombreada');
  const txt = caixa && caixa.querySelector(':scope > div');
  if (txt) {
    caixa.classList.add('lm-inst');
    // parágrafo vazio (só espaço) do Word: some, o espaçamento fica por conta do CSS
    txt.querySelectorAll('p, div, h2, h3, h4, font').forEach((p) => { if (!temTexto(p) && !p.querySelector('img, iframe, video, table')) p.classList.add('lm-vazio'); });
    // link sozinho no parágrafo ou título ("Veja esse item", "Voltar para a loja") vira botão secundário da base
    // (nas obras os itens com link continuam link)
    if (!/obras-finalizadas/.test(location.pathname)) txt.querySelectorAll('a').forEach((a) => { const bl = a.closest('p, h2, h3, h4'); if (bl && temTexto(a) && bl.textContent.trim() === a.textContent.trim()) a.classList.add('lm-btn2'); });
    txt.querySelectorAll('table').forEach((t) => { const w = document.createElement('div'); w.className = 'lm-tab'; t.before(w); w.append(t); });

    // Obras: cada obra começa num parágrafo com texto em 20 px (o nome); depois vêm os itens e as fotos
    const nome = (p) => p.tagName === 'P' && temTexto(p) && p.querySelector('[style*="20px"]');
    if (/obras-finalizadas/.test(location.pathname) && [...txt.children].some(nome)) {
      caixa.classList.add('lm-obras-pag');
      const grade = document.createElement('div'); grade.className = 'lm-obras';
      let card = null;
      for (const p of [...txt.children]) {
        if (nome(p)) {
          card = document.createElement('article'); card.className = 'lm-obra';
          card.innerHTML = '<div class="lm-obra-fotos"></div><div class="lm-obra-txt"></div>';
          p.classList.add('lm-obra-nome'); card.lastChild.append(p); grade.append(card); continue;
        }
        if (!card) continue;  // o que vem antes da 1ª obra fica onde está
        p.querySelectorAll('img').forEach((img) => card.firstChild.append(img));
        if (temTexto(p)) card.lastChild.append(p); else p.remove();  // sem texto e já sem foto: era só espaço
      }
      grade.querySelectorAll('.lm-obra-fotos:empty').forEach((f) => f.remove());
      txt.append(grade);
    }

    // Quem somos: o 1º parágrafo vira lead (maior), o resto segue na coluna de leitura (Ellie 04/11)
    const primeiro = () => [...txt.children].find((e) => !e.classList.contains('lm-vazio'));
    if (/quem-somos/.test(location.pathname) && primeiro()?.tagName === 'P') primeiro().classList.add('lm-lead');

    // Formas de pagamento: a arte da página (Slide1) é uma imagem só, com os selos dentro. Os selos separados que o site
    // já tem ficam no rodapé ("Pague com" e "Selos"): uma cópia deles entra numa grade antes da arte, que continua igual
    if (/formas-de-pagamento/.test(location.pathname) && !txt.querySelector('.lm-selos-pag')) {
      const sec = document.createElement('section'); sec.className = 'lm-selos-pag';
      for (const bloco of document.querySelectorAll('.pagamento-selos :is(.pagamento, .selos)')) {
        const tit = bloco.querySelector('.titulo'); const vistos = new Set(); const ul = document.createElement('ul'); ul.className = 'lm-selos';
        bloco.querySelectorAll('i.icone-pagamento, img').forEach((x) => {
          const chave = x.tagName === 'IMG' ? x.src : x.className; if (vistos.has(chave)) return; vistos.add(chave);
          const li = document.createElement('li'); const c = x.cloneNode(true); c.removeAttribute('class');
          if (x.tagName === 'I') {
            // bandeira do rodapé é sprite com CSS só do rodapé: a cópia leva o fundo calculado do original
            c.className = x.className; const cs = getComputedStyle(x);
            Object.assign(c.style, { display: 'inline-block', width: cs.width, height: cs.height, backgroundImage: cs.backgroundImage, backgroundPosition: cs.backgroundPosition, backgroundSize: cs.backgroundSize, backgroundRepeat: cs.backgroundRepeat });
          }
          li.append(c); ul.append(li);
        });
        if (!ul.children.length) continue;
        if (tit) { const h = document.createElement('h2'); h.textContent = tit.textContent.trim(); sec.append(h); }
        sec.append(ul);
      }
      const arte = txt.querySelector('img'); const antes = arte ? arte.closest('#corpo .lm-inst > div > *') : null;
      if (sec.children.length) antes ? antes.before(sec) : txt.append(sec);
      if (arte) arte.closest('p, div')?.classList.add('lm-arte');
    }
  }

  // frete/cupom do carrinho e campos do login: classe .lm-campo (o campo padrão do loren.css); aqui só as larguras no CSS
  document.querySelectorAll('body.pagina-carrinho .tabela-carrinho .input-append input, body.pagina-login .cadastro-logar input:is([type=text], [type=password], [type=email])').forEach((i) => i.classList.add('lm-campo'));

  // quantidade do carrinho: seletor padrão (.lm-qtd, window.lmQtd do loren.js); o CSS tira o − e o + do tema e o "Atualizar quantidade",
  // e a linha atualiza sozinha ao mudar (modais.js, mudaQtd)
  document.querySelectorAll('body.pagina-carrinho .tabela-carrinho .quantidade input[name=quantidade]').forEach((i) => window.lmQtd?.(i));

  // cadastro (/conta/criar): campos com .lm-campo; Cancelar e Criar conta numa linha de ações (Ellie 04/11)
  const criar = b.classList.contains('pagina-cadastro') && document.querySelector('#corpo form[action*="criar"]');
  if (criar) {
    criar.querySelectorAll('input:is([type=text], [type=tel], [type=email], [type=password]), select').forEach((c) => c.classList.add('lm-campo'));
    const enviar = criar.querySelector('button[type=submit], input[type=submit]');
    if (enviar) {
      enviar.parentElement.classList.add('lm-acoes');
      enviar.parentElement.querySelectorAll('a.botao:not(.principal)').forEach((a) => a.classList.add('lm-btn2'));
    }
  }

  // cabeçalho de página: componente do loren.js (window.lmPagcab, Rocky). Aqui só a escolha do título e da linha de
  // apoio de cada página: institucionais = o subtítulo do Word (h2-h4 ou parágrafo todo em negrito, curto, diferente do
  // título); 404 = o texto da .box-destaque; conta/carrinho = o <small> do título (padrão da função).
  const corpo = document.querySelector('#corpo');
  const h1 = corpo && corpo.querySelector('.lm-inst > h1, .cabecalho-interno h1, .box-destaque > h1');
  if (h1 && window.lmPagcab) {
    let apoio = h1.closest('.box-destaque') ? h1.parentElement.querySelector(':scope > p') : null;
    if (!apoio && txt) {
      const p1 = [...txt.children].find((e) => !e.classList.contains('lm-vazio'));
      const negrito = p1 && p1.tagName === 'P' && p1.querySelector('strong, b') && p1.textContent.trim() === p1.querySelector('strong, b').textContent.trim();
      const t = p1 ? p1.textContent.trim() : '';
      if (p1 && (/^H[2-4]$/.test(p1.tagName) || negrito) && t && t.length <= 140 && t.toLowerCase() !== h1.textContent.trim().toLowerCase() && !p1.querySelector('a, img')) apoio = p1;
    }
    window.lmPagcab(h1, { apoio: apoio || undefined, leitura: !!h1.closest('.lm-inst:not(.lm-obras-pag)') });
  }
})();
