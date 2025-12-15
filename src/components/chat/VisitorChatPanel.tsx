// src/components/chat/VisitorChatPanel.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import type { ChatTexts } from "./chatShared";
import { saveLeadToLocalStorage } from "./chatShared"; // ✅ 改：用 chatShared 统一写 Firestore

type Message = {
  id: string;
  from: "user" | "bot";
  text: string;
};

type InfoStage =
  | "none"
  | "ask-name"
  | "ask-company"
  | "ask-contact"
  | "ask-need"
  | "done";

type LeadDraft = {
  name: string;
  company: string;
  contact: string;
  need: string;
};

type Props = {
  texts: ChatTexts;
  isEnglish: boolean;
  pathname: string;
  adminOnline: boolean;
  sessionId: string;
  initialMessage: string;
  onConsumeInitialMessage: () => void;
  onClose?: () => void;

  /** 單則訊息最大長度（可由 ChatBubble 傳入），預設 800 */
  maxMessageLength?: number;
  /** 兩次送出之間的最短間隔（毫秒），預設 2000 ms */
  minIntervalMs?: number;
};

const DEFAULT_MAX_MESSAGE_LENGTH = 800;
const DEFAULT_MIN_INTERVAL_MS = 2000;

/** FAQ 关键字应答（用当前语言文案） */
function getFaqAnswer(text: string, isEnglish: boolean, texts: ChatTexts) {
  const t = text.toLowerCase();

  if (
    t.includes("报价") ||
    t.includes("价格") ||
    t.includes("price") ||
    t.includes("quote") ||
    t.includes("quotation")
  ) {
    return texts.faqPrice;
  }
  if (
    t.includes("交期") ||
    t.includes("交货") ||
    t.includes("交付") ||
    t.includes("delivery") ||
    t.includes("lead time")
  ) {
    return texts.faqDelivery;
  }
  if (
    t.includes("安装") ||
    t.includes("调试") ||
    t.includes("售后") ||
    t.includes("服务") ||
    t.includes("installation") ||
    t.includes("commissioning") ||
    t.includes("service") ||
    t.includes("after-sales")
  ) {
    return texts.faqService;
  }
  if (
    t.includes("改造") ||
    t.includes("升级") ||
    t.includes("技改") ||
    t.includes("upgrade") ||
    t.includes("revamp") ||
    t.includes("modernization")
  ) {
    return texts.faqUpgrade;
  }
  return null;
}

/** 清洗使用者輸入（保留換行 / tab，拿掉其他控制字元） */
function sanitizeUserText(raw: string): string {
  let s = raw.trim();
  s = s.replace(/[\u0000-\u001F\u007F-\u009F]/g, (ch) =>
    ch === "\n" || ch === "\r" || ch === "\t" ? ch : ""
  );
  return s;
}

export function VisitorChatPanel(props: Props) {
  const {
    texts,
    isEnglish,
    pathname,
    adminOnline,
    sessionId,
    initialMessage,
    onConsumeInitialMessage,
    onClose,
    maxMessageLength = DEFAULT_MAX_MESSAGE_LENGTH,
    minIntervalMs = DEFAULT_MIN_INTERVAL_MS,
  } = props;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [infoStage, setInfoStage] = useState<InfoStage>("none");
  const [leadDraft, setLeadDraft] = useState<LeadDraft>({
    name: "",
    company: "",
    contact: "",
    need: "",
  });

  const [lastSendAt, setLastSendAt] = useState<number>(0);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  // 首次打开时如果有预填的讯息（例如“了解某某机组”）
  useEffect(() => {
    if (!initialMessage) return;
    const safe = sanitizeUserText(initialMessage).slice(0, maxMessageLength);
    setInput(safe);
    onConsumeInitialMessage();
  }, [initialMessage, onConsumeInitialMessage, maxMessageLength]);

  // ✅ 订阅所有消息，再用 sessionId 在前端过滤
  useEffect(() => {
    if (!sessionId) return;

    const q = query(
      collection(db, "jyc_chat_messages"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list: Message[] = snap.docs
          .map((d) => {
            const data = d.data() as any;
            if (!data.sessionId || data.sessionId !== sessionId) return null;
            return {
              id: d.id,
              from: data.from === "user" ? "user" : "bot",
              text: data.text || "",
            } as Message;
          })
          .filter(Boolean) as Message[];

        setMessages(list);
      },
      (err) => {
        console.error("listen visitor chat error", err);
      }
    );

    return () => unsub();
  }, [sessionId]);

  // 每次 messages 变化，自动滚到底部
  useEffect(() => {
    if (!bottomRef.current) return;
    bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  // 欢迎语：每个 session + 语言只发一次
  useEffect(() => {
    if (!sessionId) return;
    if (typeof window === "undefined") return;

    const key = `jyc_chat_welcome_sent_${sessionId}_${isEnglish ? "en" : "zh"}`;
    const sent = window.localStorage.getItem(key) === "true";
    if (sent) return;

    const welcome = adminOnline ? texts.welcomeOnline : texts.welcomeOffline;

    (async () => {
      try {
        await addDoc(collection(db, "jyc_chat_messages"), {
          sessionId,
          from: "bot",
          text: welcome,
          pathname,
          createdAt: serverTimestamp(),
          read: true,
        });
        window.localStorage.setItem(key, "true");
      } catch (err) {
        console.error("send welcome error", err);
      }
    })();
    // 不要把 adminOnline 放依赖里，避免切换状态重复发
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, isEnglish, pathname, texts.welcomeOnline, texts.welcomeOffline]);

  async function saveChatMessage(from: "user" | "bot", text: string, read: boolean) {
    if (!sessionId) return;
    try {
      await addDoc(collection(db, "jyc_chat_messages"), {
        sessionId,
        from,
        text,
        pathname,
        createdAt: serverTimestamp(),
        read,
      });
    } catch (err) {
      console.error("saveChatMessage error", err);
    }
  }

  // 离线模式自动问答 + 资料收集
  const handleOfflineFlow = (userText: string) => {
    if (!sessionId) return;

    const replies: string[] = [];

    switch (infoStage) {
      case "none":
        replies.push(texts.askName);
        setInfoStage("ask-name");
        break;

      case "ask-name":
        setLeadDraft((prev) => ({ ...prev, name: userText }));
        replies.push(texts.askCompany(userText));
        setInfoStage("ask-company");
        break;

      case "ask-company":
        setLeadDraft((prev) => ({ ...prev, company: userText }));
        replies.push(texts.askContact);
        setInfoStage("ask-contact");
        break;

      case "ask-contact":
        setLeadDraft((prev) => ({ ...prev, contact: userText }));
        replies.push(texts.askNeed);
        setInfoStage("ask-need");
        break;

      case "ask-need":
        setLeadDraft((prev) => {
          const full: LeadDraft = { ...prev, need: userText };

          // ✅ 关键修复：写入 Firestore jyc_leads（source=offline-bot）
          saveLeadToLocalStorage(full, isEnglish);

          return full;
        });
        replies.push(texts.afterSaved);
        setInfoStage("done");
        break;

      case "done":
        replies.push(texts.afterDone);
        break;

      default:
        break;
    }

    const faq = getFaqAnswer(userText, isEnglish, texts);
    if (faq) replies.push(faq);

    if (replies.length === 0) return;

    for (const r of replies) {
      void saveChatMessage("bot", r, true);
    }
  };

  // 访客发送讯息（含長度 / 頻率限制）
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId) return;

    let text = sanitizeUserText(input);
    if (!text) return;

    // 長度檢查
    if (text.length > maxMessageLength) {
      if (typeof window !== "undefined") {
        window.alert(
          isEnglish
            ? `Your message is too long. Please keep it within ${maxMessageLength} characters.`
            : `单则讯息过长，请控制在 ${maxMessageLength} 个字以内。`
        );
      }
      text = text.slice(0, maxMessageLength);
      setInput(text);
      return;
    }

    // 發送頻率限制
    const now = Date.now();
    if (now - lastSendAt < minIntervalMs) {
      if (typeof window !== "undefined") {
        window.alert(
          isEnglish
            ? "You are sending messages too fast. Please wait a moment."
            : "讯息发送过于频繁，请稍后再试。"
        );
      }
      return;
    }

    setInput("");
    setLastSendAt(now);

    await saveChatMessage("user", text, false);

    // 管理员在线就交给真人回复，不走自动脚本
    if (adminOnline) return;

    // 管理员不在线时才走离线流程
    handleOfflineFlow(text);
  };

  return (
    <div className="jyc-chat-panel">
      <div className="jyc-chat-header">
        <div>
          <div className="jyc-chat-title">{texts.title}</div>
          <div className="jyc-chat-status">
            {isEnglish ? "Status: " : "状态："}
            {adminOnline ? texts.statusOnline : texts.statusOffline}
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            className="jyc-chat-close"
            onClick={onClose}
            aria-label={isEnglish ? "Close chat" : "收起对话"}
          >
            ×
          </button>
        )}
      </div>

      <div className="jyc-chat-messages">
        {messages.map((m) => (
          <div
            key={m.id}
            className={
              m.from === "user"
                ? "jyc-chat-message jyc-chat-message-user"
                : "jyc-chat-message jyc-chat-message-bot"
            }
          >
            {m.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form className="jyc-chat-input-row" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder={texts.inputPlaceholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={maxMessageLength * 2}
        />
        <button type="submit">{texts.sendLabel}</button>
      </form>
    </div>
  );
}
