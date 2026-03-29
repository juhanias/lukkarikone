import { useTranslation } from "react-i18next";
import { SettingsPanel } from "../components/SettingsPanel";
import useDocumentTitle from "../hooks/useDocumentTitle";

export default function Settings() {
  const { t } = useTranslation("settings");

  useDocumentTitle(`${t("title")} — Avoin Lukkari`);

  return (
    <div
      className="h-full overflow-y-auto"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      <SettingsPanel mode="page" />
    </div>
  );
}
