# Broadcast

Aplicação SaaS multi-tenant de envio (simulado) de mensagens em massa — React + TypeScript + Firebase.

> Em construção. O plano completo está em [`PLANO-DE-EXECUCAO.md`](./PLANO-DE-EXECUCAO.md).

## Estrutura

```
/web         Frontend — React 19, Vite, Material UI, Tailwind CSS
/functions   Firebase Cloud Functions (v2, Node 24)
firebase.json, firestore.rules, firestore.indexes.json
```

## Pré-requisitos

- Node.js 24
- Java 21+ (apenas para os emuladores do Firestore)

## Rodando localmente

```bash
npm run install:all          # instala raiz, web e functions
cp web/.env.example web/.env.local   # preencha com a config do app Web do Firebase

npm run dev                  # frontend em http://localhost:5173
npm run emulators            # Auth, Firestore, Functions e Hosting locais (UI em http://localhost:4000)
```

Para usar o frontend contra os emuladores, defina `VITE_USE_EMULATORS=true` no `web/.env.local`.

## Scripts (raiz)

| Script              | Descrição                                            |
| ------------------- | ---------------------------------------------------- |
| `npm run dev`       | Vite dev server do `/web`                            |
| `npm run emulators` | Compila as functions e sobe os emuladores            |
| `npm run build`     | Build de `/web` e `/functions`                       |
| `npm run lint`      | ESLint em ambos                                      |
| `npm run typecheck` | TypeScript em ambos                                  |
| `npm run deploy`    | Deploy completo (rules, indexes, functions, hosting) |
