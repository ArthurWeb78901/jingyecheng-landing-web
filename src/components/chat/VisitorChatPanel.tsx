// src/components/chat/VisitorChatPanel.tsx
"use client";

import React, { useEffect, useState } from "react";
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
import {
  ChatTexts,
  getFaqAnswer,
  LeadDraft,
  saveLeadToLocalStorage,
} from "./chatShared";

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

type Props = {
  texts: ChatTexts;
  isEnglish: boolean;
  pathname: string;
  adminOnline: boolean;
  sessionId: string;
  initialMessage?: string;
  onConsumeInitialMessage: () => void;
};

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

  // 初次帶入 prefill
  useEffect(() => {
    if (!initialMessage) return;
    setInput(initialMessage);
    onConsumeInitialMessage();
  }, [initialMessage, onConsumeInitialMessage]);

  // 訂閱本 session 的所有訊息
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
          const from: "user" | "bot" =
            data.from === "user" ? "user" : "bot";
          return {
            id: d.id,
            from,
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

  // 首次進入會話：寫入歡迎訊息（每個 session + 語系只一次）
  useEffect(() => {
    if (!sessionId) return;
    if (typeof window === "undefined") return;

    const key = `jyc_chat_welcome_sent_${sessionId}_${
      isEnglish ? "en" : "zh"
    }`;
    const sent = window.localStorage.getItem(key) === "true";
    const welcome = adminOnline ? texts.welcomeOnline : texts.welcomeOffline;

    if (!sent) {
      void saveChatMessage("bot", welcome, true);
      window.localStorage.setItem(key, "true");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, adminOnline, isEnglish]);

  /** 寫入 Firestore 一則訊息 */
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

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  const text = input.trim();
  if (!text || !sessionId) return;

  setInput("");

  // 訪客訊息寫入 Firestore（未讀）
  void saveChatMessage("user", text, false);

  // 若客服「不在線」，才啟動離線腳本 + FAQ
  if (!adminOnline) {
    handleOfflineFlow(text);
  }
  // 若客服在線：不再自動回覆任何文字，完全交給真人在後台回覆
};


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

    const faq = getFaqAnswer(userText, isEnglish);
    if (faq) replies.push(faq);

    if (replies.length === 0) return;

    for (const r of replies) {
      void saveChatMessage("bot", r, true);
    }
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
        {/* 關閉按鈕由 ChatBubble 控制包裹，所以這裡不再放 × */}
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
