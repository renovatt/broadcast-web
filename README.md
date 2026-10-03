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
- **pre-push**: build de `/web` e `/functions` e testes das Security Rules.

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

## Scripts (raiz)

| Script               | Descrição                                            |
| -------------------- | ---------------------------------------------------- |
| `npm run dev`        | Vite dev server do `/web`                            |
| `npm run emulators`  | Compila as functions e sobe os emuladores            |
| `npm test`           | Testes de unidade do `/web`                          |
| `npm run test:rules` | Testes das Security Rules no emulador do Firestore   |
| `npm run setup:jdk`  | Baixa o JDK 21 portátil usado pelos emuladores       |
| `npm run build`      | Build de `/web` e `/functions`                       |
| `npm run lint`       | ESLint em `/web` e `/functions`                      |
| `npm run typecheck`  | TypeScript em `/tests`, `/web` e `/functions`        |
| `npm run format`     | Prettier                                             |
| `npm run deploy`     | Deploy completo (rules, indexes, functions, hosting) |
