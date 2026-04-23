# Arquitetura do App Shell - Vincis

Este documento descreve a implementação do App Shell e serve como guia para desenvolvedores que desejam adicionar novas funcionalidades à plataforma.

## 🚀 O que foi implementado

Estabelecemos a base visual e funcional (App Shell) para áreas autenticadas:
- **Layout Persistente**: `AppLayout.vue` gerencia a estrutura principal (Sidebar + Conteúdo).
* **Sidebar Inteligente**: `AppSidebar.vue` com suporte a colapso (desktop) e gaveta (mobile).
* **Estado Global**: Stores Pinia para autenticação (`authStore`) e layout (`layoutStore`).
* **Rotas Aninhadas**: Estrutura de roteamento sob `/private` para renderização dinâmica.

## 📂 Estrutura de Arquivos

- `apps/web/src/layouts/AppLayout.vue`: Container principal.
- `apps/web/src/components/layout/AppSidebar.vue`: Navegação e rodapé do usuário.
- `apps/web/src/stores/`:
  - `auth.ts`: Sessão e usuário.
  - `layout.ts`: Estado da UI (ex: sidebar aberta/fechada).
- `apps/web/src/views/`: Telas da aplicação (Dashboard, StudyPlans, Profile).

## 🛠️ Guia: Como adicionar uma nova Feature

Para inserir um novo módulo (ex: "Biblioteca" ou "Calendário"), siga estes passos:

### 1. Criar a View
Crie um novo arquivo `.vue` em `src/views/`. Use os componentes do Design System (`VCard`, `VButton`) para manter a consistência.

```vue
<!-- src/views/LibraryView.vue -->
<template>
  <div class="library-view">
    <h1 class="text-4xl font-serif font-bold">Biblioteca</h1>
    <!-- Seu conteúdo aqui -->
  </div>
</template>
```

### 2. Registrar a Rota
Adicione a nova rota como filha (child) do caminho `/private` no arquivo `src/router/index.ts`.

```typescript
// src/router/index.ts
{
  path: '/private',
  component: AppLayout,
  children: [
    // ... rotas existentes
    {
      path: 'library',
      name: 'library',
      component: () => import('../views/LibraryView.vue')
    }
  ]
}
```

### 3. Adicionar à Sidebar
Insira o novo item no array `navItems` dentro do `AppSidebar.vue`.

```typescript
// src/components/layout/AppSidebar.vue
const navItems = [
  // ... itens existentes
  { id: 'library', label: 'Biblioteca', icon: 'local_library', path: '/private/library' },
]
```

## 🎨 Padrões Estéticos

- **Fontes**: Use `font-serif` (Newsreader) para títulos e o padrão sans (Manrope) para UI/corpo.
- **Cores**: Utilize as variáveis CSS (ex: `var(--primary)`, `var(--surface-container)`) para garantir suporte a temas e consistência.
- **Ícones**: Utilize [Material Symbols Outlined](https://fonts.google.com/icons?icon.set=Material+Symbols).
- **Animações**: O layout já possui transições de página (`page-fade`). Para elementos internos, prefira animações sutis de `fadeIn` ou `translateY`.

## 🔒 Autenticação

A sidebar e o layout privado dependem do `authStore`. Para proteger novas rotas ou realizar ações de logout, utilize os métodos `authStore.user` e `authStore.logout()`.
IMPORTANT

The authentication state in authStore is currently hardcoded to true. I will change it to false by default to ensure the redirect works as expected. If you prefer to stay logged in during development, please let me know
