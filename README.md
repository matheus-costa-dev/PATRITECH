📊 Consulta de Situação - CPNU

📄 Descrição
Este projeto é uma ferramenta de consulta desenvolvida para oferecer uma interface clara, rápida e acessível para que os candidatos do Concurso Público Nacional Unificado (CPNU) possam verificar sua situação e classificação detalhada no cadastro de reserva.

A motivação por trás deste projeto é promover a transparência e facilitar o controle social sobre os resultados e convocações do concurso.

🚀 Acesso ao Site
Acesse a versão online e faça sua consulta agora mesmo!

https://cpnu-consulta-situacao.vercel.app/ ## ✨ Funcionalidades

Consulta Rápida: Busque sua situação utilizando apenas o número de inscrição.

Classificação Detalhada: Visualize sua posição nas diferentes listas de concorrência:

Ampla Concorrência (AC)

Pessoas Pretas ou Pardas (PPP)

Pessoas com Deficiência (PcD)

Indígenas

Notificações em Tempo Real: Feedback instantâneo sobre o status da busca e resultados.

Interface Responsiva: Acessível e funcional em qualquer dispositivo, seja desktop, tablet ou celular.

🛠️ Tecnologias Utilizadas
Este projeto foi construído com as seguintes tecnologias e ferramentas:

Frontend:

Next.js - Framework React para produção.

React - Biblioteca para construir interfaces de usuário.

TypeScript - Superset do JavaScript que adiciona tipagem estática.

Tailwind CSS - Framework CSS utility-first para estilização rápida.

React Toastify - Para notificações e alertas.

Analytics:

Google Analytics - Para monitoramento de tráfego.

Fonte dos Dados:

Os dados exibidos são processados a partir de um banco de dados SQLite, consolidando as informações dos 8 blocos do concurso.

Hospedagem:

Vercel - Plataforma de hospedagem otimizada para projetos Next.js.

⚙️ Como Executar o Projeto Localmente
Siga os passos abaixo para rodar este projeto na sua máquina.

Pré-requisitos
Node.js (versão 18 ou superior)

Git

Passos
Clone o repositório:

Bash

git clone https://github.com/seu-usuario/seu-repositorio.git
cd seu-repositorio
Instale as dependências:

Bash

npm install
# ou
yarn install
# ou
pnpm install
Configure as Variáveis de Ambiente:

Crie um arquivo chamado .env.local na raiz do projeto.

Adicione as variáveis necessárias. No mínimo, a do Google Analytics:

Snippet de código

NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
Rode o servidor de desenvolvimento:

Bash

npm run dev
Abra no navegador:

Acesse http://localhost:3000 no seu navegador para ver o projeto funcionando.

📝 Licença
Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

👨‍💻 Autor
Feito com ❤️ por Matheus Costa.