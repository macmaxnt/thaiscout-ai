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
  onToggleScout: (loc: MapLocation) => void;
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

export default function InteractiveMap({
  locations,
  selectedLocation,
  scoutingList,
  onSelectLocation,
  onToggleScout,
}: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [18.7883, 98.9853],
      zoom: 9,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
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

    const validLocs = locations.filter((l) => l.lat && l.lng);
    const bounds: [number, number][] = [];

    // Polyline for Recce Points
    const validRecce = scoutingList.filter((l) => l.lat && l.lng);
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

      // Popup Content: Structured cleanly above the pin
      const popupDiv = document.createElement("div");
      popupDiv.style.minWidth = "200px";
      popupDiv.style.fontFamily = "'Nunito', 'Mitr', sans-serif";
      popupDiv.innerHTML = `
        <div style="padding: 2px;">
          <div style="font-size: 13px; font-weight: 900; color: #0f172a; margin-bottom: 2px; line-height: 1.2;">
            ${loc.name_th}
          </div>
          <div style="font-size: 11px; font-weight: 700; color: #475569; margin-bottom: 4px;">
            📍 ${loc.province} ${loc.district ? "• อ." + loc.district : ""}
          </div>
          ${loc.tel ? `<div style="font-size: 11px; font-weight: 800; color: #d97706; margin-bottom: 6px;">📞 ${loc.tel}</div>` : ""}
          <div style="font-size: 10px; font-family: monospace; color: #0284c7; font-weight: 700;">
            GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}
          </div>
        </div>
      `;

      marker.bindPopup(popupDiv);

      marker.on("click", () => {
        onSelectLocation(loc);
      });

      layer.addLayer(marker);

      if (isSelected) {
        marker.openPopup();
      }
    });

    if (selectedLocation?.lat && selectedLocation?.lng) {
      map.flyTo([selectedLocation.lat, selectedLocation.lng], 14, {
        duration: 0.8,
      });
    } else if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
    }
  }, [locations, selectedLocation, scoutingList]);

  const handleFitAll = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const valid = locations.filter((l) => l.lat && l.lng);
    if (valid.length === 0) return;
    const bounds = valid.map((l) => [l.lat!, l.lng!] as [number, number]);
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
  };

  const validRecce = scoutingList.filter((x) => x.lat && x.lng);
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
      <div className="bg-[#f0f9ff] px-4 py-2.5 border-b-2 border-[#0284c7] flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="bg-[#bae6fd] border border-[#0284c7] rounded-lg px-2 py-0.5 text-xs font-black text-[#0c4a6e]">
            🗺️ Live Map
          </span>
          <span className="text-xs font-black text-[#0c4a6e]">
            {locations.filter((l) => l.lat && l.lng).length} หมุดพิกัด
          </span>
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
          <button
            onClick={() => onToggleScout(selectedLocation)}
            className="btn btn-mint text-[11px] px-2.5 py-0.5 rounded-lg font-black shrink-0"
          >
            {scoutingList.some((x) => x.id === selectedLocation.id) ? "✓ ปักแล้ว" : "+ ปักหมุด"}
          </button>
        </div>
      )}

      {/* Recce Distance Bar */}
      {validRecce.length >= 2 && (
        <div className="bg-[#fffbeb] px-4 py-1.5 border-b border-[#fef08a] flex items-center justify-between text-[11px] text-[#78350f] font-bold shrink-0">
          <span>
            📍 เส้นทางสำรวจ {validRecce.length} จุด (เส้นประฟ้า)
          </span>
          <span className="font-black font-mono">
            ~{totalDistance} กม.
          </span>
        </div>
      )}

      {/* Map Body */}
      <div className="relative flex-1 w-full h-full min-h-[350px]">
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>
    </div>
  );
}
