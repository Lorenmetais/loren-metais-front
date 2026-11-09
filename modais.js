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
    // alerta, favorito e carregando vêm sem o fechar: toda janela tem o X de 44 no mesmo lugar
    if (raiz.matches('.modal') && !raiz.querySelector('.close')) raiz.insertAdjacentHTML('afterbegin', '<button type="button" class="close" data-dismiss="modal" aria-label="Fechar"><i></i></button>');
    if (raiz.matches('.modal')) raiz.classList.toggle('lm-sem-cab', !raiz.querySelector('.modal-header'));  // alerta e carregando
    raiz.querySelectorAll('input:not([type=hidden]):not([type=radio]):not([type=checkbox]):not([type=submit]):not([type=button]), select, textarea:not(.g-recaptcha-response)').forEach((c) => {
      c.classList.add('lm-campo');   // campo padrão do loren.css (pill de 48)
      if (c.closest('.lm-grupo, .prod_qtd')) return;
      if (!c.id) c.id = 'lm-campo-' + ++n;
      // rótulo que o tema já tem: ligado pelo for ou irmão escondido (login: <label class="control-label hide">)
      const proprio = raiz.querySelector(`label[for="${c.id}"]`) || [...c.parentElement.children].find((e) => e.tagName === 'LABEL' && e !== c && temTexto(e));
      if (proprio) { proprio.classList.remove('hide'); proprio.classList.add('lm-rotulo'); proprio.htmlFor = c.id; return; }
      const texto = maiuscula(limpa(c.tagName === 'SELECT' ? c.options[0]?.text : c.placeholder));
      if (!texto) return;
      // campo dentro de <label> sem texto (avise-me: ícone + campo): o grupo envolve o label inteiro
      const alvo = c.parentElement.tagName === 'LABEL' && !temTexto(c.parentElement) ? c.parentElement : c;
      const grupo = document.createElement('div'); grupo.className = 'lm-grupo'; grupo.dataset.campo = c.name || '';   // ordem na grade das janelas grandes
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
    // sem :has (o navegador reavalia :has a cada mudança do DOM e atrasava o ready do tema, Rocky 09/11): fale conosco em pares (bloco com grupos, grupo de uma linha só) e a linha dos botões
    raiz.querySelectorAll('.controls').forEach((c) => c.classList.toggle('lm-acoes', !!c.querySelector(':scope > button.principal')));
    raiz.querySelectorAll('[class*="span"]').forEach((s) => s.classList.toggle('lm-contato-grade', !!s.querySelector(':scope > .control-group')));
    raiz.querySelectorAll('.control-group').forEach((g) => g.classList.toggle('lm-meio', !!g.querySelector('input.lm-campo') && !g.querySelector('textarea, .g-recaptcha, button')));
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
      const g = document.createElement('div'); g.className = 'lm-grupo' + (par ? ' lm-par' : ''); g.dataset.campo = html.match(/data-lm="(\w+)"/)[1];
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

  // produto adicionado ao carrinho: o tema recarrega /carrinho/mini na janela a cada mudança, então tudo aqui roda de novo
  // a cada carga. Só marca as células (a grade é do modais.css), acrescenta o subtotal da linha e recolhe o cupom; os links
  // e formulários continuam os do tema, que escuta os cliques em #carrinho-mini .table-body
  const brl = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const valor = (el) => parseFloat((el?.textContent || '').replace(/[^\d,]/g, '').replace(',', '.'));
  const miniCarrinho = (mini) => {
    mini.querySelectorAll('.table-body tr').forEach((tr) => {
      if (tr.querySelector('.lm-mini-sub') || tr.cells.length < 5) return;
      const [foto, nome, preco, qtd, exc] = tr.cells;
      foto.classList.add('lm-mini-foto'); nome.classList.add('lm-mini-nome'); preco.classList.add('lm-mini-preco'); qtd.classList.add('lm-mini-qtd'); exc.classList.add('lm-mini-exc');
      const img = foto.querySelector('img'); if (img) img.src = img.src.replace('/64x64/', '/300x300/');  // o tema pede 64 px; a foto aqui tem 80
      exc.querySelector('a')?.setAttribute('aria-label', 'Remover do carrinho');
      nome.querySelectorAll('li').forEach((li) => { if (/^estoque:\s*disponível$/i.test(li.textContent.trim().replace(/\s+/g, ' '))) li.remove(); });  // prazo ou aviso de estoque continuam
      const campo = qtd.querySelector('input[name=quantidade]'); window.lmQtd?.(campo);
      const unit = valor(preco.querySelector('.preco-promocional, strong'));
      const caixaPreco = preco.querySelector('.preco-produto'); if (caixaPreco) nome.append(caixaPreco);  // preço embaixo do nome, na mesma célula
      const sub = document.createElement('td'); sub.className = 'lm-mini-sub'; sub.textContent = unit && campo ? brl(unit * (parseInt(campo.value, 10) || 1)) : '';
      exc.before(sub);
    });
    const form = mini.querySelector('.table-footer form'), linha = form?.closest('tr');
    if (linha && !linha.querySelector('.lm-mini-cupom-abre')) {
      linha.classList.add('lm-mini-cupom');
      form.querySelector('input[name=cupom]')?.classList.add('lm-campo');
      form.querySelector('button')?.classList.add('botao', 'principal');
      form.insertAdjacentHTML('beforebegin', '<button type="button" class="lm-mini-cupom-abre" aria-expanded="false">Tem cupom de desconto?</button>');
      const abre = linha.querySelector('.lm-mini-cupom-abre');
      abre.addEventListener('click', () => { const on = linha.classList.toggle('lm-aberto'); abre.setAttribute('aria-expanded', on); if (on) form.querySelector('input[name=cupom]')?.focus(); });
    }
  };
  // quantidade: atualiza sozinha ao mudar, pelo mesmo submit que o botão "Atualizar quantidade" do tema dispara (ajax dele).
  // Espera meio segundo para vários cliques no + virarem um envio só
  let esperaQtd;
  const mudaQtd = (e) => {
    const c = e.target; if (!c.matches?.('#carrinho-mini input[name=quantidade], .pagina-carrinho .quantidade input[name=quantidade]')) return;  // a página do carrinho usa o mesmo (paginas.js, Wednesday)
    clearTimeout(esperaQtd);
    esperaQtd = setTimeout(() => { const f = c.form, atual = f?.querySelector('[name=quantidade_atual]')?.value; if (f && c.value !== atual && window.jQuery) jQuery(f).trigger('submit'); }, 500);
  };

  // palavra com hífen não parte em duas linhas nos títulos ("por e-/mail"): o navegador quebra depois do hífen. O texto não
  // muda, só ganha um <nobr> em volta (span pegaria a fonte de texto da regra geral do loren.css; nobr herda a do título)
  const semQuebra = () => document.querySelectorAll('h1, h2, h3, h4, h5, h6, .titulo, .nome-produto, .avise-tit, .avise-suc-tit, .modal-header > span').forEach((el) => {
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), nos = [];
    for (let n; (n = w.nextNode());) if (/\p{L}-\p{L}/u.test(n.textContent) && !n.parentElement.closest('nobr')) nos.push(n);
    nos.forEach((n) => { const frag = document.createDocumentFragment(); n.textContent.split(/([\p{L}\d]+(?:-[\p{L}\d]+)+)/u).forEach((p, i) => { if (i % 2) { const b = document.createElement('nobr'); b.textContent = p; frag.append(b); } else if (p) frag.append(p); }); n.replaceWith(frag); });
  });

  const prepara = () => {
    semQuebra();
    ['#modal_consulte', '#modal_qtds', '#avise-me-cadastro', '#login-content', '#comprar-ajax-status'].forEach((s) => rotula(document.querySelector(s)));
    // as outras janelas do tema que já estão na página (ex.: recuperar senha do login, que abre sozinha pelo #recuperar_senha)
    document.querySelectorAll('.modal').forEach(rotula);
    // orçamento: o tema enviava o formulário vazio (testado 09/11, com o envio barrado); com required o navegador não dispara o
    // submit (que é por onde o tema envia) e mostra o aviso no campo
    document.querySelectorAll('.modal form.consulta').forEach((f) => { novos(f); pares(f); f.querySelectorAll('[name=nome], [name=email], [name=tel]').forEach((c) => (c.required = true)); });
    // fale conosco: o formulário chega por ajax de /contato/popup/
    const contato = document.querySelector('#modalContato');
    if (contato) new MutationObserver(() => rotula(contato)).observe(contato, { childList: true, subtree: true });
    // fale conosco: o aviso "campos obrigatórios" do tema aparece no alto da janela, logo abaixo do título, e a janela tinha
    // rolado até o Enviar; volta ao topo para mostrar título e aviso
    contato?.addEventListener('click', (e) => {
      if (!e.target.closest('button.principal, [type=submit]')) return;
      setTimeout(() => { if ([...contato.querySelectorAll('.alert')].some((a) => a.offsetHeight)) contato.scrollTo({ top: 0, behavior: 'smooth' }); }, 400);
    });
    if (window.jQuery) jQuery(document).on('shown shown.bs.modal', '.modal', function () { rotula(this); });
    const mini = document.querySelector('#carrinho-mini');
    if (mini) new MutationObserver(() => miniCarrinho(mini)).observe(mini, { childList: true });
    document.addEventListener('change', mudaQtd);
    // sem :has (o navegador reavalia :has a cada mudança do DOM e atrasava o ready do tema, Rocky 09/11): janela aberta (fundo do Bootstrap ou do fancybox no body) tira o aviso de cookies da frente, e
    // a janela do fancybox com o "Produto adicionado" visível ganha a largura de 720. Observa só os filhos do body
    const estado = () => {
      document.documentElement.classList.toggle('lm-janela-aberta', !!document.querySelector('body > .modal-backdrop, .fancybox-overlay'));
      const s = document.querySelector('#comprar-ajax-status > .sucesso'), w = s?.closest('.fancybox-wrap');
      document.querySelectorAll('.fancybox-wrap.lm-jan-carrinho').forEach((x) => x !== w && x.classList.remove('lm-jan-carrinho'));
      w?.classList.toggle('lm-jan-carrinho', !(s.getAttribute('style') || '').includes('none'));
    };
    new MutationObserver(estado).observe(document.body, { childList: true });
    const fb = window.jQuery?.fancybox?.defaults;  // a janela já montada, antes de aparecer; se o tema passar beforeShow próprio, o observer do body cobre
    if (fb) { const antes = fb.beforeShow; fb.beforeShow = function () { estado(); return antes?.apply(this, arguments); }; }
  };
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', prepara) : prepara();
})();
