import { NextResponse } from "next/server";

// Curated high-yield locations dataset for scouting demo
const FEATURED_LOCATIONS = [
  {
    id: "20250620154151001",
    name_th: "ชุมชนริมน้ำจันทบูร",
    name_en: "Chanthaboon Waterfront Community",
    category: "แหล่งท่องเที่ยวทางประวัติศาสตร์ และวัฒนธรรม",
    sub_type: "วิถีชีวิตความเป็นอยู่ (ชุมชน)",
    province: "จันทบุรี",
    district: "เมืองจันทบุรี",
    lat: 12.6127731,
    lng: 102.1136881,
    detail: "ชุมชนริมน้ำจันทบูร เป็นชุมชนเก่าแก่ที่มีเอกลักษณ์ทางประวัติศาสตร์และวัฒนธรรม บ้านเรือนไม้โบราณ",
    hilight: "สถาปัตยกรรมชิโน-โปรตุกีสโบราณที่ได้รับการอนุรักษ์อย่างดี อาคารบ้านเรือนเก่าแก่ริมแม่น้ำ",
    time: "ทุกวัน เวลา 08.00 - 17.00 น.",
    tel: "0-3931-1241 เทศบาลเมืองจันทบุรี",
    fee: "",
    limitations: "ถนนแคบ ที่จอดรถจำกัด ควรประสานงานจุดจอดรถกองถ่ายล่วงหน้า",
    facebook: "https://www.facebook.com/chanthaboonwaterfront",
    tiktok: ""
  },
  {
    id: "20150914102930101",
    name_th: "น้ำตกสิริภูมิ",
    name_en: "Siribhume Waterfall",
    category: "แหล่งท่องเที่ยวทางธรรมชาติ",
    sub_type: "น้ำตก",
    province: "เชียงใหม่",
    district: "จอมทอง",
    lat: 18.5471959,
    lng: 98.5121858,
    detail: "น้ำตกขนาดใหญ่ไหลลงมาจากหน้าผาสูงชัน บรรยากาศดิบ ร่มรื่นด้วยป่าสนและพืชพรรณเมืองหนาว",
    hilight: "สายน้ำตกคู่ที่ไหลลงมาจากหน้าผาสูง มองเห็นได้แต่ไกลจากดอยอินทนนท์ เหมาะแก่การถ่ายซีนธรรมชาติอลังการ",
    time: "ทุกวัน 09.00 - 18.00 น.",
    tel: "0-5328-6729 อุทยานแห่งชาติดอยอินทนนท์",
    fee: "ผู้ใหญ่ 50 บาท เด็ก 20 บาท",
    limitations: "ช่วงฤดูฝนทางเดินลื่นมาก รถตู้กองถ่ายต้องจอดที่ลานด้านล่างแล้วเดินเท้าต่อ",
    facebook: "",
    tiktok: ""
  },
  {
    id: "20150914102930102",
    name_th: "เส้นทางศึกษาธรรมชาติกิ่วแม่ปาน",
    name_en: "Kew Mae Pan Nature Trail",
    category: "แหล่งท่องเที่ยวทางธรรมชาติ",
    sub_type: "จุดชมวิว",
    province: "เชียงใหม่",
    district: "จอมทอง",
    lat: 18.55621,
    lng: 98.48208,
    detail: "สันเขาเปิดโล่ง ทะเลหมอก ทุ่งหญ้ากึ่งอัลไพน์ และวิวหน้าผาสูงชัน",
    hilight: "วิวหน้าผาสูง ทะเลหมอกขาวโพลนยามเช้า และทุ่งกุหลาบพันปี เหมาะกับซีน MV และภาพยนตร์ผจญภัย",
    time: "เปิด พ.ย. - พ.ค. เวลา 06.00 - 16.00 น.",
    tel: "053-286728 อุทยานฯ ดอยอินทนนท์",
    fee: "ไกด์ท้องถิ่น 200 บาท/กลุ่ม",
    limitations: "ห้ามใช้อากาศยานไร้คนขับ (โดรน) โดยไม่ได้รับอนุญาตจากกรมอุทยานฯ ล่วงหน้า",
    facebook: "",
    tiktok: ""
  },
  {
    id: "20150914102930103",
    name_th: "วัดไชยวัฒนาราม",
    name_en: "Wat Chaiwatthanaram",
    category: "แหล่งท่องเที่ยวทางประวัติศาสตร์ และวัฒนธรรม",
    sub_type: "โบราณสถาน / วัด",
    province: "พระนครศรีอยุธยา",
    district: "พระนครศรีอยุธยา",
    lat: 14.34352,
    lng: 100.52845,
    detail: "โบราณสถานริมแม่น้ำเจ้าพระยา ศิลปะอยุธยาตอนปลาย ปรางค์ประธานสง่างาม",
    hilight: "ปรางค์โบราณริมแม่น้ำ แสงยามเย็นสีทองอร่าม โลเคชันถ่ายทำละครพีเรียดยอดฮิต เช่น บุพเพสันนิวาส",
    time: "ทุกวัน 08.00 - 18.30 น. (เปิดไฟประดับช่วงค่ำ)",
    tel: "035-242286 อุทยานประวัติศาสตร์พระนครศรีอยุธยา",
    fee: "คนไทย 10 บาท ต่างชาติ 50 บาท",
    limitations: "การตั้งกล้องขาตั้งใหญ่และกองถ่ายต้องทำหนังสือขออนุญาตกรมศิลปากรก่อนถ่ายทำอย่างน้อย 15 วัน",
    facebook: "",
    tiktok: ""
  },
  {
    id: "20150914102930104",
    name_th: "แหลมพรหมเทพ",
    name_en: "Promthep Cape",
    category: "แหล่งท่องเที่ยวทางธรรมชาติ",
    sub_type: "จุดชมวิวทางทะเล",
    province: "ภูเก็ต",
    district: "เมืองภูเก็ต",
    lat: 7.76387,
    lng: 98.30528,
    detail: "แหลมหินยื่นลงสู่ทะเลอันดามัน รายล้อมด้วยต้นตาลและทุ่งหญ้า",
    hilight: "จุดชมพระอาทิตย์ตกที่สวยที่สุดในประเทศไทย หน้าผาและคลื่นทะเลซัดโขดหิน",
    time: "เปิดตลอด 24 ชั่วโมง (แนะนำช่วง 16.30 - 18.30 น.)",
    tel: "076-211036 เทศบาลตำบลราไวย์",
    fee: "ไม่มีค่าเข้าชม",
    limitations: "ช่วงเย็นนักท่องเที่ยวหนาแน่นมาก หากต้องใช้พื้นที่กองถ่ายควรประสานงานเจ้าหน้าที่ล่วงหน้า",
    facebook: "",
    tiktok: ""
  },
  {
    id: "20150914102930105",
    name_th: "น้ำตกเอราวัณ",
    name_en: "Erawan Waterfall",
    category: "แหล่งท่องเที่ยวทางธรรมชาติ",
    sub_type: "น้ำตก",
    province: "กาญจนบุรี",
    district: "ศรีสวัสดิ์",
    lat: 14.36889,
    lng: 99.14444,
    detail: "น้ำตก 7 ชั้น น้ำใสสีเขียวมรกต ไหลผ่านชั้นหินปูนท่ามกลางป่าเบญจพรรณ",
    hilight: "แอ่งน้ำใสสีเขียวมรกตและม่านน้ำตกหินปูน เหมาะสำหรับซีนถ่ายทำกลางป่าธรรมชาติ",
    time: "ทุกวัน 07.30 - 16.00 น.",
    tel: "034-574222 อุทยานแห่งชาติเอราวัณ",
    fee: "คนไทย 100 บาท เด็ก 50 บาท",
    limitations: "ห้ามนำขวดพลาสติกเกินชั้น 2 ต้องวางมัดจำขวด",
    facebook: "",
    tiktok: ""
  },
  {
    id: "20150914102930106",
    name_th: "วัดภูมินทร์",
    name_en: "Wat Phumin",
    category: "แหล่งท่องเที่ยวทางประวัติศาสตร์ และวัฒนธรรม",
    sub_type: "วัด",
    province: "น่าน",
    district: "เมืองน่าน",
    lat: 18.77583,
    lng: 100.77139,
    detail: "พระอุโบสถจตุรมุขแห่งเดียวในไทย และจิตรกรรมฝาผนังปู่ม่านย่าม่าน (กระซิบรักบันลือโลก)",
    hilight: "ภาพจิตรกรรมฝาผนังกระซิบรักบันลือโลก และอุโบสถทรงจตุรมุขโบราณที่มีเอกลักษณ์เฉพาะล้านนา",
    time: "ทุกวัน 06.00 - 18.00 น.",
    tel: "054-710897 เทศบาลเมืองน่าน",
    fee: "ไม่มีค่าเข้าชม",
    limitations: "การถ่ายทำภายในพระอุโบสถต้องแต่งกายสุภาพ สำรวม และห้ามใช้แฟลชกระทบภาพจิตรกรรมฝาผนังโบราณ",
    facebook: "",
    tiktok: ""
  },
  {
    id: "20150914102930107",
    name_th: "เสาชิงช้าและลานคนเมือง",
    name_en: "The Giant Swing",
    category: "แหล่งท่องเที่ยวทางประวัติศาสตร์ และวัฒนธรรม",
    sub_type: "โบราณสถาน / แลนด์มาร์ก",
    province: "กรุงเทพมหานคร",
    district: "พระนคร",
    lat: 13.75167,
    lng: 100.50139,
    detail: "สถาปัตยกรรมไม้สีแดงชาดใจกลางกรุง สร้างขึ้นในสมัยรัชกาลที่ 1",
    hilight: "เสาชิงช้าสีแดงโดดเด่นตัดกับท้องฟ้าเมืองกรุง รายล้อมด้วยร้านอาหารเก่าแก่และสตรีทฟู้ด",
    time: "ชมภายนอกได้ตลอด 24 ชั่วโมง",
    tel: "02-225-7612 กรุงเทพมหานคร",
    fee: "ไม่มีค่าเข้าชม",
    limitations: "การถ่ายทำที่มีการตั้งไฟขนาดใหญ่หรือปิดกั้นทางเท้า ต้องขออนุญาตสำนักงานเขตพระนครล่วงหน้า",
    facebook: "",
    tiktok: ""
  }
];

export async function POST(req: Request) {
  try {
    const { brief, province } = await req.json();
    const briefLower = (brief || "").toLowerCase().trim();
    const tokens = briefLower.split(/\s+/).filter((t: string) => t.length > 1);

    const scored = FEATURED_LOCATIONS.map((loc) => {
      let score = 50; // base score
      if (province && province !== "all") {
        if (!loc.province.includes(province)) {
          score -= 40;
        } else {
          score += 30;
        }
      }

      for (const token of tokens) {
        const text = `${loc.name_th} ${loc.name_en} ${loc.category} ${loc.sub_type} ${loc.hilight} ${loc.detail}`.toLowerCase();
        if (text.includes(token)) score += 15;
      }

      return { loc, score: Math.min(Math.max(score, 45), 98) };
    });

    const results = scored
      .sort((a, b) => b.score - a.score)
      .map((s) => ({
        ...s.loc,
        relevanceScore: s.score,
        hasVerifiedCoords: true,
        hasOperatingHours: !!s.loc.time,
        hasDirectContact: !!s.loc.tel,
        hasFeeInfo: !!s.loc.fee,
        permitWarning: s.loc.limitations || "โปรดประสานงานหน่วยงานผู้ดูแลล่วงหน้า",
      }));

    return NextResponse.json({
      success: true,
      totalMatches: results.length,
      locations: results,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
