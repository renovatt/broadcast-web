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

### Organização do frontend (`web/src`)

```
app/            bootstrap: providers, tema, rotas e guards
components/     componentes globais reutilizáveis
  rhf/          campos de formulário ligados ao react-hook-form (RhfTextField, RhfPasswordField)
shared/         funções e hooks compartilhados (sem componentes)
lib/            inicialização de serviços (Firebase)
features/<nome>/
  _components/  componentes exclusivos da feature
  api/          acesso ao Firebase (funções puras)
  stores/       estado global da feature (Zustand)
  hooks/  schemas/  types/  utils/
  pages/        telas ligadas às rotas
  __tests__/    testes de tudo que a feature implementa
```

Convenções (verificadas pelo ESLint com `eslint-plugin-check-file`):

- arquivos e pastas em `kebab-case` (pastas privadas de feature com `_`, ex.: `_components`);
- nenhum arquivo solto na raiz de uma feature;
- `shared/` não aceita componentes (`.tsx`);
- paradigma funcional: `class` é proibido; imports internos com o alias `@/` → `web/src`;
- estado global com **Zustand** (sem React Context);
- cada módulo tem sua pasta `__tests__` (Vitest + Testing Library + jsdom). Nenhum teste de unidade
  acessa o Firebase: `@/lib/firebase` é substituído por um stub e o SDK é mockado por teste.

### Git hooks (Husky)

- **pre-commit**: ESLint `--fix` + Prettier nos arquivos staged (lint-staged), typecheck completo e testes de unidade.
- **pre-push**: build de `/web` e `/functions`, testes das Security Rules e testes de integração das Cloud Functions.

## Pré-requisitos

- Node.js 24
- Java 21+ para os emuladores do Firestore. Não precisa instalar: `npm run setup:jdk` baixa um JDK portátil
  para `.tools/jdk-21` (ignorado pelo git), usado apenas pelos scripts do projeto.

## Rodando localmente

```bash
npm run install:all   # instala raiz, web e functions
npm run setup:jdk     # JDK portátil para os emuladores (uma vez)
```

### Tudo local, com os emuladores (não precisa de projeto Firebase nem do plano Blaze)

Em três terminais:

```bash
npm run emulators      # Auth, Firestore, Functions e Pub/Sub locais (UI em http://localhost:4000)
npm run dev:emulator   # app em http://localhost:5173 conectado só aos emuladores (web/.env.emulator)
npm run scheduler      # simula o Cloud Scheduler: executa o envio agendado a cada minuto
```

O emulador não executa funções agendadas sozinho; `npm run scheduler` chama a função a cada minuto
(`node scripts/trigger-scheduler.mjs` executa uma vez). A cascata ao excluir uma conexão roda sozinha
(trigger do Firestore). Os dados ficam só na memória dos emuladores.

### Contra o projeto Firebase real

```bash
cp web/.env.example web/.env.local   # preencha com a config do app Web do Firebase
npm run dev                          # frontend em http://localhost:5173
```

## Autenticação

Firebase Authentication com **e-mail/senha** e **Google** (popup). Cada usuário autenticado é um
cliente (tenant): seu `uid` é o `tenantId` de todos os seus dados. No primeiro login com Google a
conta é criada automaticamente. Ambos os provedores precisam estar ativos em
_Authentication → Método de login_ no console do Firebase.

## Modelagem de dados

Três coleções na raiz — **sem subcoleções** — relacionadas por ID. Todo documento carrega `tenantId` (uid do cliente dono).

| Coleção       | Campos próprios                                                                                                |
| ------------- | -------------------------------------------------------------------------------------------------------------- |
| `connections` | `tenantId`, `name`                                                                                             |
| `contacts`    | `tenantId`, `connectionId`, `name`, `phone` (E.164)                                                            |
| `messages`    | `tenantId`, `connectionId`, `body`, `recipientIds`, `recipients` (snapshot), `status`, `scheduledAt`, `sentAt` |

Todas também têm os campos de ciclo de vida: `enabled`, `deletedAt`, `createdAt`, `updatedAt`.

## Soft delete

Nada é apagado de verdade. Todo documento nasce com `enabled: true` e `deletedAt: null`;
"excluir" desativa o documento (`enabled: false`, `deletedAt` = horário do servidor).

- Toda consulta do app filtra `where('enabled', '==', true)`; os índices compostos incluem `enabled`.
- As rules proíbem `delete` e só permitem a transição `enabled: true → false` (sem alterar outros
  campos). Documentos desativados não podem ser editados nem reativados pelo cliente.
- Não é possível criar contatos ou mensagens em uma conexão desativada.
- O dono ainda pode ler os próprios documentos desativados (base para uma futura lixeira).

## Isolamento entre clientes

Garantido pelas [Security Rules](./firestore.rules):

- leitura e escrita só quando `resource.data.tenantId == request.auth.uid`;
- criação só com o próprio `tenantId` e apontando para uma conexão ativa do mesmo cliente;
- `tenantId` e `connectionId` são imutáveis; campos permitidos e tamanhos são validados;
- timestamps sempre do servidor; mensagens agendadas só no futuro; mensagens enviadas não são editáveis.

Como regras não funcionam como filtro, toda query do app inclui `where('tenantId', '==', uid)`.
Os cenários de acesso cruzado e de soft delete são cobertos por testes automatizados:
`npm run test:rules`.

## Cloud Functions (`/functions`)

Região `southamerica-east1` (a mesma do Firestore). Toda a lógica fica em funções puras que recebem
o `db` e são testadas contra o emulador; os gatilhos só as chamam.

| Function                                | Gatilho                                        | O que faz                                                                                                                                    |
| --------------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `dispatchScheduledMessages`             | Cloud Scheduler, a cada minuto                 | Marca como `sent` (com `sentAt` do servidor) as mensagens `scheduled` e ativas cujo `scheduledAt` já passou. Funciona com o app fechado.     |
| `onConnectionDisabled`                  | Update em `connections/{id}` (ativa → inativa) | Cascata do soft delete: desativa os contatos e as mensagens da conexão com o mesmo `deletedAt`. Agendadas desativadas não são mais enviadas. |
| `onContactWritten` / `onMessageWritten` | Escrita em `contacts/{id}` / `messages/{id}`   | Mantém o resumo `connections/{id}.stats` (contatos, enviadas, agendadas) exibido em tempo real no card da conexão.                           |

O resumo é **recalculado** com `count()` dentro de uma transação (e não somado/subtraído), então é
idempotente: eventos repetidos ou fora de ordem não deixam o número errado. Só roda quando algo que
afeta a contagem muda (criação, exclusão, status). As rules impedem o cliente de gravar `stats`.

Garantias do envio agendado:

- **idempotente**: só processa `status == scheduled`; executar de novo não reenvia;
- **seguro contra concorrência**: cada escrita usa a precondição `lastUpdateTime` da leitura — se o
  usuário editou ou excluiu a mensagem nesse meio-tempo, ela é ignorada e reavaliada no minuto seguinte;
- **paginado** (lotes de 500) e com `BulkWriter`: uma falha isolada não derruba as demais;
- precisão de até ~1 minuto (granularidade do Cloud Scheduler).

## Scripts (raiz)

| Script                   | Descrição                                            |
| ------------------------ | ---------------------------------------------------- |
| `npm run dev`            | Vite dev server do `/web` (projeto Firebase real)    |
| `npm run dev:emulator`   | Vite dev server do `/web` conectado aos emuladores   |
| `npm run emulators`      | Compila as functions e sobe os emuladores            |
| `npm test`               | Testes de unidade do `/web`                          |
| `npm run test:rules`     | Testes das Security Rules no emulador do Firestore   |
| `npm run test:functions` | Testes de integração das Cloud Functions (emulador)  |
| `npm run scheduler`      | Simula o Cloud Scheduler local (envio a cada minuto) |
| `npm run setup:jdk`      | Baixa o JDK 21 portátil usado pelos emuladores       |
| `npm run build`          | Build de `/web` e `/functions`                       |
| `npm run lint`           | ESLint em `/web` e `/functions`                      |
| `npm run typecheck`      | TypeScript em `/tests`, `/web` e `/functions`        |
| `npm run format`         | Prettier                                             |
| `npm run deploy`         | Deploy completo (rules, indexes, functions, hosting) |
