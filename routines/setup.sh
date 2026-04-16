#!/bin/bash
echo "================== INICIANDO SETUP DO VINCIS"

echo "Limpando /node_modules"

rm -rf ./node_modules
rm -rf ./apps/api/node_modules
rm -rf ./apps/web/node_modules

echo "Instalando dependências raíz..."

npm install

echo "Instalando dependências web..."

cd apps/web
npm install
cd ../..

echo "Instalando dependências servidor..."

cd apps/api
npm install

echo "Gerando conexão do prisma..."

npx prisma init
npx prisma generate

echo "======================= SETUP CONCLUÍDO!"

cd ../..