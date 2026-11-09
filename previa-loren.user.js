// ==UserScript==
// @name         Prévia Loren (liga e desliga)
// @namespace    loren-metais
// @version      1.0
// @description  Com a prévia ligada (favorito "Prévia Loren"), toda página da lorenmetais.com.br abre com o visual novo, como no ar. Só neste navegador.
// @match        https://www.lorenmetais.com.br/*
// @match        https://lorenmetais.com.br/*
// @run-at       document-start
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/eduserpa/loren-metais-front/main/previa-loren.user.js
// @updateURL    https://raw.githubusercontent.com/eduserpa/loren-metais-front/main/previa-loren.user.js
// ==/UserScript==
// Roda o mesmo código do cabeçalho que irá ao painel (front/cabecalho-snippet.html, versão mais nova do GitHub), antes do tema:
// assim a prévia mostra a casca, o carregador e a calculadora de frete como no ar. O checkout o próprio código ignora.
(function () {
  let ligada = false;
  try { ligada = localStorage.getItem('lm_previa') === '1'; } catch (e) {}
  if (!ligada) return;
  const REPO = 'eduserpa/loren-metais-front';
  let sha = '';
  try { sha = localStorage.getItem('lm_previa_sha') || ''; } catch (e) {}
  // a versão mais nova do GitHub, guardada para a próxima página (a desta usa a guardada, sem esperar a rede); no máximo 1 consulta a cada 2 min
  // (a API sem login aceita 60 por hora por IP, e cada página aberta consultava)
  let quando = 0; try { quando = +localStorage.getItem('lm_previa_quando') || 0; } catch (e) {}
  if (!sha || Date.now() - quando > 120000) {
    try { localStorage.setItem('lm_previa_quando', String(Date.now())); } catch (e) {}
    fetch('https://api.github.com/repos/' + REPO + '/commits/main').then((r) => r.json()).then((j) => {
      if (j && j.sha && j.sha !== sha) { try { localStorage.setItem('lm_previa_sha', j.sha); } catch (e) {} if (!sha) location.reload(); }
    }).catch(() => {});
  }
  if (!sha) return;
  // ponytail: XHR síncrono (obsoleto, mas é o único jeito de rodar antes do tema); se um dia o Chrome barrar, trocar por @require
  const x = new XMLHttpRequest();
  x.open('GET', 'https://cdn.jsdelivr.net/gh/' + REPO + '@' + sha + '/cabecalho-snippet.html', false);
  try { x.send(); } catch (e) { return; }
  const m = x.status === 200 && x.responseText.match(/<script>([\s\S]*?)<\/script>/);
  if (!m) return;
  // No document-start o <html> ainda pode não existir e o jQuery e o script de métricas do tema (de onde o código tira o tipo da página e onde ele prende o frete) ainda não
  // rodaram. No ar o código entra no head depois deles: aqui ele espera o mesmo ponto (jQuery + o script com "page: {" no head) e só então roda, uma vez.
  const codigo = m[1].replace('@COMMIT/', '@' + sha + '/');
  let foi = false;
  const roda = () => { if (foi || !document.head) return; foi = true; obs.disconnect(); const s = document.createElement('script'); s.textContent = codigo; document.head.appendChild(s); };
  const pronto = () => window.jQuery && document.head && [].some.call(document.head.getElementsByTagName('script'), (e) => e.text.indexOf('page: {') >= 0);
  const obs = new MutationObserver(() => { if (pronto()) roda(); });
  obs.observe(document, { childList: true, subtree: true });
  addEventListener('DOMContentLoaded', roda);   // página sem o script de métricas: entra no fim do HTML
  // aviso discreto de que a prévia está ligada
  addEventListener('DOMContentLoaded', () => {
    const b = document.createElement('div');
    b.textContent = 'Prévia ligada';
    b.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:2147483647;padding:4px 10px;border-radius:999px;background:#018086;color:#fff;font:600 12px/1.4 system-ui,sans-serif;pointer-events:none;opacity:.85';
    document.body.appendChild(b);
  });
})();
