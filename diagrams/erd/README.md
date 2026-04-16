# 📖 Guia de Modelagem DBML: Vincis-App

DBML (Database Markup Language) é uma DSL open-source projetada para definir e documentar esquemas e estruturas de banco de dados. Foi criada para ser simples, consistente e altamente legível.

[[[DBM Diagram](https://dbml.dbdiagram.io/home)]]

Para a construção da estrutura relacional é necessário instalar a extensão:

```PlainText
dbdiagram
```
**Obs.: VScode e Antigravity possuem a extensão**

Para usar basta criar um arquivo:
```Plaintext
nomearquivo.dbml
```
Será gerado um arquivo:
```Plaintext
nomearquivo.dbdiagram
```
Esse arquivo inclui configurações de renderização. Não é necessário, mas para que todos os usuários tenham a mesma visualização pode ser interessante.


## 🚀 2. Casos de Uso Aplicados

### A. Automação e Identidade (Atributos)
Garante que cada plano tenha uma identidade protegida e metadados automáticos.
```dbml
Table study_plans {
  id uuid [pk, default: `gen_random_uuid()`] // Identidade Automática
  title varchar [unique, not null] // Proteção contra duplicatas
  is_active boolean [default: true] // Estado inicial padrão
  note: 'Entidade âncora para isolamento de contexto.'
}
```

### B. A Regra de Ouro (Relacionamentos)
Implementação do isolamento de contexto para garantir que os dados de diferentes editais não se misturem.
```dbml
// Relacionamento 1:N (A espinha dorsal)
Table topics {
  id uuid [pk]
  study_plan_id uuid [ref: > study_plans.id] // Muitos tópicos para 1 plano
  title varchar
}

// Relacionamento 1:1 (Extensão de Perfil)
Table user_settings {
  user_id uuid [pk, ref: - users.id]
  dark_mode boolean [default: true]
}
```

### C. Manutenção Proativa (Integridade)
Evita o acúmulo de dados órfãos e mantém o banco performático.
```dbml
// Se o plano for deletado, as matérias são limpas via Cascade
Ref: study_plans.id < subjects.study_plan_id [delete: cascade]
```

### D. Padronização por IA (Enums e Indexes)
Evita erros de semântica e acelera o carregamento do Dashboard.
```dbml
enum topic_status {
  pendente
  estudando
  concluido
}

Table focus_sessions {
  id uuid [pk]
  status topic_status [default: 'pendente']
  
  Indexes {
    (study_plan_id, created_at) [name: 'idx_perf_dash']
  }
}
```


## 🚀 Workflow de Implementação

1.  **Edição:** Modifique o arquivo `.dbml` neste diretório.
2.  **Visualização:** Cole o código no [dbdiagram.io](https://dbdiagram.io).
3.  **Sincronização Supabase:**
    * Export -> `Export to PostgreSQL`.
    * Execute o script no SQL Editor do Supabase.
4.  **Sincronização Prisma:**
    * Execute `npx prisma db pull` para atualizar o `schema.prisma`.
    * Execute `npx prisma generate` para atualizar as tipagens no TypeScript.

---

## 📋 Checklist de Definição de Pronto (DoD)
- [ ] `study_plan_id` presente em todas as tabelas de negócio.
- [ ] Índices criados para campos de busca frequente (`user_id`, `created_at`).
- [ ] Tabelas de Log (`ai_usage_logs`) implementadas.
- [ ] Diagrama visual salvo na pasta `/diagrams` como imagem.

---



# 📘 Documentação do Diagrama de Entidade-Relacionamento (ERD) COM PRISMA

Este diretório contém a representação visual da base de dados do projeto **Vincis-App**. Os diagramas são gerados automaticamente a partir do ficheiro de esquema do Prisma.

## 🚀 Como Gerar / Atualizar

Sempre que houver alterações no ficheiro `apps/api/prisma/schema.prisma`, deves atualizar os diagramas executando o comando na raiz do projeto:

```bash
npm run prisma:generate
```

### O que acontece nos bastidores?
O comando lê a estrutura do Prisma e exporta dois ficheiros para esta pasta:
1.  **`schema.svg`**: Visualização rápida e vetorial.
2.  **`schema.md`**: Documentação técnica com código Mermaid editável.

---

## 🛠 Como Editar o Estilo

Existem duas formas de editar os diagramas, dependendo do objetivo:

### 1. Alteração Permanente (via Código)
Para mudar o tema, cores ou exibição de chaves de forma definitiva, edita o bloco `generator erd` no ficheiro `schema.prisma`:

```prisma
generator erd {
  provider = "prisma-erd-generator"
  output   = "../../../../diagrams/erd/schema.md"
  format   = "md"
  theme    = "dark"  // Opções: default, forest, dark, neutral
}
```

### 2. Edição Visual Manual (Prototipagem)
Se precisares de alterar o layout das tabelas manualmente sem mexer no banco de dados:
1. Abre o ficheiro `schema.md`.
2. Copia todo o código que está dentro do bloco ```mermaid.
3. Acede ao **[Mermaid Live Editor](https://mermaid.live/)**.
4. Cola o código e faz os teus ajustes visuais.
5. Exporta a imagem final.

---


## 🎨 Guia de Estilos Disponíveis

| Elemento | Descrição |
| :--- | :--- |
| **Tabelas** | Representam os `models` do Prisma. |
| **Linhas** | Representam as relações (1:1, 1:N, N:N). |
| **Formatos** | Use `.svg` para apresentações e `.md` para o GitHub. |



# O que é um Diagrama ER?

Um diagrama ER é uma representação visual das entidades (tabelas) de um banco de dados, dos atributos (colunas) de cada entidade e dos relacionamentos (chaves estrangeiras) entre elas. Ele oferece uma visão panorâmica de toda a sua camada de dados


## Conceitos Fundamentais
Entidades representam as "coisas" no seu domínio — usuários, pedidos, produtos, faturas. Em um banco de dados relacional, cada entidade se torna uma tabela. Uma entidade é desenhada como um retângulo com seu nome no topo e seus atributos listados abaixo.

### Atributos
São as propriedades de uma entidade — as colunas da sua tabela. Cada atributo tem um nome e um tipo. Alguns atributos são especiais: chaves primárias identificam uma linha de forma única, enquanto chaves estrangeiras referenciam outra entidade.

### Relacionamentos:
Descrevem como as entidades estão conectadas. Um usuário "tem muitos" pedidos. Um pedido "pertence a" um usuário. Essas conexões são desenhadas como linhas entre entidades, com símbolos em cada extremidade indicando a cardinalidade.

### Cardinalidade: A Chave dos Relacionamentos
Cardinalidade define quantas instâncias de uma entidade podem se relacionar com outra. Os três tipos principais são:

- Um-para-Um (1:1): Cada usuário tem exatamente um perfil. Cada perfil pertence a exatamente um usuário. É relativamente raro e frequentemente indica que as duas tabelas poderiam ser mescladas.

- Um-para-Muitos (1:N): Cada usuário pode ter muitos pedidos, mas cada pedido pertence a exatamente um usuário. Este é o tipo de relacionamento mais comum. O lado "muitos" recebe uma coluna de chave estrangeira apontando para o lado "um".

- Muitos-para-Muitos (M:N): Cada aluno pode se matricular em muitos cursos, e cada curso tem muitos alunos. Isso exige uma tabela de junção (por exemplo, enrollments) com chaves estrangeiras para ambos os lados.

## Lendo um Diagrama ER
Ao olhar para um diagrama ER, comece pelas entidades. Leia os nomes das tabelas e examine as colunas para entender quais dados estão armazenados. Em seguida, siga as linhas de relacionamento — elas indicam como os dados fluem entre as tabelas.

Preste atenção aos símbolos em cada extremidade de uma linha de relacionamento. Uma única linha significa "um", um pé-de-galinha (três linhas se abrindo) significa "muitos". A combinação indica a cardinalidade.

## Boas Práticas
Mantenha os nomes das tabelas no singular e descritivos: user e não users, order e não tbl_orders. Nomeie as colunas de chave estrangeira de forma consistente: user_id, order_id. Sempre defina chaves primárias. Use o diagrama ER como ferramenta de comunicação — compartilhe-o com seu time antes de implementar.