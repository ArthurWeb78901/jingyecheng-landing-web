// src/components/chat/chatShared.ts
"use client";

import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

/* ========= Types ========= */

export type Message = {
  id: number;
  from: "user" | "bot";
  text: string;
};

export type InfoStage =
  | "none"
  | "ask-name"
  | "ask-company"
  | "ask-contact"
  | "ask-need"
  | "done";

export type LeadDraft = {
  name: string;
  company: string;
  contact: string;
  need: string;
};

export type RemoteMessage = {
  id: string;
  sessionId: string;
  from: "user" | "bot";
  text: string;
  createdAt: number;
  read: boolean;
};

export type AdminSession = {
  sessionId: string;
  lastText: string;
  lastAt: number;
  unreadCount: number;
};

let _messageId = 1;
export function nextMessageId() {
  return _messageId++;
}

/* ========= 文案 ========= */

export const zhTexts = {
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
  adminHint: "您可以在下方输入回复内容，讯息会即时发送给该访客并显示在对方网页上。",
  adminInputPlaceholder: "请输入要回复给访客的内容…",
  liveTakeoverNotice: "客服已上线，目前由专人实时为您服务。",
};

export type ChatTexts = typeof zhTexts;

export const enTexts: ChatTexts = {
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
  liveTakeoverNotice:
    "A live operator has taken over this chat and will reply to you in real time.",
};

/* ========= FAQ & helpers ========= */

export function getFaqAnswer(text: string, isEnglish: boolean): string | null {
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

// 离线线索存到 localStorage
export function saveLeadToLocalStorage(lead: LeadDraft) {
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

// 访客 sessionId
export function getOrCreateSessionId() {
  if (typeof window === "undefined") return "";
  const KEY = "jyc_chat_session_id";
  let id = window.localStorage.getItem(KEY);
  if (!id) {
    id = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    window.localStorage.setItem(KEY, id);
  }
  return id;
}

// Firestore 写入讯息
export async function addChatMessage(
  from: "user" | "bot",
  text: string,
  sessionId: string,
  pathname: string,
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
    console.error("addChatMessage error", err);
  }
}

// localStorage key helpers
export function adminAckKey(sessionId: string) {
  return `jyc_chat_admin_ack_${sessionId}`;
}
export function welcomeKey(sessionId: string, isEnglish: boolean) {
  return `jyc_chat_welcome_sent_${sessionId}_${isEnglish ? "en" : "zh"}`;
}
