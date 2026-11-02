import { memo } from "react";

type QwenLiveBadgeProps = {
  personaId?: string | number | null;
};

const QwenLiveBadge = memo(function QwenLiveBadge({ personaId }: QwenLiveBadgeProps) {
  return (
    <span
      role="status"
      aria-live="polite"
      aria-label="Qwen3.8-Max Live Connected"
      data-testid="qwen-live-badge"
      data-persona-id={personaId ?? undefined}
      dir="ltr"
      lang="en"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 12px",
        borderRadius: 9999,
        border: "1px solid #00C6AE",
        backgroundColor: "#E6FAF7",
        color: "#007B6E",
        fontFamily: "'Cairo', 'Segoe UI', sans-serif",
        fontSize: 14,
        fontWeight: 600,
        lineHeight: 1.4,
        unicodeBidi: "isolate",
        whiteSpace: "nowrap",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: "#25D366",
          flexShrink: 0,
        }}
      />
      Qwen3.8-Max Live Connected
    </span>
  );
});

export default QwenLiveBadge;