// src/components/chat/VisitorChatPanel.tsx
"use client";

import React, { useEffect, useState } from "react";
import {
  ChatTexts,
  InfoStage,
  LeadDraft,
  Message,
  getFaqAnswer,
  saveLeadToLocalStorage,
  addChatMessage,
  adminAckKey,
  welcomeKey,
  nextMessageId,
} from "./chatShared";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";

type Props = {
  texts: ChatTexts;
  isEnglish: boolean;
  pathname: string;
  adminOnline: boolean;
  sessionId: string;
  initialMessage: string;
  onConsumeInitialMessage: () => void;
};

export function VisitorChatPanel({
  texts,
  isEnglish,
  pathname,
  adminOnline,
  sessionId,
  initialMessage,
  onConsumeInitialMessage,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [infoStage, setInfoStage] = useState<InfoStage>("none");
  const [leadDraft, setLeadDraft] = useState<LeadDraft>({
    name: "",
    company: "",
    contact: "",
    need: "",
  });
  const [adminAckSent, setAdminAckSent] = useState(false);

  // 初次载入预填文字（从其他按钮跳转过来）
  useEffect(() => {
    if (initialMessage) {
      setInput(initialMessage);
      onConsumeInitialMessage();
    }
  }, [initialMessage, onConsumeInitialMessage]);

  // 读取是否已发过自动确认
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!sessionId) return;
    const key = adminAckKey(sessionId);
    const sent = window.localStorage.getItem(key) === "true";
    setAdminAckSent(sent);
  }, [sessionId]);

  // 订阅当前 session 所有讯息
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
          const from: "user" | "bot" = data.from === "user" ? "user" : "bot";
          return {
            id: nextMessageId(),
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

  // 每个 session / 语言只发一次欢迎讯息
  useEffect(() => {
    if (!sessionId) return;
    if (typeof window === "undefined") return;

    const key = welcomeKey(sessionId, isEnglish);
    const sent = window.localStorage.getItem(key) === "true";
    const welcome = adminOnline ? texts.welcomeOnline : texts.welcomeOffline;

    if (!sent) {
      void addChatMessage("bot", welcome, sessionId, pathname, true);
      window.localStorage.setItem(key, "true");
    }
  }, [adminOnline, sessionId, isEnglish, pathname, texts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || !sessionId) return;

    setInput("");
    // 访客讯息
    void addChatMessage("user", text, sessionId, pathname, false);

    // 在线：只在第一次自动回一条确认，后面完全由真人回
    if (adminOnline) {
      if (!adminAckSent) {
        void addChatMessage("bot", texts.adminReply, sessionId, pathname, true);
        setAdminAckSent(true);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(adminAckKey(sessionId), "true");
        }
      }
      return;
    }

    // 离线：自动问答
    handleOfflineFlow(text);
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

    for (const r of replies) {
      void addChatMessage("bot", r, sessionId, pathname, true);
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
