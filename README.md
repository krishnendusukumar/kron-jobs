# KronJob

**Your Personal AI-Powered LinkedIn Job Scraper**

KronJob is a modern, scalable web application that automates your job search on LinkedIn. Built with Next.js, TypeScript, and Supabase, it helps you find, track, and manage job opportunities—without needing LinkedIn Premium or login.

---

## 🚀 Features

- **LinkedIn Guest Scraping**: Find jobs using LinkedIn's public API—no login required.
- **Smart Filtering**: Search by title, location, keywords, and remote options.
- **User Preferences**: Save your job search criteria for personalized results.
- **Real-Time Scraping**: Start scraping jobs with a single click and see results instantly.
- **Supabase Integration**: Secure, scalable storage for jobs and user preferences.
- **Modern UI/UX**: Clean, responsive design with a beautiful green accent and subtle planetary animation.
- **Proxy Support**: Optional proxy rotation for reliable scraping.
- **Notifications**: (Planned) Get alerts via email or WhatsApp when new jobs match your criteria.

---

## 🖥️ Screenshots

> _Add screenshots here of your landing page, preferences page, and jobs page for best effect!_

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes, Node.js
- **Database**: Supabase (Postgres)
- **Scraping**: LinkedIn Guest API (HTTP, not browser automation)
- **Other**: Proxy support, modern CI/CD ready

---

## ⚡ Quick Start

### 1. Clone the Repo

```bash
git clone https://github.com/yourusername/KronJob.git
cd KronJob
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the `KronJob` directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Set Up Supabase

- Run the SQL scripts in `/KronJob` to set up tables and policies:
  - `database-setup.sql`
  - `database-migration.sql`
  - `fix-rls-policies.sql` (for RLS)
- [Optional] Use `disable-rls-temporarily.sql` for local debugging.

### 5. Start the App

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧑‍💻 Usage

1. **Set Preferences**: Go to the "Set Preferences" page and enter your job search criteria.
2. **Find Jobs**: Go to the "Find Jobs" page and click "Start Scraping" to fetch the latest jobs.
3. **View Results**: See your personalized job list, with links to apply directly on LinkedIn.

---

## 📝 Project Structure

```
KronJob/
  ├─ src/
  │   ├─ app/                # Next.js app pages
  │   ├─ components/         # UI components
  │   ├─ lib/                # Scraper, Supabase client, utilities
  │   └─ ...                 
  ├─ database-setup.sql      # Supabase schema
  ├─ requirements.txt        # (Python legacy, optional)
  ├─ README.md
  └─ ...
```

---

## 🛡️ Security & Ethics

- **For educational and personal use only.**
- Respect LinkedIn's terms of service and robots.txt.
- Do not use for commercial scraping or spamming.

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

---

## 📄 License

MIT License

---

## 🙏 Acknowledgements

- [Supabase](https://supabase.com/)
- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [LinkedIn Guest API research](https://github.com/danielgross/whatsapp-gpt)

---

**KronJob — Automate your job search. Land your dream job.**

---
