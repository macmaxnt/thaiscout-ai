"use client";

import React, { useState, useEffect } from "react";
import { X, ExternalLink } from "lucide-react";
import { IconPhoto, IconMap2, IconStar, IconBrandGoogleMaps } from "@tabler/icons-react";

interface SocialReviewsModalProps {
  location: any;
  onClose: () => void;
}

export default function SocialReviewsModal({ location, onClose }: SocialReviewsModalProps) {
  const [placesPhotos, setPlacesPhotos] = useState<any[]>([]);
  const [placesRating, setPlacesRating] = useState<number | null>(null);
  const [placesReviewCount, setPlacesReviewCount] = useState<number>(0);
  const [placesGoogleMapsUri, setPlacesGoogleMapsUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<any | null>(null);

  useEffect(() => {
    fetchGooglePlacePhotos();
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

  const fetchGooglePlacePhotos = async () => {
    if (!location) return;
    setLoading(true);
    try {
      const res = await fetch("/api/place-photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: location.name_th,
          province: location.province,
          lat: location.lat,
          lng: location.lng,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setPlacesPhotos(json.photos || []);
        setPlacesRating(json.rating || null);
        setPlacesReviewCount(json.userRatingCount || 0);
        setPlacesGoogleMapsUri(json.googleMapsUri || null);
        if (json.photos && json.photos.length > 0) {
          setSelectedPhoto(json.photos[0]);
        }
      }
    } catch (err) {
      console.error("Place photos fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const name = location?.name_th || "สถานที่";
  const prov = location?.province || "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="photos-modal-title"
        className="bg-white border border-[#285185]/30 rounded-[24px] shadow-[0_24px_70px_rgba(24,51,84,0.28)] w-full max-w-3xl overflow-hidden my-auto flex flex-col max-h-[94vh]"
      >
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-sky-50 via-slate-50 to-amber-50 border-b-2 border-[#285185] p-3.5 sm:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white border-2 border-[#285185] rounded-2xl p-2 text-xl shadow-[2px_2px_0px_#183354] flex items-center justify-center">
              <IconPhoto size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 id="photos-modal-title" className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  ภาพถ่ายจริงจาก Google Maps
                </h3>
              </div>
              <p className="text-xs font-bold text-slate-600 mt-0.5">
                <strong className="text-[#285185]">{name}</strong>{prov ? ` · ${prov}` : ""}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดหน้าต่างภาพถ่ายจาก Google Maps"
            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:border-slate-400 hover:bg-slate-100 hover:text-[#1b3558] transition shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#285185]/30 focus-visible:ring-offset-2"
          >
            <X className="w-5 h-5 text-slate-700" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto overscroll-contain scroll-py-6 space-y-4 bg-[#f8fafc]">
          {/* Google Place Header Summary */}
          <div className="bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 border-2 border-[#0284c7] rounded-2xl p-3.5 sm:p-4 shadow-[3px_3px_0px_#0369a1] flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2.5 rounded-xl border border-sky-200 text-2xl shadow-xs">
                <IconMap2 size={24} />
              </div>
              <div>
                <h4 className="font-black text-sm text-slate-900 flex items-center gap-2">
                  แกลเลอรีภาพถ่ายสถานที่
                  {placesRating && (
                    <span className="text-xs font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                      <IconStar size={13} fill="currentColor" /> {placesRating.toFixed(1)}
                    </span>
                  )}
                </h4>
                <p className="text-xs font-medium text-slate-600">
                  {placesPhotos.length} รูปจาก Google Maps{placesRating ? ` · ${placesReviewCount.toLocaleString()} รีวิว` : ""}
                </p>
              </div>
            </div>

            <a
              href={placesGoogleMapsUri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${prov}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-blue text-xs px-3.5 py-2 rounded-xl font-black flex items-center gap-1.5 shadow-[2px_2px_0px_#0369a1]"
            >
              <span>เปิดดูใน Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-500">
              <div className="w-9 h-9 border-4 border-[#0284c7] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-bold text-slate-700">กำลังดึงภาพถ่ายจริงจาก Google Maps...</p>
            </div>
          ) : placesPhotos.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 p-6">
              <p className="text-sm font-bold text-slate-700">ไม่พบรูปภาพถ่ายที่เชื่อมโยงกับพิกัดนี้บน Google Maps</p>
              <p className="text-xs text-slate-500 mt-1">สามารถคลิกปุ่ม &quot;เปิดดูใน Google Maps&quot; เพื่อดูข้อมูลเพิ่มเติมโดยตรงได้ครับ</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Featured Big Photo View */}
              {selectedPhoto && (
                <div className="relative rounded-2xl overflow-hidden border-2 border-slate-300 shadow-md bg-slate-950 aspect-video max-h-[420px] flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedPhoto.photoUri}
                    alt={name}
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent p-3 text-white text-xs flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <span className="font-semibold text-slate-300">ถ่ายโดย: </span>
                      {selectedPhoto.authorUri ? (
                        <a
                          href={selectedPhoto.authorUri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold underline hover:text-sky-300"
                        >
                          {selectedPhoto.authorName}
                        </a>
                      ) : (
                        <span className="font-bold">{selectedPhoto.authorName}</span>
                      )}
                    </div>
                    {selectedPhoto.googleMapsUri && (
                      <a
                        href={selectedPhoto.googleMapsUri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-sky-300 hover:text-white flex items-center gap-1 text-[11px]"
                      >
                        ดูรูปนี้บน Google Maps ↗
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Thumbnail Gallery */}
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {placesPhotos.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedPhoto(p)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition cursor-pointer ${
                      selectedPhoto?.photoUri === p.photoUri
                        ? "border-[#0284c7] scale-105 shadow-[2px_2px_0px_#0284c7]"
                        : "border-slate-200 hover:border-slate-400 opacity-80 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.photoUri}
                      alt={`${name} photo ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 font-bold flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1.5"><IconBrandGoogleMaps size={14} /> Google Maps Open Data Grounding</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-xs px-4 py-2 rounded-lg font-black bg-white hover:bg-[#eaf2f7] border border-[#b9cede] text-[#285185] transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#285185]/30 focus-visible:ring-offset-2"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
}
