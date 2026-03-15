# CrowdAid — Full Stack (React + Node.js + MongoDB)

> Team AImpact | Avishkar 2025

## 🗂️ Project Structure

```
crowdaid-fullstack/
├── backend/                  ← Node.js + Express API
│   ├── models/
│   │   ├── User.js           ← MongoDB User model (bcrypt hashed passwords)
│   │   ├── Campaign.js       ← Campaign model with AI score fields
│   │   └── Donation.js       ← Donation model with transaction IDs
│   ├── routes/
│   │   ├── auth.js           ← /api/auth  (register, login, me, profile)
│   │   ├── campaigns.js      ← /api/campaigns  (CRUD + AI verification)
│   │   ├── donations.js      ← /api/donations  (donate, history)
│   │   └── admin.js          ← /api/admin  (stats, approve, users)
│   ├── middleware/
│   │   └── auth.js           ← JWT protect / adminOnly / creatorOnly
│   ├── server.js
│   ├── .env.example          ← Copy to .env and fill in
│   └── package.json
│
└── frontend/                 ← React 18 + Vite
    ├── src/
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Browse.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Donate.jsx       ← Amount selection
    │   │   ├── Payment.jsx      ← Dummy payment (UPI/Card/NetBanking/Wallet)
    │   │   ├── PaymentSuccess.jsx
    │   │   ├── Dashboard.jsx    ← Donor & Creator dashboards
    │   │   ├── Submit.jsx       ← Campaign submission with AI verify
    │   │   └── Admin.jsx        ← Admin panel
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   └── CampaignCard.jsx
    │   ├── context/
    │   │   ├── AuthContext.jsx  ← JWT auth state
    │   │   └── ToastContext.jsx ← Global toast notifications
    │   ├── api.js              ← Axios instance with JWT interceptor
    │   ├── App.jsx             ← Routes
    │   └── index.css           ← Global design system
    └── package.json
```

---

## 🚀 Setup & Run

### 1. MongoDB Atlas
1. Go to https://cloud.mongodb.com → Create free cluster
2. Database Access → Add user (username + password)
3. Network Access → Allow 0.0.0.0/0
4. Connect → Drivers → Copy connection string

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env — fill in MONGO_URI and change JWT_SECRET
npm install
npm run dev
```

Backend runs at: http://localhost:5000

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: http://localhost:5173

(Vite proxies /api → http://localhost:5000 automatically)

---

## 🔐 Creating an Admin Account

After starting the app, register normally. Then open MongoDB Atlas:
- Collection: `users`
- Find your user document → Edit `role` field from `"donor"` to `"admin"`
- Save → Login again

---

## 💳 Dummy Payment Flow

1. Browse any campaign → **Donate** button
2. Select or enter amount → **Proceed to Payment**
3. Payment page — choose method:
   - **UPI**: Type any ID with `@` → Verify → Pay
   - **Card**: Any 16-digit number + name + MM/YY + CVV
   - **Net Banking**: Pick any bank
   - **Wallet**: Pick any wallet
4. 5-step animated processing screen runs
5. Backend saves real donation record to MongoDB
6. Payment success page with transaction ID

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| GET  | /api/auth/me | Get current user |
| PUT  | /api/auth/profile | Update profile |

### Campaigns
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | /api/campaigns | List approved campaigns |
| GET  | /api/campaigns/:id | Get single campaign |
| POST | /api/campaigns | Create campaign (creator only) |
| GET  | /api/campaigns/my/list | Creator's campaigns |

### Donations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/donations | Make a donation |
| GET  | /api/donations/my | Donor's history |
| GET  | /api/donations/campaign/:id | Campaign donations |

### Admin (admin role required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | /api/admin/stats | Platform stats |
| GET  | /api/admin/campaigns | All campaigns |
| PUT  | /api/admin/campaigns/:id/status | Approve/reject |
| GET  | /api/admin/users | All users |
| PUT  | /api/admin/users/:id/toggle | Suspend/activate |

---

## 🔌 Replace Dummy Payment with Razorpay

In `frontend/src/pages/Payment.jsx`, replace `handlePay()`:

```js
const options = {
  key: "YOUR_RAZORPAY_KEY_ID",
  amount: total * 100,   // paise
  currency: "INR",
  name: "CrowdAid",
  description: campaign.title,
  handler: async (response) => {
    // response.razorpay_payment_id is your real txn ID
    // then call your backend to record the donation
    await API.post('/donations', { ..., transactionId: response.razorpay_payment_id });
    navigate('/payment-success', { state: { ... } });
  },
};
const rzp = new window.Razorpay(options);
rzp.open();
```

Add Razorpay script in `index.html`:
```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```
