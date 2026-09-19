# 🎬 ThaiScout AI — Intelligent Location Scouting & Grounded Permit Agent
> **AIAT x CAMT Hackathon · Track 1: Data to Solution (เปลี่ยนข้อมูลท่องเที่ยว ททท. ให้เป็นระบบที่ใช้งานได้จริง)**  
> Autonomous Creative Location Scouting & Production Feasibility Assistant สำหรับกองถ่ายภาพยนตร์, มิวสิควิดีโอ, คอนเทนต์ครีเอเตอร์, และโปรดักชั่นเฮาส์

---

## 🌟 ทำไมต้อง ThaiScout AI? (Pain Point & Problem Statement)
ในโจทย์การนำชุดข้อมูลสถานที่ท่องเที่ยว ททท. 8,628 แห่งมาใช้:
1. **ข้อจำกัดของข้อมูลดิบ:** มีเฉพาะสถานที่ท่องเที่ยว วัด และธรรมชาติ (45.5%) แต่แทบไม่มีข้อมูลคาเฟ่ ร้านอาหาร หรือโรงแรม จึงไม่เหมาะกับการทำแอปเที่ยวทั่วไป
2. **จุดแข็งมหาศาลสำหรับกองถ่าย:** ข้อมูลมีพิกัด **GPS ครบ 100%** และมี **เบอร์ติดต่อหน่วยงานทางการถึง 89.4%** ซึ่งเป็นสินทรัพย์ล้ำค่าที่สุดสำหรับทีม Location Scout
3. **ปัญหาของกองถ่าย:** ผู้กำกับมักมีบรีฟเป็น Mood & Tone นามธรรม (เช่น *"อยากได้น้ำตกลึกลับ โขดหินใหญ่ ถ่าย MV เพลงเศร้า"*) แต่ค้นหาใน Google Search หรือระบบทั่วไปยากมาก และเสี่ยงต่อการถูกสั่งปิดกองหากไม่รู้ระเบียบกฎหมายในพื้นที่

---

## 🚀 ฟีเจอร์หลักของระบบ (Core Capabilities)

### 1. 🔍 Creative Brief Search (NLP & Mood Grounding)
- รองรับการค้นหาด้วยบรีฟนามธรรมและภาษาพูดของผู้กำกับ
- กรองแยกรายจังหวัด หรือค้นหาทั่วประเทศ
- จับคู่สถานที่และคำนวณ **Match Score (%)** พร้อมแสดงจุดเด่นและคำบรรยายฉบับเต็ม

### 2. 🤖 AI RAG Production Consultant (Retrieval-Augmented Generation)
- **Domain-Specific RAG:** ดึงข้อมูลสถานที่จริงจาก Corpus ททท. 8,628 แห่งขึ้นมาเป็น Ground Truth
- **Cinematic & Lighting Analysis:** วิเคราะห์ทิศทางแสงธรรมชาติ (Golden Hour, God Rays), มิติภาพ และสภาพเสียงรบกวนในกอง
- **Logistics & Gear Access:** ประเมินการเข้าถึงของรถตู้กองถ่าย รถปั่นไฟ (Inverter Power) และขนาดทีมงานที่รองรับได้
- **Anti-Hallucination & Safe Refusal (ตาม Lab 4):** หากในฐานข้อมูล ททท. ไม่มีระบุตัวเลขค่าธรรมเนียม AI จะปฏิเสธการกุราคาเอง และชี้นำให้โทรติดต่อเบอร์ทางการจริงของพื้นที่นั้นทันที
- **Interactive Grounded Q&A:** ซักถามข้อกังวลเฉพาะจุด เช่น ระเบียบการบินโดรน (กสทช. + CAAT), สภาพถนนลาดชัน พร้อมแปะป้าย Evidence Citation ย้อนกลับถึง Corpus ID

### 3. 🗺️ Split-Screen Interactive Map & Recce Board
- แผนที่แสดงพิกัดจริงควบคู่กับลิสต์ผลการค้นหา
- ปักหมุดเลือกโลเคชันเข้าสู่ **Recce Board** (สำรวจหน้างาน)
- วาดเส้นทางเชื่อมต่อจุดถ่ายทำ (Waypoint Route)
- **Google Maps Multi-Stop Routing:** คลิกปุ่มเดียวเปิด Google Maps นำทางต่อเนื่องทุกจุดกองถ่ายได้ทันที

### 4. 🎨 Lab 4 Neo-Brutalist Theme
- ออกแบบสไตล์ Lab 4 AI Agent (Tone-on-Tone Palette, คอนทราสต์สูง, กรอบหนาเงาคมชัด)
- Responsive ใช้งานได้ลื่นไหลทั้ง Desktop และ Mobile

---

## 🛠️ สถาปัตยกรรมระบบ (Architecture & Tech Stack)
- **Frontend / Framework:** Next.js 15 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS v4 (Neo-brutalist interactive tokens)
- **Mapping:** Leaflet.js, OpenStreetMap Tiles, Google Maps URLs API
- **Knowledge Base (Corpus):** Tourism Authority of Thailand (TAT) Cleaned Attractions Dataset (8,628 records)
- **Agentic Engine:** Full-Text Grounded Search, Bounded Context Augmentation, Safe Refusal Guardrails

---

## 💻 วิธีการรันในเครื่อง (Local Setup)

```bash
# Clone the repository
git clone https://github.com/macmaxnt/thaiscout-ai.git
cd thaiscout-ai

# Install dependencies
npm install

# Run development server
npm run dev
```

เปิดเว็บเบราว์เซอร์ที่ [http://localhost:3000](http://localhost:3000)
