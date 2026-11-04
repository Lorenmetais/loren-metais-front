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
    // (no celular o tema tira o bloco do nome da caixa e o põe antes da galeria: a trilha vai antes dele)
    const info = document.querySelector('.pagina-produto .info-principal-produto');
    const antes = info && !topo.contains(info) ? info : topo;
    document.querySelectorAll('.pagina-produto .info-principal-produto .breadcrumbs').forEach((t) => antes.before(t));

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
      dlg.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') passa(-1); if (e.key === 'ArrowRight') passa(1); });
      tz.addEventListener('click', (e) => { if (e.target.tagName !== 'IMG') dlg.close(); });  // clique fora da foto fecha

      // computador: na foto só o botão da lupa; as setas ficam nas pontas da coluna de miniaturas (como na Conceito)
      palco.insertAdjacentHTML('beforeend', '<button type="button" class="lm-lupa" aria-label="Ampliar foto"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4M11 8v6M8 11h6"/></svg></button>');
      const thumbs = gal.querySelector('.produto-thumbs');
      if (n > 1 && thumbs) {
        const col = document.createElement('div'); col.className = 'lm-miniaturas';
        const vseta = (lado, rot, d) => `<button type="button" class="lm-seta lm-seta--${lado}" aria-label="${rot}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg></button>`;
        thumbs.before(col); col.insertAdjacentHTML('beforeend', vseta('ant', 'Foto anterior', 'm18 15-6-6-6 6')); col.append(thumbs); col.insertAdjacentHTML('beforeend', vseta('prox', 'Próxima foto', 'm6 9 6 6 6-6'));
      }
      fotos.forEach((a, i) => a.addEventListener('click', () => { atual = i; }));
      const vai = (i) => { atual = (i + n) % n; fotos[atual].click(); };
      const rola = () => { const a = fotos[atual], c = thumbs; if (!a || !c) return; const top = a.offsetTop - c.offsetTop; if (top < c.scrollTop) c.scrollTop = top; else if (top + a.offsetHeight > c.scrollTop + c.clientHeight) c.scrollTop = top + a.offsetHeight - c.clientHeight; };  // a miniatura ativa sempre à vista
      gal.querySelector('.lm-miniaturas .lm-seta--ant')?.addEventListener('click', () => { vai(atual - 1); rola(); });
      gal.querySelector('.lm-miniaturas .lm-seta--prox')?.addEventListener('click', () => { vai(atual + 1); rola(); });
      palco.addEventListener('click', (e) => { e.preventDefault(); abre(atual); });
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
        const car = document.createElement('div'); car.className = 'lm-galeria';
        car.innerHTML = `<div class="lm-galeria__fotos">${lista.map((f, i) => `<img src="${f.m}" alt="${esc(f.alt)}" loading="${i ? 'lazy' : 'eager'}" draggable="false">`).join('')}</div>
          <ol class="flex-control-nav flex-control-paging">${lista.map((_, i) => `<li><a href="#"${i ? '' : ' class="flex-active"'}>${i + 1}</a></li>`).join('')}</ol>`;
        palco.after(car);
        const trilho = car.firstElementChild, pontos = [...car.querySelectorAll('ol a')];
        trilho.addEventListener('scroll', () => { const i = Math.round(trilho.scrollLeft / trilho.clientWidth); pontos.forEach((p, k) => p.classList.toggle('flex-active', k === i)); }, { passive: true });
        pontos.forEach((p, i) => p.addEventListener('click', (e) => { e.preventDefault(); trilho.scrollTo({ left: i * trilho.clientWidth, behavior: 'smooth' }); }));
        [...trilho.children].forEach((im, i) => im.addEventListener('click', () => abre(i)));
      }
    }

    // descrição: coluna de leitura; rótulos curtos ("Características e Medidas:") viram subtítulo, links sozinhos viram
    // lista e listas "Rótulo: valor" viram tabela de especificações (o mesmo texto, dividido no primeiro ":")
    const desc = document.querySelector('.pagina-produto #descricao');
    if (desc) {
      desc.closest('.row-fluid')?.classList.add('lm-prod-desc');
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
    if (desc) fichaTecnica(desc);

    // sob consulta: um só chamado (o botão "Consulte o preço"), com "Preço sob consulta" pequeno no lugar do preço
    const consulta = compra?.querySelector('#produto-consulta-preco');
    if (consulta) {
      compra.classList.add('lm-prod-consulta');
      consulta.insertAdjacentHTML('beforebegin', '<p class="lm-prod-sob">Preço sob consulta</p>');
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

    // selos curtos: só o que a loja já diz (as frases da barra do topo)
    compra?.querySelector('.grandes_qtd')?.insertAdjacentHTML('afterend', `<ul class="lm-selos">
      <li>${ico('<path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6"/>')}Direto da fábrica</li>
      <li>${ico('<path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>')}Envio em 24h para todo o Brasil</li>
      <li>${ico('<path d="M19 5 5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>')}10% de desconto no Pix ou boleto</li></ul>`);

  };
  // Especificações técnicas + "Baixar ficha técnica" (ao lado da descrição no computador, embaixo no celular). Dados por SKU:
  // { "<sku>": { "pdf": "<sku>.pdf", "resumo": [["Material","Aço inox 304"]], "medidas": [["Altura","18,5 cm"]] } }; o pdf é
  // relativo ao fichas.json. Sem ficha para o SKU, o bloco não aparece. O e-mail é pedido uma vez (vai para a newsletter da LI).
  const FICHAS_URL = 'https://eduserpa.github.io/loren-metais-front/fichas.json';
  const FICHAS_EXEMPLO = {  // só com #fichas-exemplo na URL (teste), para nada de exemplo ir ao ar
    41018: { pdf: '41018.pdf', resumo: [['Material', 'Aço inox 304'], ['Acionamento', 'Manual por placa PUSH'], ['Saídas de água', '2 esguichos']], medidas: [['Diâmetro da cuba', '30 cm'], ['Base de fixação', '26 cm'], ['Peso', '2,85 kg']] },
    16001: { pdf: '16001.pdf', resumo: [['Material', 'Poliéster'], ['Norma', 'NBR 9050']], medidas: [['Largura', 'exemplo'], ['Profundidade', 'exemplo']] },
  };
  const fichaTecnica = async (desc) => {
    const sku = document.querySelector('.pagina-produto .codigo-produto span > span')?.textContent.trim().replace(/^0+(?=\d)/, '');  // chave do fichas.json: o Código sem zero à esquerda
    let fichas = /fichas-exemplo/.test(location.hash) ? FICHAS_EXEMPLO : null, base = location.href;
    if (!fichas && FICHAS_URL) { try { fichas = await (await fetch(FICHAS_URL)).json(); base = FICHAS_URL; } catch { return; } }
    const f = sku && (fichas?.[sku] || fichas?.[sku.match(/^0*(\d+)/)?.[1]]); if (!f) return;  // variação (1057_1, 1046-2): os dígitos do começo
    const tabela = (linhas) => { const tb = document.createElement('table'); tb.className = 'lm-specs'; linhas.forEach(([r, v]) => { const tr = tb.insertRow(), th = document.createElement('th'); th.scope = 'row'; th.textContent = r; tr.append(th); tr.insertCell().textContent = v; }); return tb; };
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
