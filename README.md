# Habit Tracker - Lig-4 Style

A beautiful, interactive habit tracker built with Next.js and styled with Tailwind CSS, inspired by the Connect 4 game visualization.

<img width="1678" height="920" alt="Screenshot 2025-09-05 at 08 22 34" src="https://github.com/user-attachments/assets/7320a5fb-8241-418d-a04f-8cd5cd99323e" />

## Features

- 📅 Monthly calendar view with day-by-day tracking
- 🎯 Visual habit tracking with colored tokens (green = completed, red = missed)
- ✏️ Inline habit editing and management
- 📊 Completion statistics and percentages
- 💾 Local storage persistence
- 🎨 Beautiful, responsive design
- ⚡ Smooth animations with Framer Motion

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Configure Turso environment variables:
```bash
cp .env.example .env.local
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

- **Add habits**: Click "Novo hábito" to add a new habit
- **Track progress**: Click on circles to mark habits as completed (green) or missed (red)
- **Clear marks**: Right-click on circles to clear the mark
- **Edit habits**: Click on habit names to edit them
- **Navigate months**: Use the arrow buttons to navigate between months
- **View stats**: See completion rates and statistics for each habit

## Tech Stack

- **Next.js 16** - React framework
- **React 19** - UI library
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **Turso (libSQL)** - Persistent cloud database

## Data Storage

Data is persisted in Turso through `/api/state`.  
If Turso env vars are not configured, the app automatically falls back to localStorage.

## License

MIT
