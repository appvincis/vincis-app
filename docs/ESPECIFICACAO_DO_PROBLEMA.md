# 3. Especificação do Problema

Este capítulo descreve e especifica o problema de negócio e de usabilidade que o **Vincis** se propõe a resolver, delimitando a dor dos usuários, os gargalos existentes nas soluções atuais do mercado e os requisitos de alto nível necessários para solucionar essas deficiências.

---

## 3.1. Contexto e Domínio do Problema

A preparação para concursos públicos de alto rendimento no Brasil é caracterizada por um ambiente de altíssima concorrência e exigência de domínio de editais extensos e complexos. O perfil do candidato moderno exige não apenas dedicação de tempo, mas principalmente **eficiência de estudo**, monitoramento preciso de métricas de desempenho e flexibilidade de planejamento.

Nesse domínio, os principais desafios residem na capacidade de o estudante autogerenciar seu progresso frente a editais de centenas de tópicos, conciliar diferentes certames e aprender sistematicamente a partir de seus próprios erros (estudo ativo e estudo reverso).

---

## 3.2. Caracterização dos Problemas Centrais (Pain Points)

O desenvolvimento do Vincis foi motivado por cinco problemas fundamentais identificados na rotina de preparação dos candidatos:

### P1. Sobrecarga Cognitiva por Acúmulo de Editais (Mistura de Contextos)
* **Descrição:** É comum que candidatos estudem para múltiplos concursos similares de forma concomitante (por exemplo: Polícia Federal e Polícia Civil de um estado).
* **O Problema:** As ferramentas tradicionais de organização de estudos misturam as disciplinas ou exigem que o estudante crie contas separadas. A ausência de um isolamento estrito de contextos leva a uma confusão no cronograma, à sobreposição de conteúdos e à dificuldade de visualizar o progresso real e isolado de cada edital específico.

### P2. Desperdício de Tempo no Planejamento Inicial (Extração de Editais)
* **Descrição:** A primeira etapa de qualquer preparação é a leitura do edital e a estruturação de uma planilha ou lista com todas as disciplinas, assuntos e tópicos que serão cobrados.
* **O Problema:** Os editais são publicados em arquivos PDF extensos e mal formatados. Fazer a extração manual dessa grade de tópicos (copiar, colar, formatar em colunas de assuntos e tópicos individuais) consome horas ou até dias de estudo líquido do candidato antes mesmo de ele iniciar a leitura do conteúdo.

### P3. Falta de Rastreamento Sistemático de Erros (Estudo Reverso Ineficaz)
* **Descrição:** Obter a aprovação exige identificar pontos fracos e saná-los. A técnica de estudo reverso baseia-se em responder questões e mapear exaustivamente as causas dos erros cometidos.
* **O Problema:** Os estudantes costumam registrar seus erros de forma desestruturada (em cadernos físicos, blocos de notas ou planilhas genéricas). Isso impede a catalogação do erro por um diagnóstico específico (ex: falta de atenção, desconhecimento da teoria, pegadinha de banca) e impossibilita revisões cirúrgicas automatizadas por disciplina ou assunto.

### P4. Atrito Operacional e Dispersão no Modo Foco
* **Descrição:** O controle de horas líquidas de estudo é um indicador chave de progresso.
* **O Problema:** O estudante geralmente precisa alternar entre múltiplos aplicativos durante o ciclo de estudos: um timer Pomodoro no celular, o material em PDF na tela e uma planilha Excel para registrar o tempo estudado e marcar o tópico como lido. Essa troca constante de ferramentas gera atrito operacional, distração e, frequentemente, o abandono do registro das horas estudadas.

### P5. Ausência de Indicadores e Gráficos de Evolução Consolidada
* **Descrição:** Para ajustar a estratégia de estudos, o aluno precisa saber se sua taxa de acertos em simulados está subindo, quais matérias estão acumulando mais erros e qual a porcentagem de conclusão do edital.
* **O Problema:** Planilhas manuais demandam fórmulas complexas de gráficos que quebram facilmente e exigem atualização manual constante. Sem uma visualização clara baseada em dados históricos estruturados, o aluno perde a capacidade de identificar rapidamente quais disciplinas requerem priorização ou revisão.

---

## 3.3. Implicações Técnicas e Arquiteturais do Problema

A especificação desses problemas impõe restrições diretas sobre como o software Vincis deve ser arquitetado:

1. **Multitenancy Lógico Baseado em Plano de Estudos:** O banco de dados e a API precisam isolar disciplinas, tópicos e logs de erro usando um identificador de plano (`studyPlanId`) para garantir que o usuário mude de contexto e visualize instantaneamente um dashboard totalmente independente.
2. **Integração de Processamento de Linguagem Natural (IA):** Para sanar a extração manual de editais, é obrigatório um serviço de IA capaz de ler textos brutos e convertê-los em JSON estruturado com disciplinas e tópicos, exigindo um SDK interno que previna custos excessivos de chamadas de API (caching).
3. **Mecanismo de Timer Síncrono com Atualização de Estado:** O cronômetro do frontend deve comunicar-se nativamente com a API de tópicos para que a conclusão do timer altere o status do tópico no banco sem que o usuário precise fazer cliques manuais adicionais.
4. **Armazenamento Seguro de Logs de Erro:** O caderno de erros precisa ser altamente relacional, vinculando-se opcionalmente a tópicos específicos, mas permanecendo indexado no plano de estudos para que a exclusão de um tópico ou disciplina não apague a análise de erro histórica do aluno (uso de `onDelete: SetNull` ou controle de integridade referencial).
5. **Agregação Eficiente de Dados para Gráficos:** Para que o dashboard renderize instantaneamente o progresso sem gargalos de performance, o backend deve possuir rotas de agregação otimizadas no banco de dados (Prisma/PostgreSQL), reduzindo a quantidade de requisições sequenciais do frontend.
