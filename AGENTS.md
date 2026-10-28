# AGENTS.md

Guia para agentes de código trabalhando neste repositório.

## 1. Objetivo do projeto

- App web de hábitos (estilo Lig-4) em Next.js 16.
- Backend via rotas `app/api/*` com autenticação + estado por usuário em SQLite local (`node:sqlite`).
- Extensão Chrome (`chrome-extension/`) que usa o backend em produção no Cleat.

## 2. Stack e estrutura

- Web: Next.js 16 + React 19 (`app/`).
- Banco: SQLite em arquivo via `node:sqlite` (`lib/db.js`, `lib/users.js`, `lib/sessions.js`, `lib/user-state.js`).
- Auth/session: `lib/auth.js`.
- CORS centralizado: `lib/cors.js`.
- Extensão Chrome: HTML/CSS/JS vanilla em `chrome-extension/`.

Pastas principais:

- `app/`: páginas e rotas de API (App Router).
- `app/components/habits/`: componentes de UI (header, calendário, resumo, célula, token).
- `lib/`: auth, DB e CORS do backend (`auth.js`, `db.js`, `users.js`, `sessions.js`, `user-state.js`, `cors.js`).
- `lib/habits/`: lógica pura de hábitos — `dates.js`, `records.js`, `stats.js`, `csv.js`, `state.js`.
- `chrome-extension/`: popup da extensão.
- `chrome-extension/lib/`: cópia própria de `dates`, `records`, `stats` + `api`/`store` (páginas de extensão não importam arquivos fora de `chrome-extension/`).
- `chrome-extension/ui/`: views do popup (`authView`, `habitsView`, `summaryView`).
- `tests/`: Vitest (ambiente node; `popup-bootstrap.test.js` usa jsdom).
- `public/`: ícones PWA e favicon.

## 3. Comandos padrão

- Instalar dependências: `npm install`
- Dev web: `npm run dev`
- Build web: `npm run build`
- Start produção local: `npm run start`
- Lint: `npm run lint`
- Formatar: `npm run format`
- Checar formatação: `npm run format:check`
- Testes: `npm run test` (watch: `npm run test:watch`)
- Gate completo (format + lint + test + build): `npm run verify`

Qualidade:

- CI: `.github/workflows/ci.yml` roda Prettier, ESLint, Vitest e build em todo push/PR.
- Pre-commit (husky + lint-staged): Prettier + ESLint nos arquivos staged, depois `npm run lint` e `npm run test`.
- Testes ficam em `tests/` (Vitest, ambiente node) e usam `@faker-js/faker` com seed fixa.

Extensão (Tailwind):

- Compilar CSS do popup: `npm run extension:css`
- Watch CSS do popup: `npm run extension:css:watch`

## 4. Variáveis de ambiente

Arquivo base: `.env.example`

- `DATABASE_PATH`: caminho do arquivo SQLite (default `./.data/habits.sqlite`; em produção `/opt/habit-tracker-lig-4/data/habits.sqlite`).
- `NEXT_PUBLIC_SITE_URL`: origem pública usada pelo CORS (opcional).

Observações:

- O schema é criado automaticamente no primeiro acesso (`ensureSchema`).
- Em produção o Cleat detecta `DATABASE_PATH` e habilita o addon `litestream` (backup).
- URL pública: `https://habit-tracker-lig-4.apps.gestaobem.com`

## 5. Regras para alterações

- Não editar arquivos gerados de build em `.next/` e `.netlify/`.
- Ao mexer no popup da extensão, editar **sempre** `chrome-extension/popup.tailwind.css` e depois gerar `popup.css`.
- Manter compatibilidade com os seletores usados no JS do popup (ex.: `.auth-tab`, `.tracker-tab`, `.habit-item`).
- Alterações em auth/API devem preservar suporte a `Authorization: Bearer <token>`.
- Para endpoints usados pela extensão, manter CORS com `OPTIONS` + headers via `lib/cors.js`.
- Lógica de hábitos (datas, registros, estatísticas, CSV) vive em `lib/habits/` e deve ter teste em `tests/`; não duplique dentro de componentes.
- O popup carrega `<script type="module">`: novos arquivos da extensão entram em `chrome-extension/lib` ou `chrome-extension/ui` e são importados por `popup.js` (sem globais novas).
- Componentes de UI do web ficam em `app/components/habits/`; `app/page.js` só orquestra estado, efeitos e handlers.

## 6. Contratos de API relevantes

Rotas:

- `POST /api/auth/signup`
- `POST /api/auth/signin`
- `POST /api/auth/signout`
- `GET /api/auth/me`
- `GET /api/state`
- `PUT /api/state`

Comportamento esperado:

- `401` quando sessão/token inválido.
- `409` no signup de email já cadastrado.
- Sessão via cookie HTTP-only e/ou Bearer token (extensão usa Bearer).

## 7. Fluxo recomendado para mudanças

1. Implementar mudança.
2. Rodar o gate: `npm run verify` (prettier + lint + testes + build).
   - `npm run extension:css` se mexeu no popup.
3. Testar fluxo crítico:
   - Signin/signup.
   - Leitura/escrita em `/api/state`.
   - Popup da extensão carregando sem erro no console.
4. Commit com mensagem clara.

## 8. Deploy

Produção no Cleat (`habit-tracker-lig-4`, server `gestaobem-cx43`).

- Manifesto: `.cleat_deploy/deploy.json` (runtime `node`, `node_version` 22, standalone).
- Env obrigatória: `DATABASE_PATH=/opt/habit-tracker-lig-4/data/habits.sqlite` (fora do release; o Cleat liga o addon `litestream`).
- Deploy: MCP `cleat__deploy` com `app=habit-tracker-lig-4`; acompanhe com `deploy_status` e `apps_logs`.
- `next.config.js` usa `output: "standalone"`; o Cleat sobe `.next/standalone/server.js`.

Após deploy de backend:

- Validar preflight CORS para origem `chrome-extension://...` em `/api/auth/signin`.
- Recarregar extensão em `chrome://extensions` (botão **Reload**).
- `curl -sS https://habit-tracker-lig-4.apps.gestaobem.com/api/state` deve responder 401 sem token.

## 9. Problemas conhecidos

- `npm run lint` ignora `.next/`, `.netlify/` e `chrome-extension/popup.css` (gerado); não remova esses ignores.
- Testes usam scrypt real (custo alto): evite loops muito grandes em testes de senha.
- `node:sqlite` emite `ExperimentalWarning` no Node 22; é esperado e inofensivo.
- Popup pode quebrar com storage antigo/corrompido; manter parsing defensivo no `popup.js`.

## 10. Definição de pronto

Uma task está pronta quando:

- Funcionalidade solicitada funciona no web ou extensão.
- Não há erro de runtime no console do popup.
- Mudanças de CSS da extensão foram compiladas para `popup.css`.
- Se houve mudança de API consumida pela extensão, deploy no Cleat foi realizado e validado.
