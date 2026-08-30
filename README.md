<h1 align="center">🛒 PRIME CART</h1>

<p align="center">
  <strong>Modern Marketplace Storefront with Admin Inventory & Stripe Checkout</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/🛒_PRIME_CART-111827?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/REACT-61DAFB?style=for-the-badge&logo=react&logoColor=black"/>
  <img src="https://img.shields.io/badge/TYPESCRIPT-3178C6?style=for-the-badge&logo=typescript&logoColor=white"/>
  <img src="https://img.shields.io/badge/VITE-646CFF?style=for-the-badge&logo=vite&logoColor=white"/>
  <img src="https://img.shields.io/badge/STRIPE-635BFF?style=for-the-badge&logo=stripe&logoColor=white"/>
</p>

<p align="center">
  <b>Marketplace • Secure Checkout • Inventory • Orders • Admin Dashboard</b>
</p>

<p align="center">
  🌐 <a href="https://primecart-azcfsnkf.manus.space/">Live Demo</a>
</p>
✨ Overview

PRIME CART is a modern marketplace platform designed to provide a smooth online shopping experience for customers while giving administrators complete control over products, inventory, and orders.

The application includes a responsive storefront, product browsing, cart management, checkout, payment processing through Stripe, and an admin dashboard for managing the marketplace.

🎯 Main Goals
🛍️ Provide a simple and modern shopping experience
📦 Manage products and inventory efficiently
🛒 Allow customers to manage their shopping cart
💳 Provide secure online payments using Stripe Checkout
📋 Track and manage customer orders
👨‍💼 Provide an admin interface for marketplace management
📱 Deliver a responsive experience across desktop, tablet, and mobile
🚀 Features
🛍️ Customer Storefront
Browse available products
Product categories
Product search
Product details
Add products to cart
Update product quantities
Remove products from cart
Responsive marketplace UI
Order checkout
Order confirmation
🛒 Shopping Cart
Add/remove products
Increase/decrease quantity
Automatic subtotal calculation
Cart item management
Checkout flow
Persistent shopping experience
💳 Stripe Checkout
Secure payment processing
Stripe-hosted checkout
Order/payment workflow
Reduced handling of sensitive card information
Payment confirmation flow
👨‍💼 Admin Dashboard

Administrators can manage the marketplace from a dedicated dashboard.

Inventory Management

Add products
Edit products
Delete products
Update product prices
Manage product quantities
Monitor inventory

Order Management

View customer orders
View order details
Monitor order status
Manage order workflow
📱 Responsive Design

PRIME CART is designed to work across:

💻 Desktop
💻 Laptop
📱 Mobile
📲 Tablet
🧩 Application Architecture
                    ┌──────────────────────┐
                    │      PRIME CART      │
                    │   E-Commerce App     │
                    └──────────┬───────────┘
                               │
              ┌────────────────┴────────────────┐
              │                                 │
       ┌──────▼──────┐                   ┌──────▼──────┐
       │   Customer  │                   │    Admin     │
       │   Storefront│                   │   Dashboard  │
       └──────┬──────┘                   └──────┬──────┘
              │                                 │
       ┌──────▼──────┐                   ┌──────▼──────┐
       │   Products  │                   │  Inventory   │
       │     Cart    │                   │    Orders    │
       │   Checkout  │                   │   Products   │
       └──────┬──────┘                   └──────┬──────┘
              │                                 │
              └──────────────┬──────────────────┘
                             │
                    ┌────────▼────────┐
                    │    Backend/API  │
                    └────────┬────────┘
                             │
             ┌───────────────┼───────────────┐
             │               │               │
      ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
      │   Database  │ │    Stripe   │ │   Orders    │
      │   Products  │ │   Checkout  │ │   & Users   │
      └─────────────┘ └─────────────┘ └─────────────┘
🔄 User Flow
Visit PRIME CART
       ↓
Browse Products
       ↓
Select Product
       ↓
Add to Cart
       ↓
Review Cart
       ↓
Proceed to Checkout
       ↓
Stripe Checkout
       ↓
Payment
       ↓
Order Created
       ↓
Order Confirmation
🔐 Admin Flow
Admin Login
     ↓
Admin Dashboard
     ↓
┌───────────────┐
│               │
▼               ▼
Products      Orders
│               │
▼               ▼
Inventory     Order Status
│               │
└───────┬───────┘
        ▼
Marketplace Updated
🛠️ Tech Stack
Technology	Purpose
🌐 HTML5	Page structure
🎨 CSS3	Styling & responsive design
⚡ JavaScript	Frontend functionality
🧩 Bootstrap 5	Responsive UI components
🟢 Node.js	Backend runtime
🚂 Express.js	Backend/API framework
🗄️ Database	Product, inventory & order data
💳 Stripe	Payment processing
🔧 Git & GitHub	Version control

Update the table above if your actual repository uses a different database or framework.

📂 Project Structure
PRIME-CART/
│
├── frontend/
│   ├── assets/
│   ├── css/
│   ├── js/
│   ├── images/
│   └── pages/
│
├── backend/
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── middleware/
│   └── server.js
│
├── admin/
│   ├── dashboard/
│   ├── products/
│   └── orders/
│
├── .env
├── .gitignore
├── package.json
└── README.md
💳 Payment Workflow

PRIME CART integrates Stripe Checkout to provide a secure payment experience.

Customer
   ↓
Shopping Cart
   ↓
Checkout
   ↓
Create Stripe Checkout Session
   ↓
Stripe Hosted Checkout
   ↓
Payment
   ↓
Payment Confirmation
   ↓
Create / Update Order
   ↓
Order Confirmation
🔒 Security

Sensitive payment information is handled by Stripe's payment infrastructure rather than being directly processed by the application.

Never commit your Stripe secret key to GitHub.

Use environment variables:
