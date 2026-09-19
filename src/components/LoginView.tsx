"use client";

import React, { useState, useEffect } from "react";
import { UserPlus, LogIn, ShieldCheck, ChevronRight, Sparkles } from "lucide-react";
import { MockUser, getMockUsers, registerMockUser, authenticateMockUser } from "@/utils/mockAuth";

interface LoginViewProps {
  onLogin: (user: MockUser) => void;
}

export default function LoginView({ onLogin }: LoginViewProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [usersTable, setUsersTable] = useState<MockUser[]>([]);

  useEffect(() => {
    setUsersTable(getMockUsers());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("กรุณากรอกอีเมล");
      return;
    }

    if (mode === "register") {
      if (!name.trim()) {
        setError("กรุณากรอกชื่อ-นามสกุล หรือชื่อทีมงาน");
        return;
      }
      const res = registerMockUser({
        name: name.trim(),
        email: email.trim(),
        password: password || "password123",
      });

      if (!res.success || !res.user) {
        setError(res.error || "ไม่สามารถลงทะเบียนได้");
        return;
      }

      setUsersTable(getMockUsers());
      onLogin(res.user);
    } else {
      const res = authenticateMockUser(email.trim(), password);
      if (!res.success || !res.user) {
        setError(res.error || "เข้าสู่ระบบไม่สำเร็จ");
        return;
      }
      onLogin(res.user);
    }
  };

  const handleQuickLogin = (user: MockUser) => {
    onLogin(user);
  };

  return (
    <div className="min-h-screen bg-[#285185] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#ccd9e2]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#d67940]/20 rounded-full blur-3xl pointer-events-none" />

      {/* CENTERED CARD CONTAINER */}
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_#183354] border-[3px] border-[#285185] z-10 relative my-auto">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#d67940] border-2 border-white/20 flex items-center justify-center text-white shadow-[3px_3px_0px_#a8521d] font-black text-2xl mx-auto mb-3">
            ⚡
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#1b3558] tracking-tight">
            Travel Location
          </h1>
          <p className="text-xs font-bold text-slate-500 mt-0.5">
            Creator Space · ค้นหาโลเคชันถ่ายทำ ททท.
          </p>
        </div>

        {/* Toggle Mode: Login vs Register */}
        <div className="flex bg-[#f0f5f8] p-1 rounded-2xl mb-5 border border-[#ccd9e2]">
          <button
            type="button"
            onClick={() => { setMode("login"); setError(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === "login"
                ? "bg-[#285185] text-white shadow-sm"
                : "text-slate-600 hover:text-[#285185]"
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>เข้าสู่ระบบ</span>
          </button>
          <button
            type="button"
            onClick={() => { setMode("register"); setError(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === "register"
                ? "bg-[#d67940] text-white shadow-sm"
                : "text-slate-600 hover:text-[#d67940]"
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>ลงทะเบียนใหม่</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
            ⚠️ {error}
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === "register" && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ชื่อ-นามสกุล หรือชื่อกองถ่าย
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น มินท์ N, สยามโปรดักชั่น"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#285185] focus:ring-2 focus:ring-[#285185]/15"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              อีเมล
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="creator@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#285185] focus:ring-2 focus:ring-[#285185]/15"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              รหัสผ่าน
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="•••••••• (ตัวอย่าง: password123)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#285185] focus:ring-2 focus:ring-[#285185]/15"
            />
          </div>

          <button
            type="submit"
            className={`w-full py-2.5 px-4 rounded-xl text-white font-black text-sm shadow-[3px_3px_0px_#183354] transition cursor-pointer flex items-center justify-center gap-2 mt-2 ${
              mode === "register"
                ? "bg-[#d67940] hover:bg-[#c06530]"
                : "bg-[#285185] hover:bg-[#1f406a]"
            }`}
          >
            {mode === "register" ? (
              <>
                <UserPlus className="w-4 h-4" />
                <span>ลงทะเบียนและเริ่มใช้งาน</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>เข้าสู่ระบบ</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Login Accounts (Simulated Database Table) */}
        <div className="mt-5 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-black text-slate-700">
              บัญชีในตาราง Database จำลอง ({usersTable.length} บัญชี)
            </p>
            <span className="text-[10px] font-mono text-slate-400">คลิกเพื่อเข้าด่วน</span>
          </div>

          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {usersTable.map((u) => (
              <div
                key={u.id}
                onClick={() => handleQuickLogin(u)}
                className="p-2 rounded-xl border border-slate-200 hover:border-[#285185] bg-slate-50/80 hover:bg-[#f0f5f8] transition cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-7 h-7 rounded-lg bg-[#285185] text-white flex items-center justify-center text-xs font-black shrink-0">
                    {u.avatar || u.name.charAt(0)}
                  </div>
                  <div className="truncate">
                    <div className="font-bold text-xs text-slate-900 truncate leading-tight">
                      {u.name}
                    </div>
                    <p className="text-[10px] font-mono text-slate-400 truncate">
                      {u.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-bold text-[#285185] group-hover:translate-x-0.5 transition shrink-0 ml-1">
                  <span>เลือก</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Small Note */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-[10px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-[#d67940] shrink-0" />
          <span>ระบบจำลองฐานข้อมูลในเครื่อง (LocalStorage Prototype)</span>
        </div>

      </div>
    </div>
  );
}
