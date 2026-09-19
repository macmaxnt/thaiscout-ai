import districtsDataRaw from "@/data/districts.json";

export const districtsData = districtsDataRaw as Record<string, string[]>;

export interface DistrictValidationResult {
  isValid: boolean;
  status: "empty" | "valid" | "is_province" | "in_other_province" | "not_found";
  message: string;
  matchedDistrict?: string;
  otherProvince?: string;
}

/**
 * Returns all districts (amphoes / khets) for a given province.
 */
export function getDistrictsByProvince(province: string): string[] {
  if (!province || province === "all") return [];
  return districtsData[province] || [];
}

/**
 * Validates whether a district belongs to the specified province,
 * detecting if it is actually another province or an amphoe of another province.
 */
export function validateDistrict(input: string, province: string): DistrictValidationResult {
  if (!input || !input.trim()) {
    return {
      isValid: false,
      status: "empty",
      message: "กรุณาระบุหรือเลือกอำเภอ / เขต",
    };
  }

  if (!province || province === "all") {
    return {
      isValid: false,
      status: "empty",
      message: "กรุณาเลือกจังหวัดก่อน",
    };
  }

  const raw = input.trim();
  // Strip leading prefixes like "อ.", "อำเภอ", "เขต"
  const clean = raw.replace(/^(อ\.|อำเภอ|เขต)/, "").trim();
  const provDistricts = districtsData[province] || [];

  // 1. Check direct or fuzzy match in the selected province
  const matched = provDistricts.find((d) => {
    const cleanD = d.replace(/^(อ\.|อำเภอ|เขต)/, "").trim();
    return (
      cleanD.toLowerCase() === clean.toLowerCase() ||
      d.toLowerCase() === clean.toLowerCase() ||
      (clean === "เมือง" && d.startsWith("เมือง")) ||
      d === "เมือง" + clean ||
      clean === "เมือง" + d
    );
  });

  if (matched) {
    const isBkk = province === "กรุงเทพมหานคร";
    const prefix = isBkk ? "เขต" : "อ.";
    return {
      isValid: true,
      status: "valid",
      matchedDistrict: matched,
      message: `${prefix}${matched} ในจังหวัด${province}`,
    };
  }

  // 2. Check if user typed a province name instead of an amphoe (e.g. typing "พะเยา" in "อุบลราชธานี")
  const allProvinces = Object.keys(districtsData);
  const matchedProvince = allProvinces.find(
    (p) => p.toLowerCase() === clean.toLowerCase() || p.toLowerCase() === raw.toLowerCase()
  );
  if (matchedProvince) {
    if (matchedProvince === province) {
      const capital = provDistricts.find((d) => d.startsWith("เมือง"));
      return {
        isValid: false,
        status: "is_province",
        message: `"${matchedProvince}" คือชื่อจังหวัด (หากหมายถึงอำเภอเมือง ให้เลือก "${capital || 'เมือง'}")`,
      };
    }
    return {
      isValid: false,
      status: "is_province",
      message: `"${matchedProvince}" เป็นชื่อจังหวัด ไม่ใช่อำเภอในจังหวัด${province}`,
    };
  }

  // 3. Check if user typed an amphoe that belongs to another province (e.g. typing "หัวหิน" in "อุบลราชธานี")
  for (const [otherProv, dList] of Object.entries(districtsData)) {
    if (otherProv === province) continue;
    const otherMatch = dList.find((d) => {
      const cleanD = d.replace(/^(อ\.|อำเภอ|เขต)/, "").trim();
      return (
        cleanD.toLowerCase() === clean.toLowerCase() ||
        d.toLowerCase() === clean.toLowerCase() ||
        (clean === "เมือง" && d.startsWith("เมือง"))
      );
    });
    if (otherMatch) {
      const otherPrefix = otherProv === "กรุงเทพมหานคร" ? "เขต" : "อ.";
      return {
        isValid: false,
        status: "in_other_province",
        otherProvince: otherProv,
        matchedDistrict: otherMatch,
        message: `"${raw}" เป็น${otherPrefix}${otherMatch} ในจังหวัด${otherProv} (ไม่ใช่จังหวัด${province})`,
      };
    }
  }

  // 4. Completely unrecognized district
  return {
    isValid: false,
    status: "not_found",
    message: `ไม่พบอำเภอ/เขต "${raw}" ในจังหวัด${province}`,
  };
}
