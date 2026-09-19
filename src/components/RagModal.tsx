"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Bot,
  Camera,
  Check,
  CircleAlert,
  FileText,
  HelpCircle,
  MapPin,
  Phone,
  Send,
  ShieldCheck,
  Truck,
  X,
  Zap,
} from "lucide-react";

interface RagModalProps {
  location: any;
  brief: string;
  onClose: () => void;
}

export default function RagModal({ location, brief, onClose }: RagModalProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dossier, setDossier] = useState<any>(null);
  const [question, setQuestion] = useState("");
  const [qaLoading, setQaLoading] = useState(false);
  const [qaList, setQaList] = useState<{ q: string; a: string; citation: any }[]>([]);
  const dialogRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const dismiss = useCallback(() => {
    onClose();
    window.setTimeout(() => returnFocusRef.current?.focus(), 0);
  }, [onClose]);

  const fetchDossier = useCallback(async () => {
    setLoading(true);
    setError("");
    setQaList([]);
    try {
      const response = await fetch("/api/rag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location, brief }),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || "ไม่สามารถเปิดข้อมูลสถานที่ได้");
      setDossier(data.dossier);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "ไม่สามารถเปิดข้อมูลสถานที่ได้");
    } finally {
      setLoading(false);
    }
  }, [brief, location]);

  useEffect(() => {
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButtonRef.current?.focus();
    const handleDialogKeys = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); dismiss(); return; }
      if (event.key !== "Tab") return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>("button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href]");
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", handleDialogKeys);
    return () => document.removeEventListener("keydown", handleDialogKeys);
  }, [dismiss]);

  useEffect(() => {
    fetchDossier();
  }, [fetchDossier]);

  const handleAsk = async (askText = question) => {
    if (!askText.trim() || qaLoading) return;
    setQaLoading(true);
    try {
      const response = await fetch("/api/rag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location, brief, question: askText }),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || "ไม่สามารถวิเคราะห์คำถามนี้ได้");
      setQaList((current) => [...current, { q: askText, a: data.answer, citation: data.citation }]);
      setQuestion("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "ไม่สามารถวิเคราะห์คำถามนี้ได้");
    } finally {
      setQaLoading(false);
    }
  };

  const quickQuestions = [
    "บินโดรนได้หรือไม่ และควรเตรียมอะไร?",
    "รถตู้กองถ่ายและรถปั่นไฟเข้าถึงได้ไหม?",
    "ต้องติดต่อหน่วยงานใดก่อนถ่ายทำ?",
  ];

  return (
    <div className="detail-overlay" role="presentation" onMouseDown={(event) => event.currentTarget === event.target && dismiss()}>
      <section className="detail-modal" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="location-dossier-title">
        <header className="detail-modal__header">
          <div className="detail-modal__heading">
            <div className="detail-modal__icon"><Bot size={20} /></div>
            <div>
              <span className="detail-modal__eyebrow">LOCATION DOSSIER · TAT-GROUNDED</span>
              <h2 id="location-dossier-title">{location.name_th}</h2>
              <p><MapPin size={13} /> {location.province}{location.district ? ` · ${location.district}` : ""}</p>
            </div>
          </div>
          <button className="detail-close" ref={closeButtonRef} type="button" onClick={dismiss} aria-label="ปิดรายละเอียดสถานที่"><X size={19} /></button>
        </header>

        <div className="detail-modal__body">
          <aside className="detail-sidebar">
            <div className="detail-sidebar__intro">
              <span>AI PRODUCTION BRIEF</span>
              <p>{brief}</p>
            </div>
            <dl className="detail-facts">
              <div><dt>หมวดหมู่</dt><dd>{location.category || "สถานที่ท่องเที่ยว"}</dd></div>
              <div><dt>พิกัด</dt><dd>{location.lat && location.lng ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : "ไม่มีพิกัดในรายการ"}</dd></div>
              {location.tel && <div><dt>ติดต่อ</dt><dd><Phone size={13} /> {location.tel}</dd></div>}
            </dl>
            <div className="detail-sidebar__note"><ShieldCheck size={16} /><span>รายละเอียดที่ไม่มีในฐานข้อมูลจะแสดงเป็น “ต้องตรวจสอบ” ไม่ถูกเติมด้วยการคาดเดา</span></div>
          </aside>

          <main className="detail-content">
            {loading && <div className="detail-loading"><span className="detail-loading__mark" /><strong>กำลังรวบรวมข้อมูลสำหรับกองถ่าย</strong><p>กำลังตรวจแหล่งอ้างอิงและเงื่อนไขของสถานที่</p></div>}
            {error && <div className="detail-error" role="alert"><CircleAlert size={18} /><div><strong>เปิดข้อมูลไม่ได้ในขณะนี้</strong><p>{error}</p><button type="button" onClick={fetchDossier}>ลองอีกครั้ง</button></div></div>}
            {!loading && !error && dossier && <>
              {location.detail && <section className="detail-section detail-source">
                <div className="detail-section__title"><FileText size={17} /><div><h3>ข้อมูลสถานที่</h3><span>คำอธิบายจากรายการต้นทาง</span></div></div>
                <p>{location.detail}</p>
                {location.activity && <div className="detail-activity"><ArrowUpRight size={14} /> กิจกรรมที่แนะนำ: {location.activity}</div>}
              </section>}

              <div className="detail-analysis-grid">
                <section className="detail-section">
                  <div className="detail-section__title"><Camera size={17} /><div><h3>ภาพและแสง</h3><span>Cinematic read</span></div></div>
                  <dl className="detail-list"><div><dt>แสงที่แนะนำ</dt><dd>{dossier.cinematicAnalysis?.lightingRecommendation || "ต้องตรวจสอบหน้างาน"}</dd></div><div><dt>มิติภาพ</dt><dd>{dossier.cinematicAnalysis?.visualAesthetic || "ต้องตรวจสอบหน้างาน"}</dd></div><div><dt>สภาพเสียง</dt><dd>{dossier.cinematicAnalysis?.soundEnvironment || "ต้องตรวจสอบหน้างาน"}</dd></div></dl>
                </section>
                <section className="detail-section">
                  <div className="detail-section__title"><Truck size={17} /><div><h3>การเข้าถึงกองถ่าย</h3><span>Logistics & power</span></div></div>
                  <dl className="detail-list"><div><dt>การเข้าถึง</dt><dd>{dossier.logisticsAnalysis?.accessGrade || "ต้องตรวจสอบหน้างาน"}</dd></div><div><dt>ระบบไฟ</dt><dd>{dossier.logisticsAnalysis?.powerAndGear || "ต้องตรวจสอบหน้างาน"}</dd></div><div><dt>ขนาดกอง</dt><dd>{dossier.logisticsAnalysis?.crewCapacity || "ต้องตรวจสอบหน้างาน"}</dd></div></dl>
                </section>
              </div>

              <section className="detail-section detail-permit">
                <div className="detail-section__title"><AlertTriangle size={17} /><div><h3>ใบอนุญาตและความปลอดภัย</h3><span>Production checks before recce</span></div></div>
                <dl className="detail-list"><div><dt>หน่วยงานที่เกี่ยวข้อง</dt><dd>{dossier.permitAndSafety?.governingBody || "ต้องตรวจสอบกับผู้ดูแลพื้นที่"}</dd></div><div><dt>โดรน</dt><dd>{dossier.permitAndSafety?.droneNotice || "ต้องตรวจสอบกับผู้ดูแลพื้นที่"}</dd></div></dl>
                <p className="detail-permit__rule"><Zap size={14} /> {dossier.permitAndSafety?.safeRefusalRule || "หากข้อมูลไม่อยู่ในฐานข้อมูล โปรดติดต่อผู้ดูแลพื้นที่ก่อนวางแผนถ่ายทำ"}</p>
              </section>

              <section className="detail-section detail-qa">
                <div className="detail-section__title"><HelpCircle size={17} /><div><h3>ถาม AI เพิ่มเติม</h3><span>คำตอบอิงข้อมูลของสถานที่นี้</span></div></div>
                <div className="detail-prompts">{quickQuestions.map((prompt) => <button key={prompt} type="button" onClick={() => handleAsk(prompt)} disabled={qaLoading}>{prompt}</button>)}</div>
                <div className="detail-ask"><input type="text" value={question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={(event) => event.key === "Enter" && handleAsk()} placeholder="ถามเรื่องเส้นทาง, พื้นที่พักกอง, หรือข้อจำกัดหน้างาน…" /><button type="button" onClick={() => handleAsk()} disabled={qaLoading || !question.trim()}><Send size={16} /> {qaLoading ? "กำลังวิเคราะห์" : "ถาม AI"}</button></div>
                {qaList.length > 0 && <div className="detail-answers">{qaList.map((item, index) => <article key={`${item.q}-${index}`}><p className="detail-question">{item.q}</p><p className="detail-answer">{item.a}</p>{item.citation && <span className="detail-citation"><Check size={12} /> {item.citation.source} · ID {item.citation.corpusId}</span>}</article>)}</div>}
              </section>
            </>}
          </main>
        </div>
      </section>
    </div>
  );
}
