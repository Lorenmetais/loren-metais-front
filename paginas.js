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
    txt.querySelectorAll('p, div').forEach((p) => { if (!temTexto(p) && !p.querySelector('img, iframe, video, table')) p.classList.add('lm-vazio'); });
    // link sozinho no parágrafo ("Veja esse item") vira botão secundário da base
    txt.querySelectorAll('p > a:only-child').forEach((a) => { if (a.parentElement.textContent.trim() === a.textContent.trim()) a.classList.add('lm-btn2'); });
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
  }
})();
