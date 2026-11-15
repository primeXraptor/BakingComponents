"use client";

import { QUICK_RESPONSE_MENTIONS, type QuickResponseMention } from "../../../lib/kunchanada-dashboard";
import styles from "./KunchanadaQuickResponses.module.css";

export function QuickResponseButtons({
  onMention,
  disabled = false,
  column = false,
}: {
  onMention: (mention: QuickResponseMention) => void;
  disabled?: boolean;
  column?: boolean;
}) {
  return (
    <div className={`${styles.buttons} ${column ? styles.column : ""}`}>
      {QUICK_RESPONSE_MENTIONS.map((mention) => (
        <button type="button" key={mention} disabled={disabled} onClick={() => onMention(mention)}>
          {mention}
        </button>
      ))}
    </div>
  );
}

export function MentionText({ text }: { text: string }) {
  return text.split(/(@(?:President|Secretary|Organizer|Developer)\b)/g).map((part, index) =>
    QUICK_RESPONSE_MENTIONS.includes(part as QuickResponseMention) ? (
      <span key={index} className={styles.mention}>
        {part}
      </span>
    ) : (
      part
    ),
  );
}
