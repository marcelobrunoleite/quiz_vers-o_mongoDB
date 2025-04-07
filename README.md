# Quiz App - Aplicativo de Trânsito

## Descrição

Aplicativo de quiz para estudo de legislação de trânsito, desenvolvido com Next.js, PostgreSQL e Redis.

## Requisitos

- Node.js 16+
- PostgreSQL 13+
- Redis 6+
- Yarn ou NPM

## Configuração do Ambiente

1. Clone o repositório:

```bash
git clone [url-do-repositorio]
cd quiz-app
```

2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações.

4. Configure o banco de dados:

```bash
# Criar o banco de dados
npx prisma migrate deploy

# Migrar dados do JSON para o banco
npm run seed
```

## Deploy em Produção

### Preparação

1. Configure as variáveis de ambiente de produção
2. Certifique-se de que o PostgreSQL e Redis estão configurados
3. Configure o domínio e SSL

### Deploy com Vercel

1. Conecte seu repositório à Vercel
2. Configure as variáveis de ambiente na interface da Vercel
3. Deploy:

```bash
vercel --prod
```

### Deploy Manual

1. Build da aplicação:

```bash
npm run build
```

2. Inicie o servidor:

```bash
npm start
```

## Backup e Manutenção

### Backup do Banco de Dados

```bash
# Backup
pg_dump -U [usuario] quiz_db > backup.sql

# Restore
psql -U [usuario] quiz_db < backup.sql
```

### Monitoramento

- Logs são armazenados em `/logs`
- Use o painel de monitoramento da Vercel
- Configure alertas no seu provedor de hospedagem

## Segurança

- Todas as requisições são limitadas por rate limiting
- CORS configurado para origens específicas
- Helmet ativado para proteção contra ataques comuns
- HTTPS forçado em produção
- Autenticação JWT implementada

## Suporte

Para suporte, entre em contato através de [seu-email]
