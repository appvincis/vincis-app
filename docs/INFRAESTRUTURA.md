# 11. Infraestrutura da Aplicação

Este capítulo detalha as especificações físicas, lógicas e operacionais da infraestrutura do **Vincis**. O projeto foi estruturado utilizando conceitos modernos de desmembramento de serviços (decoupling), computação distribuída e controle transacional escalável.

---

## 11.1. Arquitetura Geral de Implantação (Deployment Architecture)

O Vincis opera sob um modelo de **desacoplamento total** entre a camada de apresentação (Frontend SPA) e a camada de serviços (Backend API RESTful), integrando serviços nativos em nuvem de infraestrutura (PaaS) e de persistência (DB/Storage-as-a-Service).

```mermaid
flowchart TDw
    subgraph Cliente["Camada de Apresentação (Dispositivo do Usuário)"]
        UserBrowser["Navegador Web (Vue 3 Client)"]
        LocalStorage["Cookie / Pinia Storage (Estadual Local)"]
    end

    subgraph CDN["Plataforma de Borda (Vercel CDN / Netlify)"]
        StaticDistrib["Arquivos Estáticos (HTML5 / CSS3 / ES6+)"]
    end

    subgraph Servicos["Hospedagem da API (Railway / Render / AWS ECS Container)"]
        ExpressApp["API Server (Express 5.x + TypeScript)"]
        PortaAPI["Porta: 4000 (ou process.env.PORT)"]
    end

    subgraph SupabaseCloud["Banco de Dados & Storage (AWS sa-east-1 - São Paulo)"]
        SupabaseAuth["Supabase Identity Provider (JWT Verification)"]
        SupabaseStorage["Supabase Storage (Bucket 'editais')"]
        
        subgraph PostgreSQLCluster["Cluster de Banco de Dados PostgreSQL"]
            PgBouncer["PgBouncer Connection Pooler (Porta 6543 - Modo Transação)"]
            DirectDB["Banco de Dados Direto (Porta 5432 - Migrations/DDL)"]
        end
    end

    subgraph Terceiros["Provedores e Gateways Externos"]
        AIService["Provedores LLM (Gemini API / OpenAI API)"]
        PaymentAPI["AbacatePay SaaS API (Pix & Billing)"]
        Smee["Smee.io Webhook Forwarder (Local Dev Only)"]
    end

    %% Relações e Comunicações
    UserBrowser -->|Carrega Estáticos via HTTP/2| StaticDistrib
    UserBrowser -->|Armazena tokens de preferência e plano| LocalStorage
    UserBrowser -->|Requisições HTTP com Cookies e Credentials| ExpressApp
    ExpressApp -->|Porta 6543: Consulta Transacional| PgBouncer
    ExpressApp -->|Porta 5432: Migrações de Estrutura| DirectDB
    ExpressApp -->|Upload de PDFs / Upload Multipart| SupabaseStorage
    ExpressApp -->|Consultas de Identidade| SupabaseAuth
    ExpressApp -->|Integração de Faturamento e Assinaturas| PaymentAPI
    ExpressApp -->|Extração Automatizada de Editais| AIService
    PaymentAPI -->|Notificações de Pagamento (Webhooks)| Smee
    Smee -->|Redirecionamento Local| ExpressApp
```

---

## 11.2. Especificação de Tecnologias por Camada

### 1. Camada de Frontend
* **Hospedagem:** Redes de Distribuição de Conteúdo (CDNs) da **Vercel** ou **Netlify**.
* **Mecanismo de Build:** **Vite 8**. O build de produção transpila e minifica o código para arquivos estáticos (`.html`, `.js` e `.css`) otimizados em chunks menores.
* **Hospedagem Estática:** A CDN gerencia a distribuição geográfica, entregando o aplicativo da borda com compactação Brotli/Gzip e cabeçalhos de controle de cache rígidos (`Cache-Control`).
* **Resolução de Rotas (Fallback):** Como o frontend é uma Single Page Application (SPA), o servidor de hospedagem é configurado via arquivo de regras (ex: `vercel.json` ou `_redirects`) para direcionar todas as rotas desconhecidas (`/*`) de volta ao `/index.html`, permitindo ao **Vue Router v5** resolver os caminhos do cliente.

### 2. Camada de Backend (API)
* **Hospedagem:** Containers Docker em plataformas de infraestrutura gerenciada como **Railway**, **Render** ou instâncias de container na **AWS (Amazon ECS / App Runner)**.
* **Servidor e Runtime:** **Node.js (v22 LTS)** executando um aplicativo escrito em **Express 5** e compilado/rodado com suporte nativo ES Modules em TypeScript.
* **Segurança e Comunicação CORS:** O backend é exposto em um subdomínio próprio e implementa o middleware de CORS configurado de forma estrita:
  - **Origens Permitidas:** Em produção, apenas o domínio do frontend é autorizado. Em desenvolvimento local, aceita as portas padrão do Vite (`http://localhost:5173`, `http://127.0.0.1:5173`, `http://localhost:5174`, `http://127.0.0.1:5174`).
  - **Credentials:** Habilitado (`credentials: true`), exigido para o tráfego seguro de cookies JWT e controle de sessão do multitenancy.

---

## 11.3. Infraestrutura de Persistência e Transações (PostgreSQL & Supabase)

O banco de dados do Vincis é hospedado fisicamente sobre servidores da **AWS (Amazon Web Services)** na região **sa-east-1 (São Paulo, Brasil)** através do provedor de nuvem **Supabase**, assegurando latências inferiores a 30ms para chamadas de banco originadas no Brasil.

### 1. Acesso a Dados com Prisma ORM
A API interage com o PostgreSQL através de duas strings de conexão configuradas no arquivo `.env`:
1. **Connection Pooling (Porta 6543):**
   - **Protocolo:** `postgresql://...:6543/postgres?pgbouncer=true`
   - **Descrição:** Aponta para o gerenciador **PgBouncer** integrado ao cluster Supabase no modo de alocação por transação. Evita o esgotamento de conexões físicas do banco causadas pelo comportamento assíncrono do Node.js, mantendo uma fila estável de pooling de conexões reutilizáveis.
2. **Direct Connection (Porta 5432):**
   - **Protocolo:** `postgresql://...:5432/postgres`
   - **Descrição:** Usada exclusivamente pela ferramenta de migração de banco do Prisma (`npx prisma migrate dev` / `prisma migrate deploy`) e para comandos administrativos. Essa conexão contorna o PgBouncer por não ser suportado em transações do tipo DDL (que modificam esquemas de tabelas).

### 2. Object Storage (Supabase Storage)
* **Onde Hospeda:** Servidores de arquivos baseados no ecossistema S3.
* **Bucket Físico:** `editais`.
* **Fluxo de Dados:** Quando o usuário realiza o upload do edital em PDF, o backend o recebe por meio do middleware **Multer** (armazenamento temporário na memória/disco), realiza validações de integridade e tamanho (`fileSize`), envia o stream ao Supabase via SDK cliente, e salva apenas a referência HTTPS externa no PostgreSQL.

---

## 11.4. Serviços Externos e Integrações Especiais

### 1. Gateway de Pagamento e Cobrança SaaS (AbacatePay)
* **Papel:** Emissão de faturamento instantâneo por Pix ou Cartão para controle das assinaturas `PREMIUM`.
* **Integração:** Backend comunica-se com os servidores do AbacatePay via SDK Node.js, gerando sessões de checkout seguras.
* **Retorno de Webhooks:** O provedor externo dispara um payload HTTPS HTTP POST para a API do Vincis no endpoint `/payments/webhook` notificando a alteração de status do pagamento para atualizar a expiração do plano (`planExpiresAt` e `plan: PREMIUM`) na tabela de usuários.

### 2. Infraestrutura de IA para Processamento de Editais
* **Papel:** Inteligência cognitiva para segmentação e parsing estruturado de editais digitados ou importados.
* **Abstração:** Um SDK interno de IA gerencia chaves de acesso externas, caching de prompts e respostas em memória/Redis para controle de custos, permitindo alterar o LLM fornecedor (ex: Gemini API ou OpenAI) de maneira transparente para o restante da API.

---

## 11.5. Infraestrutura e Ferramentas do Ciclo de Desenvolvimento Local

O Vincis-App conta com um ambiente local de desenvolvimento projetado para simular o comportamento de nuvem produtiva com o mínimo de atrito:

1. **Lerna + Workspaces:** Gerencia o ciclo de dependências de todos os subprojetos em uma única árvore `node_modules` unificada na raiz, otimizando o cache de build.
2. **TSX Watcher:** Executa o backend observando modificações em tempo real (`tsx watch src/server.ts`), recriando instâncias de execução do servidor instantaneamente sem reinicializações manuais.
3. **Smee.io Webhook client:** Para testar a infraestrutura de webhooks locais da API (`http://localhost:4000`), um túnel ativo conecta-se à URL remota `https://smee.io/vincis-webhook-teste` e encaminha payloads de pagamentos gerados por sandbox de testes direto para a máquina local do desenvolvedor.
