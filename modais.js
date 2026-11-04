// Loren Metais: formulários em janela (Pedir orçamento e outros modais do tema), dono: Ellie
// - newsletter: a janela que o tema abre sozinha depois de 20 s sai (Eduardo 04/11); a faixa do rodapé e a coluna ficam.
// - campo com a classe .lm-campo (o campo padrão do loren.css) e rótulo acima, num .lm-grupo, com o texto do próprio placeholder ("Digite seu nome" -> "Nome"), ou mostrando o rótulo
//   escondido que o tema já tem; o placeholder repetido sai (fica só o de exemplo, como meu@email.com.br).
// - botão de envio com a classe .botao.principal (o desenho do loren.css). Nada é enviado por aqui.
(() => {
  // o tema agenda showModalNews() com setTimeout e chama pelo nome na hora: trocar a função basta
  window.showModalNews = () => {};

  let n = 0;
  const limpa = (t) => (t || '').replace(/^(digite|informe|selecione)\s+(o|a|seu|sua|um|uma)\s+/i, '').trim();
  const maiuscula = (t) => t.charAt(0).toUpperCase() + t.slice(1);
  const temTexto = (el) => el && el.textContent.trim().length > 0;

  const rotula = (raiz) => {
    if (!raiz) return;
    raiz.querySelectorAll('input:not([type=hidden]):not([type=radio]):not([type=checkbox]):not([type=submit]):not([type=button]), select, textarea:not(.g-recaptcha-response)').forEach((c) => {
      c.classList.add('lm-campo');   // campo padrão do loren.css (pill de 48)
      if (c.closest('.lm-grupo, .prod_qtd')) return;
      if (!c.id) c.id = 'lm-campo-' + ++n;
      // rótulo que o tema já tem: ligado pelo for ou irmão escondido (login: <label class="control-label hide">)
      const proprio = raiz.querySelector(`label[for="${c.id}"]`) || [...c.parentElement.children].find((e) => e.tagName === 'LABEL' && e !== c && temTexto(e));
      if (proprio) { proprio.classList.remove('hide'); proprio.htmlFor = c.id; return; }
      const texto = maiuscula(limpa(c.tagName === 'SELECT' ? c.options[0]?.text : c.placeholder));
      if (!texto) return;
      // campo dentro de <label> sem texto (avise-me: ícone + campo): o grupo envolve o label inteiro
      const alvo = c.parentElement.tagName === 'LABEL' && !temTexto(c.parentElement) ? c.parentElement : c;
      const grupo = document.createElement('div'); grupo.className = 'lm-grupo';
      alvo.before(grupo);
      grupo.innerHTML = `<label class="lm-rotulo" for="${c.id}"></label>`; grupo.firstChild.textContent = texto;
      grupo.append(alvo);
      if (c.placeholder && !/@|\d/.test(c.placeholder)) c.placeholder = '';
    });
    raiz.querySelectorAll('.consulta button[type=submit], .avise-btn input[type=submit]').forEach((b) => b.classList.add('botao', 'principal'));
    // janelas com dois botões (fale conosco, favorito): enviar/confirmar no botão principal, o "Fechar" no secundário
    // de contorno (.lm-btn2 do loren.css); as duas classes já têm a altura do padrão (48)
    const acoes = [...raiz.querySelectorAll('[type=submit], [data-dismiss="modal"]:not(.close), .modal-footer :is(.botao, .btn)')].filter((b) => !b.classList.contains('close'));
    // produto adicionado ao carrinho: "Continuar comprando" no mesmo secundário do "Fechar" das outras janelas
    raiz.querySelectorAll('.continuar-comprando').forEach((b) => b.classList.add('lm-btn2'));
    if (acoes.length > 1) acoes.forEach((b) => {
      const fecha = b.matches('[data-dismiss="modal"]');
      b.classList.add('botao', fecha ? 'lm-btn2' : 'principal'); b.classList.remove(fecha ? 'principal' : 'lm-btn2', 'btn-primary');
    });
  };

  // orçamento B2B: tipo de compra, quantidade e prazo. Os campos novos não têm name (não vão sozinhos para o envio do
  // tema, EmailJS): no submit, entram no fim da Mensagem junto com empresa/CNPJ e cidade/UF. O que a loja recebe continua
  // chegando; a Mensagem só fica mais completa.
  const opcoes = (l) => '<option value="">Selecione</option>' + l.map((o) => `<option>${o}</option>`).join('');
  const novos = (form) => {
    const msg = form.querySelector('textarea[name=mensagem]');
    if (!msg || form.querySelector('[data-lm]')) return;
    const temQtd = !form.querySelector('[name=qtd_form]');   // o orçamento do produto já tem Quantidade
    const campos = [
      ['tipo', 'Tipo de compra', `<select data-lm="tipo" id="lm-tipo-${++n}">${opcoes(['Obra', 'Empresa', 'Licitação', 'Consumidor final'])}</select>`, false],
      temQtd && ['qtd', 'Quantidade', `<input type="text" data-lm="qtd" id="lm-qtd-${++n}" placeholder="Ex.: 20 unidades de cada item">`, true],
      ['prazo', 'Prazo', `<select data-lm="prazo" id="lm-prazo-${++n}">${opcoes(['Imediato (até 7 dias)', 'Até 15 dias', 'Até 30 dias', 'Mais de 30 dias'])}</select>`, temQtd],
    ].filter(Boolean);
    const antes = msg.closest('.lm-grupo') || msg;
    for (const [, rotulo, html, par] of campos) {
      const g = document.createElement('div'); g.className = 'lm-grupo' + (par ? ' lm-par' : '');
      g.innerHTML = `<label class="lm-rotulo"></label>${html}`; g.lastChild.classList.add('lm-campo'); g.firstChild.textContent = rotulo; g.firstChild.htmlFor = g.lastChild.id;
      antes.before(g);
    }
  };
  const MARCA = 'Dados do orçamento (formulário):';
  const monta = (form) => {
    const v = (s) => (form.querySelector(s)?.value || '').trim();
    const pj = form.querySelector('input[name=pessoa]:checked')?.value === 'juridica';
    const linhas = [['Tipo de compra', v('[data-lm=tipo]')], ['Quantidade', v('[data-lm=qtd]')], ['Prazo', v('[data-lm=prazo]')],
      ['Empresa', pj ? v('[name=empresa]') : ''], ['CNPJ', pj ? v('[name=cnpj]') : ''],
      ['Cidade/UF', [v('[name=cidade]'), v('[name=estado]')].filter(Boolean).join('/')]].filter(([, x]) => x);
    // tira o bloco de um envio anterior (ex.: erro e nova tentativa) antes de montar de novo
    const base = v('textarea[name=mensagem]').split(MARCA)[0].trim();
    return linhas.length ? (base ? base + '\n\n' : '') + MARCA + '\n' + linhas.map(([k, x]) => `${k}: ${x}`).join('\n') : base;
  };
  window.lmMensagemOrcamento = monta;   // teste: monta a mensagem sem enviar nada
  // captura no document: roda antes do submit do tema (jQuery no próprio form, que envia pelo EmailJS)
  document.addEventListener('submit', (e) => {
    const f = e.target; const msg = f.matches?.('form.consulta') && f.querySelector('textarea[name=mensagem]');
    if (msg) msg.value = monta(f);
  }, true);
  const pares = (form) => form.querySelectorAll('[name=email], [name=tel], [name=cep], [name=estado], [name=cnpj], [name=empresa]').forEach((c) => c.closest('.lm-grupo')?.classList.add('lm-par'));

  const prepara = () => {
    ['#modal_consulte', '#modal_qtds', '#avise-me-cadastro', '#login-content', '#comprar-ajax-status'].forEach((s) => rotula(document.querySelector(s)));
    document.querySelectorAll('.modal form.consulta').forEach((f) => { novos(f); pares(f); });
    // fale conosco: o formulário chega por ajax de /contato/popup/
    const contato = document.querySelector('#modalContato');
    if (contato) new MutationObserver(() => rotula(contato)).observe(contato, { childList: true, subtree: true });
    if (window.jQuery) jQuery(document).on('shown shown.bs.modal', '.modal', function () { rotula(this); });
  };
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', prepara) : prepara();
})();
