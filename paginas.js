// Loren Metais, páginas institucionais, carrinho e conta (carregado pelo loren.js). Só reorganiza e estiliza:
// nenhum texto é apagado ou reescrito (exceção: Quem somos, resumida a pedido do Eduardo; o texto do painel fica no HTML).
(() => {
  const b = document.body;
  if (b.dataset.lmPag) return;
  b.dataset.lmPag = '1';
  let topo = null, apoioFixo = null;  // Obras finalizadas e Quem somos: preenchidos no bloco de cada uma, usados no cabeçalho (fim do arquivo)
  const temTexto = (e) => e.textContent.replace(/[\s​⠀]/g, '') !== '';
  // faixa final das Obras e da Quem somos (Eduardo 16/11): degradê da marca com as 3 ondas do ícone (CSS), texto à esquerda e os botões
  // com ícone à direita (WhatsApp, o mesmo do chat do loren.js; documento, Lucide file-text). waPrimeiro: o WhatsApp é o botão principal
  const faixa = (titulo, texto, msg, waPrimeiro) => {
    const ic = (vb, d, extra = '') => `<svg viewBox="${vb}" aria-hidden="true"${extra}>${d}</svg>`;
    const wa = `<a class="${waPrimeiro ? 'lm-btn' : 'lm-btn2'}" href="https://wa.me/5519992306593?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener">${ic('0 0 32 32', '<path fill="currentColor" d="M16.004 2.667c-7.363 0-13.333 5.97-13.333 13.333 0 2.353.615 4.646 1.782 6.667L2.667 29.333l6.822-1.79a13.27 13.27 0 0 0 6.515 1.72h.006c7.363 0 13.333-5.97 13.333-13.333s-5.97-13.263-13.339-13.263Zm0 24.4h-.005a11.06 11.06 0 0 1-5.635-1.542l-.404-.24-4.05 1.062 1.082-3.95-.264-.406a11.04 11.04 0 0 1-1.694-5.87c0-6.11 4.973-11.084 11.09-11.084 2.964 0 5.75 1.156 7.844 3.253a11.02 11.02 0 0 1 3.245 7.84c-.002 6.112-4.976 11.087-11.11 11.087Zm6.083-8.302c-.334-.167-1.975-.975-2.28-1.086-.306-.111-.529-.167-.751.167-.223.334-.863 1.086-1.058 1.309-.195.223-.39.25-.723.083-.334-.167-1.409-.52-2.684-1.657-.992-.885-1.663-1.978-1.858-2.312-.195-.334-.02-.514.146-.68.15-.15.334-.39.5-.585.167-.195.223-.334.334-.556.111-.223.056-.417-.028-.584-.083-.167-.751-1.81-1.029-2.479-.271-.65-.546-.563-.751-.573-.195-.01-.417-.012-.64-.012-.223 0-.584.083-.89.417-.306.334-1.168 1.14-1.168 2.782 0 1.642 1.196 3.229 1.362 3.452.167.223 2.354 3.596 5.706 5.043.797.344 1.42.55 1.905.704.8.255 1.529.219 2.104.133.642-.096 1.975-.808 2.253-1.587.278-.78.278-1.448.195-1.587-.083-.14-.306-.223-.64-.39Z"/>')}${waPrimeiro ? 'Fale com a gente no WhatsApp' : 'Falar no WhatsApp'}</a>`;
    const orc = `<a class="${waPrimeiro ? 'lm-btn2' : 'lm-btn'}" href="#" data-toggle="modal" data-target="#modal_consulte">${ic('0 0 24 24', '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>', ' fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"')}Pedir orçamento</a>`;
    return `<section class="lm-b2b lm-obras-cta lm-faixa-cta"><div class="lm-wrap"><div><h2>${titulo}</h2><p>${texto}</p></div><div class="lm-acs">${waPrimeiro ? wa + orc : orc + wa}</div></div></section>`;
  };

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
    // própria página (topo, chamado depois do lmPagcab); no fim, orçamento e WhatsApp. Nenhum texto some: o que não cabe no
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
          fotos.forEach((f) => f.setAttribute('alt', ''));   // o botão já diz o que é; foto sem alt o leitor lê pelo nome do arquivo (Wednesday 12/11)
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
      caixa.insertAdjacentHTML('beforeend', faixa('Tem uma obra para equipar?', 'Mande a lista de itens e receba preço especial de fábrica, com nota fiscal e prazo de entrega.', 'Olá! Vi as obras finalizadas no site da Loren Metais e gostaria de um orçamento para a minha obra.', false));

      // topo (depois do lmPagcab): frase curta, mosaico com as capas e os números tirados da própria página
      topo = (cab) => {
        cab.classList.add('lm-pagcab--obras');
        const capas = obras.map((o) => o.querySelector('.lm-obra-fotos img')).filter(Boolean).slice(0, 3);
        cab.insertAdjacentHTML('afterbegin', `<div class="lm-obras-mosaico" aria-hidden="true">${capas.map((c) => `<img src="${c.currentSrc || c.src}" alt="">`).join('')}</div>`);
        cab.querySelector('.lm-pagcab__in').insertAdjacentHTML('beforeend', `<ul class="lm-obras-num"><li><b>${obras.length}</b> obras finalizadas</li>${pecas ? `<li><b>+${pecas.toLocaleString('pt-BR')}</b> peças fornecidas</li>` : ''}</ul>`);
      };
      apoioFixo = document.createElement('p'); apoioFixo.textContent = 'Escolas, hospitais, clínicas e espaços públicos equipados com nossas barras de apoio, torneiras e dispensers.';
    }

    // Quem somos: o 1º parágrafo vira lead (maior), o resto segue na coluna de leitura (Ellie 04/11)
    const primeiro = () => [...txt.children].find((e) => !e.classList.contains('lm-vazio'));
    if (/quem-somos/.test(location.pathname) && primeiro()?.tagName === 'P') primeiro().classList.add('lm-lead');
    // Quem somos visual (Eduardo 16/11, Wednesday): topo escuro das Obras com a frase principal e uma foto REAL de obra, "O que fazemos"
    // em cartões, os diferenciais e a chamada final. Sem número nem fato novo: só o texto do painel e o que o site já afirma (barra do topo,
    // vantagens e "Quem somos" da home, NBR 9050 nas fichas). A foto é a 1ª imagem do texto do painel (o Eduardo cola uma das Obras
    // finalizadas); sem foto, o topo fica só com o texto. Só liga enquanto o texto do painel é o de hoje: se ele for reescrito, a página
    // volta à coluna de leitura com o texto novo. O texto do painel fica no HTML (escondido); o resumo dele está nas seções.
    const ico = (d) => `<span class="lm-ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg></span>`;
    const FAZ = [  // "O que fazemos" da Quem somos (também na Agradecemos): ícone (Lucide), título, texto, link, texto do link
      ['<circle cx="16" cy="4" r="1"/><path d="m18 19 1-7-6 1"/><path d="m5 8 3-3 5.5 3-2.36 3.5"/><path d="M4.24 14.5a5 5 0 0 0 6.88 6"/><path d="M13.76 17.5a5 5 0 0 0-6.88-6"/>', 'Banheiros acessíveis', 'Barras de apoio, assentos e torneiras para banheiros PNE.', '/acessibilidade', 'Ver acessibilidade'],
      ['<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M8 12h8"/><path d="M12 8v8"/>', 'Clínicas e hospitais', 'Torneiras clínicas, misturadores e a linha hospitalar.', '/hospitalar', 'Ver linha hospitalar'],
      ['<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>', 'Escolas', 'Torneiras automáticas, dispensers e barras de apoio para os banheiros.', '/pagina/obras-finalizadas.html', 'Ver escolas equipadas'],
      ['<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>', 'Cozinhas', 'Torneiras para cozinha e de pré-lavagem.', '/torneiras-para-cozinha', 'Ver torneiras para cozinha'],
    ];
    const fazCards = () => `<div class="lm-qs-cards">${FAZ.map(([d, t, p, href, ver]) => `<a class="lm-qs-card" href="${href}">${ico(d)}<h3>${t}</h3><p>${p}</p><span class="lm-qs-ver">${ver}</span></a>`).join('')}</div>`;
    if (/quem-somos/.test(location.pathname) && /^\s*A Lorenmetais é uma empresa/i.test(txt.textContent)) {
      caixa.classList.add('lm-qs-pag');
      const foto = txt.querySelector('img');
      const DIF = [
        ['<path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M17 18h1"/><path d="M12 18h1"/><path d="M7 18h1"/>', 'Direto da fábrica', 'Fabricamos e representamos: preço de fábrica, sem intermediário.'],
        ['<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>', 'Normas de acessibilidade', 'Linha PNE com produtos conforme a NBR 9050.'],
        ['<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>', 'Envio para todo o Brasil', 'Para a sua obra, empresa ou casa.'],
        ['<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>', 'Despacho ágil', 'Em Indaiatuba (SP), perto do Aeroporto de Viracopos e de transportadoras.'],
        ['<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>', 'Atendimento pelo WhatsApp', 'Fale direto com a fábrica.'],
      ];
      txt.hidden = true;
      txt.insertAdjacentHTML('afterend', `<p class="lm-qs-intro">Desenvolvemos, fabricamos e representamos produtos para que o seu negócio, obra ou casa fique dentro das normas de segurança, com higiene segura para clientes e equipe.</p>
        <section class="lm-qs-sec" aria-labelledby="lm-qs-faz"><h2 id="lm-qs-faz">O que fazemos</h2>${fazCards()}</section>
        <section class="lm-qs-sec" aria-labelledby="lm-qs-dif"><h2 id="lm-qs-dif">Por que comprar com a Loren</h2><ul class="lm-qs-dif">${DIF.map(([d, t, p]) => `<li>${ico(d)}<p><b>${t}</b><span>${p}</span></p></li>`).join('')}</ul></section>
        ${faixa('Precisa equipar um banheiro, clínica ou escola?', 'Tire as suas dúvidas, mande a lista de itens ou peça um orçamento.', 'Olá! Vim pela página Quem Somos do site da Loren Metais e gostaria de falar com vocês.', true)}`);
      topo = (cab) => {   // o mesmo topo escuro das Obras, com a foto no lugar do mosaico
        cab.classList.add('lm-pagcab--obras', 'lm-pagcab--qs');
        if (foto) cab.insertAdjacentHTML('afterbegin', `<div class="lm-obras-mosaico lm-qs-foto" aria-hidden="true"><img src="${foto.currentSrc || foto.src}" alt=""></div>`);
      };
      apoioFixo = document.createElement('p'); apoioFixo.textContent = 'Produtos de acessibilidade para banheiros, clínicas, hospitais, escolas e cozinhas.';
    }

    // Formas de pagamento visual (Maestro 16/11, Ellie): o mesmo topo escuro da Quem somos, os meios em cartões, o passo a passo do painel
    // resumido, os selos e a faixa final. Os meios saem do "Pague com" do rodapé, que a LI monta com o que está ativo (a Stone saiu em
    // 10/11 e o rodapé mudou junto): nada de parcela, juros ou desconto escrito aqui, o produto e o checkout mostram. A arte do painel
    // (PagSeguro, PayPal) fica escondida com o texto. Só liga enquanto o texto do painel é o de hoje; se for reescrito, volta a grade de selos.
    const MEIOS = { pix: 'Pix', visa: 'Visa', mastercard: 'Mastercard', elo: 'Elo', amex: 'American Express', diners: 'Diners Club', hipercard: 'Hipercard', boleto: 'Boleto', mercadopago: 'Mercado Pago' };
    const meios = new Set();
    document.querySelectorAll('#rodape .pagamento .icone-pagamento').forEach((i) => meios.add([...i.classList].find((c) => c !== 'icone-pagamento')));
    document.querySelectorAll('#rodape .pagamento .gateways-rodape img').forEach((img) => meios.add(/boleto/.test(img.className) ? 'boleto' : /pix/.test(img.className) ? 'pix' : /mercadopago/.test(img.className) ? 'mercadopago' : ''));
    document.querySelectorAll('#rodape .lm-pag li[title]').forEach((li) => meios.add(Object.keys(MEIOS).find((k) => MEIOS[k] === li.title)));  // rodapé já trocado pelo loren.js
    const bandeiras = ['visa', 'mastercard', 'elo', 'amex', 'diners', 'hipercard'].filter((k) => meios.has(k)).map((k) => MEIOS[k]);
    if (/formas-de-pagamento/.test(location.pathname) && /^\s*1\s*[º°o]?\.?\s*Passo\W+Escolha o produto/i.test(primeiro()?.textContent || '') && meios.size) {
      caixa.classList.add('lm-fp-pag');
      const CARTOES = [  // chave no rodapé, ícone (Lucide), título, texto
        ['pix', '<rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/>', 'Pix', 'Escolha Pix ao finalizar o pedido e pague pelo app do seu banco.'],
        [bandeiras.length && 'cartao', '<rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>', 'Cartão de crédito', `${bandeiras.join(', ').replace(/, ([^,]*)$/, ' e $1')}. As parcelas aparecem em cada produto e no checkout.`],
        ['boleto', '<path d="M3 5v14"/><path d="M8 5v14"/><path d="M12 5v14"/><path d="M17 5v14"/><path d="M21 5v14"/>', 'Boleto bancário', 'Gerado ao finalizar o pedido, para pagar no app do banco ou em lotérica.'],
        ['mercadopago', '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>', 'Mercado Pago', 'Escolha Mercado Pago ao finalizar o pedido.'],
      ].filter(([k]) => k === 'cartao' || meios.has(k));
      const PASSOS = [  // o passo a passo do painel, resumido
        ['Escolha o produto', 'Clique na imagem ou em Adicionar. Dúvida sobre o produto? Consulte-nos.'],
        ['Veja os detalhes', 'A página do produto traz as informações técnicas.'],
        ['Coloque no carrinho', 'Defina a quantidade. Finalize a compra ou continue comprando.'],
        ['Preencha os seus dados', 'Cadastro e endereço de entrega.'],
        ['Escolha a entrega', 'Uma das opções de forma de entrega.'],
        ['Escolha o pagamento', 'Entre as opções acima, a que for melhor para você.'],
        ['Acompanhe o pedido', 'Você recebe o número do pedido e acompanha tudo pela sua conta no site.'],
      ];
      txt.hidden = true;
      txt.insertAdjacentHTML('afterend', `<section class="lm-qs-sec" aria-labelledby="lm-fp-meios"><h2 id="lm-fp-meios">Como você pode pagar</h2><div class="lm-qs-cards">${CARTOES.map(([, d, t, p]) => `<div class="lm-qs-card">${ico(d)}<h3>${t}</h3><p>${p}</p></div>`).join('')}</div></section>
        <section class="lm-qs-sec" aria-labelledby="lm-fp-passos"><h2 id="lm-fp-passos">Como comprar, passo a passo</h2><ol class="lm-fp-passos">${PASSOS.map(([t, p]) => `<li><p><b>${t}</b><span>${p}</span></p></li>`).join('')}</ol></section>
        ${window.lmSelo ? `<section class="lm-qs-sec" aria-labelledby="lm-fp-seg"><h2 id="lm-fp-seg">Compra segura</h2><ul class="lm-fp-selos"><li>${window.lmSelo('ssl')}</li><li>${window.lmSelo('google')}</li></ul></section>` : ''}
        ${faixa('Ficou com alguma dúvida sobre o pagamento?', 'Fale com a gente pelo WhatsApp ou pelo e-mail vendas@lorenmetais.com.br.', 'Olá! Vim pela página Formas de Pagamento do site da Loren Metais e tenho uma dúvida sobre o pagamento.', true)}`);
      topo = (cab) => cab.classList.add('lm-pagcab--obras', 'lm-pagcab--qs');
      apoioFixo = document.createElement('p');
      apoioFixo.textContent = `Pague com ${CARTOES.map(([, , t]) => t.replace(/^(Cartão|Boleto)/, (m) => m.toLowerCase())).join(', ').replace(/, ([^,]*)$/, ' ou $1')}.`;
    }

    // Instalação de barras de apoio visual (Eduardo 17/11, Ellie): o texto do painel é só o título e os 3 desenhos de medidas. Topo escuro
    // da Quem somos, cada desenho num cartão com a legenda que o próprio desenho traz (vistas, áreas de aproximação; sem citar norma) e um
    // link para abrir o desenho inteiro (no celular as cotas ficam pequenas), e a faixa. Só liga com o painel de hoje (o título e 3 desenhos).
    const desenhos = [...txt.querySelectorAll('img')];
    if (/instalacao-barras-de-apoio/.test(location.pathname) && /^Instalação Barras de Apoio$/i.test(txt.textContent.trim()) && desenhos.length === 3) {
      caixa.classList.add('lm-qs-pag', 'lm-inst-pag');
      const LEG = ['Vista lateral direita, vista frontal e vista lateral esquerda', 'Vista lateral direita, vista frontal e vista lateral esquerda', 'Áreas de aproximação para PMR e para PCD'];
      txt.hidden = true;
      txt.insertAdjacentHTML('afterend', `<section class="lm-qs-sec" aria-labelledby="lm-inst-des"><h2 id="lm-inst-des">Desenhos de instalação</h2><div class="lm-inst-figs">${desenhos.map((d, i) => `<figure class="lm-inst-fig"><a href="${d.src}" target="_blank" rel="noopener"><img src="${d.src}" alt="Desenho ${i + 1}: ${LEG[i].toLowerCase()}, com as medidas em metros"></a><figcaption><b>Desenho ${i + 1}</b>${LEG[i]}. <a href="${d.src}" target="_blank" rel="noopener">Ampliar o desenho ${i + 1}</a></figcaption></figure>`).join('')}</div></section>
        ${faixa('Ficou com alguma dúvida na instalação?', 'Fale com a gente pelo WhatsApp ou peça um orçamento das barras de apoio.', 'Olá! Vim pela página Instalação de Barras de Apoio do site da Loren Metais e tenho uma dúvida.', true)}`);
      topo = (cab) => cab.classList.add('lm-pagcab--obras', 'lm-pagcab--qs');
      apoioFixo = document.createElement('p'); apoioFixo.textContent = 'Medidas de referência para instalar barras de apoio junto à bacia sanitária. Dimensões em metros.';
    }

    // Acessibilidade visual (Eduardo 17/11, Ellie): topo escuro, a abertura do painel resumida e os produtos do painel em cartões (foto, nome,
    // o 1º parágrafo e o link "Veja esse item" do próprio painel). Os cartões saem do texto (cada <h3> abre um produto), então um item novo
    // no painel vira cartão sozinho; foto quebrada (3 no painel hoje) sai do cartão. Só liga enquanto a abertura do painel é a de hoje.
    if (/\/pagina\/acessibilidade\.html/.test(location.pathname) && /^\s*Alcance o público PcD[\s\S]*A acessibilidade deve ser indispensável para ambientes que possuem alto fluxo de pessoas/i.test(txt.textContent)) {
      const itens = [...txt.querySelectorAll('h3')].map((h) => {
        const it = { nome: h.textContent.trim().replace(/^\d+\.\s*/, '') };
        for (let e = h.nextElementSibling; e && e.tagName !== 'H3'; e = e.nextElementSibling) {
          const img = e.querySelector('img'), a = e.querySelector('a[href]');
          if (img) it.foto ??= img.src; else if (a) it.link ??= a.href; else if (e.tagName === 'P' && temTexto(e)) it.texto ??= e.textContent.trim().replace(/\s+/g, ' ');
        }
        return it;
      }).filter((it) => it.link);
      if (itens.length) {
        caixa.classList.add('lm-qs-pag', 'lm-acs-pag');
        txt.hidden = true;
        txt.insertAdjacentHTML('afterend', `<p class="lm-qs-intro">Hospitais, clínicas, salas comerciais e restaurantes devem garantir banheiros acessíveis para pessoas com deficiência ou dificuldade de locomoção. A NBR 9050 estabelece o número de sanitários PNE de acordo com o fluxo de pessoas.</p>
          <section class="lm-qs-sec" aria-labelledby="lm-acs-prod"><h2 id="lm-acs-prod">Conheça os nossos produtos</h2><div class="lm-qs-cards lm-acs-cards">${itens.map((it) => `<a class="lm-qs-card" href="${it.link}">${it.foto ? `<span class="lm-acs-foto"><img src="${it.foto}" alt=""></span>` : ''}<h3>${it.nome}</h3>${it.texto ? `<p>${it.texto}</p>` : ''}<span class="lm-qs-ver">Veja esse item</span></a>`).join('')}</div></section>
          ${faixa('Vai equipar um banheiro acessível?', 'Mande a lista de itens e receba preço especial de fábrica, com nota fiscal e prazo de entrega.', 'Olá! Vim pela página Acessibilidade do site da Loren Metais e gostaria de um orçamento.', false)}`);
        caixa.querySelectorAll('.lm-acs-foto img').forEach((img) => { const fora = () => img.parentElement.remove(); if (img.complete && !img.naturalWidth) fora(); else img.addEventListener('error', fora); });
        topo = (cab) => cab.classList.add('lm-pagcab--obras', 'lm-pagcab--qs');
      }
    }

    // Agradecemos o seu contato (para onde o formulário de contato leva; Eduardo 17/11, Ellie): a confirmação no topo escuro com o "Voltar
    // para a loja" do painel, os cartões "O que fazemos" da Quem somos e a faixa do WhatsApp. Só liga enquanto o texto do painel é o de hoje.
    const voltar = txt.querySelector('a[href]');
    if (/agradecemos-o-seu-contato/.test(location.pathname) && voltar && /^\s*Agradecemos o seu contato!\s*Recebemos o seu pedido e em breve retornaremos o seu contato\.\s*Voltar para a loja\s*$/i.test(txt.textContent)) {
      caixa.classList.add('lm-qs-pag', 'lm-agr-pag');
      txt.hidden = true;
      txt.insertAdjacentHTML('afterend', `<section class="lm-qs-sec" aria-labelledby="lm-agr-faz"><h2 id="lm-agr-faz">Enquanto isso, conheça a Loren</h2>${fazCards()}</section>
        ${faixa('Precisa de uma resposta mais rápida?', 'Fale direto com a fábrica pelo WhatsApp.', 'Olá! Acabei de enviar um contato pelo site da Loren Metais e gostaria de falar com vocês.', true)}`);
      topo = (cab) => { cab.classList.add('lm-pagcab--obras', 'lm-pagcab--qs'); cab.querySelector('.lm-pagcab__in').insertAdjacentHTML('beforeend', `<p class="lm-agr-acoes"><a class="lm-btn" href="${voltar.href}">Voltar para a loja</a></p>`); };
      apoioFixo = document.createElement('p'); apoioFixo.textContent = 'Recebemos o seu pedido e em breve retornaremos o seu contato.';
    }

    // Páginas de termos (Eduardo 17/11, Ellie): Segurança e privacidade, Políticas de troca e as do mesmo tipo. O texto do painel fica
    // inteiro, na coluna de leitura, com o topo escuro e a faixa; o subtítulo do Word (parágrafo curto todo em negrito) vira título de
    // verdade e, com 3 ou mais, entra um sumário com âncoras. "Última atualização": a LI não guarda a data de edição, então ela vem da
    // tabela DATAS (a data que o Eduardo der + a impressão do texto daquele dia); se o texto do painel mudar, a impressão não bate e a data
    // some, para nunca mostrar data errada.
    const DATAS = {  // página: [impressão do texto, data]
      'seguranca-e-privacidade': ['1akwr4z', null],
      'politicas-de-troca-devolucao-e-reembolso': ['igo4vb', null],
    };
    const termo = location.pathname.match(/\/pagina\/((?:seguranca|privacidade|politica|termo)[\w-]*)\.html/)?.[1];
    if (termo) {
      const imp = (s) => { let h = 2166136261; for (const c of s.replace(/\s+/g, ' ').trim()) h = Math.imul(h ^ c.codePointAt(0), 16777619) >>> 0; return h.toString(36); };
      const [assinatura, data] = DATAS[termo] || [], hoje = imp(txt.textContent);
      caixa.classList.add('lm-termos-pag'); txt.classList.add('lm-termos');
      const p1 = primeiro(), negrito = (e) => { const b = [...e.querySelectorAll('strong, b')].map((x) => x.textContent).join(''); return b.trim() && b.replace(/\s/g, '') === e.textContent.replace(/\s/g, ''); };
      const tits = [...txt.querySelectorAll(':scope > p')].filter((p) => p !== p1 && negrito(p) && p.textContent.trim().length <= 80 && !p.querySelector('a, img')).map((p, i) => {
        const h = document.createElement('h2'); h.id = `lm-termo-${i + 1}`; h.append(...p.childNodes); p.replaceWith(h); return h;
      });
      if (tits.length >= 3) tits[0].insertAdjacentHTML('beforebegin', `<nav class="lm-termos-sumario" aria-labelledby="lm-termos-sum"><p id="lm-termos-sum">Nesta página</p><ol>${tits.map((h) => `<li><a href="#${h.id}">${h.textContent.trim().replace(/:$/, '')}</a></li>`).join('')}</ol></nav>`);
      txt.insertAdjacentHTML('afterend', faixa('Ficou com alguma dúvida?', 'Fale com a gente pelo WhatsApp ou pelo e-mail vendas@lorenmetais.com.br.', 'Olá! Vim pelo site da Loren Metais e tenho uma dúvida sobre as políticas da loja.', true));
      topo = (cab) => {   // a data vai no topo, embaixo do título e da linha de apoio (no texto ela tomaria o lugar do 1º parágrafo, que vira o apoio)
        cab.classList.add('lm-pagcab--obras', 'lm-pagcab--qs');
        if (data && assinatura === hoje) cab.querySelector('.lm-pagcab__in').insertAdjacentHTML('beforeend', `<p class="lm-termos-data">Última atualização: ${data}</p>`);
      };
    }

    // Formas de pagamento: a arte da página (Slide1) é uma imagem só, com os selos dentro. Os selos separados que o site
    // já tem ficam no rodapé ("Pague com" e "Selos"): uma cópia deles entra numa grade antes da arte, que continua igual
    if (/formas-de-pagamento/.test(location.pathname) && !caixa.classList.contains('lm-fp-pag') && !txt.querySelector('.lm-selos-pag')) {
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
    const cab = window.lmPagcab(h1, { apoio: apoioFixo || apoio || undefined, leitura: !!h1.closest('.lm-inst:not(.lm-obras-pag, .lm-qs-pag, .lm-fp-pag)') });
    if (cab && topo) topo(cab);
  }
})();
