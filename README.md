# AG Facade Technology: Website + Inquiry Server

```
website/   the public website (HTML, CSS, JS, images, PDF catalogue)
server/    Node.js server: serves the website AND receives project inquiries
```

## Run it (any computer / VPS with Node.js 18+)
1. `cd server`
2. `npm install`
3. Copy `.env.example` to `.env`, fill in your Gmail App Password (steps inside the file)
4. `npm start`  -> open http://localhost:3000

## What happens when a customer sends an inquiry (Contact page)
1. The form is validated in the browser and again on the server (spam honeypot + rate limit included).
2. The inquiry is saved to `server/data/inquiries.jsonl` (never lost, even if email fails).
3. An email with all details goes to `NOTIFY_EMAIL` (reply goes straight to the customer).
4. The customer gets an automatic confirmation email (English or Bengali) with a reference number like `AG-20261005-F1EA`.
5. View all inquiries: `http://your-site/admin/inquiries?key=YOUR_ADMIN_KEY`

## Pages
index, products, 25 individual product pages (products/*.html), projects (31 photos with filter + zoom),
catalogue (full viewer + download), about, contact.

## Language switch
EN / বাংলা button in the header (and mobile menu). The choice is remembered. All text lives in
`website/i18n.js`: edit the Bengali there. Product descriptions are currently English only.

## Static hosting only (no Node)?
The website works on any static host, but the contact form needs the server.
Host `server/` anywhere and set `window.AG_API="https://your-server"` in `website/contact.html`
(before the `site.js` script tag).
