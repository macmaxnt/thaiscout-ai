import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Load data in memory
let cachedAttractions: any[] = [];

function loadData() {
  if (cachedAttractions.length === 0) {
    const filePath = path.join(process.cwd(), "data", "attractions_compact.json");
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      cachedAttractions = JSON.parse(raw);
    }
  }
  return cachedAttractions;
}

export async function POST(req: Request) {
  try {
    const { brief, province, category } = await req.json();
    const data = loadData();

    const briefLower = (brief || "").toLowerCase().trim();
    const queryTokens = briefLower.split(/\s+/).filter((t: string) => t.length > 1);

    // Scoring algorithm for Creative Brief Semantic & Keyword matching
    const scored = data.map((item) => {
      let score = 0;
      const targetText = `${item.name_th} ${item.name_en} ${item.category} ${item.sub_type} ${item.province} ${item.district} ${item.hilight} ${item.detail}`.toLowerCase();

      // Filter by province if specified
      if (province && province !== "all") {
        if (!item.province.includes(province)) {
          return { item, score: -100 };
        }
        score += 20;
      }

      // Filter by category if specified
      if (category && category !== "all") {
        if (!item.category.includes(category)) {
          return { item, score: -100 };
        }
        score += 15;
      }

      // Token matching
      for (const token of queryTokens) {
        if (item.name_th.toLowerCase().includes(token)) score += 25;
        if (item.hilight.toLowerCase().includes(token)) score += 20;
        if (item.sub_type.toLowerCase().includes(token)) score += 15;
        if (item.detail.toLowerCase().includes(token)) score += 10;
        if (item.category.toLowerCase().includes(token)) score += 8;
        if (item.province.toLowerCase().includes(token)) score += 10;
      }

      // Boost items with complete production data (coordinates, phone)
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
          // Fact-checking flags based on requirements
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
