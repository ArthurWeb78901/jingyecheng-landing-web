// src/components/ChatBubble.tsx
"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import {
  ChatTexts,
  getOrCreateSessionId,
  langFromPathname,
  getTextsByLang,
  LangCode,
} from "./chat/chatShared";
import { VisitorChatPanel } from "./chat/VisitorChatPanel";
import { AdminChatPanel } from "./chat/AdminChatPanel";
import { setAdminOnlineStatus } from "./chat/adminStatus";

const MAX_INITIAL_MESSAGE_LENGTH = 500;

function sanitizeInitialMessage(raw: unknown): string {
  if (typeof raw !== "string") return "";
  let s = raw.trim();
  s = s.replace(/[\u0000-\u001F\u007F-\u009F]/g, (ch) =>
    ch === "\n" || ch === "\r" || ch === "\t" ? ch : ""
  );
  if (s.length > MAX_INITIAL_MESSAGE_LENGTH) s = s.slice(0, MAX_INITIAL_MESSAGE_LENGTH);
  return s;
}

export function ChatBubble() {
  const pathname = usePathname() || "/";
  const lang: LangCode = langFromPathname(pathname);
  const texts: ChatTexts = getTextsByLang(lang);

  const [isOpen, setIsOpen] = useState(false);
  const [isAdminClient, setIsAdminClient] = useState(false);
  const [adminOnline, setAdminOnline] = useState(false);

  const [sessionId, setSessionId] = useState("");
  const [hasUnread, setHasUnread] = useState(false);
  const [prefill, setPrefill] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    setSessionId(getOrCreateSessionId());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const flag = window.localStorage.getItem("jyc_admin_logged_in") === "true";
    setIsAdminClient(flag);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isAdminClient) return;

    void setAdminOnlineStatus(true);

    const timer = window.setInterval(() => {
      void setAdminOnlineStatus(true);
    }, 30_000);

    const handleUnload = () => {
      void setAdminOnlineStatus(false);
    };
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      clearInterval(timer);
      window.removeEventListener("beforeunload", handleUnload);
      void setAdminOnlineStatus(false);
    };
  }, [isAdminClient]);

  useEffect(() => {
    const statusRef = doc(db, "jyc_meta", "adminStatus");
    const unsub = onSnapshot(
      statusRef,
      (snap) => {
        const data = snap.data() as any;
        const online = !!data?.online;

        const ts =
          data?.updatedAt?.toMillis?.() ??
          (typeof data?.updatedAt?.seconds === "number" ? data.updatedAt.seconds * 1000 : 0);

        const fresh = ts > 0 && Date.now() - ts < 120_000;
        setAdminOnline(online && fresh);
      },
      (err) => {
        console.error("listen adminStatus error", err);
        setAdminOnline(false);
      }
    );
    return () => unsub();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handler = (e: Event) => {
      try {
        const ce = e as CustomEvent<{ message?: string }>;
        const safeMsg = sanitizeInitialMessage(ce.detail?.message);
        setIsOpen(true);
        if (safeMsg) setPrefill(safeMsg);
      } catch (err) {
        console.error("jyc-open-chat event error", err);
      }
    };

    window.addEventListener("jyc-open-chat" as any, handler as any);
    return () => {
      window.removeEventListener("jyc-open-chat" as any, handler as any);
    };
  }, []);

  const bubbleLabel = isAdminClient ? texts.adminBubbleLabel : texts.bubbleLabel;

  return (
    <>
      <button
        type="button"
        className="jyc-chat-bubble-button"
        onClick={() => setIsOpen((v) => !v)}
      >
        {bubbleLabel}
        {isAdminClient && hasUnread && (
          <span
            style={{
              display: "inline-block",
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: "#ff4d4f",
              marginLeft: 6,
            }}
          />
        )}
      </button>

      {isOpen &&
        (isAdminClient ? (
          <AdminChatPanel
            texts={texts}
            lang={lang}
            pathname={pathname}
            onHasUnreadChange={setHasUnread}
          />
        ) : (
          <VisitorChatPanel
            texts={texts}
            lang={lang}
            pathname={pathname}
            adminOnline={adminOnline}
            sessionId={sessionId}
            initialMessage={prefill}
            onConsumeInitialMessage={() => setPrefill("")}
            onClose={() => setIsOpen(false)}
            maxMessageLength={800}
            minIntervalMs={2000}
          />
        ))}
    </>
  );
}
