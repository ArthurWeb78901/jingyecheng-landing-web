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
  serverTimestamp,
} from "firebase/firestore";

type Message = {
  id: number;
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

let messageId = 1;

/** 文案表：中文 */
const zhTexts = {
  bubbleLabel: "在线助手",
  title: "在线咨询（示意）",
  statusOnline: "客服在线（专人回复模式）",
  statusOffline: "自动应答中（离线收集客户资料）",
  welcomeOnline:
    "您好，这里是太原精业城重工设备在线助手。目前客服在线，您可以直接留下问题，我会先帮您记录，后续由专人回复。",
  welcomeOffline:
    "您好，这里是太原精业城重工设备在线助手。目前客服暂不在线，我会先根据常见问题为您解答，并协助记录您的基本资讯方便后续联系。",
  adminReply:
    "感谢您的留言，目前为示意环境。实际上线后，客服人员将在后台看到您的讯息，并以电话或邮件与您联系。",
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
};

/** 文案表：英文 */
const enTexts = {
  bubbleLabel: "Online Assistant",
  title: "Online Inquiry (Demo)",
  statusOnline: "Operator online (manual reply mode)",
  statusOffline: "Auto reply (collecting basic lead info)",
  welcomeOnline:
    "Hello, this is Taiyuan Jingyecheng Heavy Equipment online assistant. Our staff is currently online. You may leave your questions here and we will record them for follow-up.",
  welcomeOffline:
    "Hello, this is Taiyuan Jingyecheng Heavy Equipment online assistant. Our staff is currently offline. I will answer common questions first and help record your basic information for follow-up.",
  adminReply:
    "Thank you for your message. This is a demo environment. In production, our staff will see your inquiry in the backend and contact you by phone or email.",
  askName: "To better follow up, may I have your name?",
  askCompany: (name: string) =>
    `Nice to meet you, ${name}. May I know your company or organization? (You may skip this if it is a personal inquiry.)`,
  askContact: "Got it, thank you. Please leave a contact method, such as phone number or email.",
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

    if (exists) {
      return;
    }

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
  const [adminOnline, setAdminOnline] = useState(false);
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

  // 初始化 sessionId
  useEffect(() => {
    if (typeof window === "undefined") return;
    setSessionId(getOrCreateSessionId());
  }, []);

  // ✅ 支持从其他页面唤起聊天窗，并预填文字
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ message?: string }>;
      const msg = ce.detail?.message || "";

      setIsOpen(true);
      if (msg) {
        setInput(msg);
      }
    };

    window.addEventListener("jyc-open-chat" as any, handler as any);
    return () => {
      window.removeEventListener("jyc-open-chat" as any, handler as any);
    };
  }, []);

  // ✅ 用 Firestore 判断管理员是否在线（跨设备统一）
  useEffect(() => {
    const statusRef = doc(db, "jyc_meta", "adminStatus");
    const unsub = onSnapshot(
      statusRef,
      (snap) => {
        const data = snap.data() as any;
        if (data && typeof data.online === "boolean") {
          setAdminOnline(data.online);
        } else {
          setAdminOnline(false);
        }
      },
      (err) => {
        console.error("listen adminStatus error", err);
        setAdminOnline(false);
      }
    );
    return () => unsub();
  }, []);

  // （可选）保留原本 localStorage 的逻辑当作 fallback
  useEffect(() => {
    if (typeof window !== "undefined") {
      const flag = window.localStorage.getItem("jyc_admin_logged_in") === "true";
      setAdminOnline((prev) => prev || flag);
    }
  }, []);

  // 首次欢迎讯息
  useEffect(() => {
    if (messages.length === 0) {
      const welcome = adminOnline ? texts.welcomeOnline : texts.welcomeOffline;
      setMessages([
        {
          id: messageId++,
          from: "bot",
          text: welcome,
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminOnline, messages.length, isEnglish]);

  // 把聊天讯息存到 Firestore，给后台看
  async function saveChatMessage(from: "user" | "bot", text: string) {
    if (!sessionId) return;
    try {
      await addDoc(collection(db, "jyc_chat_messages"), {
        sessionId,
        from,
        text,
        pathname,
        createdAt: serverTimestamp(),
        read: false,
      });
    } catch (err) {
      console.error("saveChatMessage error", err);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    const userMsg: Message = {
      id: messageId++,
      from: "user",
      text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // ✅ 存到 Firestore，后台可见
    saveChatMessage("user", text);

    // 有登入：专人回复模式
    if (adminOnline) {
      const reply: Message = {
        id: messageId++,
        from: "bot",
        text: texts.adminReply,
      };
      setMessages((prev) => [...prev, reply]);
      // 如需也记录机器人回覆可加：
      // saveChatMessage("bot", texts.adminReply);
      return;
    }

    // 没登入：自动问答 + 收集资料
    handleOfflineFlow(text);
  };

  const handleOfflineFlow = (userText: string) => {
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
    if (faq) {
      replies.push(faq);
    }

    if (replies.length === 0) return;

    setMessages((prev) => [
      ...prev,
      ...replies.map((text) => ({
        id: messageId++,
        from: "bot" as const,
        text,
      })),
    ]);
  };

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
