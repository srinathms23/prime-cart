# 🛒 PRIME CART

<p align="center">
  <strong>Modern Marketplace Storefront with Admin Inventory, Order Management & Stripe Checkout</strong>
</p>

<p align="center">
  <a href="https://primecart-azcfsnkf.manus.space/">
    <img src="https://img.shields.io/badge/🌐%20LIVE%20DEMO-Visit%20Store-00C853?style=for-the-badge" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/REACT-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TYPESCRIPT-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/VITE-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/STRIPE-635BFF?style=for-the-badge&logo=stripe&logoColor=white" />
</p>

<p align="center">
  🛍️ Marketplace &nbsp; • &nbsp;
  💳 Secure Checkout &nbsp; • &nbsp;
  📦 Inventory Management &nbsp; • &nbsp;
  📋 Order Management
</p>

---

## 📌 Overview

**PRIME CART** is a modern e-commerce marketplace platform designed to provide a smooth and responsive online shopping experience.

The platform includes a customer-facing storefront where users can browse products, manage their shopping cart, and complete purchases through **Stripe Checkout**.

It also includes an **Admin Dashboard** for managing products, inventory, and customer orders.

---

## ✨ Features

### 🛍️ Customer Storefront

- Browse products
- Search and explore products
- View product details
- Add products to cart
- Update product quantities
- Remove products from cart
- View cart summary
- Responsive shopping experience
- Secure checkout
- Order confirmation

### 🛒 Shopping Cart

- Add products
- Remove products
- Increase/decrease quantity
- Automatic price calculation
- Cart summary
- Checkout integration

### 💳 Stripe Checkout

- Stripe-powered payment processing
- Secure hosted checkout
- Payment confirmation
- Checkout workflow
- Order/payment integration

### 👨‍💼 Admin Dashboard

The admin panel provides centralized control over the marketplace.

#### 📦 Inventory Management

- Add products
- Edit products
- Delete products
- Update product prices
- Update stock quantity
- Monitor inventory

#### 📋 Order Management

- View customer orders
- View order details
- Monitor order status
- Manage order workflow
- Track order information

### 📱 Responsive Design

PRIME CART is optimized for:

- 💻 Desktop
- 💻 Laptop
- 📱 Mobile
- 📲 Tablet

---

## 🏗️ Application Architecture

```mermaid
flowchart TD

    A[🛒 PRIME CART] --> B[Customer Storefront]
    A --> C[Admin Dashboard]

    B --> D[Products]
    B --> E[Shopping Cart]
    B --> F[Checkout]

    C --> G[Inventory]
    C --> H[Orders]

    F --> I[💳 Stripe Checkout]

    D --> J[(Database)]
    E --> J
    G --> J
    H --> J
    I --> J
