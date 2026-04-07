#!/bin/bash

# Verifica se o nome foi passado
if [ -z "$1" ]; then
  echo "Uso: $0 <nome-do-modulo>"
  exit 1
fi

MODULE="$1"

# Cria a pasta do módulo
mkdir -p "$MODULE"

# Cria os arquivos dentro da pasta
touch $MODULE/$MODULE.controller.ts \
      $MODULE/$MODULE.model.ts \
      $MODULE/$MODULE.service.ts \
      $MODULE/$MODULE.routes.ts \
      $MODULE/$MODULE.types.ts

echo "Estrutura criada para o módulo: $MODULE"