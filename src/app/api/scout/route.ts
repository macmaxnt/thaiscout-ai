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
        cachedAttractions.push(...items);
      }
    }
  }
  return cachedAttractions;
}

import { detectProvinceFromText, THAI_PROVINCES } from "@/data/provinces";

export async function POST(req: Request) {
  try {
    const { brief, province, category } = await req.json();
    const data = loadData();

    const briefLower = (brief || "").toLowerCase().trim();
    
    // Smart province detection from brief if province is not explicitly set or is "all"
    const detected = detectProvinceFromText(briefLower);
    const effectiveProvince =
      province && province !== "all"
        ? (detectProvinceFromText(province).detectedProvince || province)
        : null;

    const queryTokens = briefLower.split(/\s+/).filter((t: string) => t.length > 1);

    const scored = data.map((item) => {
      let score = 0;

      // 1. Explicit Province Filter
      if (effectiveProvince) {
        if (!item.province.includes(effectiveProvince)) {
          return { item, score: -100 };
        }
        score += 30;
      } else if (detected.detectedProvince) {
        // If province wasn't hard-filtered, but user typed province in the brief
        if (item.province.includes(detected.detectedProvince)) {
          score += 50; // Big boost for matching detected province
        }
      }

      // 2. Category Filter
      if (category && category !== "all") {
        if (!item.category.includes(category)) {
          return { item, score: -100 };
        }
        score += 15;
      }

      // 3. Keyword Scoring
      for (const token of queryTokens) {
        if (item.name_th.toLowerCase().includes(token)) score += 30;
        if (item.hilight.toLowerCase().includes(token)) score += 20;
        if (item.sub_type.toLowerCase().includes(token)) score += 15;
        if (item.detail.toLowerCase().includes(token)) score += 10;
        if (item.category.toLowerCase().includes(token)) score += 8;
        if (item.province.toLowerCase().includes(token)) score += 25;
      }

      // 4. Boost for famous landmarks or district matches
      if (detected.matchedAlias && (item.name_th.includes(detected.matchedAlias) || item.detail.includes(detected.matchedAlias))) {
        score += 25;
      }

      if (item.lat && item.lng) score += 3;
      if (item.tel) score += 2;

      return { item, score };
    });

    const results = scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
      .map((s) => {
        const item = s.item;
        return {
          ...item,
          relevanceScore: Math.min(Math.round(s.score * 2.5), 99),
          hasVerifiedCoords: !!(item.lat && item.lng),
          hasOperatingHours: !!item.time,
          hasDirectContact: !!item.tel,
          hasFeeInfo: !!(item.fee && item.fee !== "0" && item.fee !== "-"),
          permitWarning: "พื้นที่นี้อยู่ภายใต้การกำกับดูแลของหน่วยงานท้องถิ่น/กรมอุทยานฯ โปรดติดต่อเจ้าหน้าที่ล่วงหน้าอย่างน้อย 7-15 วันเพื่อขออนุญาตถ่ายทำ",
        };
      });

    return NextResponse.json({
      success: true,
      totalMatches: results.length,
      locations: results,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
