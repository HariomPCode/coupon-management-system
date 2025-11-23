<p align="center">
  <img src="https://img.shields.io/badge/Node.js-16%2B-brightgreen" alt="Node.js 16+" />
  <img src="https://img.shields.io/badge/Express.js-API-blue" alt="Express.js" />
  <img src="https://img.shields.io/badge/Tests-Passing-brightgreen" alt="Tests Passing" />
</p>

# 🎟️ Coupon Management System

> A robust, modular, and fully documented **Coupon Management API Service** for e-commerce platforms. Easily create, evaluate, and track coupons with rich eligibility rules and in-memory storage.

---

## 🚀 Overview

This backend service enables:

- **Coupon creation & storage**
- **Eligibility validation** (user & cart)
- **Discount computation** (flat/percent, with caps)
- **Best coupon evaluation** (deterministic)
- **Usage tracking per user**
- **Demo login for reviewers**

All data is stored in-memory (no DB required). Seed data loads automatically from `seed.json`.

---

## 🧰 Tech Stack

- **Node.js (Express.js)**
- **Jest + Supertest** (testing)
- **uuid** (unique IDs)
- **Nodemon** (dev server)
- **Native Date API**
- **JSON seed loader**

---

## 📁 Project Structure

```text
coupon-system/
├── seed.json
├── package.json
├── src/
    ├── app.js
    ├── routes/
    │   ├── couponRoutes.js
    │   └── authRoutes.js
    ├── controllers/
    │   ├── couponController.js
    │   └── authController.js
    ├── services/
    │   └── couponService.js
    ├── models/
    │   └── couponModel.js
    └── tests/
        |
        ├── unit/
        │   └── couponEligibility.test.js
        └── integration/
            └── couponApi.test.js
```

---

## ⚙️ Setup & Installation

### Prerequisites

- Node.js **v16+**
- npm

### Install & Run

```bash
# Install dependencies
npm install

# Run in development mode (with nodemon)
```

# Run in production

npm start

````

Server starts at: [http://localhost:3000](http://localhost:3000)

---

## 🧪 Running Tests

```bash
npm test
````

Runs both unit and integration tests.

---

## 🔐 Demo Login (For Reviewers)

> **Required for assignment review.**

**Credentials:**

| Email                | Password     |
| -------------------- | ------------ |
| hire-me@anshumat.org | HireMe@2025! |

**Endpoint:**

```http
POST /auth/login
```

**Body Example:**

```json
{
  "email": "hire-me@anshumat.org",
  "password": "HireMe@2025!"
}
```

**Sample Response:**

```json
{
  "message": "Login successful",
  "user": {
    "userId": "hireme-demo",
    "email": "hire-me@anshumat.org",
    "userTier": "NEW",
    "country": "IN",
    "lifetimeSpend": 0,
    "ordersPlaced": 0
  }
}
```

---

## 📚 API Documentation & Usage

### ➤ Create Coupon

`POST /api/coupons`

```json
{
  "code": "WELCOME100",
  "description": "Flat ₹100 off",
  "discountType": "FLAT",
  "discountValue": 100,
  "startDate": "2025-01-01T00:00:00Z",
  "endDate": "2030-01-01T00:00:00Z",
  "usageLimitPerUser": 1,
  "eligibility": {
    "allowedUserTiers": ["NEW"]
  }
}
```

### ➤ List Coupons

`GET /api/coupons`

### ➤ Evaluate Best Coupon

`POST /api/coupons/best`

**Request Example:**

```json
{
  "user": {
    "userId": "u123",
    "userTier": "NEW",
    "country": "IN",
    "lifetimeSpend": 1200,
    "ordersPlaced": 2
  },
  "cart": {
    "items": [
      {
        "productId": "p1",
        "category": "electronics",
        "unitPrice": 1500,
        "quantity": 1
      },
      {
        "productId": "p2",
        "category": "fashion",
        "unitPrice": 500,
        "quantity": 2
      }
    ]
  }
}
```

**Best-coupon selection logic:**

1. Valid date range
2. Usage limit
3. User eligibility
4. Cart eligibility
5. Discount calculation
6. Ranking: Highest discount → Earliest endDate → Lexicographic code

### ➤ Mark Coupon as Used

`POST /api/coupons/:code/use`

**Body:**

```json
{ "userId": "u123" }
```

Tracks usage for enforcing `usageLimitPerUser`.

---

## 🧠 Features

- Flat & percent discounts
- User-based rules: `allowedUserTiers`, `minLifetimeSpend`, `minOrdersPlaced`, `firstOrderOnly`, `allowedCountries`
- Cart-based rules: `minCartValue`, `applicableCategories`, `excludedCategories`, `minItemsCount`
- Best coupon evaluator (deterministic)
- Usage tracking per user
- In-memory storage (no DB)
- JSON seed loader
- Demo login
- Comprehensive test suite

---

## 🗂️ Seed Data

`seed.json` includes:

- Sample coupons
- Demo reviewer user
- Additional entries as needed

Seed is **automatically loaded** on startup.

---

## 🧪 Test Coverage

**Unit tests:**

- Eligibility logic
- Discount calculation
- Validity logic

**Integration tests:**

- Create coupon
- Reject duplicates
- Evaluate best coupon
- Login API
- Usage tracking

## 🧾 Notes for Reviewer

- Fully follows assignment specifications
- Demo login is functional
- All eligibility rules implemented
- Deterministic logic ensures fairness
- Modular and easy to maintain
- Tests included for robustness
