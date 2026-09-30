# -AI-DARZI

**AI Darzi** is a modern, production-ready AI-powered tailoring platform that connects customers with verified master tailors. It solves traditional tailoring challenges—eliminating repeated physical visits, unclear pricing, communication barriers, and design uncertainty through computer vision and conversational AI.

---

## 🚀 Key Features

* **🛡️ Privacy-First Remote Measurements**:
  * Guided camera pose scanning with real-time landmark overlays.
  * Zero image sharing: Raw customer body photos are processed strictly in-browser and never transmitted to tailors.
  * *“Measure From My Clothes”*: Extract dimensions from flat garments calibrated with credit card or standard reference.
  * Multi-profile Measurement Wallet (*Self, Ammi, Abba, Brother, Sister, Kids*) with localized terminology (*Teera, Daman, Chaati, Kamar, Paincha, Gala*).

* **🎨 AI Fashion & Design Studio (Google Gemini)**:
  * Text-to-fashion bespoke prompting with authentic Pakistani cuts, fabrics, necklines, sleeves, and embroideries.
  * Instant modifiers (*"Add Embroidery"*, *"Make Simpler"*, *"Make Formal"*, *"Mint Pastel Palette"*).
  * Multimodal Computer Vision: Upload reference pictures to extract silhouettes, necklines, sleeves, and generate actionable **Tailor-Ready Design Specs**.

* **🏪 Master Tailor Marketplace**:
  * Verified master tailors across Karachi, Lahore, Islamabad, and Rawalpindi.
  * Storefronts with services & pricing matrix, verified customer reviews, portfolios, and turnaround calendars.

* **📋 9-Step Guided Order Wizard**:
  * End-to-end wizard: Garment Selection ➔ Design ➔ Fabric ➔ Measurements ➔ Tailor ➔ Pickup/Delivery ➔ Transparent Price Breakdown ➔ Payment ➔ Confirmation.
  * Automatically generates standardized **Tailor Order Sheets**.

* **⏱️ 13-Stage Real-Time Order Timeline**:
  * `New Order` ➔ `Reviewing` ➔ `Quotation Sent` ➔ `Accepted` ➔ `Fabric Received` ➔ `Cutting` ➔ `Stitching` ➔ `Quality Check` ➔ `Ready` ➔ `Picked Up` ➔ `Out for Delivery` ➔ `Delivered` ➔ `Completed`.

* **💬 Multilingual Darzi AI Concierge & Chat**:
  * Fluent in **English**, **Roman Urdu**, and **Urdu (اردو)**.
  * Explains tailoring terminology, calculates fabric yardage (*gaz* / meters), and summarizes conversations into order sheets.
  * Direct in-app messaging between customer and tailor workshop.

* **👥 Role Switcher & Two-Sided Workspaces**:
  * **Customer View**: Full marketplace, studio, and order tracker.
  * **Tailor Workspace**: Workshop pipeline with 1-click stage advancement and measurement sheet inspection.
  * **Admin Control Center**: GMV analytics, platform revenue, and tailor verifications.

---

## 🛠️ Tech Stack & Architecture

* **Frontend**: Vanilla HTML5, Modern CSS (Haute couture Pakistani emerald & gold design system), Vanilla JavaScript ES6+.
* **Backend**: Node.js & Express.js REST API.
* **Database**: MongoDB Atlas.
* **AI Layer**: Google Gemini API (Multimodal Vision & Conversational AI).

---

## 🏃 Getting Started

### Prerequisites
* Node.js v18+ and Git

### Installation
```bash
git clone https://github.com/ubina0431-code/-AI-DARZI.git
cd -AI-DARZI
npm install
```

### Configure Environment Variables
Create a `.env` file in the root directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
GEMINI_API_KEY=your_google_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
```

### Seed Database & Start Server
```bash
npm run seed
npm start
```
Open **[http://localhost:5000](http://localhost:5000)** in your browser.
