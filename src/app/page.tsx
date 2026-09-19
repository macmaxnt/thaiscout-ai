"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { 
  Search, MapPin, Sparkles, Navigation, Layers, CheckCircle2, 
  ExternalLink, PanelLeftClose, PanelLeft, Folder, Bookmark, Pin,
  LogOut, User, Building2, ChevronRight, X, Phone, Clock, Compass,
  Edit3, Trash2, Check, GripVertical, ChevronUp, ChevronDown
} from "lucide-react";

import RagModal from "@/components/RagModal";
import SocialReviewsModal from "@/components/SocialReviewsModal";
import CollectionsModal, { Collection } from "@/components/CollectionsModal";
import AddToCollectionModal from "@/components/AddToCollectionModal";
import LoginView from "@/components/LoginView";
import { 
  detectProvinceFromText, 
  getProvincesInRegion, 
  REGION_LIST, 
  THAI_PROVINCES, 
  searchProvinces 
} from "@/data/provinces";
import { MockUser, getCurrentSession, setCurrentSession } from "@/utils/mockAuth";

// Dynamic import for Leaflet map (client-only)
const InteractiveMap = dynamic(() => import("@/components/InteractiveMap"), {
  ssr: false,
  loading: () => (
    <div className="bg-white border-2 border-[#285185] rounded-2xl h-[550px] flex flex-col items-center justify-center p-6 text-center shadow-[4px_4px_0px_#183354]">
      <div className="w-10 h-10 border-4 border-[#285185] border-t-transparent rounded-full animate-spin mb-3"></div>
      <p className="font-bold text-slate-800 text-sm">กำลังโหลดแผนที่ดาวเทียม / พิกัดกองถ่าย...</p>
      <p className="text-xs font-semibold text-slate-500 mt-1">Grounded with OpenStreetMap & TAT Coordinates</p>
    </div>
  ),
});

// Smart Highlight component: accurately detects whether 3-line clamp is actually truncated using DOM scrollHeight
function HighlightBox({
  text,
  isExpanded,
  onToggleExpand,
}: {
  text: string;
  isExpanded: boolean;
  onToggleExpand: (e: React.MouseEvent) => void;
}) {
  const textRef = useRef<HTMLDivElement>(null);
  const [isClamped, setIsClamped] = useState(false);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;

    // Check if text is overflowing its visible height when clamped
    const checkOverflow = () => {
      if (!isExpanded) {
        // el.scrollHeight > el.clientHeight with 1px buffer indicates actual truncation
        setIsClamped(el.scrollHeight > el.clientHeight + 1);
      }
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [text, isExpanded]);

  return (
    <div className="text-xs text-slate-700 bg-[#f8fafc] p-2.5 rounded-xl border border-slate-200 leading-relaxed mb-2.5 font-normal">
      <div
        ref={textRef}
        className={isExpanded ? "" : "line-clamp-3 overflow-hidden"}
      >
        <span className="text-[#d67940] font-black mr-1 text-[11px]">✨ ไฮไลท์:</span>
        {text}
      </div>
      {(isClamped || isExpanded) && (
        <button
          type="button"
          onClick={onToggleExpand}
          className="text-[11px] font-black text-[#285185] hover:text-[#d67940] hover:underline mt-1.5 flex items-center gap-0.5 cursor-pointer"
        >
          {isExpanded ? "▲ ย่อเนื้อหา" : "▼ ดูเพิ่มเติม..."}
        </button>
      )}
    </div>
  );
}

export default function Home() {
  // Authentication session state
  const [currentUser, setCurrentUser] = useState<MockUser | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Sidebar toggle state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Search & Filters state
  const [brief, setBrief] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("ทั้งหมด");
  const [selectedProvince, setSelectedProvince] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [scoutingList, setScoutingList] = useState<any[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);
  const [isEditingActiveColName, setIsEditingActiveColName] = useState(false);
  const [editingActiveColName, setEditingActiveColName] = useState("");
  const [isCollectionsModalOpen, setIsCollectionsModalOpen] = useState(false);
  const [addToCollectionTarget, setAddToCollectionTarget] = useState<any | null>(null);

  // Map and Selection state
  const [selectedLocation, setSelectedLocation] = useState<any | null>(null);
  const [mapPinSelectedId, setMapPinSelectedId] = useState<string | null>(null);
  const [filterOnlyPinned, setFilterOnlyPinned] = useState(false);
  const [ragTargetLocation, setRagTargetLocation] = useState<any | null>(null);
  const [socialModalLocation, setSocialModalLocation] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<"search" | "scout" | "collection">("search");
  const [totalDbMatches, setTotalDbMatches] = useState<number>(8628);
  const [currentLimit, setCurrentLimit] = useState<number>(400);
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [geminiAnalysis, setGeminiAnalysis] = useState<any>(null);

  // Card Drag & Drop state (for reordering in collection or pinned workspace)
  const [cardDraggedIndex, setCardDraggedIndex] = useState<number | null>(null);
  const [cardDragOverIndex, setCardDragOverIndex] = useState<number | null>(null);

  const cardsTopRef = useRef<HTMLDivElement>(null);

  // Initialize session from Local Storage
  useEffect(() => {
    const session = getCurrentSession();
    if (session) {
      setCurrentUser(session);
    }
    setAuthInitialized(true);
  }, []);

  const handleLogin = (user: MockUser) => {
    setCurrentUser(user);
    setCurrentSession(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentSession(null);
  };

  // Local storage synchronization for scouting pins
  const saveToStorage = (list: any[]) => {
    try {
      localStorage.setItem("thaiscout_saved_locations", JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }
  };

  const saveCollectionsToStorage = (cols: Collection[]) => {
    try {
      localStorage.setItem("thaiscout_collections", JSON.stringify(cols));
    } catch (e) {
      console.error(e);
    }
  };

  // Collections handlers
  const handleCreateCollection = (name: string, description?: string) => {
    const newCol: Collection = {
      id: "col-" + Date.now(),
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

  const handleRenameCollection = (colId: string, newName: string) => {
    if (!newName.trim()) return;
    const updated = collections.map((c) =>
      c.id === colId ? { ...c, name: newName.trim() } : c
    );
    setCollections(updated);
    saveCollectionsToStorage(updated);
  };

  const handleDeleteCollection = (colId: string) => {
    const updated = collections.filter((c) => c.id !== colId);
    setCollections(updated);
    saveCollectionsToStorage(updated);
    if (activeCollectionId === colId) {
      setActiveCollectionId(null);
    }
  };

  const handleAddMultipleToCollection = (colId: string, locs: any[]) => {
    const updated = collections.map((col) => {
      if (col.id === colId) {
        const existingIds = new Set(col.locations.map((l) => l.id));
        const newItems = locs.filter((l) => !existingIds.has(l.id));
        return { ...col, locations: [...col.locations, ...newItems] };
      }
      return col;
    });
    setCollections(updated);
    saveCollectionsToStorage(updated);
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

  const handleReorderCollectionLocations = (colId: string, newLocations: any[]) => {
    const updated = collections.map((col) => {
      if (col.id === colId) {
        return { ...col, locations: newLocations };
      }
      return col;
    });
    setCollections(updated);
    saveCollectionsToStorage(updated);
  };

  const handleReorderScoutingList = (newLocations: any[]) => {
    setScoutingList(newLocations);
    saveToStorage(newLocations);
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

  const handleSelectFromCard = (loc: any) => {
    if (selectedLocation?.id === loc.id) {
      handleDeselect();
    } else {
      setSelectedLocation(loc);
    }
  };

  const handleSelectFromMap = (loc: any) => {
    setSelectedLocation(loc);
    setMapPinSelectedId(loc.id);
  };

  const toggleExpand = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Search API caller
  const handleSearch = async (
    targetBrief = brief,
    targetReg = selectedRegion,
    targetProv = selectedProvince,
    limitToFetch?: number
  ) => {
    // If nationwide ('ทั้งหมด') and no search keyword, don't show all locations (keep clean initial workspace)
    if (targetReg === "ทั้งหมด" && (!targetProv || targetProv === "all") && !targetBrief.trim()) {
      setResults([]);
      setTotalDbMatches(8628);
      setGeminiAnalysis(null);
      setSelectedLocation(null);
      return;
    }

    setLoading(true);
    setSelectedLocation(null);

    let effectiveProvinceParam = "all";
    if (targetProv && targetProv !== "all") {
      effectiveProvinceParam = targetProv;
    } else if (targetReg && targetReg !== "ทั้งหมด") {
      effectiveProvinceParam = "region:" + targetReg;
    }

    if (effectiveProvinceParam === "all" && targetBrief.trim().length > 0) {
      const detected = detectProvinceFromText(targetBrief);
      if (detected.detectedProvince) {
        effectiveProvinceParam = detected.detectedProvince;
      }
    }

    try {
      const res = await fetch("/api/scout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brief: targetBrief,
          province: effectiveProvinceParam,
          limit: limitToFetch || currentLimit,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResults(data.locations);
        if (data.totalMatches !== undefined) {
          setTotalDbMatches(data.totalMatches);
        }
        setGeminiAnalysis(data.geminiAnalysis || null);
        setActiveTab("search");
        setFilterOnlyPinned(false);
        setActiveCollectionId(null);
        setSelectedLocation(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    const nextLimit = currentLimit + 300;
    setCurrentLimit(nextLimit);
    handleSearch(brief, selectedRegion, selectedProvince, nextLimit);
  };

  // Initial load - keep clean when nationwide and no keyword
  useEffect(() => {
    // Starts empty as requested ("หน้าค้นหาตอนเลือกทั่วประเทศไม่ต้องให้แสดงอะไรมา")
  }, []);

  useEffect(() => {
    try {
      const savedPins = localStorage.getItem("thaiscout_saved_locations");
      if (savedPins) {
        const parsed = JSON.parse(savedPins);
        if (Array.isArray(parsed)) setScoutingList(parsed);
      }
      const savedCols = localStorage.getItem("thaiscout_collections");
      if (savedCols) {
        const parsed = JSON.parse(savedCols);
        if (Array.isArray(parsed)) {
          // Filter out legacy automatic default collection if present
          const userOnlyCols = parsed.filter((c: Collection) => c.id !== "default");
          setCollections(userOnlyCols);
          if (userOnlyCols.length !== parsed.length) {
            saveCollectionsToStorage(userOnlyCols);
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // List of provinces available under currently selected region
  const provincesInSelectedRegion = useMemo(() => {
    if (selectedRegion === "ทั้งหมด") {
      return [];
    }
    return THAI_PROVINCES.filter((p) => p.region === selectedRegion);
  }, [selectedRegion]);

  // Province list specifically for pinned locations under the selected region
  const pinnedProvincesInSelectedRegion = useMemo(() => {
    if (selectedRegion === "ทั้งหมด") {
      return Array.from(new Set(scoutingList.map((l) => l.province))).filter(Boolean);
    }
    const regionProvinceNames = new Set(
      THAI_PROVINCES.filter((p) => p.region === selectedRegion).map((p) => p.name)
    );
    return Array.from(
      new Set(
        scoutingList
          .map((l) => l.province)
          .filter((prov) => regionProvinceNames.has(prov))
      )
    );
  }, [scoutingList, selectedRegion]);

  const rawList = useMemo(() => {
    if (activeCollectionId) {
      return collections.find((c) => c.id === activeCollectionId)?.locations || [];
    }
    if (filterOnlyPinned || activeTab === "scout") {
      return scoutingList.filter((loc) => {
        if (selectedRegion !== "ทั้งหมด") {
          const provInfo = THAI_PROVINCES.find((p) => p.name === loc.province);
          if (provInfo && provInfo.region !== selectedRegion) return false;
        }
        if (selectedProvince !== "all" && loc.province !== selectedProvince) {
          return false;
        }
        return true;
      });
    }
    return activeTab === "search" ? results : scoutingList;
  }, [activeCollectionId, collections, filterOnlyPinned, activeTab, scoutingList, results, selectedRegion, selectedProvince]);

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

  // If not logged in yet, render Login/Registration view
  if (authInitialized && !currentUser) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="flex flex-1 h-screen overflow-hidden relative">

        {/* 🗂️ SIDEBAR (Drawer Style / Collapsible: Expands to 64-72, Collapses to Slim Icon Rail w-16) */}
        <aside
          className={`${
            isSidebarOpen ? "w-64 sm:w-72" : "w-16"
          } transition-all duration-300 ease-in-out bg-[#285185] border-r border-[#183354] flex flex-col shrink-0 z-30 shadow-xl text-white h-full`}
        >
          {/* 1. SIDEBAR TOP: Brand Title / Icon + Toggle Button */}
          <div className={`p-3.5 border-b border-white/10 flex items-center shrink-0 ${
            isSidebarOpen ? "justify-between" : "justify-center flex-col gap-2"
          }`}>
            <div className="flex items-center gap-2.5">
              <div 
                onClick={() => !isSidebarOpen && setIsSidebarOpen(true)}
                className="w-9 h-9 rounded-xl bg-[#d67940] flex items-center justify-center text-white font-black text-lg shadow-sm border border-white/20 cursor-pointer hover:scale-105 transition"
                title="Travel Location"
              >
                ⚡
              </div>
              {isSidebarOpen && (
                <div>
                  <div className="flex items-center gap-1.5 leading-tight">
                    <span className="font-black text-base text-white tracking-tight">
                      Travel Location
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-[#d67940] text-white">
                    Creator Space
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 rounded-lg text-[#ccd9e2] hover:text-white hover:bg-white/10 transition cursor-pointer"
              title={isSidebarOpen ? "ย่อแถบข้างเป็นไอคอน" : "ขยายแถบข้าง"}
            >
              {isSidebarOpen ? (
                <PanelLeftClose className="w-5 h-5" />
              ) : (
                <PanelLeft className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* 2. SIDEBAR MIDDLE: Nav Buttons & Collections */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-3">
            {/* Primary Nav Buttons */}
            <div className="space-y-1.5">
              <button
                onClick={() => {
                  setActiveCollectionId(null);
                  setActiveTab("search");
                  setFilterOnlyPinned(false);
                  setSelectedRegion("ทั้งหมด");
                  setSelectedProvince("all");
                }}
                className={`w-full rounded-xl text-xs font-bold flex items-center transition cursor-pointer ${
                  isSidebarOpen ? "px-3.5 py-2.5 justify-between" : "p-2.5 justify-center"
                } ${
                  activeTab === "search" && !filterOnlyPinned && !activeCollectionId
                    ? "bg-[#183354] text-white shadow-sm border border-white/20"
                    : "text-[#ccd9e2] hover:bg-white/10 hover:text-white"
                }`}
                title="ค้นหาและค้นพบ"
              >
                <div className="flex items-center gap-2.5">
                  <Search className="w-4 h-4 text-[#d67940] shrink-0" />
                  {isSidebarOpen && <span>ค้นหาและค้นพบ</span>}
                </div>
                {isSidebarOpen && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold ${
                    activeTab === "search" && !filterOnlyPinned && !activeCollectionId
                      ? "bg-[#d67940] text-white"
                      : "bg-white/10 text-[#ccd9e2]"
                  }`}>
                    {results.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setActiveCollectionId(null);
                  setActiveTab("scout");
                  setFilterOnlyPinned(true);
                  setSelectedRegion("ทั้งหมด");
                  setSelectedProvince("all");
                }}
                className={`w-full rounded-xl text-xs font-bold flex items-center transition cursor-pointer ${
                  isSidebarOpen ? "px-3.5 py-2.5 justify-between" : "p-2.5 justify-center"
                } ${
                  filterOnlyPinned && !activeCollectionId
                    ? "bg-[#183354] text-white shadow-sm border border-white/20"
                    : "text-[#ccd9e2] hover:bg-white/10 hover:text-white"
                }`}
                title="ปักหมุดที่สนใจ"
              >
                <div className="flex items-center gap-2.5">
                  <Bookmark className="w-4 h-4 text-[#d67940] shrink-0" />
                  {isSidebarOpen && <span>ปักหมุดที่สนใจ</span>}
                </div>
                {isSidebarOpen && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold ${
                    filterOnlyPinned && !activeCollectionId
                      ? "bg-[#d67940] text-white"
                      : "bg-white/10 text-[#ccd9e2]"
                  }`}>
                    {scoutingList.length}
                  </span>
                )}
              </button>
            </div>

            {/* 📁 Collections Section */}
            <div className="pt-2.5 border-t border-white/10">
              {isSidebarOpen ? (
                <>
                  <div className="flex items-center justify-between px-1 mb-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#ccd9e2] flex items-center gap-1.5">
                      <Folder className="w-3.5 h-3.5 text-[#d67940]" />
                      คลัง Collections
                    </span>
                    <button
                      onClick={() => setIsCollectionsModalOpen(true)}
                      className="text-[11px] font-bold text-white hover:underline bg-white/15 px-2 py-0.5 rounded-md hover:bg-white/25 transition cursor-pointer"
                    >
                      จัดการ
                    </button>
                  </div>

                  <div className="space-y-1">
                    {collections.map((col) => {
                      const isColActive = activeCollectionId === col.id;
                      return (
                        <button
                          key={col.id}
                          onClick={() => {
                            setActiveCollectionId(col.id);
                            setActiveTab("collection");
                            setFilterOnlyPinned(false);
                            handleDeselect();
                            setSelectedRegion("ทั้งหมด");
                            setSelectedProvince("all");
                          }}
                          className={`w-full px-3 py-2 rounded-xl text-xs font-bold text-left flex items-center justify-between transition cursor-pointer ${
                            isColActive
                              ? "bg-[#183354] text-white font-black border border-[#d67940]"
                              : "text-[#ccd9e2] hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          <div className="truncate flex items-center gap-2">
                            <span>📁</span>
                            <span className="truncate">{col.name}</span>
                          </div>
                          <span className="text-[11px] font-mono text-white bg-white/20 px-1.5 py-0.5 rounded-md">
                            {col.locations.length}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="flex justify-center">
                  <button
                    onClick={() => setIsCollectionsModalOpen(true)}
                    className="p-2.5 rounded-xl hover:bg-white/10 text-[#ccd9e2] hover:text-white transition"
                    title={`คลัง Collections (${collections.length})`}
                  >
                    <Folder className="w-4 h-4 text-[#d67940]" />
                  </button>
                </div>
              )}
            </div>

            {/* Simulated Data Status Box (เฉพาะตอนกางออก) */}
            {isSidebarOpen && (
              <div className="p-3 rounded-2xl bg-[#183354]/70 border border-white/10 text-[11px] text-[#ccd9e2] leading-relaxed">
                <div className="font-bold text-white flex items-center gap-1 mb-1">
                  <span>🛡️</span> TAT Ground Truth 100%
                </div>
                ฐานข้อมูล ททท. 8,628 พิกัดจริง ตรวจสอบระเบียบการถ่ายทำเรียบร้อย
              </div>
            )}
          </div>

          {/* 3. SIDEBAR BOTTOM: User Profile + Logout Button */}
          <div className={`p-2.5 border-t border-white/10 bg-[#183354]/50 flex items-center shrink-0 ${
            isSidebarOpen ? "justify-between gap-2" : "justify-center flex-col gap-2"
          }`}>
            <div 
              onClick={() => !isSidebarOpen && setIsSidebarOpen(true)}
              className="flex items-center gap-2 truncate cursor-pointer"
              title={currentUser?.name}
            >
              <div className="w-8 h-8 rounded-xl bg-[#d67940] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                {currentUser?.avatar || currentUser?.name.charAt(0) || "U"}
              </div>
              {isSidebarOpen && (
                <div className="truncate text-left">
                  <div className="text-xs font-bold text-white truncate leading-tight">
                    {currentUser?.name || "ผู้ใช้งาน"}
                  </div>
                  <div className="text-[10px] text-[#ccd9e2] font-mono truncate">
                    🎬 Creator / กองถ่าย
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-[#ccd9e2] hover:text-rose-400 hover:bg-white/10 transition cursor-pointer shrink-0"
              title="ออกจากระบบ"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </aside>

        {/* 💻 MAIN SCREEN: Split into 3 columns (Left 2 parts for Controls & Cards + Right 1 part for Fixed Map) */}
        <main className="flex-1 flex flex-col lg:grid lg:grid-cols-3 h-full overflow-hidden relative">
          
          {/* === 2 PARTS LEFT: Search, Filters, Creative Brief & 3-Column Results Grid === */}
          <div className={`lg:col-span-2 overflow-y-auto p-4 sm:p-6 space-y-4 border-r border-[#ccd9e2]/60 transition-all duration-200 ${
            ragTargetLocation || socialModalLocation ? "blur-xs opacity-60 pointer-events-none" : ""
          }`}>
            
            {/* Header: Title & Collection Indicator */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#d67940]">
                  {activeCollectionId ? "COLLECTION WORKSPACE" : filterOnlyPinned || activeTab === "scout" ? "PINNED WORKSPACE" : "CREATOR WORKSPACE"}
                </span>
                
                {activeCollectionId ? (
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {isEditingActiveColName ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={editingActiveColName}
                          onChange={(e) => setEditingActiveColName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              if (editingActiveColName.trim()) {
                                handleRenameCollection(activeCollectionId, editingActiveColName.trim());
                              }
                              setIsEditingActiveColName(false);
                            } else if (e.key === "Escape") {
                              setIsEditingActiveColName(false);
                            }
                          }}
                          autoFocus
                          className="text-xl sm:text-2xl font-black text-[#1b3558] bg-white border-2 border-[#285185] rounded-xl px-2.5 py-1 focus:outline-none"
                        />
                        <button
                          onClick={() => {
                            if (editingActiveColName.trim()) {
                              handleRenameCollection(activeCollectionId, editingActiveColName.trim());
                            }
                            setIsEditingActiveColName(false);
                          }}
                          className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition cursor-pointer"
                          title="บันทึกชื่อ"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setIsEditingActiveColName(false)}
                          className="p-1.5 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 transition cursor-pointer"
                          title="ยกเลิก"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h1 className="text-2xl sm:text-3xl font-black text-[#1b3558] tracking-tight truncate">
                          📁 {collections.find((c) => c.id === activeCollectionId)?.name || "กล่องคลัง"}
                        </h1>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              const currentName = collections.find((c) => c.id === activeCollectionId)?.name || "";
                              setEditingActiveColName(currentName);
                              setIsEditingActiveColName(true);
                            }}
                            className="p-1.5 rounded-xl border border-slate-300 bg-white hover:border-[#285185] hover:bg-[#ccd9e2]/30 text-slate-600 hover:text-[#285185] transition cursor-pointer"
                            title="แก้ไขชื่อคลังนี้"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          {activeCollectionId !== "default" && (
                            <button
                              onClick={() => {
                                const currentCol = collections.find((c) => c.id === activeCollectionId);
                                if (confirm(`คุณต้องการลบกล่องคลัง "${currentCol?.name}" ใช่หรือไม่?`)) {
                                  handleDeleteCollection(activeCollectionId);
                                }
                              }}
                              className="p-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 transition cursor-pointer"
                              title="ลบคลังนี้"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <h1 className="text-2xl sm:text-3xl font-black text-[#1b3558] tracking-tight">
                    {filterOnlyPinned || activeTab === "scout" ? "รายการที่ปักหมุดไว้" : "ค้นหาโลเคชันที่ใช่"}
                  </h1>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {activeCollectionId && (
                  <button
                    onClick={() => {
                      setActiveCollectionId(null);
                      setActiveTab("search");
                      setFilterOnlyPinned(false);
                      setIsEditingActiveColName(false);
                      handleDeselect();
                      setSelectedRegion("ทั้งหมด");
                      setSelectedProvince("all");
                    }}
                    className="flex items-center gap-1.5 bg-[#ccd9e2]/80 hover:bg-[#ccd9e2] border border-[#285185] px-3 py-1.5 rounded-xl text-xs font-bold text-[#1b3558] transition cursor-pointer"
                    title="ออกจากมุมมองคลัง"
                  >
                    <span>← กลับหน้าหลัก</span>
                  </button>
                )}
              </div>
            </div>

            {/* 🔍 Search Box or Pinned Filter Box (หน้าปักหมุดตัดช่องค้นหาออก เหลือเฉพาะตัวกรองภาค/จังหวัด) */}
            <div className="bg-white border-2 border-[#285185] rounded-2xl p-4 sm:p-5 shadow-[4px_4px_0px_#183354] space-y-3">
              
              {/* Only show Search input in Discovery/Search mode */}
              {!filterOnlyPinned && activeTab !== "scout" && (
                <>
                  <label className="block text-xs font-black text-slate-800">
                    เริ่มจากค้นหาสถานที่ หรือพิมพ์ Creative Brief เพื่อเช็คข้อมูลก่อนวางแผน
                  </label>

                  {/* Text Search Input with Big Search Button */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={brief}
                        onChange={(e) => setBrief(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleSearch(brief, selectedRegion, selectedProvince);
                          }
                        }}
                        placeholder="พิมพ์ชื่อสถานที่, บรรยากาศฉาก เช่น น้ำตกหิน, คาเฟ่ริมน้ำ, วิวเมืองกลางคืน..."
                        className="w-full bg-[#f8fafc] border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 font-bold focus:outline-none focus:border-[#285185] focus:bg-white transition"
                      />
                      {brief && (
                        <button
                          onClick={() => {
                            setBrief("");
                            handleSearch("", selectedRegion, selectedProvince);
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 font-black text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => handleSearch(brief, selectedRegion, selectedProvince)}
                      disabled={loading}
                      className="px-6 py-2.5 rounded-xl bg-[#285185] hover:bg-[#1b3558] text-white font-black text-xs sm:text-sm shadow-[2px_2px_0px_#183354] transition cursor-pointer shrink-0 flex items-center gap-1.5"
                    >
                      <Search className="w-4 h-4" />
                      <span>{loading ? "กำลังค้น..." : "ค้นหา"}</span>
                    </button>
                  </div>
                </>
              )}

              {/* 🗺️ Level 1 Filter: Region Chips (ระดับบนสุดเป็นภาค) */}
              <div className="pt-2 border-t border-slate-100">
                <div className="text-[11px] font-black text-slate-500 mb-1.5 flex items-center justify-between">
                  <span>เลือกดูรายภาค:</span>
                  {selectedRegion !== "ทั้งหมด" && (
                    <button
                      onClick={() => {
                        setSelectedRegion("ทั้งหมด");
                        setSelectedProvince("all");
                        if (!filterOnlyPinned && activeTab !== "scout") {
                          handleSearch(brief, "ทั้งหมด", "all");
                        }
                      }}
                      className="text-[#d67940] hover:underline font-bold text-[10px] cursor-pointer"
                    >
                      ✕ ดูทุกภาค
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRegion("ทั้งหมด");
                      setSelectedProvince("all");
                      if (!filterOnlyPinned && activeTab !== "scout") {
                        handleSearch(brief, "ทั้งหมด", "all");
                      }
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition border cursor-pointer ${
                      selectedRegion === "ทั้งหมด"
                        ? "bg-[#285185] text-white border-[#285185] shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:border-[#285185]"
                    }`}
                  >
                    🌐 ทั่วประเทศ {filterOnlyPinned || activeTab === "scout" ? `(${scoutingList.length})` : "(77)"}
                  </button>

                  {REGION_LIST.filter((r) => r.id !== "all").map((reg) => {
                    const regName = reg.id.replace("region:", "");
                    const isRegActive = selectedRegion === regName;
                    
                    // In pinned mode, count how many pinned places are in this region
                    const pinnedCountInReg = scoutingList.filter((loc) => {
                      const p = THAI_PROVINCES.find((x) => x.name === loc.province);
                      return p && p.region === regName;
                    }).length;

                    const countDisplay = filterOnlyPinned || activeTab === "scout" ? pinnedCountInReg : reg.count;

                    return (
                      <button
                        key={reg.id}
                        type="button"
                        onClick={() => {
                          setSelectedRegion(regName);
                          setSelectedProvince("all");
                          if (!filterOnlyPinned && activeTab !== "scout") {
                            handleSearch(brief, regName, "all");
                          }
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition border flex items-center gap-1 cursor-pointer ${
                          isRegActive
                            ? "bg-[#285185] text-white border-[#285185] shadow-xs"
                            : "bg-white text-slate-700 border-slate-200 hover:border-[#285185]"
                        }`}
                      >
                        <span>{reg.icon}</span>
                        <span>{regName.replace("ภาค", "")}</span>
                        <span className={`text-[10px] ${isRegActive ? "text-[#ccd9e2]" : "text-slate-400"}`}>
                          ({countDisplay})
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 📍 Level 2 Filter: Break down provinces under selected region (แตกจังหวัดออกมาของภาคนั้น) */}
              {selectedRegion !== "ทั้งหมด" && (
                <div className="pt-2 border-t border-slate-100 bg-[#f0f5f8] p-3 rounded-xl border border-[#ccd9e2]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-black text-[#1b3558] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#d67940]" />
                      จังหวัดใน{selectedRegion}:
                    </span>
                    {selectedProvince !== "all" && (
                      <button
                        onClick={() => {
                          setSelectedProvince("all");
                          if (!filterOnlyPinned && activeTab !== "scout") {
                            handleSearch(brief, selectedRegion, "all");
                          }
                        }}
                        className="text-xs text-[#d67940] hover:underline font-bold cursor-pointer"
                      >
                        ดูทุกจังหวัดในภาคนี้
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProvince("all");
                        if (!filterOnlyPinned && activeTab !== "scout") {
                          handleSearch(brief, selectedRegion, "all");
                        }
                      }}
                      className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border transition cursor-pointer ${
                        selectedProvince === "all"
                          ? "bg-[#d67940] text-white border-[#d67940]"
                          : "bg-white text-slate-700 border-slate-200 hover:border-[#d67940]"
                      }`}
                    >
                      ทั้งหมดในภาค
                    </button>

                    {(filterOnlyPinned || activeTab === "scout" 
                      ? pinnedProvincesInSelectedRegion 
                      : provincesInSelectedRegion.map((p) => p.name)
                    ).map((provName) => {
                      const isProvActive = selectedProvince === provName;
                      return (
                        <button
                          key={provName}
                          type="button"
                          onClick={() => {
                            setSelectedProvince(provName);
                            if (!filterOnlyPinned && activeTab !== "scout") {
                              handleSearch(brief, selectedRegion, provName);
                            }
                          }}
                          className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border transition cursor-pointer ${
                            isProvActive
                              ? "bg-[#d67940] text-white border-[#d67940]"
                              : "bg-white text-slate-700 border-slate-200 hover:border-[#d67940]"
                          }`}
                        >
                          {provName}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Status and Count Header */}
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 pt-1 flex-wrap gap-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <div>
                    {activeCollectionId ? (
                      <>
                        สถานที่ในกล่องนี้{" "}
                        <strong className="text-[#285185] font-black">
                          {displayedLocations.length}
                        </strong>{" "}
                        แห่ง
                      </>
                    ) : filterOnlyPinned || activeTab === "scout" ? (
                      <>
                        ปักหมุดตรงเงื่อนไข{" "}
                        <strong className="text-[#285185] font-black">
                          {displayedLocations.length}
                        </strong>{" "}
                        จากที่ปักไว้ทั้งหมด {scoutingList.length} แห่ง
                      </>
                    ) : (
                      <>
                        ผลการค้นหา{" "}
                        <strong className="text-[#285185] font-black">
                          {displayedLocations.length}
                        </strong>{" "}
                        จาก {totalDbMatches.toLocaleString()} แห่ง
                      </>
                    )}
                  </div>

                  {/* ปุ่มแอดทั้งหมดเข้าคลัง (แสดงเมื่ออยู่ในหน้าปักหมุดที่สนใจและมีสถานที่ที่ปักหมุดไว้) */}
                  {(filterOnlyPinned || activeTab === "scout") && !activeCollectionId && displayedLocations.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setAddToCollectionTarget(displayedLocations)}
                      className="px-3 py-1 rounded-xl bg-[#285185] hover:bg-[#1b3558] text-white text-[11px] font-black flex items-center gap-1.5 shadow-[2px_2px_0px_#183354] transition cursor-pointer"
                      title="บันทึกสถานที่ที่แสดงอยู่ทั้งหมดเข้าคลังที่ต้องการ"
                    >
                      <Folder className="w-3.5 h-3.5 text-[#d67940]" />
                      <span>+ แอดทั้งหมด ({displayedLocations.length}) เข้าคลัง</span>
                    </button>
                  )}
                </div>

                <div className="text-[11px] text-slate-400">
                  คลิกที่การ์ดเพื่อดูรายละเอียดและขยับหมุดบนแผนที่
                </div>
              </div>
            </div>

            {/* Gemini Scouting Advice if available */}
            {geminiAnalysis && (
              <div className="p-3.5 bg-white border border-[#285185]/30 rounded-2xl shadow-xs space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-black text-[#285185]">
                  <Sparkles className="w-4 h-4 text-[#d67940]" />
                  <span>Gemini AI Scout Suggestion</span>
                </div>
                {geminiAnalysis.mood && (
                  <p className="text-xs text-slate-700 font-medium">
                    🎬 <strong>Mood:</strong> {geminiAnalysis.mood}
                  </p>
                )}
                {geminiAnalysis.directorTip && (
                  <p className="text-xs text-slate-600 font-medium">
                    💡 <strong>คำแนะนำกองถ่าย:</strong> {geminiAnalysis.directorTip}
                  </p>
                )}
              </div>
            )}

            {/* 📊 RESULTS TABLE / 3-COLUMN CARD GRID (ทำเป็น 3 ช่องตามที่ขอ) */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 animate-pulse">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="h-60 bg-white rounded-2xl border border-slate-200 p-4 space-y-3" />
                ))}
              </div>
            ) : displayedLocations.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-slate-300 p-8">
                <Compass className="w-12 h-12 text-[#285185]/40 mx-auto mb-2" />
                {selectedRegion === "ทั้งหมด" && !brief.trim() && activeTab === "search" && !filterOnlyPinned ? (
                  <>
                    <p className="text-slate-900 font-black text-base">เริ่มต้นค้นหาโลเคชันถ่ายทำ</p>
                    <p className="text-xs text-slate-500 mt-1">
                      พิมพ์คำค้นหาในช่องด้านบน หรือเลือกคลิกดูตามรายภาค / จังหวัดที่ต้องการเพื่อเริ่มสำรวจ
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-slate-900 font-black text-base">ไม่พบโลเคชันที่ตรงเงื่อนไข</p>
                    <p className="text-xs text-slate-500 mt-1">
                      ลองเปลี่ยนคำค้นหา หรือเลือกดูจังหวัดอื่นในภาคดูครับ
                    </p>
                  </>
                )}
              </div>
            ) : (
              <>
                <div ref={cardsTopRef} className="scroll-mt-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 items-start">
                  {displayedLocations.map((loc, cardIdx) => {
                    const isSaved = scoutingList.some((x) => x.id === loc.id);
                    const isSelected = selectedLocation?.id === loc.id;
                    const recceIndex = scoutingList.findIndex((x) => x.id === loc.id);
                    const isHighlightExpanded = !!expandedIds[loc.id];
                    const fullText = loc.hilight || loc.detail || "";

                    // Check which collections contain this location
                    const parentCollections = collections.filter((c) =>
                      c.locations.some((l) => l.id === loc.id)
                    );
                    const isInAnyCollection = parentCollections.length > 0;

                    const isCardBeingDragged = cardDraggedIndex === cardIdx;
                    const isCardTargetOver = cardDragOverIndex === cardIdx;
                    const canReorder = !!activeCollectionId || filterOnlyPinned || activeTab === "scout";

                    const handleCardMove = (fromIdx: number, toIdx: number) => {
                      if (toIdx < 0 || toIdx >= displayedLocations.length) return;
                      const updated = [...displayedLocations];
                      const [moved] = updated.splice(fromIdx, 1);
                      updated.splice(toIdx, 0, moved);

                      if (activeCollectionId) {
                        handleReorderCollectionLocations(activeCollectionId, updated);
                      } else if (filterOnlyPinned || activeTab === "scout") {
                        handleReorderScoutingList(updated);
                      }
                    };

                    return (
                      <div
                        key={loc.id}
                        draggable={canReorder}
                        onDragStart={(e) => {
                          if (!canReorder) return;
                          setCardDraggedIndex(cardIdx);
                          e.dataTransfer.effectAllowed = "move";
                          e.dataTransfer.setData("text/plain", cardIdx.toString());
                        }}
                        onDragOver={(e) => {
                          if (!canReorder) return;
                          e.preventDefault();
                          e.dataTransfer.dropEffect = "move";
                          if (cardDragOverIndex !== cardIdx) {
                            setCardDragOverIndex(cardIdx);
                          }
                        }}
                        onDragLeave={() => {
                          if (cardDragOverIndex === cardIdx) {
                            setCardDragOverIndex(null);
                          }
                        }}
                        onDrop={(e) => {
                          if (!canReorder) return;
                          e.preventDefault();
                          if (cardDraggedIndex !== null && cardDraggedIndex !== cardIdx) {
                            handleCardMove(cardDraggedIndex, cardIdx);
                          }
                          setCardDraggedIndex(null);
                          setCardDragOverIndex(null);
                        }}
                        onDragEnd={() => {
                          setCardDraggedIndex(null);
                          setCardDragOverIndex(null);
                        }}
                        onClick={() => handleSelectFromCard(loc)}
                        className={`self-start h-fit rounded-2xl p-4 transition-all duration-150 cursor-pointer flex flex-col justify-between border-2 ${
                          isCardBeingDragged
                            ? "opacity-40 border-dashed border-[#d67940] scale-[0.98]"
                            : isCardTargetOver
                            ? "border-[#d67940] bg-[#fff7ed] shadow-lg -translate-y-1"
                            : isSelected
                            ? "border-[#d67940] shadow-[4px_4px_0px_#a8521d] ring-2 ring-[#d67940]/20 scale-[1.01] bg-white"
                            : isInAnyCollection && !activeCollectionId
                            ? "border-[#d67940] bg-[#fffbf7] shadow-[2px_2px_0px_#d67940] hover:shadow-[4px_4px_0px_#d67940] hover:-translate-y-0.5"
                            : "border-[#285185] bg-white shadow-[2px_2px_0px_#183354] hover:shadow-[4px_4px_0px_#183354] hover:-translate-y-0.5"
                        }`}
                      >
                        {/* Top: Category, Order handle, and Pin Action / Collection Indicators */}
                        <div>
                          <div className="flex items-center justify-between mb-2 gap-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                              {/* Reorder drag handle & up/down arrows when in collection or pinned workspace */}
                              {canReorder && (
                                <div className="flex items-center gap-0.5 shrink-0">
                                  <div
                                    className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-[#285185] rounded"
                                    title="ลากเพื่อสลับเรียงลำดับการ์ด"
                                  >
                                    <GripVertical className="w-4 h-4" />
                                  </div>
                                  <div className="flex flex-col -space-y-1">
                                    <button
                                      type="button"
                                      disabled={cardIdx === 0}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCardMove(cardIdx, cardIdx - 1);
                                      }}
                                      className="p-0.5 text-slate-400 hover:text-[#285185] disabled:opacity-20 disabled:hover:text-slate-400 cursor-pointer disabled:cursor-not-allowed"
                                      title="เลื่อนขึ้น/ก่อนหน้า"
                                    >
                                      <ChevronUp className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      disabled={cardIdx === displayedLocations.length - 1}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCardMove(cardIdx, cardIdx + 1);
                                      }}
                                      className="p-0.5 text-slate-400 hover:text-[#285185] disabled:opacity-20 disabled:hover:text-slate-400 cursor-pointer disabled:cursor-not-allowed"
                                      title="เลื่อนลง/ถัดไป"
                                    >
                                      <ChevronDown className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              )}

                              {activeCollectionId && (
                                <span className="w-5 h-5 rounded-md bg-[#285185] text-white font-mono font-bold text-[11px] flex items-center justify-center shrink-0 shadow-2xs">
                                  #{cardIdx + 1}
                                </span>
                              )}

                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#ccd9e2] text-[#1b3558] border border-[#285185]/30 leading-snug inline-block w-fit max-w-full truncate">
                                {loc.category || "แหล่งท่องเที่ยว"}
                              </span>
                            </div>

                            {/* Top Right: Collection Tag & Pin Action */}
                            <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                              {/* Collection badge showing which collection(s) it belongs to */}
                              {!activeCollectionId && isInAnyCollection && (
                                <div className="flex items-center gap-1">
                                  {parentCollections.map((col) => (
                                    <span
                                      key={col.id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveCollectionId(col.id);
                                        setActiveTab("collection");
                                        setFilterOnlyPinned(false);
                                        handleDeselect();
                                        setSelectedRegion("ทั้งหมด");
                                        setSelectedProvince("all");
                                      }}
                                      className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-[#f07167]/15 text-[#b02a37] border border-[#f07167]/40 hover:bg-[#f07167]/25 transition flex items-center gap-1 cursor-pointer max-w-[120px] truncate shadow-2xs"
                                      title={`อยู่ในกล่องคลัง: ${col.name} (คลิกเพื่อเข้าสู่คลังนี้)`}
                                    >
                                      <span>📁</span>
                                      <span className="truncate">{col.name}</span>
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Only show Pin button when not viewing a specific collection */}
                              {!activeCollectionId && (
                                <div className="flex items-center gap-1 shrink-0">
                                  {recceIndex !== -1 && (
                                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                                      #{recceIndex + 1}
                                    </span>
                                  )}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleScout(loc);
                                    }}
                                    className={`p-1.5 rounded-xl border-2 text-xs transition cursor-pointer ${
                                      isSaved
                                        ? "bg-[#d67940] text-white border-[#d67940] shadow-xs"
                                        : "bg-white text-slate-500 border-slate-300 hover:border-[#285185] hover:text-[#285185] shadow-xs"
                                    }`}
                                    title={isSaved ? "ถอนหมุด" : "ปักหมุด"}
                                  >
                                    <Pin className={`w-3.5 h-3.5 ${isSaved ? "fill-white rotate-[-45deg]" : "rotate-[-45deg]"}`} />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Location Name (เด่น ชัดเจน ตัวใหญ่ สะดุดตา) */}
                          <h3 
                            className="text-base sm:text-[17px] font-black text-[#1b3558] hover:text-[#d67940] transition-colors line-clamp-1 mb-1 tracking-tight" 
                            title={loc.name_th}
                          >
                            {loc.name_th}
                          </h3>

                          {/* Province & District */}
                          <p className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#d67940] shrink-0" />
                            <span>{loc.province} {loc.district ? `· อ.${loc.district}` : ""}</span>
                          </p>

                          {/* Hilight Description (ดึงจากฟิลด์ไฮไลท์ของ ททท. ตกแต่งให้กระชับและสมบูรณ์ แสดงปุ่มดูเพิ่มเติมเฉพาะเมื่อข้อความล้น 3 บรรทัดจริงๆ) */}
                          {fullText && (
                            <HighlightBox
                              text={fullText}
                              isExpanded={isHighlightExpanded}
                              onToggleExpand={(e) => toggleExpand(loc.id, e)}
                            />
                          )}

                          {/* Coordinates */}
                          <div className="text-[10px] font-mono text-slate-400 mb-1 flex items-center gap-1">
                            <span className="font-bold text-slate-500">พิกัด GPS:</span>
                            <span>{loc.lat ? `${loc.lat.toFixed(4)}, ${loc.lng?.toFixed(4)}` : "ระบุตามเขตพื้นที่"}</span>
                          </div>
                        </div>

                        {/* Bottom Actions */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1 mt-auto">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setRagTargetLocation(loc);
                            }}
                            className="text-[11px] font-black text-[#285185] hover:underline flex items-center gap-1"
                          >
                            <Sparkles className="w-3 h-3 text-[#d67940]" />
                            <span>ข้อมูลกองถ่าย</span>
                          </button>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSocialModalLocation(loc);
                              }}
                              className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold"
                              title="ดูรูปภาพจริงจาก Google Maps"
                            >
                              📷 รูปภาพ
                            </button>

                            {activeCollectionId ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveLocationFromCollection(activeCollectionId, loc.id);
                                }}
                                className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-bold cursor-pointer transition"
                                title="ลบออกจากกล่องคลังนี้"
                              >
                                ✕ ลบออกจากกล่อง
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setAddToCollectionTarget(loc);
                                }}
                                className="px-2 py-1 rounded-lg bg-[#ccd9e2]/60 hover:bg-[#ccd9e2] text-[#1b3558] text-[10px] font-bold cursor-pointer transition"
                                title="จัดเก็บลงคลัง"
                              >
                                + เข้าคลัง
                              </button>
                            )}
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>

                {/* Load more button */}
                {displayedLocations.length < totalDbMatches && activeTab === "search" && !filterOnlyPinned && !activeCollectionId && (
                  <div className="text-center py-6">
                    <button
                      onClick={handleLoadMore}
                      disabled={loading}
                      className="px-6 py-2.5 rounded-xl bg-white border-2 border-[#285185] hover:bg-[#ccd9e2]/30 text-[#285185] font-black text-xs shadow-[2px_2px_0px_#183354] transition"
                    >
                      {loading ? "กำลังโหลด..." : `+ โหลดสถานที่เพิ่มอีก (+300) (จากทั้งหมด ${totalDbMatches.toLocaleString()} พิกัด)`}
                    </button>
                  </div>
                )}
              </>
            )}

          </div>

          {/* === 1 PART RIGHT: Fixed Map (1 ส่วนแผนที่ ฟิกตำแหน่งไว้ด้านขวา แบบกลมกลืนธีม) === */}
          <div className={`lg:col-span-1 h-[460px] lg:h-full bg-[#f8fafc] p-3 sm:p-4 flex flex-col relative shrink-0 transition-all duration-200 ${
            ragTargetLocation || socialModalLocation ? "blur-xs opacity-60 pointer-events-none" : ""
          }`}>
            <div className="h-full w-full rounded-2xl overflow-hidden border-2 border-[#285185] shadow-[4px_4px_0px_#183354] flex flex-col bg-white">
              <InteractiveMap
                locations={displayedLocations}
                selectedLocation={selectedLocation}
                scoutingList={scoutingList}
                onSelectLocation={handleSelectFromMap}
                onDeselect={handleDeselect}
                onToggleScout={toggleScout}
                onClearScout={handleClearScout}
                filterOnlyPinned={filterOnlyPinned}
                isCollectionMode={!!activeCollectionId}
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

        </main>

      {/* 🎙️ AI RAG Dossier Modal */}
      {ragTargetLocation && (
        <RagModal
          location={ragTargetLocation}
          brief={brief}
          isPinned={scoutingList.some((x) => x.id === ragTargetLocation.id)}
          onToggleScout={toggleScout}
          onClose={() => setRagTargetLocation(null)}
        />
      )}

      {/* 📸 Google Maps Place Photos Modal */}
      {socialModalLocation && (
        <SocialReviewsModal
          location={socialModalLocation}
          onClose={() => setSocialModalLocation(null)}
        />
      )}

      {/* 📁 Collections Modal */}
      <CollectionsModal
        isOpen={isCollectionsModalOpen}
        onClose={() => setIsCollectionsModalOpen(false)}
        collections={collections}
        activeCollectionId={activeCollectionId}
        onSelectCollection={(colId) => {
          setActiveCollectionId(colId);
          setActiveTab("collection");
          setFilterOnlyPinned(false);
          handleDeselect();
          setSelectedRegion("ทั้งหมด");
          setSelectedProvince("all");
        }}
        onCreateCollection={handleCreateCollection}
        onRenameCollection={handleRenameCollection}
        onDeleteCollection={handleDeleteCollection}
        onRemoveLocationFromCollection={handleRemoveLocationFromCollection}
        onReorderLocations={handleReorderCollectionLocations}
        onSelectLocationOnMap={(loc) => {
          handleSelectFromMap(loc);
        }}
      />

      {/* 📥 Add To Collection Modal */}
      {addToCollectionTarget && (
        <AddToCollectionModal
          isOpen={!!addToCollectionTarget}
          onClose={() => setAddToCollectionTarget(null)}
          location={addToCollectionTarget}
          collections={collections}
          onToggleLocationInCollection={handleToggleLocationInCollection}
          onAddMultipleToCollection={handleAddMultipleToCollection}
          onCreateCollection={handleCreateCollection}
        />
      )}

    </div>
  );
}
