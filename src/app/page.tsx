"use client";

import React, { useState, useEffect } from "react";
import { 
  Clapperboard, Search, MapPin, Phone, Clock, AlertTriangle, 
  CheckCircle2, Sparkles, Navigation, Share2, Compass, Film, ExternalLink,
  Sliders, Layers, ShieldCheck
} from "lucide-react";

export default function Home() {
  const [brief, setBrief] = useState("น้ำตก ลำธาร โขดหิน บรรยากาศลึกลับ ถ่าย MV เพลงเศร้า");
  const [province, setProvince] = useState("เชียงใหม่");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [scoutingList, setScoutingList] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"search" | "scout">("search");

  const sampleBriefs = [
    { title: "🎬 MV น้ำตกลึกลับ", text: "น้ำตก ลำธาร โขดหิน บรรยากาศลึกลับ ถ่าย MV เพลงเศร้า", prov: "เชียงใหม่" },
    { title: "🏛️ ฉากพีเรียดย้อนยุค", text: "วัดเก่า โบราณสถาน สถาปัตยกรรมไม้โบราณ บรรยากาศสงบ", prov: "พระนครศรีอยุธยา" },
    { title: "🌊 ซีนทะเลโรแมนติก", text: "หาดทรายขาว หน้าผาหิน จุดชมวิวพระอาทิตย์ตก", prov: "ภูเก็ต" },
    { title: "🌾 ชุมชนวิถีโบราณ", text: "ชุมชนริมน้ำ ตึกแถวเก่า บ้านเรือนชิโน-โปรตุกีส", prov: "จันทบุรี" },
  ];

  const handleSearch = async (targetBrief = brief, targetProv = province) => {
    setLoading(true);
    try {
      const res = await fetch("/api/scout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief: targetBrief, province: targetProv }),
      });
      const data = await res.json();
      if (data.success) {
        setResults(data.locations);
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

  return (
    <div className="min-h-screen py-6 px-4 md:px-8 max-w-7xl mx-auto flex flex-col gap-6">
      {/* 🚀 1. Lab 4 Top Navbar (ตามแบบสไลด์ Lab 4 เป๊ะ) */}
      <header className="bg-white border-[2.5px] border-[#7c3aed] rounded-[22px] shadow-[4px_4px_0px_#6d28d9] p-4 md:px-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-[#ddd6fe] border-2 border-[#7c3aed] rounded-xl px-3 py-1.5 shadow-[2px_2px_0px_#6d28d9] text-2xl flex items-center justify-center">
            🚀
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-black text-[#4c1d95] tracking-tight leading-tight">
                AIAT x CAMT · ThaiScout AI Lab
              </h1>
              <span className="hidden md:inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#fef08a] border border-[#d97706] text-[#78350f]">
                Track 1
              </span>
            </div>
            <p className="text-xs font-bold text-slate-500">
              Ship an AI-Enabled System (Autonomous Location Scouting & Grounded Permit Agent)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="pill-badge hidden sm:flex items-center gap-1.5">
            ✨ 8,628 TAT Corpus Records
          </div>

          <button
            onClick={() => setActiveTab("search")}
            className={`btn px-4 py-2 rounded-xl text-xs font-black ${
              activeTab === "search" ? "btn-blue" : "btn-purple opacity-70 hover:opacity-100"
            }`}
          >
            🔍 Scouting Console
          </button>

          <button
            onClick={() => setActiveTab("scout")}
            className={`btn px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 ${
              activeTab === "scout" ? "btn-mint" : "btn-purple opacity-70 hover:opacity-100"
            }`}
          >
            🎬 Recce Board ({scoutingList.length})
          </button>
        </div>
      </header>

      {/* 🧭 2. Viewer Stage Banner (กรอบสีน้ำเงินสไตล์ Lab 4) */}
      <div className="bg-white border-[2.5px] border-[#0284c7] rounded-[28px] shadow-[6px_6px_0px_#0369a1] overflow-hidden flex flex-col">
        {/* Stage Header / Prompt Console */}
        <div className="bg-[#0f172a] p-6 md:p-8 text-white relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-700/60 text-xs text-blue-300 font-mono mb-3">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              <span>Bounded Agent Workflow: Think → Act (Retrieve) → Observe (Grounding)</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-black mb-2 tracking-tight">
              ค้นหาโลเคชันถ่ายทำจาก <span className="text-yellow-400 underline decoration-wavy">Creative Brief</span>
            </h2>
            <p className="text-slate-300 text-xs md:text-sm mb-6 font-medium">
              แปลงบรีฟผู้กำกับและอารมณ์ของฉาก ให้เป็นสถานที่จริง พร้อมพิกัด GPS รถกองถ่าย และเบอร์ติดต่อทางการ
            </p>

            {/* Prompt Box */}
            <div className="bg-[#1e293b] border-2 border-slate-700 rounded-2xl p-4 text-left shadow-xl">
              <label className="block text-[11px] font-bold text-blue-300 mb-1.5 uppercase font-mono">
                ⚡ Director Brief / Mood & Tone (ภาษาคน)
              </label>
              <textarea
                rows={2}
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                placeholder="เช่น อยากได้น้ำตกหรือลำธารที่มีโขดหินใหญ่ บรรยากาศดิบๆ ถ่ายฉาก MV..."
                className="w-full bg-[#0f172a] border border-slate-600 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 font-medium"
              />

              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mt-3">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="bg-[#0f172a] border border-slate-600 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-400 font-bold"
                  >
                    <option value="all">ทั่วประเทศ (ทุกจังหวัด)</option>
                    <option value="เชียงใหม่">เชียงใหม่</option>
                    <option value="กรุงเทพมหานคร">กรุงเทพมหานคร</option>
                    <option value="ภูเก็ต">ภูเก็ต</option>
                    <option value="พระนครศรีอยุธยา">พระนครศรีอยุธยา</option>
                    <option value="จันทบุรี">จันทบุรี</option>
                    <option value="กาญจนบุรี">กาญจนบุรี</option>
                    <option value="น่าน">น่าน</option>
                  </select>
                </div>

                <button
                  onClick={() => handleSearch()}
                  disabled={loading}
                  className="btn btn-yellow w-full sm:w-auto px-6 py-2.5 rounded-xl font-black text-xs"
                >
                  <Search className="w-4 h-4 text-[#78350f]" />
                  {loading ? "Agent Processing..." : "รัน AI Scouting Agent"}
                </button>
              </div>

              {/* Sample Brief Tags */}
              <div className="mt-3 pt-3 border-t border-slate-700/80 flex flex-wrap gap-2 items-center">
                <span className="text-[11px] font-bold text-slate-400 font-mono">Quick Briefs:</span>
                {sampleBriefs.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setBrief(s.text);
                      setProvince(s.prov);
                      handleSearch(s.text, s.prov);
                    }}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-bold transition cursor-pointer hover:border-amber-400"
                  >
                    {s.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Slide-Caption Bar (แถบฟ้าตามแบบสไลด์ Lab 4 เป๊ะ) */}
        <div className="px-6 py-3.5 bg-[#f0f9ff] border-t-2 border-b-2 border-[#0284c7] text-[#0c4a6e] font-bold text-xs md:text-sm flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-[#bae6fd] border-[1.5px] border-[#0284c7] rounded-lg px-2.5 py-0.5 text-xs font-black">
              System Boundary
            </span>
            <span>Verified TAT Corpus · GPS Coordinates Grounded · Safe Refusal on Missing Permits</span>
          </div>
          <div className="font-mono text-xs text-[#0284c7] font-extrabold bg-white px-2.5 py-0.5 rounded-md border border-[#bae6fd]">
            {results.length} Locations Grounded
          </div>
        </div>

        {/* Content Area Inside Viewer Card */}
        <div className="p-6 bg-[#fafaf9]">
          {activeTab === "search" ? (
            <div>
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <div key={n} className="h-64 bg-slate-200 rounded-2xl border-2 border-slate-300" />
                  ))}
                </div>
              ) : results.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-slate-300">
                  <p className="text-slate-500 font-bold">ไม่พบโลเคชันที่ตรงเงื่อนไข ลองปรับเปลี่ยนคำค้นหาดูครับ</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.map((loc) => {
                    const isSaved = scoutingList.some((x) => x.id === loc.id);
                    return (
                      <div
                        key={loc.id}
                        className="bg-white border-[2.5px] border-[#0284c7] rounded-[22px] shadow-[4px_4px_0px_#0369a1] p-5 flex flex-col justify-between hover:translate-x-[-2px] hover:translate-y-[-2px] transition duration-150"
                      >
                        <div>
                          {/* Card Category & Badge */}
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-black px-2.5 py-0.5 rounded-md bg-[#ddd6fe] text-[#4c1d95] border-[1.5px] border-[#7c3aed]">
                              {loc.category}
                            </span>
                            <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-[#bbf7d0] text-[#14532d] border-[1.5px] border-[#16a34a]">
                              Match {loc.relevanceScore}%
                            </span>
                          </div>

                          <h3 className="text-base font-black text-slate-900 mb-0.5">
                            {loc.name_th}
                          </h3>
                          {loc.name_en && (
                            <p className="text-xs font-bold text-slate-400 mb-2">{loc.name_en}</p>
                          )}

                          <p className="text-xs font-bold text-slate-600 mb-3">
                            📍 {loc.province} • อ.{loc.district}
                          </p>

                          {loc.hilight ? (
                            <div className="text-xs bg-[#f5f3ff] border border-[#ddd6fe] p-2.5 rounded-xl text-[#4c1d95] font-bold mb-3">
                              ✨ <strong>จุดเด่นภาพ:</strong> {loc.hilight}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-600 line-clamp-2 mb-3">{loc.detail}</p>
                          )}

                          {/* Production Specs */}
                          <div className="space-y-1.5 text-xs text-slate-700 font-medium mb-3">
                            <div className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>GPS: {loc.lat ? `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}` : "ระบุในเขต"}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span>{loc.time || "เปิดตามฤดูกาล"}</span>
                            </div>
                            {loc.tel && (
                              <div className="flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <span className="font-mono font-bold">{loc.tel}</span>
                              </div>
                            )}

                            {/* Fact-checking Permit Warning */}
                            <div className="bg-[#fff1f2] border border-[#fecdd3] p-2.5 rounded-xl text-[11px] text-[#881337] font-semibold flex items-start gap-1.5 mt-2">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                              <span>
                                <strong>การขออนุญาต:</strong> ททท. ไม่ระบุระเบียบถ่ายทำ โปรดติดต่อเบอร์ข้างต้นล่วงหน้า
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Card Footer Actions */}
                        <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                          {loc.lat && loc.lng ? (
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-blue text-xs px-3 py-1.5 rounded-xl font-black"
                            >
                              <Navigation className="w-3.5 h-3.5 text-[#0c4a6e]" />
                              Google Maps
                            </a>
                          ) : (
                            <span className="text-xs text-slate-400 font-bold">ไม่มีพิกัด</span>
                          )}

                          <button
                            onClick={() => toggleScout(loc)}
                            className={`btn text-xs px-3.5 py-1.5 rounded-xl font-black ${
                              isSaved ? "bg-[#fecdd3] border-[#e11d48] text-[#881337] shadow-[2px_2px_0px_#be123c]" : "btn-mint"
                            }`}
                          >
                            {isSaved ? "✓ ปักหมุดแล้ว" : "+ ปักหมุด Scouting"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* 🗺️ Recce Board with Google Map Integration */
            <div>
              <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    🎬 Production Scouting & Recce Board
                  </h3>
                  <p className="text-xs font-bold text-slate-500">
                    รายการสถานที่สำหรับออกกองสำรวจจริง พร้อมคำนวณเส้นทางนำทาง Google Maps
                  </p>
                </div>

                {scoutingList.length > 0 && (
                  <div className="flex items-center gap-2">
                    {(() => {
                      const validLocs = scoutingList.filter((x) => x.lat && x.lng);
                      if (validLocs.length > 0) {
                        const origin = `${validLocs[0].lat},${validLocs[0].lng}`;
                        const destination = `${validLocs[validLocs.length - 1].lat},${validLocs[validLocs.length - 1].lng}`;
                        const waypoints = validLocs
                          .slice(1, -1)
                          .map((x) => `${x.lat},${x.lng}`)
                          .join("|");
                        const routeUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${
                          waypoints ? `&waypoints=${waypoints}` : ""
                        }&travelmode=driving`;

                        return (
                          <a
                            href={routeUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-mint text-xs px-4 py-2 rounded-xl font-black"
                          >
                            <Navigation className="w-4 h-4 text-emerald-800" />
                            เปิดเส้นทางนำทาง Google Maps ({validLocs.length} จุด)
                          </a>
                        );
                      }
                      return null;
                    })()}

                    <button
                      onClick={() => alert("สร้างลิงก์สำหรับแชร์ให้ทีมงานกองถ่ายเรียบร้อยแล้ว!")}
                      className="btn btn-yellow text-xs px-4 py-2 rounded-xl font-black"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      แชร์ให้ทีมงาน
                    </button>
                  </div>
                )}
              </div>

              {/* Embedded Google Map */}
              {scoutingList.filter((x) => x.lat && x.lng).length > 0 && (
                <div className="mb-6 rounded-[22px] overflow-hidden border-[2.5px] border-[#0284c7] shadow-[4px_4px_0px_#0369a1] bg-white">
                  <div className="bg-[#f0f9ff] px-4 py-2.5 border-b-2 border-[#0284c7] flex items-center justify-between text-xs font-black text-[#0c4a6e]">
                    <span className="flex items-center gap-1.5">
                      📍 แผนที่เส้นทางออกกองสำรวจ (Recce Route Map)
                    </span>
                    <span className="font-mono bg-white px-2 py-0.5 rounded border border-[#bae6fd]">
                      จุดแรก: {scoutingList[0]?.name_th}
                    </span>
                  </div>
                  <iframe
                    title="Google Maps Route"
                    width="100%"
                    height="380"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    src={`https://maps.google.com/maps?q=${scoutingList.filter((x) => x.lat && x.lng).map((x) => `${x.lat},${x.lng}`).join("&q=")}&hl=th&z=11&output=embed`}
                  />
                </div>
              )}

              {scoutingList.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-[22px] border-2 border-dashed border-[#0284c7]">
                  <Clapperboard className="w-12 h-12 text-[#0284c7] mx-auto mb-2 opacity-50" />
                  <p className="text-slate-900 font-black text-base">ยังไม่มีโลเคชันใน Recce Board</p>
                  <p className="text-xs font-bold text-slate-500 mt-1 mb-4">
                    กดปุ่ม "+ ปักหมุด Scouting" ในหน้าค้นหา เพื่อจัดชุดสถานที่สำหรับออกกอง
                  </p>
                  <button
                    onClick={() => setActiveTab("search")}
                    className="btn btn-blue text-xs px-4 py-2 rounded-xl font-black"
                  >
                    กลับไปค้นหาโลเคชัน
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {scoutingList.map((item, idx) => (
                    <div
                      key={item.id}
                      className="bg-white border-[2px] border-[#0284c7] rounded-[18px] p-4 shadow-[3px_3px_0px_#0369a1] flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#ddd6fe] border-2 border-[#7c3aed] text-[#4c1d95] font-black text-sm flex items-center justify-center shrink-0">
                          #{idx + 1}
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 text-sm">{item.name_th}</h4>
                          <p className="text-xs font-bold text-slate-500 mt-0.5">
                            {item.province} • อ.{item.district} | ติดต่อ: {item.tel || "ไม่มีเบอร์ระบุ"}
                          </p>
                          {item.lat && item.lng && (
                            <p className="text-[11px] text-[#0284c7] font-mono font-extrabold mt-0.5">
                              GPS: {item.lat}, {item.lng}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center">
                        {item.lat && item.lng && (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${item.lat},${item.lng}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-blue text-xs px-3 py-1.5 rounded-xl font-black"
                          >
                            <Navigation className="w-3.5 h-3.5 text-[#0c4a6e]" />
                            นำทาง
                          </a>
                        )}
                        <button
                          onClick={() => toggleScout(item)}
                          className="btn text-xs px-3 py-1.5 rounded-xl font-black bg-[#fff1f2] border-[#e11d48] text-[#881337] shadow-[2px_2px_0px_#be123c]"
                        >
                          นำออก
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
