# IMPASTO POS

Point-of-sale web app for a restaurant: orders, delivery board, inventory, customers, reports and analytics.
Plain HTML, CSS and JavaScript — no build step, no dependencies, no server.

## Run
Open `index.html` in a browser, or publish the repo with GitHub Pages (Settings → Pages → Deploy from branch → `main` / root).
Put your logos in `assets/Logo.png` (sidebar) and `assets/Logo2.png` (favicon).

## Structure
```
index.html        page markup + Content-Security-Policy
css/              styles split by area (base, sidebar, invoices, account, dropdown, forms, animations, theme, settings)
js/               one file per feature, loaded in this order (see index.html):
  config.js        business defaults (name, VAT, service charge, tables)
  menu-data.js     menu, sizes and add-ons
  state.js         data store (saved in the browser's localStorage)
  auth.js          employee passwords (salted SHA-256 hashes, rate-limited)
  activity.js, catalog.js, cart.js, confirm.js, tables.js, payment.js, receipt.js,
  orders.js, manage.js, analytics.js, customers.js, staff.js, switcher.js,
  navigation.js, delivery.js, menu-admin.js, settings.js, dropdown.js, main.js
assets/           logos
```
Scripts share one global scope, so keep the load order in `index.html`.

## Where things are
- **Manage → Invoice**: VAT, service charge, number of tables, receipt footer.
- **Settings**: currency and theme (light / dark / system).
- **Account**: change name, photo and password.

## Security notes
- No passwords or personal data are stored in the source code. An account has no lock until you set a password in Account → Change password.
- Everything is saved in the browser (`localStorage`), so this is a convenience lock for a shared till, not server-side security. Anyone with access to the device can read the data.
- A Content-Security-Policy blocks inline scripts and network requests; user-entered text is HTML-escaped; CSV export neutralises spreadsheet formulas.
- If you host it, serve over HTTPS (GitHub Pages does) so the browser's hashing API is available.
