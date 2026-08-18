# SmartSociety Backend — Setup Guide

Express + MongoDB REST API for the SmartSociety (ContestAzm-26) society management app.

## Requirements

- Node.js v20+ (developed/tested on v25)
- npm

## 1. Install dependencies

```bash
cd backend
npm install
```

## 2. Create `.env`

`.env` git mein commit nahi hota — har team member ko ye file khud banani hogi backend folder ke andar (`backend/.env`):

```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

MONGO_URI=mongodb+srv://societyadmin:societyadmin@furniturecluster.qtrgopo.mongodb.net/?appName=FurnitureCluster

JWT_SECRET=19cbefd08729471fd766600bb18d7909540ae0bdaed28751d929b4ad50ff5aa9
JWT_EXPIRES_IN=7d

CLOUDINARY_CLOUD_NAME=dhftpumq5
CLOUDINARY_API_KEY=478511166845784
CLOUDINARY_API_SECRET=cDGAhqtXMUEzZNSh05hp7yfUBto

EMAIL_USER=waqasdreamsnw@gmail.com
EMAIL_PASS=lavibnbdkbtmexvq
```

## 3. Run

```bash
npm run dev      # nodemon — auto-restarts on file changes (use this during development)
npm start        # plain node, no auto-restart (production style)
```

## 4. Confirm it's working

Open in browser or Postman:

```
http://localhost:5000/api/v1/health
```

Response should show `"database": "connected"`.

---

## ⚠️ Most common issue: MongoDB connection (SRV DNS failure)

Kuch networks pe `mongodb+srv://` wala URI DNS SRV lookup fail kar deta hai — error milega kuch is tarah:

```
querySrv ECONNREFUSED
querySrv ENOTFOUND _mongodb._tcp.furniturecluster.qtrgopo.mongodb.net
```

Ye humein 2 alag laptops pe already ho chuka hai (ISP/network SRV records block kar deta hai). Agar kisi team member ko ye error aaye, `.env` mein `MONGO_URI` ko is **direct (non-SRV) connection string** se replace kar dein:

```env
MONGO_URI=mongodb://societyadmin:societyadmin@ac-yqbzmph-shard-00-00.qtrgopo.mongodb.net:27017,ac-yqbzmph-shard-00-01.qtrgopo.mongodb.net:27017,ac-yqbzmph-shard-00-02.qtrgopo.mongodb.net:27017/?ssl=true&replicaSet=atlas-huetjg-shard-0&authSource=admin&retryWrites=true&w=majority&appName=FurnitureCluster
```

Ye same database ko point karta hai, bas DNS SRV lookup step skip kar deta hai.

## Other notes

- Backend fixed port `5000` par chalta hai — agar already kuch us port pe chal raha ho to conflict error aayega.
- CORS development mode mein automatically kisi bhi `localhost:<any port>` ko allow karta hai — frontend chahe port 5173 pe ho ya 5174, koi masla nahi.
- Frontend ka apna `.env` (`frontend/.env`) mein `VITE_API_BASE_URL=http://localhost:5000/api/v1` set hona chahiye. Agar ye file na ho to bhi yehi default use hota hai, isliye zaroori nahi.
- Demo/test data seed karne ke liye (naya/isolated database use kar rahe hon to zaroori hai, shared Atlas cluster mein pehle se data maujood hai):
  ```bash
  node scripts/seedDemoData.mjs      # residents, complaints, bills, visitors, notices, etc. bulk create karta hai
  node scripts/seedAmenityImages.mjs # amenities ko cover images assign karta hai (seedDemoData ke BAAD chalayein)
  ```

## Test credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@smartsociety.com` | `Admin@12345` |
| Resident | `resident2@smartsociety.com` | `Resident@123` |
| Guard | `guard2@smartsociety.com` | `Guard@123` |
| Staff | `electrician2@smartsociety.com` | `Staff@123` |
