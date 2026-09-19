export interface ProvinceData {
  name: string;
  region: "ภาคกลาง" | "ภาคเหนือ" | "ภาคตะวันออกเฉียงเหนือ" | "ภาคใต้" | "ภาคตะวันออก" | "ภาคตะวันตก";
  aliases?: string[];
}

export const THAI_PROVINCES: ProvinceData[] = [
  // --- ภาคกลาง (22 จังหวัด/พื้นที่พิเศษ) ---
  { name: "กรุงเทพมหานคร", region: "ภาคกลาง", aliases: ["กรุงเทพ", "กทม", "bangkok", "bkk"] },
  { name: "นนทบุรี", region: "ภาคกลาง", aliases: ["nonthaburi", "ปากเกร็ด", "บางใหญ่"] },
  { name: "ปทุมธานี", region: "ภาคกลาง", aliases: ["pathum thani", "รังสิต", "คลองหลวง"] },
  { name: "สมุทรปราการ", region: "ภาคกลาง", aliases: ["samut prakan", "ปากน้ำ", "บางปู", "บางพลี", "สนามบินสุวรรณภูมิ"] },
  { name: "สมุทรสาคร", region: "ภาคกลาง", aliases: ["samut sakhon", "มหาชัย"] },
  { name: "สมุทรสงคราม", region: "ภาคกลาง", aliases: ["samut songkhram", "อัมพวา", "แม่กลอง"] },
  { name: "พระนครศรีอยุธยา", region: "ภาคกลาง", aliases: ["อยุธยา", "ayutthaya", "กรุงเก่า"] },
  { name: "อ่างทอง", region: "ภาคกลาง", aliases: ["ang thong"] },
  { name: "ลพบุรี", region: "ภาคกลาง", aliases: ["lopburi", "วังนารายณ์"] },
  { name: "สิงห์บุรี", region: "ภาคกลาง", aliases: ["sing buri", "บางระจัน"] },
  { name: "ชัยนาท", region: "ภาคกลาง", aliases: ["chai nat"] },
  { name: "สระบุรี", region: "ภาคกลาง", aliases: ["saraburi", "มวกเหล็ก", "แก่งคอย"] },
  { name: "นครนายก", region: "ภาคกลาง", aliases: ["nakhon nayok", "เขื่อนขุนด่าน", "สาริกา"] },
  { name: "นครปฐม", region: "ภาคกลาง", aliases: ["nakhon pathom", "ศาลายา", "องค์พระปฐมเจดีย์"] },
  { name: "สุพรรณบุรี", region: "ภาคกลาง", aliases: ["suphan buri", "ด่านช้าง"] },
  { name: "เพชรบูรณ์", region: "ภาคกลาง", aliases: ["phetchabun", "เขาค้อ", "ภูทับเบิก"] },
  { name: "กำแพงเพชร", region: "ภาคกลาง", aliases: ["kamphaeng phet"] },
  { name: "พิจิตร", region: "ภาคกลาง", aliases: ["phichit"] },
  { name: "พิษณุโลก", region: "ภาคกลาง", aliases: ["phitsanulok"] },
  { name: "นครสวรรค์", region: "ภาคกลาง", aliases: ["nakhon sawan", "ปากน้ำโพ"] },
  { name: "อุทัยธานี", region: "ภาคกลาง", aliases: ["uthai thani", "ห้วยขาแข้ง"] },
  { name: "สุโขทัย", region: "ภาคกลาง", aliases: ["sukhothai", "อุทยานประวัติศาสตร์สุโขทัย"] },

  // --- ภาคเหนือ (9 จังหวัด) ---
  { name: "เชียงใหม่", region: "ภาคเหนือ", aliases: ["chiang mai", "chiangmai", "ดอยสุเทพ", "นิมมาน", "แม่ริม", "ดอยอินทนนท์", "แม่กำปอง"] },
  { name: "เชียงราย", region: "ภาคเหนือ", aliases: ["chiang rai", "chiangrai", "แม่สาย", "สามเหลี่ยมทองคำ", "ภูชี้ฟ้า"] },
  { name: "ลำปาง", region: "ภาคเหนือ", aliases: ["lampang", "เมืองรถม้า"] },
  { name: "ลำพูน", region: "ภาคเหนือ", aliases: ["lamphun"] },
  { name: "แม่ฮ่องสอน", region: "ภาคเหนือ", aliases: ["mae hong son", "ปาย", "ปางอุ๋ง", "บ้านรักไทย"] },
  { name: "น่าน", region: "ภาคเหนือ", aliases: ["nan", "ปัว", "บ่อเกลือ"] },
  { name: "พะเยา", region: "ภาคเหนือ", aliases: ["phayao", "กว๊านพะเยา"] },
  { name: "แพร่", region: "ภาคเหนือ", aliases: ["phrae"] },
  { name: "อุตรดิตถ์", region: "ภาคเหนือ", aliases: ["uttaradit"] },

  // --- ภาคตะวันออกเฉียงเหนือ / อีสาน (20 จังหวัด) ---
  { name: "ขอนแก่น", region: "ภาคตะวันออกเฉียงเหนือ", aliases: ["khon kaen", "มข", "บึงแก่นนคร"] },
  { name: "นครราชสีมา", region: "ภาคตะวันออกเฉียงเหนือ", aliases: ["โคราช", "korat", "nakhon ratchasima", "เขาใหญ่", "ปากช่อง", "วังน้ำเขียว"] },
  { name: "อุดรธานี", region: "ภาคตะวันออกเฉียงเหนือ", aliases: ["udon thani", "คำชะโนด", "ทะเลบัวแดง"] },
  { name: "อุบลราชธานี", region: "ภาคตะวันออกเฉียงเหนือ", aliases: ["ubon ratchathani", "ผาแต้ม", "สามพันโบก"] },
  { name: "บุรีรัมย์", region: "ภาคตะวันออกเฉียงเหนือ", aliases: ["buriram", "พนมรุ้ง", "ช้างอารีนา"] },
  { name: "สุรินทร์", region: "ภาคตะวันออกเฉียงเหนือ", aliases: ["surin", "เมืองช้าง"] },
  { name: "ศรีสะเกษ", region: "ภาคตะวันออกเฉียงเหนือ", aliases: ["sisaket", "ผามออีแดง"] },
  { name: "ร้อยเอ็ด", region: "ภาคตะวันออกเฉียงเหนือ", aliases: ["roi et", "หอโหวต"] },
  { name: "มหาสารคาม", region: "ภาคตะวันออกเฉียงเหนือ", aliases: ["maha sarakham"] },
  { name: "กาฬสินธุ์", region: "ภาคตะวันออกเฉียงเหนือ", aliases: ["kalasin", "ไดโนเสาร์"] },
  { name: "สกลนคร", region: "ภาคตะวันออกเฉียงเหนือ", aliases: ["sakon nakhon"] },
  { name: "นครพนม", region: "ภาคตะวันออกเฉียงเหนือ", aliases: ["nakhon phanom", "พระธาตุพนม"] },
  { name: "มุกดาหาร", region: "ภาคตะวันออกเฉียงเหนือ", aliases: ["mukdahan", "สะพานมิตรภาพ"] },
  { name: "ยโสธร", region: "ภาคตะวันออกเฉียงเหนือ", aliases: ["yasothon", "บั้งไฟ"] },
  { name: "อำนาจเจริญ", region: "ภาคตะวันออกเฉียงเหนือ", aliases: ["amnat charoen"] },
  { name: "หนองคาย", region: "ภาคตะวันออกเฉียงเหนือ", aliases: ["nong khai", "ริมโขง"] },
  { name: "บึงกาฬ", region: "ภาคตะวันออกเฉียงเหนือ", aliases: ["bueng kan", "ภูทอก", "หินสามวาฬ"] },
  { name: "เลย", region: "ภาคตะวันออกเฉียงเหนือ", aliases: ["loei", "เชียงคาน", "ภูกระดึง", "ภูเรือ"] },
  { name: "หนองบัวลำภู", region: "ภาคตะวันออกเฉียงเหนือ", aliases: ["nong bua lamphu"] },
  { name: "ชัยภูมิ", region: "ภาคตะวันออกเฉียงเหนือ", aliases: ["chaiyaphum", "ทุ่งดอกกระเจียว", "มอหินขาว"] },

  // --- ภาคใต้ (14 จังหวัด) ---
  { name: "ภูเก็ต", region: "ภาคใต้", aliases: ["phuket", "ป่าตอง", "แหลมพรหมเทพ", "เมืองเก่าภูเก็ต"] },
  { name: "กระบี่", region: "ภาคใต้", aliases: ["krabi", "อ่าวนาง", "เกาะพีพี", "ไร่เลย์", "เกาะลันตา"] },
  { name: "สุราษฎร์ธานี", region: "ภาคใต้", aliases: ["surat thani", "เกาะสมุย", "สมุย", "เกาะพะงัน", "พะงัน", "เกาะเต่า", "เขาสก", "เขื่อนเชี่ยวหลาน"] },
  { name: "พังงา", region: "ภาคใต้", aliases: ["phang nga", "อ่าวพังงา", "เขาตะปู", "เกาะสิมิลัน", "สิมิลัน", "เขาหลัก"] },
  { name: "สงขลา", region: "ภาคใต้", aliases: ["songkhla", "หาดใหญ่", "hat yai"] },
  { name: "นครศรีธรรมราช", region: "ภาคใต้", aliases: ["nakhon si thammarat", "คีรีวง", "วัดเจดีย์ไอ้ไข่"] },
  { name: "ตรัง", region: "ภาคใต้", aliases: ["trang", "เกาะกระดาน", "ถ้ำมรกต"] },
  { name: "สตูล", region: "ภาคใต้", aliases: ["satun", "เกาะหลีเป๊ะ", "หลีเป๊ะ", "ตะรุเตา"] },
  { name: "ชุมพร", region: "ภาคใต้", aliases: ["chumphon", "ประตูสู่ภาคใต้"] },
  { name: "ระนอง", region: "ภาคใต้", aliases: ["ranong", "เกาะพยาม", "บ่อน้ำแร่"] },
  { name: "พัทลุง", region: "ภาคใต้", aliases: ["phatthalung", "ทะเลน้อย"] },
  { name: "ปัตตานี", region: "ภาคใต้", aliases: ["pattani"] },
  { name: "ยะลา", region: "ภาคใต้", aliases: ["yala", "เบตง", "betong", "อัยเยอร์เวง"] },
  { name: "นราธิวาส", region: "ภาคใต้", aliases: ["narathiwat"] },

  // --- ภาคตะวันออก (7 จังหวัด) ---
  { name: "ชลบุรี", region: "ภาคตะวันออก", aliases: ["chonburi", "chon buri", "พัทยา", "pattaya", "บางแสน", "เกาะล้าน", "ศรีราชา", "สัตหีบ"] },
  { name: "ระยอง", region: "ภาคตะวันออก", aliases: ["rayong", "เกาะเสม็ด", "เสม็ด"] },
  { name: "จันทบุรี", region: "ภาคตะวันออก", aliases: ["chanthaburi", "ชุมชนริมน้ำจันทบูร", "เนินนางพญา", "เขาคิชฌกูฏ"] },
  { name: "ตราด", region: "ภาคตะวันออก", aliases: ["trat", "เกาะช้าง", "เกาะกูด", "เกาะหมาก"] },
  { name: "ฉะเชิงเทรา", region: "ภาคตะวันออก", aliases: ["chachoengsao", "แปดริ้ว", "หลวงพ่อโสธร"] },
  { name: "ปราจีนบุรี", region: "ภาคตะวันออก", aliases: ["prachinburi"] },
  { name: "สระแก้ว", region: "ภาคตะวันออก", aliases: ["sa kaeo", "ตลาดโรงเกลือ"] },

  // --- ภาคตะวันตก (5 จังหวัด) ---
  { name: "กาญจนบุรี", region: "ภาคตะวันตก", aliases: ["kanchanaburi", "สะพานข้ามแม่น้ำแคว", "สังขละบุรี", "ทองผาภูมิ", "น้ำตกเอราวัณ"] },
  { name: "ราชบุรี", region: "ภาคตะวันตก", aliases: ["ratchaburi", "สวนผึ้ง", "ตลาดน้ำดำเนินสะดวก"] },
  { name: "เพชรบุรี", region: "ภาคตะวันตก", aliases: ["phetchaburi", "ชะอำ", "เขาวัง", "แก่งกระจาน"] },
  { name: "ประจวบคีรีขันธ์", region: "ภาคตะวันตก", aliases: ["prachuap khiri khan", "หัวหิน", "hua hin", "ปราณบุรี", "กุยบุรี"] },
  { name: "ตาก", region: "ภาคตะวันตก", aliases: ["tak", "แม่สอด", "น้ำตกทีลอซู", "ทีลอซู"] },
];

export const REGIONS = [
  "ทั้งหมด",
  "ภาคกลาง",
  "ภาคเหนือ",
  "ภาคตะวันออกเฉียงเหนือ",
  "ภาคใต้",
  "ภาคตะวันออก",
  "ภาคตะวันตก",
] as const;

/**
 * Intelligent Province Detection from user search brief / query
 * Detects formal province names as well as famous landmarks/aliases (e.g. "อยุธยา", "พัทยา", "หัวหิน", "โคราช", "กทม", "เบตง")
 */
export function detectProvinceFromText(text: string): {
  detectedProvince: string | null;
  matchedAlias: string | null;
} {
  if (!text || text.trim().length === 0) {
    return { detectedProvince: null, matchedAlias: null };
  }

  const query = text.toLowerCase().trim();

  // 1. Direct check against exact official province name
  for (const prov of THAI_PROVINCES) {
    if (query.includes(prov.name.toLowerCase())) {
      return { detectedProvince: prov.name, matchedAlias: prov.name };
    }
  }

  // 2. Check aliases / famous landmarks / common nicknames
  for (const prov of THAI_PROVINCES) {
    if (prov.aliases) {
      for (const alias of prov.aliases) {
        if (query.includes(alias.toLowerCase())) {
          return { detectedProvince: prov.name, matchedAlias: alias };
        }
      }
    }
  }

  return { detectedProvince: null, matchedAlias: null };
}

/**
 * Filter provinces by search term and optional region
 */
export function searchProvinces(searchTerm: string, selectedRegion: string = "ทั้งหมด"): ProvinceData[] {
  let list = THAI_PROVINCES;
  if (selectedRegion && selectedRegion !== "ทั้งหมด") {
    list = list.filter((p) => p.region === selectedRegion);
  }

  if (!searchTerm || searchTerm.trim().length === 0) {
    return list;
  }

  const term = searchTerm.toLowerCase().trim();
  return list.filter((p) => {
    if (p.name.toLowerCase().includes(term)) return true;
    if (p.region.toLowerCase().includes(term)) return true;
    if (p.aliases?.some((a) => a.toLowerCase().includes(term))) return true;
    return false;
  });
}

export const REGION_LIST = [
  { id: "all", name: "ทั่วประเทศ (ทุกจังหวัด)", icon: "world", count: 77 },
  { id: "region:ภาคกลาง", name: "ภาคกลาง", icon: "central", count: 22 },
  { id: "region:ภาคเหนือ", name: "ภาคเหนือ", icon: "north", count: 9 },
  { id: "region:ภาคตะวันออกเฉียงเหนือ", name: "ภาคอีสาน (ตะวันออกเฉียงเหนือ)", icon: "northeast", count: 20 },
  { id: "region:ภาคใต้", name: "ภาคใต้", icon: "south", count: 14 },
  { id: "region:ภาคตะวันออก", name: "ภาคตะวันออก", icon: "east", count: 7 },
  { id: "region:ภาคตะวันตก", name: "ภาคตะวันตก", icon: "west", count: 5 },
] as const;

export function getProvincesInRegion(regionKey: string): string[] {
  if (regionKey === "all" || !regionKey || regionKey === "ทั้งหมด") {
    return THAI_PROVINCES.map((p) => p.name);
  }
  const cleanRegion = regionKey.replace("region:", "");
  return THAI_PROVINCES.filter((p) => p.region === cleanRegion).map((p) => p.name);
}
