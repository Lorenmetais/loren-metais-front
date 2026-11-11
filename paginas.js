// Loren Metais, páginas institucionais, carrinho e conta (carregado pelo loren.js). Só reorganiza e estiliza:
// nenhum texto é apagado ou reescrito.
(() => {
  const b = document.body;
  if (b.dataset.lmPag) return;
  b.dataset.lmPag = '1';
  let topoObras = null, obrasApoio = null;  // Obras finalizadas: preenchidos no bloco das obras, usados no cabeçalho (fim do arquivo)
  const temTexto = (e) => e.textContent.replace(/[\s​⠀]/g, '') !== '';

  // institucionais (/pagina/...): texto colado do Word vira coluna de leitura; Obras finalizadas vira grade de cards
  const caixa = b.classList.contains('pagina-pagina') && document.querySelector('#corpo .caixa-sombreada');
  const txt = caixa && caixa.querySelector(':scope > div');
  if (txt) {
    caixa.classList.add('lm-inst');
    caixa.closest('.secao-principal')?.classList.add('lm-sec-inst');  // classe no lugar de :has() (Chrome < 105 e Safari < 15.4 descartam a regra)
    // parágrafo vazio (só espaço) do Word: some, o espaçamento fica por conta do CSS
    txt.querySelectorAll('p, div, h2, h3, h4, font').forEach((p) => { if (!temTexto(p) && !p.querySelector('img, iframe, video, table')) p.classList.add('lm-vazio'); });
    // link sozinho no parágrafo ou título ("Veja esse item", "Voltar para a loja") vira botão secundário da base
    // (nas obras os itens com link continuam link)
    if (!/obras-finalizadas/.test(location.pathname)) txt.querySelectorAll('a').forEach((a) => { const bl = a.closest('p, h2, h3, h4'); if (bl && temTexto(a) && bl.textContent.trim() === a.textContent.trim()) a.classList.add('lm-btn2'); });
    // imagem quebrada do painel (Acessibilidade: "Bancos Articulados"): some com a moldura vazia, em vez do ícone quebrado (Wednesday 09/11)
    const quebrada = (img) => { img.classList.add('lm-vazio'); for (let p = img.parentElement; p && p !== txt && !temTexto(p) && !p.querySelector('img:not(.lm-vazio), iframe, video, table'); p = p.parentElement) p.classList.add('lm-vazio'); };
    txt.querySelectorAll('img').forEach((img) => { if (img.getAttribute('src') && img.complete && !img.naturalWidth) quebrada(img); else img.addEventListener('error', () => quebrada(img)); });
    txt.querySelectorAll('table').forEach((t) => { const w = document.createElement('div'); w.className = 'lm-tab'; t.before(w); w.append(t); });

    // Obras: cada obra começa num parágrafo com texto em 20 px (o nome); depois vêm os itens e as fotos. No padrão da página de
    // obras da Conceito (Wednesday 11/11): cartão com a capa grande, tipo de ambiente, nome, local e os 3 primeiros itens; a capa
    // e o botão abrem a galeria da obra (<dialog>: todas as fotos + o texto inteiro). Topo com mosaico das capas e os números da
    // própria página (topoObras, chamado depois do lmPagcab); no fim, orçamento e WhatsApp. Nenhum texto some: o que não cabe no
    // cartão continua nele (escondido) e aparece na galeria.
    const nome = (p) => p.tagName === 'P' && temTexto(p) && p.querySelector('[style*="20px"]');
    if (/obras-finalizadas/.test(location.pathname) && [...txt.children].some(nome)) {
      caixa.classList.add('lm-obras-pag');
      const grade = document.createElement('div'); grade.className = 'lm-obras';
      let card = null;
      for (const p of [...txt.children]) {
        if (nome(p)) {
          card = document.createElement('article'); card.className = 'lm-obra';
          card.innerHTML = '<button type="button" class="lm-obra-fotos"></button><div class="lm-obra-txt"></div>';
          p.classList.add('lm-obra-nome'); card.lastChild.append(p); grade.append(card); continue;
        }
        if (!card) continue;  // o que vem antes da 1ª obra fica onde está
        p.querySelectorAll('img').forEach((img) => card.firstChild.append(img));
        if (temTexto(p)) card.lastChild.append(p); else p.remove();  // sem texto e já sem foto: era só espaço
      }
      grade.querySelectorAll('.lm-obra-fotos:empty').forEach((f) => { f.parentElement.classList.add('lm-obra--sem-fotos'); f.remove(); });
      txt.append(grade);

      // tipo de ambiente pelo nome da obra; sem palavra conhecida, fica sem etiqueta (nada inventado)
      const TIPOS = [[/escola|emeb/i, 'Escola'], [/hospital|haoc/i, 'Hospital'], [/cl[ií]nica/i, 'Clínicas'], [/esportiv/i, 'Esporte e lazer'], [/\blojas\b/i, 'Varejo'], [/ponto cidad/i, 'Espaço público']];
      const obras = [...grade.children];
      let pecas = 0;
      for (const ob of obras) {
        const nm = ob.querySelector('.lm-obra-nome'), titulo = nm.textContent.trim(), fotos = ob.querySelectorAll('.lm-obra-fotos img');
        // local: o que vem depois do último " - " do nome ("... - Indaiatuba/SP.") desce para a linha de baixo
        const w = document.createTreeWalker(nm, NodeFilter.SHOW_TEXT); let t, ult = null;
        while ((t = w.nextNode())) if (/\s[-–]\s/.test(t.data)) ult = t;  // \s: o Word deixa &nbsp; antes do traço
        if (ult) {
          const sep = ult.splitText(ult.data.search(/\s[-–]\s(?!.*\s[-–]\s)/)), local = sep.splitText(3);
          const s1 = document.createElement('span'); s1.className = 'lm-obra-sep'; sep.before(s1); s1.append(sep);
          const s2 = document.createElement('span'); s2.className = 'lm-obra-local'; local.before(s2); s2.append(local);
          nm.after(s2);  // fora do parágrafo do nome: o nome corta em 2 linhas e o local fica sempre na linha de baixo
        }
        // cartões da mesma altura (Eduardo 11/11): tipo, nome (2 linhas), local e um resumo de 2 linhas com os itens; sem tipo ou
        // sem local, uma linha vazia guarda o lugar (aria-hidden). Os itens ficam no cartão escondidos e aparecem inteiros na galeria
        const vazio = (c) => `<span class="${c} lm-obra-vazio" aria-hidden="true">&nbsp;</span>`;
        if (!ult) nm.insertAdjacentHTML('afterend', vazio('lm-obra-local'));
        ob.dataset.lmNome = titulo.replace(/\s[-–]\s(?!.*\s[-–]\s)/, ', ');
        const tipo = TIPOS.find(([r]) => r.test(titulo))?.[1];
        nm.insertAdjacentHTML('beforebegin', tipo ? `<span class="lm-obra-tipo">${tipo}</span>` : vazio('lm-obra-tipo'));
        const itens = [...ob.querySelectorAll('.lm-obra-txt > p:not(.lm-obra-nome)')];
        itens.forEach((p) => { p.classList.add('lm-obra-mais'); const q = p.textContent.match(/^\s*(\d{1,5})\s+\D/); if (q) pecas += +q[1]; });
        const resumo = document.createElement('p'); resumo.className = 'lm-obra-resumo' + (itens.length ? '' : ' lm-obra-resumo--neutro');
        resumo.textContent = itens.map((p) => p.textContent.trim().replace(/\s+/g, ' ')).join(' · ') || (fotos.length ? 'Ver fotos da obra' : '');
        ob.querySelector('.lm-obra-local').after(resumo);
        if (fotos.length) {
          const capa = ob.querySelector('.lm-obra-fotos');
          capa.setAttribute('aria-label', `Ver as ${fotos.length} fotos da obra ${titulo}`);
          capa.insertAdjacentHTML('beforeend', `<span class="lm-obra-qtd" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="12" cy="12" r="3.5"/></svg>${fotos.length}</span>`);
        }
        if (fotos.length || itens.length) ob.querySelector('.lm-obra-txt').insertAdjacentHTML('beforeend', `<div class="lm-obra-acoes"><button type="button" class="lm-btn2 lm-obra-abrir">Ver a obra${fotos.length ? ` (${fotos.length} fotos)` : ''}</button></div>`);
      }

      // galeria: um <dialog> só (Esc, foco preso e devolvido são do navegador), setas do teclado e arrastar no celular
      const dlg = document.createElement('dialog'); dlg.className = 'lm-galeria'; dlg.setAttribute('aria-labelledby', 'lm-galeria-tit');
      const seta = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}"/></svg>`;
      dlg.innerHTML = `<div class="lm-galeria__midia"><div class="lm-galeria__foto"><img alt=""><button type="button" class="lm-galeria__ant" aria-label="Foto anterior">${seta('M15 5l-7 7 7 7')}</button>
        <button type="button" class="lm-galeria__prox" aria-label="Próxima foto">${seta('M9 5l7 7-7 7')}</button><p class="lm-galeria__cont" aria-live="polite"></p></div>
        <div class="lm-galeria__minis"></div></div><div class="lm-galeria__txt"></div><button type="button" class="lm-galeria__fechar" aria-label="Fechar galeria">${seta('M6 6l12 12M18 6L6 18')}</button>`;
      document.body.append(dlg);
      const grande = dlg.querySelector('.lm-galeria__foto img'), minis = dlg.querySelector('.lm-galeria__minis');
      let fotos = [], at = 0, nomeAt = '', quem = null;
      const mostra = (k) => {
        at = (k + fotos.length) % fotos.length;
        grande.src = fotos[at].currentSrc || fotos[at].src; grande.alt = `${nomeAt}, foto ${at + 1} de ${fotos.length}`;
        dlg.querySelector('.lm-galeria__cont').textContent = `${at + 1} de ${fotos.length}`;
        minis.querySelectorAll('button').forEach((b, i) => b.setAttribute('aria-current', i === at));
        minis.children[at]?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      };
      const abre = (ob, k = 0) => {
        fotos = [...ob.querySelectorAll('.lm-obra-fotos img')]; nomeAt = ob.dataset.lmNome;
        const box = dlg.querySelector('.lm-galeria__txt'); box.replaceChildren(...[...ob.querySelector('.lm-obra-txt').children].filter((e) => !e.matches('.lm-obra-acoes, .lm-obra-resumo, .lm-obra-vazio')).map((e) => e.cloneNode(true)));
        box.querySelector('.lm-obra-nome').id = 'lm-galeria-tit';
        minis.innerHTML = fotos.map((f, i) => `<button type="button" aria-label="Foto ${i + 1}"><img src="${f.currentSrc || f.src}" alt=""></button>`).join('');
        dlg.classList.toggle('lm-galeria--sem-fotos', !fotos.length); dlg.classList.toggle('lm-galeria--uma', fotos.length === 1);
        quem = document.activeElement; dlg.showModal(); document.documentElement.classList.add('lm-galeria-aberta');
        if (fotos.length) mostra(k);
      };
      dlg.addEventListener('close', () => { document.documentElement.classList.remove('lm-galeria-aberta'); quem?.focus(); });
      dlg.addEventListener('click', (e) => {
        if (e.target === dlg || e.target.closest('.lm-galeria__fechar')) dlg.close();
        else if (e.target.closest('.lm-galeria__ant')) mostra(at - 1);
        else if (e.target.closest('.lm-galeria__prox')) mostra(at + 1);
        else if (e.target.closest('.lm-galeria__minis button')) mostra([...minis.children].indexOf(e.target.closest('button')));
      });
      dlg.addEventListener('keydown', (e) => { if (fotos.length > 1 && /^Arrow(Left|Right)$/.test(e.key) && !e.target.closest('a')) { e.preventDefault(); mostra(at + (e.key === 'ArrowRight' ? 1 : -1)); } });
      let x0 = null; const foto = dlg.querySelector('.lm-galeria__foto');
      foto.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
      foto.addEventListener('touchend', (e) => { const dx = e.changedTouches[0].clientX - x0; if (x0 !== null && fotos.length > 1 && Math.abs(dx) > 40) mostra(at + (dx < 0 ? 1 : -1)); x0 = null; });
      grade.addEventListener('click', (e) => { const b = e.target.closest('.lm-obra-fotos, .lm-obra-abrir'); if (b) abre(b.closest('.lm-obra')); });

      // fim da página: orçamento (o formulário do topo do site) e WhatsApp, fora do texto do Word
      caixa.insertAdjacentHTML('beforeend', `<section class="lm-b2b lm-obras-cta"><div class="lm-wrap"><div><h2>Tem uma obra para equipar?</h2><p>Mande a lista de itens e receba preço especial de fábrica, com nota fiscal e prazo de entrega.</p></div>
        <div class="lm-acs"><a class="lm-btn" href="#" data-toggle="modal" data-target="#modal_consulte">Pedir orçamento</a><a class="lm-btn2" href="https://wa.me/5519992306593?text=${encodeURIComponent('Olá! Vi as obras finalizadas no site da Loren Metais e gostaria de um orçamento para a minha obra.')}" target="_blank" rel="noopener">Falar no WhatsApp</a></div></div></section>`);

      // topo (depois do lmPagcab): frase curta, mosaico com as capas e os números tirados da própria página
      topoObras = (cab) => {
        cab.classList.add('lm-pagcab--obras');
        const capas = obras.map((o) => o.querySelector('.lm-obra-fotos img')).filter(Boolean).slice(0, 3);
        cab.insertAdjacentHTML('afterbegin', `<div class="lm-obras-mosaico" aria-hidden="true">${capas.map((c) => `<img src="${c.currentSrc || c.src}" alt="">`).join('')}</div>`);
        cab.querySelector('.lm-pagcab__in').insertAdjacentHTML('beforeend', `<ul class="lm-obras-num"><li><b>${obras.length}</b> obras finalizadas</li>${pecas ? `<li><b>+${pecas.toLocaleString('pt-BR')}</b> peças fornecidas</li>` : ''}</ul>`);
      };
      obrasApoio = document.createElement('p'); obrasApoio.textContent = 'Escolas, hospitais, clínicas e espaços públicos equipados com nossas barras de apoio, torneiras e dispensers.';
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
        // selos: o mesmo componente do rodapé e do carrinho (window.lmSelo, SVG), não os PNG do tema (Eduardo 09/11)
        if (bloco.matches('.selos') && window.lmSelo) { ul.classList.add('lm-selos--novo'); ul.innerHTML = `<li>${window.lmSelo('ssl')}</li><li>${window.lmSelo('google')}</li>`; }
        else bloco.querySelectorAll('i.icone-pagamento, img').forEach((x) => {
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
  document.querySelectorAll('body.pagina-carrinho .tabela-carrinho .quantidade input[name=quantidade]').forEach((i) => { window.lmQtd?.(i); const q = i.closest('.quantidade'); if (q?.querySelector('.lm-qtd')) q.classList.add('lm-com-qtd'); });
  // "Continuar comprando" vinha com o estilo do tema (texto fino, borda preta): vira o botão de contorno do site (Maestro 09/11)
  document.querySelectorAll('body.pagina-carrinho .acao-editar .botao:not(.principal)').forEach((a) => a.classList.add('lm-btn2'));
  // selo SSL: o mesmo componente do rodapé (window.lmSelo do loren.js, SVG inline), no lugar do PNG do tema (Eduardo 09/11)
  document.querySelectorAll('body.pagina-carrinho .acao-editar > .selo-ssl').forEach((s) => { s.parentElement.classList.add('lm-com-selo'); if (window.lmSelo) s.innerHTML = window.lmSelo('ssl'); });

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
    const cab = window.lmPagcab(h1, { apoio: obrasApoio || apoio || undefined, leitura: !!h1.closest('.lm-inst:not(.lm-obras-pag)') });
    if (cab && topoObras) topoObras(cab);
  }
})();
