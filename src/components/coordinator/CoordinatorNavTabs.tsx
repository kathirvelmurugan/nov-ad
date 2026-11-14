import React from "react";

export interface CoordinatorNavTabsProps {
  activeTab: "C01" | "C07" | "C08" | "C09" | "C10";
  setActiveTab: (tab: "C01" | "C07" | "C08" | "C09" | "C10") => void;
  consultationType?: "written" | "video";
  isPaid: boolean;
  isAr: boolean;
  fontFamily: string;
}

type TabKey = "C01" | "C07" | "C08" | "C09" | "C10";

const TAB_LABELS_EN: Record<TabKey, string> = {
  C01: "Referral & Invoice",
  C07: "Call Slot",
  C08: "PDF 1",
  C09: "Follow-Up",
  C10: "PDF 2",
};

const TAB_LABELS_AR: Record<TabKey, string> = {
  C01: "الإحالة والفاتورة",
  C07: "موعد الاتصال",
  C08: "ملف PDF ١",
  C09: "المتابعة",
  C10: "ملف PDF ٢",
};

const CoordinatorNavTabs: React.FC<CoordinatorNavTabsProps> = ({
  activeTab,
  setActiveTab,
  consultationType,
  isPaid,
  isAr,
  fontFamily,
}) => {
  const labels = isAr ? TAB_LABELS_AR : TAB_LABELS_EN;
  const dir = isAr ? "rtl" : "ltr";
  const visibleTabs: TabKey[] =
    consultationType === "video"
      ? ["C01", "C07", "C08", "C09", "C10"]
      : ["C01", "C08", "C09", "C10"];

  const handleTabClick = (tab: TabKey) => {
    if (tab === "C07" && !isPaid) {
      window.alert(
        isAr
          ? "يرجى إتمام الدفع قبل الوصول إلى موعد الاتصال."
          : "Please complete payment before accessing the call slot."
      );
      return;
    }
    setActiveTab(tab);
  };

  return (
    <nav
      role="tablist"
      dir={dir}
      style={{
        display: "flex",
        gap: "4px",
        padding: "8px",
        backgroundColor: "#E6FAF7",
        borderRadius: "12px",
        fontFamily,
        direction: dir,
      }}
    >
      {visibleTabs.map((tab) => {
        const isActive = activeTab === tab;
        const isLocked = tab === "C07" && !isPaid;
        return (
          <button
            key={tab}
            role="tab"
            type="button"
            aria-selected={isActive}
            aria-disabled={isLocked}
            onClick={() => handleTabClick(tab)}
            style={{
              flex: 1,
              padding: "10px 16px",
              border: "none",
              borderRadius: "8px",
              cursor: isLocked ? "not-allowed" : "pointer",
              backgroundColor: isActive ? "#007B6E" : "transparent",
              color: isActive ? "#FFFFFF" : "#007B6E",
              fontWeight: isActive ? 700 : 500,
              fontSize: "14px",
              fontFamily,
              opacity: isLocked ? 0.5 : 1,
              transition: "all 0.2s ease",
              outline: "none",
            }}
            onFocus={(e) => {
              e.currentTarget.style.boxShadow = "0 0 0 2px #00C6AE";
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {labels[tab]}
          </button>
        );
      })}
    </nav>
  );
};

export default CoordinatorNavTabs;