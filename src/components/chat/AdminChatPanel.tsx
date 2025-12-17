// src/components/chat/AdminChatPanel.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import {
  ArchiveMessage,
  archiveChatSessionToLocalStorage,
  ChatTexts,
  LangCode,
} from "./chatShared";

type RemoteMessage = ArchiveMessage & {
  id: string;
  sessionId: string;
  read: boolean;
};

type AdminSession = {
  sessionId: string;
  lastText: string;
  lastAt: number;
  unreadCount: number;
};

type Props = {
  texts: ChatTexts;
  lang: LangCode;
  pathname: string;
  onHasUnreadChange?: (hasUnread: boolean) => void;
};

const MAX_ADMIN_MESSAGE_LENGTH = 2000;
const MIN_ADMIN_INTERVAL_MS = 800;

function sanitizeAdminText(raw: string): string {
  let s = raw.trim();
  s = s.replace(/[\u0000-\u001F\u007F-\u009F]/g, (ch) =>
    ch === "\n" || ch === "\r" || ch === "\t" ? ch : ""
  );
  return s;
}

export function AdminChatPanel({ texts, lang, pathname, onHasUnreadChange }: Props) {
  const [remoteMessages, setRemoteMessages] = useState<RemoteMessage[]>([]);
  const [sessions, setSessions] = useState<AdminSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [adminInput, setAdminInput] = useState("");
  const [liveNoticeSessions, setLiveNoticeSessions] = useState<string[]>([]);

  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [leadCompany, setLeadCompany] = useState("");
  const [leadContact, setLeadContact] = useState("");
  const [leadNeed, setLeadNeed] = useState("");

  const [lastAdminSendAt, setLastAdminSendAt] = useState<number>(0);

  const hasUnread = useMemo(() => sessions.some((s) => s.unreadCount > 0), [sessions]);

  useEffect(() => {
    onHasUnreadChange?.(hasUnread);
  }, [hasUnread, onHasUnreadChange]);

  useEffect(() => {
    const q = query(collection(db, "jyc_chat_messages"), orderBy("createdAt", "asc"));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const msgs: RemoteMessage[] = snap.docs.map((d) => {
          const data = d.data() as any;
          const c = data.createdAt;
          let ts = Date.now();
          if (c && typeof c.toMillis === "function") ts = c.toMillis();
          else if (c && typeof c.seconds === "number") ts = c.seconds * 1000;

          return {
            id: d.id,
            sessionId: data.sessionId || "unknown",
            from: data.from === "user" ? "user" : "bot",
            text: data.text || "",
            createdAt: ts,
            read: !!data.read,
          };
        });

        setRemoteMessages(msgs);

        const grouped: Record<string, AdminSession> = {};
        for (const m of msgs) {
          if (!grouped[m.sessionId]) {
            grouped[m.sessionId] = {
              sessionId: m.sessionId,
              lastText: m.text,
              lastAt: m.createdAt,
              unreadCount: !m.read && m.from === "user" ? 1 : 0,
            };
          } else {
            const g = grouped[m.sessionId];
            if (m.createdAt >= g.lastAt) {
              g.lastAt = m.createdAt;
              g.lastText = m.text;
            }
            if (!m.read && m.from === "user") g.unreadCount += 1;
          }
        }

        const list = Object.values(grouped).sort((a, b) => b.lastAt - a.lastAt);
        setSessions(list);
        setActiveSessionId((prev) => prev || list[0]?.sessionId || null);
      },
      (err) => console.error("listen chat messages error", err)
    );

    return () => unsub();
  }, []);

  const activeMsgs: RemoteMessage[] = useMemo(
    () =>
      activeSessionId == null
        ? []
        : remoteMessages
            .filter((m) => m.sessionId === activeSessionId)
            .sort((a, b) => a.createdAt - b.createdAt),
    [remoteMessages, activeSessionId]
  );

  useEffect(() => {
    if (!activeSessionId) {
      setShowLeadForm(false);
      setLeadName("");
      setLeadCompany("");
      setLeadContact("");
      setLeadNeed("");
      return;
    }
    const userMsgs = remoteMessages.filter(
      (m) => m.sessionId === activeSessionId && m.from === "user"
    );
    const joined = userMsgs.map((m) => m.text).join("\n");
    setLeadNeed(joined);
  }, [activeSessionId, remoteMessages]);

  async function saveChatMessage(from: "user" | "bot", text: string, sessionId: string, read: boolean) {
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
      console.error("admin saveChatMessage error", err);
    }
  }

  async function markSessionRead(sessionId: string) {
    const toUpdate = remoteMessages.filter(
      (m) => m.sessionId === sessionId && !m.read && m.from === "user"
    );

    for (const m of toUpdate) {
      try {
        await updateDoc(doc(db, "jyc_chat_messages", m.id), { read: true });
      } catch (err) {
        console.error("markSessionRead error", err);
      }
    }
  }

  const handleSelectSession = (sid: string) => {
    setActiveSessionId(sid);
    markSessionRead(sid);
  };

  const handleAdminSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSessionId) return;

    let text = sanitizeAdminText(adminInput);
    if (!text) return;

    if (text.length > MAX_ADMIN_MESSAGE_LENGTH) {
      window.alert(texts.errTooLong(MAX_ADMIN_MESSAGE_LENGTH));
      text = text.slice(0, MAX_ADMIN_MESSAGE_LENGTH);
      setAdminInput(text);
      return;
    }

    const now = Date.now();
    if (now - lastAdminSendAt < MIN_ADMIN_INTERVAL_MS) return;
    setLastAdminSendAt(now);

    setAdminInput("");
    void saveChatMessage("bot", text, activeSessionId, true);
  };

  const liveSentForActive =
    activeSessionId != null && liveNoticeSessions.includes(activeSessionId);

  const handleSendTakeoverNotice = () => {
    if (!activeSessionId || liveSentForActive) return;

    const msg =
      lang === "zh"
        ? "现在由真人客服接管，我们会实时回复您的问题。"
        : lang === "hi"
        ? "अब आप लाइव ऑपरेटर से जुड़े हैं। हम रीयल-टाइम में उत्तर देंगे।"
        : lang === "id"
        ? "Sekarang Anda terhubung dengan operator. Kami akan membalas secara real-time."
        : "You are now connected with a live operator. We will respond in real time.";

    void saveChatMessage("bot", msg, activeSessionId, true);
    setLiveNoticeSessions((prev) => (prev.includes(activeSessionId) ? prev : [...prev, activeSessionId]));
  };

  const handleSaveLeadManually = async () => {
    if (!activeSessionId) return;

    try {
      await addDoc(collection(db, "jyc_leads"), {
        sessionId: activeSessionId,
        name: leadName || texts.visitorLabel,
        company: leadCompany || "",
        contact: leadContact || "",
        need: leadNeed || "",
        createdAt: serverTimestamp(),
        lang,
        language: lang,
        source: "admin-manual",
      });

      window.alert(lang === "zh" ? "已保存到客户列表。" : "Lead saved.");
      setShowLeadForm(false);
    } catch (err) {
      console.error("save lead manually error", err);
      window.alert(lang === "zh" ? "保存失败，请稍后重试。" : "Failed to save lead.");
    }
  };

  const handleDeleteSession = async (sid: string | null) => {
    if (!sid) return;

    const ok = window.confirm(
      lang === "zh"
        ? "确定要结束并清除此对话吗？会话记录将归档到客户资料页，同时从聊天室中删除。"
        : "End this conversation, archive it to leads, and delete chat messages?"
    );
    if (!ok) return;

    const msgsForSession = remoteMessages.filter((m) => m.sessionId === sid);

    archiveChatSessionToLocalStorage(
      sid,
      msgsForSession.map((m) => ({ from: m.from, text: m.text, createdAt: m.createdAt })),
      lang
    );

    for (const m of msgsForSession) {
      try {
        await deleteDoc(doc(db, "jyc_chat_messages", m.id));
      } catch (err) {
        console.error("delete chat message error", err);
      }
    }

    setRemoteMessages((prev) => prev.filter((m) => m.sessionId !== sid));
    setSessions((prev) => {
      const next = prev.filter((s) => s.sessionId !== sid);
      setActiveSessionId((cur) => (cur === sid ? next[0]?.sessionId || null : cur));
      return next;
    });
    setLiveNoticeSessions((prev) => prev.filter((x) => x !== sid));
  };

  return (
    <div className="jyc-chat-panel jyc-chat-panel-admin">
      <div className="jyc-chat-header">
        <div>
          <div className="jyc-chat-title">{texts.adminTitle}</div>
          <div className="jyc-chat-status" style={{ fontSize: 11 }}>
            {texts.adminLoggedInHint}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, minHeight: 260, borderTop: "1px solid #eee" }}>
        {/* Sessions */}
        <div
          style={{
            width: 180,
            borderRight: "1px solid #eee",
            padding: "6px 4px",
            fontSize: 12,
            overflowY: "auto",
          }}
        >
          {sessions.length === 0 && (
            <div style={{ color: "#999", padding: "8px 4px" }}>{texts.adminEmpty}</div>
          )}

          {sessions.map((s) => (
            <button
              key={s.sessionId}
              type="button"
              onClick={() => handleSelectSession(s.sessionId)}
              style={{
                width: "100%",
                textAlign: "left",
                border: "none",
                background: s.sessionId === activeSessionId ? "#f0f0f0" : "white",
                borderRadius: 6,
                padding: "6px 6px",
                marginBottom: 4,
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  marginBottom: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>
                  {texts.visitorLabel} {s.sessionId.slice(-4)}
                </span>
                {s.unreadCount > 0 && (
                  <span
                    style={{
                      minWidth: 16,
                      padding: "0 4px",
                      borderRadius: 999,
                      background: "#ff4d4f",
                      color: "#fff",
                      fontSize: 10,
                      textAlign: "center",
                    }}
                  >
                    {s.unreadCount}
                  </span>
                )}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "#666",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                }}
              >
                {s.lastText || texts.noTextPlaceholder}
              </div>
            </button>
          ))}
        </div>

        {/* Messages + input */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div className="jyc-chat-messages">
            {activeMsgs.length === 0 ? (
              <div style={{ fontSize: 12, color: "#999", padding: "8px 4px" }}>
                {sessions.length === 0 ? texts.adminEmpty : texts.adminSelectSessionHint}
              </div>
            ) : (
              activeMsgs.map((m) => (
                <div
                  key={m.id}
                  className={
                    "jyc-chat-message " +
                    (m.from === "user" ? "jyc-chat-message-user" : "jyc-chat-message-bot")
                  }
                >
                  {m.text}
                </div>
              ))
            )}
          </div>

          <form
            onSubmit={handleAdminSend}
            style={{ padding: 8, borderTop: "1px solid #eee", display: "flex", gap: 6 }}
          >
            <input
              type="text"
              value={adminInput}
              onChange={(e) => setAdminInput(e.target.value)}
              placeholder={texts.adminInputPlaceholder}
              disabled={!activeSessionId}
              maxLength={MAX_ADMIN_MESSAGE_LENGTH * 2}
              style={{
                flex: 1,
                padding: "6px 8px",
                borderRadius: 6,
                border: "1px solid #ccc",
                fontSize: 13,
              }}
            />
            <button
              type="submit"
              disabled={!activeSessionId || !adminInput.trim()}
              style={{
                padding: "6px 10px",
                borderRadius: 6,
                border: "none",
                background: !activeSessionId || !adminInput.trim() ? "#ccc" : "#333",
                color: "#fff",
                fontSize: 13,
                cursor: !activeSessionId || !adminInput.trim() ? "not-allowed" : "pointer",
              }}
            >
              {texts.sendLabel}
            </button>
          </form>

          <div style={{ padding: "4px 10px 8px", fontSize: 11, color: "#777" }}>
            <div style={{ marginBottom: 4 }}>{texts.adminHint}</div>

            {activeSessionId && (
              <>
                {showLeadForm && (
                  <div
                    style={{
                      marginBottom: 6,
                      padding: "8px 10px",
                      borderRadius: 6,
                      border: "1px solid #ddd",
                      background: "#fafafa",
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: 11 }}>
                      {lang === "zh" ? "手动添加客人信息" : "Add lead manually"}
                    </div>
                    <input
                      type="text"
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      placeholder={lang === "zh" ? "姓名" : "Name"}
                      style={{ padding: "4px 6px", borderRadius: 4, border: "1px solid #ccc", fontSize: 12 }}
                    />
                    <input
                      type="text"
                      value={leadCompany}
                      onChange={(e) => setLeadCompany(e.target.value)}
                      placeholder={lang === "zh" ? "公司 / 单位" : "Company"}
                      style={{ padding: "4px 6px", borderRadius: 4, border: "1px solid #ccc", fontSize: 12 }}
                    />
                    <input
                      type="text"
                      value={leadContact}
                      onChange={(e) => setLeadContact(e.target.value)}
                      placeholder={lang === "zh" ? "联系方式（手机 / 邮箱）" : "Contact (phone/email)"}
                      style={{ padding: "4px 6px", borderRadius: 4, border: "1px solid #ccc", fontSize: 12 }}
                    />
                    <textarea
                      value={leadNeed}
                      onChange={(e) => setLeadNeed(e.target.value)}
                      placeholder={lang === "zh" ? "需求说明 / 备注" : "Requirement / notes"}
                      rows={3}
                      style={{ padding: "4px 6px", borderRadius: 4, border: "1px solid #ccc", fontSize: 12, resize: "vertical" }}
                    />
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                      <button
                        type="button"
                        onClick={() => setShowLeadForm(false)}
                        style={{
                          borderRadius: 999,
                          border: "1px solid #ccc",
                          padding: "2px 8px",
                          background: "#fff",
                          fontSize: 11,
                          cursor: "pointer",
                        }}
                      >
                        {lang === "zh" ? "取消" : "Cancel"}
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveLeadManually}
                        disabled={!leadName.trim() && !leadCompany.trim() && !leadContact.trim() && !leadNeed.trim()}
                        style={{
                          borderRadius: 999,
                          border: "none",
                          padding: "2px 10px",
                          background:
                            !leadName.trim() && !leadCompany.trim() && !leadContact.trim() && !leadNeed.trim()
                              ? "#ccc"
                              : "#333",
                          color: "#fff",
                          fontSize: 11,
                          cursor:
                            !leadName.trim() && !leadCompany.trim() && !leadContact.trim() && !leadNeed.trim()
                              ? "not-allowed"
                              : "pointer",
                        }}
                      >
                        {lang === "zh" ? "保存" : "Save"}
                      </button>
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => setShowLeadForm((v) => !v)}
                    style={{
                      borderRadius: 999,
                      border: "1px solid #333",
                      padding: "2px 8px",
                      fontSize: 11,
                      background: "#fff",
                      color: "#333",
                      cursor: "pointer",
                    }}
                  >
                    {lang === "zh" ? "手动添加客人信息" : "Add lead"}
                  </button>

                  <button
                    type="button"
                    onClick={handleSendTakeoverNotice}
                    disabled={liveSentForActive}
                    style={{
                      borderRadius: 999,
                      border: "1px solid #333",
                      padding: "2px 8px",
                      fontSize: 11,
                      background: liveSentForActive ? "#f0f0f0" : "#fff",
                      color: "#333",
                      cursor: liveSentForActive ? "default" : "pointer",
                    }}
                  >
                    {liveSentForActive
                      ? lang === "zh"
                        ? "已通知真人接管"
                        : "Live notified"
                      : lang === "zh"
                      ? "真人接管提示"
                      : "Notify live"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteSession(activeSessionId)}
                    style={{
                      border: "none",
                      background: "transparent",
                      color: "#999",
                      textDecoration: "underline",
                      fontSize: 11,
                      cursor: "pointer",
                    }}
                  >
                    {lang === "zh" ? "结束并清除此对话" : "Close & clear chat"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
