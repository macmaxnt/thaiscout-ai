"use client";

import React, { useState, useEffect } from "react";
import { 
  Sparkles, X, Camera, Truck, ShieldAlert, Send, 
  HelpCircle, CheckCircle2, AlertTriangle, FileText, Phone, Compass
} from "lucide-react";

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

  useEffect(() => {
    fetchDossier();
  }, [location]);

  const fetchDossier = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/rag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location, brief }),
      });
      const data = await res.json();
      if (data.success) {
        setDossier(data.dossier);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAsk = async (askText = question) => {
    if (!askText.trim()) return;
    setQaLoading(true);
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
      }
    } catch (err) {
      console.error(err);
    } finally {
      setQaLoading(false);
    }
  };

  const quickQuestions = [
    "🚁 บินโดรนถ่ายมุมสูงได้ไหม มีขั้นตอนยังไง?",
    "🚐 รถตู้กองถ่ายและรถปั่นไฟเข้าถึงจุดถ่ายทำได้ไหม?",
    "💰 เสียค่าธรรมเนียมขอถ่ายทำเท่าไหร่ ติดต่อใคร?",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white border-[3px] border-[#7c3aed] rounded-[28px] shadow-[8px_8px_0px_#6d28d9] w-full max-w-3xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-[#f5f3ff] border-b-2 border-[#7c3aed] p-4 sm:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-[#ddd6fe] border-2 border-[#7c3aed] rounded-xl p-2 text-xl shadow-[2px_2px_0px_#6d28d9]">
              ✨
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-[#4c1d95]">
                  AI RAG Production Consultant
                </h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#bbf7d0] border border-[#16a34a] text-[#14532d]">
                  Grounded with TAT Corpus
                </span>
              </div>
              <p className="text-xs font-bold text-slate-500">
                {location.name_th} ({location.province}) • Corpus ID: #{location.id}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onToggleScout && (
              <button
                type="button"
                onClick={() => onToggleScout(location)}
                className={`btn px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer ${
                  isPinned
                    ? "bg-[#ffe4e6] border-2 border-[#e11d48] text-[#9f1239] shadow-[2px_2px_0px_#be123c]"
                    : "btn-mint shadow-[2px_2px_0px_#15803d]"
                }`}
              >
                {isPinned ? "✕ ปลดหมุด" : "📌 + ปักหมุด"}
              </button>
            )}

            <button
              onClick={onClose}
              className="btn btn-purple p-2 rounded-xl text-xs font-black cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 bg-[#fafaf9]">
          
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 border-4 border-[#7c3aed] border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="font-black text-slate-700 text-sm">
                กำลังดึงบริบทสถานที่ & วิเคราะห์ความเป็นไปได้ของกองถ่าย (RAG Retrieval)...
              </p>
              <p className="text-xs font-bold text-slate-400 mt-1">
                Applying Grounded Facts & Safety Refusal Rules
              </p>
            </div>
          ) : dossier ? (
            <>
              {/* ⚠️ ข้อ 3: แสดงชัดว่าส่วนไหนเป็นข้อมูลจริง / ส่วนไหน AI วิเคราะห์ */}
              <div className="bg-amber-50 border-2 border-amber-300 rounded-[16px] p-3 shadow-[2px_2px_0px_#d97706] flex items-start gap-2.5">
                <span className="text-base shrink-0">🔍</span>
                <div className="text-[11px] font-bold text-amber-900 leading-relaxed">
                  <span className="font-black">แหล่งข้อมูลในหน้านี้มี 2 ประเภท:</span>
                  <div className="mt-1.5 space-y-1">
                    <div className="flex items-start gap-1.5">
                      <span className="bg-[#0284c7] text-white text-[9px] font-black px-1.5 py-0.5 rounded shrink-0 mt-0.5">ททท.</span>
                      <span><strong>ข้อมูลจริง:</strong> รายละเอียดสถานที่ พิกัด GPS เบอร์ติดต่อ — ดึงตรงจากฐานข้อมูล Tourism Authority of Thailand (TAT) Corpus ID #{location.id}</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded shrink-0 mt-0.5">AI</span>
                      <span><strong>การวิเคราะห์โดย AI:</strong> มุมกล้อง แสง โลจิสติกส์ ระเบียบโดรน — สร้างจาก RAG Engine โดยอ้างอิงข้อมูล ททท. + กฎหมายไทย <span className="text-amber-700">ควรยืนยันกับหน่วยงานจริงก่อนเข้ากองถ่ายเสมอ</span></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 📄 Full Original Description from TAT */}
              {location.detail && (
                <div className="bg-white border-2 border-slate-300 rounded-[20px] p-4 shadow-[3px_3px_0px_#94a3b8]">
                  <div className="flex items-center justify-between mb-2 text-slate-800 font-black text-sm">
                    <span className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#0284c7]" />
                      ข้อมูลรายละเอียดสถานที่ฉบับเต็ม (TAT Official Description)
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 font-bold">
                      {location.detail.length} ตัวอักษร
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium bg-[#f8fafc] p-3 rounded-xl border border-slate-200 whitespace-pre-line">
                    {location.detail}
                  </p>
                  {location.activity && (
                    <p className="text-xs text-[#0c4a6e] font-bold mt-2">
                      🎯 กิจกรรมที่ ททท. แนะนำ: {location.activity}
                    </p>
                  )}
                </div>
              )}

              {/* 🎬 1. Cinematic & Lighting Analysis */}
              <div className="bg-white border-2 border-[#0284c7] rounded-[20px] p-4 shadow-[3px_3px_0px_#0369a1]">
                <div className="flex items-center gap-2 mb-2 text-[#0c4a6e] font-black text-sm">
                  <Camera className="w-4 h-4 text-[#0284c7]" />
                  <span>1. มุมกล้องและช่วงเวลาถ่ายทำ (Cinematic & Lighting)</span>
                </div>
                <div className="space-y-2 text-xs font-medium text-slate-700">
                  <div className="bg-[#f0f9ff] p-2.5 rounded-xl border border-[#bae6fd]">
                    <strong className="text-[#0c4a6e]">☀️ แสงที่แนะนำ:</strong> {dossier.cinematicAnalysis.lightingRecommendation}
                  </div>
                  <div className="p-2">
                    <strong className="text-slate-900">🎨 มิติภาพ:</strong> {dossier.cinematicAnalysis.visualAesthetic}
                  </div>
                  <div className="p-2 text-amber-900 bg-amber-50 rounded-xl border border-amber-200">
                    <strong>🔊 สภาพเสียงในกอง:</strong> {dossier.cinematicAnalysis.soundEnvironment}
                  </div>
                </div>
              </div>

              {/* 🚐 2. Logistics & Gear Access */}
              <div className="bg-white border-2 border-[#16a34a] rounded-[20px] p-4 shadow-[3px_3px_0px_#15803d]">
                <div className="flex items-center gap-2 mb-2 text-[#14532d] font-black text-sm">
                  <Truck className="w-4 h-4 text-[#16a34a]" />
                  <span>2. การเดินทางและระบบไฟฟ้ากองถ่าย (Logistics & Power)</span>
                </div>
                <div className="space-y-2 text-xs font-medium text-slate-700">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>ระดับความสะดวก:</strong> {dossier.logisticsAnalysis.accessGrade}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>ระบบไฟและเครื่องปั่นไฟ:</strong> {dossier.logisticsAnalysis.powerAndGear}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>ขนาดกองถ่ายที่แนะนำ:</strong> {dossier.logisticsAnalysis.crewCapacity}</span>
                  </div>
                </div>
              </div>

              {/* 🔒 3. Permit & Safe Refusal (Lab 4 Core Rule) */}
              <div className="bg-[#fff1f2] border-2 border-[#e11d48] rounded-[20px] p-4 shadow-[3px_3px_0px_#be123c]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-[#881337] font-black text-sm">
                    <ShieldAlert className="w-4 h-4 text-[#e11d48]" />
                    <span>3. ระเบียบขออนุญาต & ป้องกันการมโน (Safe Refusal)</span>
                  </div>
                  <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded bg-white text-rose-700 border border-rose-300">
                    Anti-Hallucination
                  </span>
                </div>
                <div className="space-y-2 text-xs font-medium text-slate-800">
                  <p>
                    <strong>🏛️ หน่วยงานกำกับดูแล:</strong> {dossier.permitAndSafety.governingBody}
                  </p>
                  <p className="bg-white/80 p-2.5 rounded-xl border border-rose-200">
                    <strong>🚁 ระเบียบโดรน:</strong> {dossier.permitAndSafety.droneNotice}
                  </p>
                  <div className="bg-amber-100/80 border border-amber-300 p-2.5 rounded-xl text-amber-900 text-[11px] font-bold">
                    ⚠️ <strong>กฎ Safe Refusal:</strong> {dossier.permitAndSafety.safeRefusalRule}
                  </div>
                </div>
              </div>

              {/* 💬 4. Interactive Q&A Assistant (RAG Chat on this location) */}
              <div className="bg-white border-2 border-[#7c3aed] rounded-[20px] p-4 shadow-[3px_3px_0px_#6d28d9]">
                <div className="flex items-center gap-2 mb-2 text-[#4c1d95] font-black text-sm">
                  <HelpCircle className="w-4 h-4 text-[#7c3aed]" />
                  <span>ถามคำถามเจาะลึกเฉพาะสถานที่นี้ (Grounded Q&A)</span>
                </div>

                {/* Quick Prompts */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {quickQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAsk(q)}
                      disabled={qaLoading}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-[#f5f3ff] hover:bg-[#ddd6fe] text-[#4c1d95] border border-[#ddd6fe] font-bold transition cursor-pointer text-left"
                    >
                      {q}
                    </button>
                  ))}
                </div>

                {/* Question Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAsk()}
                    placeholder="เช่น ทางเดินแคบไหม? มีห้องน้ำสำหรับนักแสดงไหม?..."
                    className="flex-1 bg-[#fafaf9] border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#7c3aed]"
                  />
                  <button
                    onClick={() => handleAsk()}
                    disabled={qaLoading || !question.trim()}
                    className="btn btn-purple text-xs px-4 py-2 rounded-xl font-black shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {qaLoading ? "กำลังวิเคราะห์..." : "ถาม AI"}
                  </button>
                </div>

                {/* Q&A Stream / History */}
                {qaList.length > 0 && (
                  <div className="mt-4 space-y-3 pt-3 border-t border-slate-200">
                    {qaList.map((item, idx) => (
                      <div key={idx} className="space-y-1.5 text-xs">
                        <div className="font-black text-[#4c1d95] bg-[#f5f3ff] p-2 rounded-lg border border-[#ddd6fe]">
                          ❓ {item.q}
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-slate-300 whitespace-pre-line text-slate-800 leading-relaxed font-medium shadow-xs">
                          {item.a}
                          {item.citation && (
                            <div className="mt-2 pt-2 border-t border-slate-200 text-[10px] font-mono text-slate-500 flex items-center justify-between">
                              <span>📚 แหล่งข้อมูล: {item.citation.source}</span>
                              <span className="font-bold text-[#0284c7]">ID: #{item.citation.corpusId}</span>
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
        <div className="bg-[#f8fafc] border-t-2 border-slate-200 p-3 sm:px-6 flex items-center justify-between text-xs shrink-0">
          <div className="text-[11px] font-bold text-slate-500">
            ระบบวิเคราะห์โดย ThaiScout AI RAG Engine · อ้างอิงฐานข้อมูล ททท. 8,628 แห่ง
          </div>
          <button
            onClick={onClose}
            className="btn btn-purple text-xs px-4 py-1.5 rounded-xl font-black cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
}
