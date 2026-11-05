// Loren Metais, área logada: início da conta, pedidos, favoritos, endereços, dados, senha e cartões (carregado pelo loren.js).
// Só reorganiza e estiliza: nenhum texto é apagado ou reescrito. O menu da conta (que o tema esconde) vira a navegação
// e as abas, que repetem parte dele, saem. Login e cadastro são do paginas.*.
(() => {
  const b = document.body;
  if (!/pagina-conta|pagina-pedido|pagina-favorito/.test(b.className) || b.classList.contains('lm-conta') || document.querySelector('.pedido-finalizado')) return;  // a confirmação de compra (Pix, boleto) fica como o tema entrega
  b.classList.add('lm-conta');

  // menu: marca a página atual (o tema não marca; pedido e endereço contam como a seção deles)
  const caminho = location.pathname;
  const atual = /\/conta\/pedido/.test(caminho) ? '/conta/pedido/listar' : /\/conta\/(endereco|editar)/.test(caminho) ? '/conta/index' : caminho;
  document.querySelectorAll('.conta-menu .menu-simples a').forEach((a) => { if (a.pathname === atual) { a.classList.add('lm-ativo'); a.setAttribute('aria-current', 'page'); const ul = a.closest('ul'); ul.scrollLeft = a.getBoundingClientRect().left - ul.getBoundingClientRect().left - 16; } });  // no celular, o chip da página à vista

  // campos e botões nos componentes padrão da base
  document.querySelectorAll('#corpo .secao-principal form :is(input:not([type=hidden], [type=checkbox], [type=radio], [type=submit], [type=button]), select, textarea)').forEach((c) => c.classList.add('lm-campo'));
  document.querySelectorAll('#corpo .acao-editar a.botao:not(.principal)').forEach((a) => a.classList.add('lm-btn2'));
  document.querySelector('#formFiltroPedido button')?.classList.add('principal');

  // endereço: o tema deixa as ações soltas ao lado do formulário; ficam embaixo dele, na mesma coluna
  const acoes = document.querySelector('#corpo .secao-principal > .acao-editar');
  if (acoes?.previousElementSibling?.matches('.cadastro')) acoes.previousElementSibling.append(acoes);

  // tabela larga rola sozinha no celular, sem levar a página junto
  document.querySelectorAll('#corpo .abas-conteudo table').forEach((t) => { const w = document.createElement('div'); w.className = 'lm-conta-tab'; t.before(w); w.append(t); });

  // itens do pedido: no celular a tabela empilha e o título da coluna acompanha cada valor
  document.querySelectorAll('#corpo .table-pedido-item').forEach((t) => {
    const tit = [...t.querySelectorAll('thead th')].map((th) => th.textContent.trim());
    t.querySelectorAll('tbody tr').forEach((tr) => { if (tr.cells.length === tit.length) [...tr.cells].slice(1).forEach((td, i) => { td.dataset.rotulo = tit[i + 1]; }); });
  });

  // cabeçalho de página (componente do loren.js), nas telas que têm título próprio (endereço)
  const h1 = document.querySelector('#corpo .cabecalho-interno h1');
  if (h1 && window.lmPagcab) window.lmPagcab(h1);
})();
