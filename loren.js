// Loren Metais, visual novo (1ª camada, 03/11). Liga html.lm-novo e troca a logo pelo vetor novo.
// Fora do checkout e do carrinho de pagamento: lá o site segue exatamente como hoje.
(() => {
  if (/\/checkout|\/carrinho\/pagamento|\/pagamento/i.test(location.pathname)) return;
  const BASE = document.currentScript?.src.replace(/[^/]*$/, '') || '';
  document.documentElement.classList.add('lm-novo');
  const troca = () => document.querySelectorAll('#cabecalho .logo img').forEach((img) => { img.src = BASE + 'logo.svg'; img.removeAttribute('srcset'); });
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', troca) : troca();
})();
