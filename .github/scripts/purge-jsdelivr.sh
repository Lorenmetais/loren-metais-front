#!/usr/bin/env bash
# Limpa o cache do jsDelivr de /gh/<repo>@<ramo>/ para os caminhos recebidos na entrada (um por linha), mais a versão -min de cada .js/.css.
# Uma chamada só; o limite do jsDelivr (throttled + throttlingReset em segundos) vira aviso, com 1 nova tentativa depois do reset (até 15 min).
# Uso (nos fluxos): echo "$lista" | bash .github/scripts/purge-jsdelivr.sh <ramo>      Precisa de curl, jq e GITHUB_REPOSITORY.
set -e
RAMO=$1; [ -n "$RAMO" ] || { echo "uso: purge-jsdelivr.sh <ramo>"; exit 2; }
# o painel pode pedir as versões -min.css/-min.js (ramo producao-min, min-producao.yml): limpa as duas
lista=$(grep . | awk '{ print } /\.(js|css)$/ && !/[.-]min\.(js|css)$/ { sub(/\.(js|css)$/, "-min&"); print }' | sort -u)
[ -n "$lista" ] || { echo "nada para limpar em @$RAMO"; exit 0; }
caminhos=$(echo "$lista" | jq -R --arg r "/gh/${GITHUB_REPOSITORY}@${RAMO}/" '$r + .' | jq -sc '{path: .}')
echo "$(echo "$caminhos" | jq '.path | length') arquivos em @$RAMO:"; echo "$lista"
purga() {
  id=$(curl -sf --retry 3 -X POST https://purge.jsdelivr.net/ -H 'Content-Type: application/json' -d "$caminhos" | jq -r .id)
  for i in $(seq 1 30); do
    r=$(curl -sf --retry 3 "https://purge.jsdelivr.net/status/$id")
    [ "$(echo "$r" | jq -r .status)" = finished ] && break
    sleep 2
  done
  echo "$r" | jq -r '.status'
  limitados=$(echo "$r" | jq '[.paths // {} | .[] | select(.throttled)] | length')
  espera=$(echo "$r" | jq '[.paths // {} | .[] | .throttlingReset // 0] | max // 0 | floor')
}
purga
if [ "$limitados" != 0 ] && [ "$espera" -le 900 ]; then
  echo "::warning::jsDelivr limitou o purge de $limitados arquivos; nova tentativa em $((espera + 10)) s"
  sleep $((espera + 10)); purga
fi
falhas=$(echo "$r" | jq '[.paths // {} | .[] | select((.throttled | not) and (.providers // {} | to_entries | any(.value | not)))] | length')
[ "$(echo "$r" | jq -r .status)" = finished ] && [ "$falhas" = 0 ] || { echo "purge incompleto: $falhas arquivos"; echo "$r" | jq .; exit 1; }
if [ "$limitados" != 0 ]; then
  echo "::warning::jsDelivr ainda limitando $limitados arquivos (reset em $espera s): @$RAMO renova sozinho em até 12 h, ou rode o fluxo à mão depois do reset"
else
  echo "ok: jsDelivr de @$RAMO renovado"
fi
