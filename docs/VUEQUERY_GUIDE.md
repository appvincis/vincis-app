# Guia de Implementação: Vue Query no Vincis-App 🚀

Este guia explica a transição da gestão manual de dados (Axios direto no componente) para o uso do **TanStack Vue Query**, detalhando como essa mudança profissionaliza nossa camada de dados e melhora a experiência do usuário.

---

## 1. Por que mudar? (O Problema)

Antes do Vue Query, cada tela gerenciava seu próprio estado de servidor de forma manual:
- **Repetição:** `isLoading`, `errorMsg`, `data` eram declarados em todos os componentes.
- **Ciclo de Vida Frágil:** Dependíamos de `onMounted` para disparar buscas, o que não garantia sincronia se o componente fosse remontado.
- **Tráfego Excessivo:** Toda vez que o usuário navegava de volta para uma tela, uma nova requisição era feita (sem cache).
- **Interface Estática:** Se os dados mudassem no servidor, a UI só atualizava se houvesse um refresh manual.

---

## 2. A Solução: Vue Query (O Benefício)

O Vue Query atua como um **gerenciador de estado assíncrono**. Ele entende que os dados do servidor são diferentes do estado local da UI.

### Benefícios Principais:
1.  **Cache Inteligente:** Os dados são armazenados em cache. Se o usuário navegar e voltar, a UI é renderizada instantaneamente enquanto o Vue Query valida se houve mudanças em segundo plano.
2.  **Boilerplate Zero:** Não precisamos mais criar `ref(true)` para cada carregamento. O hook `useQuery` já nos entrega `isLoading`, `isError`, `data` e muito mais.
3.  **Sincronização Automática:** Através das **Mutations**, ao criar ou deletar algo, o cache é "invalidado" e a aplicação busca os dados novos automaticamente, garantindo que a UI esteja sempre atualizada.
4.  **Performance:** Redução drástica de requisições duplicadas graças ao `staleTime` global (configurado em 1 minuto no `main.ts`).

---

## 3. Como usar no Vincis-App

### Queries (Busca de Dados)
Sempre utilize os hooks localizados em `src/hooks/`.

```typescript
// Exemplo em DisciplinasView.vue
const { data: disciplines, isLoading } = useDisciplinesQuery()
```

### Mutations (Alteração de Dados)
Para POST, PATCH ou DELETE, usamos mutations que cuidam de atualizar o cache após o sucesso.

```typescript
const createMutation = useCreateDisciplineMutation()

async function onSave() {
  await createMutation.mutateAsync({ name: 'Nova Matéria' })
  // O cache de 'disciplines' será invalidado e atualizado sozinho!
}
```

---

## 4. Estrutura de Pastas

- `src/hooks/`: Centralizamos toda a lógica de API aqui.
    - `useDisciplines.ts`: Tudo relacionado a matérias e tópicos.
    - `useStudyPlans.ts`: Tudo relacionado a planos de estudo e perfil.

---

## 5. Dicas de Ouro 💡

- **staleTime:** Define quanto tempo o dado é considerado "fresco". Durante esse tempo, o Vue Query não fará novas requisições ao servidor para o mesmo dado.
- **queryKey:** É o RG do seu dado no cache. Ex: `['topics', disciplineId]`. Se o `disciplineId` mudar, o Vue Query entende que deve buscar novos dados.
- **Optimistic Updates:** Podemos fazer a UI atualizar *antes* da resposta do servidor chegar, tornando o app extremamente fluido (implementado em fluxos críticos).

---

Com essa mudança, o **Vincis-App** deixa de ser um "frontend que chama API" para se tornar uma aplicação reativa, performática e com arquitetura de dados robusta.
