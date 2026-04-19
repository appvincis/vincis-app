#!/bin/bash

# Verifica se o nome foi passado
if [ -z "$1" ]; then
  echo "Uso: $0 <nome-do-modulo>"
  exit 1
fi

MODULE="$1"

# Resolve o caminho absoluto do diretório do script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FEATURES_DIR="$SCRIPT_DIR/../features"

# Cria a pasta do módulo
mkdir -p "$FEATURES_DIR/$MODULE"

# Cria os arquivos dentro da pasta
touch "$FEATURES_DIR/$MODULE/$MODULE.controller.ts" \
      "$FEATURES_DIR/$MODULE/$MODULE.model.ts" \
      "$FEATURES_DIR/$MODULE/$MODULE.service.ts" \
      "$FEATURES_DIR/$MODULE/$MODULE.routes.ts" \
      "$FEATURES_DIR/$MODULE/$MODULE.types.ts"

echo "Estrutura criada para o módulo: $MODULE"