# URLSnip — Modern Dynamic URL Shortener & Bio Link Tree Generator

> **A Product by Vyne Technologies** 🚀

URLSnip is a full-featured, modern URL shortener, Bio Link Tree generator, QR code designer, and traffic analytics dashboard built with **React**, **TypeScript**, **Tailwind CSS**, and **Supabase**.

---

## 🌟 Key Features

### 🔗 1. Dynamic URL Shortener & Custom Aliases
- Instant short code generation or custom alias assignment (e.g. `/#/r/my-alias`).
- Password protection with anti-bot challenge locks for sensitive links.
- Expiration control (scheduled expiration windows).
- UTM parameters generator (source, medium, campaign tracking).

### 🌴 2. Bio Link Tree Builder & Generator
- Single sharable bio pages (e.g. `/#/tree/username`) for Instagram, TikTok, Twitter/X, and YouTube bios.
- Rich theme presets (`Indigo`, `Emerald`, `Rose`, `Amber`, `Violet`, `Ocean`, `Sunset`, `Slate`, `Dark`).
- Custom native color wheel picker (`<input type="color">`) generating inline CSS gradients.
- Unified portal builder with live theme preview.

### 🎨 3. QR Code Studio
- Generate downloadable high-resolution PNG QR codes for any short link or custom URL.
- Fully customizable background and foreground colors.
- Embed custom center icons/logos into QR codes.

### 📊 4. Traffic & Click Analytics Dashboard
- Real-time click counters, page views, and redirection logs.
- Dynamic device breakdown (Desktop, Mobile, Tablet percentages).
- Top traffic origin sources & referrer channels.
- Filter analytics across all links combined or individual Short Links and Bio Link Trees.

### 🛡️ 5. Security & Bot Protection
- Anti-bot math challenge captcha on authentication.
- Rate-limiting lockout cooldowns on repeated failed attempts.
- Supabase Row Level Security (RLS) and Security Definer RPC functions for safe public analytics updates.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Backend & Database**: Supabase PostgreSQL, Auth, Row Level Security (RLS), RPC Stored Procedures.
- **Routing**: Hash-based routing with tab persistence across refreshes.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/urlsnip.git
   cd urlsnip
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=https://your-supabase-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

5. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 🗄️ Supabase Database Setup

Run the SQL script provided in [`supabase_schema.sql`](./supabase_schema.sql) in your Supabase SQL Editor.

It creates:
- `public.links` table & RLS policies
- `public.bio_trees` table & RLS policies
- Security Definer RPC functions: `increment_bio_tree_view`, `increment_bio_tree_link_click`, and `increment_link_click`

---

## 📜 License & Attribution

This project is licensed under the terms defined in the [LICENSE](./LICENSE) file.

**Attribution Notice**:
Any distribution, public deployment, white-labeling, or derivative work MUST preserve and visibly display attribution to **Vyne Technologies** (*"A Product by Vyne Technologies"*) in the application footer and documentation. Selling or reselling without attribution is strictly prohibited.

---

<p center="text-center">
  <strong>URLSnip — A Product by Vyne Technologies</strong>
</p>
