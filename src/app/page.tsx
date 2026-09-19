"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { 
  Clapperboard, Search, MapPin, Phone, Clock, AlertTriangle, 
  CheckCircle2, Sparkles, Navigation, Share2, Compass, Film, ExternalLink,
  Sliders, Layers, ShieldCheck, Route, Eye, Home as HomeIcon, Zap, Building2, Mail,
  Folder, FolderPlus, FolderOpen, Bookmark
} from "lucide-react";

import RagModal from "@/components/RagModal";
import SocialReviewsModal from "@/components/SocialReviewsModal";
import ProvinceSelector from "@/components/ProvinceSelector";
import CollectionsModal, { Collection } from "@/components/CollectionsModal";
import AddToCollectionModal from "@/components/AddToCollectionModal";
import { detectProvinceFromText, getProvincesInRegion, REGION_LIST } from "@/data/provinces";

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
  const [collections, setCollections] = useState<Collection[]>([
    {
      id: "default",
      name: "📌 รายการปักหมุดหลัก",
      description: "สถานที่ทั้งหมดที่ปักหมุดไว้",
      createdAt: new Date().toISOString(),
      locations: [],
    },
  ]);
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);
  const [isCollectionsModalOpen, setIsCollectionsModalOpen] = useState(false);
  const [addToCollectionTarget, setAddToCollectionTarget] = useState<any | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<any | null>(null);
  const [mapPinSelectedId, setMapPinSelectedId] = useState<string | null>(null);
  const [filterOnlyPinned, setFilterOnlyPinned] = useState(false);
  const [ragTargetLocation, setRagTargetLocation] = useState<any | null>(null);
  const [socialModalLocation, setSocialModalLocation] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<"search" | "scout">("search");
  const [totalDbMatches, setTotalDbMatches] = useState<number>(8628);
  const [currentLimit, setCurrentLimit] = useState<number>(400);
  const [filterRegion, setFilterRegion] = useState<string>("ทั้งหมด");
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [geminiAnalysis, setGeminiAnalysis] = useState<any>(null);

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

  const handleSearch = async (targetBrief = brief, targetProv = province, limitToFetch?: number) => {
    setLoading(true);
    // When scouting/searching, clear active selection so the map shows the entire overview
    setSelectedLocation(null);

    // Auto-detect province if brief contains province name/alias
    let provToSend = targetProv;
    if (targetProv === "all" && targetBrief.trim().length > 0) {
      const detected = detectProvinceFromText(targetBrief);
      if (detected.detectedProvince) {
        provToSend = detected.detectedProvince;
      }
    }

    try {
      const res = await fetch("/api/scout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brief: targetBrief,
          province: provToSend,
          limit: limitToFetch,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResults(data.locations);
        if (data.totalMatches) {
          setTotalDbMatches(data.totalMatches);
        }
        setGeminiAnalysis(data.geminiAnalysis || null);
        // Keep selectedLocation null so the map frames all pins without flying into any random pin
        setSelectedLocation(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    const nextLimit = currentLimit + 200;
    setCurrentLimit(nextLimit);
    handleSearch(brief, province, nextLimit);
  };

  useEffect(() => {
    handleSearch();
  }, []);

  // โหลดรายการปักหมุดและ Collections ที่เคยเซฟไว้จาก localStorage เมื่อเปิดเว็บ
  useEffect(() => {
    try {
      const savedPins = localStorage.getItem("thaiscout_saved_locations");
      if (savedPins) {
        const parsed = JSON.parse(savedPins);
        if (Array.isArray(parsed)) {
          setScoutingList(parsed);
        }
      }

      const savedCollections = localStorage.getItem("thaiscout_collections");
      if (savedCollections) {
        const parsedCols = JSON.parse(savedCollections);
        if (Array.isArray(parsedCols) && parsedCols.length > 0) {
          setCollections(parsedCols);
        }
      }
    } catch (e) {
      console.error("Failed to load saved collections:", e);
    }
  }, []);

  // บันทึก Collections ลง localStorage
  const saveCollectionsToStorage = (newCols: Collection[]) => {
    try {
      localStorage.setItem("thaiscout_collections", JSON.stringify(newCols));
    } catch (e) {
      console.error("Failed to save collections to storage:", e);
    }
  };

  // บันทึกรายการปักหมุดลง localStorage
  const saveToStorage = (newList: any[]) => {
    try {
      localStorage.setItem("thaiscout_saved_locations", JSON.stringify(newList));
    } catch (e) {
      console.error("Failed to save scouting locations to storage:", e);
    }
  };

  const handleCreateCollection = (name: string, description?: string) => {
    const newCol: Collection = {
      id: "col_" + Date.now(),
      name,
      description,
      createdAt: new Date().toISOString(),
      locations: [],
    };
    const updated = [...collections, newCol];
    setCollections(updated);
    saveCollectionsToStorage(updated);
    return newCol.id;
  };

  const handleDeleteCollection = (colId: string) => {
    if (colId === "default") return;
    const updated = collections.filter((c) => c.id !== colId);
    setCollections(updated);
    saveCollectionsToStorage(updated);
    if (activeCollectionId === colId) {
      setActiveCollectionId(null);
    }
  };

  const handleToggleLocationInCollection = (colId: string, location: any) => {
    const updated = collections.map((col) => {
      if (col.id === colId) {
        const exists = col.locations.some((l) => l.id === location.id);
        const newLocs = exists
          ? col.locations.filter((l) => l.id !== location.id)
          : [...col.locations, location];
        return { ...col, locations: newLocs };
      }
      return col;
    });
    setCollections(updated);
    saveCollectionsToStorage(updated);

    // Also ensure it syncs with general scouting list
    if (!scoutingList.some((x) => x.id === location.id)) {
      const newPins = [...scoutingList, location];
      setScoutingList(newPins);
      saveToStorage(newPins);
    }
  };

  const handleRemoveLocationFromCollection = (colId: string, locId: string) => {
    const updated = collections.map((col) => {
      if (col.id === colId) {
        return { ...col, locations: col.locations.filter((l) => l.id !== locId) };
      }
      return col;
    });
    setCollections(updated);
    saveCollectionsToStorage(updated);
  };

  const toggleScout = (item: any) => {
    if (scoutingList.find((x) => x.id === item.id)) {
      const updated = scoutingList.filter((x) => x.id !== item.id);
      setScoutingList(updated);
      saveToStorage(updated);
      if (updated.length === 0) {
        setFilterOnlyPinned(false);
      }
    } else {
      const updated = [...scoutingList, item];
      setScoutingList(updated);
      saveToStorage(updated);
      // Auto add to default collection as well
      const updatedCols = collections.map((col) => {
        if (col.id === "default" && !col.locations.some((l) => l.id === item.id)) {
          return { ...col, locations: [...col.locations, item] };
        }
        return col;
      });
      setCollections(updatedCols);
      saveCollectionsToStorage(updatedCols);
    }
  };

  const handleClearScout = () => {
    if (scoutingList.length === 0) return;
    if (confirm("คุณต้องการล้างรายการสถานที่ที่เซฟปักหมุดไว้ทั้งหมดใช่หรือไม่?")) {
      setScoutingList([]);
      saveToStorage([]);
      setFilterOnlyPinned(false);
    }
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

  const cardsTopRef = useRef<HTMLDivElement>(null);

  const rawList = activeCollectionId
    ? (collections.find((c) => c.id === activeCollectionId)?.locations || [])
    : filterOnlyPinned
    ? scoutingList
    : activeTab === "search"
    ? results
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
      <header className="bg-white border-[2.5px] border-[#285185] rounded-[20px] shadow-[4px_4px_0px_#183354] px-4 py-3 sm:px-6 sm:py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-[#ccd9e2] border-2 border-[#285185] rounded-xl px-2.5 py-1 shadow-[2px_2px_0px_#183354] text-xl flex items-center justify-center">
            🗺️
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-[#1b3558] tracking-tight leading-tight flex items-center gap-2">
              ThaiScout
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#fcd9bd] text-[#7c2d12] border border-[#d67940]">
                Creative Recce
              </span>
            </h1>
          </div>
        </div>

        {/* Actions & Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* ปุ่มเปิดคลังเซฟ Collections */}
          <button
            onClick={() => setIsCollectionsModalOpen(true)}
            className="btn px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-black bg-[#285185] hover:bg-[#1b3558] text-white flex items-center gap-1.5 shadow-[2px_2px_0px_#183354] transition"
            title="เปิดดูและจัดการกล่องเซฟโลเคชันทั้งหมด"
          >
            <Folder className="w-4 h-4 text-sky-300" />
            <span>คลังเซฟ (Collections)</span>
            <span className="bg-white/20 text-white text-[11px] px-1.5 py-0.2 rounded-full font-mono">
              {collections.reduce((sum, c) => sum + c.locations.length, 0)}
            </span>
          </button>

          <div className="bg-[#f0f5f8] border-2 border-[#ccd9e2] px-3.5 py-1.5 rounded-xl text-xs font-black text-[#1b3558] flex items-center gap-1.5 shadow-[2px_2px_0px_#285185]">
            <span>🏛️ ฐานข้อมูล ททท. 8,628 พิกัด (Ground Truth 100%)</span>
          </div>
        </div>

      </header>

      {/* Main Scout & Recce Board */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start w-full">
        
        {/* === LEFT COLUMN: Brief Console & Multi-Column Results Grid === */}
        <div className="lg:col-span-7 xl:col-span-7 2xl:col-span-8 flex flex-col gap-4">
          
          {/* Creative Brief Console (Travel Flatlay Palette: Navy, Sky, Leather Amber) */}
          <div className="bg-white border-[2.5px] border-[#285185] rounded-[22px] shadow-[4px_4px_0px_#183354] p-4 sm:p-5 flex flex-col gap-3">
            
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="bg-[#ccd9e2] border border-[#285185] rounded-lg px-2.5 py-0.5 text-xs font-black text-[#1b3558] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#d67940]" />
                  Creative Brief Console
                </span>
                <span className="text-xs font-bold text-slate-500 hidden sm:inline">
                  Bounded AI Agent · FTS Grounding
                </span>
              </div>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                ค้นหาโลเคชันถ่ายทำจาก <span className="text-[#285185]">Creative Brief</span>
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-slate-700 mt-1">
                พิมพ์บรรยากาศหรืออารมณ์ฉากที่ต้องการ หรือ <strong className="text-slate-900">เลือกดูรายภาค/รายจังหวัดแบบไม่ต้องพิมพ์</strong> ระบบจะดึงพิกัดจริงและปักหมุดบนแผนที่ดาวเทียมทันที
              </p>
            </div>

            {/* Input Box */}
            <div className="bg-[#f0f5f8] border-2 border-[#ccd9e2] rounded-[18px] p-3.5 focus-within:border-[#285185] focus-within:shadow-[3px_3px_0px_#183354] transition">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-black text-[#1b3558] uppercase font-mono">
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

              {/* Region Buttons — แถวปุ่มเลือกภาค */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {/* ปุ่มทุกภาค (default) */}
                <button
                  type="button"
                  onClick={() => {
                    setFilterRegion("ทั้งหมด");
                    setProvince("all");
                    handleSearch(brief, "all");
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black transition-all border ${
                    filterRegion === "ทั้งหมด"
                      ? "bg-[#0284c7] text-white border-[#0369a1] shadow-[1px_1px_0px_#0369a1]"
                      : "bg-white text-slate-700 border-slate-300 hover:border-[#0284c7] hover:text-[#0284c7]"
                  }`}
                >
                  <span>🌐</span>
                  <span>ทุกภาค</span>
                  <span className={`text-[10px] ${filterRegion === "ทั้งหมด" ? "text-sky-200" : "text-slate-400"}`}>(77)</span>
                </button>

                {/* ปุ่มแต่ละภาค */}
                {REGION_LIST.filter((r) => r.id !== "all").map((reg) => {
                  const regionKey = reg.id.replace("region:", "");
                  const isActive = filterRegion === regionKey;
                  return (
                    <button
                      key={reg.id}
                      type="button"
                      onClick={() => {
                        setFilterRegion(regionKey);
                        const targetProv = "region:" + regionKey;
                        setProvince(targetProv);
                        handleSearch(brief, targetProv);
                      }}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black transition-all border ${
                        isActive
                          ? "bg-[#0284c7] text-white border-[#0369a1] shadow-[1px_1px_0px_#0369a1]"
                          : "bg-white text-slate-700 border-slate-300 hover:border-[#0284c7] hover:text-[#0284c7]"
                      }`}
                    >
                      <span>{reg.icon}</span>
                      <span>
                        {reg.name === "ภาคอีสาน (ตะวันออกเฉียงเหนือ)"
                          ? "อีสาน"
                          : reg.name.replace("ภาค", "")}
                      </span>
                      <span className={`text-[10px] ${isActive ? "text-sky-200" : "text-slate-400"}`}>
                        ({reg.count})
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between mt-3">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <ProvinceSelector
                    value={province}
                    onChange={(newProv) => {
                      setProvince(newProv);
                      handleSearch(brief, newProv);
                    }}
                    allowAll={true}
                    filterRegion={filterRegion}
                    onFilterRegionChange={setFilterRegion}
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

          {/* 🎯 Toolbar เหนือการ์ด: สองกล่องหลัก ค้นหาทั้งหมด & ที่ปักหมุดไว้ (ภาษาไทย ชัดเจน) */}
          <div className="px-3.5 py-2.5 bg-white border-[2.5px] border-[#0284c7] rounded-[20px] shadow-[4px_4px_0px_#0369a1] flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              {/* กล่องที่ 1: ค้นหาทั้งหมด */}
              <button
                onClick={() => {
                  setActiveTab("search");
                  setFilterOnlyPinned(false);
                }}
                className={`btn px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition ${
                  activeTab === "search" && !filterOnlyPinned
                    ? "btn-blue shadow-[2px_2px_0px_#0369a1]"
                    : "bg-slate-100 border-2 border-slate-300 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <Search className="w-4 h-4" />
                <span>ค้นหาทั้งหมด</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
                  activeTab === "search" && !filterOnlyPinned
                    ? "bg-white/30 text-white"
                    : "bg-slate-200 text-slate-800"
                }`}>
                  {results.length}
                </span>
              </button>

              {/* กล่องที่ 2: ที่เซฟ/ปักหมุดไว้ (Saved / Scouting List) */}
              <button
                onClick={() => {
                  setActiveCollectionId(null);
                  setActiveTab("scout");
                  setFilterOnlyPinned(true);
                }}
                className={`btn px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition ${
                  (activeTab === "scout" || filterOnlyPinned) && !activeCollectionId
                    ? "btn-mint shadow-[2px_2px_0px_#15803d]"
                    : scoutingList.length > 0
                    ? "bg-white border-2 border-emerald-500 text-emerald-800 hover:bg-emerald-50 shadow-[2px_2px_0px_#15803d]"
                    : "bg-slate-100 border-2 border-slate-300 text-slate-400 opacity-60"
                }`}
              >
                <span>📌 ที่ปักหมุดไว้ ({scoutingList.length})</span>
                {scoutingList.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                )}
              </button>

              {/* กล่องที่ 3: เปิดดูคลัง Collections */}
              <button
                onClick={() => setIsCollectionsModalOpen(true)}
                className={`btn px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition ${
                  activeCollectionId
                    ? "bg-[#285185] text-white shadow-[2px_2px_0px_#183354]"
                    : "bg-white border-2 border-[#285185] text-[#285185] hover:bg-[#f0f5f8] shadow-[2px_2px_0px_#183354]"
                }`}
              >
                <Folder className="w-4 h-4 text-amber-500 fill-amber-500/30" />
                <span>
                  {activeCollectionId
                    ? `📁 กล่อง: ${collections.find((c) => c.id === activeCollectionId)?.name}`
                    : `📁 จัดการคลังเซฟ (${collections.length})`}
                </span>
              </button>

              {/* ปุ่มล้างหมุด / ยกเลิกฟิลเตอร์กล่อง */}
              {activeCollectionId ? (
                <button
                  onClick={() => setActiveCollectionId(null)}
                  className="btn text-xs px-2.5 py-1.5 rounded-xl font-black bg-slate-100 hover:bg-slate-200 border-2 border-slate-300 text-slate-700 transition"
                  title="ดูทุกรายการปักหมุด"
                >
                  ✕ ดูทั้งหมด
                </button>
              ) : scoutingList.length > 0 && (
                <button
                  onClick={handleClearScout}
                  className="btn text-xs px-2.5 py-1.5 rounded-xl font-black bg-rose-50 hover:bg-rose-100 border-2 border-rose-300 text-rose-700 shadow-[2px_2px_0px_#fca5a5] flex items-center gap-1 transition"
                  title="ล้างสถานที่ที่เซฟไว้ทั้งหมด"
                >
                  <span>🗑️ ล้างที่เซฟไว้</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 hidden sm:inline">
                {province !== "all" && !province.startsWith("region:") 
                  ? `ครบทุกพิกัดใน ${province}` 
                  : `ฐานข้อมูล ททท. ${totalDbMatches.toLocaleString()} พิกัด`}
              </span>
              <div className="font-mono text-xs sm:text-sm text-[#0284c7] font-black bg-[#f0f9ff] px-2.5 py-1 rounded-lg border border-[#bae6fd]">
                แสดง {displayedLocations.length} โลเคชัน
              </div>
            </div>
          </div>

          {/* Gemini AI Scouting Agent Card */}
          {geminiAnalysis && (
            <div className="bg-gradient-to-r from-sky-50 via-indigo-50 to-purple-50 border-[2.5px] border-indigo-300 rounded-[20px] p-4 shadow-[4px_4px_0px_#818cf8] mb-4">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-600 text-white font-black text-xs shadow-sm">
                    ✨
                  </span>
                  <span className="font-black text-sm text-indigo-950">Gemini 3.5 Flash Lite Creative Scouting Agent</span>
                  <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                    AI Deconstructed
                  </span>
                </div>
              </div>

              {geminiAnalysis.mood && (
                <div className="text-xs font-bold text-slate-800 mb-1.5 flex items-start gap-1.5">
                  <span className="text-indigo-600 font-extrabold shrink-0">🎬 Mood & Tone:</span>
                  <span>{geminiAnalysis.mood}</span>
                </div>
              )}

              {geminiAnalysis.directorTip && (
                <div className="text-xs font-bold text-slate-700 mb-2.5 flex items-start gap-1.5">
                  <span className="text-amber-600 font-extrabold shrink-0">💡 คำแนะนำผู้กำกับ:</span>
                  <span>{geminiAnalysis.directorTip}</span>
                </div>
              )}

              {geminiAnalysis.expandedKeywords && geminiAnalysis.expandedKeywords.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-indigo-100">
                  <span className="text-[11px] font-bold text-indigo-600 mr-1">🔍 คีย์เวิร์ดภูมิประเทศที่ AI ถอดรหัส:</span>
                  {geminiAnalysis.expandedKeywords.map((kw: string, i: number) => (
                    <span key={i} className="text-[11px] font-black px-2 py-0.5 bg-white text-indigo-700 border border-indigo-200 rounded-md shadow-xs">
                      #{kw}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

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
                {activeCollectionId
                  ? `ยังไม่มีสถานที่ในกล่อง "${collections.find((c) => c.id === activeCollectionId)?.name}"`
                  : filterOnlyPinned 
                  ? "ยังไม่มีสถานที่ที่ปักหมุดไว้" 
                  : activeTab === "search" 
                  ? "ไม่พบโลเคชันที่ตรงเงื่อนไข" 
                  : "ยังไม่มีสถานที่ใน Recce Board"}
              </p>
              <p className="text-xs font-bold text-slate-500 mt-1 mb-4">
                {activeCollectionId
                  ? "กดปุ่ม 'เซฟเข้ากล่อง' จากการ์ดเพื่อนำสถานที่เข้ามาจัดเก็บในกล่องนี้"
                  : filterOnlyPinned
                  ? "กดปุ่ม '+ ปักหมุด' จากการ์ดหรือแผนที่เพื่อเลือกสถานที่เข้าลิสต์"
                  : activeTab === "search" 
                  ? "ลองปรับเปลี่ยนคำค้นหา หรือเลือกจังหวัดอื่นๆ ดูครับ" 
                  : "กดปุ่ม '+ ปักหมุด' ในหน้าค้นหา เพื่อเพิ่มสถานที่สำหรับออกกอง"}
              </p>
              {(activeTab === "scout" || filterOnlyPinned || activeCollectionId) && (
                <button
                  onClick={() => {
                    setActiveCollectionId(null);
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
                          ? "bg-gradient-to-br from-amber-50/90 via-white to-sky-50/70 border-[#d67940] shadow-[6px_6px_0px_#a8521d] ring-4 ring-amber-200 scale-[1.01]"
                          : "bg-white border-[#285185] shadow-[3px_3px_0px_#183354] hover:translate-x-[-2px] hover:translate-y-[-2px]"
                      }`}
                    >
                      <div>
                        {/* Top Badges */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-[#ccd9e2] text-[#1b3558] border-[1.5px] border-[#285185]">
                            {loc.category || "สถานที่ท่องเที่ยว"}
                          </span>

                          {loc.relevanceScore && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#fdf3eb] text-[#a8521d] border-[1.5px] border-[#d67940]">
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
                        <div className="text-xs sm:text-sm bg-[#fff7ed] border border-[#fcd9bd] p-2.5 rounded-xl text-[#7c2d12] font-semibold mb-2.5 leading-relaxed">
                          ✨ <strong className="font-black text-[#431407]">จุดเด่น:</strong> {loc.hilight}
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
                          <svg
                            className="w-4 h-4 text-[#1877F2] shrink-0 fill-current"
                            style={{ width: "16px", height: "16px", maxWidth: "16px", maxHeight: "16px", flexShrink: 0 }}
                            viewBox="0 0 24 24"
                          >
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                          <a
                            href={`https://www.facebook.com/search/top?q=${encodeURIComponent(loc.name_th + ' ' + loc.province)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="font-bold text-[#1877F2] hover:text-blue-900 hover:underline flex items-center gap-1 truncate"
                            title="ค้นหาเพจ Facebook ของสถานที่"
                          >
                            <span>Facebook: เพจ {loc.name_th} ↗</span>
                          </a>
                        </div>

                        {/* Permit Caution Badge */}
                        <div className="bg-[#fff1f2] border border-[#fecdd3] p-2 rounded-xl text-xs text-[#881337] font-semibold flex items-start gap-1.5 mt-2">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">
                            <strong className="font-black text-rose-900">การขออนุญาต:</strong> ฐานข้อมูล ททท. ไม่ระบุระเบียบค่าธรรมเนียม โปรดโทรติดต่อเบอร์ทางการล่วงหน้า
                          </span>
                        </div>
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
                          className="btn bg-[#f0f5f8] border-2 border-[#285185] text-[#1b3558] hover:bg-[#ccd9e2] text-xs sm:text-sm px-3 py-1.5 rounded-xl font-black flex items-center gap-1.5 shadow-[2px_2px_0px_#183354]"
                          title="เปิด AI RAG วิเคราะห์มุมกล้อง ระเบียบ และถามตอบเจาะลึก"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-[#d67940]" />
                          AI RAG
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSocialModalLocation(loc);
                          }}
                          className="btn bg-[#fff7ed] hover:bg-[#ffedd5] border-2 border-[#ea580c] text-[#9a3412] text-xs sm:text-sm px-3 py-1.5 rounded-xl font-black flex items-center gap-1.5 shadow-[2px_2px_0px_#c2410c]"
                          title="ดูรูปภาพจริงจาก Google Maps และคลิปสำรวจสถานที่"
                        >
                          <span>📸 รูป Google Maps</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setAddToCollectionTarget(loc);
                          }}
                          className="btn text-xs sm:text-sm px-2.5 py-1.5 rounded-xl font-black bg-[#f0f5f8] border-2 border-[#285185] text-[#1b3558] hover:bg-[#ccd9e2] shadow-[2px_2px_0px_#183354] flex items-center gap-1"
                          title="บันทึกเข้ากล่อง Collection"
                        >
                          <FolderPlus className="w-3.5 h-3.5 text-[#285185]" />
                          <span className="hidden sm:inline">เข้ากล่อง</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleScout(loc);
                          }}
                          className={`btn text-xs sm:text-sm px-3.5 py-1.5 rounded-xl font-black ${
                            isSaved 
                              ? "bg-[#edd8d8] border-[#6f4849] text-[#4a2829] shadow-[2px_2px_0px_#4d2f30]" 
                              : "bg-[#285185] hover:bg-[#1b3558] border-2 border-[#183354] text-white shadow-[2px_2px_0px_#183354]"
                          }`}
                        >
                          {isSaved ? "✓ ปักแล้ว" : "+ ปักหมุด"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Load More Button */}
            {displayedLocations.length < totalDbMatches && activeTab === "search" && !filterOnlyPinned && (
              <div className="text-center py-6">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="btn btn-blue text-xs sm:text-sm px-6 py-2.5 rounded-xl font-black shadow-[3px_3px_0px_#0369a1] hover:scale-[1.02] active:scale-95 transition"
                >
                  {loading ? "กำลังค้นหาและดึงข้อมูล..." : `+ โหลดโลเคชันเพิ่มอีก (+200) (จากทั้งหมด ${totalDbMatches.toLocaleString()} พิกัด)`}
                </button>
              </div>
            )}
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
            onOpenRag={(loc) => setRagTargetLocation(loc)}
            onOpenSocial={(loc) => setSocialModalLocation(loc)}
          />
        </div>

      </div>

      {/* 🎙️ AI RAG Production Consultant Modal */}
      {ragTargetLocation && (
        <RagModal
          location={ragTargetLocation}
          brief={brief}
          isPinned={scoutingList.some((x) => x.id === ragTargetLocation.id)}
          onToggleScout={toggleScout}
          onClose={() => setRagTargetLocation(null)}
        />
      )}

      {/* 📸 Google Maps Place Photos & Reviews Modal */}
      {socialModalLocation && (
        <SocialReviewsModal
          location={socialModalLocation}
          onClose={() => setSocialModalLocation(null)}
        />
      )}

      {/* 📁 คลังเซฟ Collections Modal */}
      <CollectionsModal
        isOpen={isCollectionsModalOpen}
        onClose={() => setIsCollectionsModalOpen(false)}
        collections={collections}
        activeCollectionId={activeCollectionId}
        onSelectCollection={(colId) => {
          setActiveCollectionId(colId);
          setActiveTab("scout");
          setFilterOnlyPinned(false);
        }}
        onCreateCollection={handleCreateCollection}
        onDeleteCollection={handleDeleteCollection}
        onRemoveLocationFromCollection={handleRemoveLocationFromCollection}
        onSelectLocationOnMap={(loc) => {
          handleSelectFromMap(loc);
        }}
      />

      {/* 📥 บันทึกเข้ากล่อง AddToCollectionModal */}
      {addToCollectionTarget && (
        <AddToCollectionModal
          isOpen={!!addToCollectionTarget}
          onClose={() => setAddToCollectionTarget(null)}
          location={addToCollectionTarget}
          collections={collections}
          onToggleLocationInCollection={handleToggleLocationInCollection}
          onCreateCollection={handleCreateCollection}
        />
      )}
    </div>
  );
}
