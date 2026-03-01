import { useTranslation } from "react-i18next";

export function Component() {
  const { t } = useTranslation("chat");

  return (
    <div>
      <h1 className="text-2xl font-bold">{t("title")}</h1>
    </div>
  );
}
