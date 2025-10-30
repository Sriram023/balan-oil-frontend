# 🛢️ Balan Oil Mart - Internal Business Management System (ERP)

**Developer:** Sriram (CEO of BM Oils)  
**Tech Stack:** MERN (MongoDB, Express, React, Node.js) + TypeScript + Tailwind + ShadCN UI  
**Deployment:** Render (Backend) + Hostinger (Frontend)  
**Database:** MongoDB Atlas  
**Purpose:** To digitalize the operations of *Balan Oil Mart*, a wholesale and retail edible oil distributor.

---

## 🚀 Overview

The **Balan Oil Mart ERP** is a full-stack, end-to-end business management system built to handle every operational need of a wholesale oil business — from tracking manufacturers and customers to managing payments, credits, and product sales.

This system modernizes the traditional ledger-based workflow into a live, cloud-connected ERP that provides instant financial visibility, transaction tracking, and a sleek dashboard — all in real time.

---

## 🧩 Core Features

### 🔹 Manufacturer Management
- Add, edit, and view **manufacturers**
- Record **credit & payments** directly connected to MongoDB
- View **product purchases** with date and price tracking
- Auto-calculated **balance** (Credit - Paid)

### 🔹 Customer & Business Owner Management
- Add customers with **credit and payment history**
- Maintain transparent **transaction records**
- Built-in **printing system** for ledgers and summaries
- Auto-updated balances and transaction history

### 🔹 Sales Entry Module
- Record daily or monthly **sales transactions**
- Calculates **total sales amount** automatically
- Stores all data in MongoDB via backend API
- Tracks quantity, price, total, and date per sale

### 🔹 Dashboard
- Real-time overview of:
  - Monthly sales from customer payments
  - Credits given and received
  - Outstanding balances
  - Pie chart breakdown of product-wise sales
- Connected directly to backend API and MongoDB

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-------------|
| Frontend | React + TypeScript + Tailwind CSS + ShadCN UI |
| Backend | Node.js + Express + TypeScript |
| Database | MongoDB (via Mongoose ORM) |
| Hosting | Render (Backend) + Hostinger (Frontend) |
| Version Control | Git + GitHub |

---

## ⚙️ Installation

### Backend Setup

```bash
# Go to server directory
cd server

# Install dependencies
npm install

# Run the development server
npm run dev
