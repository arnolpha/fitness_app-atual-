# Fitness App

Aplicativo de treino construído com React + TypeScript + Vite, usando Firebase para autenticação e Zustand para gerenciamento de estado.

## Stack

- **React 18** + **TypeScript**
- **Vite** — build tool
- **Firebase** — autenticação
- **Zustand** — gerenciamento de estado global
- **React Router DOM** — roteamento

## Configuração

### 1. Clone o repositório

```bash
git clone <url-do-repo>
cd fitness-app
npm install
```

### 2. Configure as variáveis de ambiente

Copie o arquivo de exemplo e preencha com suas credenciais do Firebase:

```bash
cp .env.example .env
```

Edite o `.env` com os valores do seu projeto no [Firebase Console](https://console.firebase.google.com/).

### 3. Rode em desenvolvimento

```bash
npm run dev
```

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera o build de produção |
| `npm run preview` | Visualiza o build localmente |

## Estrutura de pastas

```
src/
├── lib/
│   └── firebase.js       # Configuração do Firebase
├── routes/
│   └── AppRoutes.jsx     # Definição das rotas
├── store/
│   └── useAuthStore.js   # Estado global de autenticação
├── App.tsx               # Componente raiz
└── main.tsx              # Entry point
```
