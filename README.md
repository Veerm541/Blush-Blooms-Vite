Feel free to change whats good Dylan
# Blush Blooms

Flower-shop storefront and admin panel, built with React + Vite.

    npm install
    npm run dev        # http://localhost:5173
    npm run build      # production build -> dist/
    npm run preview    # serve the build locally

Admin: `/admin/login` (prototype credentials: `admin` / `blush2026`).
Data (cart, orders, catalog) lives in the browser's localStorage; there is no backend yet.

## Structure

    src/
      main.jsx, App.jsx        entry point and routes
      styles/main.css          all styles
      components/              Layout, CartDrawer, forms, Stat, Testimonials, FaqItem, pills, A (router link)
      context/CartContext.jsx  cart state, drawer, toast
      data/                    products, flower palette, catalog defaults
      hooks/                   useLocalStorage, useOrders, useCatalog
      lib/                     format helpers, admin auth
      pages/                   Home, Shop, Customize, About, Contact, Checkout, OrderStatus
      pages/admin/             AdminLayout (auth guard), Login, Dashboard, Orders, Catalog, Reports
    public/images/             bouquet photos
