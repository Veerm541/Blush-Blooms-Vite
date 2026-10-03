Check Dylan PLSSS PLSSS :>
# Blush Blooms

Blush Blooms is a web-based flower shop e-commerce prototype built with React and Vite.

The system includes a customer storefront, interactive 2D bouquet customization, shopping cart, pickup and delivery checkout, order tracking, and an administrative management panel.

The project is being developed for **Blush Blooms Ozamiz**.

---

## Run the Project

```bash
npm install
npm run dev
```

Development server:

```text
http://localhost:5173
```

Build the project:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

---

## Customer Features

Customers can:

- Browse available floral products
- View product details and prices
- Add products to the shopping bag
- Create customized bouquets using the 2D bouquet customizer
- Add flowers, fillers, greenery, wrappers, and ribbons
- Move, resize, rotate, flip, copy, and remove bouquet elements
- Select Small, Medium, or Large bouquet guides
- View real-time bouquet pricing
- Use box selection to select multiple bouquet elements
- Copy and paste selected bouquet elements
- Undo and redo customization actions
- Clear the bouquet canvas
- Add dedication card messages
- Choose between Store Pick-Up and Delivery
- Select a preferred pickup or delivery schedule
- Enter delivery address, barangay, and landmark information
- Choose Cash on Pick-Up, Cash on Delivery, or GCash
- Upload GCash proof of payment
- Track order status using an order reference number

---

## 2D Bouquet Customizer

The bouquet customizer is the main interactive feature of the system.

Customers can build floral arrangements using:

- Flowers
- Fillers
- Greenery
- Wrappers
- Ribbons

Available controls include:

- Drag to move
- Bigger / Smaller
- Turn left / Turn right
- Flip
- Copy
- Remove
- Box selection
- Multi-selection
- Clear all
- Undo
- Redo

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + C` | Copy selected item(s) |
| `Ctrl + V` | Paste copied item(s) |
| `Ctrl + Z` | Undo |
| `Ctrl + Shift + Z` | Redo |
| `Ctrl + Y` | Redo |
| `Ctrl + A` | Select all |
| `Delete / Backspace` | Remove selected item(s) |
| `Arrow Keys` | Move selected item(s) |
| `Shift + Arrow Keys` | Move selected item(s) farther |

> The current customizer uses React-based DOM interactions. Fabric.js integration is planned for the final implementation.

---

## Checkout and Fulfillment

Customers can choose between:

### Store Pick-Up

Customers provide:

- Contact information
- Preferred pickup date and time

Available payment methods:

- Cash on Pick-Up
- GCash

Pickup order flow:

```text
Pending
→ In Preparation
→ Ready for Pickup
→ Completed
```

### Delivery

Customers provide:

- Contact information
- Delivery address
- Barangay
- Nearby landmark
- Preferred delivery date
- Preferred delivery time slot

Available payment methods:

- Cash on Delivery
- GCash

Delivery order flow:

```text
Pending
→ In Preparation
→ Out for Delivery
→ Completed
```

Delivery schedules are treated as preferred delivery windows and are not guaranteed exact arrival times.

---

## Admin Panel

Admin login:

```text
/admin/login
```

Prototype credentials:

```text
Username: admin
Password: blush2026
```

### Admin Dashboard

The dashboard includes:

- Order overview
- Pending orders
- Orders currently being prepared
- Pickup and delivery summaries
- Pending GCash verification
- Recent orders
- Sales information
- Inventory and catalog summaries
- Quick admin actions

### Order Management

Authorized staff can:

- Search and filter customer orders
- View customer information
- View pickup or delivery details
- View order items
- View customized bouquet details
- View bouquet snapshots
- View itemized floral components
- Review GCash payment proof
- Approve or reject payment verification
- Update fulfillment status
- Add internal order notes
- Handle order cancellation information

### Catalog & Assets

Admins can manage:

- Pre-made bouquets
- Flowers
- Fillers
- Greenery
- Wrappers
- Ribbons
- Product prices
- Asset prices
- Stock quantities
- Availability status

### Reports

The reporting interface includes:

- Total revenue
- Total orders
- Average order value
- Completion rate
- Orders by status
- Payment method breakdown
- Pickup vs Delivery summaries
- Transaction history
- Date filtering
- Print and Export interface

Some reporting controls are currently UI placeholders while backend functionality is still being developed.

---

## Project Structure

```text
src/
├── main.jsx
├── App.jsx
│
├── components/
│   ├── Layout
│   ├── CartDrawer
│   ├── forms
│   ├── Stat
│   ├── Testimonials
│   ├── FaqItem
│   ├── pills
│   └── router helpers
│
├── context/
│   └── CartContext.jsx
│
├── data/
│   ├── products
│   ├── floral/customizer assets
│   └── catalog defaults
│
├── hooks/
│   ├── useLocalStorage
│   ├── useOrders
│   └── useCatalog
│
├── lib/
│   ├── format helpers
│   └── admin authentication
│
├── pages/
│   ├── Home
│   ├── Shop
│   ├── Customize
│   ├── About
│   ├── Contact
│   ├── Checkout
│   └── OrderStatus
│
└── pages/admin/
    ├── AdminLayout
    ├── Login
    ├── Dashboard
    ├── Orders
    ├── Catalog
    └── Reports

public/
└── images/
```

---

## Current Development Status

The current version is primarily a **front-end and UI/UX prototype**.

The following currently use browser storage:

- Cart
- Orders
- Catalog data
- Admin-related prototype data

Data is currently stored using:

```text
localStorage
```

There is no production backend connected yet.

---

## Planned Technology Stack

The final system is planned to use:

### Frontend

- React
- Vite
- HTML5
- CSS3
- JavaScript
- Fabric.js

### Backend

- Node.js
- Express.js

### Database

- PostgreSQL
- Supabase

### Deployment

- Render

---

## Important Prototype Notes

The following parts are still prototype implementations:

- Admin authentication
- GCash payment verification
- Order persistence
- Catalog persistence
- Reports
- Inventory synchronization
- Delivery scheduling
- Backend validation

These will later be connected to the actual backend and database.

---

## Project Goal

The goal of Blush Blooms is to provide customers with a simple and visually understandable way to browse, customize, and order floral arrangements while giving Blush Blooms Ozamiz a centralized interface for managing products, customer orders, payments, and fulfillment.

The **2D Drag-and-Drop Bouquet Customizer** is the main feature of the system and is designed to allow customers to visually create their own floral arrangement before submitting an order.
```
