import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

let cachedAttractions: any[] = [];

function loadData() {
  if (cachedAttractions.length === 0) {
    const dataDir = path.join(process.cwd(), "data");
    for (let i = 0; i < 5; i++) {
      const chunkPath = path.join(dataDir, `chunk_${i}.json`);
      if (fs.existsSync(chunkPath)) {
        const raw = fs.readFileSync(chunkPath, "utf-8");
        const items = JSON.parse(raw);
        for (const item of items) {
          // Safety guardrail: filter any coordinates outside Thailand
          if (item.lat && item.lng) {
            if (item.lat < 5.5 || item.lat > 20.6 || item.lng < 97.0 || item.lng > 106.0) {
              continue;
            }
          }
          cachedAttractions.push(item);
        }
      }
    }
  }
  return cachedAttractions;
}

import { detectProvinceFromText, THAI_PROVINCES, getProvincesInRegion } from "@/data/provinces";

export async function POST(req: Request) {
  try {
    const { brief, province, category, limit } = await req.json();
    const data = loadData();

    const briefLower = (brief || "").toLowerCase().trim();
    const queryTokens = briefLower.split(/\s+/).filter((t: string) => t.length > 1);
    const isBriefEmpty = queryTokens.length === 0;

    // Region vs Province resolution
    const isRegionFilter = province && province.startsWith("region:");
    const regionProvinces = isRegionFilter ? getProvincesInRegion(province) : null;
    const isSpecificProvince = province && province !== "all" && !isRegionFilter;
    const effectiveProvince = isSpecificProvince
      ? (detectProvinceFromText(province).detectedProvince || province)
      : null;

    // Smart province detection from brief if province is not explicitly set
    const detected = detectProvinceFromText(briefLower);

    const scored = data.map((item) => {
      let score = 0;

      // Base score when browsing without a brief, ensuring nationwide items are included
      if (isBriefEmpty) {
        score = 40;
      }

      // 1. Region Filter (เลือกภาคเฉยๆ ก็ได้)
      if (isRegionFilter && regionProvinces) {
        if (!regionProvinces.includes(item.province)) {
          return { item, score: -100 };
        }
        score += 35;
      }
      // 2. Specific Province Filter (เลือกจังหวัดเฉยๆ ก็ได้)
      else if (effectiveProvince) {
        if (!item.province.includes(effectiveProvince)) {
          return { item, score: -100 };
        }
        score += 40;
      } else if (detected.detectedProvince) {
        // If province wasn't hard-filtered, but user typed province in the brief
        if (item.province.includes(detected.detectedProvince)) {
          score += 50; // Big boost for matching detected province
        }
      }

      // 3. Category Filter
      if (category && category !== "all") {
        if (!item.category.includes(category)) {
          return { item, score: -100 };
        }
        score += 15;
      }

      // 4. Keyword Scoring (when brief is provided)
      for (const token of queryTokens) {
        if (item.name_th.toLowerCase().includes(token)) score += 30;
        if (item.hilight.toLowerCase().includes(token)) score += 20;
        if (item.sub_type.toLowerCase().includes(token)) score += 15;
        if (item.detail.toLowerCase().includes(token)) score += 10;
        if (item.category.toLowerCase().includes(token)) score += 8;
        if (item.province.toLowerCase().includes(token)) score += 25;
      }

      // 5. Boost for famous landmarks or district matches
      if (detected.matchedAlias && (item.name_th.includes(detected.matchedAlias) || item.detail.includes(detected.matchedAlias))) {
        score += 25;
      }

      // Quality & Coordinate Boosts (places with GPS coordinates get pinned nicely)
      if (item.lat && item.lng) score += 15;
      if (item.tel) score += 5;
      if (item.hilight && item.hilight.length > 5) score += 10;

      return { item, score };
    });

    const validMatches = scored.filter((s) => s.score > 0);
    const totalMatches = validMatches.length;

    let selectedItems: typeof scored = [];

    if (isBriefEmpty && !effectiveProvince && !isRegionFilter) {
      // Nationwide browsing without brief:
      // Evenly sample across ALL 77 provinces so pins cover the entire country from North to South!
      const byProvince: Record<string, typeof scored> = {};
      for (const s of validMatches) {
        const prov = s.item.province || "อื่นๆ";
        if (!byProvince[prov]) byProvince[prov] = [];
        byProvince[prov].push(s);
      }

      // Sort each province's items by score
      for (const prov of Object.keys(byProvince)) {
        byProvince[prov].sort((a, b) => b.score - a.score);
      }

      const targetCount = limit || 400;
      const provKeys = Object.keys(byProvince);
      const rounds = Math.ceil(targetCount / Math.max(provKeys.length, 1));

      for (let round = 0; round < rounds; round++) {
        for (const prov of provKeys) {
          if (byProvince[prov][round]) {
            selectedItems.push(byProvince[prov][round]);
            if (selectedItems.length >= targetCount) break;
          }
        }
        if (selectedItems.length >= targetCount) break;
      }
    } else {
      // Province, Region, or Keyword Search:
      // If province is selected, return ALL locations for that province!
      validMatches.sort((a, b) => b.score - a.score);
      const targetLimit = limit || (effectiveProvince ? 1000 : isRegionFilter ? 600 : 150);
      selectedItems = validMatches.slice(0, targetLimit);
    }

    const results = selectedItems.map((s) => {
      const item = s.item;
      return {
        ...item,
        relevanceScore: Math.min(Math.round(s.score * 2), 99),
        hasVerifiedCoords: !!(item.lat && item.lng),
        hasOperatingHours: !!item.time,
        hasDirectContact: !!item.tel,
        hasFeeInfo: !!(item.fee && item.fee !== "0" && item.fee !== "-"),
        permitWarning: "พื้นที่นี้อยู่ภายใต้การกำกับดูแลของหน่วยงานท้องถิ่น/กรมอุทยานฯ โปรดติดต่อเจ้าหน้าที่ล่วงหน้าอย่างน้อย 7-15 วันเพื่อขออนุญาตถ่ายทำ",
      };
    });

    return NextResponse.json({
      success: true,
      totalMatches,
      totalDatabase: data.length,
      locations: results,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
