# Guia de Configuração e Execução do Projeto

Este projeto foi atualizado para usar o **Node v22 (LTS)** e teve sua árvore de dependências corrigida. Siga os passos abaixo para garantir que seu ambiente esteja configurado corretamente.

## Pré-requisitos

- **Node.js v22 (LTS)**: Utilizamos o arquivo `.nvmrc` e a regra `engine-strict` para forçar esta versão.
- **NVM** (Node Version Manager): Recomendado para gerenciar as versões do Node.

## Primeiros Passos

### 1. Atualize seu repositório local
```bash
git pull
```

### 2. Mude para o Node v22
Se você tiver o NVM instalado, rode:
```bash
nvm install 22
nvm use 22
```
*Nota: No Windows, use `nvm use 22.x.x` (verifique a versão instalada com `nvm list`).*

### 3. Limpeza e Instalação de Dependências
Se você estava enfrentando o erro `ERR_MODULE_NOT_FOUND`, você **precisa** apagar sua pasta `node_modules` atual primeiro.

**Windows (PowerShell):**
```powershell
Remove-Item -Recurse -Force node_modules
npm install
```

**Mac/Linux:**
```bash
rm -rf node_modules
npm install
```

### 4. Gerar o Cliente do Prisma
Navegue até a pasta da API e gere o cliente:
```bash
cd apps/api
npx prisma generate
cd ../..
```

### 5. Rodando o Projeto
Para iniciar o front-end e o back-end em paralelo:
```bash
npm run dev
```

## Solução de Problemas

### Erro "UnauthorizedAccess" ao rodar npm
Se você receber um erro de segurança no PowerShell do Windows, tente rodar o comando através do CMD:
```bash
cmd /c "npm install"
```

### Erro de conexão do Engine ("Engine connection error")
Certifique-se de que está usando o Node >= 22.0.0. O arquivo `.npmrc` está configurado para bloquear instalações em versões anteriores para evitar a corrupção do arquivo de lock.
