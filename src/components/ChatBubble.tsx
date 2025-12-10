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
      const ce = e as CustomEvent<{ message?: string }>;
      const msg = ce.detail?.message || "";
      setIsOpen(true);
      if (msg) setPrefill(msg);
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
            onClose={() => setIsOpen(false)}  // 👈 收起聊天面板
          />
        ))}
    </>
  );
}
