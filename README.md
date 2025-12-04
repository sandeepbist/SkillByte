# SkillByte 🚀

**The Future of Micro-Learning: Master Skills in 60 Seconds.**

SkillByte is a modern, mobile-first learning platform tailored for developers. It combines the engaging, swipeable interface of short-form video apps with powerful educational tools—including structured courses, interactive polls, and an AI-powered tutor.

---

## ✨ Key Features

### 📱 Core Experience

- **Infinite Feed:** A smooth, snap-scrolling video feed powered by **GSAP** for a premium "TikTok-like" feel.
- **Interactive Video:** Double-tap to like, share, and comment. Real-time progress tracking saves your spot automatically.

### 🤖 AI-Powered Learning

- **AI Tutor:** Built-in integration with **Google Gemini API**. Click the "AI Tutor" button on any reel to instantly generate:
  - 📝 Summaries of key concepts.
  - ❓ Interactive quizzes to test your knowledge.
  - 💡 Coding challenges and practice ideas.

### 👨‍💻 For Creators

- **Creator Studio:** A dedicated dashboard to upload reels, manage content, and view analytics.
- **Micro-Courses:** Unique ability to bundle loose video reels into structured, step-by-step learning paths.
- **Interactive Polls:** Embed polls directly into videos to engage learners.

### 📚 For Learners

- **Personal Library:** Save videos to custom playlists and track your learning history.
- **Role-Based Access:** Distinct experiences for Learners and Creators, secured by **Supabase Auth**.

---

## 🛠️ Tech Stack

- **Framework:** [SvelteKit](https://kit.svelte.dev/) (Svelte 5)
- **Language:** TypeScript
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Backend & DB:** [Supabase](https://supabase.com/) (Auth, PostgreSQL, Storage)
- **AI:** Google Gemini API
- **Animations:** GSAP (GreenSock)
- **Testing:** Vitest & Playwright

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm (recommended) or npm
- A Supabase project
- A Google Cloud API Key (for Gemini)

### Installation

1.  **Clone the repository**

    ```bash
    git clone [https://github.com/yourusername/skillbyte.git](https://github.com/yourusername/skillbyte.git)
    cd skillbyte
    ```

2.  **Install dependencies**

    ```bash
    pnpm install
    ```

3.  **Configure Environment Variables**
    Create a `.env` file in the root directory based on the example below:

    ```env
    # Supabase Configuration
    PUBLIC_SUPABASE_URL=your_supabase_project_url
    PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

    # AI Configuration (Google Gemini)
    GOOGLE_API_KEY=your_google_api_key
    ```

4.  **Run the development server**

    ```bash
    pnpm dev
    ```

5.  **Open your browser**
    Navigate to `http://localhost:5173` to see the app in action.

---

## 🧪 Testing

The project is equipped with unit and browser testing.

- **Run Unit Tests:**
  ```bash
  pnpm test:unit
  ```
- **Run All Tests:**
  ```bash
  pnpm test
  ```

---

## 📂 Project Structure

- `src/lib/components/`: Core UI blocks (Feed, VideoReel, AiAssistant, Polls).
- `src/routes/`: SvelteKit file-system routing.
  - `/creator`: Protected routes for content upload and course management.
  - `/library`: User playlists and history.
  - `/login`: Authentication pages.
- `src/lib/supabaseClient.ts`: Database initialization and helper functions.

---

## 🤝 Contributing

Contributions are welcome! Whether it's fixing a bug 🐛, adding a new feature ✨, or improving documentation md.

1.  Fork the project.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

---

Built with ❤️ by the SkillByte Team.
