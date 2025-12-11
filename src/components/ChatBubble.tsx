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

const MAX_INITIAL_MESSAGE_LENGTH = 500;

/** 專門處理外部觸發的預填訊息，避免惡意或超長內容 */
function sanitizeInitialMessage(raw: unknown): string {
  if (typeof raw !== "string") return "";

  // 去掉頭尾空白
  let s = raw.trim();

  // 去掉不可見控制字元（換行保留，真的很髒的字符移除）
  s = s.replace(/[\u0000-\u001F\u007F-\u009F]/g, (ch) =>
    ch === "\n" || ch === "\r" || ch === "\t" ? ch : ""
  );

  // 限制長度，防止一次塞入巨量文字
  if (s.length > MAX_INITIAL_MESSAGE_LENGTH) {
    s = s.slice(0, MAX_INITIAL_MESSAGE_LENGTH);
  }

  return s;
}

export function ChatBubble() {
  const pathname = usePathname() || "/";
  const isEnglish = pathname.startsWith("/en");
  const texts: ChatTexts = isEnglish ? enTexts : zhTexts;

  const [isOpen, setIsOpen] = useState(false);
  const [adminOnline, setAdminOnline] = useState(false);
  const [isAdminClient, setIsAdminClient] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [hasUnread, setHasUnread] = useState(false);
  const [prefill, setPrefill] = useState("");

  // 访客 sessionId
  useEffect(() => {
    if (typeof window === "undefined") return;
    setSessionId(getOrCreateSessionId());
  }, []);

  // 判断当前浏览器是否后台登入
  useEffect(() => {
    if (typeof window === "undefined") return;
    const flag = window.localStorage.getItem("jyc_admin_logged_in") === "true";
    setIsAdminClient(flag);
    if (flag) setAdminOnline(true);
  }, []);

  // Firestore 在线状态
  useEffect(() => {
    const statusRef = doc(db, "jyc_meta", "adminStatus");
    const unsub = onSnapshot(
      statusRef,
      (snap) => {
        const data = snap.data() as any;
        if (data && typeof data.online === "boolean") {
          // 一旦本地是 true 就保持 true（避免误判掉线）
          setAdminOnline((prev) => prev || data.online);
        }
      },
      (err) => {
        console.error("listen adminStatus error", err);
      }
    );
    return () => unsub();
  }, []);

  // 其它地方触发打开聊天（并预填文字）
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
      {/* 浮动按钮 */}
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

      {/* 面板 */}
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
            onClose={() => setIsOpen(false)} // 👈 收起聊天面板
            // 👉 下面兩個是建議你在 VisitorChatPanel 裡實際用到的安全參數
            maxMessageLength={800}
            minIntervalMs={2000}
          />
        ))}
    </>
  );
}
