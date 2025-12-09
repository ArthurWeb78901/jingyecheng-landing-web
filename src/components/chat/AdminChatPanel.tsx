// src/components/chat/AdminChatPanel.tsx
"use client";

import React, { useEffect, useState } from "react";
import {
  ChatTexts,
  RemoteMessage,
  AdminSession,
  addChatMessage,
} from "./chatShared";
import { db } from "@/lib/firebase";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

type Props = {
  texts: ChatTexts;
  isEnglish: boolean;
  pathname: string;
  onHasUnreadChange: (val: boolean) => void;
};

export function AdminChatPanel({
  texts,
  isEnglish,
  pathname,
  onHasUnreadChange,
}: Props) {
  const [remoteMessages, setRemoteMessages] = useState<RemoteMessage[]>([]);
  const [sessions, setSessions] = useState<AdminSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [adminInput, setAdminInput] = useState("");
  const [liveNotified, setLiveNotified] = useState<string[]>([]);

  // 监听所有访客消息
  useEffect(() => {
    const q = query(
      collection(db, "jyc_chat_messages"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const msgs: RemoteMessage[] = snap.docs.map((d) => {
          const data = d.data() as any;
          const c = data.createdAt;
          let ts = Date.now();
          if (c && typeof c.toMillis === "function") {
            ts = c.toMillis();
          } else if (c && typeof c.seconds === "number") {
            ts = c.seconds * 1000;
          }
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
            if (!m.read && m.from === "user") {
              g.unreadCount += 1;
            }
          }
        }

        const list = Object.values(grouped).sort(
          (a, b) => b.lastAt - a.lastAt
        );
        setSessions(list);

        const hasUnread = list.some((s) => s.unreadCount > 0);
        onHasUnreadChange(hasUnread);

        setActiveSessionId((prev) => prev || list[0]?.sessionId || null);
      },
      (err) => {
        console.error("listen chat messages error", err);
      }
    );

    return () => unsub();
  }, [onHasUnreadChange]);

  async function markSessionRead(sessionId: string) {
    const toUpdate = remoteMessages.filter(
      (m) => m.sessionId === sessionId && !m.read && m.from === "user"
    );

    for (const m of toUpdate) {
      try {
        await updateDoc(doc(db, "jyc_chat_messages", m.id), {
          read: true,
        });
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
    const text = adminInput.trim();
    if (!text || !activeSessionId) return;

    setAdminInput("");
    void addChatMessage("bot", text, activeSessionId, pathname, true);
  };

  const handleDeleteSession = async (sid: string) => {
    if (!sid) return;
    if (typeof window !== "undefined") {
      const ok = window.confirm(
        isEnglish
          ? "Close and delete this conversation? This cannot be undone."
          : "确定要结束并清除此对话吗？此操作无法恢复。"
      );
      if (!ok) return;
    }

    try {
      const q = query(
        collection(db, "jyc_chat_messages"),
        where("sessionId", "==", sid)
      );
      const snap = await getDocs(q);
      for (const d of snap.docs) await deleteDoc(d.ref);
      setActiveSessionId((prev) => (prev === sid ? null : prev));
    } catch (err) {
      console.error("delete session error", err);
    }
  };

  const handleSendTakeoverNotice = () => {
    if (!activeSessionId) return;
    if (liveNotified.includes(activeSessionId)) return;

    void addChatMessage(
      "bot",
      texts.liveTakeoverNotice,
      activeSessionId,
      pathname,
      true
    );
    setLiveNotified((prev) =>
      prev.includes(activeSessionId) ? prev : [...prev, activeSessionId]
    );
  };

  const activeMsgs =
    activeSessionId == null
      ? []
      : remoteMessages
          .filter((m) => m.sessionId === activeSessionId)
          .sort((a, b) => a.createdAt - b.createdAt);

  const liveSentForActive =
    activeSessionId != null && liveNotified.includes(activeSessionId);

  return (
    <div
      className="jyc-chat-panel"
      style={{ width: 420, maxWidth: "90vw" }} // 管理端宽一点
    >
      <div className="jyc-chat-header">
        <div>
          <div className="jyc-chat-title">{texts.adminTitle}</div>
          <div className="jyc-chat-status" style={{ fontSize: 11 }}>
            {isEnglish
              ? "You are logged in as admin. New visitor messages will appear here."
              : "您目前已登入后台，新访客留言会出现在此视窗中。"}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flex: 1,
          minHeight: 260,
          borderTop: "1px solid #eee",
        }}
      >
        {/* 左边：会话列表 */}
        <div
          style={{
            width: 160,
            borderRight: "1px solid #eee",
            padding: "6px 4px",
            fontSize: 12,
            overflowY: "auto",
          }}
        >
          {sessions.length === 0 && (
            <div style={{ color: "#999", padding: "8px 4px" }}>
              {texts.adminEmpty}
            </div>
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
                background:
                  s.sessionId === activeSessionId ? "#f0f0f0" : "white",
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
                  {isEnglish ? "Visitor" : "访客"} {s.sessionId.slice(-4)}
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
                {s.lastText || (isEnglish ? "(no text)" : "（无内容）")}
              </div>
            </button>
          ))}
        </div>

        {/* 右侧：消息 + 输入区 */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div className="jyc-chat-messages">
            {activeMsgs.length === 0 ? (
              <div
                style={{
                  fontSize: 12,
                  color: "#999",
                  padding: "8px 4px",
                }}
              >
                {sessions.length === 0
                  ? texts.adminEmpty
                  : isEnglish
                  ? "Select a visitor session on the left."
                  : "请在左侧选择一位访客的会话。"}
              </div>
            ) : (
              activeMsgs.map((m) => (
                <div
                  key={m.id}
                  className={
                    "jyc-chat-message " +
                    (m.from === "user"
                      ? "jyc-chat-message-user"
                      : "jyc-chat-message-bot")
                  }
                >
                  {m.text}
                </div>
              ))
            )}
          </div>

          <form
            onSubmit={handleAdminSend}
            style={{
              padding: 8,
              borderTop: "1px solid #eee",
              display: "flex",
              gap: 6,
            }}
          >
            <input
              type="text"
              value={adminInput}
              onChange={(e) => setAdminInput(e.target.value)}
              placeholder={texts.adminInputPlaceholder}
              disabled={!activeSessionId}
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
                background:
                  !activeSessionId || !adminInput.trim() ? "#ccc" : "#333",
                color: "#fff",
                fontSize: 13,
                cursor:
                  !activeSessionId || !adminInput.trim()
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {texts.sendLabel}
            </button>
          </form>

          <div
            style={{
              padding: "4px 10px 6px",
              fontSize: 11,
              color: "#777",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span>{texts.adminHint}</span>

            {activeSessionId && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  whiteSpace: "nowrap",
                }}
              >
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
                    ? isEnglish
                      ? "Live mode notified"
                      : "已通知真人接管"
                    : isEnglish
                    ? "Notify live operator"
                    : "真人接管提示"}
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
                  {isEnglish ? "Close & clear chat" : "结束并清除此对话"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
