# Scripts

Documentação para os scripts do projeto.

## Criar módulo

```bash
./apps/api/src/scripts/create_module.sh <nome-do-modulo>
```

Esse script cria dentro da pasta features um novo modulo para a api, contendo:
- controller.ts
- model.ts
- service.ts
- routes.ts
- types.ts

todos com o nome do módulo passado na variável <nome-do-modulo>