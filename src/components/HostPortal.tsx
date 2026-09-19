"use client";

import React, { useState } from "react";
import { 
  Building2, Home, PlusCircle, CheckCircle2, Sparkles, MapPin, 
  Phone, Zap, Truck, DollarSign, Trash2, ArrowRight, ShieldCheck, 
  Camera, Eye, Layers, AlertCircle
} from "lucide-react";
import ProvinceSelector from "@/components/ProvinceSelector";

interface HostPortalProps {
  customLocations: any[];
  onAddLocation: (loc: any) => void;
  onDeleteLocation: (id: string) => void;
  onViewLocation: (loc: any) => void;
}

export default function HostPortal({
  customLocations,
  onAddLocation,
  onDeleteLocation,
  onViewLocation,
}: HostPortalProps) {
  const [name, setName] = useState("");
  const [province, setProvince] = useState("เชียงใหม่");
  const [district, setDistrict] = useState("");
  const [category, setCategory] = useState("บ้าน & เรือนไทย");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [rate, setRate] = useState("15,000");
  const [power, setPower] = useState("มีไฟ 3 เฟส และลานจอดสำหรับรถปั่นไฟ");
  const [parking, setParking] = useState("จอดรถตู้ได้ 6 คัน + รถบรรทุกอุปกรณ์ 2 คัน");
  const [dronePolicy, setDronePolicy] = useState("อนุญาตให้บินโดรนได้ โดยต้องแจ้งล่วงหน้า");
  const [hilight, setHilight] = useState("");
  const [detail, setDetail] = useState("");
  const [tel, setTel] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [successNotice, setSuccessNotice] = useState(false);

  const presets = [
    {
      title: "🏡 เรือนไทยริมน้ำ 100 ปี",
      prov: "พระนครศรีอยุธยา",
      dist: "พระนครศรีอยุธยา",
      cat: "บ้าน & เรือนไทย",
      lat: "14.3532",
      lng: "100.5684",
      rate: "18,000",
      power: "ไฟบ้าน 30A พร้อมจุดต่อไฟ 3 เฟสริมน้ำ",
      parking: "ลานดินกว้าง จอดรถตู้ 8 คัน รถปั่นไฟ 1 คัน",
      drone: "อนุญาตบินโดรนถ่ายผิวน้ำและตัวเรือน",
      hilight: "สถาปัตยกรรมไม้สักทองโบราณริมแม่น้ำเจ้าพระยา บรรยากาศขลัง แสงเช้า-เย็นสะท้อนผิวน้ำสวยมาก",
      detail: "เรือนไทยหมู่โบราณ ใต้ถุนโล่ง ลานกว้างริมน้ำ มีท่าเรือส่วนตัว เหมาะกับกองถ่ายละครพีเรียด ซีนดราม่า และมิวสิควิดีโอ",
      tel: "081-999-1234",
    },
    {
      title: "🏭 โกดังเก่าดิบสไตล์ Industrial",
      prov: "สมุทรปราการ",
      dist: "พระประแดง",
      cat: "โกดัง & โรงงานเก่า",
      lat: "13.6580",
      lng: "100.5340",
      rate: "22,000",
      power: "ไฟฟ้าอุตสาหกรรม 100A รองรับไฟสตูดิโอขนาดใหญ่ทุกประเภท",
      parking: "ลานคอนกรีตขนาดใหญ่ จอดรถเทรลเลอร์และรถกองถ่ายได้กว่า 20 คัน",
      drone: "บินโดรนภายในโกดังเพดานสูง 10 เมตรได้",
      hilight: "กำแพงอิฐเปลือย โครงสร้างเหล็กดิบ แสงส่องทะลุหน้าต่างกระจก เหมาะกับซีนแอ็กชัน และถ่าย MV แฟชั่น",
      detail: "โกดังริมแม่น้ำพื้นที่ 1,200 ตร.ม. โปร่ง ไร้เสากลาง มีห้องแต่งตัวนักแสดงและห้องน้ำพร้อมแอร์",
      tel: "089-888-5678",
    },
    {
      title: "☕ คาเฟ่เรือนกระจกกลางสวนป่า",
      prov: "เชียงใหม่",
      dist: "หางดง",
      cat: "คาเฟ่ & สตูดิโอ",
      lat: "18.6850",
      lng: "98.9200",
      rate: "12,000",
      power: "ไฟ 30A 220V มีจุดจอดรถปั่นไฟริมสวน",
      parking: "จอดรถได้ 10 คัน ทางเข้าลาดยาง รถตู้เข้าถึงสะดวก",
      drone: "อนุญาตบินโดรนเหนือสวนป่า",
      hilight: "สไตล์ Glasshouse โปร่ง แสงธรรมชาติ 360 องศา ล้อมรอบด้วยเฟิร์นและต้นไม้ใหญ่ เหมาะกับหนังรักโรแมนติก",
      detail: "คาเฟ่สไตล์นอร์ดิกผสมสวนทรอปิคอล มีมุมถ่ายทั้ง indoor และ outdoor ปิดร้านให้ถ่ายทำเฉพาะวันจันทร์-พุธ",
      tel: "095-777-9012",
    },
  ];

  const applyPreset = (p: any) => {
    setName(p.title);
    setProvince(p.prov);
    setDistrict(p.dist);
    setCategory(p.cat);
    setLat(p.lat);
    setLng(p.lng);
    setRate(p.rate);
    setPower(p.power);
    setParking(p.parking);
    setDronePolicy(p.drone);
    setHilight(p.hilight);
    setDetail(p.detail);
    setTel(p.tel);
  };

  const handleAiAutoTag = () => {
    if (!name) return;
    setIsAiGenerating(true);
    setTimeout(() => {
      if (name.includes("เรือน") || name.includes("บ้าน") || name.includes("ไทย")) {
        setHilight("✨ สถาปัตยกรรมไม้คลาสสิก บรรยากาศอบอุ่น แสงลอดช่องหน้าต่างเป็นเอกลักษณ์");
        setDetail("พื้นที่กว้างขวาง เหมาะสำหรับซีนครอบครัว ละครย้อนยุค หรือ MV อารมณ์ซึ้ง มีพื้นที่จัดฉากทั้งภายในและภายนอก");
        setPower("ระบบไฟฟ้าพร้อมจุดต่อเสริม สามารถนำรถปั่นไฟมาจอดในระยะ 30 เมตรได้");
      } else if (name.includes("โกดัง") || name.includes("โรงงาน") || name.includes("ลอฟท์")) {
        setHilight("🔥 โครงสร้างเหล็กและกำแพงเปลือย มู้ดแอนด์โทนดุดัน ลึกลับ สไตล์ Cinematic Industrial");
        setDetail("เพดานสูง รองรับการแขวนไฟ Rigging และมุมกล้อง Top View เหมาะกับโฆษณารถยนต์ ซีนแอ็กชัน และแฟชั่น");
        setPower("ระบบไฟฟ้ามาตรฐานอุตสาหกรรม รองรับโหลดไฟสูงโดยไม่ต้องใช้เครื่องปั่นไฟ");
      } else {
        setHilight("🌿 บรรยากาศธรรมชาติ แสง Daylight นุ่มนวลตลอดวัน เหมาะกับงานถ่ายทำที่ต้องการความร่มรื่น");
        setDetail("สถานที่ได้รับการดูแลอย่างดี มีพื้นที่รับรองนักแสดง จุดพักผ่อน และสิ่งอำนวยความสะดวกครบถ้วน");
      }
      setIsAiGenerating(false);
    }, 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !province) return;

    const newLoc = {
      id: `host_${Date.now()}`,
      name_th: name,
      name_en: name,
      province,
      district: district || "เมือง",
      category,
      lat: parseFloat(lat) || 18.7883,
      lng: parseFloat(lng) || 98.9853,
      tel: tel || "ติดต่อผ่านระบบ ThaiScout",
      hilight,
      detail: detail || "สถานที่พร้อมเปิดให้กองถ่ายทำภาพยนตร์ โฆษณา และมิวสิควิดีโอเช่าพื้นที่",
      isCustomHost: true,
      productionSpecs: {
        rate: `${rate} บาท/คิว (12 ชม.)`,
        power,
        parking,
        dronePolicy,
      },
    };

    onAddLocation(newLoc);
    setSuccessNotice(true);
    setTimeout(() => setSuccessNotice(false), 4000);

    // Reset Form
    setName("");
    setHilight("");
    setDetail("");
    setTel("");
  };

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Hero Banner */}
      <div className="bg-white border-[2.5px] border-[#16a34a] rounded-[24px] shadow-[5px_5px_0px_#15803d] p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="bg-[#bbf7d0] border-2 border-[#16a34a] rounded-2xl p-3 text-2xl shadow-[2px_2px_0px_#15803d]">
            🏡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-[#14532d]">
                Owner & Host Portal (ระบบฝากสถานที่ถ่ายทำ)
              </h2>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#fef08a] border border-[#d97706] text-[#78350f]">
                Crowdsourced Assets
              </span>
            </div>
            <p className="text-xs font-bold text-slate-600 mt-1 max-w-2xl">
              เปิดบ้าน, สวน, โกดัง, หรือคาเฟ่ของคุณให้กองถ่ายภาพยนตร์ โฆษณา ซีรีส์ และ MV มาเช่าถ่ายทำ สร้างรายได้สู่เจ้าของพื้นที่โดยตรง พร้อมระบบระบุสเปกทางเทคนิคที่กองถ่ายต้องการรู้ครบจบในที่เดียว
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#f0fdf4] border-2 border-[#16a34a] px-3.5 py-2 rounded-xl text-xs font-bold text-[#14532d] shrink-0">
          <ShieldCheck className="w-4 h-4 text-[#16a34a]" />
          <span>สถานที่ที่คุณลงทะเบียน: <strong>{customLocations.length} แห่ง</strong></span>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successNotice && (
        <div className="bg-[#f0fdf4] border-2 border-[#16a34a] p-3.5 rounded-xl shadow-[3px_3px_0px_#15803d] flex items-center justify-between gap-3 text-xs font-black text-[#14532d] animate-bounce">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#16a34a]" />
            <span>สำเร็จ! เพิ่มสถานที่ของคุณเข้าสู่ระบบ ThaiScout แล้ว กองถ่ายสามารถค้นหาและชี้เป้าบนแผนที่ได้ทันที</span>
          </div>
          <span className="text-[10px] uppercase font-mono bg-white px-2 py-0.5 rounded border border-[#16a34a]">
            Live Synced
          </span>
        </div>
      )}

      {/* Quick Presets for Demo */}
      <div className="bg-white border-2 border-slate-300 rounded-[20px] p-4 shadow-[3px_3px_0px_#94a3b8]">
        <div className="flex items-center gap-2 mb-2 text-xs font-black text-slate-700">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Quick Demo Presets (คลิกเพื่อโหลดตัวอย่างสำหรับพรีเซนต์ทันที):</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {presets.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyPreset(p)}
              className="text-xs px-3 py-1.5 rounded-xl bg-[#f8fafc] hover:bg-[#fffbeb] text-slate-800 border-2 border-slate-300 hover:border-[#d97706] font-bold transition cursor-pointer flex items-center gap-1.5"
            >
              <span>{p.title}</span>
              <span className="text-[10px] text-slate-500">({p.prov})</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* === Left: Venue Registration Form (7 Cols) === */}
        <div className="lg:col-span-7 bg-white border-[2.5px] border-[#0284c7] rounded-[24px] shadow-[4px_4px_0px_#0369a1] p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-[#0284c7]" />
              แบบฟอร์มลงทะเบียนสถานที่ (Filming Asset Form)
            </h3>
            <span className="text-[11px] font-bold text-[#0284c7] bg-[#f0f9ff] px-2.5 py-0.5 rounded-lg border border-[#bae6fd]">
              For Production Use
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 1. Location Name */}
            <div>
              <label className="block text-xs font-black text-slate-800 mb-1">
                📍 ชื่อสถานที่ / ชื่อสตูดิโอ <span className="text-rose-600">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="เช่น เรือนไทยริมน้ำโบราณ หรือ คาเฟ่สวนสนสไตล์ลอฟท์"
                  className="flex-1 bg-white border-2 border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0284c7]"
                />
                <button
                  type="button"
                  onClick={handleAiAutoTag}
                  disabled={!name || isAiGenerating}
                  className="btn btn-yellow text-xs px-3 py-2 rounded-xl font-black shrink-0 flex items-center gap-1"
                  title="ให้ AI ช่วยสร้างคำบรรยายและมู้ดของฉากอัตโนมัติ"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {isAiGenerating ? "AI กำลังคิด..." : "AI Auto-Brief"}
                </button>
              </div>
            </div>

            {/* 2. Province, District & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">
                  จังหวัด <span className="text-rose-600">*</span>
                </label>
                <ProvinceSelector
                  value={province}
                  onChange={setProvince}
                  allowAll={false}
                  placeholder="เลือกจังหวัดที่ตั้ง..."
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">
                  อำเภอ / เขต
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="เช่น เมือง, พระประแดง"
                  className="w-full bg-white border-2 border-slate-300 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0284c7]"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">
                  ประเภทสถานที่
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white border-2 border-slate-300 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0284c7]"
                >
                  <option value="บ้าน & เรือนไทย">บ้าน & เรือนไทย</option>
                  <option value="โกดัง & โรงงานเก่า">โกดัง & โรงงานเก่า</option>
                  <option value="คาเฟ่ & สตูดิโอ">คาเฟ่ & สตูดิโอ</option>
                  <option value="สวนเกษตร & ธรรมชาติ">สวนเกษตร & ธรรมชาติ</option>
                  <option value="อาคารโมเดิร์น & ดาดฟ้า">อาคารโมเดิร์น & ดาดฟ้า</option>
                </select>
              </div>
            </div>

            {/* 3. GPS Coordinates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 border border-slate-200 p-3 rounded-xl">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  ละติจูด (Latitude)
                </label>
                <input
                  type="text"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  placeholder="เช่น 14.3532"
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-[#0284c7]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  ลองจิจูด (Longitude)
                </label>
                <input
                  type="text"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  placeholder="เช่น 100.5684"
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-[#0284c7]"
                />
              </div>
            </div>

            {/* 4. Film Production Specs (หัวใจหลักของกองถ่าย) */}
            <div className="bg-[#f0f9ff] border-2 border-[#0284c7] rounded-xl p-3.5 space-y-3">
              <div className="text-xs font-black text-[#0c4a6e] flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-[#0284c7]" />
                <span>ข้อมูลทางเทคนิคสำหรับกองถ่าย (Production Specs)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">
                    💰 อัตราค่าเช่าสถานที่ (บาท / คิว 12 ชม.)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={rate}
                      onChange={(e) => setRate(e.target.value)}
                      placeholder="เช่น 15,000 หรือ ต่อรองได้"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-emerald-700 focus:outline-none focus:border-[#0284c7]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">
                    ☎️ เบอร์ติดต่อผู้ดูแลสถานที่ / ผู้ประสานงาน <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={tel}
                    onChange={(e) => setTel(e.target.value)}
                    placeholder="เช่น 081-234-5678"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-amber-700 focus:outline-none focus:border-[#0284c7]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                  <span>ระบบไฟฟ้า & รถปั่นไฟ (Power Capacity)</span>
                </label>
                <input
                  type="text"
                  value={power}
                  onChange={(e) => setPower(e.target.value)}
                  placeholder="เช่น มีไฟ 3 เฟส, จอดรถปั่นไฟริมกำแพงได้"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0284c7]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1 flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-blue-600" />
                  <span>ที่จอดรถกองถ่าย & ทางเข้า (Parking & Access)</span>
                </label>
                <input
                  type="text"
                  value={parking}
                  onChange={(e) => setParking(e.target.value)}
                  placeholder="เช่น รองรับรถตู้ 8 คัน รถบรรทุกอุปกรณ์ 2 คัน"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0284c7]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  🚁 ระเบียบการบินโดรน & เสียงดังในพื้นที่
                </label>
                <input
                  type="text"
                  value={dronePolicy}
                  onChange={(e) => setDronePolicy(e.target.value)}
                  placeholder="เช่น อนุญาตบินโดรนได้ / ห้ามเสียงดังหลัง 22:00 น."
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0284c7]"
                />
              </div>
            </div>

            {/* 5. Highlight & Detail */}
            <div>
              <label className="block text-xs font-black text-slate-800 mb-1">
                ✨ จุดเด่น & Mood and Tone ของสถานที่
              </label>
              <input
                type="text"
                value={hilight}
                onChange={(e) => setHilight(e.target.value)}
                placeholder="เช่น บรรยากาศดิบ ย้อนยุค สวยงามตอนบ่าย แสงเฉียง"
                className="w-full bg-white border-2 border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0284c7]"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-800 mb-1">
                📝 รายละเอียดสถานที่เพิ่มเติม
              </label>
              <textarea
                rows={3}
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                placeholder="อธิบายสิ่งอำนวยความสะดวก เช่น มีห้องแต่งตัวนักแสดง ห้องน้ำแยก เครื่องปรับอากาศ..."
                className="w-full bg-white border-2 border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0284c7]"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-mint w-full py-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[3px_3px_0px_#15803d]"
            >
              <PlusCircle className="w-4 h-4" />
              ลงทะเบียนเปิดรับกองถ่ายทันที (Publish Location)
            </button>
          </form>
        </div>

        {/* === Right: My Listed Locations Manager (5 Cols) === */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-white border-[2.5px] border-[#7c3aed] rounded-[24px] shadow-[4px_4px_0px_#6d28d9] p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="bg-[#ddd6fe] border border-[#7c3aed] p-1.5 rounded-lg text-[#4c1d95]">
                  <Home className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-black text-[#4c1d95]">
                  คลังสถานที่ของคุณ ({customLocations.length})
                </h3>
              </div>
              <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                พร้อมให้กองถ่ายค้นหา
              </span>
            </div>

            {customLocations.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-6">
                <Building2 className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-black text-slate-700">
                  ยังไม่มีสถานที่ที่คุณลงทะเบียนไว้
                </p>
                <p className="text-[11px] text-slate-500 font-medium mt-1">
                  กรอกแบบฟอร์มด้านซ้าย หรือคลิกตัวอย่าง Preset ด้านบนเพื่อเริ่มลงทะเบียน
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {customLocations.map((loc) => (
                  <div
                    key={loc.id}
                    className="bg-white border-2 border-slate-300 rounded-2xl p-4 shadow-[2px_2px_0px_#94a3b8] flex flex-col justify-between gap-2.5 hover:border-[#7c3aed] transition"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-[#bbf7d0] text-[#14532d] border border-[#16a34a]">
                          {loc.category}
                        </span>
                        <span className="text-[10px] font-mono font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {loc.productionSpecs?.rate || "15,000 บ./คิว"}
                        </span>
                      </div>

                      <h4 className="text-sm font-black text-slate-900 line-clamp-1">
                        {loc.name_th}
                      </h4>
                      <p className="text-[11px] font-bold text-slate-500">
                        📍 {loc.province} {loc.district ? `• อ.${loc.district}` : ""}
                      </p>

                      {loc.hilight && (
                        <p className="text-[11px] font-medium text-[#4c1d95] bg-[#f5f3ff] p-2 rounded-lg mt-2 line-clamp-2 border border-[#ddd6fe]">
                          {loc.hilight}
                        </p>
                      )}

                      <div className="mt-2 space-y-1 text-[10px] text-slate-600 font-medium">
                        <div className="flex items-center gap-1">
                          <Zap className="w-3 h-3 text-amber-600 shrink-0" />
                          <span className="line-clamp-1">{loc.productionSpecs?.power || "มีไฟฟ้าพร้อมใช้"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span className="font-mono font-bold text-emerald-700">{loc.tel}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
                      <button
                        onClick={() => onViewLocation(loc)}
                        className="btn btn-blue text-xs px-3 py-1 rounded-lg font-black flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        ดูบนแผนที่กองถ่าย
                      </button>

                      <button
                        onClick={() => onDeleteLocation(loc.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 transition"
                        title="ลบสถานที่นี้"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Value Prop Card for Pitching */}
          <div className="bg-[#fffbeb] border-2 border-[#d97706] rounded-[20px] p-4 shadow-[3px_3px_0px_#b45309] text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-black text-[#78350f]">
              <Sparkles className="w-4 h-4 text-[#d97706]" />
              <span>ทำไมเจ้าของสถานที่ต้องมาลงกับ ThaiScout?</span>
            </div>
            <ul className="space-y-1 text-slate-700 font-medium pl-4 list-disc">
              <li>เข้าถึงกองถ่ายภาพยนตร์ โฆษณา และ MV ระดับประเทศโดยตรง</li>
              <li>มีฟอร์มระบุสเปกทางเทคนิค (ไฟ/ที่จอดรถ/โดรน) ชัดเจน ไม่ต้องตอบคำถามซ้ำซ้อน</li>
              <li>สร้างรายได้เสริมให้ชุมชนและเจ้าของทรัพย์สิน 10,000 - 50,000 บาทต่อคิว</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
