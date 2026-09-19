"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  THAI_PROVINCES,
  REGIONS,
  searchProvinces,
  ProvinceData,
} from "@/data/provinces";
import { MapPin, Search, X, ChevronDown, Check, Globe } from "lucide-react";

interface ProvinceSelectorProps {
  value: string;
  onChange: (province: string) => void;
  allowAll?: boolean;
  compact?: boolean;
  className?: string;
  placeholder?: string;
}

export default function ProvinceSelector({
  value,
  onChange,
  allowAll = true,
  compact = false,
  className = "",
  placeholder = "เลือกจังหวัด...",
}: ProvinceSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("ทั้งหมด");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filteredProvinces = searchProvinces(searchTerm, selectedRegion);

  const currentProvinceObj = THAI_PROVINCES.find((p) => p.name === value);

  const getDisplayText = () => {
    if (value === "all" || !value) {
      return allowAll ? "🌐 ทั่วประเทศ (ทุกจังหวัด)" : placeholder;
    }
    return `📍 ${value} ${
      currentProvinceObj ? `(${currentProvinceObj.region.replace("ภาค", "")})` : ""
    }`;
  };

  const handleSelect = (provName: string) => {
    onChange(provName);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-white border-2 border-slate-300 hover:border-[#0284c7] transition-all rounded-xl font-black text-slate-800 flex items-center justify-between gap-2 shadow-[2px_2px_0px_#94a3b8] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
          compact ? "px-2.5 py-1.5 text-xs" : "px-3 py-2 text-xs sm:text-sm"
        }`}
      >
        <div className="flex items-center gap-1.5 truncate">
          {value === "all" ? (
            <Globe className="w-3.5 h-3.5 text-[#0284c7] shrink-0" />
          ) : (
            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          )}
          <span className="truncate">{getDisplayText()}</span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-500 shrink-0 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 w-72 sm:w-84 md:w-96 bg-white border-2 border-black rounded-2xl shadow-[6px_6px_0px_#000] p-3 text-slate-900 animate-in fade-in zoom-in-95 duration-100 max-h-[85vh] flex flex-col">
          {/* Header & Search Input */}
          <div className="relative mb-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="พิมพ์ค้นหา เช่น ขอนแก่น, โคราช, กทม, เชียงใหม่..."
              className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#0284c7] rounded-xl pl-9 pr-8 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Region Tabs (Horizontal Scroll) */}
          <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-none border-b border-slate-100">
            {REGIONS.map((region) => {
              const isActive = selectedRegion === region;
              const shortName =
                region === "ภาคตะวันออกเฉียงเหนือ"
                  ? "อีสาน"
                  : region.replace("ภาค", "");
              return (
                <button
                  key={region}
                  type="button"
                  onClick={() => setSelectedRegion(region)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-black shrink-0 transition-all ${
                    isActive
                      ? "bg-[#0284c7] text-white shadow-[1px_1px_0px_#0369a1]"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {shortName}
                </button>
              );
            })}
          </div>

          {/* Provinces Scroll Area */}
          <div className="overflow-y-auto max-h-60 sm:max-h-72 mt-2 space-y-1 pr-1 custom-scrollbar">
            {/* Nationwide Option */}
            {allowAll && selectedRegion === "ทั้งหมด" && !searchTerm && (
              <button
                type="button"
                onClick={() => handleSelect("all")}
                className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between border-2 transition-all text-xs font-bold ${
                  value === "all"
                    ? "bg-sky-50 border-[#0284c7] text-[#0284c7]"
                    : "bg-slate-50 border-transparent hover:border-slate-300 text-slate-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#0284c7]" />
                  <div>
                    <div className="font-black">ทั่วประเทศ (ทุกจังหวัด)</div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      ค้นหาฐานข้อมูลครอบคลุมทั้ง 77 จังหวัด (8,600+ โลเคชัน)
                    </div>
                  </div>
                </div>
                {value === "all" && <Check className="w-4 h-4 text-[#0284c7]" />}
              </button>
            )}

            {filteredProvinces.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500 font-semibold">
                ไม่พบจังหวัดที่ตรงกับ &ldquo;{searchTerm}&rdquo;
                <div className="text-[10px] text-slate-400 mt-1">
                  ลองพิมพ์ชื่อย่อ เช่น กทม, โคราช, พัทยา หรือชื่ออำเภอ
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                {filteredProvinces.map((prov) => {
                  const isSelected = value === prov.name;
                  return (
                    <button
                      key={prov.name}
                      type="button"
                      onClick={() => handleSelect(prov.name)}
                      className={`text-left px-2.5 py-1.5 rounded-xl flex items-center justify-between border transition-all text-xs ${
                        isSelected
                          ? "bg-emerald-50 border-[#16a34a] text-emerald-800 font-black shadow-[1px_1px_0px_#16a34a]"
                          : "border-slate-100 hover:border-slate-300 hover:bg-slate-50 text-slate-800 font-bold"
                      }`}
                    >
                      <div className="truncate">
                        <span className="truncate">{prov.name}</span>
                        <span className="text-[9px] text-slate-400 ml-1 font-normal">
                          {prov.region.replace("ภาค", "")}
                        </span>
                      </div>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-[#16a34a] shrink-0 ml-1" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Footer Stats */}
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-bold">
            <span>แสดง {filteredProvinces.length} จาก 77 จังหวัด</span>
            <span className="text-[#0284c7]">ครอบคลุมทั่วไทย 🇹🇭</span>
          </div>
        </div>
      )}
    </div>
  );
}
