// Loren Metais, páginas institucionais, carrinho e conta (carregado pelo loren.js). Só reorganiza e estiliza:
// nenhum texto é apagado ou reescrito (exceção: Quem somos, resumida a pedido do Eduardo; o texto do painel fica no HTML).
(() => {
  const b = document.body;
  if (b.dataset.lmPag) return;
  b.dataset.lmPag = '1';
  let topo = null, apoioFixo = null;  // Obras finalizadas e Quem somos: preenchidos no bloco de cada uma, usados no cabeçalho (fim do arquivo)
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
      caixa.insertAdjacentHTML('beforeend', `<section class="lm-b2b lm-obras-cta"><div class="lm-wrap"><div><h2>Tem uma obra para equipar?</h2><p>Mande a lista de itens e receba preço especial de fábrica, com nota fiscal e prazo de entrega.</p></div>
        <div class="lm-acs"><a class="lm-btn" href="#" data-toggle="modal" data-target="#modal_consulte">Pedir orçamento</a><a class="lm-btn2" href="https://wa.me/5519992306593?text=${encodeURIComponent('Olá! Vi as obras finalizadas no site da Loren Metais e gostaria de um orçamento para a minha obra.')}" target="_blank" rel="noopener">Falar no WhatsApp</a></div></div></section>`);

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
    if (/quem-somos/.test(location.pathname) && /^\s*A Lorenmetais é uma empresa/i.test(txt.textContent)) {
      caixa.classList.add('lm-qs-pag');
      const foto = txt.querySelector('img');
      const ico = (d) => `<span class="lm-ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg></span>`;
      const WA = `https://wa.me/5519992306593?text=${encodeURIComponent('Olá! Vim pela página Quem Somos do site da Loren Metais e gostaria de falar com vocês.')}`;
      const FAZ = [  // ícone (Lucide), título, texto, link, texto do link
        ['<circle cx="16" cy="4" r="1"/><path d="m18 19 1-7-6 1"/><path d="m5 8 3-3 5.5 3-2.36 3.5"/><path d="M4.24 14.5a5 5 0 0 0 6.88 6"/><path d="M13.76 17.5a5 5 0 0 0-6.88-6"/>', 'Banheiros acessíveis', 'Barras de apoio, assentos e torneiras para banheiros PNE.', '/acessibilidade', 'Ver acessibilidade'],
        ['<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M8 12h8"/><path d="M12 8v8"/>', 'Clínicas e hospitais', 'Torneiras clínicas, misturadores e a linha hospitalar.', '/hospitalar', 'Ver linha hospitalar'],
        ['<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>', 'Escolas', 'Torneiras automáticas, dispensers e barras de apoio para os banheiros.', '/pagina/obras-finalizadas.html', 'Ver escolas equipadas'],
        ['<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>', 'Cozinhas', 'Torneiras para cozinha e de pré-lavagem.', '/torneiras-para-cozinha', 'Ver torneiras para cozinha'],
      ];
      const DIF = [
        ['<path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M17 18h1"/><path d="M12 18h1"/><path d="M7 18h1"/>', 'Direto da fábrica', 'Fabricamos e representamos: preço de fábrica, sem intermediário.'],
        ['<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>', 'Normas de acessibilidade', 'Linha PNE com produtos conforme a NBR 9050.'],
        ['<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>', 'Envio para todo o Brasil', 'Para a sua obra, empresa ou casa.'],
        ['<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>', 'Despacho ágil', 'Em Indaiatuba (SP), perto do Aeroporto de Viracopos e de transportadoras.'],
        ['<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>', 'Atendimento pelo WhatsApp', 'Fale direto com a fábrica.'],
      ];
      txt.hidden = true;
      txt.insertAdjacentHTML('afterend', `<p class="lm-qs-intro">Desenvolvemos, fabricamos e representamos produtos para que o seu negócio, obra ou casa fique dentro das normas de segurança, com higiene segura para clientes e equipe.</p>
        <section class="lm-qs-sec" aria-labelledby="lm-qs-faz"><h2 id="lm-qs-faz">O que fazemos</h2><div class="lm-qs-cards">${FAZ.map(([d, t, p, href, ver]) => `<a class="lm-qs-card" href="${href}">${ico(d)}<h3>${t}</h3><p>${p}</p><span class="lm-qs-ver">${ver}</span></a>`).join('')}</div></section>
        <section class="lm-qs-sec" aria-labelledby="lm-qs-dif"><h2 id="lm-qs-dif">Por que comprar com a Loren</h2><ul class="lm-qs-dif">${DIF.map(([d, t, p]) => `<li>${ico(d)}<p><b>${t}</b><span>${p}</span></p></li>`).join('')}</ul></section>
        <section class="lm-b2b lm-obras-cta lm-qs-cta"><div class="lm-wrap"><div><h2>Precisa equipar um banheiro, clínica ou escola?</h2><p>Tire as suas dúvidas, mande a lista de itens ou peça um orçamento.</p></div>
        <div class="lm-acs"><a class="lm-btn" href="${WA}" target="_blank" rel="noopener">Fale com a gente no WhatsApp</a><a class="lm-btn2" href="#" data-toggle="modal" data-target="#modal_consulte">Pedir orçamento</a></div></div></section>`);
      topo = (cab) => {   // o mesmo topo escuro das Obras, com a foto no lugar do mosaico
        cab.classList.add('lm-pagcab--obras', 'lm-pagcab--qs');
        if (foto) cab.insertAdjacentHTML('afterbegin', `<div class="lm-obras-mosaico lm-qs-foto" aria-hidden="true"><img src="${foto.currentSrc || foto.src}" alt=""></div>`);
      };
      apoioFixo = document.createElement('p'); apoioFixo.textContent = 'Produtos de acessibilidade para banheiros, clínicas, hospitais, escolas e cozinhas.';
    }

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
    const cab = window.lmPagcab(h1, { apoio: apoioFixo || apoio || undefined, leitura: !!h1.closest('.lm-inst:not(.lm-obras-pag, .lm-qs-pag)') });
    if (cab && topo) topo(cab);
  }
})();
