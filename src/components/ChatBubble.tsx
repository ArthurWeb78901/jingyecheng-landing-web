// src/components/ChatBubble.tsx
"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import {
  zhTexts,
  enTexts,
  ChatTexts,
  getOrCreateSessionId,
} from "./chat/chatShared";
import { VisitorChatPanel } from "./chat/VisitorChatPanel";
import { AdminChatPanel } from "./chat/AdminChatPanel";
import { setAdminOnlineStatus } from "./chat/adminStatus"; // ✅ 新增

const MAX_INITIAL_MESSAGE_LENGTH = 500;

/** 專門處理外部觸發的預填訊息，避免惡意或超長內容 */
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
  const isEnglish = pathname === "/en" || pathname.startsWith("/en/");
  const texts: ChatTexts = isEnglish ? enTexts : zhTexts;

  const [isOpen, setIsOpen] = useState(false);

  // 是否是「正在使用後台的瀏覽器」
  const [isAdminClient, setIsAdminClient] = useState(false);

  // Firestore 上的客服在線狀態（給所有訪客共用）
  const [adminOnline, setAdminOnline] = useState(false);

  const [sessionId, setSessionId] = useState("");
  const [hasUnread, setHasUnread] = useState(false);
  const [prefill, setPrefill] = useState("");

  // 生成 / 取得訪客 sessionId
  useEffect(() => {
    if (typeof window === "undefined") return;
    setSessionId(getOrCreateSessionId());
  }, []);

  // 檢查本機是不是後台登入中的瀏覽器（只用來決定顯示 AdminChatPanel）
  useEffect(() => {
    if (typeof window === "undefined") return;
    const flag = window.localStorage.getItem("jyc_admin_logged_in") === "true";
    setIsAdminClient(flag);
  }, []);

  // ✅ Admin presence：只有 admin client 才寫 online + 心跳；離開時嘗試寫 offline
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isAdminClient) return; // ✅ 访客绝对不能写 adminStatus

    void setAdminOnlineStatus(true);

    const timer = window.setInterval(() => {
      void setAdminOnlineStatus(true); // 刷新 updatedAt（心跳）
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

  // 🔄 監聽 Firestore 的 adminStatus，決定「客服是否在線」
  useEffect(() => {
    const statusRef = doc(db, "jyc_meta", "adminStatus");
    const unsub = onSnapshot(
      statusRef,
      (snap) => {
        const data = snap.data() as any;

        const online = !!data?.online;

        // ✅ 过期保护：超过 2 分钟没心跳就当离线（避免卡在线）
        const ts =
          data?.updatedAt?.toMillis?.() ??
          (typeof data?.updatedAt?.seconds === "number"
            ? data.updatedAt.seconds * 1000
            : 0);

        const fresh = ts > 0 && Date.now() - ts < 120_000;

        setAdminOnline(online && fresh);
      },
      (err) => {
        console.error("listen adminStatus error", err);
        // 出錯時保守處理：當作離線，讓訪客跑離線腳本
        setAdminOnline(false);
      }
    );
    return () => unsub();
  }, []);

  // 其它地方觸發開啟聊天並預填內容
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
            isEnglish={isEnglish}
            pathname={pathname}
            onHasUnreadChange={setHasUnread}
          />
        ) : (
          <VisitorChatPanel
            texts={texts}
            isEnglish={isEnglish}
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
