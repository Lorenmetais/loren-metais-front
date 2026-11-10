# Gera as 2 entradas do painel da Loja Integrada (o campo aceita 15.000 caracteres; o código legível passa disso) a partir de cabecalho-snippet.html.
# Parte 1: a lógica e a casca básica (sorteio, ?lm=, plano B, cortes do tema, carregador, botão da equipe). Parte 2: só o esqueleto, cujas regras exigem
# html.lm-novo (a parte 1 liga), então a ordem das 2 entradas não importa. Enxuga tirando comentários e recuo; troca COMMIT pelo hash e põe PERCENTUAL = 0.
# Uso (na pasta do repositório): python painel/gera.py <hash completo> [--saida <pasta>] [--arquivo]   (--arquivo: usa o cabecalho-snippet.html da pasta, não o do commit)
import os, re, shutil, subprocess, sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LIMITE = 14500   # folga dentro dos 15.000 do campo (o painel conta cada quebra de linha como 2)


def divide(L):
    """Corta pelo texto (não pelo número da linha) e devolve (parte1, parte2) legíveis."""
    def um(ini):
        r = [i for i, l in enumerate(L) if l.startswith(ini)]
        if len(r) != 1: sys.exit(f'corte não achado (ou repetido): {ini!r}')
        return r[0]
    iE, iB = um('  // ESQUELETO'), um('  casca.textContent = ("§body')
    iF, iH = um('    + "}@media(max-width:767px){§body::before'), um('  head.appendChild(casca)')
    assert iE < iB < iF < iH and L[iB + 1].startswith('    + "html.lm-novo{--b') and L[iF + 2].startswith("  document.addEventListener('DOMContentLoaded'")
    tab = "{§#cabecalho::before{height:79px;border:0;background-position:' + T + ' 16px}§body'"
    iT = [i for i in range(iB, iF) if tab in L[i]]; assert len(iT) == 1
    fim = L[iF][len('    + "'):]
    movel = fim[1:fim.index('").replace(')]
    p1 = L[:iE] + [L[iB],   # casca básica + logo do tablet + bloco do celular; o esqueleto fica na parte 2
        "    + '@media(min-width:768px) and (max-width:1023px){§#cabecalho::before{height:79px;border:0;background-position:clamp(24px,4vw,40px) 16px}}'",
        '    + "' + movel + '").replace(/§/g, \'html.lm-novo:not(.lm-pronto) \');'] + L[iH:]
    L = L[:]; L[iT[0]] = L[iT[0]].replace(tab, "{§body'")
    p2 = ['<script>', '(function () {', "  if (/\\/(checkout|pagamento)/i.test(location.pathname)) return;",
        "  var h = document.documentElement, head = document.head || h, casca = document.createElement('style');"] + L[iE:iB] + ['  casca.textContent = (""'] \
        + L[iB + 1:iF] + ['    + "}").replace(/§/g, \'html.lm-novo:not(.lm-pronto) \');'] + L[iF + 1:iH] + ['  head.appendChild(casca);', '})();', '</script>']
    return p1, p2


def enxuga(linhas):
    """Tira linhas de comentário, comentários no fim da linha (depois de 2+ espaços, fora de texto entre aspas) e o recuo."""
    out = []
    for l in linhas:
        s = l.strip()
        if not s or s.startswith('//'): continue
        m = re.search(r'\s{2,}//\s', l)
        if m and all(l[:m.start()].count(q) % 2 == 0 for q in '\'"`'): l = l[:m.start()]
        out.append(l.strip())
    return out


def main():
    a = sys.argv[1:]
    if not a or not re.fullmatch(r'[0-9a-f]{40}', a[0]): sys.exit(__doc__ or 'uso: python painel/gera.py <hash completo (40)> [--saida <pasta>] [--arquivo]')
    h = a[0]; saida = a[a.index('--saida') + 1] if '--saida' in a else '.'
    if '--arquivo' in a: txt = open(os.path.join(REPO, 'cabecalho-snippet.html'), encoding='utf8').read()
    else: txt = subprocess.run(['git', '-C', REPO, 'show', f'{h}:cabecalho-snippet.html'], capture_output=True, check=True).stdout.decode('utf8')
    txt = txt.replace('\r\n', '\n')
    assert txt.count('@COMMIT/') == 1 and txt.count('var PERCENTUAL = 100;') == 1
    txt = txt.replace('@COMMIT/', '@' + h + '/').replace('var PERCENTUAL = 100;', 'var PERCENTUAL = 0;')
    cab = {1: f'<!-- Loren Metais, visual novo: PARTE 1 de 2 (commit {h[:7]}, PERCENTUAL = 0). Cabeçalho, todas as páginas exceto checkout; as 2 partes em entradas separadas, em qualquer ordem. Fonte: cabecalho-snippet.html -->',
           2: f'<!-- Loren Metais, visual novo: PARTE 2 de 2, esqueleto (commit {h[:7]}). Cabeçalho, todas as páginas exceto checkout; as 2 partes em entradas separadas, em qualquer ordem -->'}
    L = txt.rstrip('\n').split('\n'); assert L[0].startswith('<!--')
    for n, p in zip((1, 2), divide(L[1:])):
        s = cab[n] + '\n' + '\n'.join(enxuga(p)) + '\n'
        js = s[s.index('<script>') + 8:s.rindex('</script>')]
        assert s.count('<script>') == 1 and s.count('</script>') == 1
        if shutil.which('node'):   # sintaxe (se houver Node): o mesmo parser do navegador
            r = subprocess.run(['node', '-e', 'new Function(require("fs").readFileSync(0, "utf8"))'], input=js.encode('utf8'), capture_output=True)
            if r.returncode: sys.exit(f'parte {n}: erro de sintaxe depois de enxugar\n{r.stderr.decode()[:500]}')
        tam = len(s) + s.count('\n')
        if tam > LIMITE: sys.exit(f'parte {n}: {tam} caracteres, passa de {LIMITE}')
        arq = os.path.join(saida, f'COLAR-NO-PAINEL-{n}.html')
        open(arq, 'w', encoding='utf8', newline='\n').write(s)
        print(f'{arq}: {tam} caracteres (contando cada quebra de linha como 2)')


if __name__ == '__main__':
    main()
