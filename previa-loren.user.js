// ==UserScript==
// @name         Prévia Loren (liga e desliga)
// @namespace    loren-metais
// @version      2.0
// @description  Com a prévia ligada (favorito "Prévia Loren"), toda página da lorenmetais.com.br abre com o código do main (o que ainda não foi para o producao). Só neste navegador.
// @match        https://www.lorenmetais.com.br/*
// @match        https://lorenmetais.com.br/*
// @run-at       document-start
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/Lorenmetais/loren-metais-front/main/previa-loren.user.js
// @updateURL    https://raw.githubusercontent.com/Lorenmetais/loren-metais-front/main/previa-loren.user.js
// ==/UserScript==
// 18/11 (entrada única no painel): troca o código do ar pelo do main, no mesmo ponto do <head>. Quando o parser põe as tags do trecho fixo (painel/TRECHO-FIXO.html),
// o <link id="lm-esq"> vira o esqueleto do main (painel/esqueleto.js rodado aqui) e o <script> do inicio.js do Pages não roda: no lugar dele roda o inicio.js do main.
// Sem o trecho fixo na página (checkout), não faz nada.
(function () {
  let ligada = false;
  try { ligada = localStorage.getItem('lm_previa') === '1'; } catch (e) {}
  if (!ligada) return;
  const REPO = 'Lorenmetais/loren-metais-front';
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
  // ponytail: XHR síncrono (obsoleto, mas é o único jeito de rodar no mesmo ponto do código do ar); se um dia o Chrome barrar, trocar por @require
  const pega = (arq) => { const x = new XMLHttpRequest(); x.open('GET', 'https://cdn.jsdelivr.net/gh/' + REPO + '@' + sha + '/' + arq, false);
    try { x.send(); } catch (e) { return ''; } return x.status === 200 ? x.responseText : ''; };
  const ini = pega('inicio.js'), esq = pega('painel/esqueleto.js');
  if (!ini || !esq) return;
  let css = ''; try { new Function('process', esq)({ stdout: { write: (t) => { css += t; } } }); } catch (e) { return; }
  const codigo = ini.replace('@COMMIT/', '@' + sha + '/');
  const obs = new MutationObserver((ms) => { for (const m of ms) for (const n of m.addedNodes) {
    if (n.tagName === 'LINK' && n.id === 'lm-esq') { const st = document.createElement('style'); st.id = 'lm-esq'; st.textContent = css; n.replaceWith(st); }
    else if (n.tagName === 'SCRIPT' && /github\.io\/loren-metais-front\/inicio\.js/.test(n.src)) {
      n.type = 'javascript/blocked'; const s = document.createElement('script'); s.textContent = codigo; n.after(s); obs.disconnect(); } } });
  obs.observe(document, { childList: true, subtree: true });
  addEventListener('DOMContentLoaded', () => obs.disconnect());
  // aviso discreto de que a prévia está ligada
  addEventListener('DOMContentLoaded', () => {
    const b = document.createElement('div');
    b.textContent = 'Prévia ligada';
    b.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:2147483647;padding:4px 10px;border-radius:999px;background:#018086;color:#fff;font:600 12px/1.4 system-ui,sans-serif;pointer-events:none;opacity:.85';
    document.body.appendChild(b);
  });
})();
