# AutoBudget AI 💰

A modern, responsive digital wallet application built with **React (Vite + TypeScript)** and **Supabase** for authentication, database, and serverless functions.  

## 🚀 Features

- 🔐 User authentication via **Supabase**
- 💸 Manage income and expenses
- 📊 Visualize transactions with charts & insights
- 💾 Persistent storage using Supabase database
- 🌐 Deployed seamlessly via **Vercel**
- 📱 Responsive UI built with **Tailwind CSS**
- ⚡ Fast development experience using **Vite**

---

## 🧠 Tech Stack

| Layer | Technology |
|-------|-------------|
| Frontend | React 18 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Backend / Database | Supabase (PostgreSQL, Auth, Edge Functions) |
| Deployment | Lovable.dev |
| Code Quality | ESLint + Prettier |
| Configs | TOML, TSConfig |

---

## ⚙️ Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Shreyas-135/AutoBudget.git
   cd AutoBudget
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Copy `.env.example` to `.env`
   - Fill in your Supabase credentials:
     ```
     VITE_SUPABASE_PROJECT_ID=your_project_id_here
     VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key_here
     VITE_SUPABASE_URL=your_supabase_url_here
     ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

---

## 🧩 Project Structure

```text
gemini-wise-wallet/
├── public/
│   ├── favicon.ico
│   ├── placeholder.svg
│   └── robots.txt
│
├── src/
│   ├── components/       # Reusable UI components
│   ├── hooks/            # Custom React hooks
│   ├── integrations/     # Third-party or API integrations
│   ├── lib/              # Utility functions / helpers
│   ├── pages/            # Page-level components
│   ├── App.css
│   ├── App.tsx           # Root app component
│   ├── index.css
│   ├── main.tsx          # Entry point
│   └── vite-env.d.ts
│
├── supabase/             # Supabase configuration
│   ├── functions/        # Edge functions
│   ├── migrations/       # Database migrations
│   └── config.toml
│
├── .env.example          # Environment variables template
├── .gitignore
├── components.json
├── eslint.config.js
├── index.html
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.ts
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts


