# Resumo da Configuração: Prisma + Supabase PostgreSQL

Este documento resume as etapas realizadas para configurar o ORM Prisma no projeto `apps/api` utilizando um banco de dados PostgreSQL hospedado no Supabase.

## 1. Instalação de Dependências
Foram instalados os pacotes necessários para o funcionamento do Prisma:
- `prisma`: CLI do Prisma (instalado como dependência de desenvolvimento).
- `@prisma/client`: Cliente para execução de queries no banco de dados.

## 2. Inicialização do Prisma
O projeto foi inicializado através do comando:
```bash
npx prisma init
```
Isso gerou a estrutura básica na pasta `apps/api/prisma/` e o arquivo de configuração `prisma.config.ts`.

## 3. Estruturação dos Arquivos de Configuração

### `apps/api/prisma/schema.prisma`
Configurado para utilizar o PostgreSQL como provedor:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}
```

### `apps/api/prisma.config.ts`
Arquivo de configuração centralizado que carrega as variáveis de ambiente utilizando `dotenv`:
```typescript
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
```

## 4. Variáveis de Ambiente (`.env`)
Configuramos dois tipos de conexão essenciais para o funcionamento com Supabase:
- **`DATABASE_URL`**: Conexão via **Transaction Pooler** (Porta 6543), ideal para o uso contínuo da API.
- **`DIRECT_URL`**: Conexão direta com o banco (Porta 5432), necessária para realizar migrações e comandos administrativos.

A estrutura da URL segue o padrão:
`postgres://postgres.[PROJECT_REF]:[SENHA]@[REGIAO].pooler.supabase.com:[PORTA]/postgres`

## 5. Status da Conexão e Testes
- **Erro Identificado**: `FATAL: Tenant or user not found`.
- **Causa Provável**: Credenciais incorretas (senha ou Project Ref) ou string de região (`sa-east-1`, `us-east-1`, etc.) divergente do projeto real.
- **Solução Recomendada**: Copiar a string de conexão oficial diretamente do painel do Supabase em *Project Settings > Database > Connection String*.

## 6. Próximos Passos
1. Corrigir as credenciais no arquivo `.env`.
2. Validar a conexão rodando:
   ```bash
   npx prisma db pull
   ```
3. Definir os modelos (tabelas) no `schema.prisma`.
4. Executar a primeira migration:
   ```bash
   npx prisma migrate dev --name init
   ```

## Script para criar as pastas e arquivos das features
```bash
create_folder.sh
```
Para compilar
```bash
chmod +x create_folder.sh
```

Para executar:
```bash
./create_folder.sh nome_da_feature
```

 Exemplo:

```Bash
./create_folder.sh user
```
 Resultado
 ```Plaintext
user/
├── user.controller.ts
├── user.model.ts
├── user.routes.ts
├── user.service.ts
└── user.types.ts
 ```

 
