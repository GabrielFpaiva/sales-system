# TechStore - Sistema de Vendas

Sistema completo de gerenciamento para loja de celulares e eletrônicos, com controle de produtos, vendas, clientes e vendedores.

## Pré-requisitos

Antes de começar, você precisa ter instalado em sua máquina:

- [Node.js](https://nodejs.org/) (v14 ou superior)
- [PostgreSQL](https://www.postgresql.org/) (v12 ou superior)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)

## Configuração

### 1. Instalação do PostgreSQL

Se você ainda não tem o PostgreSQL instalado:

1. Baixe e instale o PostgreSQL a partir do [site oficial](https://www.postgresql.org/download/)
2. Durante a instalação, defina uma senha para o usuário `postgres`
3. Você pode instalar também o [pgAdmin](https://www.pgadmin.org/) para gerenciar o banco de dados visualmente

### 2. Criação do Banco de Dados

Após instalar o PostgreSQL, crie um novo banco de dados:

\`\`\`bash
# Conecte ao PostgreSQL
psql -U postgres

# Crie o banco de dados
CREATE DATABASE sales_system;

# Saia do console PostgreSQL
\q
\`\`\`

Alternativamente, você pode criar o banco de dados usando o pgAdmin.

### 3. Configuração do Arquivo .env

1. Clone este repositório para sua máquina local
2. Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

\`\`\`
POSTGRES_USER=postgres
POSTGRES_HOST=localhost
POSTGRES_DATABASE=sales_system
POSTGRES_PASSWORD=sua_senha_aqui
POSTGRES_PORT=5432
\`\`\`

Substitua `sua_senha_aqui` pela senha que você definiu para o usuário `postgres`.

### 4. Instalação das Dependências

Execute o seguinte comando na raiz do projeto:

\`\`\`bash
npm install
# ou
yarn
\`\`\`

### 5. Inicialização do Banco de Dados

Execute o script para criar as tabelas e inserir dados iniciais:

\`\`\`bash
npm run init-db
# ou
yarn init-db
\`\`\`

### 6. Execução da Aplicação

Inicie o servidor de desenvolvimento:

\`\`\`bash
npm run dev
# ou
yarn dev
\`\`\`

Acesse a aplicação em [http://localhost:3000](http://localhost:3000)

## Solução de Problemas

Se você encontrar problemas ao inicializar o banco de dados através do script, você pode usar a interface da aplicação:

1. Inicie a aplicação com `npm run dev`
2. Acesse [http://localhost:3000/init-db](http://localhost:3000/init-db)
3. Clique no botão "Inicializar Banco de Dados"

## Funcionalidades

- **Produtos**: Cadastro e gerenciamento de produtos, controle de estoque
- **Vendas**: Registro de vendas, aplicação de descontos, histórico de transações
- **Clientes**: Cadastro de clientes com preferências e histórico de compras
- **Vendedores**: Gerenciamento de equipe de vendas, comissões e desempenho
- **Relatórios**: Análise de vendas, produtos mais vendidos, desempenho de vendedores

## Sistema de Descontos

O sistema oferece descontos especiais baseados nas preferências dos clientes:

- 25% de desconto para clientes que torcem para o Flamengo
- 25% de desconto para clientes que assistem One Piece
- 25% de desconto para clientes que são de Sousa

Os descontos são cumulativos, podendo chegar a 75% se o cliente atender a todos os critérios.

## Tecnologias Utilizadas

- Next.js
- React
- TypeScript
- PostgreSQL
- Tailwind CSS
- shadcn/ui
