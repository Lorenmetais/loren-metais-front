// Loren Metais, página de produto (carregado pelo loren.js em body.pagina-produto): faixa "fabricação própria" entre a
// compra e a descrição, igual em todo produto. Nada de texto da página é mudado.
(() => {
  if (!document.body.classList.contains('pagina-produto')) return;
  const go = () => {
    const topo = document.querySelector('.pagina-produto .produto > .row-fluid');
    if (!topo || document.querySelector('.lm-fab')) return;
    topo.insertAdjacentHTML('afterend', `<section class="lm-fab"><div class="lm-wrap">
      <div><b>Fabricação própria</b><span>Indaiatuba/SP, com peças de reposição e pós-venda</span></div>
      <div><b>Envio em 24h</b><span>para todo o Brasil</span></div>
      <div><b>10% no Pix ou boleto</b><span>e até 4x no cartão</span></div></div></section>`);
  };
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', go) : go();
})();
