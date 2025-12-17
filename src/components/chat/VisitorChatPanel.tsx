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
import type { ChatTexts, LangCode } from "./chatShared";
import { saveLeadToLocalStorage, getFaqAnswer } from "./chatShared";

type Message = {
  id: string;
  from: "user" | "bot";
  text: string;
};

type InfoStage = "none" | "ask-name" | "ask-company" | "ask-contact" | "ask-need" | "done";

type LeadDraft = {
  name: string;
  company: string;
  contact: string;
  need: string;
};

type Props = {
  texts: ChatTexts;
  lang: LangCode;
  pathname: string;
  adminOnline: boolean;
  sessionId: string;
  initialMessage: string;
  onConsumeInitialMessage: () => void;
  onClose?: () => void;

  maxMessageLength?: number;
  minIntervalMs?: number;
};

const DEFAULT_MAX_MESSAGE_LENGTH = 800;
const DEFAULT_MIN_INTERVAL_MS = 2000;

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
    lang,
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

  useEffect(() => {
    if (!initialMessage) return;
    const safe = sanitizeUserText(initialMessage).slice(0, maxMessageLength);
    setInput(safe);
    onConsumeInitialMessage();
  }, [initialMessage, onConsumeInitialMessage, maxMessageLength]);

  useEffect(() => {
    if (!sessionId) return;

    const q = query(collection(db, "jyc_chat_messages"), orderBy("createdAt", "asc"));

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

  useEffect(() => {
    if (!bottomRef.current) return;
    bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  useEffect(() => {
    if (!sessionId) return;
    if (typeof window === "undefined") return;

    const key = `jyc_chat_welcome_sent_${sessionId}_${lang}`;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, lang, pathname, texts.welcomeOnline, texts.welcomeOffline]);

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
          saveLeadToLocalStorage(full, lang);
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

    const faq = getFaqAnswer(userText, lang, texts);
    if (faq) replies.push(faq);

    for (const r of replies) {
      void saveChatMessage("bot", r, true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId) return;

    let text = sanitizeUserText(input);
    if (!text) return;

    if (text.length > maxMessageLength) {
      window.alert(texts.errTooLong(maxMessageLength));
      text = text.slice(0, maxMessageLength);
      setInput(text);
      return;
    }

    const now = Date.now();
    if (now - lastSendAt < minIntervalMs) {
      window.alert(texts.errTooFast);
      return;
    }

    setInput("");
    setLastSendAt(now);

    await saveChatMessage("user", text, false);

    if (adminOnline) return;
    handleOfflineFlow(text);
  };

  return (
    <div className="jyc-chat-panel">
      <div className="jyc-chat-header">
        <div>
          <div className="jyc-chat-title">{texts.title}</div>
          <div className="jyc-chat-status">
            {texts.statusPrefix}
            {adminOnline ? texts.statusOnline : texts.statusOffline}
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            className="jyc-chat-close"
            onClick={onClose}
            aria-label={texts.closeAriaLabel}
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
