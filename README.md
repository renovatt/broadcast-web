# Broadcast

Aplicação SaaS multi-tenant de envio (simulado) de mensagens em massa — React + TypeScript + Firebase.

## Estrutura

```
/web         Frontend — React 19, Vite, Material UI, Tailwind CSS
/functions   Firebase Cloud Functions (v2, Node 24)
/tests       Testes das Security Rules (Vitest + Firestore Emulator)
/scripts     Utilitários (JDK portátil para os emuladores)
firebase.json, firestore.rules, firestore.indexes.json
```

## Pré-requisitos

- Node.js 24
- Java 21+ para os emuladores do Firestore. Não precisa instalar: `npm run setup:jdk` baixa um JDK portátil
  para `.tools/jdk-21` (ignorado pelo git), usado apenas pelos scripts do projeto.

## Rodando localmente

```bash
npm run install:all                  # instala raiz, web e functions
npm run setup:jdk                    # JDK portátil para os emuladores (uma vez)
cp web/.env.example web/.env.local   # preencha com a config do app Web do Firebase

npm run dev                          # frontend em http://localhost:5173
npm run emulators                    # Auth, Firestore, Functions e Hosting locais (UI em http://localhost:4000)
```

Para usar o frontend contra os emuladores, defina `VITE_USE_EMULATORS=true` no `web/.env.local`.

## Modelagem de dados

Três coleções na raiz — **sem subcoleções** — relacionadas por ID. Todo documento carrega `tenantId` (uid do cliente dono).

| Coleção       | Campos                                                                                                                                   |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `connections` | `tenantId`, `name`, `createdAt`, `updatedAt`                                                                                             |
| `contacts`    | `tenantId`, `connectionId`, `name`, `phone` (E.164), `createdAt`, `updatedAt`                                                            |
| `messages`    | `tenantId`, `connectionId`, `body`, `recipientIds`, `recipients` (snapshot), `status`, `scheduledAt`, `sentAt`, `createdAt`, `updatedAt` |

## Isolamento entre clientes

Garantido pelas [Security Rules](./firestore.rules):

- leitura, edição e exclusão só quando `resource.data.tenantId == request.auth.uid`;
- criação só com o próprio `tenantId` e apontando para uma conexão do mesmo cliente;
- `tenantId` e `connectionId` são imutáveis; campos permitidos e tamanhos são validados;
- timestamps sempre do servidor; mensagens agendadas só no futuro; mensagens enviadas não são editáveis.

Como regras não funcionam como filtro, toda query do app inclui `where('tenantId', '==', uid)`.
Os cenários de acesso cruzado são cobertos por testes automatizados: `npm run test:rules`.

## Scripts (raiz)

| Script               | Descrição                                            |
| -------------------- | ---------------------------------------------------- |
| `npm run dev`        | Vite dev server do `/web`                            |
| `npm run emulators`  | Compila as functions e sobe os emuladores            |
| `npm run test:rules` | Testes das Security Rules no emulador do Firestore   |
| `npm run setup:jdk`  | Baixa o JDK 21 portátil usado pelos emuladores       |
| `npm run build`      | Build de `/web` e `/functions`                       |
| `npm run lint`       | ESLint em `/web` e `/functions`                      |
| `npm run typecheck`  | TypeScript em `/tests`, `/web` e `/functions`        |
| `npm run format`     | Prettier                                             |
| `npm run deploy`     | Deploy completo (rules, indexes, functions, hosting) |
