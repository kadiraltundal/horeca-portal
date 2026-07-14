# HORECA Portal - Frontend

Next.js 16 Telegram Mini App for the HORECA sector in Uzbekistan.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Zustand (State Management)
- Telegram WebApp SDK

## Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs on http://localhost:3000

## Project Structure

```
src/
├── app/              # Pages (App Router)
│   ├── (auth)/       # Login route group
│   ├── (main)/       # Authenticated pages
│   ├── admin/        # Admin panel
│   └── search/       # Search page
├── components/       # UI components
├── hooks/            # Custom hooks
├── stores/           # Zustand stores
├── services/         # API services
├── lib/              # Utilities
└── types/            # TypeScript types
```

## Pages

- `/` - Home page (categories, quick actions)
- `/login` - Telegram login
- `/search` - Autocomplete search
- `/categories` - Category list
- `/products/[id]` - Product detail
- `/cart` - Shopping cart
- `/quotes` - Quote history
- `/favorites` - User favorites
- `/notifications` - Notification center
- `/profile` - User profile
- `/settings` - Language/notification settings
- `/admin/dashboard` - Admin dashboard
- `/admin/products` - Product management
- `/admin/quotes` - Quote management

## Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_TELEGRAM_BOT_URL=https://t.me/your_bot_username
```

## Deployment

Frontend is configured for Vercel deployment (fra1 region).

See [DEPLOY.md](../DEPLOY.md) for deployment instructions.
