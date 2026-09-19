"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  ExternalLink,
  Sparkles,
  Share2,
  Heart,
  Video,
  Camera,
  Compass,
  Volume2,
  Sun,
  Users,
  Wifi,
  Star,
  Play,
  Film,
  CheckCircle2,
  Search,
  Home as HomeIcon,
  Zap,
  Phone,
  Mail,
  ShieldCheck,
} from "lucide-react";

interface SocialReviewsModalProps {
  location: any;
  onClose: () => void;
}

export default function SocialReviewsModal({ location, onClose }: SocialReviewsModalProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [videoLoading, setVideoLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"photos" | "video" | "social" | "reviews" | "production">("photos");
  const [selectedAngle, setSelectedAngle] = useState<string>("");
  const [customSearchQuery, setCustomSearchQuery] = useState<string>("");

  // Google Places Photos state
  const [placesPhotos, setPlacesPhotos] = useState<any[]>([]);
  const [placesRating, setPlacesRating] = useState<number | null>(null);
  const [placesReviewCount, setPlacesReviewCount] = useState<number>(0);
  const [placesGoogleMapsUri, setPlacesGoogleMapsUri] = useState<string | null>(null);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<any | null>(null);

  useEffect(() => {
    fetchSocialReviews("");
    fetchGooglePlacePhotos();
  }, [location]);

  const fetchGooglePlacePhotos = async () => {
    if (!location) return;
    setPlacesLoading(true);
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
      setPlacesLoading(false);
    }
  };

  const fetchSocialReviews = async (angleQuery: string) => {
    setVideoLoading(true);
    try {
      const res = await fetch("/api/social-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location, angle: angleQuery }),
      });
      const json = await res.json();
      if (json.success) {
        setData(json);
        if (json.youtubeVideos && json.youtubeVideos.length > 0) {
          setSelectedVideo(json.youtubeVideos[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setVideoLoading(false);
    }
  };

  const handleSelectAngle = (angle: string) => {
    setSelectedAngle(angle);
    fetchSocialReviews(angle);
  };

  const handleCustomSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSearchQuery.trim()) return;
    setSelectedAngle(customSearchQuery.trim());
    fetchSocialReviews(customSearchQuery.trim());
  };

  const name = location?.name_th || "สถานที่";
  const prov = location?.province || "";
  const isCustomHost = !!location?.isCustomHost;

  const angleOptions = [
    { label: "📍 บรรยากาศจริง (VLOG)", value: "" },
    { label: "🚁 โดรนสำรวจมุมสูง (4K)", value: "โดรน 4K มุมสูง" },
    { label: "🌅 แสงช่วงเช้า & หมอก", value: "ทะเลหมอก พระอาทิตย์ขึ้น" },
    { label: "🚐 ทางขึ้น & สภาพถนน", value: "ทางขึ้น จุดกางเต็นท์" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white border-[3px] border-[#285185] rounded-[28px] shadow-[8px_8px_0px_#183354] w-full max-w-3xl overflow-hidden my-auto flex flex-col max-h-[94vh]">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-sky-50 via-slate-50 to-amber-50 border-b-2 border-[#285185] p-3.5 sm:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white border-2 border-[#285185] rounded-2xl p-2 text-xl shadow-[2px_2px_0px_#183354] flex items-center justify-center">
              🎬
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  วิดีโอ & รีวิวสถานที่จริง (Verified In-App Recce)
                </h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#fcd9bd] border border-[#d67940] text-[#7c2d12] flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  {data?.insights?.overallScore || "4.8"} / 5.0 Rating
                </span>
              </div>
              <p className="text-xs font-bold text-slate-600 mt-0.5">
                เปิดดูคลิปจริง & บรรยากาศถ่ายทำ: <strong className="text-[#285185]">{name}</strong> ({prov})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl border-2 border-slate-300 hover:border-slate-800 hover:bg-slate-100 transition shadow-[2px_2px_0px_#94a3b8] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5 text-slate-700" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-50 px-4 sm:px-6 py-2 border-b border-slate-200 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
          <button
            onClick={() => setActiveTab("photos")}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === "photos"
                ? "bg-[#0284c7] text-white shadow-[2px_2px_0px_#0369a1]"
                : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
            }`}
          >
            <span>📸 รูปถ่ายจริง Google Maps</span>
            {placesPhotos.length > 0 && (
              <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
                {placesPhotos.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("video")}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === "video"
                ? "bg-[#0284c7] text-white shadow-[2px_2px_0px_#0369a1]"
                : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>▶️ คลิปสำรวจจริงในเว็บ</span>
          </button>

          <button
            onClick={() => setActiveTab("social")}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === "social"
                ? "bg-[#0284c7] text-white shadow-[2px_2px_0px_#0369a1]"
                : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
            }`}
          >
            <span>📱 ลิงก์ TikTok / IG</span>
          </button>

          <button
            onClick={() => setActiveTab("reviews")}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === "reviews"
                ? "bg-[#0284c7] text-white shadow-[2px_2px_0px_#0369a1]"
                : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
            }`}
          >
            <span>💬 ความเห็นคนไปจริง</span>
            <span className="bg-sky-100 text-sky-800 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
              4
            </span>
          </button>

          <button
            onClick={() => setActiveTab("production")}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === "production"
                ? "bg-[#0284c7] text-white shadow-[2px_2px_0px_#0369a1]"
                : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
            }`}
          >
            <span>🎬 ประเมินออกกอง (Recce)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {loading && activeTab !== "photos" ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <div className="w-8 h-8 border-4 border-[#0284c7] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-600">กำลังค้นหาคลิปวิดีโอของสถานที่จริง...</p>
            </div>
          ) : (
            <>
              {/* TAB: GOOGLE PLACES REAL PHOTOS */}
              {activeTab === "photos" && (
                <div className="space-y-4">
                  {/* Google Place Header Summary */}
                  <div className="bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 border-2 border-[#0284c7] rounded-2xl p-4 shadow-[3px_3px_0px_#0369a1] flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-white p-2.5 rounded-xl border border-sky-200 text-2xl shadow-xs">
                        🗺️
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-slate-900 flex items-center gap-2">
                          Google Maps Verified Photos & Reviews
                          {placesRating && (
                            <span className="text-xs font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                              ⭐ {placesRating.toFixed(1)}
                            </span>
                          )}
                        </h4>
                        <p className="text-xs font-medium text-slate-600">
                          ภาพถ่ายและรีวิวจริงจากผู้ใช้งานบน Google Maps ({placesReviewCount.toLocaleString()} รีวิว)
                        </p>
                      </div>
                    </div>

                    <a
                      href={placesGoogleMapsUri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${prov}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-blue text-xs px-3.5 py-1.5 rounded-xl font-black flex items-center gap-1.5 shadow-[2px_2px_0px_#0369a1]"
                    >
                      <span>เปิดดูใน Google Maps</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {placesLoading ? (
                    <div className="py-12 text-center text-slate-500">
                      <div className="w-8 h-8 border-4 border-[#0284c7] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-700">กำลังดึงภาพถ่ายจริงจาก Google Maps API...</p>
                    </div>
                  ) : placesPhotos.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 p-6">
                      <p className="text-sm font-bold text-slate-700">ไม่พบรูปภาพถ่ายที่เชื่อมโยงกับพิกัดนี้บน Google Maps</p>
                      <p className="text-xs text-slate-500 mt-1">สามารถคลิกปุ่ม &quot;เปิดดูใน Google Maps&quot; เพื่อดูข้อมูลเพิ่มเติมโดยตรงได้ครับ</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Featured Big Photo View */}
                      {selectedPhoto && (
                        <div className="relative rounded-2xl overflow-hidden border-2 border-slate-300 shadow-md bg-slate-950 aspect-video max-h-[380px] flex items-center justify-center">
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
              )}

              {/* TAB 1: IN-APP VIDEO PLAYER */}
              {activeTab === "video" && (
                <div className="space-y-3.5">
                  {/* Filter / Angle Chips & Search Bar */}
                  <div className="bg-slate-50 border-2 border-slate-200 p-3 rounded-2xl space-y-2.5">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-slate-800 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          มุมที่ต้องการสำรวจ:
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          <ShieldCheck className="w-3 h-3" />
                          ตัดคลิปข่าว & โฆษณาขายที่ดินออก 100%
                        </span>
                      </div>
                    </div>

                    {/* Chips */}
                    <div className="flex flex-wrap gap-1.5">
                      {angleOptions.map((opt) => {
                        const isActive = selectedAngle === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleSelectAngle(opt.value)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer border ${
                              isActive
                                ? "bg-[#0284c7] text-white border-[#0369a1] shadow-[2px_2px_0px_#0369a1]"
                                : "bg-white text-slate-700 border-slate-300 hover:border-[#0284c7] hover:text-[#0284c7]"
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom search bar for specific query */}
                    <form onSubmit={handleCustomSearch} className="flex gap-1.5 pt-1">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={customSearchQuery}
                          onChange={(e) => setCustomSearchQuery(e.target.value)}
                          placeholder={`พิมพ์มุมที่ต้องการดู เช่น จุดกางเต็นท์, ทางเดิน, พระอาทิตย์ตก...`}
                          className="w-full bg-white border border-slate-300 focus:border-[#0284c7] rounded-xl pl-9 pr-3 py-1.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={videoLoading}
                        className="btn btn-blue text-xs px-3.5 py-1.5 rounded-xl font-black shrink-0 cursor-pointer shadow-[1px_1px_0px_#0369a1]"
                      >
                        {videoLoading ? "กำลังหา..." : "ค้นหาคลิป"}
                      </button>
                    </form>
                  </div>

                  {/* Embedded 16:9 Video Player */}
                  {selectedVideo && (
                    <div className="space-y-2">
                      <div className="relative aspect-video w-full rounded-2xl overflow-hidden border-[2.5px] border-black shadow-[4px_4px_0px_#000] bg-black">
                        {videoLoading && (
                          <div className="absolute inset-0 bg-black/60 z-10 flex items-center justify-center text-white text-xs font-bold gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            กำลังสลับวิดีโอ...
                          </div>
                        )}
                        <iframe
                          src={`https://www.youtube-nocookie.com/embed/${selectedVideo.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                          title={selectedVideo.title}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      </div>

                      {/* Video Info Bar */}
                      <div className="bg-[#f0f9ff] border-2 border-[#0284c7] p-3 rounded-2xl flex items-center justify-between gap-2 flex-wrap shadow-[2px_2px_0px_#0369a1]">
                        <div>
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-[#0284c7] text-white">
                              {selectedVideo.badge || "กำลังเล่น"}
                            </span>
                            <span className="text-xs font-bold text-slate-600 font-mono">
                              {selectedVideo.duration && `${selectedVideo.duration} · `}{selectedVideo.channel}
                            </span>
                            {selectedVideo.views && (
                              <span className="text-[11px] text-slate-500 font-medium">
                                ({selectedVideo.views})
                              </span>
                            )}
                          </div>
                          <h4 className="font-black text-xs sm:text-sm text-slate-900 leading-snug">
                            {selectedVideo.title}
                          </h4>
                        </div>

                        <a
                          href={selectedVideo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn bg-white border border-slate-300 hover:border-black text-slate-800 text-xs px-3 py-1.5 rounded-xl font-black flex items-center gap-1 transition shrink-0 cursor-pointer"
                        >
                          <span>เปิดดูบน YouTube</span>
                          <ExternalLink className="w-3 h-3 text-slate-500" />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Playlist selector buttons */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1">
                        <Video className="w-4 h-4 text-rose-600" />
                        คลิปวิดีโอของสถานที่นี้ที่คัดเลือกมา (Playlist)
                      </h4>
                      <span className="text-[11px] font-bold text-slate-500">
                        กดเพื่อเปลี่ยนคลิปที่เล่นทันที
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {data?.youtubeVideos?.map((vid: any) => {
                        const isPlaying = selectedVideo?.id === vid.id || selectedVideo?.youtubeId === vid.youtubeId;
                        return (
                          <button
                            key={vid.id || vid.youtubeId}
                            type="button"
                            onClick={() => setSelectedVideo(vid)}
                            className={`text-left p-3 rounded-2xl border-2 transition flex flex-col justify-between cursor-pointer ${
                              isPlaying
                                ? "bg-sky-50 border-[#0284c7] shadow-[2px_2px_0px_#0284c7] scale-[1.01]"
                                : "bg-white border-slate-200 hover:border-slate-400 hover:bg-slate-50"
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                                <span className="font-bold text-[#0284c7]">{vid.badge}</span>
                                {vid.duration && (
                                  <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-bold">
                                    {vid.duration}
                                  </span>
                                )}
                              </div>
                              <p className="font-bold text-xs text-slate-900 line-clamp-2 leading-snug">
                                {vid.title}
                              </p>
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium mt-2 pt-2 border-t border-slate-100">
                              <span className="truncate pr-1">{vid.channel}</span>
                              <span className={`font-black shrink-0 flex items-center gap-0.5 ${
                                isPlaying ? "text-[#0284c7]" : "text-rose-600"
                              }`}>
                                {isPlaying ? "▶ กำลังเล่น" : "คลิกดูคลิป"}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: SOCIAL PLATFORMS */}
              {activeTab === "social" && (
                <div className="space-y-4">
                  <div className="bg-sky-50 border border-sky-200 rounded-2xl p-3 text-xs font-bold text-sky-900 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-[#0284c7] shrink-0 mt-0.5" />
                    <span>
                      คลิกปุ่มด้านล่างเพื่อเปิดดูคลิปจริง รูปถ่ายจริง และแฮชแท็กสดๆ จากผู้ใช้ที่ไปเยือน <strong>{name}</strong> ในแต่ละแพลตฟอร์มได้ทันที:
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* 🎵 TikTok */}
                    <div className="bg-white border-2 border-slate-300 hover:border-black rounded-2xl p-4 shadow-[3px_3px_0px_#000] flex flex-col justify-between transition group">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center font-black text-sm shadow-sm">
                              🎵
                            </div>
                            <div>
                              <h4 className="font-black text-sm text-slate-900">TikTok Trends</h4>
                              <p className="text-[11px] text-slate-500 font-bold">คลิปสั้น ไวรัล & มุมถ่ายรูป</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                            Viral Clips
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 font-medium mb-3">
                          ดูมุมที่ครีเอเตอร์ชอบถ่าย บรรยากาศสดๆ เพลงฮิต และจุดเช็กอินที่คนไปเต้นหรือถ่ายรีวิว
                        </p>
                      </div>

                      <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100">
                        <a
                          href={data?.socialLinks?.tiktokSearch}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn bg-black hover:bg-slate-800 text-white text-xs py-2 px-3 rounded-xl font-black flex items-center justify-center gap-1.5 transition shadow-[2px_2px_0px_#475569] cursor-pointer"
                        >
                          <span>ค้นหาคลิป {name} บน TikTok</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={data?.socialLinks?.tiktokTag}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs py-1.5 px-3 rounded-xl font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                        >
                          <span>ส่องแฮชแท็ก #{data?.locationName?.replace(/[\s\(\)\.\,\/\-]+/g, "")}</span>
                        </a>
                      </div>
                    </div>

                    {/* 🔴 YouTube */}
                    <div className="bg-white border-2 border-slate-300 hover:border-rose-600 rounded-2xl p-4 shadow-[3px_3px_0px_#e11d48] flex flex-col justify-between transition group">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-[#ff0000] text-white flex items-center justify-center font-black text-sm shadow-sm">
                              ▶️
                            </div>
                            <div>
                              <h4 className="font-black text-sm text-slate-900">YouTube VLOG & 4K</h4>
                              <p className="text-[11px] text-slate-500 font-bold">VLOG ยาว & ภาพมุมสูงโดรน</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                            4K Recce
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 font-medium mb-3">
                          ดูการเดินทางจริง ทางขึ้น สภาพถนน และฟุตเทจภาพมุมสูงแบบ 4K เพื่อประเมินซีนถ่ายทำ
                        </p>
                      </div>

                      <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100">
                        <a
                          href={data?.socialLinks?.youtubeSearch}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn bg-[#ff0000] hover:bg-red-700 text-white text-xs py-2 px-3 rounded-xl font-black flex items-center justify-center gap-1.5 transition shadow-[2px_2px_0px_#991b1b] cursor-pointer"
                        >
                          <span>ดูคลิปรีวิว VLOG บน YouTube</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={data?.socialLinks?.youtubeDrone}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs py-1.5 px-3 rounded-xl font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                        >
                          <span>ค้นหาคลิปบินโดรน 4K มุมสูง</span>
                        </a>
                      </div>
                    </div>

                    {/* 📸 Instagram */}
                    <div className="bg-white border-2 border-slate-300 hover:border-pink-600 rounded-2xl p-4 shadow-[3px_3px_0px_#db2777] flex flex-col justify-between transition group">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
                              📸
                            </div>
                            <div>
                              <h4 className="font-black text-sm text-slate-900">Instagram Inspiration</h4>
                              <p className="text-[11px] text-slate-500 font-bold">Mood & Tone และสไตล์ภาพ</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-pink-50 text-pink-700 border border-pink-200">
                            Mood Board
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 font-medium mb-3">
                          ดูมู้ดสี แสง คอสตูม และมุม Portrait ที่คนนิยมไปถ่าย เพื่อวาง Mood Board งานโปรดักชัน
                        </p>
                      </div>

                      <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100">
                        <a
                          href={data?.socialLinks?.instagramTag}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-95 text-white text-xs py-2 px-3 rounded-xl font-black flex items-center justify-center gap-1.5 transition shadow-[2px_2px_0px_#9d174d] cursor-pointer"
                        >
                          <span>ส่องรูป Instagram แฮชแท็ก</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={data?.socialLinks?.instagramSearch}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs py-1.5 px-3 rounded-xl font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                        >
                          <span>ค้นหาสถานที่บน Instagram</span>
                        </a>
                      </div>
                    </div>

                    {/* 🗺️ Google Maps Reviews */}
                    <div className="bg-white border-2 border-slate-300 hover:border-blue-600 rounded-2xl p-4 shadow-[3px_3px_0px_#2563eb] flex flex-col justify-between transition group">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
                              🗺️
                            </div>
                            <div>
                              <h4 className="font-black text-sm text-slate-900">Google Maps Reviews</h4>
                              <p className="text-[11px] text-slate-500 font-bold">รีวิวจริง & ภาพ 360 องศา</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                            Verified Local
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 font-medium mb-3">
                          ดูคะแนนดาว ความเห็นเรื่องห้องน้ำ ที่จอดรถ ค่าเข้า และภาพถ่ายล่าสุดของผู้ที่ไปมาจริง
                        </p>
                      </div>

                      <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100">
                        <a
                          href={data?.socialLinks?.googleMaps}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 px-3 rounded-xl font-black flex items-center justify-center gap-1.5 transition shadow-[2px_2px_0px_#1e40af] cursor-pointer"
                        >
                          <span>เปิดดูรีวิวบน Google Maps</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={data?.socialLinks?.lemon8Search}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs py-1.5 px-3 rounded-xl font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                        >
                          <span>ดูทริคถ่ายรูปบน Lemon8 🍋</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: REVIEWS & COMMUNITY FEEDBACK */}
              {activeTab === "reviews" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-900">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">💬</span>
                      <div>
                        <div className="font-black text-slate-900">
                          ความคิดเห็นจากผู้ไปเยือนจริง ({data?.insights?.totalMentions?.toLocaleString()} เมนชันในโซเชียล)
                        </div>
                        <div className="text-[11px] text-slate-600">
                          รวบรวมจาก TikTok, Instagram, YouTube Comments และ Google Maps
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-lg font-black text-amber-700">{data?.insights?.overallScore}</span>
                      <span className="text-xs text-slate-500"> / 5.0</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {data?.sampleReviews?.map((rev: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-white border-2 border-slate-200 hover:border-slate-400 rounded-2xl p-4 shadow-sm transition"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{rev.avatar}</span>
                            <div>
                              <div className="font-black text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                                {rev.author}
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-normal">
                                  {rev.platform}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-400 font-medium">
                                {rev.handle} · {rev.timeAgo}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-0.5 text-amber-400">
                            {[...Array(rev.rating)].map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                            ))}
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed mb-3">
                          &ldquo;{rev.content}&rdquo;
                        </p>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 flex-wrap gap-2 text-xs">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {rev.tags?.map((t: string, ti: number) => (
                              <span
                                key={ti}
                                className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 hover:bg-sky-50 hover:text-sky-700 cursor-pointer"
                              >
                                {t}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center gap-3 text-slate-400 text-xs font-mono font-bold">
                            <span className="flex items-center gap-1">
                              <Heart className="w-3.5 h-3.5 text-rose-500" />
                              {rev.likes}
                            </span>
                            <span className="flex items-center gap-1">
                              <Share2 className="w-3.5 h-3.5 text-sky-500" />
                              {rev.shares}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: PRODUCTION RECCE ANALYSIS */}
              {activeTab === "production" && (
                <div className="space-y-4">
                  <div className="bg-[#f0f9ff] border-2 border-[#0284c7] rounded-2xl p-4 shadow-[3px_3px_0px_#0369a1]">
                    <h4 className="font-black text-sm text-[#0c4a6e] mb-1 flex items-center gap-1.5">
                      <Compass className="w-4 h-4 text-[#0284c7]" />
                      สรุปข้อมูลสภาพแวดล้อมกองถ่าย (Recce Intelligence)
                    </h4>
                    <p className="text-xs text-slate-600 font-medium">
                      ประมวลผลจากคำบอกเล่าของคนในพื้นที่ ช่างภาพ และรีวิวโซเชียลเพื่อช่วยเตรียมงานล่วงหน้า
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Golden Hour */}
                    <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-3.5">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Sun className="w-4 h-4 text-amber-600" />
                        <span className="font-black text-xs text-amber-900">เวลาแสงสวยที่สุด (Best Light)</span>
                      </div>
                      <p className="text-xs font-bold text-slate-800">
                        {data?.insights?.bestLightTime}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1 font-medium">
                        แสงตกกระทบสวย ทัศนียภาพเปิด เหมาะกับการจัดเซ็ตซีนภาพยนตร์
                      </p>
                    </div>

                    {/* Crowd Density */}
                    <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-3.5">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Users className="w-4 h-4 text-emerald-600" />
                        <span className="font-black text-xs text-emerald-900">ความหนาแน่นของผู้คน</span>
                      </div>
                      <p className="text-xs font-bold text-slate-800">
                        {data?.insights?.crowdDensity}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1 font-medium">
                        แนะนำถ่ายทำวันจันทร์ - พฤหัสบดี เพื่อความคล่องตัวของกองถ่าย
                      </p>
                    </div>

                    {/* Sound Environment */}
                    <div className="bg-indigo-50/60 border border-indigo-200 rounded-2xl p-3.5">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Volume2 className="w-4 h-4 text-indigo-600" />
                        <span className="font-black text-xs text-indigo-900">การบันทึกเสียง (Sync Sound)</span>
                      </div>
                      <p className="text-xs font-bold text-slate-800">
                        {data?.insights?.soundEnvironment}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1 font-medium">
                        ประเมินเสียงรบกวนรอบข้างสำหรับการอัดเสียงพูดและเสียงบรรยากาศ
                      </p>
                    </div>

                    {/* Mobile Signal & Drone */}
                    <div className="bg-sky-50/60 border border-sky-200 rounded-2xl p-3.5">
                      <div className="flex items-center gap-1.5">
                        <Wifi className="w-4 h-4 text-[#0284c7]" />
                        <span className="font-black text-xs text-[#0c4a6e]">สัญญาณมือถือ & โดรน</span>
                      </div>
                      <p className="text-xs font-bold text-slate-800">
                        {data?.insights?.mobileSignal}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1 font-medium">
                        {data?.insights?.droneFriendly}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 font-bold flex items-center gap-1.5">
            <span>🇹🇭 ThaiScout Community Engine</span>
            <span className="text-slate-300">|</span>
            <span className="text-[#0284c7]">Real Location Grounded</span>
          </div>

          <button
            onClick={onClose}
            className="btn btn-blue text-xs px-4 py-1.5 rounded-xl font-black shadow-[2px_2px_0px_#0369a1] cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
}
