import { useTranslation } from "react-i18next";

export function Component() {
  const { t } = useTranslation();

  return (
    <div>
      <h1 className="text-2xl font-bold">{t("nav.settings")}</h1>
    </div>
  );
}
