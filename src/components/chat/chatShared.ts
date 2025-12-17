// src/components/chat/chatShared.ts
"use client";

import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

const EMAIL_OUTBOX_COLLECTION = "mail";
const NOTIFY_EMAILS = ["wendy@jycsteelequip.com"];

export type LangCode = "zh" | "en" | "hi" | "id";

function shouldNotifyByEmail(source: LeadSource) {
  return source === "offline-bot" || source === "admin-manual";
}

export type ChatTexts = {
  bubbleLabel: string;
  adminBubbleLabel: string;
  title: string;
  adminTitle: string;

  statusPrefix: string;
  statusOnline: string;
  statusOffline: string;

  closeAriaLabel: string;

  welcomeOnline: string;
  welcomeOffline: string;

  adminReply: string;

  askName: string;
  askCompany: (name: string) => string;
  askContact: string;
  askNeed: string;
  afterSaved: string;
  afterDone: string;

  inputPlaceholder: string;
  sendLabel: string;

  faqPrice: string;
  faqDelivery: string;
  faqService: string;
  faqUpgrade: string;

  errTooLong: (max: number) => string;
  errTooFast: string;

  adminEmpty: string;
  adminHint: string;
  adminInputPlaceholder: string;

  adminLoggedInHint: string;
  adminSelectSessionHint: string;
  noTextPlaceholder: string;
  visitorLabel: string;
};

export const zhTexts: ChatTexts = {
  bubbleLabel: "在线咨询",
  adminBubbleLabel: "客服讯息",
  title: "在线咨询",
  adminTitle: "访客留言",

  statusPrefix: "状态：",
  statusOnline: "客服在线（可由专人回复）",
  statusOffline: "自动应答中（离线收集客户资料）",

  closeAriaLabel: "收起对话",

  welcomeOnline:
    "您好，这里是太原精业城重工设备在线助手。目前客服在线，您可以直接留下问题，我们会尽快安排专人与您联系并回复。",
  welcomeOffline:
    "您好，这里是太原精业城重工设备在线助手。目前客服暂不在线，我会先根据常见问题为您解答，并协助记录您的基本资讯方便后续联系。",

  adminReply:
    "感谢您的留言，我们已收到您的问题，稍后将由专人与您联系并进一步沟通细节。",

  askName: "为了方便后续联系，请问怎么称呼您？",
  askCompany: (name) =>
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

  errTooLong: (max) => `单则讯息过长，请控制在 ${max} 个字以内。`,
  errTooFast: "讯息发送过于频繁，请稍后再试。",

  adminEmpty: "目前尚无访客留言。",
  adminHint: "您可以在下方输入回复内容，讯息会即时发送给该访客并显示在对方网页上。",
  adminInputPlaceholder: "请输入要回复给访客的内容…",

  adminLoggedInHint: "您目前已登入后台，新访客留言会出现在此视窗中。",
  adminSelectSessionHint: "请在左侧选择一位访客的会话。",
  noTextPlaceholder: "（无内容）",
  visitorLabel: "访客",
};

export const enTexts: ChatTexts = {
  bubbleLabel: "Online Inquiry",
  adminBubbleLabel: "Inbox",
  title: "Online Inquiry",
  adminTitle: "Visitor Inquiries",

  statusPrefix: "Status: ",
  statusOnline: "Operator online (live reply available)",
  statusOffline: "Auto reply (collecting basic lead info)",

  closeAriaLabel: "Close chat",

  welcomeOnline:
    "Hello, this is Taiyuan Jingyecheng Heavy Equipment online assistant. Our staff is currently online. You may leave your questions here and we will follow up as soon as possible.",
  welcomeOffline:
    "Hello, this is Taiyuan Jingyecheng Heavy Equipment online assistant. Our staff is currently offline. I will answer common questions first and help record your basic information for follow-up.",

  adminReply:
    "Thank you for your message. We have received your inquiry and our sales team will contact you shortly for further discussion.",

  askName: "To better follow up, may I have your name?",
  askCompany: (name) =>
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
    "For upgrading or revamping existing lines, we normally review the current equipment and operating conditions first, then propose a modification or optimization plan along with a budget estimate.",

  errTooLong: (max) => `Your message is too long. Please keep it within ${max} characters.`,
  errTooFast: "You are sending messages too fast. Please wait a moment.",

  adminEmpty: "No visitor inquiries yet.",
  adminHint: "Type your reply below. Messages will be sent to the visitor in real time and displayed on their page.",
  adminInputPlaceholder: "Type your reply to the visitor…",

  adminLoggedInHint: "You are logged in as admin. New visitor messages will appear here.",
  adminSelectSessionHint: "Select a visitor session on the left.",
  noTextPlaceholder: "(no text)",
  visitorLabel: "Visitor",
};

// ✅ Hindi
export const hiTexts: ChatTexts = {
  bubbleLabel: "ऑनलाइन पूछताछ",
  adminBubbleLabel: "इनबॉक्स",
  title: "ऑनलाइन पूछताछ",
  adminTitle: "आगंतुक संदेश",

  statusPrefix: "स्थिति: ",
  statusOnline: "ऑपरेटर ऑनलाइन (लाइव जवाब उपलब्ध)",
  statusOffline: "ऑटो जवाब (बुनियादी जानकारी एकत्र)",

  closeAriaLabel: "चैट बंद करें",

  welcomeOnline:
    "नमस्ते, यह Taiyuan Jingyecheng Heavy Equipment का ऑनलाइन सहायक है। हमारी टीम अभी ऑनलाइन है। कृपया अपना प्रश्न लिखें, हम जल्द जवाब देंगे।",
  welcomeOffline:
    "नमस्ते, यह Taiyuan Jingyecheng Heavy Equipment का ऑनलाइन सहायक है। हमारी टीम अभी ऑफलाइन है। मैं सामान्य प्रश्नों का उत्तर दूँगा और आपकी जानकारी दर्ज करूँगा।",

  adminReply:
    "आपके संदेश के लिए धन्यवाद। हमने आपकी पूछताछ प्राप्त कर ली है और हमारी टीम जल्द ही आपसे संपर्क करेगी।",

  askName: "फ़ॉलो-अप के लिए आपका नाम क्या है?",
  askCompany: (name) => `धन्यवाद, ${name}। आपकी कंपनी/संगठन का नाम क्या है? (व्यक्तिगत पूछताछ हो तो छोड़ सकते हैं)`,
  askContact: "कृपया संपर्क जानकारी दें (फोन/ईमेल)।",
  askNeed: "कृपया अपनी आवश्यकताओं/परियोजना का संक्षिप्त विवरण दें।",
  afterSaved: "धन्यवाद। हमने आपकी जानकारी और आवश्यकताएँ दर्ज कर ली हैं और जल्द संपर्क करेंगे।",
  afterDone: "आपकी जानकारी दर्ज है। अतिरिक्त संदेश छोड़ने के लिए स्वतंत्र हैं।",

  inputPlaceholder: "कृपया अपना प्रश्न लिखें…",
  sendLabel: "भेजें",

  faqPrice:
    "मूल्य/कोटेशन के लिए हमें कॉन्फ़िगरेशन, क्षमता और साइट की स्थिति के आधार पर मूल्यांकन करना होगा। कृपया क्षमता और उत्पाद आकार बताएं।",
  faqDelivery:
    "डिलीवरी समय लाइन के स्केल और साइट की स्थिति पर निर्भर करता है। आम तौर पर अनुबंध के बाद डिलीवरी में कुछ महीने लग सकते हैं।",
  faqService:
    "हम इंस्टॉलेशन, कमीशनिंग, ऑपरेटर ट्रेनिंग और आफ्टर-सेल्स सेवा प्रदान कर सकते हैं।",
  faqUpgrade:
    "अपग्रेड/रिवैम्प के लिए हम पहले मौजूदा उपकरण और ऑपरेशन स्थिति देखते हैं, फिर संशोधन/ऑप्टिमाइज़ेशन योजना देते हैं।",

  errTooLong: (max) => `आपका संदेश बहुत लंबा है। कृपया ${max} अक्षरों के भीतर रखें।`,
  errTooFast: "आप बहुत जल्दी संदेश भेज रहे हैं। कृपया थोड़ी देर बाद प्रयास करें।",

  adminEmpty: "अभी कोई संदेश नहीं है।",
  adminHint: "नीचे उत्तर लिखें। संदेश रीयल-टाइम में आगंतुक को दिखेगा।",
  adminInputPlaceholder: "आगंतुक के लिए उत्तर लिखें…",

  adminLoggedInHint: "आप admin के रूप में लॉग इन हैं। नए संदेश यहाँ दिखेंगे।",
  adminSelectSessionHint: "बाएँ से किसी सत्र का चयन करें।",
  noTextPlaceholder: "(कोई टेक्स्ट नहीं)",
  visitorLabel: "Visitor",
};

// ✅ Indonesian
export const idTexts: ChatTexts = {
  bubbleLabel: "Konsultasi Online",
  adminBubbleLabel: "Kotak Masuk",
  title: "Konsultasi Online",
  adminTitle: "Pesan Pengunjung",

  statusPrefix: "Status: ",
  statusOnline: "Operator online (balas langsung)",
  statusOffline: "Balasan otomatis (mengumpulkan info lead)",

  closeAriaLabel: "Tutup chat",

  welcomeOnline:
    "Halo, ini asisten online Taiyuan Jingyecheng Heavy Equipment. Tim kami sedang online. Silakan tulis pertanyaan Anda dan kami akan segera menindaklanjuti.",
  welcomeOffline:
    "Halo, ini asisten online Taiyuan Jingyecheng Heavy Equipment. Tim kami sedang offline. Saya akan menjawab pertanyaan umum dan membantu mencatat info Anda untuk tindak lanjut.",

  adminReply:
    "Terima kasih atas pesan Anda. Kami sudah menerima pertanyaan Anda dan tim kami akan menghubungi Anda segera.",

  askName: "Agar mudah ditindaklanjuti, boleh tahu nama Anda?",
  askCompany: (name) =>
    `Senang bertemu, ${name}. Nama perusahaan/organisasi Anda? (Boleh dilewati jika pribadi.)`,
  askContact: "Terima kasih. Mohon tinggalkan kontak (telepon atau email).",
  askNeed: "Mohon jelaskan singkat kebutuhan/perencanaan lini produksi atau proyek peralatan Anda.",
  afterSaved:
    "Terima kasih. Kami sudah mencatat nama, perusahaan, kontak, dan kebutuhan Anda. Tim terkait akan segera menghubungi Anda.",
  afterDone: "Kebutuhan Anda sudah tercatat. Silakan tinggalkan pesan tambahan bila perlu.",

  inputPlaceholder: "Tulis pertanyaan atau kebutuhan Anda…",
  sendLabel: "Kirim",

  faqPrice:
    "Untuk harga/penawaran, kami evaluasi berdasarkan konfigurasi, kapasitas, dan kondisi lokasi. Mohon info kapasitas & ukuran produk agar kami bisa beri kisaran awal.",
  faqDelivery:
    "Waktu pengiriman tergantung skala lini dan kondisi lokasi. Untuk satu lini lengkap biasanya memerlukan beberapa bulan setelah kontrak dikonfirmasi.",
  faqService:
    "Kami menyediakan supervisi instalasi, commissioning, pelatihan operator, dan layanan purna jual.",
  faqUpgrade:
    "Untuk upgrade/modernisasi, kami biasanya meninjau peralatan & kondisi operasi saat ini, lalu menawarkan rencana modifikasi/optimasi beserta estimasi anggaran.",

  errTooLong: (max) => `Pesan Anda terlalu panjang. Maksimal ${max} karakter.`,
  errTooFast: "Anda mengirim terlalu cepat. Mohon tunggu sebentar.",

  adminEmpty: "Belum ada pesan pengunjung.",
  adminHint: "Ketik balasan di bawah. Pesan akan dikirim real-time ke pengunjung.",
  adminInputPlaceholder: "Ketik balasan untuk pengunjung…",

  adminLoggedInHint: "Anda login sebagai admin. Pesan baru akan muncul di sini.",
  adminSelectSessionHint: "Pilih sesi pengunjung di sebelah kiri.",
  noTextPlaceholder: "(tanpa teks)",
  visitorLabel: "Visitor",
};

export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  const KEY = "jyc_chat_session_id";
  let id = window.localStorage.getItem(KEY);
  if (!id) {
    id = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    window.localStorage.setItem(KEY, id);
  }
  return id;
}

export function getTextsByLang(lang: LangCode): ChatTexts {
  if (lang === "en") return enTexts;
  if (lang === "hi") return hiTexts;
  if (lang === "id") return idTexts;
  return zhTexts;
}

export function langFromPathname(pathname: string): LangCode {
  const p = pathname || "/";
  if (p === "/en" || p.startsWith("/en/")) return "en";
  if (p === "/hi" || p.startsWith("/hi/")) return "hi";
  if (p === "/id" || p.startsWith("/id/")) return "id";
  return "zh";
}

export function getFaqAnswer(text: string, lang: LangCode, txt: ChatTexts): string | null {
  const t = text.toLowerCase();

  // 价格/报价
  if (
    t.includes("报价") || t.includes("价格") ||
    t.includes("price") || t.includes("quote") || t.includes("quotation") ||
    t.includes("harga") || t.includes("penawaran") ||
    t.includes("कीमत") || t.includes("मूल्य") || t.includes("उद्धरण")
  ) return txt.faqPrice;

  // 交期/交货
  if (
    t.includes("交期") || t.includes("交货") || t.includes("交付") ||
    t.includes("delivery") || t.includes("lead time") ||
    t.includes("pengiriman") || t.includes("leadtime") ||
    t.includes("डिलीवरी") || t.includes("लीड टाइम")
  ) return txt.faqDelivery;

  // 安装/售后
  if (
    t.includes("安装") || t.includes("调试") || t.includes("售后") || t.includes("服务") ||
    t.includes("installation") || t.includes("commissioning") || t.includes("service") || t.includes("after-sales") ||
    t.includes("instalasi") || t.includes("komisioning") || t.includes("layanan") ||
    t.includes("इंस्टॉलेशन") || t.includes("कमीशनिंग") || t.includes("सेवा")
  ) return txt.faqService;

  // 改造/升级
  if (
    t.includes("改造") || t.includes("升级") || t.includes("技改") ||
    t.includes("upgrade") || t.includes("revamp") || t.includes("modernization") ||
    t.includes("upgrade") || t.includes("modernisasi") ||
    t.includes("अपग्रेड") || t.includes("रिवैम्प") || t.includes("आधुनिकीकरण")
  ) return txt.faqUpgrade;

  return null;
}

/** CRM lead shape */
export type LeadDraft = {
  name: string;
  company: string;
  contact: string;
  need: string;
};

export type LeadSource = "offline-bot" | "chat-archive" | "admin-manual";

async function saveLeadToFirestore(
  lead: LeadDraft,
  options: {
    source: LeadSource;
    lang: LangCode;
    sessionId?: string;
    transcript?: string;
  }
) {
  const lang = options.lang;

  try {
    const leadPayload: any = {
      name: lead.name || "",
      company: lead.company || "",
      contact: lead.contact || "",
      need: lead.need || options.transcript || "",
      createdAt: serverTimestamp(),
      source: options.source,
      lang,
      language: lang,
    };

    if (options.sessionId && typeof options.sessionId === "string") {
      leadPayload.sessionId = options.sessionId;
    }

    const leadDoc = await addDoc(collection(db, "jyc_leads"), leadPayload);

    if (shouldNotifyByEmail(options.source) && NOTIFY_EMAILS.length > 0) {
      const subject = `New Lead (${options.source}) [${lang}]`;

      const bodyText =
        `source: ${options.source}\n` +
        `lang: ${lang}\n` +
        `leadId: ${leadDoc.id}\n` +
        `sessionId: ${options.sessionId || ""}\n\n` +
        `name: ${lead.name || ""}\n` +
        `company: ${lead.company || ""}\n` +
        `contact: ${lead.contact || ""}\n\n` +
        `need:\n${lead.need || options.transcript || ""}\n`;

      const mailPayload: any = {
        to: NOTIFY_EMAILS,
        message: { subject, text: bodyText },
        createdAt: serverTimestamp(),
        meta: {
          leadId: leadDoc.id,
          source: options.source,
          lang,
        },
      };

      if (options.sessionId && typeof options.sessionId === "string") {
        mailPayload.meta.sessionId = options.sessionId;
      }

      await addDoc(collection(db, EMAIL_OUTBOX_COLLECTION), mailPayload);
    }
  } catch (err) {
    console.error("saveLeadToFirestore error", err);
  }
}

export function saveLeadToLocalStorage(lead: LeadDraft, lang: LangCode) {
  const sid = typeof window === "undefined" ? "" : getOrCreateSessionId();
  void saveLeadToFirestore(lead, {
    source: "offline-bot",
    lang,
    sessionId: sid || undefined,
  });
}

export async function saveAdminLead(lead: LeadDraft, lang: LangCode) {
  const sid = typeof window === "undefined" ? "" : getOrCreateSessionId();
  await saveLeadToFirestore(lead, {
    source: "admin-manual",
    lang,
    sessionId: sid || undefined,
  });
}

export type ArchiveMessage = {
  from: "user" | "bot";
  text: string;
  createdAt: number;
};

export function archiveChatSessionToLocalStorage(
  sessionId: string,
  msgs: ArchiveMessage[],
  lang: LangCode
) {
  if (!msgs || msgs.length === 0) return;

  const transcript = msgs
    .filter((m) => m.from === "user")
    .map((m) => m.text)
    .join("\n");

  const txt = getTextsByLang(lang);

  const pseudoLead: LeadDraft = {
    name: `${txt.visitorLabel} ${sessionId ? sessionId.slice(-4) : ""}`,
    company: "",
    contact: "",
    need: transcript || txt.noTextPlaceholder,
  };

  void saveLeadToFirestore(pseudoLead, {
    source: "chat-archive",
    lang,
    sessionId,
    transcript,
  });
}
