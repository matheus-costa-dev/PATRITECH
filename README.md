📊 PatriTech 

Criamos um sistema web para monitoramento de ativos da prefeitura, através do 
QR code que centraliza o controle dos bens públicos. Ele permite cadastrar, 
acompanhar e gerar relatórios sobre equipamentos, eletrônicos e outros ativos, 
trazendo mais transparência, organização e eficiência para a gestão municipal.

🚀 Acesso ao Site
Acesse a versão online e consulte seus ativos agora mesmo!

https://cpnu-consulta-situacao.vercel.app/ ## 

✨ Funcionalidades
Interação com QR Code: Criação e leitura de QrCode para padronização de ativos
Interface Responsiva: Acessível e funcional em qualquer dispositivo, seja desktop, 
tablet ou celular.
Sistema de lotes: Criação de ativos em massa visando agilidade e padronização.
Histórico: Histórico de defeitos, consertos e movimentações de cada item registrado. 

🛠️ Tecnologias Utilizadas
Este projeto foi construído com as seguintes tecnologias e ferramentas:

Frontend:
- Next.js - Framework React para produção.
- React - Biblioteca para construir interfaces de usuário.
- TypeScript - Superset do JavaScript que adiciona tipagem estática.
- Tailwind CSS - Framework CSS utility-first para estilização rápida.
- React Toastify - Para notificações e alertas.

Analytics:
- Google Analytics - Para monitoramento de tráfego.

Fonte dos Dados:
Os dados exibidos são processados a partir de um banco de dados em nuvem em PostgreSQL, 
consolidando as informações via Supabase.

Hospedagem:
- Vercel - Plataforma de hospedagem otimizada para projetos Next.js.

⚙️ Como Executar o Projeto Localmente
Siga os passos abaixo para rodar este projeto na sua máquina.

Pré-requisitos:
- Node.js (versão 18 ou superior)
- Git

Passos:
- Clone o repositório:

Bash
git clone https://github.com/seu-usuario/seu-repositorio.git
cd seu-repositorio

- Instale as dependências:

Bash
npm install

# ou

yarn install

# ou

pnpm install

- Configure as Variáveis de Ambiente:
Crie um arquivo chamado .env.local na raiz do projeto.
Adicioneo link do seu banco de dados do supabase e sua chave pública. 

Snippet de código

NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

Rode o servidor de desenvolvimento:

Bash
npm run dev

Abra no navegador:

Acesse http://localhost:3000 no seu navegador para ver o projeto funcionando.

📝 Licença
Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

👨🏻‍💻 Autor
Feito com ❤️ por Matheus Costa, Cristiane Mello, Jackie Ximenes, Evelyn.
