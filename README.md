# Habit Tracker LIG-4

Aplicação de hábitos no estilo Connect 4, com:

- App web em Next.js 16
- Autenticação por usuário
- Persistência em Turso (libSQL)
- Extensão Chrome conectada ao backend da Netlify

## Demo

- Web (produção): [https://habit-tracker-lig-4.netlify.app](https://habit-tracker-lig-4.netlify.app)

## Funcionalidades

### Web

- Cadastro, login e logout
- Estado dos hábitos separado por usuário
- Marcação por dia (`Feito`, `Falhou`, `Sem marcação`)
- Navegação por mês
- Persistência via `/api/state`

### Extensão Chrome (`chrome-extension/`)

- Login e cadastro direto no popup
- Consome backend web em produção (`https://habit-tracker-lig-4.netlify.app`)
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
- Turso / `@libsql/client`

## Estrutura

- `app/` páginas e APIs (App Router)
- `app/components/habits/` componentes de UI do calendário e resumo
- `app/api/auth/*` autenticação
- `app/api/state` estado de hábitos por usuário
- `lib/auth.js` sessão e hash de senha
- `lib/turso.js` conexão e schema
- `lib/cors.js` CORS para web e `chrome-extension://...`
- `lib/habits/` lógica pura (datas, registros, estatísticas, CSV, estado)
- `chrome-extension/` popup da extensão (`lib/` lógica pura, `ui/` views)
- `tests/` suíte Vitest (node + jsdom para o popup)

## Pré-requisitos

- Node.js 18+
- npm
- Banco Turso criado

## Variáveis de ambiente

Copie e preencha:

```bash
cp .env.example .env.local
```

`TURSO_DATABASE_URL` e `TURSO_AUTH_TOKEN` são obrigatórias para persistência/autenticação.

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

## Deploy (Netlify)

Deploy de produção:

```bash
netlify deploy --prod --build
```

Observação: para extensão funcionar, o backend precisa estar deployado com CORS habilitado nas rotas de auth/state.

## Licença

MIT
