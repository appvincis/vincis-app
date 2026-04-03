### Patch Notes

## Resumo
- Para ter acesso ao styleguide basta adicionar /design-sytem na sua barra de pesquisa com o servidor ativo, assim você será redirecionado para a página correta. EX: http://localhost:5173/design-system

## Detalhamento

# Sobre rotas:
(Em web)
- Foi criada a pasta apps\web\src\views
- Criação do Design System como uma nova rota
- O conteúdo que antes estava em App.vue foi movido para HomeView.vue
- Agora App.vue funciona somente como ponto de conexão das rotas (motivo: boas práticas, é padrão do Vue fazer assim)
- Index.ts(reuter) agora engloba essas duas novas rotas

# Sobre componentes:
(Em web)
- Foi criada a pasta apps\web\src\components\ui que agrupa todos os nossos componentes. Para facilitar, eles começam todos com a letra V (VButton, VAlert, ...)
- Foi criado o index.ts na pasta componentes. Ele serve para centralizar os imports de componentes e é considerado boa prática. Assim, para importar basta import { VButton, VBadge, VAlert } from '@/components/ui'
- Modificação em global.css para definição de estilos gerais
- Em styleguide tem a demonstração de aplicação de TODOS os componentes do sistema. Não vejo como fazer mais escalável e menos verborroso - coisa que eu gostaria que acontecesse.

