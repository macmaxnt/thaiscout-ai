# 🎬 ThaiScout AI
### Intelligent Location Scouting & Grounded Permit Agent

> **AIAT x CAMT Hackathon · Track 1: Data to Solution**  
> Autonomous Creative Location Scouting & Production Feasibility Assistant  
> สำหรับกองถ่ายภาพยนตร์, มิวสิควิดีโอ, คอนเทนต์ครีเอเตอร์, และโปรดักชั่นเฮาส์

[![Live Demo](https://img.shields.io/badge/Live%20Demo-thaiscout--ai.vercel.app-black?style=for-the-badge&logo=vercel)](https://thaiscout-ai.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js%2015-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)

---

## 🌟 ทำไมต้อง ThaiScout AI?

ในโจทย์การนำชุดข้อมูลสถานที่ท่องเที่ยว ททท. 8,628 แห่งมาใช้:

| ปัญหา | วิธีแก้ |
|-------|---------|
| ข้อมูลดิบมีเฉพาะวัด/ธรรมชาติ ไม่มีคาเฟ่-ร้านอาหาร | เน้นกลุ่มเป้าหมาย **กองถ่าย** ที่ต้องการพิกัด GPS ชัด |
| ผู้กำกับบรีฟด้วยภาษา Mood & Tone นามธรรม | ระบบ NLP แปลบรีฟ → จับคู่สถานที่จาก corpus |
| เสี่ยงถูกสั่งปิดกองหากไม่รู้กฎระเบียบพื้นที่ | AI RAG ดึงข้อมูลจริงจาก corpus ไม่กุตัวเลข |

---

## 🚀 ฟีเจอร์หลัก

### 🔍 Creative Brief Search
- ค้นหาด้วยบรีฟนามธรรม เช่น *"น้ำตกลึกลับ โขดหินใหญ่ เหมาะถ่าย MV เพลงเศร้า"*
- กรองแยกรายจังหวัด หรือค้นหาทั่วประเทศ
- คำนวณ **Match Score (%)** พร้อมแสดงจุดเด่นของแต่ละสถานที่

### 🤖 AI RAG Production Consultant
- ดึงข้อมูลสถานที่จาก Supabase (ททท. 8,628 แห่ง) เป็น Ground Truth
- วิเคราะห์แสงธรรมชาติ (Golden Hour), Logistics, การเข้าถึงของรถกองถ่าย
- **Anti-Hallucination:** ถ้าไม่มีข้อมูลในฐาน AI จะบอกให้โทรติดต่อเบอร์ทางการแทน
- ซักถามข้อกังวลเฉพาะจุด พร้อมอ้างอิง Evidence กลับถึง Corpus ID

### 🗺️ Split-Screen Interactive Map
- แผนที่ Leaflet.js แสดงพิกัดจริงควบคู่กับลิสต์ผลการค้นหา
- ปักหมุดเข้า **Recce Board** (คลังสถานที่)
- วาดเส้นทางเชื่อมต่อจุดถ่ายทำ (Waypoint Route) พร้อมคำนวณระยะทาง
- เปิด Google Maps Multi-Stop Routing ด้วยคลิกเดียว

### 📁 Collection / Recce Board
- บันทึกสถานที่ที่ชอบเข้าคลัง
- เรียงลำดับด้วย Drag & Drop
- ดูบนแผนที่พร้อมเส้นทางในคลัง

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS v4 (Neo-brutalist theme) |
| Database | **Supabase** (PostgreSQL) — 8,628 locations |
| Map | Leaflet.js + OpenStreetMap |
| AI Engine | Google Gemini API |
| Place Photos | Google Places API |
| Deployment | **Vercel** (Production) |

---

## 💻 วิธีรันในเครื่อง (Local Setup)

### 1. Clone Repository

```bash
git clone https://github.com/macmaxnt/thaiscout-ai.git
cd thaiscout-ai
npm install
```

### 2. ตั้งค่า Environment Variables

```bash
cp .env.example .env.local
```

เปิดไฟล์ `.env.local` แล้วใส่ค่า API Keys (ดูรายละเอียดการขอ key ในไฟล์ [.env.example](./.env.example))

```env
GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

> **หมายเหตุ:** ข้อมูลสถานที่ท่องเที่ยว 8,628 แห่งอยู่บน Supabase Cloud แล้ว — ขอ Supabase credentials จากเจ้าของโปรเจกต์

### 3. รัน Development Server

```bash
npm run dev
```

เปิดเบราว์เซอร์ที่ [http://localhost:3000](http://localhost:3000)

---

## 🗄️ Database Schema (Supabase)

ตาราง `thaiscout_locations` ใน Supabase PostgreSQL:

```sql
CREATE TABLE thaiscout_locations (
  id             TEXT PRIMARY KEY,
  name_th        TEXT,
  name_en        TEXT,
  category       TEXT,
  sub_type       TEXT,
  region         TEXT,
  province       TEXT,
  district       TEXT,
  sub_district   TEXT,
  description    TEXT,
  latitude       DOUBLE PRECISION,
  longitude      DOUBLE PRECISION,
  phone          TEXT,
  website        TEXT,
  open_hours     TEXT,
  highlights     TEXT[],
  tags           TEXT[]
);
```

---

## 📁 โครงสร้างโปรเจกต์

```
thaiscout-app/
├── src/
│   ├── app/
│   │   ├── page.tsx              # หน้าหลัก (Scout Search)
│   │   ├── collection/           # หน้าคลังสถานที่
│   │   └── api/
│   │       ├── scout/route.ts    # API: ค้นหาสถานที่ด้วย Gemini + Supabase
│   │       ├── chat/route.ts     # API: AI RAG Consultant
│   │       └── places/route.ts   # API: Google Places Photos
│   └── utils/
│       └── supabase.ts           # Supabase client
├── data/                         # ข้อมูล ททท. ดิบ (chunk_0 - chunk_4.json)
├── .env.example                  # Template สำหรับ environment variables
└── README.md
```

---

## 🌐 Production Deployment

แอปดีพลอยบน Vercel:  
🔗 **[https://thaiscout-ai.vercel.app](https://thaiscout-ai.vercel.app)**

ถ้าต้องการดีพลอย Vercel ใหม่ด้วยตัวเอง:
```bash
npm install -g vercel
vercel login
vercel deploy --prod
```

แล้วตั้งค่า Environment Variables ผ่าน Vercel Dashboard ให้ครบตาม `.env.example`

---

## 🤝 Contributing

1. Fork repository นี้
2. สร้าง branch ใหม่: `git checkout -b feature/your-feature-name`
3. Commit การเปลี่ยนแปลง: `git commit -m "feat: add your feature"`
4. Push ขึ้น branch: `git push origin feature/your-feature-name`
5. เปิด Pull Request

---

## 📄 License

MIT License — ใช้งานและแก้ไขได้อิสระ

---

## 👥 ทีมพัฒนา

ThaiScout AI สร้างขึ้นในงาน **AIAT x CAMT Hackathon**  
ข้อมูล: Tourism Authority of Thailand (TAT) Open Dataset
