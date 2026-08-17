# Contest Azam / SmartSociety - Complete API cURL Collection

This document contains production-ready, runnable `cURL` commands for every RESTful API endpoint in the **Smart Society Management System (SMS)** backend.

> **Base URL:** `http://localhost:5000/api/v1`  
> **Headers:** Replace `<ACCESS_TOKEN>` with a valid JWT access token obtained from the `/auth/login` endpoint.

---

## Table of Contents
1. [Authentication & Profile (`/auth`)](#1-authentication--profile-auth)
2. [User Administration (`/users`)](#2-user-administration-users)
3. [Flats & Occupancy (`/flats`)](#3-flats--occupancy-flats)
4. [Gate & Visitor Management (`/visitors`)](#4-gate--visitor-management-visitors)
5. [Billing & Maintenance Invoices (`/bills`)](#5-billing--maintenance-invoices-bills)
6. [Helpdesk & Complaints (`/complaints`)](#6-helpdesk--complaints-complaints)
7. [Notice Board & Polls (`/notices`)](#7-notice-board--polls-notices)
8. [Amenity Bookings (`/amenities`)](#8-amenity-bookings-amenities)
9. [Emergency SOS Siren (`/emergency`)](#9-emergency-sos-siren-emergency)

---

## 1. Authentication & Profile (`/auth`)

### 1.1 Register User
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -F "name=Ahmed Resident" \
  -F "email=resident@smartsociety.com" \
  -F "password=Password123!" \
  -F "phone=+923001234567" \
  -F "role=Resident" \
  -F "avatar=@/path/to/profile.png"
```

### 1.2 Login User
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@smartsociety.com",
    "password": "AdminPassword123!"
  }'
```

### 1.3 Refresh Access Token
```bash
curl -X POST http://localhost:5000/api/v1/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "<YOUR_REFRESH_TOKEN>"
  }'
```

### 1.4 Get My Profile
```bash
curl -X GET http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### 1.5 Update Profile & Vehicles
```bash
curl -X PUT http://localhost:5000/api/v1/auth/update-profile \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -F "name=Ahmed Resident Updated" \
  -F "phone=+923009998877" \
  -F "avatar=@/path/to/new_avatar.jpg"
```

### 1.6 Logout
```bash
curl -X POST http://localhost:5000/api/v1/auth/logout \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

---

## 2. User Administration (`/users`)

### 2.1 Get All Users (Admin)
```bash
curl -X GET "http://localhost:5000/api/v1/users?role=Resident&isActive=true" \
  -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>"
```

### 2.2 Get User by ID (Admin)
```bash
curl -X GET http://localhost:5000/api/v1/users/66be123456789abcdef01234 \
  -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>"
```

### 2.3 Update User Role / Status (Admin)
```bash
curl -X PUT http://localhost:5000/api/v1/users/66be123456789abcdef01234/status \
  -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "Staff",
    "isActive": true
  }'
```

### 2.4 Delete User (Admin)
```bash
curl -X DELETE http://localhost:5000/api/v1/users/66be123456789abcdef01234 \
  -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>"
```

---

## 3. Flats & Occupancy (`/flats`)

### 3.1 Create Flat / Unit (Admin)
```bash
curl -X POST http://localhost:5000/api/v1/flats \
  -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "blockName": "Block-A",
    "flatNumber": "A-101",
    "floor": 1,
    "maintenanceRate": 3000
  }'
```

### 3.2 List All Society Flats
```bash
curl -X GET http://localhost:5000/api/v1/flats \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### 3.3 Assign Owner / Tenant to Flat (Admin)
```bash
curl -X POST http://localhost:5000/api/v1/flats/66be123456789abcdef09999/assign \
  -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "66be123456789abcdef01234",
    "occupancyType": "Owner"
  }'
```

### 3.4 Get Occupancy Summary Map (Admin)
```bash
curl -X GET http://localhost:5000/api/v1/flats/occupancy-map \
  -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>"
```

---

## 4. Gate & Visitor Management (`/visitors`)

### 4.1 Generate Digital QR Visitor Pass (Resident)
```bash
curl -X POST http://localhost:5000/api/v1/visitors/generate-pass \
  -H "Authorization: Bearer <RESIDENT_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "visitorName": "Tariq Guest",
    "phone": "+923215554433",
    "vehicleNumber": "LEC-5678",
    "purpose": "Family Dinner",
    "visitorType": "Guest",
    "validUntil": "2026-08-17T23:59:59.000Z"
  }'
```

### 4.2 Verify & Scan QR Pass (Guard Terminal)
```bash
curl -X POST http://localhost:5000/api/v1/visitors/verify-qr \
  -H "Authorization: Bearer <GUARD_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "qrToken": "VQR-8F12A9B0C3D4E5F6",
    "notes": "QR scanned at Gate 1 camera terminal"
  }'
```

### 4.3 Log Walk-in Visitor (Guard Terminal)
```bash
curl -X POST http://localhost:5000/api/v1/visitors/walk-in \
  -H "Authorization: Bearer <GUARD_ACCESS_TOKEN>" \
  -F "visitorName=Delivery Boy" \
  -F "phone=+923001112233" \
  -F "vehicleNumber=KHI-9988" \
  -F "purpose=Package Delivery" \
  -F "visitorType=Delivery" \
  -F "targetFlatId=66be123456789abcdef09999" \
  -F "photo=@/path/to/visitor_photo.jpg"
```

### 4.4 Checkout Visitor (Guard Terminal)
```bash
curl -X POST http://localhost:5000/api/v1/visitors/66be123456789abcdef07777/checkout \
  -H "Authorization: Bearer <GUARD_ACCESS_TOKEN>"
```

### 4.5 Get Active Overstay Alerts (Guard)
```bash
curl -X GET http://localhost:5000/api/v1/visitors/overstay-alerts \
  -H "Authorization: Bearer <GUARD_ACCESS_TOKEN>"
```

### 4.6 Get Visitor Logs
```bash
curl -X GET http://localhost:5000/api/v1/visitors \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

---

## 5. Billing & Maintenance Invoices (`/bills`)

### 5.1 Generate Monthly Invoices (Admin)
```bash
curl -X POST http://localhost:5000/api/v1/bills/generate-monthly \
  -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "billingMonth": "2026-08",
    "dueDate": "2026-08-25T23:59:59.000Z",
    "breakdown": {
      "waterCharges": 500,
      "securityCharges": 800,
      "repairCharges": 400,
      "commonAreaCharges": 800
    }
  }'
```

### 5.2 Apply Overdue Penalties (Admin)
```bash
curl -X POST http://localhost:5000/api/v1/bills/apply-penalties \
  -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "penaltyPercentage": 5
  }'
```

### 5.3 List Maintenance Bills
```bash
curl -X GET http://localhost:5000/api/v1/bills \
  -H "Authorization: Bearer <RESIDENT_ACCESS_TOKEN>"
```

### 5.4 Pay Maintenance Bill & Generate PDF Receipt (Resident)
```bash
curl -X POST http://localhost:5000/api/v1/bills/66be123456789abcdef08888/pay \
  -H "Authorization: Bearer <RESIDENT_ACCESS_TOKEN>" \
  -F "paymentMethod=SIMULATED_CARD" \
  -F "receipt=@/path/to/payment_proof.pdf"
```

### 5.5 Financial Collection Analytics (Admin)
```bash
curl -X GET http://localhost:5000/api/v1/bills/reports/collection \
  -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>"
```

---

## 6. Helpdesk & Complaints (`/complaints`)

### 6.1 Create Complaint Ticket with Image Attachment (Resident)
```bash
curl -X POST http://localhost:5000/api/v1/complaints \
  -H "Authorization: Bearer <RESIDENT_ACCESS_TOKEN>" \
  -F "title=Water Pipe Leakage" \
  -F "category=Plumbing" \
  -F "priority=High" \
  -F "description=Severe water leak in main balcony pipe." \
  -F "attachments=@/path/to/leak_photo.jpg"
```

### 6.2 Get Complaints List
```bash
curl -X GET http://localhost:5000/api/v1/complaints \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### 6.3 Route & Assign Ticket to Maintenance Staff (Admin)
```bash
curl -X POST http://localhost:5000/api/v1/complaints/66be123456789abcdef04444/assign \
  -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "staffId": "66be123456789abcdef05555"
  }'
```

### 6.4 Update Ticket Status & Resolution Notes (Staff)
```bash
curl -X PUT http://localhost:5000/api/v1/complaints/66be123456789abcdef04444/status \
  -H "Authorization: Bearer <STAFF_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "RESOLVED",
    "resolutionNotes": "Replaced damaged balcony pipe joint."
  }'
```

---

## 7. Notice Board & Polls (`/notices`)

### 7.1 Publish Notice / Poll (Admin)
```bash
curl -X POST http://localhost:5000/api/v1/notices \
  -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>" \
  -F "title=Annual General Body Meeting" \
  -F "content=AGM is scheduled for Sunday at 10 AM in the Clubhouse." \
  -F "category=Announcement" \
  -F "isPoll=true" \
  -F 'pollOptions=["Attend In Person", "Attend Online", "Cannot Attend"]'
```

### 7.2 Get All Active Notices
```bash
curl -X GET http://localhost:5000/api/v1/notices \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### 7.3 Vote on Community Poll (Resident)
```bash
curl -X POST http://localhost:5000/api/v1/notices/66be123456789abcdef03333/vote \
  -H "Authorization: Bearer <RESIDENT_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "optionId": "66be123456789abcdef03334"
  }'
```

---

## 8. Amenity Bookings (`/amenities`)

### 8.1 Create Amenity Facility (Admin)
```bash
curl -X POST http://localhost:5000/api/v1/amenities \
  -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Community Clubhouse",
    "description": "Air-conditioned hall for events",
    "capacity": 50,
    "bookingFee": 1500
  }'
```

### 8.2 List Amenities
```bash
curl -X GET http://localhost:5000/api/v1/amenities \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### 8.3 Check Real-Time Availability & Slot Conflicts
```bash
curl -X GET "http://localhost:5000/api/v1/amenities/66be123456789abcdef02222/availability?bookingDate=2026-08-20" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### 8.4 Book Facility Slot (Resident)
```bash
curl -X POST http://localhost:5000/api/v1/amenities/66be123456789abcdef02222/book \
  -H "Authorization: Bearer <RESIDENT_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "bookingDate": "2026-08-20",
    "startTime": "18:00",
    "endTime": "21:00"
  }'
```

### 8.5 Get My Bookings (Resident)
```bash
curl -X GET http://localhost:5000/api/v1/amenities/my-bookings \
  -H "Authorization: Bearer <RESIDENT_ACCESS_TOKEN>"
```

---

## 9. Emergency SOS Siren (`/emergency`)

### 9.1 Trigger Emergency SOS Alert
```bash
curl -X POST http://localhost:5000/api/v1/emergency/trigger \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "alertType": "Fire",
    "locationDetails": "Block B - 3rd Floor Corridor"
  }'
```

### 9.2 Get Active Emergency Alerts
```bash
curl -X GET http://localhost:5000/api/v1/emergency/active \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### 9.3 Resolve Emergency Alert (Guard / Admin)
```bash
curl -X PUT http://localhost:5000/api/v1/emergency/66be123456789abcdef01111/resolve \
  -H "Authorization: Bearer <GUARD_ACCESS_TOKEN>"
```
