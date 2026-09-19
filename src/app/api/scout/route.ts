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

    // Call Gemini Agent to analyze and deconstruct the creative brief
    let geminiAnalysis: any = null;
    const expandedTokens: string[] = [];

    if (!isBriefEmpty) {
      try {
        const { analyzeBriefWithGemini } = await import("@/utils/gemini");
        geminiAnalysis = await analyzeBriefWithGemini(briefLower);
        if (geminiAnalysis?.expandedKeywords && Array.isArray(geminiAnalysis.expandedKeywords)) {
          for (const kw of geminiAnalysis.expandedKeywords) {
            const clean = (kw || "").toLowerCase().replace(/[\(\)\[\],.]/g, " ").trim();
            const words = clean.split(/\s+/).filter((w: string) => w.length > 1);
            expandedTokens.push(...words);
          }
        }
      } catch (e) {
        console.warn("Gemini brief analysis failed, continuing with direct tokens:", e);
      }
    }

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
      let tokenHits = 0;
      let keywordScore = 0;

      if (!isBriefEmpty) {
        for (const token of queryTokens) {
          let hit = false;
          if (item.name_th.toLowerCase().includes(token)) { keywordScore += 40; hit = true; }
          if (item.hilight && item.hilight.toLowerCase().includes(token)) { keywordScore += 25; hit = true; }
          if (item.sub_type && item.sub_type.toLowerCase().includes(token)) { keywordScore += 20; hit = true; }
          if (item.detail && item.detail.toLowerCase().includes(token)) { keywordScore += 15; hit = true; }
          if (item.category && item.category.toLowerCase().includes(token)) { keywordScore += 10; hit = true; }
          if (item.province && item.province.toLowerCase().includes(token)) { keywordScore += 25; hit = true; }
          if (hit) tokenHits++;
        }

        if (detected.matchedAlias && (item.name_th.includes(detected.matchedAlias) || (item.detail && item.detail.includes(detected.matchedAlias)))) {
          keywordScore += 30;
          tokenHits++;
        }

        // Gemini AI Expanded Semantic Concept Matches
        for (const token of expandedTokens) {
          let hit = false;
          if (item.name_th.toLowerCase().includes(token)) { keywordScore += 45; hit = true; }
          if (item.hilight && item.hilight.toLowerCase().includes(token)) { keywordScore += 30; hit = true; }
          if (item.sub_type && item.sub_type.toLowerCase().includes(token)) { keywordScore += 25; hit = true; }
          if (item.detail && item.detail.toLowerCase().includes(token)) { keywordScore += 20; hit = true; }
          if (hit) tokenHits++;
        }

        // Strict filter: If user provided search brief, item MUST have at least 1 keyword hit
        if (tokenHits === 0) {
          return { item, score: 0 };
        }

        // Multi-token match synergy (items matching 2+ words get huge boost)
        if (tokenHits > 1) {
          keywordScore += tokenHits * 80;
        }

        // Sub-word mountain/nature boost if query relates to doi/mountain
        if (queryTokens.some((t: string) => t.includes("ดอย") || t.includes("ภู") || t.includes("เขา"))) {
          if (item.name_th.includes("ดอย") || item.name_th.includes("ภู") || item.name_th.includes("เขา")) {
            keywordScore += 40;
          }
        }

        // Penalty for indoor museums / municipal buildings when user didn't ask for museums
        if (
          item.name_th.includes("พิพิธภัณฑ์") &&
          !queryTokens.some((t: string) => t.includes("พิพิธภัณฑ์"))
        ) {
          keywordScore -= 60;
        }

        score += keywordScore;
      }

      // Quality & Coordinate Boosts (only applied to active matches or during empty-brief browsing)
      if (item.lat && item.lng) score += 15;
      if (item.tel) score += 5;
      if (item.hilight && item.hilight.length > 5) score += 10;

      return { item, score };
    });

    const validMatches = scored.filter((s) => s.score > 0);
    const totalMatches = validMatches.length;

    let selectedItems: typeof scored = [];

    if (!isBriefEmpty) {
      // 1. Keyword Search: return genuine matching locations (top 35-40 items)
      validMatches.sort((a, b) => b.score - a.score);
      const searchLimit = limit ? Math.min(limit, 50) : 35;
      selectedItems = validMatches.slice(0, searchLimit);
    } else if (!effectiveProvince && !isRegionFilter) {
      // 2. Nationwide browsing without brief:
      // Return a clean sample of 1 top landmark per province (~70-77 pins)
      // This keeps the map uncluttered, fast, and representative of all regions
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

      // Sample 1 top landmark per province
      const provKeys = Object.keys(byProvince);
      for (const prov of provKeys) {
        if (byProvince[prov][0]) {
          selectedItems.push(byProvince[prov][0]);
        }
      }
    } else if (isRegionFilter) {
      // 3. Region browsing without brief:
      // Return top 35-40 locations in this region (evenly sampled across provinces in this region)
      const byProvince: Record<string, typeof scored> = {};
      for (const s of validMatches) {
        const prov = s.item.province || "อื่นๆ";
        if (!byProvince[prov]) byProvince[prov] = [];
        byProvince[prov].push(s);
      }
      for (const prov of Object.keys(byProvince)) {
        byProvince[prov].sort((a, b) => b.score - a.score);
      }

      const provKeys = Object.keys(byProvince);
      const targetCount = limit || 40;
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
      // 4. Specific Province browsing without brief:
      // Return top 50 locations for that province
      validMatches.sort((a, b) => b.score - a.score);
      selectedItems = validMatches.slice(0, limit || 50);
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
      geminiAnalysis,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
