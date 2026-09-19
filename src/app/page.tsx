"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { 
  Clapperboard, Search, MapPin, Phone, Clock, AlertTriangle, 
  CheckCircle2, Sparkles, Navigation, Share2, Compass, Film, ExternalLink,
  Sliders, Layers, ShieldCheck, Route, Eye, Home as HomeIcon, Zap, Building2, Mail
} from "lucide-react";

import RagModal from "@/components/RagModal";
import HostPortal from "@/components/HostPortal";
import ProvinceSelector from "@/components/ProvinceSelector";
import { detectProvinceFromText, getProvincesInRegion } from "@/data/provinces";

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
  const [brief, setBrief] = useState("");
  const [province, setProvince] = useState("all");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [scoutingList, setScoutingList] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<any | null>(null);
  const [mapPinSelectedId, setMapPinSelectedId] = useState<string | null>(null);
  const [filterOnlyPinned, setFilterOnlyPinned] = useState(false);
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
      email: "contact@ayutthayavintage.com",
      facebook: "facebook.com/AyutthayaVintageHouse",
      hilight: "✨ สถาปัตยกรรมไม้สักทองโบราณริมแม่น้ำเจ้าพระยา แสงเช้า-เย็นสะท้อนผิวน้ำสวยมาก",
      detail: "เรือนไทยหมู่โบราณ ใต้ถุนโล่ง ลานกว้างริมน้ำ มีท่าเรือส่วนตัว เหมาะกับกองถ่ายละครพีเรียด ซีนดราม่า และมิวสิควิดีโอ พร้อมห้องแต่งตัวติดแอร์",
      isCustomHost: true,
      productionSpecs: {
        rate: "18,000 บาท/คิว (12 ชม.)",
        power: "ไฟบ้าน 30A พร้อมจุดต่อไฟ 3 เฟสริมน้ำ",
        parking: "ลานดินกว้าง จอดรถตู้ 8 คัน รถปั่นไฟ 1 คัน",
        dronePolicy: "อนุญาตบินโดรนถ่ายผิวน้ำและตัวเรือน",
        email: "contact@ayutthayavintage.com",
        facebook: "facebook.com/AyutthayaVintageHouse",
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
      email: "production@rawwarehouse-sp.com",
      facebook: "facebook.com/RawWarehouseStudio",
      hilight: "🔥 กำแพงอิฐเปลือย โครงสร้างเหล็กดิบ แสงส่องทะลุหน้าต่างกระจก เหมาะกับซีนแอ็กชัน",
      detail: "โกดังริมแม่น้ำพื้นที่ 1,200 ตร.ม. โปร่ง ไร้เสากลาง รองรับการแขวนไฟ Rigging และมุมกล้อง Top View เหมาะกับโฆษณาและ MV แฟชั่น",
      isCustomHost: true,
      productionSpecs: {
        rate: "22,000 บาท/คิว (12 ชม.)",
        power: "ไฟฟ้าอุตสาหกรรม 100A รองรับไฟสตูดิโอขนาดใหญ่",
        parking: "ลานคอนกรีตขนาดใหญ่ จอดรถเทรลเลอร์และรถกองถ่ายได้กว่า 20 คัน",
        dronePolicy: "บินโดรนภายในโกดังเพดานสูง 10 เมตรได้",
        email: "production@rawwarehouse-sp.com",
        facebook: "facebook.com/RawWarehouseStudio",
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
    setMapPinSelectedId(loc.id);
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
    setMapPinSelectedId(null);
    setFilterOnlyPinned(false);
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
      const updated = scoutingList.filter((x) => x.id !== item.id);
      setScoutingList(updated);
      if (updated.length === 0) {
        setFilterOnlyPinned(false);
      }
    } else {
      setScoutingList([...scoutingList, item]);
    }
  };

  const handleClearScout = () => {
    if (scoutingList.length === 0) return;
    setScoutingList([]);
    setFilterOnlyPinned(false);
  };

  const handleDeselect = () => {
    setSelectedLocation(null);
    setMapPinSelectedId(null);
  };

  // Card click on the side: toggle selection (if clicking the already selected card, deselect it)
  const handleSelectFromCard = (loc: any) => {
    if (selectedLocation?.id === loc.id) {
      handleDeselect();
    } else {
      setSelectedLocation(loc);
    }
  };

  // Map pin click: highlights and floats that location to index 0
  const handleSelectFromMap = (loc: any) => {
    setSelectedLocation(loc);
    setMapPinSelectedId(loc.id);
  };

  const matchingCustom = customLocations.filter((loc) => {
    if (province !== "all") {
      if (province.startsWith("region:")) {
        const provsInRegion = getProvincesInRegion(province);
        if (!provsInRegion.includes(loc.province)) return false;
      } else if (loc.province !== province) {
        return false;
      }
    }
    if (brief.trim().length > 1) {
      const tokens = brief.toLowerCase().split(/\s+/).filter((t: string) => t.length > 1);
      if (tokens.length === 0) return true;
      const fullText = `${loc.name_th} ${loc.category} ${loc.hilight || ""} ${loc.detail || ""} ${loc.province} ${loc.district || ""}`.toLowerCase();
      return tokens.some((t: string) => fullText.includes(t));
    }
    return true;
  });

  const cardsTopRef = useRef<HTMLDivElement>(null);

  const rawList = filterOnlyPinned
    ? scoutingList
    : activeTab === "search"
    ? [...matchingCustom, ...results]
    : scoutingList;

  // Only float to index 0 when selected specifically from map pin
  const displayedLocations = useMemo(() => {
    if (!mapPinSelectedId) return rawList;
    const foundIdx = rawList.findIndex((l) => l.id === mapPinSelectedId);
    if (foundIdx <= 0) return rawList;
    const selected = rawList[foundIdx];
    const remaining = rawList.filter((_, i) => i !== foundIdx);
    return [selected, ...remaining];
  }, [rawList, mapPinSelectedId]);

  useEffect(() => {
    if (mapPinSelectedId) {
      cardsTopRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [mapPinSelectedId]);

  return (
    <div className="min-h-screen py-4 px-3 sm:px-6 w-full flex flex-col gap-4">
      {/* 🗺️ 1. Top Navbar */}
      <header className="bg-white border-[2.5px] border-[#7c3aed] rounded-[20px] shadow-[4px_4px_0px_#6d28d9] px-4 py-3 sm:px-6 sm:py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-[#ddd6fe] border-2 border-[#7c3aed] rounded-xl px-2.5 py-1 shadow-[2px_2px_0px_#6d28d9] text-xl flex items-center justify-center">
            🗺️
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-[#4c1d95] tracking-tight leading-tight">
              ThaiScout
            </h1>
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
              onClick={() => {
                setActiveTab("search");
                setFilterOnlyPinned(false);
              }}
              className={`btn px-3 py-1.5 rounded-xl text-xs font-black ${
                activeTab === "search" && !filterOnlyPinned ? "btn-blue" : "btn-purple opacity-70 hover:opacity-100"
              }`}
            >
              🔍 ค้นหา ({[...matchingCustom, ...results].length})
            </button>

            <button
              onClick={() => {
                setActiveTab("scout");
                setFilterOnlyPinned(false);
              }}
              className={`btn px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 ${
                activeTab === "scout" && !filterOnlyPinned ? "btn-mint" : "btn-purple opacity-70 hover:opacity-100"
              }`}
            >
              🎬 Recce Board ({scoutingList.length})
            </button>

            {scoutingList.length > 0 && (
              <button
                onClick={handleClearScout}
                className="btn text-xs px-2.5 py-1.5 rounded-xl font-black bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-700 shadow-[2px_2px_0px_#fca5a5] flex items-center gap-1 transition"
                title="ล้างหมุดทั้งหมดในรายการ"
              >
                🗑️ ล้างหมุด ({scoutingList.length})
              </button>
            )}
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
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                ค้นหาโลเคชันถ่ายทำจาก <span className="text-[#0284c7]">Creative Brief</span>
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-slate-700 mt-1">
                พิมพ์บรรยากาศหรืออารมณ์ฉากที่ต้องการ หรือ <strong className="text-slate-900">เลือกดูรายภาค/รายจังหวัดแบบไม่ต้องพิมพ์</strong> ระบบจะดึงพิกัดจริงและปักหมุดบนแผนที่ดาวเทียมทันที
              </p>
            </div>

            {/* Input Box */}
            <div className="bg-[#f8fafc] border-2 border-slate-300 rounded-[18px] p-3.5 focus-within:border-[#0284c7] focus-within:shadow-[3px_3px_0px_#0369a1] transition">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-black text-[#0c4a6e] uppercase font-mono">
                  Brief
                </label>
                {brief && (
                  <button
                    type="button"
                    onClick={() => {
                      setBrief("");
                      handleSearch("", province);
                    }}
                    className="text-xs font-black text-rose-600 hover:text-rose-800 hover:underline cursor-pointer"
                  >
                    ✕ ล้างคำค้นหา (แสดงสถานที่ทั้งหมด)
                  </button>
                )}
              </div>
              <textarea
                rows={2}
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                placeholder="เช่น อยากได้น้ำตกหรือลำธารที่มีโขดหินใหญ่ บรรยากาศดิบๆ ถ่าย MV... (หรือเว้นว่างไว้เพื่อดูทุกสถานที่)"
                className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs sm:text-sm text-slate-900 font-bold placeholder:text-slate-500 focus:outline-none focus:border-[#0284c7] shadow-inner"
              />

              <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between mt-3">
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

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleSearch()}
                    disabled={loading}
                    className="btn btn-yellow w-full sm:w-auto px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm shadow-[2px_2px_0px_#b45309]"
                  >
                    <Search className="w-4 h-4 text-[#78350f]" />
                    {loading ? "กำลังค้นหา..." : "Scouting"}
                  </button>
                </div>
              </div>

              {/* Sample Brief Chips */}
              <div className="mt-3 pt-2.5 border-t border-slate-200 flex flex-wrap gap-1.5 items-center">
                <span className="text-xs font-black text-slate-600 font-mono">Quick Briefs:</span>
                {sampleBriefs.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setBrief(s.text);
                      setProvince(s.prov);
                      handleSearch(s.text, s.prov);
                    }}
                    className="text-xs px-2.5 py-1 rounded-lg bg-white hover:bg-[#fffbeb] text-slate-800 border border-slate-300 hover:border-[#d97706] font-bold transition cursor-pointer shadow-sm"
                  >
                    {s.title}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* System Boundary Bar & Quick Filter Controls */}
          <div className="px-4 py-2.5 bg-[#f0f9ff] border-2 border-[#0284c7] rounded-xl shadow-[3px_3px_0px_#0369a1] text-[#0c4a6e] font-bold text-xs sm:text-sm flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-[#bae6fd] border border-[#0284c7] rounded-lg px-2 py-0.5 text-xs font-black">
                TAT Grounding
              </span>
              <span className="font-semibold text-slate-800 hidden sm:inline">8,628 พิกัดจริงในดาต้าเบส</span>

              {/* Filter only pinned toggle */}
              <button
                onClick={() => {
                  if (scoutingList.length > 0) {
                    setFilterOnlyPinned(!filterOnlyPinned);
                  }
                }}
                disabled={scoutingList.length === 0}
                className={`btn text-xs px-2.5 py-1 rounded-xl font-black flex items-center gap-1.5 transition ${
                  filterOnlyPinned
                    ? "bg-[#f43f5e] border-[#be123c] text-white shadow-[2px_2px_0px_#881337]"
                    : scoutingList.length > 0
                    ? "bg-white border-[#f43f5e] text-[#be123c] hover:bg-rose-50 shadow-[2px_2px_0px_#f43f5e]"
                    : "bg-slate-100 border-slate-300 text-slate-400 cursor-not-allowed opacity-60"
                }`}
                title={scoutingList.length === 0 ? "ยังไม่มีหมุดที่ปักไว้ (กด '+ ปักหมุด' จากการ์ดหรือแผนที่)" : "กรองแสดงเฉพาะจุดที่ปักหมุดไว้"}
              >
                <span>📌 {filterOnlyPinned ? "กำลังดูเฉพาะที่ปักหมุด" : "เลือกเฉพาะที่ปักหมุด"}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${filterOnlyPinned ? "bg-white text-rose-700" : "bg-rose-100 text-rose-800"}`}>
                  {scoutingList.length}
                </span>
              </button>

              {/* Clear pins button */}
              {scoutingList.length > 0 && (
                <button
                  onClick={handleClearScout}
                  className="btn text-xs px-2.5 py-1 rounded-xl font-black bg-white hover:bg-rose-50 border border-rose-300 text-rose-700 shadow-[2px_2px_0px_#fca5a5] flex items-center gap-1 transition"
                  title="ล้างหมุดสำรวจทั้งหมด"
                >
                  <span>🗑️ ล้างหมุด</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {filterOnlyPinned && (
                <button
                  onClick={() => setFilterOnlyPinned(false)}
                  className="text-xs text-[#0284c7] hover:underline font-black"
                >
                  ← ดูทั้งหมด
                </button>
              )}
              <div className="font-mono text-xs sm:text-sm text-[#0284c7] font-black bg-white px-2.5 py-1 rounded-md border border-[#bae6fd]">
                {displayedLocations.length} โลเคชัน
              </div>
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
                {filterOnlyPinned 
                  ? "ยังไม่มีสถานที่ที่ปักหมุดไว้" 
                  : activeTab === "search" 
                  ? "ไม่พบโลเคชันที่ตรงเงื่อนไข" 
                  : "ยังไม่มีสถานที่ใน Recce Board"}
              </p>
              <p className="text-xs font-bold text-slate-500 mt-1 mb-4">
                {filterOnlyPinned
                  ? "กดปุ่ม '+ ปักหมุด' จากการ์ดหรือแผนที่เพื่อเลือกสถานที่เข้าลิสต์"
                  : activeTab === "search" 
                  ? "ลองปรับเปลี่ยนคำค้นหา หรือเลือกจังหวัดอื่นๆ ดูครับ" 
                  : "กดปุ่ม '+ ปักหมุด' ในหน้าค้นหา เพื่อเพิ่มสถานที่สำหรับออกกอง"}
              </p>
              {(activeTab === "scout" || filterOnlyPinned) && (
                <button
                  onClick={() => {
                    setActiveTab("search");
                    setFilterOnlyPinned(false);
                  }}
                  className="btn btn-blue text-xs px-4 py-2 rounded-xl font-black"
                >
                  กลับไปค้นหาโลเคชันทั้งหมด
                </button>
              )}
            </div>
          ) : (
            <>
              <div ref={cardsTopRef} className="scroll-mt-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayedLocations.map((loc) => {
                  const isSaved = scoutingList.some((x) => x.id === loc.id);
                  const isSelected = selectedLocation?.id === loc.id;
                  const recceIndex = scoutingList.findIndex((x) => x.id === loc.id);

                  return (
                    <div
                      key={loc.id}
                      onClick={() => handleSelectFromCard(loc)}
                      className={`rounded-[22px] p-4 sm:p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between border-[3px] ${
                        isSelected
                          ? "bg-gradient-to-br from-rose-50/90 via-white to-amber-50/70 border-[#e11d48] shadow-[6px_6px_0px_#9f1239] ring-4 ring-rose-300 scale-[1.01]"
                          : "bg-white border-[#0284c7] shadow-[3px_3px_0px_#0369a1] hover:translate-x-[-2px] hover:translate-y-[-2px]"
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

                      <h3 className="text-base sm:text-lg font-black text-slate-950 mb-0.5 line-clamp-1">
                        {loc.name_th}
                      </h3>

                      <p className="text-xs sm:text-sm font-bold text-slate-700 mb-2.5 flex items-center gap-1">
                        📍 {loc.province} {loc.district ? `• อ.${loc.district}` : ""}
                      </p>

                      {loc.hilight && (
                        <div className="text-xs sm:text-sm bg-[#f5f3ff] border border-[#ddd6fe] p-2.5 rounded-xl text-[#4c1d95] font-semibold mb-2.5 leading-relaxed">
                          ✨ <strong className="font-black text-[#3b0764]">จุดเด่น:</strong> {loc.hilight}
                        </div>
                      )}

                      {loc.detail && (
                        <div className="mb-3 bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                          <p className={`text-xs sm:text-sm text-slate-800 font-medium leading-relaxed ${expandedIds[loc.id] ? "" : "line-clamp-2"}`}>
                            {loc.detail}
                          </p>
                          {loc.detail.length > 80 && (
                            <button
                              type="button"
                              onClick={(e) => toggleExpand(loc.id, e)}
                              className="text-xs font-black text-[#7c3aed] hover:text-[#5b21b6] hover:underline mt-1.5 inline-flex items-center gap-0.5 cursor-pointer"
                            >
                              {expandedIds[loc.id] ? "« ย่อข้อความ" : "อ่านต่อเต็มๆ »"}
                            </button>
                          )}
                        </div>
                      )}

                      {/* Technical Specs */}
                      <div className="space-y-1.5 text-xs sm:text-sm text-slate-800 font-medium mb-3.5">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="font-semibold">GPS: {loc.lat ? `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}` : "ระบุในเขต"}</span>
                        </div>
                        {loc.productionSpecs?.power && (
                          <div className="flex items-center gap-1.5 text-[#0c4a6e]">
                            <Zap className="w-4 h-4 text-amber-600 shrink-0" />
                            <span className="line-clamp-1"><strong>ไฟกองถ่าย:</strong> {loc.productionSpecs.power}</span>
                          </div>
                        )}
                        {/* Phone */}
                        <div className="flex items-center gap-1.5">
                          <Phone className={`w-4 h-4 shrink-0 ${loc.tel ? "text-amber-600" : "text-slate-400"}`} />
                          <span className="font-bold text-slate-700 text-xs">โทร:</span>
                          {loc.tel ? (
                            <a 
                              href={`tel:${loc.tel.replace(/[^0-9]/g, "")}`}
                              onClick={(e) => e.stopPropagation()}
                              className="font-mono font-bold text-amber-800 hover:underline text-xs"
                              title="คลิกเพื่อโทรออก"
                            >
                              {loc.tel}
                            </a>
                          ) : (
                            <span className="font-mono font-bold text-slate-400 text-xs">-</span>
                          )}
                        </div>

                        {/* Email Contact */}
                        <div className="flex items-center gap-1.5">
                          <Mail className={`w-4 h-4 shrink-0 ${(loc.email || loc.productionSpecs?.email) ? "text-sky-600" : "text-slate-400"}`} />
                          <span className="font-bold text-slate-700 text-xs">อีเมล:</span>
                          {(loc.email || loc.productionSpecs?.email) ? (
                            <a
                              href={`mailto:${loc.email || loc.productionSpecs?.email}?subject=${encodeURIComponent(`ขออนุญาตถ่ายทำภาพยนตร์/โฆษณา: ${loc.name_th} (${loc.province})`)}&body=${encodeURIComponent(`เรียน ผู้ดูแลสถานที่ ${loc.name_th} (${loc.province})\n\nข้าพเจ้าในนามกองถ่าย/ผู้ผลิต มีความประสงค์จะสอบถามขั้นตอนและขออนุญาตใช้สถานที่ถ่ายทำ...\n\nสถานที่: ${loc.name_th}\nจังหวัด: ${loc.province}\n\nจึงเรียนมาเพื่อโปรดพิจารณา`)}`}
                              onClick={(e) => e.stopPropagation()}
                              className="font-mono font-bold text-sky-700 hover:text-sky-950 hover:underline truncate text-xs"
                              title="คลิกเพื่อเปิดอีเมลร่างจดหมายขออนุญาตถ่ายทำ"
                            >
                              {loc.email || loc.productionSpecs?.email}
                            </a>
                          ) : (
                            <span className="font-mono font-bold text-slate-400 text-xs">-</span>
                          )}
                        </div>

                        {/* Facebook Page */}
                        <div className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-[#1877F2] shrink-0 fill-current" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                          <a
                            href={
                              loc.facebook?.startsWith("http")
                                ? loc.facebook
                                : loc.facebook
                                ? `https://${loc.facebook}`
                                : loc.productionSpecs?.facebook?.startsWith("http")
                                ? loc.productionSpecs.facebook
                                : loc.productionSpecs?.facebook
                                ? `https://${loc.productionSpecs.facebook}`
                                : `https://www.facebook.com/search/top?q=${encodeURIComponent(loc.name_th + ' ' + loc.province)}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="font-bold text-[#1877F2] hover:text-blue-900 hover:underline flex items-center gap-1 truncate"
                            title="คลิกเพื่อเปิดเพจ Facebook ของสถานที่"
                          >
                            <span>{loc.facebook || loc.productionSpecs?.facebook || `Facebook: เพจ ${loc.name_th} ↗`}</span>
                          </a>
                        </div>

                        {/* Permit Caution / Host Verified Badge */}
                        {loc.isCustomHost ? (
                          <div className="bg-[#f0fdf4] border border-[#bbf7d0] p-2 rounded-xl text-xs text-[#14532d] font-bold flex items-start gap-1.5 mt-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="line-clamp-2">
                              <strong>สถานะ:</strong> เจ้าของเปิดพื้นที่พร้อมให้กองถ่ายเข้าสำรวจและถ่ายทำได้ทันที
                            </span>
                          </div>
                        ) : (
                          <div className="bg-[#fff1f2] border border-[#fecdd3] p-2 rounded-xl text-xs text-[#881337] font-semibold flex items-start gap-1.5 mt-2">
                            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                            <span className="line-clamp-2">
                              <strong className="font-black text-rose-900">การขออนุญาต:</strong> ททท. ไม่ระบุระเบียบ โปรดติดต่อเบอร์ล่วงหน้า
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectFromCard(loc);
                          }}
                          className={`btn text-xs sm:text-sm px-3 py-1.5 rounded-xl font-black flex items-center gap-1.5 ${
                            isSelected ? "btn-blue" : "bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200"
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          {isSelected ? "กำลังชี้เป้า" : "ดูบนแผนที่"}
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setRagTargetLocation(loc);
                          }}
                          className="btn btn-purple text-xs sm:text-sm px-3 py-1.5 rounded-xl font-black flex items-center gap-1.5 shadow-[2px_2px_0px_#6d28d9]"
                          title="เปิด AI RAG วิเคราะห์มุมกล้อง ระเบียบ และถามตอบเจาะลึก"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          AI RAG
                        </button>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleScout(loc);
                        }}
                        className={`btn text-xs sm:text-sm px-3.5 py-1.5 rounded-xl font-black ${
                          isSaved 
                            ? "bg-[#fecdd3] border-[#e11d48] text-[#881337] shadow-[2px_2px_0px_#be123c]" 
                            : "btn-mint shadow-[2px_2px_0px_#15803d]"
                        }`}
                      >
                        {isSaved ? "✓ ปักแล้ว" : "+ ปักหมุด"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            </>
          )}

        </div>

        {/* === RIGHT COLUMN: Sticky Full-Height Interactive Map === */}
        <div className="lg:col-span-5 xl:col-span-5 2xl:col-span-4 h-full">
          <InteractiveMap
            locations={displayedLocations}
            selectedLocation={selectedLocation}
            scoutingList={scoutingList}
            onSelectLocation={handleSelectFromMap}
            onDeselect={handleDeselect}
            onToggleScout={toggleScout}
            onClearScout={handleClearScout}
            filterOnlyPinned={filterOnlyPinned}
            onToggleFilterOnlyPinned={() => {
              if (scoutingList.length > 0) {
                setFilterOnlyPinned(!filterOnlyPinned);
              }
            }}
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
