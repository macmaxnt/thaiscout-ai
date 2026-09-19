// Utility for Google Gemini API integration

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function callGemini(prompt: string, jsonMode: boolean = false): Promise<any> {
  if (!GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY is not configured in environment");
    return null;
  }

  const models = ["gemini-2.5-flash-lite", "gemini-2.5-flash"];

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      
      const body: any = {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      };

      if (jsonMode) {
        body.generationConfig = {
          responseMimeType: "application/json"
        };
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(8000), // 8s timeout
      });

      if (!res.ok) {
        const errText = await res.text();
        console.warn(`Gemini API error with model ${model}: status ${res.status} - ${errText}`);
        continue; // try fallback model
      }

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) continue;

      if (jsonMode) {
        try {
          return JSON.parse(text);
        } catch {
          return null;
        }
      }

      return text;
    } catch (e: any) {
      console.warn(`Gemini call failed on ${model}:`, e.message);
    }
  }

  return null;
}

/**
 * Deconstructs a director's creative brief into filmable terrain, visual tags, and scouting advice
 */
export async function analyzeBriefWithGemini(brief: string) {
  if (!brief || brief.trim().length < 3) return null;

  const prompt = `คุณคือ AI Lead Film Location Scout สำหรับกองถ่ายภาพยนตร์ในประเทศไทย ที่เชี่ยวชาญฐานข้อมูลสถานที่ท่องเที่ยว ททท. 8,600+ แห่ง
ผู้กำกับต้องการบรีฟฉากดังนี้: "${brief}"

จงวิเคราะห์ความต้องการเชิงภาพและสถานที่จริงในไทย ตอบกลับเป็น JSON ในรูปแบบนี้เท่านั้น:
{
  "expandedKeywords": ["คำค้นลักษณะทางกายภาพหรือสถานที่ตัวแทนในไทย เช่น เสาดิน, แพะเมืองผี, แคนยอน, หินทราย, น้ำตก, ถ้ำ, อ่างเก็บน้ำ ไม่เกิน 5-6 คำ"],
  "mood": "บรรยาย Mood & Tone สั้นๆ 1 ประโยค",
  "directorTip": "คำแนะนำทางด้านแสง หรือมุมกล้องสำหรับฉากนี้ 1 ประโยค",
  "recommendedRegions": ["ภาคเหนือ", "ภาคตะวันออกเฉียงเหนือ", "ภาคใต้", "ภาคกลาง", "ภาคตะวันออก"]
}`;

  return await callGemini(prompt, true);
}

/**
 * Grounded RAG Production Consultant using Gemini
 */
export async function askGeminiProductionRAG(locationData: any, question: string, brief?: string) {
  const prompt = `คุณคือ AI Production Scout & Legal Permit Consultant ประจำกองถ่ายภาพยนตร์
คุณมีข้อมูลสถานที่จริง (Ground Truth) จากฐานข้อมูล ททท. ดังนี้:
- ชื่อสถานที่: ${locationData.name_th} (${locationData.name_en || ""})
- หมวดหมู่: ${locationData.category || "สถานที่ท่องเที่ยว"}
- จังหวัด / อำเภอ: ${locationData.province} / ${locationData.district || "ไม่ระบุ"}
- พิกัด GPS ทางการ: ${locationData.lat && locationData.lng ? `${locationData.lat}, ${locationData.lng}` : "ไม่มีพิกัดแน่นอน"}
- เบอร์ติดต่อทางการ: ${locationData.tel || "ไม่มีในระบบ (ให้ติดต่อ ททท. 1672)"}
- เวลาทำการ: ${locationData.time || "ไม่ระบุ"}
- รายละเอียด/จุดเด่น: ${locationData.hilight || locationData.detail || "ไม่มีรายละเอียดเพิ่มเติม"}
- บรีฟกองถ่าย: "${brief || "ทั่วไป"}"

คำถามจากทีมงาน: "${question}"

กฎสำคัญ (Anti-Hallucination & Safe Refusal):
1. ยึดข้อมูลจริงของสถานที่นี้เป็นหลัก
2. ด้านกฎหมายและการบินโดรน: ถ้าเป็นอุทยานแห่งชาติต้องขออนุญาตกรมอุทยานฯ และห้ามบินโดรนโดยไม่ได้รับอนุญาต, ถ้าเป็นโบราณสถาน/วัดต้องสำนักศิลปากรหรือวัด
3. ห้ามกุราคาค่าธรรมเนียมปิดสถานที่เองเด็ดขาด ถ้าไม่มีในข้อมูล ให้แจ้ง Safe Refusal และบอกให้ทีมงานโทรประสานงานตามเบอร์ทางการ (${locationData.tel || "1672"})
4. ให้คำแนะนำเชิง Cinematic แสง โลจิสติกส์การขนอุปกรณ์ และความปลอดภัยของทีมงานอย่างมืออาชีพ

จงตอบเป็นภาษาไทย กระชับ มีโครงสร้างชัดเจน พร้อมคำแนะนำที่นำไปใช้ได้จริง`;

  return await callGemini(prompt, false);
}
