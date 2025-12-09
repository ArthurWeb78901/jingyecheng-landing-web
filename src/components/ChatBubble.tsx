// src/components/ChatBubble.tsx
"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

type Message = {
  id: number;
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

type RemoteMessage = {
  id: string;
  sessionId: string;
  from: "user" | "bot";
  text: string;
  createdAt: number;
  read: boolean;
};

type AdminSession = {
  sessionId: string;
  lastText: string;
  lastAt: number;
  unreadCount: number;
};

let messageId = 1;

/** 文案表：中文 */
const zhTexts = {
  bubbleLabel: "在线助手",
  adminBubbleLabel: "客服讯息",
  title: "在线咨询",
  adminTitle: "访客留言",
  statusOnline: "客服在线（可由专人回复）",
  statusOffline: "自动应答中（离线收集客户资料）",
  welcomeOnline:
    "您好，这里是太原精业城重工设备在线助手。目前客服在线，您可以直接留下问题，我们会尽快安排专人与您联系并回复。",
  welcomeOffline:
    "您好，这里是太原精业城重工设备在线助手。目前客服暂不在线，我会先根据常见问题为您解答，并协助记录您的基本资讯方便后续联系。",
  adminReply:
    "感谢您的留言，我们已收到您的问题，稍后将由专人与您联系并进一步沟通细节。",
  askName: "为了方便后续联系，请问怎么称呼您？",
  askCompany: (name: string) =>
    `好的，${name} 您好。请问贵公司或单位名称是？（若是个人咨询也可以略过）`,
  askContact: "了解，谢谢。方便留一个联络方式吗？例如手机号码或 Email。",
  askNeed:
    "收到联络方式，请您简单说明目前的需求或计划中的设备项目，我们会据此安排专人与您联系。",
  afterSaved:
    "感谢您的详细说明，我们已经记录了您的称呼、公司、联络方式与需求内容，会尽快由相关人员与您联系。",
  afterDone: "您的需求我们已经记录在案，如有补充也欢迎继续留言。",
  inputPlaceholder: "请输入您的问题或需求…",
  sendLabel: "发送",
  faqPrice:
    "关于设备报价，我们会根据具体机组配置、产量要求与现场条件进行评估，请简单说明计划产线规模与产品规格，方便我们提供初步报价区间。",
  faqDelivery:
    "交期会依机组规模与现场条件而有所不同，一般整线机组从合约确认到交货约需数个月，具体时间需依项目评估后确认。",
  faqService:
    "我们可提供设备安装指导、调试、操作培训以及后续售后服务，具体服务内容可依项目合约约定。",
  faqUpgrade:
    "若是现有产线改造或升级，我们通常会先了解现有设备型号与工况，再评估局部改造或整线优化的方案与预算。",
  adminEmpty: "目前尚无访客留言。",
  adminHint:
    "您可以在下方输入回复内容，讯息会即时发送给该访客并显示在对方网页上。",
  adminInputPlaceholder: "请输入要回复给访客的内容…",
};

/** 文案表：英文 */
const enTexts = {
  bubbleLabel: "Online Assistant",
  adminBubbleLabel: "Inbox",
  title: "Online Inquiry",
  adminTitle: "Visitor Inquiries",
  statusOnline: "Operator online (live reply available)",
  statusOffline: "Auto reply (collecting basic lead info)",
  welcomeOnline:
    "Hello, this is Taiyuan Jingyecheng Heavy Equipment online assistant. Our staff is currently online. You may leave your questions here and we will follow up as soon as possible.",
  welcomeOffline:
    "Hello, this is Taiyuan Jingyecheng Heavy Equipment online assistant. Our staff is currently offline. I will answer common questions first and help record your basic information for follow-up.",
  adminReply:
    "Thank you for your message. We have received your inquiry and our sales team will contact you shortly for further discussion.",
  askName: "To better follow up, may I have your name?",
  askCompany: (name: string) =>
    `Nice to meet you, ${name}. May I know your company or organization? (You may skip this if it is a personal inquiry.)`,
  askContact:
    "Got it, thank you. Please leave a contact method, such as phone number or email.",
  askNeed:
    "Thank you. Please briefly describe your production line or equipment requirements so that we can arrange a sales engineer to contact you.",
  afterSaved:
    "Thank you for the detailed information. We have recorded your name, company, contact details and requirements, and will get back to you as soon as possible.",
  afterDone:
    "Your requirements have been recorded. If you have any additional questions, feel free to leave another message.",
  inputPlaceholder: "Please enter your question or requirements…",
  sendLabel: "Send",
  faqPrice:
    "Regarding pricing, we will evaluate according to the specific line configuration, capacity requirements and site conditions. Please briefly describe the planned capacity and product size range so we can provide an initial price range.",
  faqDelivery:
    "Delivery time depends on the scale of the line and on-site conditions. For a complete mill line, it usually takes several months from contract confirmation to delivery. The exact schedule will be confirmed after technical evaluation.",
  faqService:
    "We can provide installation supervision, commissioning, operator training and after-sales service. Detailed service scope can be defined in the project contract.",
  faqUpgrade:
    "For upgrading or revamping existing lines, we normally review the current equipment and operating conditions first, then propose partial modification or full optimization方案 along with a budget estimate.",
  adminEmpty: "No visitor inquiries yet.",
  adminHint:
    "Type your reply below. Messages will be sent to the visitor in real time and displayed on their page.",
  adminInputPlaceholder: "Type your reply to the visitor…",
};

// 简单 FAQ 关键字应答（根据当前语言返回对应文本）
function getFaqAnswer(text: string, isEnglish: boolean): string | null {
  const t = text.toLowerCase();
  const txt = isEnglish ? enTexts : zhTexts;

  if (
    t.includes("报价") ||
    t.includes("价格") ||
    t.includes("price") ||
    t.includes("quote") ||
    t.includes("quotation")
  ) {
    return txt.faqPrice;
  }
  if (
    t.includes("交期") ||
    t.includes("交货") ||
    t.includes("交付") ||
    t.includes("delivery") ||
    t.includes("lead time")
  ) {
    return txt.faqDelivery;
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
    return txt.faqService;
  }
  if (
    t.includes("改造") ||
    t.includes("升级") ||
    t.includes("技改") ||
    t.includes("upgrade") ||
    t.includes("revamp") ||
    t.includes("modernization")
  ) {
    return txt.faqUpgrade;
  }

  return null;
}

// 离线模式下，把收集到的客户资料存到 localStorage，当成简易 CRM 线索
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

// 给每个访客一个 sessionId，方便后台区分不同对话
function getOrCreateSessionId() {
  if (typeof window === "undefined") return "";
  const KEY = "jyc_chat_session_id";
  let id = window.localStorage.getItem(KEY);
  if (!id) {
    id = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    window.localStorage.setItem(KEY, id);
  }
  return id;
}

export function ChatBubble() {
  const pathname = usePathname() || "/";
  const isEnglish = pathname.startsWith("/en");
  const texts = isEnglish ? enTexts : zhTexts;

  const [isOpen, setIsOpen] = useState(false);
  const [adminOnline, setAdminOnline] = useState(false); // 客服是否在线（给访客看的状态）
  const [isAdminClient, setIsAdminClient] = useState(false); // 当前浏览器是否为后台登入端

  // 访客端：从 Firestore 显示的消息
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [infoStage, setInfoStage] = useState<InfoStage>("none");
  const [leadDraft, setLeadDraft] = useState<LeadDraft>({
    name: "",
    company: "",
    contact: "",
    need: "",
  });
  const [sessionId, setSessionId] = useState("");

  // 管理端：所有访客消息
  const [remoteMessages, setRemoteMessages] = useState<RemoteMessage[]>([]);
  const [sessions, setSessions] = useState<AdminSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [hasUnread, setHasUnread] = useState(false);
  const [adminInput, setAdminInput] = useState("");

  // 初始化 sessionId（访客）
  useEffect(() => {
    if (typeof window === "undefined") return;
    setSessionId(getOrCreateSessionId());
  }, []);

  // 判断当前浏览器是否为「管理员端」（靠 login page 存的 localStorage）
  useEffect(() => {
    if (typeof window === "undefined") return;
    const flag =
      window.localStorage.getItem("jyc_admin_logged_in") === "true";
    setIsAdminClient(flag);
    if (flag) {
      // 本机登入后台 => 一定视为在线
      setAdminOnline(true);
    }
  }, []);

  // 支持从其他页面唤起聊天窗，并预填文字（访客端用）
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ message?: string }>;
      const msg = ce.detail?.message || "";
      setIsOpen(true);
      if (msg) setInput(msg);
    };

    window.addEventListener("jyc-open-chat" as any, handler as any);
    return () => {
      window.removeEventListener("jyc-open-chat" as any, handler as any);
    };
  }, []);

  // 用 Firestore 判断管理员是否在线（跨设备统一）
  useEffect(() => {
    const statusRef = doc(db, "jyc_meta", "adminStatus");
    const unsub = onSnapshot(
      statusRef,
      (snap) => {
        const data = snap.data() as any;
        if (data && typeof data.online === "boolean") {
          setAdminOnline((prev) => prev || data.online);
        }
      },
      (err) => {
        console.error("listen adminStatus error", err);
      }
    );
    return () => unsub();
  }, []);

  // 访客端：订阅当前 session 的所有消息（含访客 + 机器人 + 管理员）
  useEffect(() => {
    if (isAdminClient) return; // 管理端不用这条订阅
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
            id: messageId++,
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
  }, [isAdminClient, sessionId]);

  // 访客端：首次进入会话时写入欢迎讯息（每个 session 只写一次）
  useEffect(() => {
    if (isAdminClient) return;
    if (!sessionId) return;
    if (typeof window === "undefined") return;

    const key = `jyc_chat_welcome_sent_${sessionId}_${isEnglish ? "en" : "zh"}`;
    const sent = window.localStorage.getItem(key) === "true";
    const welcome = adminOnline ? texts.welcomeOnline : texts.welcomeOffline;

    if (!sent) {
      // 只写一次欢迎语
      void saveChatMessage("bot", welcome, sessionId, pathname, true);
      window.localStorage.setItem(key, "true");
    }
  }, [adminOnline, isAdminClient, sessionId, isEnglish, pathname, texts]);

  // 管理端：监听所有访客的留言
  useEffect(() => {
    if (!isAdminClient) return;

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
        setHasUnread(list.some((s) => s.unreadCount > 0));

        setActiveSessionId((prev) => prev || list[0]?.sessionId || null);
      },
      (err) => {
        console.error("listen chat messages error", err);
      }
    );

    return () => unsub();
  }, [isAdminClient]);

  // 管理端：把某个会话的访客讯息标记为已读
  async function markSessionRead(sessionId: string) {
    if (!isAdminClient) return;

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

  // 写入 Firestore 聊天记录
  async function saveChatMessage(
    from: "user" | "bot",
    text: string,
    sessId: string,
    path: string,
    read: boolean
  ) {
    if (!sessId) return;
    try {
      await addDoc(collection(db, "jyc_chat_messages"), {
        sessionId: sessId,
        from,
        text,
        pathname: path,
        createdAt: serverTimestamp(),
        read,
      });
    } catch (err) {
      console.error("saveChatMessage error", err);
    }
  }

  // 访客端：送出讯息
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || !sessionId) return;

    setInput("");

    // 1) 访客讯息写入 Firestore（未读）
    void saveChatMessage("user", text, sessionId, pathname, false);

    // 2) 若客服在线：给一条「已收到」的自动回覆（可选）
    if (adminOnline) {
      void saveChatMessage("bot", texts.adminReply, sessionId, pathname, true);
      return;
    }

    // 3) 若客服离线：启动自动问答 + 收集资料
    handleOfflineFlow(text);
  };

  // 访客端：离线模式自动问答流程（只负责写入 bot 消息）
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
      void saveChatMessage("bot", r, sessionId, pathname, true);
    }
  };

  // 管理端：发送回复给当前访客
  const handleAdminSend = (e: React.FormEvent) => {
    e.preventDefault();
    const text = adminInput.trim();
    if (!text || !activeSessionId) return;

    setAdminInput("");
    // 管理端发出的讯息直接设为 read=true（不算未读）
    void saveChatMessage("bot", text, activeSessionId, pathname, true);
  };

  /* ==========================
     管理端 UI（收件匣模式）
  =========================== */

  if (isAdminClient) {
    const activeMsgs =
      activeSessionId == null
        ? []
        : remoteMessages
            .filter((m) => m.sessionId === activeSessionId)
            .sort((a, b) => a.createdAt - b.createdAt);

    return (
      <>
        <button
          type="button"
          className="jyc-chat-bubble-button"
          onClick={() => {
            setIsOpen((v) => !v);
            if (!isOpen && activeSessionId) {
              markSessionRead(activeSessionId);
            }
          }}
        >
          {texts.adminBubbleLabel}
          {hasUnread && (
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

        {isOpen && (
          <div className="jyc-chat-panel">
            <div className="jyc-chat-header">
              <div>
                <div className="jyc-chat-title">{texts.adminTitle}</div>
                <div className="jyc-chat-status" style={{ fontSize: 11 }}>
                  {isEnglish
                    ? "You are logged in as admin. New visitor messages will appear here."
                    : "您目前已登入后台，新访客留言会出现在此视窗中。"}
                </div>
              </div>
              <button
                type="button"
                className="jyc-chat-close"
                onClick={() => setIsOpen(false)}
              >
                ×
              </button>
            </div>

            <div
              style={{
                display: "flex",
                flex: 1,
                minHeight: 260,
                borderTop: "1px solid #eee",
              }}
            >
              {/* 会话列表 */}
              <div
                style={{
                  width: 140,
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
                        {isEnglish ? "Visitor" : "访客"}{" "}
                        {s.sessionId.slice(-4)}
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

              {/* 讯息区 + 回复输入框 */}
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
                        !activeSessionId || !adminInput.trim()
                          ? "#ccc"
                          : "#333",
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
                  }}
                >
                  {texts.adminHint}
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  /* ==========================
     访客端 UI（在线助手）
  =========================== */

  return (
    <>
      {/* 浮动按钮 */}
      <button
        type="button"
        className="jyc-chat-bubble-button"
        onClick={() => setIsOpen((v) => !v)}
      >
        {texts.bubbleLabel}
      </button>

      {/* 聊天视窗 */}
      {isOpen && (
        <div className="jyc-chat-panel">
          <div className="jyc-chat-header">
            <div>
              <div className="jyc-chat-title">{texts.title}</div>
              <div className="jyc-chat-status">
                {isEnglish ? "Status: " : "状态："}
                {adminOnline ? texts.statusOnline : texts.statusOffline}
              </div>
            </div>
            <button
              type="button"
              className="jyc-chat-close"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
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
      )}
    </>
  );
}
