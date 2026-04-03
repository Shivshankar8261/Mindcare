export type MindCareLanguage = {
  code: string;
  label: string;
  dir: "ltr" | "rtl";
};

export const mindcareLanguages: MindCareLanguage[] = [
  { code: "en", label: "English", dir: "ltr" },
  { code: "hi", label: "हिंदी", dir: "ltr" },
  { code: "bn", label: "বাংলা", dir: "ltr" },
  { code: "te", label: "తెలుగు", dir: "ltr" },
  { code: "mr", label: "मराठी", dir: "ltr" },
  { code: "ta", label: "தமிழ்", dir: "ltr" },
  { code: "ur", label: "اردو", dir: "rtl" },
  { code: "gu", label: "ગુજરાતી", dir: "ltr" },
  { code: "kn", label: "ಕನ್ನಡ", dir: "ltr" },
  { code: "od", label: "ଓଡ଼ିଆ", dir: "ltr" },
  { code: "ml", label: "മലയാളം", dir: "ltr" },
  { code: "pa", label: "ਪੰਜਾਬੀ", dir: "ltr" },
  { code: "as", label: "অসমীয়া", dir: "ltr" },
  { code: "mai", label: "मैथिली", dir: "ltr" },
  { code: "sa", label: "संस्कृत", dir: "ltr" },
  { code: "kok", label: "कोंकणी", dir: "ltr" },
  { code: "sd", label: "سنڌي", dir: "rtl" },
  { code: "doi", label: "डोगरी", dir: "ltr" },
  { code: "mni", label: "ꯃꯅꯤꯇꯩ", dir: "ltr" },
  { code: "brx", label: "बोडो", dir: "ltr" },
  { code: "sat", label: "ᱥᱟᱱᱛᱟᱡᱤ", dir: "ltr" },
  { code: "ks", label: "کشمیر", dir: "rtl" },
  { code: "ne", label: "नेपाली", dir: "ltr" },
];

export function getLanguageLabel(code: string) {
  return mindcareLanguages.find((l) => l.code === code)?.label ?? "English";
}

export function getLanguageDir(code: string) {
  return mindcareLanguages.find((l) => l.code === code)?.dir ?? "ltr";
}

