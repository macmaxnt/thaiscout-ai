"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { 
  Clapperboard, Search, MapPin, Phone, Clock, AlertTriangle, 
  CheckCircle2, Sparkles, Navigation, Share2, Compass, Film, ExternalLink,
  Sliders, Layers, ShieldCheck, Route, Eye, Home as HomeIcon, Zap, Building2
} from "lucide-react";

import RagModal from "@/components/RagModal";
import HostPortal from "@/components/HostPortal";
import ProvinceSelector from "@/components/ProvinceSelector";
import { detectProvinceFromText } from "@/data/provinces";

// Dynamic import for Leaflet map (client-only)
const InteractiveMap = dynamic(() => import("@/components/InteractiveMap"), {
  ssr: false,
  loading: () => (
    <div className="bg-white border-[2.5px] border-[#0284c7] rounded-[24px] shadow-[5px_5px_0px_#0369a1] h-[550px] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-10 h-10 border-4 border-[#0284c7] border-t-transparent rounded-full animate-spin mb-3"></div>
      <p className="font-black text-slate-700 text-sm">กำลังโหลดแผนที่ดาวเทียม / พิกัดกองถ่าย...</p>
      <p className="text-xs font-semibold text-slate-400 mt-1">Grounded with OpenStreetMap & TAT Coordinates</p>
    </div>
  ),
});

export default function Home() {
  const [brief, setBrief] = useState("น้ำตก ลำธาร โขดหิน บรรยากาศลึกลับ ถ่าย MV เพลงเศร้า");
  const [province, setProvince] = useState("all");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [scoutingList, setScoutingList] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<any | null>(null);
  const [ragTargetLocation, setRagTargetLocation] = useState<any | null>(null);
  const [currentMode, setCurrentMode] = useState<"scout" | "host">("scout");
  const [activeTab, setActiveTab] = useState<"search" | "scout">("search");
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [customLocations, setCustomLocations] = useState<any[]>([
    {
      id: "host_default_1",
      name_th: "เรือนไทยริมน้ำ 100 ปี (เจ้าของโดยตรง)",
      name_en: "Ancient Thai Waterfront House",
      province: "พระนครศรีอยุธยา",
      district: "พระนครศรีอยุธยา",
      category: "บ้าน & เรือนไทย",
      lat: 14.3532,
      lng: 100.5684,
      tel: "081-999-1234 (คุณสมชาย)",
      hilight: "✨ สถาปัตยกรรมไม้สักทองโบราณริมแม่น้ำเจ้าพระยา แสงเช้า-เย็นสะท้อนผิวน้ำสวยมาก",
      detail: "เรือนไทยหมู่โบราณ ใต้ถุนโล่ง ลานกว้างริมน้ำ มีท่าเรือส่วนตัว เหมาะกับกองถ่ายละครพีเรียด ซีนดราม่า และมิวสิควิดีโอ พร้อมห้องแต่งตัวติดแอร์",
      isCustomHost: true,
      productionSpecs: {
        rate: "18,000 บาท/คิว (12 ชม.)",
        power: "ไฟบ้าน 30A พร้อมจุดต่อไฟ 3 เฟสริมน้ำ",
        parking: "ลานดินกว้าง จอดรถตู้ 8 คัน รถปั่นไฟ 1 คัน",
        dronePolicy: "อนุญาตบินโดรนถ่ายผิวน้ำและตัวเรือน",
      },
    },
    {
      id: "host_default_2",
      name_th: "โกดังเก่าดิบสไตล์ Industrial (เจ้าของโดยตรง)",
      name_en: "Rustic Industrial Warehouse",
      province: "สมุทรปราการ",
      district: "พระประแดง",
      category: "โกดัง & โรงงานเก่า",
      lat: 13.6580,
      lng: 100.5340,
      tel: "089-888-5678 (คุณมานพ)",
      hilight: "🔥 กำแพงอิฐเปลือย โครงสร้างเหล็กดิบ แสงส่องทะลุหน้าต่างกระจก เหมาะกับซีนแอ็กชัน",
      detail: "โกดังริมแม่น้ำพื้นที่ 1,200 ตร.ม. โปร่ง ไร้เสากลาง รองรับการแขวนไฟ Rigging และมุมกล้อง Top View เหมาะกับโฆษณาและ MV แฟชั่น",
      isCustomHost: true,
      productionSpecs: {
        rate: "22,000 บาท/คิว (12 ชม.)",
        power: "ไฟฟ้าอุตสาหกรรม 100A รองรับไฟสตูดิโอขนาดใหญ่",
        parking: "ลานคอนกรีตขนาดใหญ่ จอดรถเทรลเลอร์และรถกองถ่ายได้กว่า 20 คัน",
        dronePolicy: "บินโดรนภายในโกดังเพดานสูง 10 เมตรได้",
      },
    },
  ]);

  const handleAddCustomLocation = (newLoc: any) => {
    setCustomLocations((prev) => [newLoc, ...prev]);
  };

  const handleDeleteCustomLocation = (id: string) => {
    setCustomLocations((prev) => prev.filter((x) => x.id !== id));
  };

  const handleViewCustomLocation = (loc: any) => {
    setCurrentMode("scout");
    setActiveTab("search");
    setSelectedLocation(loc);
  };

  const toggleExpand = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const sampleBriefs = [
    { title: "🌊 ทะเล & ผาหิน", text: "หาดทรายขาว หน้าผาหิน จุดชมวิวพระอาทิตย์ตก", prov: "ภูเก็ต" },
    { title: "🎬 MV น้ำตกลึกลับ", text: "น้ำตก ลำธาร โขดหิน บรรยากาศลึกลับ ถ่าย MV เพลงเศร้า", prov: "เชียงใหม่" },
    { title: "🏛️ ซีนพีเรียดโบราณ", text: "วัดเก่า โบราณสถาน สถาปัตยกรรมไม้โบราณ บรรยากาศสงบ", prov: "พระนครศรีอยุธยา" },
    { title: "🌾 ทุ่งกว้าง & คาวบอย", text: "ทุ่งหญ้า ภูเขา อ่างเก็บน้ำ บรรยากาศแคมป์ปิ้งคาวบอย", prov: "นครราชสีมา" },
    { title: "🏙️ ดาดฟ้าแสงสีตึกสูง", text: "ตึกสูง โมเดิร์น แสงไฟนีออน วิวเมืองหลวงยามค่ำคืน", prov: "กรุงเทพมหานคร" },
    { title: "🌊 ริมโขงสโลว์ไลฟ์", text: "ถนนคนเดินริมแม่น้ำโขง บ้านไม้โบราณ หมอกยามเช้า", prov: "เลย" },
  ];

  const handleSearch = async (targetBrief = brief, targetProv = province) => {
    setLoading(true);
    // Auto-detect province if brief contains province name/alias
    let provToSend = targetProv;
    if (targetProv === "all") {
      const detected = detectProvinceFromText(targetBrief);
      if (detected.detectedProvince) {
        provToSend = detected.detectedProvince;
      }
    }

    try {
      const res = await fetch("/api/scout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief: targetBrief, province: provToSend }),
      });
      const data = await res.json();
      if (data.success) {
        setResults(data.locations);
        if (data.locations.length > 0) {
          setSelectedLocation(data.locations[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

  const toggleScout = (item: any) => {
    if (scoutingList.find((x) => x.id === item.id)) {
      setScoutingList(scoutingList.filter((x) => x.id !== item.id));
    } else {
      setScoutingList([...scoutingList, item]);
    }
  };

  const handleSelect = (loc: any) => {
    setSelectedLocation(loc);
  };

  const matchingCustom = customLocations.filter((loc) => {
    if (province !== "all" && loc.province !== province) return false;
    if (brief.trim().length > 1) {
      const tokens = brief.toLowerCase().split(/\s+/).filter((t: string) => t.length > 1);
      if (tokens.length === 0) return true;
      const fullText = `${loc.name_th} ${loc.category} ${loc.hilight || ""} ${loc.detail || ""} ${loc.province} ${loc.district || ""}`.toLowerCase();
      return tokens.some((t: string) => fullText.includes(t));
    }
    return true;
  });

  const displayedLocations = activeTab === "search" ? [...matchingCustom, ...results] : scoutingList;

  return (
    <div className="min-h-screen py-4 px-3 sm:px-6 w-full flex flex-col gap-4">
      {/* 🚀 1. Lab 4 Top Navbar (เต็มหน้าจอ สไตล์ Lab 4 เป๊ะ) */}
      <header className="bg-white border-[2.5px] border-[#7c3aed] rounded-[20px] shadow-[4px_4px_0px_#6d28d9] px-4 py-3 sm:px-6 sm:py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-[#ddd6fe] border-2 border-[#7c3aed] rounded-xl px-2.5 py-1 shadow-[2px_2px_0px_#6d28d9] text-xl flex items-center justify-center">
            🚀
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-[#4c1d95] tracking-tight leading-tight">
                ThaiScout AI Lab
              </h1>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#fef08a] border border-[#d97706] text-[#78350f]">
                Track 1
              </span>
            </div>
            <p className="text-[11px] font-bold text-slate-500 hidden sm:block">
              Ship an AI-Enabled System (Autonomous Location Scouting & Grounded Permit Agent)
            </p>
          </div>
        </div>

        {/* 2-Sided Mode Switcher (สำหรับคนมาใช้ vs สำหรับเจ้าของเอางานมาลง) */}
        <div className="bg-slate-100 border-2 border-slate-300 p-1 rounded-2xl flex items-center gap-1 shadow-[2px_2px_0px_#94a3b8]">
          <button
            onClick={() => setCurrentMode("scout")}
            className={`btn text-xs px-3.5 py-1.5 rounded-xl font-black transition ${
              currentMode === "scout"
                ? "btn-blue shadow-[2px_2px_0px_#0369a1]"
                : "bg-transparent border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            🎬 โหมดกองถ่าย (Scout & Recce)
          </button>

          <button
            onClick={() => setCurrentMode("host")}
            className={`btn text-xs px-3.5 py-1.5 rounded-xl font-black transition flex items-center gap-1.5 ${
              currentMode === "host"
                ? "btn-mint shadow-[2px_2px_0px_#15803d]"
                : "bg-transparent border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            🏡 โหมดเจ้าของสถานที่ (Host Portal)
            <span className="bg-emerald-600 text-white text-[10px] px-1.5 py-0.2 rounded-full">
              {customLocations.length}
            </span>
          </button>
        </div>

        {/* Sub-actions for Scout Mode */}
        {currentMode === "scout" && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab("search")}
              className={`btn px-3 py-1.5 rounded-xl text-xs font-black ${
                activeTab === "search" ? "btn-blue" : "btn-purple opacity-70 hover:opacity-100"
              }`}
            >
              🔍 ค้นหา ({displayedLocations.length})
            </button>

            <button
              onClick={() => setActiveTab("scout")}
              className={`btn px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 ${
                activeTab === "scout" ? "btn-mint" : "btn-purple opacity-70 hover:opacity-100"
              }`}
            >
              🎬 Recce Board ({scoutingList.length})
            </button>
          </div>
        )}
      </header>

      {/* 🧭 2. Conditional Mode View: Host Portal vs Scout & Recce Board */}
      {currentMode === "host" ? (
        <HostPortal
          customLocations={customLocations}
          onAddLocation={handleAddCustomLocation}
          onDeleteLocation={handleDeleteCustomLocation}
          onViewLocation={handleViewCustomLocation}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start w-full">
        
        {/* === LEFT COLUMN: Brief Console & Multi-Column Results Grid === */}
        <div className="lg:col-span-7 xl:col-span-7 2xl:col-span-8 flex flex-col gap-4">
          
          {/* Creative Brief Console (สีขาว Neo-Brutalist ตามตีมสไลด์ Lab 4) */}
          <div className="bg-white border-[2.5px] border-[#0284c7] rounded-[22px] shadow-[4px_4px_0px_#0369a1] p-4 sm:p-5 flex flex-col gap-3">
            
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="bg-[#bae6fd] border border-[#0284c7] rounded-lg px-2.5 py-0.5 text-xs font-black text-[#0c4a6e] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Creative Brief Console
                </span>
                <span className="text-xs font-bold text-slate-500 hidden sm:inline">
                  Bounded AI Agent · FTS Grounding
                </span>
              </div>

              <div className="text-[11px] font-black text-[#0284c7] bg-[#f0f9ff] px-2.5 py-0.5 rounded-full border border-[#bae6fd]">
                Zero-Hallucination Verified
              </div>
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                ค้นหาโลเคชันถ่ายทำจาก <span className="text-[#0284c7] underline decoration-wavy">Creative Brief</span>
              </h2>
              <p className="text-xs font-bold text-slate-500 mt-0.5">
                พิมพ์บรรยากาศหรืออารมณ์ฉากที่ต้องการ แล้วระบบจะดึงสถานที่จริงของ ททท. พร้อมพิกัด GPS และเบอร์ติดต่อทางการ
              </p>
            </div>

            {/* Input Box */}
            <div className="bg-[#f8fafc] border-2 border-slate-300 rounded-[16px] p-3 focus-within:border-[#0284c7] focus-within:shadow-[2px_2px_0px_#0369a1] transition">
              <label className="block text-[11px] font-black text-[#0c4a6e] uppercase font-mono mb-1">
                ⚡ Director Brief / Mood & Tone (ภาษาคน)
              </label>
              <textarea
                rows={2}
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                placeholder="เช่น อยากได้น้ำตกหรือลำธารที่มีโขดหินใหญ่ บรรยากาศดิบๆ ถ่ายฉาก MV..."
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs sm:text-sm text-slate-900 font-semibold placeholder:text-slate-400 focus:outline-none focus:border-[#0284c7]"
              />

              <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between mt-2.5">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <ProvinceSelector
                    value={province}
                    onChange={(newProv) => {
                      setProvince(newProv);
                      handleSearch(brief, newProv);
                    }}
                    allowAll={true}
                  />
                </div>

                <button
                  onClick={() => handleSearch()}
                  disabled={loading}
                  className="btn btn-yellow w-full sm:w-auto px-5 py-2 rounded-xl font-black text-xs"
                >
                  <Search className="w-4 h-4 text-[#78350f]" />
                  {loading ? "กำลังค้นหา..." : "รัน AI Scouting Agent"}
                </button>
              </div>

              {/* Sample Brief Chips */}
              <div className="mt-2.5 pt-2 border-t border-slate-200 flex flex-wrap gap-1.5 items-center">
                <span className="text-[10px] font-black text-slate-500 font-mono">Quick Briefs:</span>
                {sampleBriefs.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setBrief(s.text);
                      setProvince(s.prov);
                      handleSearch(s.text, s.prov);
                    }}
                    className="text-[11px] px-2.5 py-0.5 rounded-lg bg-white hover:bg-[#fffbeb] text-slate-700 border border-slate-300 hover:border-[#d97706] font-bold transition cursor-pointer"
                  >
                    {s.title}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* System Boundary Bar */}
          <div className="px-4 py-2 bg-[#f0f9ff] border-2 border-[#0284c7] rounded-xl shadow-[2px_2px_0px_#0369a1] text-[#0c4a6e] font-bold text-xs flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="bg-[#bae6fd] border border-[#0284c7] rounded-lg px-2 py-0.5 text-[10px] font-black">
                TAT Grounding
              </span>
              <span>8,628 พิกัดจริง · ชัดเจนเรื่องระเบียบขออนุญาต</span>
            </div>
            <div className="font-mono text-xs text-[#0284c7] font-black bg-white px-2 py-0.5 rounded-md border border-[#bae6fd]">
              {displayedLocations.length} โลเคชัน
            </div>
          </div>

          {/* Location Cards Grid (ทำเป็นช่องๆ 2 คอลัมน์ตามที่ขอ) */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-56 bg-slate-200 rounded-[20px] border-2 border-slate-300" />
              ))}
            </div>
          ) : displayedLocations.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-[22px] border-[2.5px] border-dashed border-[#0284c7] p-8">
              <Clapperboard className="w-12 h-12 text-[#0284c7] mx-auto mb-2 opacity-40" />
              <p className="text-slate-900 font-black text-base">
                {activeTab === "search" ? "ไม่พบโลเคชันที่ตรงเงื่อนไข" : "ยังไม่มีสถานที่ใน Recce Board"}
              </p>
              <p className="text-xs font-bold text-slate-500 mt-1 mb-4">
                {activeTab === "search" 
                  ? "ลองปรับเปลี่ยนคำค้นหา หรือเลือกจังหวัดอื่นๆ ดูครับ" 
                  : "กดปุ่ม '+ ปักหมุด' ในหน้าค้นหา เพื่อเพิ่มสถานที่สำหรับออกกอง"}
              </p>
              {activeTab === "scout" && (
                <button
                  onClick={() => setActiveTab("search")}
                  className="btn btn-blue text-xs px-4 py-2 rounded-xl font-black"
                >
                  กลับไปค้นหาโลเคชัน
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayedLocations.map((loc) => {
                const isSaved = scoutingList.some((x) => x.id === loc.id);
                const isSelected = selectedLocation?.id === loc.id;
                const recceIndex = scoutingList.findIndex((x) => x.id === loc.id);

                return (
                  <div
                    key={loc.id}
                    onClick={() => handleSelect(loc)}
                    className={`bg-white rounded-[20px] p-4 transition duration-150 cursor-pointer flex flex-col justify-between border-[2.5px] ${
                      isSelected
                        ? "border-[#e11d48] shadow-[4px_4px_0px_#be123c] ring-2 ring-rose-200"
                        : "border-[#0284c7] shadow-[3px_3px_0px_#0369a1] hover:translate-x-[-2px] hover:translate-y-[-2px]"
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {loc.isCustomHost ? (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-[#bbf7d0] text-[#14532d] border-[1.5px] border-[#16a34a] flex items-center gap-1">
                              <HomeIcon className="w-3 h-3" />
                              เจ้าของโดยตรง (Verified Host)
                            </span>
                          ) : (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-[#ddd6fe] text-[#4c1d95] border-[1.5px] border-[#7c3aed]">
                              {loc.category}
                            </span>
                          )}

                          {loc.isCustomHost && loc.productionSpecs?.rate && (
                            <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-md bg-[#fef08a] text-[#78350f] border border-[#d97706]">
                              💰 {loc.productionSpecs.rate}
                            </span>
                          )}

                          {loc.relevanceScore && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#bbf7d0] text-[#14532d] border-[1.5px] border-[#16a34a]">
                              Match {loc.relevanceScore}%
                            </span>
                          )}
                        </div>

                        {recceIndex !== -1 && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#bbf7d0] text-[#14532d] border border-[#16a34a] flex items-center gap-0.5 shrink-0">
                            🎬 จุดที่ {recceIndex + 1}
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-black text-slate-900 mb-0.5 line-clamp-1">
                        {loc.name_th}
                      </h3>

                      <p className="text-[11px] font-bold text-slate-500 mb-2">
                        📍 {loc.province} {loc.district ? `• อ.${loc.district}` : ""}
                      </p>

                      {loc.hilight && (
                        <div className="text-[11px] bg-[#f5f3ff] border border-[#ddd6fe] p-2 rounded-lg text-[#4c1d95] font-bold mb-2">
                          ✨ <strong>จุดเด่น:</strong> {loc.hilight}
                        </div>
                      )}

                      {loc.detail && (
                        <div className="mb-2.5 bg-slate-50 border border-slate-200/80 p-2 rounded-lg">
                          <p className={`text-[11px] text-slate-700 font-medium leading-relaxed ${expandedIds[loc.id] ? "" : "line-clamp-2"}`}>
                            {loc.detail}
                          </p>
                          {loc.detail.length > 80 && (
                            <button
                              type="button"
                              onClick={(e) => toggleExpand(loc.id, e)}
                              className="text-[10px] font-bold text-[#7c3aed] hover:text-[#5b21b6] hover:underline mt-1 inline-flex items-center gap-0.5 cursor-pointer"
                            >
                              {expandedIds[loc.id] ? "« ย่อข้อความ" : "อ่านต่อเต็มๆ »"}
                            </button>
                          )}
                        </div>
                      )}

                      {/* Technical Specs */}
                      <div className="space-y-1 text-[11px] text-slate-700 font-medium mb-3">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>GPS: {loc.lat ? `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}` : "ระบุในเขต"}</span>
                        </div>
                        {loc.productionSpecs?.power && (
                          <div className="flex items-center gap-1.5 text-[#0c4a6e]">
                            <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span className="line-clamp-1"><strong>ไฟกองถ่าย:</strong> {loc.productionSpecs.power}</span>
                          </div>
                        )}
                        {loc.tel && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span className="font-mono font-bold text-amber-700">{loc.tel}</span>
                          </div>
                        )}

                        {/* Permit Caution / Host Verified Badge */}
                        {loc.isCustomHost ? (
                          <div className="bg-[#f0fdf4] border border-[#bbf7d0] p-1.5 rounded-lg text-[10px] text-[#14532d] font-semibold flex items-start gap-1 mt-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="line-clamp-2">
                              <strong>สถานะ:</strong> เจ้าของเปิดพื้นที่พร้อมให้กองถ่ายเข้าสำรวจและถ่ายทำได้ทันที
                            </span>
                          </div>
                        ) : (
                          <div className="bg-[#fff1f2] border border-[#fecdd3] p-1.5 rounded-lg text-[10px] text-[#881337] font-semibold flex items-start gap-1 mt-1.5">
                            <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0 mt-0.5" />
                            <span className="line-clamp-2">
                              <strong>การขออนุญาต:</strong> ททท. ไม่ระบุระเบียบ โปรดติดต่อเบอร์ล่วงหน้า
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-2.5 border-t border-slate-200 flex items-center justify-between gap-1.5 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelect(loc);
                          }}
                          className={`btn text-xs px-2.5 py-1 rounded-lg font-black flex items-center gap-1 ${
                            isSelected ? "btn-blue" : "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          <Eye className="w-3 h-3" />
                          {isSelected ? "ชี้เป้า" : "แผนที่"}
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setRagTargetLocation(loc);
                          }}
                          className="btn btn-purple text-xs px-2.5 py-1 rounded-lg font-black flex items-center gap-1"
                          title="เปิด AI RAG วิเคราะห์มุมกล้อง ระเบียบ และถามตอบเจาะลึก"
                        >
                          <Sparkles className="w-3 h-3 text-amber-300" />
                          AI RAG
                        </button>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleScout(loc);
                        }}
                        className={`btn text-xs px-3 py-1 rounded-lg font-black ${
                          isSaved 
                            ? "bg-[#fecdd3] border-[#e11d48] text-[#881337] shadow-[2px_2px_0px_#be123c]" 
                            : "btn-mint"
                        }`}
                      >
                        {isSaved ? "✓ ปักแล้ว" : "+ ปักหมุด"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* === RIGHT COLUMN: Sticky Full-Height Interactive Map === */}
        <div className="lg:col-span-5 xl:col-span-5 2xl:col-span-4 h-full">
          <InteractiveMap
            locations={displayedLocations}
            selectedLocation={selectedLocation}
            scoutingList={scoutingList}
            onSelectLocation={handleSelect}
            onToggleScout={toggleScout}
          />
        </div>

      </div>
      )}

      {/* 🎙️ AI RAG Production Consultant Modal */}
      {ragTargetLocation && (
        <RagModal
          location={ragTargetLocation}
          brief={brief}
          onClose={() => setRagTargetLocation(null)}
        />
      )}
    </div>
  );
}
