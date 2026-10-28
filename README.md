# Habit Tracker LIG-4

Aplicação de hábitos no estilo Connect 4, com:

- App web em Next.js 16
- Autenticação por usuário
- Persistência em SQLite local (`node:sqlite`)
- Extensão Chrome conectada ao backend em produção no Cleat

## Demo

- Web (produção): [https://habit-tracker-lig-4.apps.gestaobem.com](https://habit-tracker-lig-4.apps.gestaobem.com)

## Funcionalidades

### Web

- Cadastro, login e logout
- Estado dos hábitos separado por usuário
- Marcação por dia (`Feito`, `Falhou`, `Sem marcação`)
- Navegação por mês
- Persistência via `/api/state`

### Extensão Chrome (`chrome-extension/`)

- Login e cadastro direto no popup
- Consome backend web em produção (`https://habit-tracker-lig-4.apps.gestaobem.com`)
- Visual LIG-4 com bolinhas coloridas
- Aba `Hábitos` e aba `Resumo`
- Setas nas pontas da faixa para navegar nos dias
- Sessão salva em `chrome.storage.local`

## Stack

- Next.js 16
- React 19
- Tailwind CSS
- Framer Motion
- Lucide React
- SQLite via `node:sqlite` (sem dependência nativa)

## Estrutura

- `app/` páginas e APIs (App Router)
- `app/components/habits/` componentes de UI do calendário e resumo
- `app/api/auth/*` autenticação
- `app/api/state` estado de hábitos por usuário
- `lib/db.js` conexão SQLite + schema
- `lib/users.js`, `lib/sessions.js`, `lib/user-state.js` acesso a dados
- `lib/auth.js` sessão e hash de senha
- `lib/cors.js` CORS para web e `chrome-extension://...`
- `lib/habits/` lógica pura (datas, registros, estatísticas, CSV, estado)
- `chrome-extension/` popup da extensão (`lib/` lógica pura, `ui/` views)
- `tests/` suíte Vitest (node + jsdom para o popup)

## Pré-requisitos

- Node.js 22.13+ (para `node:sqlite` sem flag)
- npm

## Variáveis de ambiente

Copie e ajuste:

```bash
cp .env.example .env.local
```

- `DATABASE_PATH` (default `./.data/habits.sqlite`): arquivo SQLite; criado automaticamente com o schema.
- `NEXT_PUBLIC_SITE_URL` (opcional): origem pública liberada no CORS.

## Rodando localmente

```bash
npm install
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run format
npm run format:check
npm run test
npm run test:watch
npm run verify
npm run extension:css
npm run extension:css:watch
```

## Qualidade

- `npm run verify` roda o gate completo: Prettier + ESLint + Vitest + build.
- CI (`.github/workflows/ci.yml`) executa o mesmo gate em push na `main` e em pull requests.
- Pre-commit (husky + lint-staged) formata e linta os arquivos staged e roda a suíte de testes.

Observação: se o seu shell exporta `NODE_ENV=production`, instale com `NODE_ENV=development npm install` para que as devDependencies (Vitest, Prettier, husky) sejam instaladas.

## Extensão Chrome

1. Abra `chrome://extensions`
2. Ative `Developer mode`
3. Clique em `Load unpacked`
4. Selecione `chrome-extension/`

Se alterar estilos da extensão:

```bash
npm run extension:css
```

## API (resumo)

- `POST /api/auth/signup`
- `POST /api/auth/signin`
- `POST /api/auth/signout`
- `GET /api/auth/me`
- `GET /api/state`
- `PUT /api/state`

## Deploy (Cleat)

Produção no Cleat (`habit-tracker-lig-4`, server `gestaobem-cx43`), com `output: "standalone"` no Next.

- Manifesto: `.cleat_deploy/deploy.json` (`runtime: node`, `node_version: 22`).
- Env: `DATABASE_PATH=/opt/habit-tracker-lig-4/data/habits.sqlite` (persistente, fora do release; o Cleat habilita `litestream`).
- Deploy via MCP: `cleat__deploy` com `app=habit-tracker-lig-4`, depois `deploy_status` e `apps_logs`.

Observação: para a extensão funcionar, o backend precisa estar no ar com CORS habilitado nas rotas de auth/state.

## Licença

MIT
