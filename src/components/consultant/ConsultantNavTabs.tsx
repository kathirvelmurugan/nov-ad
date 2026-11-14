import React from "react";

export type ScreenStage = "K01_K04" | "K05" | "K06" | "K07" | "K08" | "K09" | "K10";

export interface ConsultantNavTabsProps {
  currentScreen: ScreenStage;
  setCurrentScreen: (screen: ScreenStage) => void;
  isWritten: boolean;
  isCaseAccepted: boolean;
  isCaseClosed: boolean;
  tealPrimary: string;
}

const TABS: { key: ScreenStage; labelEn: string; labelAr: string }[] = [
  { key: "K01_K04", labelEn: "Accept", labelAr: "قبول" },
  { key: "K05", labelEn: "Review", labelAr: "مراجعة" },
  { key: "K06", labelEn: "Opinion", labelAr: "رأي" },
  { key: "K07", labelEn: "Slots", labelAr: "مواعيد" },
  { key: "K08", labelEn: "Call", labelAr: "اتصال" },
  { key: "K10", labelEn: "Closed", labelAr: "مغلق" },
];

const ConsultantNavTabs: React.FC<ConsultantNavTabsProps> = ({
  currentScreen,
  setCurrentScreen,
  isWritten,
  isCaseAccepted,
  isCaseClosed,
  tealPrimary,
}) => {
  const isVisible = (key: ScreenStage): boolean => {
    if (key === "K07" || key === "K08") return !isWritten;
    if (key === "K10") return isCaseClosed;
    return true;
  };

  return (
    <nav
      dir="auto"
      style={{
        display: "flex",
        gap: "0.5rem",
        padding: "0.75rem",
        backgroundColor: "#E6FAF7",
        borderRadius: "0.75rem",
        fontFamily: "'Cairo', sans-serif",
        flexWrap: "wrap",
        justifyContent: "center",
      }}
      role="tablist"
      aria-label="Consultant Navigation"
    >
      {TABS.filter((t) => isVisible(t.key)).map((tab) => {
        const isActive = currentScreen === tab.key;
        const isLocked = !isCaseAccepted && tab.key !== "K01_K04";

        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={isActive}
            disabled={isLocked}
            onClick={() => !isLocked && setCurrentScreen(tab.key)}
            style={{
              flex: "1 1 auto",
              minWidth: "5rem",
              padding: "0.5rem 1rem",
              border: "none",
              borderRadius: "0.5rem",
              cursor: isLocked ? "not-allowed" : "pointer",
              opacity: isLocked ? 0.5 : 1,
              backgroundColor: isActive ? tealPrimary : "#ffffff",
              color: isActive ? "#ffffff" : tealPrimary,
              fontWeight: 700,
              fontSize: "0.875rem",
              transition: "all 0.2s ease",
              outline: "none",
              boxShadow: isActive ? `0 2px 8px ${tealPrimary}40` : "0 1px 3px rgba(0,0,0,0.08)",
            }}
          >
            <span lang="en" style={{ display: "inline" }}>{tab.labelEn}</span>
            <span style={{ margin: "0 0.25rem" }}>/</span>
            <span lang="ar" style={{ display: "inline" }}>{tab.labelAr}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default ConsultantNavTabs;