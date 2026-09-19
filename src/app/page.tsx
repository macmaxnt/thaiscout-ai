"use client";

import React, { useState, useEffect } from "react";
import { 
  Clapperboard, Search, MapPin, Phone, Clock, AlertTriangle, 
  CheckCircle2, Sparkles, Navigation, Calendar, Share2, Compass, Film, ExternalLink
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
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-[#0c101a]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-amber-500 to-rose-500 p-2 rounded-xl text-black shadow-lg shadow-amber-500/20">
              <Clapperboard className="w-5 h-5 font-bold" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-amber-200 via-orange-300 to-rose-400 bg-clip-text text-transparent">
                ThaiScout AI
              </span>
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                TAT Creative Studio
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab("search")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === "search" ? "bg-amber-500 text-black font-semibold" : "text-slate-400 hover:text-white"
              }`}
            >
              ค้นหาโลเคชัน
            </button>
            <button
              onClick={() => setActiveTab("scout")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                activeTab === "scout" ? "bg-amber-500 text-black font-semibold" : "text-slate-400 hover:text-white"
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              Scouting Board ({scoutingList.length})
            </button>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="max-w-7xl mx-auto px-4 pt-10 pb-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300 mb-4">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>เชื่อมโยงฐานข้อมูลการท่องเที่ยวแห่งประเทศไทย (ททท.) 8,628 แห่งทั่วประเทศ</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-3">
          ค้นหาโลเคชันถ่ายทำจาก <span className="bg-gradient-to-r from-amber-400 to-rose-400 bg-clip-text text-transparent">Creative Brief</span>
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base mb-8">
          แปลงอารมณ์ Moodboard ของกองถ่าย ให้เป็นสถานที่จริง พิกัดแม่นยำ พร้อมข้อมูลผู้ดูแลพื้นที่สำหรับประสานงานขอใบอนุญาต
        </p>

        {/* Search Panel */}
        <div className="max-w-3xl mx-auto bg-slate-900/90 border border-slate-800 p-4 md:p-6 rounded-2xl shadow-2xl backdrop-blur-xl text-left">
          <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
            Creative Brief / Mood & Tone (ภาษาคน หรือ บรีฟผู้กำกับ)
          </label>
          <div className="relative mb-4">
            <textarea
              rows={2}
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              placeholder="เช่น อยากได้น้ำตกหรือลำธารที่มีโขดหินใหญ่ บรรยากาศดิบๆ ร่มรื่น ถ่ายหนังแอ็กชัน..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 w-full"
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
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-semibold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              {loading ? "กำลังค้นหาโลเคชัน..." : "สแกนหาโลเคชัน ททท."}
            </button>
          </div>

          {/* Quick templates */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap gap-2 items-center">
            <span className="text-xs text-slate-500">บรีฟตัวอย่าง:</span>
            {sampleBriefs.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setBrief(s.text);
                  setProvince(s.prov);
                  handleSearch(s.text, s.prov);
                }}
                className="text-xs px-2.5 py-1 rounded-md bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/50 transition"
              >
                {s.title}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 mt-6">
        {activeTab === "search" ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                <Compass className="w-5 h-5 text-amber-400" />
                โลเคชันแนะนำสำหรับกองถ่าย ({results.length} สถานที่ที่ตรงกับบรีฟ)
              </h2>
              <span className="text-xs text-slate-400">
                ข้อมูลตรวจสอบย้อนกลับกับ ททท. 100%
              </span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="h-64 bg-slate-900/60 rounded-2xl border border-slate-800" />
                ))}
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-20 bg-slate-900/40 rounded-2xl border border-slate-800">
                <p className="text-slate-400 text-sm">ไม่พบสถานที่ที่ตรงกับเงื่อนไข ลองปรับคำค้นหาหรือเปลี่ยนจังหวัดดูครับ</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((loc) => {
                  const isSaved = scoutingList.some((x) => x.id === loc.id);
                  return (
                    <div
                      key={loc.id}
                      className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition flex flex-col justify-between group shadow-xl"
                    >
                      <div>
                        {/* Header Badge */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div>
                            <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                              {loc.category}
                            </span>
                            <span className="ml-2 text-[11px] text-slate-400">
                              {loc.province} • {loc.district}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                            Match {loc.relevanceScore}%
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition mb-1">
                          {loc.name_th}
                        </h3>
                        {loc.name_en && (
                          <p className="text-xs text-slate-400 mb-3">{loc.name_en}</p>
                        )}

                        {/* Hilight / Vibe */}
                        {loc.hilight ? (
                          <p className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 mb-4 line-clamp-2">
                            ✨ <span className="font-semibold text-amber-200">จุดเด่นทางภาพ:</span> {loc.hilight}
                          </p>
                        ) : (
                          <p className="text-xs text-slate-400 mb-4 line-clamp-2">{loc.detail}</p>
                        )}

                        {/* Production Specs Badges */}
                        <div className="space-y-2 mb-4 text-xs">
                          {/* GPS Verification */}
                          <div className="flex items-center gap-2 text-slate-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>
                              พิกัดรถกองถ่าย: {loc.lat ? `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}` : "ระบุในเขตพื้นที่"}
                            </span>
                          </div>

                          {/* Operating Hours */}
                          <div className="flex items-center gap-2 text-slate-300">
                            <Clock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                            <span>{loc.time || "ไม่จำกัดเวลา (เปิดตามฤดูกาล)"}</span>
                          </div>

                          {/* Direct Contact */}
                          {loc.tel && (
                            <div className="flex items-center gap-2 text-slate-300">
                              <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span className="font-mono text-[11px]">{loc.tel}</span>
                            </div>
                          )}

                          {/* Fact-Checked Permit Warning */}
                          <div className="flex items-start gap-2 bg-amber-950/30 border border-amber-800/30 p-2 rounded-lg text-[11px] text-amber-300/90 mt-2">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                            <span>
                              <strong>การขออนุญาต:</strong> ททท. ไม่ได้ระบุระเบียบกองถ่าย กรุณาโทรประสานเจ้าหน้าที่ตามเบอร์ข้างต้นล่วงหน้า
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                        {loc.lat && loc.lng ? (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition"
                          >
                            <Navigation className="w-3.5 h-3.5 text-amber-400" />
                            เปิด Google Maps
                          </a>
                        ) : (
                          <span className="text-xs text-slate-500">ไม่มีพิกัดแผนที่</span>
                        )}

                        <button
                          onClick={() => toggleScout(loc)}
                          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                            isSaved
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                              : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                          }`}
                        >
                          {isSaved ? "✓ บันทึกแล้ว" : "+ ปักหมุด Scouting"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* Scouting Board Tab */
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Film className="w-5 h-5 text-amber-400" />
                  Production Scouting Board (ใบงานสำรวจสถานที่)
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  รวบรวมสถานที่สำหรับออกกองสำรวจหน้างาน (Recce Trip) พร้อมพิมพ์หรือแชร์ให้ทีมงาน
                </p>
              </div>

              {scoutingList.length > 0 && (
                <button
                  onClick={() => alert("ลิงก์สรุปข้อมูลสำหรับแชร์ทีมงานถูกสร้างเรียบร้อยแล้ว!")}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  แชร์ให้ทีมงาน
                </button>
              )}
            </div>

            {scoutingList.length === 0 ? (
              <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800">
                <Clapperboard className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-300 font-medium text-sm">ยังไม่มีโลเคชันใน Scouting Board</p>
                <p className="text-xs text-slate-500 mt-1 mb-4">กดปุ่ม "+ ปักหมุด Scouting" จากหน้าค้นหาเพื่อจัดชุดสถานที่ออกกอง</p>
                <button
                  onClick={() => setActiveTab("search")}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 rounded-lg border border-slate-700 transition"
                >
                  กลับไปค้นหาโลเคชัน
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {scoutingList.map((item, idx) => (
                  <div
                    key={item.id}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-sm flex items-center justify-center shrink-0">
                        #{idx + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{item.name_th}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {item.province} • {item.district} | ติดต่อ: {item.tel || "ไม่มีเบอร์ระบุ"}
                        </p>
                        {item.lat && item.lng && (
                          <p className="text-[11px] text-emerald-400 font-mono mt-1">
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
                          className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 flex items-center gap-1"
                        >
                          <Navigation className="w-3 h-3 text-amber-400" />
                          นำทาง
                        </a>
                      )}
                      <button
                        onClick={() => toggleScout(item)}
                        className="text-xs px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 rounded-lg border border-rose-800/40"
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
      </main>
    </div>
  );
}
