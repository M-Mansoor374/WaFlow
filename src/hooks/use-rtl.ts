import { useTranslation } from "react-i18next";

const RTL_LANGUAGES = ["ur", "ar"];

export function useRtl() {
  const { i18n } = useTranslation();
  const isRtl = RTL_LANGUAGES.includes(i18n.language);

  return { isRtl, dir: isRtl ? "rtl" as const : "ltr" as const };
}
