"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";

export interface MapLocation {
  id: string;
  name_th: string;
  name_en?: string;
  province: string;
  district?: string;
  lat?: number;
  lng?: number;
  tel?: string;
  category?: string;
  hilight?: string;
  relevanceScore?: number;
}

interface InteractiveMapProps {
  locations: MapLocation[];
  selectedLocation: MapLocation | null;
  scoutingList: MapLocation[];
  onSelectLocation: (loc: MapLocation) => void;
  onDeselect?: () => void;
  onToggleScout: (loc: MapLocation) => void;
  onClearScout?: () => void;
  filterOnlyPinned?: boolean;
  onToggleFilterOnlyPinned?: () => void;
  onOpenRag?: (loc: MapLocation) => void;
}

function calculateTotalDistance(locs: MapLocation[]): number {
  const valid = locs.filter((l) => l.lat && l.lng);
  if (valid.length < 2) return 0;
  let total = 0;
  const R = 6371;
  for (let i = 0; i < valid.length - 1; i++) {
    const lat1 = (valid[i].lat! * Math.PI) / 180;
    const lon1 = (valid[i].lng! * Math.PI) / 180;
    const lat2 = (valid[i + 1].lat! * Math.PI) / 180;
    const lon2 = (valid[i + 1].lng! * Math.PI) / 180;
    const dlat = lat2 - lat1;
    const dlon = lon2 - lon1;
    const a =
      Math.sin(dlat / 2) * Math.sin(dlat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2) * Math.sin(dlon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    total += R * c;
  }
  return Math.round(total * 10) / 10;
}

function isThailandCoords(lat?: number, lng?: number): boolean {
  if (typeof lat !== "number" || typeof lng !== "number") return false;
  return lat >= 5.5 && lat <= 20.6 && lng >= 97.0 && lng <= 106.0;
}

export default function InteractiveMap({
  locations,
  selectedLocation,
  scoutingList,
  onSelectLocation,
  onDeselect,
  onToggleScout,
  onClearScout,
  filterOnlyPinned = false,
  onToggleFilterOnlyPinned,
  onOpenRag,
}: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const prevSelectedIdRef = useRef<string | null>(null);

  const onDeselectRef = useRef(onDeselect);
  useEffect(() => {
    onDeselectRef.current = onDeselect;
  });

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [13.7367, 100.5231],
      zoom: 6,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    // Capture click on the Leaflet popup "x" close button directly
    const container = mapContainerRef.current;
    const handleCloseButtonClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest(".leaflet-popup-close-button")) {
        onDeselectRef.current?.();
      }
    };
    container?.addEventListener("click", handleCloseButtonClick, true);

    // Deselect when clicking on empty map space (not on a marker or popup body)
    map.on("click", (e) => {
      const target = e.originalEvent?.target as HTMLElement | null;
      if (target && target.closest(".leaflet-popup-close-button")) {
        onDeselectRef.current?.();
        return;
      }
      if (target && (target.closest(".custom-teardrop-pin") || target.closest(".leaflet-popup"))) {
        return;
      }
      onDeselectRef.current?.();
    });

    // Deselect when popup is closed (e.g. clicking the "x" close button or pressing Esc)
    map.on("popupclose", () => {
      setTimeout(() => {
        if (!mapInstanceRef.current) return;
        const activePopup = (mapInstanceRef.current as any)._popup;
        if (!activePopup) {
          onDeselectRef.current?.();
        }
      }, 50);
    });

    return () => {
      container?.removeEventListener("click", handleCloseButtonClick, true);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    if (routePolylineRef.current) {
      routePolylineRef.current.remove();
      routePolylineRef.current = null;
    }

    const locsToRender = filterOnlyPinned ? scoutingList : locations;
    const validLocs = locsToRender.filter((l) => isThailandCoords(l.lat, l.lng));
    const bounds: [number, number][] = [];

    // Polyline for Recce Points
    const validRecce = scoutingList.filter((l) => isThailandCoords(l.lat, l.lng));
    if (validRecce.length >= 2) {
      const latLngs = validRecce.map((l) => [l.lat!, l.lng!] as [number, number]);
      routePolylineRef.current = L.polyline(latLngs, {
        color: "#0284c7",
        weight: 4,
        dashArray: "6, 8",
        opacity: 0.9,
      }).addTo(map);
    }

    validLocs.forEach((loc) => {
      const lat = loc.lat!;
      const lng = loc.lng!;
      bounds.push([lat, lng]);

      const isSelected = selectedLocation?.id === loc.id;
      const recceIndex = scoutingList.findIndex((x) => x.id === loc.id);
      const isRecce = recceIndex !== -1;

      // Pin colors & size
      const size = isSelected ? 38 : isRecce ? 34 : 30;
      const bg = isSelected ? "#e11d48" : isRecce ? "#16a34a" : "#7c3aed";
      const border = isSelected ? "#881337" : isRecce ? "#14532d" : "#4c1d95";
      const badgeText = isRecce ? `#${recceIndex + 1}` : isSelected ? "★" : "📍";

      // Teardrop pin design with exact anchoring
      const pinHtml = `
        <div style="
          width: ${size}px;
          height: ${size}px;
          background: ${bg};
          border: 2.5px solid ${border};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: ${isSelected ? "3px 3px 0px #000000" : "2px 2px 0px rgba(0,0,0,0.35)"};
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.15s ease;
        ">
          <span style="
            transform: rotate(45deg);
            color: #ffffff;
            font-family: 'Nunito', 'Mitr', sans-serif;
            font-weight: 900;
            font-size: ${isRecce ? "12px" : "11px"};
            text-align: center;
            line-height: 1;
          ">${badgeText}</span>
        </div>
      `;

      const marker = L.marker([lat, lng], {
        icon: L.divIcon({
          className: "custom-teardrop-pin",
          html: pinHtml,
          iconSize: [size, size],
          iconAnchor: [size / 2, size],
          popupAnchor: [0, -size - 6],
        }),
        zIndexOffset: isSelected ? 1000 : isRecce ? 500 : 100,
      });

      // Hover Tooltip: Clean & non-intrusive
      marker.bindTooltip(
        `<div style="font-family:'Nunito','Mitr',sans-serif; font-weight:800; font-size:11px;">${isRecce ? `[จุดที่ ${recceIndex + 1}] ` : ""}${loc.name_th}</div>`,
        {
          direction: "top",
          offset: [0, -size - 4],
          opacity: 0.95,
        }
      );

      // Popup Content: Structured cleanly above the pin with interactive buttons
      const popupDiv = document.createElement("div");
      popupDiv.style.minWidth = "220px";
      popupDiv.style.maxWidth = "280px";
      popupDiv.style.fontFamily = "'Nunito', 'Mitr', sans-serif";

      const isPinned = scoutingList.some((x) => x.id === loc.id);
      const districtLabel = loc.district
        ? `• ${loc.province === "กรุงเทพมหานคร" ? "เขต" : "อ."}${loc.district.replace(/^(อ\.|เขต)/, "")}`
        : "";

      popupDiv.innerHTML = `
        <div style="padding: 2px;">
          <div style="font-size: 13px; font-weight: 900; color: #0f172a; margin-bottom: 2px; line-height: 1.25;">
            ${loc.name_th}
          </div>
          <div style="font-size: 11px; font-weight: 700; color: #475569; margin-bottom: 4px;">
            📍 ${loc.province} ${districtLabel}
          </div>
          ${loc.tel ? `<div style="font-size: 11px; font-weight: 800; color: #d97706; margin-bottom: 4px;">📞 ${loc.tel}</div>` : ""}
          <div style="font-size: 10px; font-family: monospace; color: #0284c7; font-weight: 700; margin-bottom: 8px;">
            GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}
          </div>
          <div style="padding-top: 8px; border-top: 1px solid #e2e8f0; display: flex; gap: 6px; align-items: center;">
            <button
              id="map-popup-pin-${loc.id}"
              type="button"
              style="
                flex: 1;
                padding: 6px 10px;
                border-radius: 10px;
                font-size: 11px;
                font-weight: 900;
                cursor: pointer;
                border: 2px solid ${isPinned ? '#e11d48' : '#16a34a'};
                background-color: ${isPinned ? '#ffe4e6' : '#bbf7d0'};
                color: ${isPinned ? '#9f1239' : '#14532d'};
                box-shadow: 2px 2px 0px ${isPinned ? '#be123c' : '#15803d'};
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 4px;
                font-family: inherit;
                transition: all 0.1s ease;
              "
            >
              ${isPinned ? "✕ ปลดหมุด" : "📌 + ปักหมุด"}
            </button>
            ${
              onOpenRag
                ? `
              <button
                id="map-popup-rag-${loc.id}"
                type="button"
                style="
                  padding: 6px 10px;
                  border-radius: 10px;
                  font-size: 11px;
                  font-weight: 900;
                  cursor: pointer;
                  border: 2px solid #7c3aed;
                  background-color: #f5f3ff;
                  color: #6d28d9;
                  box-shadow: 2px 2px 0px #7c3aed;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 3px;
                  font-family: inherit;
                  white-space: nowrap;
                  transition: all 0.1s ease;
                "
              >
                ✨ AI RAG
              </button>
            `
                : ""
            }
          </div>
        </div>
      `;

      // Attach button click events
      const pinBtn = popupDiv.querySelector(`#map-popup-pin-${loc.id}`);
      if (pinBtn) {
        pinBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          e.preventDefault();
          onSelectLocation(loc);
          onToggleScout(loc);
        });
      }

      const ragBtn = popupDiv.querySelector(`#map-popup-rag-${loc.id}`);
      if (ragBtn && onOpenRag) {
        ragBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          e.preventDefault();
          onOpenRag(loc);
        });
      }

      marker.bindPopup(popupDiv);

      marker.on("click", () => {
        onSelectLocation(loc);
      });

      layer.addLayer(marker);

      if (isSelected) {
        marker.openPopup();
      }
    });

    const prevSelectedId = prevSelectedIdRef.current;
    const isNewSelection = selectedLocation && selectedLocation.id !== prevSelectedId;
    prevSelectedIdRef.current = selectedLocation?.id || null;

    if (isNewSelection && selectedLocation?.lat && selectedLocation?.lng) {
      map.flyTo([selectedLocation.lat, selectedLocation.lng], 14, {
        duration: 0.8,
      });
    } else if (!selectedLocation && prevSelectedId !== null && bounds.length > 0) {
      map.closePopup();
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
    } else if (!selectedLocation) {
      map.closePopup();
    }
  }, [locations, selectedLocation, scoutingList, filterOnlyPinned, onOpenRag]);

  const handleFitAll = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const locsToFit = filterOnlyPinned ? scoutingList : locations;
    const valid = locsToFit.filter((l) => isThailandCoords(l.lat, l.lng));
    if (valid.length === 0) return;
    const bounds = valid.map((l) => [l.lat!, l.lng!] as [number, number]);
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
  };

  const validRecce = scoutingList.filter((x) => isThailandCoords(x.lat, x.lng));
  let googleMapsUrl = "";
  if (validRecce.length > 0) {
    const origin = `${validRecce[0].lat},${validRecce[0].lng}`;
    const destination = `${validRecce[validRecce.length - 1].lat},${validRecce[validRecce.length - 1].lng}`;
    const waypoints = validRecce
      .slice(1, -1)
      .map((x) => `${x.lat},${x.lng}`)
      .join("|");
    googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${
      waypoints ? `&waypoints=${waypoints}` : ""
    }&travelmode=driving`;
  }

  const totalDistance = calculateTotalDistance(scoutingList);

  return (
    <div className="bg-white border-[2.5px] border-[#0284c7] rounded-[24px] shadow-[5px_5px_0px_#0369a1] overflow-hidden flex flex-col h-[calc(100vh-110px)] sticky top-4">
      {/* Map Control Header */}
      <div className="bg-[#f0f9ff] px-3.5 py-2.5 border-b-2 border-[#0284c7] flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="bg-[#bae6fd] border border-[#0284c7] rounded-lg px-2 py-0.5 text-xs font-black text-[#0c4a6e]">
            🗺️ Live Map
          </span>
          <span className="text-xs font-black text-[#0c4a6e]">
            {filterOnlyPinned
              ? `📌 ${scoutingList.filter((l) => l.lat && l.lng).length} จุดที่ปักไว้`
              : `${locations.filter((l) => l.lat && l.lng).length} หมุดพิกัด`}
          </span>

          {/* Filter only pinned toggle */}
          {onToggleFilterOnlyPinned && (
            <button
              onClick={onToggleFilterOnlyPinned}
              disabled={scoutingList.length === 0}
              className={`btn text-xs px-2.5 py-1 rounded-xl font-black flex items-center gap-1 transition ${
                filterOnlyPinned
                  ? "bg-[#f43f5e] border-[#be123c] text-white shadow-[2px_2px_0px_#881337]"
                  : scoutingList.length > 0
                  ? "bg-white border-[#f43f5e] text-[#be123c] hover:bg-rose-50 shadow-[2px_2px_0px_#f43f5e]"
                  : "bg-slate-100 border-slate-300 text-slate-400 cursor-not-allowed opacity-60"
              }`}
              title={scoutingList.length === 0 ? "ยังไม่มีหมุดที่ปักไว้" : "สลับแสดงเฉพาะจุดที่ปักหมุด"}
            >
              <span>{filterOnlyPinned ? "🗺️ แสดงทั้งหมด" : "📌 เฉพาะที่ปักหมุด"}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  filterOnlyPinned ? "bg-white text-rose-700" : "bg-rose-100 text-rose-800"
                }`}
              >
                {scoutingList.length}
              </span>
            </button>
          )}

          {/* Clear pins button */}
          {onClearScout && scoutingList.length > 0 && (
            <button
              onClick={onClearScout}
              className="btn text-xs px-2.5 py-1 rounded-xl font-black bg-white hover:bg-rose-50 border border-rose-300 text-rose-700 shadow-[2px_2px_0px_#fca5a5] flex items-center gap-1 transition"
              title="ล้างหมุดสำรวจทั้งหมด"
            >
              <span>🗑️ ล้างหมุด</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleFitAll}
            className="btn btn-blue text-xs px-3 py-1 rounded-xl font-black"
            title="ซูมออกดูระยะห่างของหมุดทั้งหมด"
          >
            🔍 ซูมดูทั้งหมด
          </button>

          {googleMapsUrl && (
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-mint text-xs px-3 py-1 rounded-xl font-black"
            >
              🚀 เปิด Route
            </a>
          )}
        </div>
      </div>

      {/* Selected Location Pill */}
      {selectedLocation && (
        <div className="bg-white px-4 py-2 border-b border-slate-200 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-1.5 truncate">
            <span className="text-rose-600 font-bold shrink-0">🎯 ปักจุด:</span>
            <span className="font-black text-slate-900 truncate">
              {selectedLocation.name_th} ({selectedLocation.province})
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onToggleScout(selectedLocation)}
              className="btn btn-mint text-[11px] px-2.5 py-0.5 rounded-lg font-black shrink-0"
            >
              {scoutingList.some((x) => x.id === selectedLocation.id) ? "✓ ปักแล้ว" : "+ ปักหมุด"}
            </button>
            {onDeselect && (
              <button
                onClick={onDeselect}
                className="w-5 h-5 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-700 flex items-center justify-center text-xs font-black transition cursor-pointer"
                title="ยกเลิกการเลือก (Deselect)"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* Recce Distance Bar */}
      {validRecce.length >= 1 && (
        <div className="bg-[#fffbeb] px-4 py-1.5 border-b border-[#fef08a] flex items-center justify-between text-[11px] text-[#78350f] font-bold shrink-0">
          <div className="flex items-center gap-2">
            <span>
              📍 เส้นทางสำรวจ {validRecce.length} จุด (เส้นประฟ้า)
            </span>
            {validRecce.length >= 2 && (
              <span className="font-black font-mono">
                ~{totalDistance} กม.
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {onToggleFilterOnlyPinned && (
              <button
                onClick={onToggleFilterOnlyPinned}
                className="hover:underline text-amber-900 font-bold"
              >
                {filterOnlyPinned ? "← แสดงหมุดทั้งหมด" : "กรองเฉพาะหมุดนี้"}
              </button>
            )}
            {onClearScout && (
              <button
                onClick={onClearScout}
                className="hover:underline text-rose-700 font-bold flex items-center gap-0.5"
              >
                🗑️ ล้างหมุด
              </button>
            )}
          </div>
        </div>
      )}

      {/* Map Body */}
      <div className="relative flex-1 w-full h-full min-h-[350px]">
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>
    </div>
  );
}
