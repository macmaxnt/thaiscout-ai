"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { ArrowUpRight, Bot, Check, ChevronDown, CircleAlert, Compass, Eye, Film, Layers3, MapPin, Navigation, Plus, Search, Sparkles, X, Zap } from "lucide-react";
import RagModal from "@/components/RagModal";

const InteractiveMap = dynamic(() => import("@/components/InteractiveMap"), {
  ssr: false,
  loading: () => <div className="map-loading"><div className="map-loading__mark"><MapPin size={24} /></div><strong>กำลังวางพิกัดบนแผนที่</strong><span>เชื่อมต่อฐานข้อมูลโลเคชัน</span></div>,
});

type Location = { id: string; name_th: string; name_en?: string; province: string; district?: string; category?: string; lat?: number; lng?: number; tel?: string; hilight?: string; detail?: string; relevanceScore?: number; isCustomHost?: boolean; productionSpecs?: { rate?: string; power?: string } };

const starterLocations: Location[] = [
  { id: "host_default_1", name_th: "เรือนไทยริมน้ำ 100 ปี", name_en: "Ancient Thai Waterfront House", province: "พระนครศรีอยุธยา", district: "พระนครศรีอยุธยา", category: "บ้าน & เรือนไทย", lat: 14.3532, lng: 100.5684, tel: "081-999-1234", hilight: "แสงเช้า-เย็นสะท้อนผิวน้ำและไม้สักเก่า เหมาะกับซีนย้อนยุค", detail: "เรือนไทยหมู่ริมแม่น้ำ มีใต้ถุนโล่ง ลานกว้าง และจุดจอดรถกองถ่าย", relevanceScore: 92, isCustomHost: true, productionSpecs: { rate: "18,000 บาท / 12 ชม.", power: "ไฟ 30A พร้อมจุดต่อสามเฟส" } },
  { id: "host_default_2", name_th: "โกดังอิฐเก่าริมน้ำ", name_en: "Rustic Industrial Warehouse", province: "สมุทรปราการ", district: "พระประแดง", category: "โกดัง & โรงงานเก่า", lat: 13.658, lng: 100.534, tel: "089-888-5678", hilight: "ผิวอิฐเปลือยและแสงทะลุหน้าต่างสูงสำหรับ MV หรือแฟชั่นฟิล์ม", detail: "พื้นที่โปร่งไร้เสากลาง รองรับงาน rigging และรถอุปกรณ์ขนาดใหญ่", relevanceScore: 87, isCustomHost: true, productionSpecs: { rate: "22,000 บาท / 12 ชม.", power: "ไฟอุตสาหกรรม 100A" } },
];

const quickBriefs = [
  { label: "ลำธารลึกลับ", brief: "น้ำตก ลำธาร โขดหิน บรรยากาศลึกลับ ถ่าย MV เพลงเศร้า", province: "เชียงใหม่" },
  { label: "พีเรียดสงบ", brief: "วัดเก่า โบราณสถาน สถาปัตยกรรมไม้ บรรยากาศสงบ", province: "พระนครศรีอยุธยา" },
  { label: "แสงเย็นริมผา", brief: "หาดทราย หน้าผาหิน จุดชมวิวพระอาทิตย์ตก", province: "ภูเก็ต" },
];
const provinces = ["all", "เชียงใหม่", "กรุงเทพมหานคร", "ภูเก็ต", "พระนครศรีอยุธยา", "จันทบุรี", "กาญจนบุรี", "น่าน"];

export default function Home() {
  const [brief, setBrief] = useState("น้ำตก ลำธาร โขดหิน บรรยากาศลึกลับ ถ่าย MV เพลงเศร้า");
  const [province, setProvince] = useState("เชียงใหม่");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<Location[]>([]);
  const [scoutingList, setScoutingList] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [ragTargetLocation, setRagTargetLocation] = useState<Location | null>(null);
  const [activeView, setActiveView] = useState<"results" | "recce">("results");

  const matchingStarterLocations = useMemo(() => province === "all" ? starterLocations : starterLocations.filter((location) => location.province === province), [province]);
  const locations = activeView === "recce" ? scoutingList : [...matchingStarterLocations, ...results];

  const handleSearch = async (targetBrief = brief, targetProvince = province) => {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/scout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ brief: targetBrief, province: targetProvince }) });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || "ไม่สามารถค้นหาได้ในขณะนี้");
      setResults(data.locations ?? []);
      setSelectedLocation(data.locations?.[0] ?? matchingStarterLocations[0] ?? null);
      setActiveView("results");
    } catch (searchError) { setError(searchError instanceof Error ? searchError.message : "ไม่สามารถเชื่อมต่อ AI Scouting Agent ได้"); }
    finally { setLoading(false); }
  };
  useEffect(() => { handleSearch(); /* initial example only */ // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const toggleScout = (location: Location) => setScoutingList((current) => current.some((item) => item.id === location.id) ? current.filter((item) => item.id !== location.id) : [...current, location]);
  const chooseBrief = (preset: (typeof quickBriefs)[number]) => { setBrief(preset.brief); setProvince(preset.province); handleSearch(preset.brief, preset.province); };
  const clearBrief = () => { setBrief(""); setError(""); };
  const jumpToMap = () => {
    const map = document.getElementById("live-map");
    map?.scrollIntoView({ behavior: "smooth", block: "start" });
    map?.focus({ preventScroll: true });
  };

  return <main className="recce-shell">
    <header className="recce-topbar">
      <a className="brand" href="#workspace" aria-label="ThaiScout AI home"><span className="brand-mark"><Compass size={20} strokeWidth={2.5} /></span><span>ThaiScout<span>AI</span></span></a>
      <div className="topbar-center"><span className="topbar-context"><span className="live-dot" /> Production location intelligence</span><span className="topbar-divider" /><span className="topbar-context">TAT-grounded search</span></div>
      <div className="topbar-actions"><button className="quiet-button" type="button" onClick={() => setActiveView("recce")}><Layers3 size={16} /> Recce board <span>{scoutingList.length}</span></button><button className="avatar" type="button" aria-label="Open account menu">TS</button></div>
    </header>

    <section id="workspace" className="recce-workspace">
      <aside className="recce-panel" aria-label="AI location search workspace">
        <div className="panel-heading"><div><p className="panel-overline">LOCATION SCOUTING DESK</p><h1>เริ่มจากภาพในหัว<br />แล้วหาโลเคชันจริง</h1></div><div className="agent-orb" aria-label="AI agent online"><Bot size={21} /></div></div>
        <section className="brief-box" aria-labelledby="brief-heading">
          <div className="brief-box__header"><div><Sparkles size={15} /><span id="brief-heading">Brief to location</span></div><div className="brief-header-actions"><span className="agent-status">AI agent online</span>{brief && <button className="brief-reset" type="button" onClick={clearBrief} aria-label="ล้าง brief"><X size={13} /> ล้าง</button>}</div></div>
          <label className="sr-only" htmlFor="brief">Creative brief</label><textarea id="brief" rows={4} value={brief} onChange={(event) => setBrief(event.target.value)} onKeyDown={(event) => { if ((event.metaKey || event.ctrlKey) && event.key === "Enter" && brief.trim() && !loading) handleSearch(); }} aria-keyshortcuts="Control+Enter Meta+Enter" placeholder="เล่า mood, ฉาก หรือเงื่อนไขกองถ่ายที่ต้องการ…" />
          <div className="brief-controls"><label className="province-select"><MapPin size={15} /><span className="sr-only">จังหวัด</span><select value={province} onChange={(event) => setProvince(event.target.value)}>{provinces.map((item) => <option key={item} value={item}>{item === "all" ? "ทั่วประเทศ" : item}</option>)}</select><ChevronDown size={14} /></label><button className="search-button" type="button" onClick={() => handleSearch()} disabled={loading || !brief.trim()}>{loading ? <span className="button-loader" /> : <Search size={16} />}{loading ? "กำลังหา" : "เริ่ม scout"}</button></div>
        </section>
        <div className="suggestion-row" aria-label="ตัวอย่าง brief"><span>ลองใช้</span>{quickBriefs.map((preset) => <button key={preset.label} type="button" onClick={() => chooseBrief(preset)}>{preset.label}</button>)}</div>
        <div className="desk-toolbar"><div className="view-switcher" aria-label="เลือกมุมมองรายการ"><button className={activeView === "results" ? "is-active" : ""} type="button" aria-pressed={activeView === "results"} onClick={() => setActiveView("results")}>ผลลัพธ์ <span>{activeView === "results" ? locations.length : matchingStarterLocations.length + results.length}</span></button><button className={activeView === "recce" ? "is-active" : ""} type="button" aria-pressed={activeView === "recce"} onClick={() => setActiveView("recce")}>Recce list <span>{scoutingList.length}</span></button></div></div>
        <div className="result-summary"><span>{activeView === "recce" ? "สถานที่ที่คัดไว้สำหรับดูหน้างาน" : "เรียงตามความใกล้เคียงกับ brief"}</span><div><button className="selected-detail-link" type="button" onClick={() => selectedLocation && setRagTargetLocation(selectedLocation)} disabled={!selectedLocation}><Eye size={13} /> รายละเอียดที่เลือก</button><button className="mobile-map-link" type="button" onClick={jumpToMap}><Navigation size={13} /> ดูหมุด</button><span className="source-label"><span /> DATA CHECKED</span></div></div>
        {error && <div className="search-error" role="alert"><CircleAlert size={16} /> {error}</div>}
        <div className="location-list" aria-live="polite">
          {loading ? [1, 2, 3].map((item) => <div className="location-skeleton" key={item} />) : locations.length ? locations.map((location, index) => {
            const savedIndex = scoutingList.findIndex((item) => item.id === location.id); const saved = savedIndex !== -1; const selected = selectedLocation?.id === location.id;
            return <article className={`location-card ${selected ? "is-selected" : ""}`} key={location.id}>
              <button className="location-card__main" type="button" onClick={() => setSelectedLocation(location)} aria-pressed={selected}><span className="result-index">{String(index + 1).padStart(2, "0")}</span><span className="location-copy"><span className="location-title-row"><strong>{location.name_th}</strong>{location.relevanceScore && <span className="match-score">{location.relevanceScore}%</span>}</span><span className="location-meta"><MapPin size={13} /> {location.province}{location.district ? ` · ${location.district}` : ""}</span><span className="location-note">{location.hilight || location.detail || "กำลังประมวลผลรายละเอียดสถานที่"}</span><span className="location-tags"><span>{location.category || "สถานที่ท่องเที่ยว"}</span>{location.productionSpecs?.power && <span><Zap size={11} /> ระบบไฟพร้อม</span>}</span></span></button>
              <div className="location-card__actions"><button className="card-action" type="button" onClick={() => setRagTargetLocation(location)} aria-label={`เปิดรายละเอียด ${location.name_th}`} title="เปิดรายละเอียด"><Eye size={15} /></button><button className={`save-button ${saved ? "is-saved" : ""}`} type="button" onClick={() => toggleScout(location)}>{saved ? <Check size={15} /> : <Plus size={15} />}{saved ? `จุดที่ ${savedIndex + 1}` : "เก็บไว้"}</button></div>
            </article>;
          }) : <div className="empty-state"><Compass size={25} /><strong>{activeView === "recce" ? "ยังไม่มีสถานที่ใน Recce list" : "ยังไม่พบโลเคชันที่ตรง brief"}</strong><span>{activeView === "recce" ? "กด เก็บไว้ บนรายการที่น่าสนใจเพื่อเริ่มจัด route" : "ลองขยายคำบรรยาย หรือเปลี่ยนจังหวัดดู"}</span></div>}
        </div>
        <footer className="panel-footer"><div><span className="footer-mark"><Check size={12} /></span> คำตอบอ้างอิงจากข้อมูลสถานที่ที่มีอยู่</div><button type="button" onClick={() => selectedLocation && setRagTargetLocation(selectedLocation)}>ถาม AI <ArrowUpRight size={14} /></button></footer>
      </aside>
      <section id="live-map" className="map-stage" aria-label="Interactive location map" tabIndex={-1}>
        <InteractiveMap locations={locations} selectedLocation={selectedLocation} scoutingList={scoutingList} onSelectLocation={setSelectedLocation} onToggleScout={toggleScout} />
        <div className="map-legend"><span><i className="legend-dot legend-dot--selected" /> เลือกอยู่</span><span><i className="legend-dot legend-dot--saved" /> Recce list</span><span><i className="legend-dot" /> ผลลัพธ์</span></div>
        {selectedLocation && <div className="map-location-dock"><div className="dock-icon"><Film size={17} /></div><div><span>SELECTED LOCATION</span><strong>{selectedLocation.name_th}</strong><p>{selectedLocation.productionSpecs?.rate || selectedLocation.tel || "ดูข้อมูลการเข้าถึงและขออนุญาต"}</p></div><button type="button" className="dock-action" onClick={() => setRagTargetLocation(selectedLocation)}><Eye size={16} /> รายละเอียด</button></div>}
      </section>
    </section>
    {ragTargetLocation && <RagModal location={ragTargetLocation} brief={brief} onClose={() => setRagTargetLocation(null)} />}
  </main>;
}
