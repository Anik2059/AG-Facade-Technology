# AG Facade Technology — Website + Inquiry Server

**Live site:** [ag-facade-technology.onrender.com](https://ag-facade-technology.onrender.com/)

A full business website for AG Facade Technology — architectural aluminium, glazing, and curtain wall systems — paired with a small Node.js server that handles and delivers customer project inquiries.

---

## 📁 Project Structure

```
website/   The public website — HTML, CSS, JS, images, and the PDF catalogue
server/    Node.js server — serves the website AND receives project inquiries
```

---

## 🚀 Run It

Works on any computer or VPS with **Node.js 18+**.

1. `cd server`
2. `npm install`
3. Copy `.env.example` to `.env` and fill in your Gmail App Password *(steps are documented inside the file)*
4. `npm start`
5. Open **http://localhost:3000**

---

## 📬 What Happens When a Customer Sends an Inquiry

The Contact page form goes through a full, reliable pipeline:

| Step | What Happens |
|---|---|
| 1 | Validated in the browser, then re-validated on the server — includes a spam honeypot and rate limiting |
| 2 | Saved to `server/data/inquiries.jsonl` — never lost, even if the email step fails |
| 3 | A full-detail email is sent to `NOTIFY_EMAIL`, with **Reply-To** set to the customer, so you can reply directly |
| 4 | The customer receives an automatic confirmation email (English or Bengali) with a reference number, e.g. `AG-20261005-F1EA` |
| 5 | Every inquiry is viewable anytime at: `http://your-site/admin/inquiries?key=YOUR_ADMIN_KEY` |

---

## 📄 Pages

- **Home** (`index`)
- **Products** — full catalog, plus **25 individual product pages** (`products/*.html`)
- **Projects** — 31 project photos with category filtering and zoom
- **Catalogue** — full inline PDF viewer + download option
- **About**
- **Contact**

---

## 🌐 Language Switch

An **EN / বাংলা** toggle lives in the header and the mobile menu. The visitor's choice is remembered on return visits.

All interface text lives in `website/i18n.js` — edit the Bengali translations there.
> Note: product descriptions are currently **English only**.

---

## 🖥️ Static Hosting Only (No Node.js)?

The website itself works fine on any static host — but the **contact form requires the server** to actually deliver inquiries.

To use a split setup:
1. Host `server/` anywhere that runs Node.js
2. In `website/contact.html`, set the API origin **before** the `site.js` script tag:
   ```html
   <script>window.AG_API = "https://your-server";</script>
   <script src="site.js"></script>
   ```

---

*Modern Facade · Better Tomorrow*
