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
  where,
} from "firebase/firestore";
import type { ChatTexts } from "./chatShared";

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
  onClose?: () => void; // 👈 新增：让外层 ChatBubble 可以传收起函数进来
};

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

/** 离线模式：把收集到的客户资料存到 localStorage */
function saveLeadToLocalStorage(lead: LeadDraft) {
  if (typeof window === "undefined") return;

  try {
    const key = "jyc_crm_leads";
    const raw = window.localStorage.getItem(key);
    const list: any[] = raw ? JSON.parse(raw) : [];

    const exists = list.some(
      (item) =>
        item.name === lead.name &&
        item.company === lead.company &&
        item.contact === lead.contact &&
        item.need === lead.need
    );
    if (exists) return;

    const newLead = {
      id: Date.now(),
      ...lead,
      createdAt: new Date().toISOString(),
      source: "chat-bubble",
    };

    list.push(newLead);
    window.localStorage.setItem(key, JSON.stringify(list));
  } catch (err) {
    console.error("saveLeadToLocalStorage error", err);
  }
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

  const bottomRef = useRef<HTMLDivElement | null>(null);

  // 首次打开时如果有预填的讯息（例如“了解某某机组”）
  useEffect(() => {
    if (!initialMessage) return;
    setInput(initialMessage);
    onConsumeInitialMessage();
  }, [initialMessage, onConsumeInitialMessage]);

  // 订阅当前 session 的所有消息（访客 + 机器人 + 管理员）
  useEffect(() => {
    if (!sessionId) return;

    const q = query(
      collection(db, "jyc_chat_messages"),
      where("sessionId", "==", sessionId),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list: Message[] = snap.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            from: data.from === "user" ? "user" : "bot",
            text: data.text || "",
          };
        });
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
    // 这里不要把 adminOnline 放进依赖，否则在线/离线切换会重发
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, isEnglish, pathname, texts.welcomeOnline, texts.welcomeOffline]);

  async function saveChatMessage(
    from: "user" | "bot",
    text: string,
    read: boolean
  ) {
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
          saveLeadToLocalStorage(full);
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

  // 访客发送讯息
// 访客发送讯息
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const text = input.trim();
  if (!text || !sessionId) return;

  // 1) 先在前端把这条消息加到 messages 里（乐观渲染）
  setMessages((prev) => [
    ...prev,
    {
      id: `local-${Date.now()}`, // 临时 id，等 Firestore 回来会被覆盖
      from: "user",
      text,
    },
  ]);

  // 2) 清空输入框
  setInput("");

  // 3) 再真正写入 Firestore（未读）
  await saveChatMessage("user", text, false);

  // 4) 如果管理员在线，就完全交给真人回复，不走自动问答
  if (adminOnline) {
    return;
  }

  // 5) 管理员不在线时，才走离线自动问答 / 资料收集流程
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

      {props.onClose && (
        <button
          type="button"
          className="jyc-chat-close"
          onClick={props.onClose}
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
        />
        <button type="submit">{texts.sendLabel}</button>
      </form>
    </div>
  );
}
