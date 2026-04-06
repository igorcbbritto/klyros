# HelpDesk Pro - Plataforma SaaS de Atendimento

Plataforma completa de help desk inspirada em Zendesk, TomTicket e Movidesk.

## Stack

- **Frontend:** Next.js 15 + TypeScript + Tailwind CSS 4
- **Backend:** Supabase (Auth + Database + Storage + Row-Level Security)
- **Charts:** Recharts
- **Icons:** Lucide React
- **AI:** Groq API (compatível com OpenAI)

## Estrutura

```
helpdesk-saas/
├── src/
│   ├── app/
│   │   ├── page.tsx                 → Landing page
│   │   ├── login/page.tsx           → Login/Registro (Supabase Auth)
│   │   ├── layout.tsx               → Root layout
│   │   ├── dashboard/page.tsx       → Dashboard com métricas e gráficos
│   │   ├── dashboard/chamados/      → Lista e detalhes de tickets
│   │   ├── dashboard/atendimento/   → Chat em tempo real
│   │   ├── dashboard/clientes/      → Gestão de clientes
│   │   ├── dashboard/base-conhecimento/ → Artigos e FAQ
│   │   ├── dashboard/relatorios/    → Relatórios e métricas
│   │   ├── dashboard/integracoes/   → Links, widgets, formulários
│   │   ├── dashboard/admin/         → Usuários e configurações
│   │   └── api/ai/                  → Endpoints de IA (classificação e respostas)
│   ├── components/
│   │   ├── layout/                  → Sidebar, Topbar, DashboardLayout
│   │   ├── ui/                      → StatCard, Badge, Modal
│   │   └── charts/                  → Componentes de gráficos Recharts
│   ├── lib/                         → Supabase clients, utils
│   ├── types/                       → TypeScript interfaces
│   └── dashboard-mocks.ts          → Dados mockados (substituir por queries reais)
├── supabase/
│   ├── schema.sql                   → Schema completo com RLS + triggers
│   └── client-queries.md            → Guia de integração com Supabase
```

## Setup Rápido

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Acesse o SQL Editor e execute o script em `supabase/schema.sql`
3. Copie as credenciais do projeto

### 3. Configurar variáveis de ambiente

```bash
cp .env.local.example .env.local
# Edite .env.local com suas credenciais
```

### 4. Rodar localmente

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000)

## Deploy para Produção

### Vercel

1. Suba o projeto para o GitHub
2. Conecte o repositório na [Vercel](https://vercel.com)
3. Adicione as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `AI_API_KEY` (se quiser IA ativa)
4. Deploy automático

### Variáveis de ambiente necessárias

| Variável | Obrigatória | Descrição |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Sim | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sim | Chave anon do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Não | Para operações server-side |
| `AI_API_URL` | Não | Endpoint da API de IA (default: Groq) |
| `AI_API_KEY` | Não | Chave da API de IA |
| `AI_MODEL` | Não | Modelo de IA (default: llama-3.3-70b-versatile) |

## Funcionalidades

- [x] Dashboard com métricas em tempo real
- [x] Gráficos de chamados (barras, pizza, linha)
- [x] CRUD completo de chamados com abas (Novos, Em andamento, Resolvidos, Fechados)
- [x] Visualização de detalhes com chat integrado
- [x] Atendimento em tempo real com histórico
- [x] Gestão de clientes com histórico de chamados
- [x] Base de conhecimento com CRUD e artigos
- [x] Relatórios detalhados com desempenho por atendente
- [x] Página de integrações (link de atendimento, widget, formulário)
- [x] Administração de usuários e configurações com toggles de IA
- [x] Classificação automática de chamados via IA
- [x] Sugestão de resposta automática
- [x] Prioridade automática
- [x] Login/Registro com Supabase Auth
- [x] Responsivo (mobile + desktop)
- [x] Sidebar colapsável com tooltips
- [x] UI moderna estilo SaaS

## IA no sistema

O sistema inclui dois endpoints de IA:

- **`/api/ai/classify`** - Classifica tickets automaticamente (categoria, prioridade, resposta sugerida)
- **`/api/ai/suggest`** - Sugere respostas durante atendimento ao vivo

Para ativar, configure uma chave gratuita da Groq: https://console.groq.com
