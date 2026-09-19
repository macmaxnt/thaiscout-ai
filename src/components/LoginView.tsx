"use client";

import React, { useState } from "react";
import { Zap, ChevronRight } from "lucide-react";

interface LoginViewProps {
  onLogin: (user: { role: "creator" | "owner"; name: string; email: string }) => void;
}

export default function LoginView({ onLogin }: LoginViewProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    const isOwner = email.toLowerCase().includes("owner") || email.toLowerCase().includes("host");
    onLogin({
      role: isOwner ? "owner" : "creator",
      name: isOwner ? "คุณเอก (เจ้าของพื้นที่)" : "มินท์ N",
      email: email,
    });
  };

  return (
    <div className="min-h-screen bg-[#1e3a5f] flex flex-col lg:flex-row items-center justify-between p-6 sm:p-12 lg:p-20 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#e06d44]/10 rounded-full blur-3xl pointer-events-none" />

      {/* LEFT SECTION: Brand Hero & Value Proposition */}
      <div className="w-full lg:max-w-xl text-white space-y-8 z-10 py-6">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#e06d44] flex items-center justify-center text-white shadow-md font-black text-xl">
            ⚡
          </div>
          <div>
            <h1 className="font-extrabold text-lg leading-tight tracking-tight text-white">
              Travel Location
            </h1>
            <p className="font-semibold text-xs tracking-wide text-slate-300">
              Marketplace
            </p>
          </div>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="space-y-4">
          <div className="inline-block text-xs font-bold uppercase tracking-wider text-slate-300/80">
            LOCATION WORKSPACE
          </div>
          <h2 className="text-3xl sm:text-5xl font-black leading-tight tracking-tight text-white">
            ทุกมุมที่ใช่ <br />
            <span className="text-[#e06d44]">เริ่มจากข้อมูลที่ตรวจสอบได้</span>
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed pt-2 max-w-md font-normal">
            พื้นที่ทำงานที่แยกชัดเจนสำหรับคนหาโลเคชันและเจ้าของสถานที่ พร้อมสถานะและแหล่งที่มาของข้อมูล
          </p>
        </div>

        {/* Bullet Points */}
        <div className="space-y-3 pt-2 text-xs sm:text-sm text-slate-200">
          <div className="flex items-center gap-2.5">
            <span className="w-4 h-4 rounded-full bg-blue-500/30 flex items-center justify-center text-[10px] text-blue-200 font-bold">
              🔍
            </span>
            <span>ค้นหาและปักหมุดหลายสถานที่</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="w-4 h-4 rounded-full bg-blue-500/30 flex items-center justify-center text-[10px] text-blue-200 font-bold">
              ○
            </span>
            <span>ส่งคำขอเป็นรายสถานที่</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="w-4 h-4 rounded-full bg-blue-500/30 flex items-center justify-center text-[10px] text-blue-200 font-bold">
              ▣
            </span>
            <span>เจ้าของเห็นความสนใจและคำขอ</span>
          </div>
        </div>

        {/* Bottom Small Indicator */}
        <div className="pt-8">
          <div className="w-8 h-8 rounded-full bg-[#152943] text-slate-300 border border-slate-600/50 flex items-center justify-center font-bold text-xs shadow-inner">
            N
          </div>
        </div>
      </div>

      {/* RIGHT SECTION: White Sign-In Card Matching Prototype */}
      <div className="w-full lg:w-[460px] bg-white rounded-3xl p-8 sm:p-10 shadow-2xl z-10 relative mt-8 lg:mt-0">
        {/* Eyebrow & Title */}
        <div className="mb-6">
          <span className="text-[11px] font-black uppercase tracking-wider text-[#b95d46]">
            SIGN IN · PROTOTYPE
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            เข้าสู่พื้นที่ทำงาน
          </h3>
          <p className="text-xs text-slate-500 mt-1.5">
            เลือกบัญชีทดสอบด้านล่าง หรือกรอกอีเมลและรหัสผ่าน
          </p>
        </div>

        {/* Form Inputs (Prototype Mock) */}
        <form onSubmit={handleCustomSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              อีเมล
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-blue-500/10 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              รหัสผ่าน
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-blue-500/10 transition"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-[#1e3a5f] hover:bg-[#152943] text-white font-bold text-sm shadow-md transition cursor-pointer"
          >
            เข้าสู่ระบบ
          </button>
        </form>

        {/* Test Accounts Section */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-xs font-bold text-slate-700 mb-3">
            บัญชีสำหรับทดสอบ
          </p>

          <div className="space-y-3">
            {/* 1. Creator Account Button */}
            <div
              onClick={() =>
                onLogin({
                  role: "creator",
                  name: "มินท์ N",
                  email: "creator@travel-location.test",
                })
              }
              className="p-3.5 rounded-2xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 transition cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-200/80 flex items-center justify-center text-slate-700 font-bold shrink-0">
                  <span className="text-sm">⚑</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">
                      Creator
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">
                    ค้นหา ปักหมุด วางแผน และส่งคำขอ
                  </p>
                  <p className="text-[10px] font-mono text-slate-400">
                    creator@travel-location.test · Creator123!
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-bold text-slate-700 group-hover:text-blue-600 transition shrink-0 ml-2">
                <span>ใช้บัญชีนี้</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* 2. Owner Account Button */}
            <div
              onClick={() =>
                onLogin({
                  role: "owner",
                  name: "คุณเอก (เจ้าของพื้นที่)",
                  email: "owner@travel-location.test",
                })
              }
              className="p-3.5 rounded-2xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 transition cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100/70 border border-rose-200/60 flex items-center justify-center text-rose-700 font-bold shrink-0">
                  <span className="text-xs">▣</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">
                      Owner
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">
                    จัดการสถานที่ ตอบคำขอ และดูสถิติ
                  </p>
                  <p className="text-[10px] font-mono text-slate-400">
                    owner@travel-location.test · Owner123!
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-bold text-slate-700 group-hover:text-blue-600 transition shrink-0 ml-2">
                <span>ใช้บัญชีนี้</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-4 leading-relaxed">
            * ใช้เพื่อทดสอบ prototype เท่านั้น ไม่มีการเชื่อมต่อระบบยืนยันตัวตนจริง
          </p>
        </div>
      </div>
    </div>
  );
}
