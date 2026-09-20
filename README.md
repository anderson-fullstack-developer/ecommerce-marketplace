# STP Market — Multi-vendor Marketplace

STP Market is a full-stack multi-vendor marketplace designed to connect products from São Tomé and Príncipe with customers in Portugal.

The platform includes public shopping flows, vendor management, order processing, commissions, online payments and administrative tools.

## Highlights

- Multi-vendor product catalogue
- Vendor applications and approval flow
- Product and category management
- Shopping cart and checkout
- Stripe Checkout integration
- Order management and stock updates
- Vendor commissions and withdrawal requests
- Admin dashboard
- Transactional email flows
- Cloud image management
- Responsive interface

## Tech stack

**Frontend**  
Next.js 15 · React · TypeScript · Tailwind CSS · shadcn/ui

**Backend & data**  
Next.js Server Actions · Route Handlers · PostgreSQL · Prisma ORM · Zod

**Authentication**  
Auth.js v5 · JWT sessions · Credentials provider

**Integrations**  
Stripe · Cloudinary · Brevo · Vercel

## Architecture and implementation

The application uses the Next.js App Router and combines frontend and server-side functionality in the same codebase.

Important implementation details include:

- prices recalculated from the database during checkout instead of trusting client-side values;
- idempotent Stripe webhook handling to avoid duplicate orders;
- stock updates after successful payment;
- vendor commission calculation per sale;
- authenticated administration and vendor areas;
- image uploads handled server-side through Cloudinary;
- transactional emails for order confirmation and status updates.

## Main areas

### Customer

Customers can browse products, search and filter the catalogue, manage a cart and complete payments through Stripe Checkout.

### Administration

Administrators can manage products, categories, orders, vendors, approvals, stock and withdrawals through a centralized dashboard.

### Vendors

Approved vendors can manage their own products, view sales information and request withdrawals.

## Live demo

[View STP Market](https://stp-teal.vercel.app)

## Local development

```bash
npm install
npm run dev
```

The project requires environment variables for PostgreSQL, authentication, Stripe, Cloudinary and Brevo. See `.env.example` for the expected configuration.

## Developer

Developed by **Anderson Neto**.

[Portfolio](https://andersonneto.gt.tc) · [LinkedIn](https://linkedin.com/in/anderson-fullstack-developer) · [GitHub](https://github.com/anderson-fullstack-developer)
