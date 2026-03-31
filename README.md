---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [System Requirements](#3-system-requirements)
4. [Installation & Setup](#4-installation--setup)
5. [Configuration](#5-configuration)
6. [Project Structure](#6-project-structure)
7. [Authentication & Security](#7-authentication--security)
8. [API Integration](#8-api-integration)
9. [Environment Guide](#9-environment-guide)
10. [Contact & Handover](#10-contact--handover)


---

## 1. Project Overview

**IATMS (Intern Attendance Tracking Management System)** คือระบบ Frontend สำหรับจัดการและติดตามการเข้างานของนักศึกษาฝึกงานภายในองค์กร

> โปรเจกต์นี้เป็นส่วน **Frontend Web Application** เท่านั้น — Backend API อยู่ใน repository แยก

---

## 2. Tech Stack

| ส่วน | เทคโนโลยี | Version |
|------|-----------|---------|
| Library หลัก | React | 19.2.4 |
| UI Framework | Ant Design & React Bootstrap | 6.2.3 & 2.10.10 |
| Routing | React Router DOM | 7.13.0 |
| HTTP Client | Axios | 1.13.5 |
| แผนที่ (Maps) | React Google Maps API | 2.20.8 |
| จัดการเวลา | Moment.js | 2.30.1 |
| Export Data | xlsx (Excel) | 0.18.5 |
| Build Tool | Create React App (react-scripts) | 5.0.1 |



---

## 3. System Requirements

| รายการ | ความต้องการ |
|--------|------------|
| Node.js | v16 หรือสูงกว่า (แนะนำเวอร์ชัน LTS เช่น 18 หรือ 20) |
| npm / Yarn | เวอร์ชันที่มาพร้อม Node.js |
| Browser | Chrome, Firefox, Edge, Safari (เวอร์ชันปัจจุบัน) |
| OS | Windows / Linux / macOS |


ตรวจสอบ Node version:
```bash
node -v
npm -v
```

---

## 4. Installation & Setup

### 4.1 Clone Repository

```bash
git clone https://github.com/Napatpongc/IATMS-Frontend.git # ใช้ repository จริงของ frontend
cd iatms
```

### 4.2 Install Dependencies

```bash
npm install
# หรือถ้ามีปัญหา version conflict ของ peer dependency สามารถใช้:
# npm install --legacy-peer-deps
```

### 4.3 ตั้งค่า Configuration

สร้างไฟล์ `.env` ตามรายละเอียดใน [Section 5](#5-configuration) กรณีที่ยังไม่มี หรือคัดลอกไฟล์ต้นแบบที่มีอยู่:

```bash
# เตรียมไฟล์ .env โดยเพิ่มข้อมูลสำหรับเรียกใช้งาน API
```

### 4.4 รันโปรเจกต์ (Development)

```bash
npm start
```

แอปจะทำงานและเปิด Browser ที่:
- `http://localhost:3000` 

---

## 5. Configuration

แก้ไขไฟล์ `.env` เพื่อกำหนดค่า Environment และปลายทาง API:

```env
REACT_APP_ENV=uat
REACT_APP_TITLE=IATMS

# API URLs สำหรับแต่ละ Environment
REACT_APP_API_URL_LOCAL=https://localhost:44305/api/
REACT_APP_API_URL_UAT=https://portal.erm.local/IATMS/service/api/
REACT_APP_API_URL_PROD=https://dcaweb01.intranet.bbl/AppName/service/api/

# Report URLs
REACT_APP_REPORT_URL_UAT=https://it-sqlrs1602.test.bbl/ReportServer/Pages/ReportViewer.aspx?%2fERM%AppName%2fReports%2f
REACT_APP_REPORT_URL_PROD=https://it-sqlrs1103/ReportServer/Pages/ReportViewer.aspx?%2fERM%AppName%2fReports%2f

# Origin Configurations
REACT_APP_ORIGIN_LOCAL=https://localhost:3000/AppName/web/
REACT_APP_ORIGIN_UAT=https://it-wpeweb1604.test.bbl
REACT_APP_ORIGIN_PROD=https://dcaweb01.intranet.bbl

# Security & App Settings
REACT_APP_MAX_ROW=25
REACT_APP_SECURE_LOCAL_STORAGE_HASH_KEY=YOUR_HASH_KEY_MIN_32_CHARS
REACT_APP_VERSION=1.0.0
REACT_APP_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
```

### คำอธิบาย Configuration ที่สำคัญ

| Key | คำอธิบาย |
|-----|---------|
| `REACT_APP_ENV` | ระบุ Environment ที่ใช้งาน (`local`, `uat`, `prod`) |
| `REACT_APP_API_URL_*` | URL สำหรับเรียกใช้งาน Backend API แยกตามแต่ละ Environment |
| `REACT_APP_SECURE_LOCAL_STORAGE_HASH_KEY` | คีย์ลับสำหรับเข้ารหัสข้อมูลที่จะเก็บลง Local Storage ป้องกันการถูกอ่านค่า |
| `REACT_APP_GOOGLE_MAPS_API_KEY` | API Key สำหรับเรียกใช้งาน Google Maps (บันทึกจุดพื้นที่) |
| `REACT_APP_MAX_ROW` | จำนวนแถวข้อมูลที่แสดงสูงสุดต่อหน้า - ค่าเริ่มต้น `25` |

> ⚠️ **อย่า commit ค่าจริงของ API Keys หรือ Secret ลงใน Git** — ใช้คำอ้างอิงและแยกกำหนดใน deployment process

---

## 6. Project Structure

```
iatms/
│
├── public/                     # Static files (index.html, logo, etc.)
│
├── src/                        # Source Code หลัก
│   ├── actions/               # Redux / State management actions หรือ common func
│   ├── components/            # UI Components แยกตามฟีเจอร์การทำงานของจอ
│   │   ├── Admin/             # จัดการผู้ใช้ สิทธิ์ และ Roles (UserManage, etc.)
│   │   ├── Attendance/        # จัดการเวลาเข้า-ออกงานและการลา (Manage, Leave)
│   │   └── Setup/             # ตั้งค่าระบบ (เช่น Holidays)
│   ├── services/              # ไฟล์เชื่อมต่อ HTTP Request API แยกตามเรื่องที่ติดต่อ
│   │   ├── home.service.js
│   │   ├── leaveapproval.service.js
│   │   └── ...
│   ├── App.js                 # Component หลักของแอปและ Router Setup
│   ├── index.js               # เริ่มต้น React / Entry Point หลักของโปรแกรม
│   └── index.css              # Global styles พื้นฐาน (CSS)
│
├── package.json                # Dependencies packages และ scripts คำสั่งโปรเจกต์
└── .env                        # ไฟล์ Environmental variables
```

### คำอธิบายแต่ละ Layer

| Folder | หน้าที่ |
|--------|--------|
| `components/` | รวบรวมหน้าจอหลักๆ แบ่งเป็นโมดูลชัดเจน (Admin, Attendance, Setup) เพื่อการ reuse และดูแลรักษาหน้าจอ UI |
| `services/` | รวบรวมฟังก์ชันสำหรับเรียก `axios` ยิงหา Backend แยกจัดการให้อยู่เป็นสัดส่วน |
| `actions/` | ส่วนจัดการและส่งผ่านข้อมูล / สถานะ (state) หรือการทำงานบางอย่าง |

---

## 7. Authentication & Security

- **Secure Storage:** แอปพลิเคชันใช้ `react-secure-storage` ร่วมกับ `REACT_APP_SECURE_LOCAL_STORAGE_HASH_KEY` แทน `localStorage` ปกติ เพื่อป้องกันไม่ให้ข้อมูลสำคัญของผู้ใช้ (เช่น Token, Role Permission) ถูกอ่านหรือแก้ไขได้ง่ายจาก Browser Console
- **Token Mechanism:** เมื่อ Login ฝั่ง Frontend จะรับ Access Token (JWT) และ Refresh Token จากระบบ Backend API
- ข้อมูล Token จะถูกแนบไปกับ Header `Authorization: Bearer <token>` ทันทีที่มีการเรียกใช้งานไปยัง service ในระบบ Backend ไปกับการตั้งค่าของ `axios` 
- **Role Permission Control:** มีการจำกัดสิทธิ์ทั้งระดับการเข้าถึงหน้าจอต่างๆ (เช่น เมนู Check-In/Out) ไปจนถึงระดับปุ่มการกระทำบางปุ่มบนหน้าจอ ให้อิงจากข้อมูล Role ที่ผ่านการพิสูจน์แล้วจาก Backend

---

## 8. API Integration

การทำงานแอปพลิเคชันจะจัดการการเรียกส่วน API ทั้งหมดให้อยู่ในโฟลเดอร์ `/src/services/`
โดยจะมีการ map Base URL เข้าใช้งานตามค่าที่ปรับจาก `REACT_APP_ENV` เป็นอัตโนมัติ 

ตัวอย่าง Life-cycle request:

`Component หน้าจอ` ➔ `เรียก Service` ➔ `Axios Request (ผูก Access Token ให้)` ➔ `ติดต่อ Backend API` ➔ `รับ Response กลับมาอัปเดต Data/State`

---

## 9. Environment Guide

สามารถปรับเปลี่ยนให้สามารถเรียกและเชื่อมต่อไปที่ Server ต่างๆ ได้ ผ่านตัวแปร `REACT_APP_ENV`:

| ค่า Environment | วัตถุประสงค์ | อ้างอิง Base URL API |
|----------------|------------|---------------------|
| `local` | เครื่องนักพัฒนาไว้รันและทดสอบการแก้ไข | `REACT_APP_API_URL_LOCAL` |
| `uat` | เครื่องทดสอบ (UAT) ตรวจสอบก่อนขึ้นของจริง | `REACT_APP_API_URL_UAT` |
| `prod` | เครื่องเซิฟเวอร์ระบบจริง | `REACT_APP_API_URL_PROD` |

**การ Build เตรียม Deploy สู่ Web Server:**

1. ตรวจสอบค่า `REACT_APP_ENV` ของไฟล์ `.env` ที่จะใช้
2. ใช้คำสั่ง Build:
```bash
npm run build
```
3. ไฟล์ที่ได้จากคำสั่งนี้จะอยู่ในโฟลเดอร์ `build/` พร้อมนำไป Deploy ขึ้นรันบน Web Server ทันที (เช่น Nginx หรือ IIS ขององค์กร)

---

## 10. Contact & Handover

| รายการ | รายละเอียด |
|--------|----------|
| ผู้พัฒนา | ณภัทรพงศ์ แช่มช้อย, ณัฏฐพล ไพรรื่นรมย์ |
| Version | 1.0.0 |
| วันส่งมอบ | 31/03/2026 |

### สิ่งที่ต้องเตรียมเช็คก่อนติดตั้งหน้าบ้าน (Frontend deployment)

1. ✅ ตรวจสอบไฟล์ `.env` บนเซิฟเวอร์ให้ตรงกับ Environment ของการติดตั้ง (URL ของ API ต่างๆ)
2. ✅ ขอ Google Maps API Key และผูก domain ให้ตรงกับที่อนุญาต
3. ✅ ตรวจสอบระบบ Backend API ว่าตั้งค่า CORS ให้ยอมรับ Request จาก Frontend URL เรียบร้อยแล้ว
4. ✅ ทดสอบทดลอง login ให้มั่นใจว่าการสื่อสารจาก Frontend และ Backend ไม่มี network traffic (Firewall) ปิดกั้นอยู่

---

*README นี้อ้างอิงจากรหัส source code version 1.0.0 — หากมีการอัปเดตระบบหน้าบ้าน กรุณาอัปเดตเอกสารส่วนนี้ให้สอดคล้องกันด้วย*
