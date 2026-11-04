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

      // computador: setas e lupa na foto principal; as setas trocam pela miniatura (o tema troca a foto no clique)
      palco.insertAdjacentHTML('beforeend', `${n > 1 ? seta('ant', 'Foto anterior') + seta('prox', 'Próxima foto') : ''}<button type="button" class="lm-lupa" aria-label="Ampliar foto"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4M11 8v6M8 11h6"/></svg></button>`);
      fotos.forEach((a, i) => a.addEventListener('click', () => { atual = i; }));
      const vai = (i) => { atual = (i + n) % n; fotos[atual].click(); };
      palco.querySelector('.lm-seta--ant')?.addEventListener('click', (e) => { e.stopPropagation(); vai(atual - 1); });
      palco.querySelector('.lm-seta--prox')?.addEventListener('click', (e) => { e.stopPropagation(); vai(atual + 1); });
      palco.addEventListener('click', (e) => { if (!e.target.closest('.lm-seta')) { e.preventDefault(); abre(atual); } });

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
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', go) : go();
})();
