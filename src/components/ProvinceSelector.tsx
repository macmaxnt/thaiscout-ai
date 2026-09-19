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
import RegionIcon from "@/components/RegionIcon";

interface ProvinceSelectorProps {
  value: string;
  onChange: (provinceOrRegion: string) => void;
  allowAll?: boolean;
  compact?: boolean;
  className?: string;
  placeholder?: string;
  /** Region filter controlled from outside (e.g. region buttons). When provided, the in-dropdown chips are hidden. */
  filterRegion?: string;
  /** Called when user changes region inside dropdown (only when filterRegion is NOT controlled externally) */
  onFilterRegionChange?: (region: string) => void;
}

export default function ProvinceSelector({
  value,
  onChange,
  allowAll = true,
  compact = false,
  className = "",
  placeholder = "เลือกจังหวัดหรือภาค...",
  filterRegion: externalFilterRegion,
  onFilterRegionChange,
}: ProvinceSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  // Internal region filter — only used when filterRegion is NOT controlled externally
  const [internalFilterRegion, setInternalFilterRegion] = useState<string>("ทั้งหมด");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Decide which filterRegion to use
  const isExternallyControlled = externalFilterRegion !== undefined;
  const filterRegion = isExternallyControlled ? externalFilterRegion : internalFilterRegion;

  const handleFilterRegionChange = (region: string) => {
    if (isExternallyControlled) {
      onFilterRegionChange?.(region);
    } else {
      setInternalFilterRegion(region);
    }
  };

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

  // เมื่อพิมพ์ค้นหา → ค้นข้ามทุกภาค; เมื่อไม่พิมพ์ → filter ตามภาคที่เลือก
  const filteredProvinces = searchTerm.trim()
    ? searchProvinces(searchTerm, "ทั้งหมด")
    : searchProvinces("", filterRegion);

  const currentProvinceObj = THAI_PROVINCES.find((p) => p.name === value);
  const currentRegionObj = REGION_LIST.find((r) => r.id === value);

  const getDisplayText = () => {
    if (value.startsWith("region:")) {
      const regName = value.replace("region:", "");
      return `ทุกจังหวัดใน${regName}`;
    }
    if (value === "all" || !value) {
      if (filterRegion && filterRegion !== "ทั้งหมด") {
        return `ทุกจังหวัดใน${filterRegion}`;
      }
      return allowAll ? "ทุกจังหวัด (ทั่วประเทศ)" : placeholder;
    }
    if (currentRegionObj) {
      return currentRegionObj.name;
    }
    return `${value}${currentProvinceObj ? ` (${currentProvinceObj.region.replace("ภาค", "")})` : ""}`;
  };

  const handleSelect = (selectedKey: string) => {
    const prov = THAI_PROVINCES.find((p) => p.name === selectedKey);
    if (prov && isExternallyControlled && filterRegion !== prov.region) {
      onFilterRegionChange?.(prov.region);
    }
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
          <MapPin className={`w-4 h-4 shrink-0 ${
            value && value !== "all" && !value.startsWith("region:")
              ? "text-rose-600"
              : "text-slate-400"
          }`} />
          <span className="truncate font-black flex items-center gap-1.5">
            {currentRegionObj && <RegionIcon name={currentRegionObj.icon} size={15} className="shrink-0" />}
            {getDisplayText()}
          </span>
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
          {/* Province list only */}
          <>
              {/* Region badge — แสดงเมื่อ filter ภาคจากข้างนอก */}
              {isExternallyControlled && filterRegion !== "ทั้งหมด" && (
                <div className="flex items-center gap-1.5 mb-2 px-2 py-1 bg-sky-50 border border-sky-200 rounded-lg">
                  <Layers className="w-3 h-3 text-[#0284c7] shrink-0" />
                  <span className="text-[11px] font-black text-[#0284c7]">
                    กรองเฉพาะ{filterRegion} · {filteredProvinces.length} จังหวัด
                  </span>
                  <span className="text-[10px] text-slate-500 ml-0.5">(พิมพ์เพื่อค้นหาข้ามภาค)</span>
                </div>
              )}

              {/* Search Input Box */}
              <div className="relative mb-2">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={
                    isExternallyControlled && filterRegion !== "ทั้งหมด"
                      ? `ค้นหาใน${filterRegion} หรือพิมพ์ข้ามภาค...`
                      : "พิมพ์ค้นหา เช่น ขอนแก่น, โคราช, กทม, เชียงใหม่..."
                  }
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

              {/* Filter by Region Chips — only show when NOT externally controlled */}
              {!isExternallyControlled && (
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
                        onClick={() => handleFilterRegionChange(region)}
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
              )}

              {/* Provinces List */}
              <div className="overflow-y-auto max-h-64 sm:max-h-72 mt-2 space-y-1 pr-1 custom-scrollbar">
                {/* Option to select All provinces in this specific region */}
                {filterRegion && filterRegion !== "ทั้งหมด" && !searchTerm && (
                  <button
                    type="button"
                    onClick={() => handleSelect(`region:${filterRegion}`)}
                    className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between border-2 transition-all mb-1 text-xs sm:text-sm font-bold ${
                      value === `region:${filterRegion}` || (value === "all" && filterRegion !== "ทั้งหมด")
                        ? "bg-sky-50 border-[#0284c7] text-[#0284c7] font-black"
                        : "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#0284c7]" />
                      <div>
                        <div className="font-black text-slate-900">ทุกจังหวัดใน{filterRegion}</div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          ปักหมุดแลนด์มาร์กสำคัญทั่ว{filterRegion} ({filteredProvinces.length} จังหวัด)
                        </div>
                      </div>
                    </div>
                    {(value === `region:${filterRegion}` || (value === "all" && filterRegion !== "ทั้งหมด")) && (
                      <Check className="w-4 h-4 text-[#0284c7]" />
                    )}
                  </button>
                )}

                {/* Option to select Nationwide when on "ทั้งหมด" and no search term */}
                {allowAll && (!filterRegion || filterRegion === "ทั้งหมด") && !searchTerm && (
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
                          ปักหมุดแลนด์มาร์กตัวแทน 77 จังหวัดทั่วไทย
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

          {/* Quick Footer */}
          <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 font-bold">
            <span>
              {searchTerm.trim()
                ? `ผลค้นหา ${filteredProvinces.length} จังหวัด`
                : filterRegion !== "ทั้งหมด"
                ? `${filterRegion.replace("ภาค", "")} · ${filteredProvinces.length} จังหวัด`
                : `ทั้งหมด 77 จังหวัด`}
            </span>
            <span className="text-[#0284c7] font-black">ฐานข้อมูล ททท. 🇹🇭</span>
          </div>
        </div>
      )}
    </div>
  );
}
