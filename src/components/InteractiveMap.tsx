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
        color: "#D67940",
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
      const bg = isSelected ? "#D67940" : isRecce ? "#6F4849" : "#285185";
      const border = isSelected ? "#9F4E2B" : isRecce ? "#4D3031" : "#193F6D";
      const badgeText = isRecce ? `#${recceIndex + 1}` : isSelected ? "•" : "";

      // Teardrop pin design with exact anchoring
      const pinHtml = `
        <div style="
          width: ${size}px;
          height: ${size}px;
          background: ${bg};
          border: 2.5px solid ${border};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: ${isSelected ? "0 5px 12px rgba(111,72,73,.4)" : "0 4px 10px rgba(25,58,97,.28)"};
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.15s ease;
        ">
          <span style="
            transform: rotate(45deg);
            color: #ffffff;
            font-family: 'DM Sans', 'Mitr', sans-serif;
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
      const tooltip = document.createElement("div");
      tooltip.style.fontFamily = "'DM Sans', 'Mitr', sans-serif";
      tooltip.style.fontWeight = "800";
      tooltip.style.fontSize = "11px";
      tooltip.textContent = `${isRecce ? `[จุดที่ ${recceIndex + 1}] ` : ""}${loc.name_th}`;
      marker.bindTooltip(tooltip, {
        direction: "top",
        offset: [0, -size - 4],
        opacity: 0.95,
      });

      // Popup Content: Structured cleanly above the pin
      const popupDiv = document.createElement("div");
      popupDiv.style.minWidth = "200px";
      popupDiv.style.fontFamily = "'DM Sans', 'Mitr', sans-serif";
      popupDiv.style.padding = "2px";
      const createPopupLine = (text: string, style: Partial<CSSStyleDeclaration>) => {
        const line = document.createElement("div");
        Object.assign(line.style, style);
        line.textContent = text;
        popupDiv.appendChild(line);
      };
      createPopupLine(loc.name_th, { fontSize: "13px", fontWeight: "900", color: "#193f6d", marginBottom: "2px", lineHeight: "1.2" });
      createPopupLine(`${loc.province}${loc.district ? ` · อ.${loc.district}` : ""}`, { fontSize: "11px", fontWeight: "700", color: "#64758a", marginBottom: "4px" });
      if (loc.tel) createPopupLine(loc.tel, { fontSize: "11px", fontWeight: "800", color: "#6f4849", marginBottom: "6px" });
      createPopupLine(`GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`, { fontSize: "10px", fontFamily: "monospace", color: "#285185", fontWeight: "700" });

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

  return (
    <div className="h-full w-full">
      <div ref={mapContainerRef} className="h-full w-full" />
    </div>
  );
}
