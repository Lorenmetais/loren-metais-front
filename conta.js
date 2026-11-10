// Loren Metais, área logada: início da conta, pedidos, favoritos, endereços, dados, senha e cartões (carregado pelo loren.js).
// Só reorganiza e estiliza: nenhum texto é apagado ou reescrito. O menu da conta (que o tema esconde) vira a navegação
// e as abas, que repetem parte dele, saem. Login e cadastro são do paginas.*.
(() => {
  const b = document.body;
  if (!/pagina-conta|pagina-pedido|pagina-favorito/.test(b.className) || b.dataset.lmConta || document.querySelector('.pedido-finalizado')) return;  // a confirmação de compra (Pix, boleto) fica como o tema entrega
  b.dataset.lmConta = '1'; b.classList.add('lm-conta');  // a classe pode já vir do loren.js, antes de a página aparecer

  // menu: marca a página atual (o tema não marca; pedido e endereço contam como a seção deles)
  const caminho = location.pathname;
  const atual = /\/conta\/pedido/.test(caminho) ? '/conta/pedido/listar' : /\/conta\/(endereco|editar)/.test(caminho) ? '/conta/index' : caminho;
  document.querySelectorAll('.conta-menu .menu-simples a').forEach((a) => { if (a.pathname === atual) { a.classList.add('lm-ativo'); a.setAttribute('aria-current', 'page'); const ul = a.closest('ul'), d = a.getBoundingClientRect().right - ul.getBoundingClientRect().right; if (d > 0) ul.scrollLeft += d + 16; } });  // no celular, o chip da página à vista (só rola se ele estiver cortado; senão a fila começa no 1º)

  // campos e botões nos componentes padrão da base
  document.querySelectorAll('#corpo .secao-principal form :is(input:not([type=hidden], [type=checkbox], [type=radio], [type=submit], [type=button]), select, textarea)').forEach((c) => c.classList.add('lm-campo'));
  document.querySelectorAll('#corpo .acao-editar a.botao:not(.principal)').forEach((a) => a.classList.add('lm-btn2'));
  document.querySelector('#formFiltroPedido button')?.classList.add('principal');

  // endereço: o tema deixa as ações soltas ao lado do formulário; ficam embaixo dele, na mesma coluna
  const acoes = document.querySelector('#corpo .secao-principal > .acao-editar');
  if (acoes?.previousElementSibling?.matches('.cadastro')) acoes.previousElementSibling.append(acoes);
  // classes no lugar de :has() no conta.css (navegador antigo descarta a regra inteira): grade com o menu e cartão dos formulários
  const filho = (e, cls) => [...e.children].some((c) => c.classList.contains(cls));
  document.querySelectorAll('#corpo .secao-principal').forEach((s) => { if (filho(s, 'coluna')) s.classList.add('lm-conta-grade'); });
  document.querySelectorAll('#corpo .cadastro, #corpo .cadastro form').forEach((e) => { if (filho(e, 'acao-editar')) e.classList.add('lm-form-cartao'); });

  // itens do pedido: no celular a tabela empilha e o título da coluna acompanha cada valor
  document.querySelectorAll('#corpo .table-pedido-item').forEach((t) => {
    const tit = [...t.querySelectorAll('thead th')].map((th) => th.textContent.trim());
    t.querySelectorAll('tbody tr').forEach((tr) => { if (tr.cells.length === tit.length) [...tr.cells].slice(1).forEach((td, i) => { td.dataset.rotulo = tit[i + 1]; }); });
  });

  // cabeçalho de página (componente do loren.js), nas telas que têm título próprio (endereço)
  const h1 = document.querySelector('#corpo .cabecalho-interno h1');
  if (h1 && window.lmPagcab) window.lmPagcab(h1);
})();
