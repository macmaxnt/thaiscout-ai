"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import {
  IconCar,
  IconMap2,
  IconMapPinPlus,
  IconNavigation,
  IconSearch,
  IconTargetArrow,
  IconTrash,
  IconX,
} from "@tabler/icons-react";

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
  isCollectionMode?: boolean;
  onToggleFilterOnlyPinned?: () => void;
  onOpenRag?: (loc: MapLocation) => void;
  onOpenSocial?: (loc: MapLocation) => void;
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

function calculateStraightLegDistances(locs: MapLocation[]): number[] {
  const valid = locs.filter((l) => l.lat && l.lng);
  if (valid.length < 2) return [];
  const distances: number[] = [];
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
    distances.push(Math.round(R * c * 10) / 10);
  }
  return distances;
}

// Distinct curated high-contrast colors for sequential travel legs (Leg #1->#2, #2->#3, #3->#4, etc.)
const LEG_COLORS = [
  { stroke: "#f97316", outline: "#183354", name: "ส้มอำพัน (Leg 1)" },       // #1 -> #2: Bright Orange / Navy
  { stroke: "#06b6d4", outline: "#082f49", name: "ฟ้าเทอร์ควอยซ์ (Leg 2)" },   // #2 -> #3: Cyan / Deep Blue
  { stroke: "#10b981", outline: "#064e3b", name: "เขียวมรกต (Leg 3)" },      // #3 -> #4: Emerald / Dark Green
  { stroke: "#ec4899", outline: "#831843", name: "ชมพูสด (Leg 4)" },         // #4 -> #5: Pink / Dark Rose
  { stroke: "#8b5cf6", outline: "#2e1065", name: "ม่วงไวโอเล็ต (Leg 5)" },    // #5 -> #6: Violet / Deep Purple
  { stroke: "#eab308", outline: "#422006", name: "ทองอำพัน (Leg 6)" },       // #6 -> #7: Yellow-Amber / Brown
  { stroke: "#14b8a6", outline: "#134e4a", name: "เขียวอมฟ้า (Leg 7)" },     // #7 -> #8: Teal
  { stroke: "#f43f5e", outline: "#4c0519", name: "แดงทับทิม (Leg 8)" },      // #8 -> #9: Rose-Red
];

function tablerSvg(paths: string, size = 14) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-3px;margin-right:4px"><g>${paths}</g></svg>`;
}

const mapPinSvg = tablerSvg('<path d="M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"/><path d="M17.657 16.657l-4.243 4.243a2 2 0 0 1 -2.827 0l-4.244 -4.243a8 8 0 1 1 11.314 0"/>');
const phoneSvg = tablerSvg('<path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2"/>');
const pinPlusSvg = tablerSvg('<path d="M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"/><path d="M12.794 21.322a2 2 0 0 1 -2.207 -.422l-4.244 -4.243a8 8 0 1 1 13.59 -4.616"/><path d="M16 19h6"/><path d="M19 16v6"/>');
const sparklesSvg = tablerSvg('<path d="M16 18a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2m0 -12a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2m-7 12a6 6 0 0 1 6 -6a6 6 0 0 1 -6 -6a6 6 0 0 1 -6 6a6 6 0 0 1 6 6"/>');
const photoSvg = tablerSvg('<path d="M15 8h.01"/><path d="M3 6a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3v-12"/><path d="M3 16l5 -5c.928 -.893 2.072 -.893 3 0l5 5"/><path d="M14 14l1 -1c.928 -.893 2.072 -.893 3 0l3 3"/>');
const starSvg = tablerSvg('<path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873l-6.158 -3.245"/>');
const xSvg = tablerSvg('<path d="M18 6l-12 12"/><path d="M6 6l12 12"/>');

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
  isCollectionMode = false,
  onToggleFilterOnlyPinned,
  onOpenRag,
  onOpenSocial,
}: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const prevRouteCoordsRef = useRef<string>("");
  const prevSelectedIdRef = useRef<string | null>(null);
  const prevLocationsRef = useRef<MapLocation[] | null>(null);

  // State for real road driving distance and routing status
  const [roadDistanceKm, setRoadDistanceKm] = React.useState<number | null>(null);
  const [legDistancesKm, setLegDistancesKm] = React.useState<number[]>([]);
  const [isRoutingLoading, setIsRoutingLoading] = React.useState(false);

  const onDeselectRef = useRef(onDeselect);
  useEffect(() => {
    onDeselectRef.current = onDeselect;
  });

  const onOpenSocialRef = useRef(onOpenSocial);
  useEffect(() => {
    onOpenSocialRef.current = onOpenSocial;
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

    routeLayerGroupRef.current = L.layerGroup().addTo(map);
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

    const locsToRender = filterOnlyPinned ? scoutingList : locations;
    const validLocs = locsToRender.filter((l) => isThailandCoords(l.lat, l.lng));
    const bounds: [number, number][] = [];

    // Polyline for Recce Points - Real Road Following Route (OSRM Driving)
    // Show when viewing pinned locations OR when viewing a collection with >= 2 points
    const pointsToRoute = isCollectionMode 
      ? locations.filter((l) => isThailandCoords(l.lat, l.lng))
      : scoutingList.filter((l) => isThailandCoords(l.lat, l.lng));

    const shouldDrawRoute = (filterOnlyPinned || isCollectionMode) && pointsToRoute.length >= 2;
    const routeGroup = routeLayerGroupRef.current;

    if (shouldDrawRoute && routeGroup) {
      const coordsString = pointsToRoute.map((l) => `${l.lng},${l.lat}`).join(";");
      const isRoutePointsChanged = prevRouteCoordsRef.current !== coordsString;

      if (isRoutePointsChanged) {
        prevRouteCoordsRef.current = coordsString;
        routeGroup.clearLayers();

        // Temporary fallback: straight lines per leg with distinct colors while OSRM loads
        for (let i = 0; i < pointsToRoute.length - 1; i++) {
          const legColor = LEG_COLORS[i % LEG_COLORS.length];
          const segLatLngs: [number, number][] = [
            [pointsToRoute[i].lat!, pointsToRoute[i].lng!],
            [pointsToRoute[i + 1].lat!, pointsToRoute[i + 1].lng!],
          ];

          // 1. Dark outline for contrast
          const outlineLine = L.polyline(segLatLngs, {
            color: legColor.outline,
            weight: 7,
            opacity: 0.9,
            lineCap: "round",
            lineJoin: "round",
          });

          // 2. High-contrast leg-specific colored dashed line on top (later legs layered above)
          const dashedLine = L.polyline(segLatLngs, {
            color: legColor.stroke,
            weight: 5,
            dashArray: "8, 8",
            opacity: 1,
            lineCap: "round",
            lineJoin: "round",
          });

          routeGroup.addLayer(outlineLine);
          routeGroup.addLayer(dashedLine);
        }

        setIsRoutingLoading(true);
        const controller = new AbortController();

        // Request steps=true to get exact geometry per leg between points
        fetch(`https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson&steps=true`, {
          signal: controller.signal,
        })
          .then((res) => res.json())
          .then((data) => {
            if (data?.code === "Ok" && data.routes?.[0]) {
              const route = data.routes[0];
              const roadDistance = Math.round((route.distance / 1000) * 10) / 10;
              setRoadDistanceKm(roadDistance);

              // Remove fallback straight lines
              routeGroup.clearLayers();

              // If OSRM returned legs, draw each leg with its unique color
              const legs = route.legs;
              if (Array.isArray(legs) && legs.length > 0) {
                const legDists: number[] = [];
                legs.forEach((leg: any, legIndex: number) => {
                  const distKm = Math.round((leg.distance / 1000) * 10) / 10;
                  legDists.push(distKm);

                  const legColor = LEG_COLORS[legIndex % LEG_COLORS.length];
                  const legCoords: [number, number][] = [];

                  // Collect points from each step in this leg
                  if (leg.steps && Array.isArray(leg.steps)) {
                    leg.steps.forEach((step: any) => {
                      if (step.geometry?.coordinates) {
                        step.geometry.coordinates.forEach((c: [number, number]) => {
                          legCoords.push([c[1], c[0]]);
                        });
                      }
                    });
                  }

                  if (legCoords.length >= 2) {
                    const outline = L.polyline(legCoords, {
                      color: legColor.outline,
                      weight: 7,
                      opacity: 0.95,
                      lineCap: "round",
                      lineJoin: "round",
                    });

                    const dashed = L.polyline(legCoords, {
                      color: legColor.stroke,
                      weight: 5,
                      dashArray: "8, 8",
                      opacity: 1,
                      lineCap: "round",
                      lineJoin: "round",
                    });

                    // Add hover tooltip on leg to show "จุด #1 → #2"
                    dashed.bindTooltip(
                      `<div style="font-family:'Nunito','Mitr',sans-serif; font-weight:900; font-size:11px; color:${legColor.stroke};">${mapPinSvg}เส้นทางช่วงจุดที่ #${legIndex + 1} ➔ #${legIndex + 2} (${distKm} กม.)</div>`,
                      { sticky: true, opacity: 0.95 }
                    );

                    routeGroup.addLayer(outline);
                    routeGroup.addLayer(dashed);
                  }
                });
                setLegDistancesKm(legDists);
              } else if (route.geometry?.coordinates) {
                // Single full geometry fallback
                const roadPoints = route.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]] as [number, number]);
                const fallbackOutline = L.polyline(roadPoints, {
                  color: "#183354",
                  weight: 7,
                  opacity: 0.95,
                  lineCap: "round",
                  lineJoin: "round",
                });

                const fallbackDashed = L.polyline(roadPoints, {
                  color: "#f97316",
                  weight: 5,
                  dashArray: "8, 8",
                  opacity: 1,
                  lineCap: "round",
                  lineJoin: "round",
                });

                routeGroup.addLayer(fallbackOutline);
                routeGroup.addLayer(fallbackDashed);
                setLegDistancesKm(calculateStraightLegDistances(pointsToRoute));
              }
            } else {
              setRoadDistanceKm(calculateTotalDistance(pointsToRoute));
              setLegDistancesKm(calculateStraightLegDistances(pointsToRoute));
            }
          })
          .catch((err) => {
            if (err.name !== "AbortError") {
              setRoadDistanceKm(calculateTotalDistance(pointsToRoute));
              setLegDistancesKm(calculateStraightLegDistances(pointsToRoute));
            }
          })
          .finally(() => {
            setIsRoutingLoading(false);
          });
      }
    } else {
      prevRouteCoordsRef.current = "";
      routeGroup?.clearLayers();
      setRoadDistanceKm(null);
      setLegDistancesKm([]);
      setIsRoutingLoading(false);
    }

    validLocs.forEach((loc, locIndex) => {
      const lat = loc.lat!;
      const lng = loc.lng!;
      bounds.push([lat, lng]);

      const isSelected = selectedLocation?.id === loc.id;
      const recceIndex = isCollectionMode 
        ? locIndex 
        : scoutingList.findIndex((x) => x.id === loc.id);
      const isRecce = isCollectionMode ? true : recceIndex !== -1;

      // Pin colors & size:
      // Pinned / Collection locations = Distinct Leather Amber (#d67940) with rank number (#1, #2, ...)
      // Selected location = Golden / prominent teardrop
      // Unpinned locations = Original teardrop pin (#285185) with a Tabler marker
      const size = isSelected ? 38 : isRecce ? 34 : 30;
      const bg = isSelected ? "#d67940" : isRecce ? "#d67940" : "#285185";
      const border = isSelected ? "#ffffff" : isRecce ? "#ffffff" : "#ffffff";
      const badgeText = isRecce ? `#${recceIndex + 1}` : isSelected ? starSvg : mapPinSvg;

      // Classic teardrop pin design with exact anchoring
      const pinHtml = `
        <div style="
          width: ${size}px;
          height: ${size}px;
          background: ${bg};
          border: 2.5px solid ${border};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: ${isSelected ? "3px 3px 0px rgba(24, 51, 84, 0.7)" : "2px 2px 0px rgba(24, 51, 84, 0.45)"};
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
            font-size: ${isRecce ? "12px" : isSelected ? "13px" : "12px"};
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
            ${mapPinSvg} ${loc.province} ${districtLabel}
          </div>
          ${loc.tel ? `<div style="font-size: 11px; font-weight: 800; color: #d97706; margin-bottom: 4px;">${phoneSvg} ${loc.tel}</div>` : ""}
          <div style="font-size: 10px; font-family: monospace; color: #0284c7; font-weight: 700; margin-bottom: 8px;">
            GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}
          </div>
          <div style="padding-top: 8px; border-top: 1px solid #e2e8f0; display: flex; gap: 6px; align-items: center;">
            <button
              id="map-popup-pin-${loc.id}"
              type="button"
              style="
                flex: 1;
                padding: 6px;
                border-radius: 10px;
                font-size: 11px;
                font-weight: 900;
                cursor: pointer;
                border: 2px solid ${isPinned ? '#6f4849' : '#285185'};
                background-color: ${isPinned ? '#fbf6f6' : '#285185'};
                color: ${isPinned ? '#6f4849' : '#ffffff'};
                box-shadow: 2px 2px 0px ${isPinned ? '#4d2f30' : '#183354'};
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 4px;
                font-family: inherit;
                transition: all 0.1s ease;
              "
            >
              ${isPinned ? `${xSvg}` : `${pinPlusSvg}`}
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
                  border: 2px solid #285185;
                  background-color: #f0f5f8;
                  color: #1b3558;
                  box-shadow: 2px 2px 0px #183354;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 3px;
                  font-family: inherit;
                  white-space: nowrap;
                  transition: all 0.1s ease;
                "
              >
                ${sparklesSvg}ข้อมูลกองถ่าย
              </button>
            `
                : ""
            }

            ${
              onOpenSocial
                ? `
              <button
                id="map-popup-photos-${loc.id}"
                type="button"
                style="
                  padding: 6px 10px;
                  border-radius: 10px;
                  font-size: 11px;
                  font-weight: 900;
                  cursor: pointer;
                  border: 2px solid #d67940;
                  background-color: #fff7ed;
                  color: #7c2d12;
                  box-shadow: 2px 2px 0px #a8521d;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 3px;
                  font-family: inherit;
                  white-space: nowrap;
                  transition: all 0.1s ease;
                "
              >
                ${photoSvg}รูปจริง
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

      const photosBtn = popupDiv.querySelector(`#map-popup-photos-${loc.id}`);
      if (photosBtn && onOpenSocial) {
        photosBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          e.preventDefault();
          onOpenSocial(loc);
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

    const prevLocations = prevLocationsRef.current;
    const locationsChanged = prevLocations !== null && prevLocations !== locations;
    prevLocationsRef.current = locations;

    const prevSelectedId = prevSelectedIdRef.current;
    const isNewSelection = selectedLocation && selectedLocation.id !== prevSelectedId;
    prevSelectedIdRef.current = selectedLocation?.id || null;

    if (isNewSelection && selectedLocation?.lat && selectedLocation?.lng) {
      map.flyTo([selectedLocation.lat, selectedLocation.lng], 14, {
        duration: 0.8,
      });
    } else if (!selectedLocation && bounds.length > 0 && (prevSelectedId !== null || locationsChanged)) {
      map.closePopup();
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
    } else if (!selectedLocation) {
      map.closePopup();
    }
  }, [locations, selectedLocation, scoutingList, filterOnlyPinned, isCollectionMode, onOpenRag]);

  const handleFitAll = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const locsToFit = filterOnlyPinned ? scoutingList : locations;
    const valid = locsToFit.filter((l) => isThailandCoords(l.lat, l.lng));
    if (valid.length === 0) return;
    const bounds = valid.map((l) => [l.lat!, l.lng!] as [number, number]);
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
  };

  const validRecce = isCollectionMode
    ? locations.filter((x) => isThailandCoords(x.lat, x.lng))
    : scoutingList.filter((x) => isThailandCoords(x.lat, x.lng));
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
    <div className="bg-white flex flex-col h-full w-full overflow-hidden">
      {/* Map Control Header - Travel Flatlay Theme */}
      <div className="bg-[#f0f5f8] px-3.5 py-2.5 border-b-2 border-[#285185] flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="bg-[#285185] text-white rounded-lg px-2 py-0.5 text-xs font-black inline-flex items-center gap-1.5">
            <IconMap2 size={14} /> Live Map
          </span>
          <span className="text-xs font-black text-[#1b3558]">
            {filterOnlyPinned
              ? <span className="inline-flex items-center gap-1"><IconMapPinPlus size={14} /> {scoutingList.filter((l) => l.lat && l.lng).length} จุดที่ปักไว้</span>
              : `${locations.filter((l) => l.lat && l.lng).length} หมุดพิกัด`}
          </span>

          {/* Filter only pinned toggle (Show only outside collection mode) */}
          {!isCollectionMode && onToggleFilterOnlyPinned && (
            <button
              onClick={onToggleFilterOnlyPinned}
              disabled={scoutingList.length === 0}
              className={`text-xs px-2.5 py-1 rounded-xl font-black flex items-center gap-1 transition border ${
                filterOnlyPinned
                  ? "bg-[#d67940] border-[#a8521d] text-white shadow-xs"
                  : scoutingList.length > 0
                  ? "bg-white border-[#285185] text-[#285185] hover:bg-[#ccd9e2]/30 shadow-xs"
                  : "bg-slate-100 border-slate-300 text-slate-400 cursor-not-allowed opacity-60"
              }`}
              title={scoutingList.length === 0 ? "ยังไม่มีหมุดที่ปักไว้" : "สลับแสดงเฉพาะจุดที่ปักหมุด"}
            >
              <span className="inline-flex items-center gap-1.5">
                {filterOnlyPinned ? <IconMap2 size={14} /> : <IconMapPinPlus size={14} />}
                {filterOnlyPinned ? "แสดงทั้งหมด" : "เฉพาะที่ปักหมุด"}
              </span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                  filterOnlyPinned ? "bg-white text-[#d67940]" : "bg-[#ccd9e2] text-[#1b3558]"
                }`}
              >
                {scoutingList.length}
              </span>
            </button>
          )}

          {/* Clear pins button (Show only outside collection mode) */}
          {!isCollectionMode && onClearScout && scoutingList.length > 0 && (
            <button
              onClick={onClearScout}
              className="text-xs px-2.5 py-1 rounded-xl font-black bg-white hover:bg-rose-50 border border-rose-300 text-rose-700 flex items-center gap-1 transition shadow-xs"
              title="ล้างหมุดสำรวจทั้งหมด"
            >
              <span className="inline-flex items-center gap-1"><IconTrash size={14} /> ล้าง</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleFitAll}
            className="text-xs px-2.5 py-1 rounded-xl font-bold bg-white hover:bg-[#ccd9e2]/40 text-[#285185] border border-[#285185] shadow-xs transition"
            title="ซูมออกดูระยะห่างของหมุดทั้งหมด"
          >
            <span className="inline-flex items-center gap-1.5"><IconSearch size={14} /> รวมมุมมอง</span>
          </button>

          {googleMapsUrl && (
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs px-2.5 py-1 rounded-xl font-black bg-[#d67940] hover:bg-[#c06530] text-white border border-[#a8521d] shadow-xs transition"
            >
              <span className="inline-flex items-center gap-1.5"><IconNavigation size={14} /> นำทาง</span>
            </a>
          )}
        </div>
      </div>

      {/* Selected Location Pill */}
      {selectedLocation && (
        <div className="bg-[#fff7ed] px-3.5 py-2 border-b border-[#fed7aa] flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-1.5 truncate">
            <span className="text-[#d67940] font-black shrink-0 inline-flex items-center gap-1"><IconTargetArrow size={14} /> เลือก:</span>
            <span className="font-black text-[#1b3558] truncate">
              {selectedLocation.name_th} ({selectedLocation.province})
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => onToggleScout(selectedLocation)}
              className="bg-[#285185] text-white text-[11px] px-2.5 py-0.5 rounded-lg font-black shrink-0 hover:bg-[#183354] transition"
            >
              <span className="inline-flex items-center gap-1"><IconMapPinPlus size={13} /> {scoutingList.some((x) => x.id === selectedLocation.id) ? "ปักแล้ว" : "+ ปักหมุด"}</span>
            </button>
            {onDeselect && (
              <button
                onClick={onDeselect}
                className="w-5 h-5 rounded-full bg-white hover:bg-rose-100 text-slate-500 hover:text-rose-700 flex items-center justify-center text-xs font-black transition cursor-pointer border border-slate-200"
                title="ยกเลิกการเลือก"
              >
                <IconX size={13} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Recce Distance Bar (Show when viewing pinned locations or a collection) */}
      {(filterOnlyPinned || isCollectionMode) && validRecce.length >= 1 && (
        <div className="bg-[#fff7ed] px-4 py-2 border-b border-[#fed7aa] flex items-center justify-between text-xs text-[#7c2d12] font-bold shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1">
                <IconCar size={14} /> <strong className="font-black">{isCollectionMode ? "เส้นทางในกล่อง:" : "เส้นทางวิ่งจริง:"}</strong> {validRecce.length} จุด
            </span>
            {validRecce.length >= 2 && (
              <div className="flex items-center gap-2 flex-wrap">
                {/* Leg Distances and Total Distance */}
                <div className="flex items-center gap-1.5 text-[11px] font-bold flex-wrap">
                  {Array.from({ length: validRecce.length - 1 }).map((_, legIdx) => {
                    const legColor = LEG_COLORS[legIdx % LEG_COLORS.length];
                    const legDist = legDistancesKm[legIdx] !== undefined 
                      ? legDistancesKm[legIdx] 
                      : null;

                    return (
                      <span
                        key={legIdx}
                        className="px-2 py-0.5 rounded-lg text-white font-bold font-mono flex items-center gap-1 shadow-2xs"
                        style={{ backgroundColor: legColor.stroke }}
                      >
                        <span>จุด {legIdx + 1} ไป {legIdx + 2}:</span>
                        <span>{legDist !== null ? `${legDist} กม.` : "..."}</span>
                      </span>
                    );
                  })}

                  <span className="px-2.5 py-0.5 rounded-lg bg-[#285185] text-white font-black font-mono shadow-2xs flex items-center gap-1">
                    <span>รวมทั้งหมด:</span>
                    <span>{roadDistanceKm !== null ? roadDistanceKm : totalDistance} กม.</span>
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isCollectionMode && onToggleFilterOnlyPinned && (
              <button
                onClick={onToggleFilterOnlyPinned}
                className="hover:underline text-amber-900 font-bold"
              >
                {filterOnlyPinned ? "← แสดงหมุดทั้งหมด" : "กรองเฉพาะหมุดนี้"}
              </button>
            )}
            {!isCollectionMode && onClearScout && (
              <button
                onClick={onClearScout}
                className="hover:underline text-rose-700 font-bold flex items-center gap-0.5"
              >
                <span className="inline-flex items-center gap-1"><IconTrash size={14} /> ล้างหมุด</span>
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
