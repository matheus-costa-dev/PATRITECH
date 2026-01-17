# Patri Tech

Patri Tech é um sistema de gestão patrimonial e rastreio inteligente desenvolvido como projeto integrador. O sistema foca em controle de ativos, inventário, rastreio por QR Code e controle de acesso. Este README documenta o que foi usado, rotas/URLs importantes, arquitetura geral e detalhes do banco de dados (Supabase com PostgreSQL), além de instruções de setup e implantação.

> Observação: este README foi gerado a partir dos arquivos existentes no repositório. Algumas inferências (por exemplo, nomes exatos de todas as tabelas/colunas) foram feitas a partir dos tipos TypeScript e trechos de código encontrados. Verifique e ajuste conforme o esquema real do seu banco na Supabase.

---

## Índice
- [Demonstração](#demonstração)
- [Stack / Tecnologias utilizadas](#stack--tecnologias-utilizadas)
- [Estrutura do projeto (resumo)](#estrutura-do-projeto-resumo)
- [Rotas / URLs e comportamento esperado](#rotas--urls-e-comportamento-esperado)
- [Banco de dados — Supabase (PostgreSQL)](#banco-de-dados---supabase-postgresql)
  - [Sugestão de schema SQL (exemplo)](#sugestão-de-schema-sql-exemplo)
- [Autenticação e fluxo de sessão](#autenticação-e-fluxo-de-sessão)
- [Variáveis de ambiente necessárias](#variáveis-de-ambiente-necessárias)
- [Como rodar localmente](#como-rodar-localmente)
- [Deploy / Produção](#deploy--produção)
- [Boas práticas e notas de desenvolvimento](#boas-práticas-e-notas-de-desenvolvimento)
- [Referências e onde procurar mais arquivos](#referências-e-onde-procurar-mais-arquivos)
- [Autores / Contato](#autores--contato)

---

## Demonstração
Um vídeo demonstrativo foi incluído no README original (link):
- [Vídeo demonstrativo das funcionalidades](https://1drv.ms/v/c/94e02e8f0fa7bb76/IQDKobQQiPwWRrjqxPcBILR6AbunP3auaPTsPetbtjTaaJQ?e=GHjh3H)

---

## Stack / Tecnologias utilizadas
Baseado nos arquivos do repositório:
- Framework: Next.js (app router, TypeScript)
- Linguagem: TypeScript + React
- Estilização: Tailwind CSS (configuração via postcss + tailwind import)
- Banco de dados / Backend: Supabase (PostgreSQL) — usado para autenticação e tabelas do sistema
- Autenticação: Supabase Auth
- Persistência/Ações do servidor: chamadas ao cliente Supabase (ex.: inserção em `ativos` em server action)
- Pacotes notáveis:
  - react-toastify (notificações)
  - react-data-table-component (tabelas)
  - react-icons
  - next/font (Google fonts)
- Hospedagem sugerida: Vercel (projeto Next.js) e Supabase para DB/API
- Outros: arquivos de config do projeto (tsconfig.json, next.config.ts, eslint, postcss)

---

## Estrutura do projeto (resumo)
Arquivos/paths relevantes encontrados:
- src/app/
  - page.tsx — página inicial (renderiza o componente `Hero`)
  - layout.tsx — layout global (Navbar, Footer, ToastContainer e AuthProvider)
  - actions.ts — server actions (ex.: `criarAtivo`)
  - robots.ts — geração de robots/sitemap
  - globals.css — import do Tailwind
- src/components/
  - Hero.tsx — componente da tela de login/hero
  - shared/Navbar.tsx, shared/Footer.tsx — layout compartilhado
  - UI/ResultTable.tsx — componente de tabela (react-data-table-component)
- src/context/
  - AuthContext (utilizado por componentes para login, logout e controle de sessão)
- src/lib/
  - supabase (cliente supabase importado em actions e componentes)
- src/types/
  - ativo.ts — tipos/interfaces (Ativo, Categoria, Condicao, Localizacao)
  - users.ts — tipo User

---

## Rotas / URLs e comportamento esperado
A aplicação usa o router do Next.js (app router). Abaixo estão as rotas públicas/privadas identificadas com a funcionalidade associada:

- `/` (Home / Login)
  - Componente principal: `Hero` (tela de login).
  - Mostra formulário de login; fornece recuperação de senha via Supabase.
  - Se usuário autenticado, o app redireciona para rotas protegidas pelo AuthContext.

- `/ativos`
  - Página de listagem/gestão de ativos.
  - Possui integração com a tabela `ativos` no Supabase (ex.: `criarAtivo` insere dados e revalida a rota).
  - Espera-se CRUD de ativos e visualização em tabela (usando `ResultTable`).

- `/lote` (ou `/lotes`)
  - Página para gestão de lotes (na Navbar aparece como `/lote`).
  - Possível listagem e associação de ativos a lotes.

- `/redefinir-senha`
  - Página de destino do fluxo de reset de senha (redirectTo usado ao disparar reset via Supabase).
  - O fluxo real de reset é iniciado por `supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/redefinir-senha` })`.

- `/robots.txt` e `/sitemap.xml` (gerados dinamicamente via `src/app/robots.ts` e possivelmente via sitemap generator)
  - robots aponta para `/sitemap.xml`.

Observações:
- A Navbar esconde/mostra links conforme `isAuthenticated`.
- Alguns formulários usam server actions do Next (`'use server'` em `src/app/actions.ts`) para gravar dados no Supabase e revalidar rotas com `revalidatePath()`.

---

## Banco de dados — Supabase (PostgreSQL)
O projeto utiliza Supabase como backend (autenticação e banco PostgreSQL). A aplicação se comunica com a instância Supabase via cliente (importado de `src/lib/supabase`). Abaixo há um exemplo de como o schema pode ser modelado com base nas interfaces TypeScript presentes no repositório (ajuste conforme seu DB real).

Exemplo de tabelas/colunas inferidas (PostgreSQL / SQL):

```sql
-- Exemplo de schema (ajuste nomes e tipos conforme necessidade)

-- Usuários (geralmente Supabase Auth controla autenticação; esta tabela armazena perfis)
CREATE TABLE IF NOT EXISTS usuarios (
  id uuid PRIMARY KEY,            -- corresponde ao id do auth do supabase
  nome text,
  email text UNIQUE,
  role text,
  criado_em timestamptz DEFAULT now()
);

-- Categorias de ativos
CREATE TABLE IF NOT EXISTS categorias (
  id_categoria serial PRIMARY KEY,
  nome_categoria text NOT NULL
);

-- Condições de ativos
CREATE TABLE IF NOT EXISTS condicoes (
  id_condicao serial PRIMARY KEY,
  nome_condicao text NOT NULL,
  gera_avaria boolean DEFAULT false
);

-- Localizações
CREATE TABLE IF NOT EXISTS localizacoes (
  id_localizacao serial PRIMARY KEY,
  nome_localizacao text NOT NULL
);

-- Lotes (opcional)
CREATE TABLE IF NOT EXISTS lotes (
  id_lote serial PRIMARY KEY,
  nome_lote text,
  descricao text,
  criado_em timestamptz DEFAULT now()
);

-- Ativos
CREATE TABLE IF NOT EXISTS ativos (
  id_ativo uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_ativo text NOT NULL,
  id_categoria integer REFERENCES categorias(id_categoria),
  id_condicao integer REFERENCES condicoes(id_condicao),
  id_localizacao integer REFERENCES localizacoes(id_localizacao),
  id_usuario_criador uuid REFERENCES usuarios(id),
  id_lote integer REFERENCES lotes(id_lote),
  data_ultima_verificacao timestamptz,
  data_criacao timestamptz DEFAULT now()
);
```

Observação: no código do repositório há uma inserção em `supabase.from('ativos').insert([{ Item: item }])` — verifique se a coluna se chama `Item` (case sensitive) ou `nome_ativo`. Ajuste a coluna conforme o seu banco.

---

## Sugestão de migrations / dicas ao criar o DB no Supabase
- Crie a instância no Supabase e execute os scripts SQL acima (ou use o editor de tabelas).
- Habilite as policies e regras de Row-Level Security (RLS) conforme necessário:
  - Durante desenvolvimento, você pode desativar temporariamente RLS.
  - Em produção, configure policies para que apenas usuários autenticados possam inserir/atualizar/excluir seus ativos (ou conforme regras da sua organização).

---

## Autenticação e fluxo de sessão
- A aplicação utiliza Supabase Auth.
- Comportamento:
  - Login: feito via AuthContext que usa `supabase.auth.signInWithPassword` ou método equivalente (ver `src/context/AuthContext`).
  - O AuthContext expõe `login`, `logout`, `isAuthenticated`, `loading`.
  - O componente `Hero` chama `login(email, password)`.
  - Reset de senha: `supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/redefinir-senha` })`.
  - As mudanças de sessão provavelmente são escutadas com `supabase.auth.onAuthStateChange` para redirecionamentos/atualizações de UI.

---

## Variáveis de ambiente necessárias
Defina as variáveis de ambiente no seu `.env.local` (ou no painel do Vercel) para que o cliente Supabase funcione:

- NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
- NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
- SUPABASE_SERVICE_ROLE_KEY=your_service_role_key (apenas se você for executar ações privilegiadas no servidor — guarde com segurança, não exponha no client)
- NEXTAUTH_URL (se aplicável em integrações extras)
- OUTRAS_VARS (por exemplo configurações de OAuth, redirect URIs, etc.)

Observação: Use as chaves públicas (NEXT_PUBLIC_*) no client. Chaves com privilégios devem ficar somente no servidor e em variáveis que não começam com NEXT_PUBLIC_.

---

## Como rodar localmente

1. Clone o repositório:
   - git clone https://github.com/matheus-costa-dev/PATRITECH.git
2. Instale dependências:
   - npm install
   - ou yarn
3. Configure as variáveis de ambiente no arquivo `.env.local` (veja seção acima).
4. Inicie o servidor de desenvolvimento:
   - npm run dev
5. Abra no navegador:
   - http://localhost:3000

Observação: verifique se a instância Supabase está acessível com a URL e a ANON KEY utilizadas.

---

## Deploy / Produção
- Frontend: Vercel (Next.js) é a opção natural — configure as variáveis de ambiente em Vercel.
- Backend/DB: Supabase (PostgreSQL) — configure tables e policies.
- Certifique-se de:
  - Atualizar as URLs de redirect de reset de senha no Supabase para apontar para a URL de produção (ex.: https://patritech.vercel.app/redefinir-senha).
  - Configurar domínio, sitemap e robots adequadamente (robots.ts está presente para ajudar).

---

## Boas práticas e notas de desenvolvimento
- Confirme nomes de colunas/nomes de tabela no Supabase (ex.: `Item` vs `nome_ativo`).
- Habilite RLS com policies específicas para proteção dos dados em produção.
- Use migrations/SQL no Git ou no painel do Supabase para versionar alterações no DB.
- Utilize tipos TypeScript do arquivo `src/types/*` para manter consistência entre frontend e o modelo de dados.
- Garanta tratar erros nas ações do servidor (ex.: verificar `error` retornado pelo Supabase e notificar o usuário).

---

## Referências e onde procurar mais arquivos
- Repositório no GitHub: [matheus-costa-dev/PATRITECH](https://github.com/matheus-costa-dev/PATRITECH)
- Resultados de code search usados durante a inspeção (pode haver mais arquivos; a busca programática pode estar limitada): [Pesquisar no repositório](https://github.com/matheus-costa-dev/PATRITECH/search)

> Observação: os resultados de busca que utilizei podem estar incompletos — veja a página de busca do repositório para inspecionar todo o código.

---

## Autores / Contato
- Projeto desenvolvido por: Matheus Costa (e equipe citada em metadata: Jackie, Cris, Evelyn)
- Links e portfólios: disponíveis no arquivo `src/app/layout.tsx` (section authors) — atualize conforme necessário.

---