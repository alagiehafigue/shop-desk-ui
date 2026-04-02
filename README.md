# ShopDesk UI

ShopDesk is a modern **Point of Sale (POS) website** built for retail businesses.
This repository contains the **frontend** responsible for the user interface.

Built with:

- React
- Vite
- React Router
- TanStack Query
- Tailwind CSS

## Features

- role-based dashboard experience
- sales and checkout flow
- products, inventory, and customers management
- payments center
- reports for admin and manager roles
- Paystack-powered card and mobile money checkout flow

## Requirements

- Node.js 18+
- ShopDesk backend API running locally or deployed

## Environment Variables

Create a `.env` file in `shop-desk-ui` and set:

```env
VITE_API_URL=http://localhost:5000
VITE_PAYSTACK_PUBLIC_KEY=pk_test_or_pk_live_key
```

## Installation

Clone the repository and enter the frontend folder:

```bash
cd shop-desk-ui
```

Install dependencies:

```bash
npm install
```

## Running Locally

Start the Vite development server:

```bash
npm run dev
```

Default local app URL:

```text
http://localhost:5173
```

## Production Build

Build the app:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Deployment

This frontend is ready for Vercel deployment.

### Vercel

- Root directory: `shop-desk-ui`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable:

The project includes `vercel.json` so React Router routes work correctly after refresh.

## Authentication Notes

- access tokens are stored per tab using `sessionStorage`
- different tabs can stay logged in as different users
- the login form can still remember the email address for convenience

## Backend Connection

Make sure the backend allows your frontend origin through `CORS_ORIGINS`.

## Scripts

```bash
npm run dev
npm run build
npm run preview
```

## Notes

- Use the backend `.env` to configure JWT, database, and Paystack credentials.
