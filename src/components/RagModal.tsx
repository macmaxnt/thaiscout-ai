"use client";

import React, { useState, useEffect } from "react";
import { 
  Sparkles, X, Camera, Truck, ShieldAlert, Send, 
  HelpCircle, CheckCircle2, AlertTriangle, FileText, Phone, Compass, MapPin, Clock
} from "lucide-react";
import {
  IconAlertTriangle,
  IconBook2,
  IconBuildingSkyscraper,
  IconDrone,
  IconMapPinPlus,
  IconMessageCircle,
  IconPalette,
  IconSearch,
  IconSun,
  IconTargetArrow,
  IconVolume,
  IconBolt,
} from "@tabler/icons-react";

interface RagModalProps {
  location: any;
  brief: string;
  onClose: () => void;
  isPinned?: boolean;
  onToggleScout?: (loc: any) => void;
}

export default function RagModal({
  location,
  brief,
  onClose,
  isPinned = false,
  onToggleScout,
}: RagModalProps) {
  const [loading, setLoading] = useState(true);
  const [dossier, setDossier] = useState<any>(null);
  const [question, setQuestion] = useState("");
  const [qaLoading, setQaLoading] = useState(false);
  const [qaList, setQaList] = useState<{ q: string; a: string; citation: any }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [qaError, setQaError] = useState<string | null>(null);

  useEffect(() => {
    fetchDossier();
  }, [location]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const fetchDossier = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/rag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location, brief }),
      });
      const data = await res.json();
      if (data.success) {
        setDossier(data.dossier);
      } else {
        setError(data.error || "ไม่สามารถโหลดข้อมูลวิเคราะห์ได้ในขณะนี้");
      }
    } catch (err) {
      console.error(err);
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  const handleAsk = async (askText = question) => {
    if (!askText.trim()) return;
    setQaLoading(true);
    setQaError(null);
    try {
      const res = await fetch("/api/rag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location, brief, question: askText }),
      });
      const data = await res.json();
      if (data.success) {
        setQaList((prev) => [
          ...prev,
          { q: askText, a: data.answer, citation: data.citation },
        ]);
        setQuestion("");
      } else {
        setQaError(data.error || "ยังตอบคำถามนี้ไม่ได้ กรุณาลองปรับคำถามอีกครั้ง");
      }
    } catch (err) {
      console.error(err);
      setQaError("เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setQaLoading(false);
    }
  };

  const quickQuestions = [
    "บินโดรนถ่ายมุมสูงได้ไหม มีขั้นตอนยังไง?",
    "รถตู้กองถ่ายและรถปั่นไฟเข้าถึงจุดถ่ายทำได้ไหม?",
    "เสียค่าธรรมเนียมขอถ่ายทำเท่าไหร่ ติดต่อใคร?",
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="rag-modal-title"
        className="bg-white border border-[#285185]/30 rounded-[24px] shadow-[0_24px_70px_rgba(24,51,84,0.28)] w-full max-w-6xl overflow-hidden my-auto flex flex-col max-h-[94vh]"
      >
        
        {/* Modal Header */}
        <div className="bg-white border-b border-slate-200 p-4 sm:px-6 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-[#285185] rounded-2xl p-2.5 text-white shadow-sm shrink-0">
              <IconBolt size={24} stroke={2.2} />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 id="rag-modal-title" className="text-base sm:text-lg font-black tracking-tight text-[#1b3558]">
                  AI RAG Production Consultant
                </h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#eaf2f7] text-[#285185]">
                  Grounded with TAT Corpus
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-500 truncate">
                {location.name_th} <span className="text-slate-400">·</span> {location.province} <span className="text-slate-400">·</span> Corpus ID #{location.id}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onToggleScout && (
              <button
                type="button"
                onClick={() => onToggleScout(location)}
                aria-label={isPinned ? "ปลดหมุดสถานที่นี้" : "ปักหมุดสถานที่นี้"}
                className={`min-h-10 px-3.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition cursor-pointer border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d67940]/40 focus-visible:ring-offset-2 ${
                  isPinned
                    ? "bg-[#fff7ed] border-[#f1c39f] text-[#a8521d] hover:bg-[#ffeddc]"
                    : "bg-[#d67940] text-white border-[#d67940] hover:bg-[#c06530]"
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  {isPinned ? <IconMapPinPlus size={14} /> : <IconMapPinPlus size={14} />}
                  {isPinned ? "ปลดหมุด" : "+ ปักหมุด"}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label="ปิดหน้าต่าง AI RAG Production Consultant"
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-[#1b3558] border border-slate-200 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#285185]/30 focus-visible:ring-offset-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 lg:p-7 overflow-y-auto overscroll-contain scroll-py-6 space-y-4 flex-1 bg-[#f8fafc]">
          
          {loading ? (
            <div role="status" className="min-h-[360px] flex flex-col items-center justify-center text-center rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="w-11 h-11 border-4 border-[#dbe7ef] border-t-[#285185] rounded-full animate-spin mb-4"></div>
              <p className="font-black text-slate-700 text-sm">
                กำลังวิเคราะห์ข้อมูลสถานที่
              </p>
              <p className="text-xs font-semibold text-slate-400 mt-1">
                ดึงข้อมูลจาก TAT Corpus และเตรียมคำแนะนำสำหรับกองถ่าย...
              </p>
            </div>
          ) : error ? (
            <div role="alert" className="min-h-[360px] flex flex-col items-center justify-center text-center rounded-2xl border border-[#f1c39f] bg-[#fffaf5] p-6 shadow-sm">
              <div className="rounded-2xl bg-[#fff0e5] p-3 text-[#a8521d] mb-3">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <p className="font-black text-[#7c2d12] text-sm">ยังโหลดคำแนะนำไม่ได้</p>
              <p className="text-xs font-semibold text-slate-500 mt-1 max-w-sm">{error}</p>
              <button
                type="button"
                onClick={fetchDossier}
                className="mt-4 min-h-10 px-4 rounded-lg bg-[#285185] text-white text-xs font-black hover:bg-[#1b3558] transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#285185]/30 focus-visible:ring-offset-2"
              >
                ลองใหม่อีกครั้ง
              </button>
            </div>
          ) : dossier ? (
            <>
              {/* ข้อ 3: แสดงชัดว่าส่วนไหนเป็นข้อมูลจริง / ส่วนไหน AI วิเคราะห์ */}
              <div className="rounded-2xl border border-[#ead7a4] bg-[#fffbeb] p-3.5 sm:p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-black text-[#713f12]">
                  <IconSearch size={17} />
                  <span>อ่านคำแนะนำนี้อย่างไร</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mt-3 text-[11px] leading-relaxed">
                  <div className="flex items-start gap-2 rounded-xl bg-white/80 border border-[#f2dfb2] p-2.5 text-slate-700">
                    <span className="bg-[#0284c7] text-white text-[9px] font-black px-1.5 py-0.5 rounded shrink-0 mt-0.5">ททท.</span>
                    <span><strong>ข้อมูลจริง</strong> จากฐานข้อมูล Tourism Authority of Thailand เช่น รายละเอียด พิกัด และเบอร์ติดต่อ</span>
                  </div>
                  <div className="flex items-start gap-2 rounded-xl bg-white/80 border border-[#f2dfb2] p-2.5 text-slate-700">
                    <span className="bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded shrink-0 mt-0.5">AI</span>
                    <span><strong>การวิเคราะห์</strong> จาก RAG Engine เพื่อช่วยวางแผนกองถ่าย ควรยืนยันกับหน่วยงานจริงก่อนใช้งาน</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wide text-slate-400"><MapPin className="w-3.5 h-3.5 text-[#d67940]" /> พิกัดสถานที่</div>
                  <p className="mt-1.5 text-xs font-bold text-[#1b3558]">{location.lat ?? "-"}, {location.lng ?? "-"}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wide text-slate-400"><Phone className="w-3.5 h-3.5 text-[#d67940]" /> ติดต่อ</div>
                  <p className="mt-1.5 text-xs font-bold text-[#1b3558] truncate">{location.tel || "ไม่มีข้อมูลเบอร์ติดต่อ"}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wide text-slate-400"><Clock className="w-3.5 h-3.5 text-[#d67940]" /> ช่วงเวลาแนะนำ</div>
                  <p className="mt-1.5 text-xs font-bold text-[#1b3558] truncate">{location.time || "ดูจากคำแนะนำด้านล่าง"}</p>
                </div>
              </div>

              {/* Full Original Description from TAT (Span full width) */}
              {location.detail && (
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3 mb-2.5 text-[#1b3558] font-black text-sm">
                    <span className="flex items-center gap-2">
                      <span className="rounded-lg bg-[#eaf2f7] p-1.5"><FileText className="w-4 h-4 text-[#285185]" /></span>
                      <span>ข้อมูลจาก ททท. ฉบับเต็ม</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 font-bold shrink-0">
                      {location.detail.length} ตัวอักษร
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium bg-[#f8fafc] p-3 rounded-xl border border-slate-200 whitespace-pre-line max-h-36 overflow-y-auto">
                    {location.detail}
                  </p>
                  {location.activity && (
                    <p className="text-xs text-[#1b3558] font-bold mt-2.5">
                      <span className="inline-flex items-center gap-1"><IconTargetArrow size={14} /> กิจกรรมที่ ททท. แนะนำ: {location.activity}</span>
                    </p>
                  )}
                </div>
              )}

              {/* 2-Column Grid for Dossier Sections (กางออกด้านข้าง ไม่อึดอัด) */}
              <div className="grid grid-cols-1 md:grid-cols-2 items-start gap-4">
                
                {/* 1. Cinematic & Lighting Analysis */}
                <div className="bg-white border border-[#cbd9e4] rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-100">
                    <span className="rounded-xl bg-[#eaf2f7] p-2 text-[#285185]"><Camera className="w-4 h-4" /></span>
                    <div><p className="text-[10px] font-black uppercase tracking-wide text-[#d67940]">Cinematic</p><p className="text-sm font-black text-[#1b3558]">1. มุมกล้องและช่วงเวลา</p></div>
                  </div>
                  <div className="space-y-2.5">
                    <div className="bg-[#f8fafc] p-3 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-1.5 text-[11px] font-black text-[#285185]"><IconSun size={15} /> แสงที่แนะนำ</div>
                      <p className="mt-1.5 text-sm leading-relaxed font-semibold text-slate-700">{dossier.cinematicAnalysis.lightingRecommendation}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-1.5 text-[11px] font-black text-[#1b3558]"><IconPalette size={15} /> มิติภาพและโทนภาพ</div>
                      <p className="mt-1.5 text-sm leading-relaxed font-semibold text-slate-700">{dossier.cinematicAnalysis.visualAesthetic}</p>
                    </div>
                    <div className="p-3 text-[#7c2d12] bg-[#fff7ed] rounded-xl border border-[#fed7aa]">
                      <div className="flex items-center gap-1.5 text-[11px] font-black"><IconVolume size={15} /> สภาพเสียงในกอง</div>
                      <p className="mt-1.5 text-sm leading-relaxed font-semibold">{dossier.cinematicAnalysis.soundEnvironment}</p>
                    </div>
                  </div>
                </div>

                {/* 2. Logistics & Gear Access */}
                <div className="bg-white border border-[#efd8c7] rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-100">
                    <span className="rounded-xl bg-[#fff1e8] p-2 text-[#d67940]"><Truck className="w-4 h-4" /></span>
                    <div><p className="text-[10px] font-black uppercase tracking-wide text-[#d67940]">Logistics</p><p className="text-sm font-black text-[#7c2d12]">2. การเดินทางและระบบไฟ</p></div>
                  </div>
                  <div className="space-y-2.5">
                    <div className="bg-[#fffaf5] p-3 rounded-xl border border-[#f6ddca]">
                      <div className="flex items-center gap-1.5 text-[11px] font-black text-[#a8521d]"><CheckCircle2 className="w-4 h-4" /> ระดับความสะดวก</div>
                      <p className="mt-1.5 text-sm leading-relaxed font-semibold text-slate-700">{dossier.logisticsAnalysis.accessGrade}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-1.5 text-[11px] font-black text-[#7c2d12]"><IconBolt size={15} /> ระบบไฟและเครื่องปั่นไฟ</div>
                      <p className="mt-1.5 text-sm leading-relaxed font-semibold text-slate-700">{dossier.logisticsAnalysis.powerAndGear}</p>
                    </div>
                    <div className="p-3 bg-[#fff7ed] rounded-xl border border-[#fed7aa] text-[#7c2d12]">
                      <div className="flex items-center gap-1.5 text-[11px] font-black"><IconBuildingSkyscraper size={15} /> ขนาดกองถ่ายที่แนะนำ</div>
                      <p className="mt-1.5 text-sm leading-relaxed font-semibold">{dossier.logisticsAnalysis.crewCapacity}</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* 3. Permit & Safe Refusal (Span Full Width) */}
              <div className="bg-[#fffaf9] border border-[#e8caca] rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 text-[#4a2829] font-black text-sm">
                    <span className="rounded-xl bg-[#fbeaea] p-2 text-[#6f4849]"><ShieldAlert className="w-4 h-4" /></span>
                    <div><p className="text-[10px] font-black uppercase tracking-wide text-[#a35b5d]">Safety & Permit</p><p>3. ระเบียบขออนุญาต</p></div>
                  </div>
                  <span className="text-[10px] font-mono font-black uppercase px-2 py-1 rounded-lg bg-white text-[#6f4849] border border-[#6f4849]/25 shrink-0">
                    TAT Grounded
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs font-medium text-slate-800">
                  <div className="bg-white p-3 rounded-xl border border-[#6f4849]/20">
                    <div className="flex items-center gap-1.5 text-[11px] font-black text-[#4a2829]"><IconBuildingSkyscraper size={15} /> หน่วยงานกำกับดูแล</div>
                    <p className="mt-1.5 text-sm leading-relaxed font-semibold">{dossier.permitAndSafety.governingBody}</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-[#6f4849]/20">
                    <div className="flex items-center gap-1.5 text-[11px] font-black text-[#4a2829]"><IconDrone size={15} /> ระเบียบโดรน</div>
                    <p className="mt-1.5 text-sm leading-relaxed font-semibold">{dossier.permitAndSafety.droneNotice}</p>
                  </div>
                  <div className="md:col-span-2 bg-[#fdf3eb] border border-[#fcd9bd] p-3 rounded-xl text-[#7c2d12]">
                    <div className="flex items-center gap-1.5 text-[11px] font-black"><IconAlertTriangle size={15} /> กฎ Safe Refusal</div>
                    <p className="mt-1.5 text-sm leading-relaxed font-semibold">{dossier.permitAndSafety.safeRefusalRule}</p>
                  </div>
                  <div className="md:col-span-2 bg-[#fff7ed] border border-[#fed7aa] p-3 rounded-xl text-[#7c2d12]">
                    <div className="flex items-center gap-1.5 text-[11px] font-black"><ShieldAlert className="w-4 h-4" /> จุดที่ต้องระวังหน้างาน</div>
                    <p className="mt-1.5 text-sm leading-relaxed font-semibold">{dossier.permitAndSafety.safetyHazard}</p>
                  </div>
                </div>
              </div>

              {/* 4. Interactive Q&A Assistant */}
              <div className="bg-[#f5f9fc] border border-[#b9cede] rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <span className="rounded-xl bg-[#dceaf3] p-2 text-[#285185]"><HelpCircle className="w-4 h-4" /></span>
                  <div><p className="text-[10px] font-black uppercase tracking-wide text-[#6b89a7]">Ask the consultant</p><p className="text-sm font-black text-[#1b3558]">ถามคำถามเจาะลึกเฉพาะสถานที่นี้</p></div>
                </div>

                {/* Quick Prompts */}
                <div className="flex flex-wrap gap-1.5 mb-3" aria-label="คำถามแนะนำ">
                  {quickQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAsk(q)}
                      disabled={qaLoading}
                      className="min-h-9 text-[11px] px-2.5 rounded-lg bg-white hover:bg-[#eaf2f7] hover:border-[#285185]/40 text-[#1b3558] border border-[#cbd9e4] font-bold transition cursor-pointer text-left disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#285185]/30 focus-visible:ring-offset-1"
                    >
                      <span className="inline-flex items-center gap-1.5">
                        {idx === 0 ? <IconDrone size={14} /> : idx === 1 ? <Truck className="w-3.5 h-3.5" /> : <IconBuildingSkyscraper size={14} />}
                        {q}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Question Input */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    aria-label="พิมพ์คำถามเกี่ยวกับสถานที่"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAsk()}
                    placeholder="เช่น ทางเดินแคบไหม? มีห้องน้ำสำหรับนักแสดงไหม?..."
                    className="flex-1 min-w-0 bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#285185]/20 focus:border-[#285185]"
                  />
                  <button
                    type="button"
                    onClick={() => handleAsk()}
                    disabled={qaLoading || !question.trim()}
                    className="min-h-10 text-xs px-4 rounded-lg font-black bg-[#285185] hover:bg-[#1b3558] disabled:bg-slate-300 disabled:cursor-not-allowed text-white flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0 sm:min-w-[112px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#285185]/30 focus-visible:ring-offset-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {qaLoading ? "กำลังวิเคราะห์..." : "ถาม AI"}
                  </button>
                </div>
                {qaError && (
                  <p role="alert" className="mt-2 text-[11px] font-bold text-[#a8521d]">{qaError}</p>
                )}

                {/* Q&A Stream / History */}
                {qaList.length > 0 && (
                  <div className="mt-4 space-y-3 pt-3 border-t border-slate-200">
                    {qaList.map((item, idx) => (
                      <div key={idx} className="space-y-1.5 text-xs">
                        <div className="font-black text-[#1b3558] bg-white p-2.5 rounded-lg border border-[#cbd9e4]">
                          <span className="inline-flex items-center gap-1"><IconMessageCircle size={14} /> {item.q}</span>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-slate-200 whitespace-pre-line text-slate-800 leading-relaxed font-medium shadow-xs">
                          {item.a}
                          {item.citation && (
                            <div className="mt-2 pt-2 border-t border-slate-200 text-[10px] font-mono text-slate-500 flex items-center justify-between">
                              <span className="inline-flex items-center gap-1"><IconBook2 size={13} /> แหล่งข้อมูล: {item.citation.source}</span>
                              <span className="font-bold text-[#285185]">ID: #{item.citation.corpusId}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : null}

        </div>

        {/* Modal Footer */}
        <div className="bg-white border-t border-slate-200 p-3 sm:px-6 flex items-center justify-between gap-3 text-xs shrink-0">
          <div className="text-[10px] sm:text-[11px] font-semibold text-slate-400 leading-relaxed">
            วิเคราะห์โดย ThaiScout AI RAG Engine · อ้างอิงฐานข้อมูล ททท. 8,628 แห่ง
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-10 px-4 rounded-lg font-bold bg-white hover:bg-[#eaf2f7] border border-[#b9cede] text-[#285185] transition cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#285185]/30 focus-visible:ring-offset-2"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
}
