// Loren Metais, página de produto (carregado pelo loren.js em body.pagina-produto). Só reorganiza o que a página tem:
// trilha acima de tudo, galeria com setas, zoom e carrossel no celular, um só chamado de cotação no sob consulta, frete
// abaixo do Adicionar, selos curtos (as frases da barra do topo). Nada de texto da página é mudado.
(() => {
  if (!document.body.classList.contains('pagina-produto')) return;
  const ico = (d) => `<span class="lm-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg></span>`;
  const go = () => {
    const topo = document.querySelector('.pagina-produto .produto > .row-fluid');
    if (!topo || topo.classList.contains('lm-prod-topo')) return;
    topo.classList.add('lm-prod-topo');
    const [gal, compra] = topo.querySelectorAll(':scope > .span6');
    gal?.classList.add('lm-prod-gal'); compra?.classList.add('lm-prod-compra');

    // trilha acima da galeria e da caixa, como nas outras páginas
    document.querySelectorAll('.pagina-produto .info-principal-produto .breadcrumbs').forEach((t) => topo.before(t));
    // bloco do nome: no celular antes da galeria, senão no topo da caixa. Não dá para deixar com o tema: o resize dele
    // decide pela .atalhos-mobile visível, que o cabeçalho novo esconde (no ar ele punha a galeria antes do título)
    const caixa = compra?.querySelector(':scope > .principal'), celular = matchMedia('(max-width: 767px)');
    const lugar = () => {
      const info = document.querySelector('.pagina-produto .info-principal-produto'); if (!info || !caixa) return;
      if (celular.matches) { if (info.nextElementSibling !== topo) topo.before(info); } else if (info.parentElement !== caixa) caixa.prepend(info);
    };
    lugar(); addEventListener('resize', () => requestAnimationFrame(lugar), { passive: true });  // depois do handler do tema
    window.jQuery?.(lugar);  // e depois do ready do tema, se ele ainda não rodou

    // galeria (no nível da Conceito): setas e miniaturas no computador, carrossel de arrastar com pontos no celular e zoom
    // em tela cheia com navegação. Usa as fotos que a LI já carrega (as grandes estão nos links das miniaturas).
    const palco = gal?.querySelector('.conteiner-imagem');
    const fotos = [...(gal?.querySelectorAll('.produto-thumbs a[data-imagem-grande]') || [])];
    const principal = palco?.querySelector('#imagemProduto');
    const lista = fotos.length ? fotos.map((a) => ({ g: a.dataset.imagemGrande, m: a.querySelector('img')?.dataset.mediumimg || a.dataset.imagemGrande, alt: a.querySelector('img')?.alt || '' }))
      : principal ? [{ g: principal.dataset.largeimg || principal.src, m: principal.src, alt: principal.alt }] : [];
    const n = lista.length, esc = (t) => t.replace(/"/g, '&quot;');
    const seta = (lado, rot) => `<button type="button" class="lm-seta lm-seta--${lado}" aria-label="${rot}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${lado === 'ant' ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6'}"/></svg></button>`;
    let atual = 0;
    if (n) {
      // zoom: diálogo em tela cheia com as fotos grandes (carregadas só perto da que está aberta)
      const dlg = document.createElement('dialog'); dlg.className = 'lm-zoom'; dlg.setAttribute('aria-label', 'Fotos do produto');
      dlg.innerHTML = `<div class="lm-zoom__trilho">${lista.map((f) => `<figure><img data-src="${f.g}" alt="${esc(f.alt)}" draggable="false"></figure>`).join('')}</div>
        <button type="button" class="lm-zoom__fechar" aria-label="Fechar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
        ${n > 1 ? seta('ant', 'Foto anterior') + seta('prox', 'Próxima foto') + '<span class="lm-zoom__cont" aria-live="polite"></span>' : ''}`;
      document.body.append(dlg);
      const tz = dlg.firstElementChild, cont = dlg.querySelector('.lm-zoom__cont');
      const zi = () => Math.round(tz.scrollLeft / tz.clientWidth);
      const mostra = (i) => { [i - 1, i, i + 1].forEach((k) => { const im = tz.children[(k + n) % n].firstChild; if (!im.src) im.src = im.dataset.src; }); if (cont) cont.textContent = `${i + 1} / ${n}`; };
      const abre = (i) => { dlg.showModal(); tz.scrollTo({ left: i * tz.clientWidth }); mostra(i); };
      const passa = (d) => { const i = (zi() + d + n) % n; tz.scrollTo({ left: i * tz.clientWidth }); mostra(i); };  // troca imediata; arrastar continua livre
      tz.addEventListener('scroll', () => mostra(zi()), { passive: true });
      dlg.querySelector('.lm-zoom__fechar').addEventListener('click', () => dlg.close());
      dlg.querySelector('.lm-seta--ant')?.addEventListener('click', () => passa(-1));
      dlg.querySelector('.lm-seta--prox')?.addEventListener('click', () => passa(1));
      // preventDefault: a seta também rola o trilho (scroll-snap) e a foto pulava duas
      dlg.addEventListener('keydown', (e) => { const d = { ArrowLeft: -1, ArrowRight: 1 }[e.key]; if (d) { e.preventDefault(); passa(d); } });
      // clique fora da foto fecha (a <img> ocupa o quadro todo com contain: a margem branca em volta da foto também é "fora")
      tz.addEventListener('click', (e) => {
        const im = e.target; if (im.tagName !== 'IMG' || !im.naturalWidth) { dlg.close(); return; }
        const r = im.getBoundingClientRect(), k = Math.min(r.width / im.naturalWidth, r.height / im.naturalHeight), mx = (r.width - im.naturalWidth * k) / 2, my = (r.height - im.naturalHeight * k) / 2;
        if (e.clientX < r.left + mx || e.clientX > r.right - mx || e.clientY < r.top + my || e.clientY > r.bottom - my) dlg.close();
      });

      // computador: na foto só o botão da lupa; as setas ficam nas pontas da coluna de miniaturas (como na Conceito)
      palco.insertAdjacentHTML('beforeend', '<button type="button" class="lm-lupa" aria-label="Ampliar foto"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4M11 8v6M8 11h6"/></svg></button>');
      const thumbs = gal.querySelector('.produto-thumbs');
      if (n > 1 && thumbs) {
        const col = document.createElement('div'); col.className = 'lm-miniaturas';
        const vseta = (lado, rot, d) => `<button type="button" class="lm-seta lm-seta--${lado}" aria-label="${rot}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg></button>`;
        thumbs.before(col); col.insertAdjacentHTML('beforeend', vseta('ant', 'Foto anterior', 'm18 15-6-6-6 6')); col.append(thumbs); col.insertAdjacentHTML('beforeend', vseta('prox', 'Próxima foto', 'm6 9 6 6 6-6'));
      } else gal.classList.add('lm-prod-gal--uma');  // classe e não :has() (navegador antigo descarta a regra)
      // miniaturas: o __theme_custom.js do tema troca, 500 ms depois do ready, o 64x50 pelo ORIGINAL (até 90 KB cada; 590 KB no
      // 12123), até no celular, onde nem aparecem. Aqui viram 160x160 (80 px na tela, nítido em 2x) e lazy, então escondidas não
      // baixam; sem o /64x50 na URL a troca do tema não faz nada. Se o tema chegou antes, a URL original também volta para 160x160.
      thumbs?.querySelectorAll('img').forEach((im) => { im.loading = 'lazy'; im.src = im.src.replace(/cdn\.awsli\.com\.br\/(\d+x\d+\/)?/, 'cdn.awsli.com.br/160x160/'); });
      // troca na hora: a foto muda no clique da miniatura ou da seta (o tema esperava a animação dele, que fica de fora)
      const pre = new Set(); const carrega = (k) => { const u = lista[(k + n) % n]?.m; if (u && !pre.has(u)) { pre.add(u); new Image().src = u; } };
      const vai = (i) => {
        atual = (i + n) % n; const f = lista[atual]; if (!principal) return;
        principal.removeAttribute('srcset'); principal.src = f.m; principal.dataset.largeimg = f.g; principal.alt = f.alt;
        fotos.forEach((a, k) => a.classList.toggle('lm-ativa', k === atual));
        carrega(atual - 1); carrega(atual + 1); rola();
        const car = gal.querySelector('.lm-galeria__fotos'); if (car?.clientWidth) car.scrollTo({ left: atual * car.clientWidth, behavior: 'smooth' });  // celular
      };
      fotos.forEach((a, i) => a.addEventListener('click', (e) => { e.preventDefault(); e.stopImmediatePropagation(); vai(i); }, true));
      fotos[0]?.classList.add('lm-ativa');
      // a 2ª foto só depois do load: no celular lento ela disputava a rede com a 1ª (a do LCP)
      if (document.readyState === 'complete') carrega(1); else addEventListener('load', () => carrega(1), { once: true });
      // a variação com foto própria troca a miniatura com $(a).click() do jQuery, que não dispara o clique nativo: acompanha aqui
      if (window.jQuery && thumbs) window.jQuery(thumbs).on('click', '.miniaturas li a', function () { const i = fotos.indexOf(this); if (i >= 0 && i !== atual) vai(i); });
      // a coluna mostra só miniaturas inteiras: altura em múltiplos de 96 (88 + 8) e, ao trocar, rola até a ativa ficar inteira
      const PASSO = 96;
      const rola = () => { const a = fotos[atual], c = thumbs; if (!a || !c) return; const top = a.getBoundingClientRect().top - c.getBoundingClientRect().top + c.scrollTop; if (top < c.scrollTop) c.scrollTop = top; else if (top + 88 > c.scrollTop + c.clientHeight) c.scrollTop = top + 88 - c.clientHeight; };
      const col = gal.querySelector('.lm-miniaturas');
      const ajusta = () => { if (!col || !thumbs || !col.clientHeight) return; const livre = col.clientHeight - 2 * (44 + 8); thumbs.style.height = Math.max(88, Math.floor((livre + 8) / PASSO) * PASSO - 8) + 'px'; rola(); };
      if (col) { ajusta(); new ResizeObserver(ajusta).observe(col); }
      gal.querySelector('.lm-miniaturas .lm-seta--ant')?.addEventListener('click', () => vai(atual - 1));
      gal.querySelector('.lm-miniaturas .lm-seta--prox')?.addEventListener('click', () => vai(atual + 1));
      // o clique na foto (ou na lupa, no toque) abre só o nosso zoom: captura antes do lightbox do tema (fancybox no link da foto)
      palco.addEventListener('click', (e) => {
        const b = e.target.closest('button'); if (b?.hasAttribute('aria-pressed')) return;  // liga/desliga da lupa
        e.preventDefault(); e.stopImmediatePropagation(); abre(atual);
      }, true);
      // lupa redonda ao passar o mouse (a da Conceito): lente de 180 px a 2,5x, foto grande baixada só no 1º hover; só com
      // mouse. O botão do canto passa a ligar/desligar a lupa (ponteiro = ligada, lupinha = desligada); o clique na foto
      // continua abrindo o zoom em tela cheia.
      if (principal && matchMedia('(hover: hover) and (pointer: fine)').matches) {
        const ZOOM = 2.5, LADO = 180, lente = document.createElement('div');
        lente.className = 'lm-lente'; lente.hidden = true; lente.setAttribute('aria-hidden', 'true'); document.body.append(lente);
        let ligada = true; try { ligada = sessionStorage.getItem('lm-lupa') !== 'off'; } catch {}
        const grandes = new Map(); let ev = null, raf = 0;
        const bt = palco.querySelector('.lm-lupa');
        const pinta = () => {
          bt.setAttribute('aria-pressed', String(ligada)); bt.title = ligada ? 'Desativar lupa' : 'Ativar lupa'; bt.setAttribute('aria-label', bt.title);
          bt.innerHTML = ligada ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 2.5l3 3M8 1.5v3M13.5 2.5l-3 3M1.5 8h3M2.5 13.5l3-3"/><path d="M8.5 8.5l13 4.6-5.5 1.9-2.4 6z" fill="currentColor"/></svg>'
            : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21"/></svg>';
        };
        pinta();
        bt.addEventListener('click', (e) => { e.stopPropagation(); ligada = !ligada; try { sessionStorage.setItem('lm-lupa', ligada ? 'on' : 'off'); } catch {} if (!ligada) lente.hidden = true; pinta(); });
        // a foto usa object-fit: contain; a lupa só vale em cima da foto, não nas margens
        const caixa = () => { const r = principal.getBoundingClientRect(), s = Math.min(r.width / principal.naturalWidth, r.height / principal.naturalHeight), w = principal.naturalWidth * s, h = principal.naturalHeight * s; return { x: r.left + (r.width - w) / 2, y: r.top + (r.height - h) / 2, w, h }; };
        const mostra = (e) => {
          const b = caixa(), cx = e.clientX - b.x, cy = e.clientY - b.y;
          if (!principal.naturalWidth || cx < 0 || cy < 0 || cx > b.w || cy > b.h) { lente.hidden = true; return; }
          const url = lista[atual]?.g || principal.src; let g = grandes.get(url);
          if (!g) { g = { ok: false }; grandes.set(url, g); const pre = new Image(); pre.onload = () => { g.ok = true; if (ev) mostra(ev); }; pre.src = url; }
          lente.hidden = false; lente.style.left = e.clientX + 'px'; lente.style.top = e.clientY + 'px';
          lente.style.backgroundImage = `url("${g.ok ? url : principal.currentSrc || principal.src}")`;  // até a grande chegar, a da página
          lente.style.backgroundSize = `${b.w * ZOOM}px ${b.h * ZOOM}px`;
          lente.style.backgroundPosition = `${LADO / 2 - cx * ZOOM}px ${LADO / 2 - cy * ZOOM}px`;
        };
        palco.addEventListener('pointermove', (e) => { if (e.pointerType !== 'mouse' || !ligada || e.target.closest('button')) { lente.hidden = true; return; } ev = e; if (!raf) raf = requestAnimationFrame(() => { raf = 0; if (ev) mostra(ev); }); }, { passive: true });
        palco.addEventListener('pointerleave', () => { ev = null; lente.hidden = true; });
        palco.addEventListener('click', () => { lente.hidden = true; }, true);
        document.addEventListener('wheel', () => { lente.hidden = true; }, { passive: true });
      }
      // o zoom de passar o mouse do tema (jQuery ImageZoom) sai: o palco segura os eventos de mouse antes de chegarem à foto
      ['mouseenter', 'mouseover', 'mousemove', 'mouseleave', 'mouseout'].forEach((t) => palco.addEventListener(t, (e) => { if (!e.target.closest('button')) e.stopPropagation(); }, true));

      // celular: carrossel de arrastar com pontos (o desenho dos pontos é o do loren.css); tocar na foto abre o zoom
      if (n > 1) {
        const car = document.createElement('div'); car.className = 'lm-galeria'; gal.classList.add('lm-prod-gal--car');
        car.innerHTML = `<div class="lm-galeria__fotos">${lista.map((f, i) => `<img src="${f.m}" alt="${esc(f.alt)}" loading="${i ? 'lazy' : 'eager'}" draggable="false">`).join('')}</div>
          <ol class="flex-control-nav flex-control-paging">${lista.map((_, i) => `<li><a href="#"${i ? '' : ' class="flex-active"'}>${i + 1}</a></li>`).join('')}</ol>`;
        palco.after(car);
        const trilho = car.firstElementChild, pontos = [...car.querySelectorAll('ol a')];
        trilho.addEventListener('scroll', () => { const i = Math.round(trilho.scrollLeft / trilho.clientWidth); pontos.forEach((p, k) => p.classList.toggle('flex-active', k === i)); }, { passive: true });
        pontos.forEach((p, i) => p.addEventListener('click', (e) => { e.preventDefault(); trilho.scrollTo({ left: i * trilho.clientWidth, behavior: 'smooth' }); }));
        [...trilho.children].forEach((im, i) => im.addEventListener('click', () => abre(i)));
      }
    }

    // vídeo (Eduardo 09/11): o bloco do tema ("Assistir Vídeo", ícone de fonte que não carrega) vira um cartão com a capa do
    // YouTube e play em SVG; o player (youtube-nocookie) só entra no clique, no lugar da capa. A janela do tema sai, e com ela o
    // iframe que baixava o player do YouTube em toda visita.
    const blocoVideo = gal?.querySelector('.produto-video'), idVideo = document.getElementById('playerVideo')?.getAttribute('src')?.match(/embed\/([\w-]{11})/)?.[1];
    if (blocoVideo && idVideo) {
      document.getElementById('modalVideo')?.remove();
      blocoVideo.innerHTML = `<button type="button" class="lm-video"><span class="lm-video__capa"><img src="https://i.ytimg.com/vi/${idVideo}/mqdefault.jpg" alt="" loading="lazy" width="320" height="180"><span class="lm-video__play"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg></span></span><span class="lm-video__tit">Veja o produto em vídeo</span></button>`;
      blocoVideo.querySelector('.lm-video').addEventListener('click', () => {
        blocoVideo.innerHTML = `<span class="lm-video__player"><iframe src="https://www.youtube-nocookie.com/embed/${idVideo}?autoplay=1&rel=0" title="Vídeo do produto" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></span>`;  // span: o tema dá 300 px às div do .produto-video
        blocoVideo.querySelector('iframe').focus({ preventScroll: true });
      });
    }

    // galeria fixa (Eduardo 09/11, como na Conceito): de 900 px para cima a coluna de compra é mais alta que a galeria; a galeria
    // acompanha a rolagem logo abaixo do cabeçalho fixo até o fim da caixa. Só quando cabe inteira na tela (senão o pé ficaria cortado)
    if (gal) {
      // altura do cabeçalho fixo: o topo (--lm-topo-h, medido pelo loren.js) + o menu de categorias, que cola logo abaixo dele
      const cab = () => (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--lm-topo-h')) || 81) + (document.querySelector('#cabecalho .full.menu')?.offsetHeight || 0);
      const fixa = () => { const c = cab(); gal.style.setProperty('--lm-cab-h', c + 'px'); gal.classList.toggle('lm-prod-gal--fixa', innerWidth >= 900 && gal.offsetHeight + c + 24 <= innerHeight); };
      fixa(); addEventListener('resize', fixa, { passive: true }); if (window.ResizeObserver) new ResizeObserver(fixa).observe(gal);
    }

    // descrição: coluna de leitura; rótulos curtos ("Características e Medidas:") viram subtítulo, links sozinhos viram
    // lista e listas "Rótulo: valor" viram tabela de especificações (o mesmo texto, dividido no primeiro ":")
    const desc = document.querySelector('.pagina-produto #descricao');
    if (desc) {
      desc.closest('.row-fluid')?.classList.add('lm-prod-desc');
      // &nbsp; em série no fim da linha (vem do editor da LI) quebra em linhas vazias: sai, o texto fica o mesmo
      const fimDeLinha = (n) => { for (let e = n; e !== desc && !/^(P|LI|DIV|TD|TH|H\d)$/.test(e.nodeName); e = e.parentNode) { let s = e.nextSibling; while (s?.nodeType === 3 && !s.data.trim()) s = s.nextSibling; if (s) return s.nodeName === 'BR'; } return true; };
      const tw = document.createTreeWalker(desc, NodeFilter.SHOW_TEXT);
      for (let n; (n = tw.nextNode());) if (/\s$/.test(n.data) && fimDeLinha(n)) n.data = n.data.trimEnd();
      const txt = (e) => e.textContent.replace(/[\s ]+/g, ' ').trim();
      desc.querySelectorAll(':scope > p').forEach((p) => {
        const t = txt(p);
        if (!t && !p.querySelector('img, iframe, video, table')) p.classList.add('lm-vazio');
        else if (t.length <= 70 && !p.querySelector('br') && (/:$/.test(t) || /^produtos semelhantes/i.test(t))) p.classList.add('lm-desc-tit');
        else if (p.querySelector('a') && txt(p.querySelector('a')) === t) p.classList.add('lm-desc-link');
      });
      desc.querySelectorAll('ul').forEach((ul) => {
        const itens = [...ul.children].map(txt);
        if (itens.length < 3 || !itens.every((t) => /^[^:]{2,40}:\s*\S/.test(t))) return;
        const tb = document.createElement('table'); tb.className = 'lm-specs';
        itens.forEach((t) => { const i = t.indexOf(':'), tr = tb.insertRow(), th = document.createElement('th'); th.scope = 'row'; th.textContent = t.slice(0, i); tr.append(th); tr.insertCell().textContent = t.slice(i + 1).trim(); });
        ul.replaceWith(tb);
      });
    }
    document.querySelector('.pagina-produto .aproveite-tambem')?.closest('.row-fluid')?.classList.add('lm-prod-rel');
    // Next Reviews (script do painel): monta tudo logo depois da descrição. Fica fora da grade descrição + ficha, e os botões
    // dele usam o secundário da base. O script não é alterado.
    const acomoda = () => {
      const grade = document.querySelector('.lm-desc-grade');
      if (grade) [...grade.children].filter((c) => !c.matches('.abas-custom, .lm-ficha')).reverse().forEach((c) => grade.after(c));
      document.querySelectorAll('#btn-review-modal, #loadMore').forEach((b) => b.classList.add('lm-btn2'));
    };
    if (desc) new MutationObserver(acomoda).observe(desc.closest('.row-fluid') || document.body, { childList: true, subtree: true });
    if (desc) fichaTecnica(desc);

    // sob consulta: um só chamado (o botão "Consulte o preço"), com "Preço sob consulta" pequeno no lugar do preço
    const consulta = compra?.querySelector('#produto-consulta-preco');
    if (consulta) {
      compra.classList.add('lm-prod-consulta');
      consulta.insertAdjacentHTML('beforebegin', '<p class="lm-prod-sob">Preço sob consulta</p>');
      // o botão abre o formulário de cotação (#modal_qtds, o do "Para grandes quantidades"), não o popup do tema
      const qtds = compra.querySelector('.grandes_qtd[data-target="#modal_qtds"]');
      if (qtds) consulta.addEventListener('click', (e) => { e.preventDefault(); e.stopImmediatePropagation(); qtds.click(); }, true);
    }

    // esgotado (produto ou variação): selo no lugar do preço e o Avise-me da LI (janela da Ellie) como botão principal
    // e, embaixo, o convite para cotar mesmo assim (como na Conceito, quote-hint): abre o mesmo formulário de cotação
    const cotacao = compra?.querySelector('.grandes_qtd[data-target="#modal_qtds"]');
    const esgotados = compra?.querySelectorAll('.acoes-produto.indisponivel') || [];
    esgotados.forEach((bloco) => {
      bloco.insertAdjacentHTML('afterbegin', '<p class="lm-prod-esgotado">Esgotado</p>');
      bloco.querySelectorAll('.avise-me-pop-cadastro').forEach((a) => a.classList.add('botao', 'principal'));
      if (!cotacao) return;
      bloco.insertAdjacentHTML('beforeend', '<div class="lm-prod-cotar"><p><b>Precisa com urgência?</b> Peça uma cotação e verificamos a disponibilidade para você.</p><button type="button" class="lm-btn2">Pedir cotação</button></div>');
      bloco.querySelector('.lm-prod-cotar button').addEventListener('click', () => cotacao.click());
    });
    // produto todo esgotado: o convite acima já é o chamado de cotação, o "Para grandes quantidades" sai (um só, como no sob consulta)
    if (esgotados.length && !compra.querySelector('.acoes-produto:not(.indisponivel)[data-produto-id]')) compra.classList.add('lm-prod-esg');

    // compartilhar (como na Conceito): links padrão, sem SDK; o da LI (addthis) segue escondido
    if (caixa) {
      const url = document.querySelector('link[rel=canonical]')?.href || location.origin + location.pathname, nome = document.querySelector('h1.nome-produto')?.textContent.trim() || document.title;
      const foto = lista?.[0]?.g || principal?.src || '', u = encodeURIComponent(url), t = encodeURIComponent(nome);
      const ic = (d) => `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${d}</svg>`;
      const redes = [
        ['WhatsApp', `https://api.whatsapp.com/send?text=${t}%20${u}`, ic('<path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a.9.9 0 0 0-.7.3 2.8 2.8 0 0 0-.9 2.1 4.9 4.9 0 0 0 1 2.6 11.1 11.1 0 0 0 4.3 3.8c1.6.7 2.2.7 3 .6a2.6 2.6 0 0 0 1.7-1.2 2.1 2.1 0 0 0 .1-1.2c0-.1-.2-.2-.4-.3Z"/>')],
        ['Facebook', `https://www.facebook.com/sharer/sharer.php?u=${u}`, ic('<path d="M13.5 22v-8.2h2.8l.4-3.2h-3.2V8.6c0-.9.3-1.6 1.6-1.6h1.7V4.1c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.3H7.3v3.2h2.8V22h3.4Z"/>')],
        ['X', `https://twitter.com/intent/tweet?url=${u}&text=${t}`, ic('<path d="M17.8 3h3.1l-6.8 7.8L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.3-8.3L2 3h6.4l4.4 5.8L17.8 3Zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5Z"/>')],
        ['Pinterest', `https://pinterest.com/pin/create/button/?url=${u}&media=${encodeURIComponent(foto)}&description=${t}`, ic('<path d="M12 2a10 10 0 0 0-3.6 19.3c-.1-.8-.2-2 0-2.9l1.2-5s-.3-.6-.3-1.5c0-1.4.8-2.4 1.8-2.4.8 0 1.2.6 1.2 1.4 0 .8-.5 2.1-.8 3.2-.2 1 .5 1.8 1.5 1.8 1.8 0 3.2-1.9 3.2-4.6 0-2.4-1.7-4.1-4.2-4.1-2.9 0-4.6 2.2-4.6 4.4 0 .9.3 1.8.8 2.3l.1.4-.3 1.2c0 .2-.2.3-.4.2-1.3-.6-2.1-2.5-2.1-4 0-3.3 2.4-6.3 6.9-6.3 3.6 0 6.4 2.6 6.4 6 0 3.6-2.3 6.5-5.4 6.5-1.1 0-2.1-.6-2.4-1.2l-.7 2.5c-.2.9-.9 2.1-1.3 2.8A10 10 0 1 0 12 2Z"/>')],
      ];
      caixa.insertAdjacentHTML('beforeend', `<div class="lm-compartilhe"><p class="lm-compartilhe__tit">Compartilhe</p><div class="lm-compartilhe__lista">${redes.map(([r, h, s]) => `<a href="${h}" target="_blank" rel="noopener" aria-label="Compartilhar no ${r}" title="${r}">${s}</a>`).join('')}<button type="button" aria-label="Copiar link" title="Copiar link"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg></button><span class="lm-compartilhe__aviso" role="status" aria-live="polite"></span></div></div>`);
      const copia = caixa.querySelector('.lm-compartilhe button'), aviso = caixa.querySelector('.lm-compartilhe__aviso');
      copia.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(url); } catch { const tx = document.createElement('textarea'); tx.value = url; document.body.append(tx); tx.select(); document.execCommand('copy'); tx.remove(); }
        aviso.textContent = 'Link copiado'; clearTimeout(copia._t); copia._t = setTimeout(() => { aviso.textContent = ''; }, 2500);
      });
    }

    // (o frete fica onde a LI o põe, dentro do bloco de pagamento; a ordem na caixa é do CSS)
    // A calculadora da LI lê o 1º input[name=cep] da página, que é o do formulário de orçamento escondido (vem antes no
    // HTML do tema): sem isto ela responde "Por favor informe um CEP". Na hora de calcular, o CEP digitado vai para lá
    // e o valor de lá volta logo depois.
    // (delegado no documento: a LI monta a calculadora depois que a página carrega)
    const calcula = (e) => {
      const f = e.target.closest?.('#formCalcularCep'); if (!f || (e.type === 'click' && !e.target.closest('button'))) return;
      const campo = f.querySelector('input[name=cep]'), lido = document.querySelector('input[name=cep]');
      if (!campo || lido === campo) return;
      const antigo = lido.value; lido.value = campo.value; setTimeout(() => { lido.value = antigo; }, 0);
    };
    document.addEventListener('submit', calcula, true);
    document.addEventListener('click', calcula, true);

    // Calculadora de frete quando o código do cabeçalho não rodou (favorito da prévia, ou falha): o script "Orçamento produtos" do
    // painel pôs a frase do carrinho no 2º .cep. O conteúdo original desse .cep vem do HTML cru da própria página e o envio é
    // religado ao calcular_frete do tema (global). Assíncrono: não segura a revelação. No ar a frase não está lá e nada roda.
    const cep2 = document.getElementsByClassName('cep')[1];
    if (cep2 && /frete no carrinho/.test(cep2.textContent) && window.jQuery && typeof window.calcular_frete === 'function') {
      fetch(location.href, { credentials: 'same-origin' }).then((r) => r.text()).then((html) => {
        const cru = new DOMParser().parseFromString(html, 'text/html').getElementsByClassName('cep')[1];
        if (!cru || !/frete no carrinho/.test(cep2.textContent)) return;  // alguém já devolveu
        const tinha = !!document.getElementById('formCalcularCep');  // com variação a calculadora é outro .cep: só sai a frase
        cep2.replaceChildren(...[...cru.childNodes].map((n) => document.importNode(n, true)));
        if (!tinha) window.jQuery('#formCalcularCep').submit(window.calcular_frete);
      }).catch(() => {});
    }

    // selos curtos: só o que a loja já diz (as frases da barra do topo)
    compra?.querySelector('.grandes_qtd')?.insertAdjacentHTML('afterend', `<ul class="lm-selos">
      <li>${ico('<path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6"/>')}Direto da fábrica</li>
      <li>${ico('<path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>')}Envio em 24h para todo o Brasil</li>
      <li>${ico('<path d="M19 5 5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>')}10% de desconto no Pix ou boleto</li></ul>`);

    // selo NBR 9050 (como o da Conceito, blocks/product-selo-nbr), pelo texto: título, ou a descrição até a lista de sugeridos
    // (a do 19035 cita a NBR 9050 só nos produtos sugeridos)
    const descNbr = (desc?.textContent || '').split(/semelhantes|sugerid|relacionad|veja tamb/i)[0];
    if ([document.querySelector('h1.nome-produto')?.textContent, descNbr].some((t) => /NBR\s*-?\s*9050/i.test(t || ''))) {
      const selos = compra?.querySelector('.lm-selos');
      (selos || compra?.querySelector(':scope > .principal'))?.insertAdjacentHTML(selos ? 'beforebegin' : 'beforeend', `<div class="lm-prod-nbr">
        <svg viewBox="0 0 64 64" width="56" height="56" aria-hidden="true" focusable="false"><circle cx="32" cy="32" r="31" fill="#303136"/><circle cx="32" cy="32" r="26.2" fill="none" stroke="#fff" stroke-width="1.1"/><circle cx="32" cy="32" r="23.6" fill="none" stroke="#81BBD3" stroke-width="1" stroke-dasharray="0.01 2.05" stroke-linecap="round"/><text x="32" y="18.5" text-anchor="middle" font-size="5.5" fill="#fff" letter-spacing="1.5">★★★</text><text x="32" y="30.5" text-anchor="middle" font-size="11" font-weight="800" letter-spacing="1" fill="#81BBD3">NBR</text><text x="32" y="46.5" text-anchor="middle" font-size="16.5" font-weight="800" fill="#fff">9050</text></svg>
        <p><strong>Linha de acessibilidade, NBR 9050</strong>Atende à norma de acessibilidade.</p></div>`);
    }

  };
  // Especificações técnicas + "Baixar ficha técnica" (ao lado da descrição no computador, embaixo no celular). Dados por SKU:
  // { "<sku>": { "pdf": "<sku>.pdf", "resumo": [["Material","Aço inox 304"]], "medidas": [["Altura","18,5 cm"]] } }; o pdf é
  // relativo ao fichas.json. Sem ficha para o SKU, o bloco não aparece. O e-mail é pedido uma vez (vai para a newsletter da LI).
  const FICHAS_URL = 'https://lorenmetais.github.io/loren-metais-front/fichas.json';
  const FICHAS_EXEMPLO = {  // só com #fichas-exemplo na URL (teste), para nada de exemplo ir ao ar
    41018: { pdf: '41018.pdf', resumo: [['Material', 'Aço inox 304'], ['Acionamento', 'Manual por placa PUSH'], ['Saídas de água', '2 esguichos']], medidas: [['Diâmetro da cuba', '30 cm'], ['Base de fixação', '26 cm'], ['Peso', '2,85 kg']] },
    16001: { pdf: '16001.pdf', resumo: [['Material', 'Poliéster'], ['Norma', 'NBR 9050']], medidas: [['Largura', 'exemplo'], ['Profundidade', 'exemplo']] },
  };
  const fichaTecnica = async (desc) => {
    const sku = document.querySelector('.pagina-produto .codigo-produto span > span')?.textContent.trim().replace(/^0+(?=\d)/, '');  // chave do fichas.json: o Código sem zero à esquerda
    let fichas = /fichas-exemplo/.test(location.hash) ? FICHAS_EXEMPLO : null, base = location.href;
    if (!fichas && FICHAS_URL) { try { fichas = await (await fetch(FICHAS_URL)).json(); base = FICHAS_URL; } catch { return; } }
    const f = sku && (fichas?.[sku] || fichas?.[sku.match(/^0*(\d+)/)?.[1]]); if (!f) return;  // variação (1057_1, 1046-2): os dígitos do começo
    const tabela = (linhas) => { const tb = document.createElement('table'); tb.className = 'lm-specs'; linhas.forEach(([r, v]) => { const tr = tb.insertRow(), th = document.createElement('th'); th.scope = 'row'; th.textContent = r; if (r.length > 24) th.classList.add('lm-longo'); tr.append(th); tr.insertCell().textContent = v; }); return tb; };
    const lado = document.createElement('aside'); lado.className = 'lm-ficha'; lado.setAttribute('aria-labelledby', 'lm-ficha-tit');
    lado.innerHTML = '<h2 id="lm-ficha-tit">Especificações técnicas</h2>';
    if (f.resumo?.length) lado.append(tabela(f.resumo));
    if (f.medidas?.length) { lado.insertAdjacentHTML('beforeend', '<h3>Medidas</h3>'); lado.append(tabela(f.medidas)); }
    if (f.pdf) lado.insertAdjacentHTML('beforeend', '<button type="button" class="lm-btn2 lm-ficha__baixar">Baixar ficha técnica</button>');
    const abas = desc.closest('.abas-custom'), grade = document.createElement('div'); grade.className = 'lm-desc-grade';
    abas.before(grade); grade.append(abas, lado);
    if (!f.pdf) return;
    const pdf = new URL(f.pdf, base).href;
    const baixa = () => { const a = document.createElement('a'); a.href = pdf; a.download = ''; a.target = '_blank'; a.rel = 'noopener'; document.body.append(a); a.click(); a.remove(); };
    const lembra = () => { try { return localStorage.getItem('lm-ficha-email'); } catch { return null; } };
    // janela no padrão das do tema (Bootstrap .modal), que o modais.css da Ellie já desenha
    document.body.insertAdjacentHTML('beforeend', `<div class="modal hide fade lm-ficha-modal" id="lm-ficha-modal" tabindex="-1" role="dialog" aria-labelledby="lm-ficha-modal-tit" aria-hidden="true">
      <div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Fechar"><i></i></button><h3 id="lm-ficha-modal-tit">Baixar ficha técnica</h3></div>
      <form novalidate><div class="modal-body"><p class="p_form">Informe seu e-mail para baixar a ficha técnica.</p>
        <div class="lm-grupo"><label class="lm-rotulo" for="lm-ficha-email">E-mail</label><input class="lm-campo" type="email" id="lm-ficha-email" name="email" required autocomplete="email" placeholder="meu@email.com.br"></div></div>
        <div class="modal-footer"><button type="submit" class="botao principal">Baixar ficha técnica</button></div></form></div>`);
    const modal = document.getElementById('lm-ficha-modal'), $ = window.jQuery;
    const mostra = (on) => { if ($?.fn?.modal) $(modal).modal(on ? 'show' : 'hide'); else { modal.classList.toggle('in', on); modal.classList.toggle('hide', !on); } };
    lado.querySelector('.lm-ficha__baixar').addEventListener('click', () => { if (lembra()) baixa(); else mostra(true); });
    $?.(modal).on('shown', () => modal.querySelector('input').focus());  // foco no e-mail quando a janela termina de abrir
    modal.querySelector('form').addEventListener('submit', (e) => {
      e.preventDefault();
      const campo = modal.querySelector('input'); if (!campo.checkValidity()) { campo.reportValidity(); return; }
      // newsletter da própria LI (mesmo endereço do botão Assinar); o download não espera a resposta
      fetch('https://www.lorenmetais.com.br/newsletter/assinar/', { method: 'POST', body: new URLSearchParams({ email: campo.value }), credentials: 'same-origin', keepalive: true }).catch(() => {});
      try { localStorage.setItem('lm-ficha-email', '1'); } catch {}
      mostra(false); baixa();
    });
  };
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', go) : go();
})();
// Ellie 11/11: barra de compra fixa no celular e no tablet em pé (#35 do comparativo, como na Conceito; a do tema, .acoes-flutuante,
// é só do computador e compra sem a variação escolhida). Nome, preço e o mesmo botão da caixa de compra (Adicionar, Consulte o
// preço ou o Pedir cotação do esgotado), que ela só aciona: a variação escolhida e a janela de produto adicionado são as do tema.
(() => {
  if (!document.body.classList.contains('pagina-produto')) return;
  const go = () => {
    const compra = document.querySelector('.lm-prod-compra');
    if (!compra || document.querySelector('.lm-barra-compra')) return;
    const mq = matchMedia('(max-width: 899px)'), vis = (e) => !!e && e.getClientRects().length > 0;
    const principal = () => [...compra.querySelectorAll('.acoes-produto .botao-comprar, .acoes-produto .preco-produto > .botao.principal, .lm-prod-cotar .lm-btn2')].find(vis);
    document.body.insertAdjacentHTML('beforeend', '<div class="lm-barra-compra" role="region" aria-label="Compra rápida" hidden><div class="lm-barra-compra__txt"><span class="lm-barra-compra__nome"></span><span class="lm-barra-compra__preco"></span></div><button type="button" class="botao principal lm-barra-compra__bt"></button></div>');
    const barra = document.querySelector('.lm-barra-compra'), preco = barra.querySelector('.lm-barra-compra__preco'), bt = barra.querySelector('button');
    barra.querySelector('.lm-barra-compra__nome').textContent = document.querySelector('h1.nome-produto')?.textContent.trim() || '';
    const atualiza = () => {
      const m = principal(), on = mq.matches && !!m && m.getBoundingClientRect().bottom < 0;  // só depois que o botão da caixa sai da tela por cima
      if (on) {
        bt.textContent = m.textContent.trim();
        const p = [...compra.querySelectorAll('.acoes-produto .preco-promocional, .lm-prod-sob')].find(vis);
        preco.textContent = p?.classList.contains('lm-prod-sob') ? 'Sob consulta' : (p?.textContent || '').trim();  // curto: o botão ao lado já diz "Consulte o preço" (a 390 o texto inteiro quebrava em 2 linhas)
      }
      if (barra.hidden === on) { barra.hidden = !on; document.body.classList.toggle('lm-barra-compra-on', on); }
    };
    let raf = 0;
    addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; atualiza(); }); }, { passive: true });
    mq.addEventListener?.('change', atualiza);
    bt.addEventListener('click', () => principal()?.click());
    atualiza();
  };
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', go) : go();
})();
