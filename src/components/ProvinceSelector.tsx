"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  THAI_PROVINCES,
  REGIONS,
  REGION_LIST,
  searchProvinces,
  ProvinceData,
} from "@/data/provinces";
import { MapPin, Search, X, ChevronDown, Check, Globe, Layers } from "lucide-react";

interface ProvinceSelectorProps {
  value: string;
  onChange: (provinceOrRegion: string) => void;
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
  placeholder = "เลือกจังหวัดหรือภาค...",
}: ProvinceSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"regions" | "provinces">("provinces");
  const [filterRegion, setFilterRegion] = useState<string>("ทั้งหมด");
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
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [isOpen]);

  const filteredProvinces = searchProvinces(searchTerm, filterRegion);

  const currentProvinceObj = THAI_PROVINCES.find((p) => p.name === value);
  const currentRegionObj = REGION_LIST.find((r) => r.id === value);

  const getDisplayText = () => {
    if (value === "all" || !value) {
      return allowAll ? "🌐 ทั่วประเทศ (ทุกจังหวัด)" : placeholder;
    }
    if (currentRegionObj) {
      return `${currentRegionObj.icon} ${currentRegionObj.name}`;
    }
    if (value.startsWith("region:")) {
      const regName = value.replace("region:", "");
      return `📌 ${regName}`;
    }
    return `📍 ${value} ${
      currentProvinceObj ? `(${currentProvinceObj.region.replace("ภาค", "")})` : ""
    }`;
  };

  const handleSelect = (selectedKey: string) => {
    onChange(selectedKey);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-white border-2 border-slate-300 hover:border-[#0284c7] transition-all rounded-xl font-bold text-slate-900 flex items-center justify-between gap-2 shadow-[2px_2px_0px_#94a3b8] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
          compact ? "px-3 py-1.5 text-xs sm:text-sm" : "px-3.5 py-2 text-xs sm:text-sm"
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          {value === "all" ? (
            <Globe className="w-4 h-4 text-[#0284c7] shrink-0" />
          ) : value.startsWith("region:") ? (
            <Layers className="w-4 h-4 text-purple-600 shrink-0" />
          ) : (
            <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span className="truncate font-black">{getDisplayText()}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-600 shrink-0 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 w-80 sm:w-96 md:w-[420px] bg-white border-2 border-black rounded-2xl shadow-[6px_6px_0px_#000] p-3.5 text-slate-900 animate-in fade-in zoom-in-95 duration-100 max-h-[85vh] flex flex-col">
          {/* Header Mode Switch: ค้นหารายจังหวัด vs เลือกทั้งภาค */}
          {allowAll && (
            <div className="flex items-center bg-slate-100 p-1 rounded-xl mb-2.5 border border-slate-200">
              <button
                type="button"
                onClick={() => setActiveTab("provinces")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "provinces"
                    ? "bg-white text-[#0284c7] shadow-sm border border-slate-300"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                รายจังหวัด (77 จังหวัด)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("regions")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "regions"
                    ? "bg-white text-purple-700 shadow-sm border border-slate-300"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-purple-600" />
                เลือกทั้งภาค (6 ภาค)
              </button>
            </div>
          )}

          {/* TAB 1: เลือกทั้งภาค / ทั่วประเทศ */}
          {activeTab === "regions" && allowAll ? (
            <div className="space-y-1.5 overflow-y-auto max-h-72 pr-1 custom-scrollbar">
              <div className="text-[11px] font-black text-slate-500 uppercase font-mono px-1 mb-1">
                คลิกเลือกทั้งภาค หรือทั่วประเทศ:
              </div>
              {REGION_LIST.map((reg) => {
                const isSelected = value === reg.id;
                return (
                  <button
                    key={reg.id}
                    type="button"
                    onClick={() => handleSelect(reg.id)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center justify-between border-2 transition-all ${
                      isSelected
                        ? "bg-purple-50 border-purple-600 text-purple-900 font-black shadow-[2px_2px_0px_#7c3aed]"
                        : "bg-slate-50 border-slate-200 hover:border-slate-400 hover:bg-slate-100 text-slate-800 font-bold"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{reg.icon}</span>
                      <div>
                        <div className="text-xs sm:text-sm font-black text-slate-900">
                          {reg.name}
                        </div>
                        <div className="text-[11px] text-slate-600 font-medium">
                          {reg.id === "all"
                            ? "ค้นหาทั้งหมด 77 จังหวัดทั่วไทย (8,600+ พิกัด)"
                            : `ครอบคลุมทุกจังหวัดใน${reg.name} (${reg.count} จังหวัด)`}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-5 h-5 text-purple-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            /* TAB 2: ค้นหารายจังหวัด */
            <>
              {/* Search Input Box */}
              <div className="relative mb-2">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="พิมพ์ค้นหา เช่น ขอนแก่น, โคราช, กทม, เชียงใหม่..."
                  className="w-full bg-slate-50 border-2 border-slate-300 focus:border-[#0284c7] rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-500 focus:outline-none"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 p-0.5"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Filter by Region Chips */}
              <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200">
                {REGIONS.map((region) => {
                  const isActive = filterRegion === region;
                  const shortName =
                    region === "ภาคตะวันออกเฉียงเหนือ"
                      ? "อีสาน"
                      : region.replace("ภาค", "");
                  return (
                    <button
                      key={region}
                      type="button"
                      onClick={() => setFilterRegion(region)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-black shrink-0 transition-all ${
                        isActive
                          ? "bg-[#0284c7] text-white shadow-[1px_1px_0px_#0369a1]"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {shortName}
                    </button>
                  );
                })}
              </div>

              {/* Provinces List */}
              <div className="overflow-y-auto max-h-64 sm:max-h-72 mt-2 space-y-1 pr-1 custom-scrollbar">
                {/* Option to select Nationwide when on "ทั้งหมด" and no search term */}
                {allowAll && filterRegion === "ทั้งหมด" && !searchTerm && (
                  <button
                    type="button"
                    onClick={() => handleSelect("all")}
                    className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between border-2 transition-all mb-1 text-xs sm:text-sm font-bold ${
                      value === "all"
                        ? "bg-sky-50 border-[#0284c7] text-[#0284c7] font-black"
                        : "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-[#0284c7]" />
                      <div>
                        <div className="font-black text-slate-900">ทั่วประเทศ (ทุกจังหวัด)</div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          ดึงข้อมูลทุกจังหวัดในดาต้าเบส 8,628 พิกัด
                        </div>
                      </div>
                    </div>
                    {value === "all" && <Check className="w-4 h-4 text-[#0284c7]" />}
                  </button>
                )}

                {filteredProvinces.length === 0 ? (
                  <div className="p-4 text-center text-xs sm:text-sm text-slate-600 font-bold">
                    ไม่พบจังหวัดที่ตรงกับ &ldquo;{searchTerm}&rdquo;
                    <div className="text-xs text-slate-500 mt-1 font-normal">
                      ลองพิมพ์ชื่อย่อ เช่น กทม, โคราช, พัทยา, หัวหิน, หรือเบตง
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
                          className={`text-left px-3 py-2 rounded-xl flex items-center justify-between border transition-all text-xs sm:text-sm ${
                            isSelected
                              ? "bg-emerald-50 border-[#16a34a] text-emerald-900 font-black shadow-[1px_1px_0px_#16a34a]"
                              : "border-slate-200 hover:border-slate-400 hover:bg-slate-50 text-slate-900 font-bold"
                          }`}
                        >
                          <div className="truncate">
                            <span className="truncate">{prov.name}</span>
                            <span className="text-[10px] text-slate-500 ml-1.5 font-medium">
                              {prov.region.replace("ภาค", "")}
                            </span>
                          </div>
                          {isSelected && (
                            <Check className="w-4 h-4 text-[#16a34a] shrink-0 ml-1" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Quick Footer */}
          <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 font-bold">
            <span>แสดง {filteredProvinces.length} จาก 77 จังหวัด</span>
            <span className="text-[#0284c7] font-black">ฐานข้อมูล ททท. ครอบคลุมทั่วไทย 🇹🇭</span>
          </div>
        </div>
      )}
    </div>
  );
}
