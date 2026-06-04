# 14. Requisitos

Este capítulo apresenta a especificação detalhada dos requisitos do sistema **Vincis**. Eles estão divididos em Requisitos Funcionais (o que o sistema deve fazer) e Requisitos Não-Funcionais (restrições e atributos de qualidade de software).

---

## 14.1. Requisitos Funcionais (RF)

Os requisitos funcionais foram mapeados com base nas histórias de usuários do sistema, classificados pela sua prioridade no escopo de lançamento (v1.0):
* **Essencial (E):** Funcionalidade obrigatória para o funcionamento básico da plataforma.
* **Importante (I):** Agrega alto valor prático e de experiência ao usuário.
* **Desejável (D):** Funcionalidade secundária ou de otimização de experiência.

| ID | Nome do Requisito | Descrição | Prioridade |
| :--- | :--- | :--- | :---: |
| **RF01** | Autenticação de Usuários | O sistema deve permitir o cadastro de novos usuários e a realização de login com autenticação por email e senha. | **E** |
| **RF02** | Processo de Onboarding | O sistema deve guiar o novo usuário por meio de etapas dinâmicas e animações de boas-vindas apresentando as funcionalidades centrais. | **I** |
| **RF03** | Painel Principal (Layout) | O sistema deve disponibilizar um dashboard central com sidebar retrátil à esquerda e menu de perfil no rodapé da página. | **E** |
| **RF04** | Gestão de Planos de Estudo | O usuário deve ser capaz de criar, editar e alternar entre diferentes planos de estudo (concursos), mantendo dados isolados. | **E** |
| **RF05** | CRUD de Grade Curricular | O sistema deve permitir o cadastro, edição e exclusão de disciplinas (com peso e cor customizados), assuntos e tópicos de estudo. | **E** |
| **RF06** | Importação de Edital com IA | O sistema deve permitir que o usuário cole o texto de um edital para que uma IA extraia e cadastre automaticamente a grade curricular. | **I** |
| **RF07** | Planejador de Ciclos de Estudo | O sistema deve calcular e distribuir os tópicos de estudo semanalmente com base na carga horária do aluno e nos pesos das matérias. | **I** |
| **RF08** | Módulo de Foco e Timer | O sistema deve oferecer cronômetro e timer Pomodoro vinculados a tópicos específicos, atualizando o progresso ao concluir a sessão. | **E** |
| **RF09** | Caderno de Erros | O sistema deve permitir o registro, categorização e diagnóstico de questões resolvidas de forma incorreta para revisões futuras. | **E** |
| **RF10** | Histórico de Simulados | O sistema deve permitir o cadastro de desempenho de simulados (acertos, erros e brancos por matéria), calculando aproveitamento. | **I** |
| **RF11** | Painel Analítico de KPIs | O sistema deve exibir gráficos de pizza e linha para visualização de horas estudadas, avanço do edital e evolução em simulados. | **E** |
| **RF12** | Gerenciamento de Planos SaaS | O sistema deve permitir a diferenciação de limites de uso para usuários Free (Basic) e Premium com fluxos de checkout. | **I** |

---

## 14.2. Requisitos Não-Funcionais (RNF)

Os requisitos não-funcionais determinam os critérios de qualidade, restrições e padrões arquiteturais que devem ser cumpridos pelo Vincis:

| ID | Nome do Requisito | Descrição | Categoria |
| :--- | :--- | :--- | :--- |
| **RNF01** | Criptografia de Senhas | Todas as senhas devem ser criptografadas no banco usando algoritmo de hash seguro (**Bcryptjs**). | Segurança |
| **RNF02** | Segurança de Sessão | O token de sessão (JWT) deve ser trafegado estritamente por meio de **HTTP-only Cookies** no backend para prevenir XSS. | Segurança |
| **RNF03** | Isolamento de Contexto | As rotas de recursos dependentes do plano ativo devem aplicar validações baseadas na chave `studyPlanId` injetada por middleware. | Confiabilidade |
| **RNF04** | Arquitetura Modular | O backend deve seguir o padrão de feature isolada (`src/features/<feature>/`) com responsabilidades apartadas nas camadas. | Manutenibilidade |
| **RNF05** | Consistência de Estilos | As customizações visuais devem utilizar tokens semânticos do Tailwind CSS v4 declarados no arquivo central `global.css`. | Manutenibilidade |
| **RNF06** | Ordem de Camadas CSS | Componentes UI do PrimeVue devem carregar sob a diretiva `cssLayer` para que os estilos do Tailwind prevaleçam nos overrides. | Compatibilidade |
| **RNF07** | Cache e Otimização de IA | O sistema deve utilizar uma camada de cache interno para prompts e respostas repetidas da IA a fim de mitigar latência e custos. | Performance |
| **RNF08** | Responsividade de Interface | O frontend deve ser totalmente responsivo, garantindo visualização otimizada em viewports de smartphones e desktops. | Usabilidade |
| **RNF09** | Gerenciamento de Banco | As tabelas do banco PostgreSQL devem possuir integridade referencial com remoção em cascata (`onDelete: Cascade`) em dependências. | Confiabilidade |
