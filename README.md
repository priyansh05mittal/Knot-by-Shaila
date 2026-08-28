# 🧶 Crochet Nest — Premium Handmade Crochet E-Commerce Platform

A full-stack, production-ready e-commerce platform for a handmade crochet brand — built with React (Vite), Node.js/Express, and MongoDB Atlas. Includes a complete storefront, custom crochet order requests, review moderation, and a premium admin dashboard with analytics.

---

## ✨ Features

- **Storefront**: Home, shop with filters/search/sort, product detail, cart, checkout, wishlist, recently viewed
- **Auth**: Signup + email OTP verification (no auto-login), login with "remember me", Google OAuth, forgot/reset password, JWT in httpOnly cookies
- **Custom Crochet Orders**: Customers submit requests with reference image uploads → Admin reviews, quotes, and manages status → Customer accepts quote
- **Products**: Dynamic per-product attributes (material, pattern, care instructions, etc.), variants, categories with subcategories
- **Reviews**: Submitted reviews are hidden until admin approval
- **Admin Panel**: Dashboard with KPIs & charts, product/category/banner management, order management with status timeline, custom order quoting, review moderation, user block/unblock, deep analytics
- **Payments**: Razorpay (online) + Cash on Delivery
- **Notifications**: Real-time order/custom-order updates via Socket.io, branded transactional emails via Nodemailer
- **SEO**: Dynamic meta tags, OG/Twitter tags, robots.txt, sitemap.xml, html-sitemap.html

---

## 🛠️ Tech Stack

**Frontend:** React (Vite), Tailwind CSS, React Router DOM, TanStack Query, Framer Motion, Axios, React Hot Toast, Swiper, Recharts, Socket.io Client

**Backend:** Node.js, Express.js, MongoDB Atlas (Mongoose), Socket.io

**Security:** Helmet, HPP, express-rate-limit, express-mongo-sanitize, xss-clean, CORS, JWT, bcryptjs, express-validator

**Integrations:** Cloudinary (images), Multer, Nodemailer, Razorpay, Google OAuth

---

## 📁 Project Structure

```
crochet-ecommerce/
├── backend/
│   ├── config/          # DB & Cloudinary configuration
│   ├── controllers/     # Route handlers / business logic
│   ├── middleware/      # Auth, error handling, uploads, rate limiting
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routers
│   ├── utils/           # Helpers: email, tokens, API features, seed script
│   ├── validations/     # express-validator rule sets
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── public/           # robots.txt, sitemap.xml, html-sitemap.html, favicon
    ├── src/
    │   ├── components/   # layout, common, home, admin components
    │   ├── context/      # Auth & Cart context providers
    │   ├── pages/         # storefront, auth, account, admin pages
    │   ├── routes/        # route guards (Protected/Admin/Guest)
    │   ├── services/      # API service modules (axios)
    │   ├── App.jsx
    │   └── main.jsx
    ├── .env.example
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A MongoDB Atlas cluster (see setup below)
- Cloudinary account
- Razorpay account (test mode is fine to start)
- Gmail (or any SMTP provider) for Nodemailer
- Google Cloud project for OAuth (optional, for Google login)

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Environment Variables

Copy the example env files and fill in your credentials:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

See [Environment Variables](#-environment-variables) below for details on every value.

### 3. Seed the Database (optional but recommended)

Creates an admin account and starter categories:

```bash
cd backend
npm run seed
```

This creates an admin user:
- **Email:** `admin@crochetnest.com`
- **Password:** `Admin@12345`

⚠️ **Change this password immediately after your first login**, or set `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` env vars before seeding to use your own credentials.

### 4. Run in Development

```bash
# Terminal 1 — backend (http://localhost:5000)
cd backend
npm run dev

# Terminal 2 — frontend (http://localhost:5173)
cd frontend
npm run dev
```

The Vite dev server proxies `/api` requests to your backend automatically (see `vite.config.js`).

---

## 🔧 Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `NODE_ENV` | `development` or `production` |
| `PORT` | Backend server port (default `5000`) |
| `CLIENT_URL` | Frontend URL, used for CORS and email links |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Long random string for signing JWTs |
| `JWT_EXPIRES_IN` | Token expiry, e.g. `7d` |
| `SESSION_SECRET` | Long random string for express-session |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | From Google Cloud Console |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | From your Cloudinary dashboard |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | Your SMTP provider credentials |
| `EMAIL_FROM` | Display name/address for outgoing emails |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | From your Razorpay dashboard |

### Frontend (`frontend/.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | API base path (default `/api`, uses Vite proxy) |
| `VITE_API_PROXY_TARGET` | Backend URL for the dev proxy |
| `VITE_GOOGLE_CLIENT_ID` | Public Google OAuth client ID |
| `VITE_RAZORPAY_KEY_ID` | Public Razorpay key (safe to expose) |

---

## 🗄️ MongoDB Atlas Setup

1. Create a free account at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Create a new cluster (the free M0 tier works for development).
3. Under **Database Access**, create a database user with a strong password.
4. Under **Network Access**, add your IP (or `0.0.0.0/0` for development — restrict this in production).
5. Click **Connect → Drivers**, copy the connection string, and paste it into `MONGO_URI` in `backend/.env`, replacing `<username>`, `<password>`, and the database name.

---

## ☁️ Cloudinary Setup

1. Create a free account at [cloudinary.com](https://cloudinary.com).
2. From your dashboard, copy your **Cloud Name**, **API Key**, and **API Secret** into `backend/.env`.
3. No manual folder creation needed — the app automatically organizes uploads into `crochet-nest/products`, `crochet-nest/categories`, `crochet-nest/banners`, `crochet-nest/avatars`, `crochet-nest/reviews`, and `crochet-nest/custom-orders`.

---

## 💳 Razorpay Setup

1. Create an account at [razorpay.com](https://razorpay.com) and complete KYC (or use **Test Mode** for development).
2. From **Settings → API Keys**, generate a Key ID and Key Secret.
3. Add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to `backend/.env`, and `VITE_RAZORPAY_KEY_ID` to `frontend/.env`.
4. In test mode, use Razorpay's [test card numbers](https://razorpay.com/docs/payments/payments/test-card-upi-details/) to simulate payments.

---

## 🔐 Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/) → create a new project.
2. Navigate to **APIs & Services → Credentials → Create Credentials → OAuth Client ID**.
3. Choose **Web Application**, and add your frontend URL (e.g. `http://localhost:5173`) to **Authorized JavaScript origins**.
4. Copy the **Client ID** into both `backend/.env` (`GOOGLE_CLIENT_ID`) and `frontend/.env` (`VITE_GOOGLE_CLIENT_ID`).
5. Integrate the [Google Identity Services](https://developers.google.com/identity/gsi/web/guides/overview) script in `Login.jsx`'s `handleGoogleLogin` function to obtain an `idToken`, then call `loginWithGoogle(idToken)` from `AuthContext`.

---

## 📧 Email (Nodemailer) Setup

For Gmail:
1. Enable 2-Step Verification on your Google account.
2. Generate an [App Password](https://myaccount.google.com/apppasswords).
3. Use your Gmail address as `SMTP_USER` and the app password as `SMTP_PASS`.

Any SMTP provider (SendGrid, Mailgun, AWS SES, etc.) works the same way — just update `SMTP_HOST`/`SMTP_PORT` accordingly.

---

## 📦 Production Deployment Guide

### Backend
1. Set `NODE_ENV=production` and update `CLIENT_URL` to your production frontend domain.
2. Deploy to any Node host (Render, Railway, AWS EC2/ECS, DigitalOcean App Platform, etc.).
3. Ensure your MongoDB Atlas Network Access list includes your production server's IP (or use a VPC peering / private endpoint for tighter security).
4. Set all environment variables in your hosting provider's dashboard — never commit `.env` to version control.

### Frontend
1. Run `npm run build` inside `frontend/` — this outputs a static `dist/` folder.
2. Deploy `dist/` to Vercel, Netlify, Cloudflare Pages, or serve it via Nginx/any static host.
3. Set `VITE_API_URL` to your deployed backend's full URL (e.g. `https://api.crochetnest.com/api`).
4. Update `robots.txt` and `sitemap.xml` in `frontend/public/` with your real production domain.

### General Production Checklist
- [ ] Rotate all secrets (`JWT_SECRET`, `SESSION_SECRET`) to strong random values
- [ ] Switch Razorpay to live mode keys
- [ ] Set up a custom domain + SSL (most hosts handle this automatically)
- [ ] Restrict MongoDB Atlas network access to your server's IP only
- [ ] Set up automated MongoDB Atlas backups
- [ ] Change the seeded admin password
- [ ] Configure a real sitemap generation job (see comment in `sitemap.xml`) to include all live product/category URLs
- [ ] Set up monitoring/logging (e.g. Sentry, LogRocket, or your host's built-in logs)

---

## 🧪 Useful Scripts

```bash
# Backend
npm run dev      # start with nodemon (auto-restart)
npm start        # start in production mode
npm run seed     # seed admin user + starter categories

# Frontend
npm run dev       # start Vite dev server
npm run build     # production build → dist/
npm run preview   # preview the production build locally
```

---

## 📄 License

This project is proprietary to the Crochet Nest brand. Adapt freely for your own handmade business.
