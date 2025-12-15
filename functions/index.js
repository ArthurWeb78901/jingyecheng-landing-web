// functions/index.js
const { firestore } = require("firebase-functions/v1"); // 1st Gen triggers
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

// ✅ v7 用 params（你 deploy 时已经会要求输入，并写入 .env.nooko-hub）
const { defineString } = require("firebase-functions/params");
const SMTP_PASS = defineString("SMTP_PASS");

admin.initializeApp();

// ====== 基本設定 ======
const WEBSITE_NAME = "JYC Steel Equip 网站";
const ADMIN_EMAIL = "jycsteelequip@hotmail.com";

// 先双收验证：wendy + hotmail 自己
const LEAD_TO = ["wendy@jycsteelequip.com", ADMIN_EMAIL];

// ✅ runtime 才创建 transporter（不要放在顶层）
function createTransporter() {
  const pass = SMTP_PASS.value(); // ✅ 只在 runtime 才会有值
  return nodemailer.createTransport({
    service: "hotmail",
    auth: {
      user: ADMIN_EMAIL,
      pass,
    },
  });
}

// =======================================================
// 1) Firestore 觸發：新聊天首则访客讯息 -> 发信（每个 session 只发一次）
// =======================================================
exports.notifyNewChatMessage = firestore
  .document("jyc_chat_messages/{docId}")
  .onCreate(async (snap) => {
    const data = snap.data() || {};

    const from = data.from || "user";
    const sessionId = data.sessionId || "unknown";
    const text = (data.text || "").toString().slice(0, 2000);
    const pathname = data.pathname || "/";

    if (from !== "user") return null;

    const db = admin.firestore();

    try {
      // 锁：每个 session 只寄一次
      const sessionRef = db.collection("jyc_chat_sessions").doc(sessionId);
      const sessionSnap = await sessionRef.get();
      if (sessionSnap.exists) return null;

      await sessionRef.set({
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        firstMessageId: snap.id,
      });

      const isEnglish =
        typeof pathname === "string" && pathname.startsWith("/en");

      const subject = isEnglish
        ? "New live chat started on JYC Steel Equip website"
        : "【JYC 官网】有新的访客在线咨询";

      const bodyLines = isEnglish
        ? [
            "A visitor has started a new chat on the JYC Steel Equip website.",
            "",
            `Page: ${pathname}`,
            `Session ID: ${sessionId}`,
            "",
            "Customer first message:",
            text || "(empty)",
          ]
        : [
            "有访客在 JYC 官网发起新的在线咨询。",
            "",
            `访问页面：${pathname}`,
            `会话编号：${sessionId}`,
            "",
            "客户的首条留言：",
            text || "（空白讯息）",
          ];

      const transporter = createTransporter();

      // ✅ 建议先保留 verify，方便 logs 直接看到 SMTP 是否被封
      await transporter.verify();

      await transporter.sendMail({
        from: `"${WEBSITE_NAME}" <${ADMIN_EMAIL}>`,
        to: ADMIN_EMAIL,
        subject,
        text: bodyLines.join("\n"),
      });

      console.log("notifyNewChatMessage: email sent for session:", sessionId);
      return null;
    } catch (err) {
      console.error("notifyNewChatMessage error:", err);
      return null;
    }
  });

// =======================================================
// 2) Firestore 觸發：新 lead 写入 jyc_leads -> 发信
// =======================================================
exports.notifyNewLead = firestore
  .document("jyc_leads/{leadId}")
  .onCreate(async (snap, context) => {
    const data = snap.data() || {};

    const name = (data.name || "Visitor").toString();
    const company = (data.company || "").toString();
    const contact = (data.contact || "").toString();
    const needRaw = data.need || data.transcript || "";
    const need = needRaw.toString().slice(0, 4000);
    const language = (data.language || data.lang || "").toString().toLowerCase();
    const source = (data.source || "unknown").toString();
    const sessionId =
      (data.sessionId && data.sessionId.toString()) || context.params.leadId;

    const isEnglish = language.startsWith("en");

    const subject = isEnglish
      ? `New website inquiry from ${name} (JYC Steel Equip)`
      : `【JYC 官网】新的客户线索 - ${name}`;

    const bodyLines = isEnglish
      ? [
          "You have a new customer inquiry from the JYC Steel Equip website.",
          "",
          `Name: ${name}`,
          `Company: ${company || "(not provided)"}`,
          `Contact: ${contact || "(not provided)"}`,
          `Language: ${language || "(unknown)"}`,
          `Source: ${source}`,
          `Session ID: ${sessionId}`,
          "",
          need || "(no content)",
        ]
      : [
          "您在 JYC 官网有一条新的客户线索。",
          "",
          `姓名：${name}`,
          `公司 / 单位：${company || "（未填写）"}`,
          `联系方式：${contact || "（未填写）"}`,
          `语言：${language || "（未知）"}`,
          `来源：${source}`,
          `会话编号：${sessionId}`,
          "",
          need || "（无内容）",
        ];

    try {
      console.log("notifyNewLead: sending email for lead:", sessionId);

      const transporter = createTransporter();
      await transporter.verify();

      const info = await transporter.sendMail({
        from: `"${WEBSITE_NAME}" <${ADMIN_EMAIL}>`,
        to: LEAD_TO, // ✅ 双收验证
        subject,
        text: bodyLines.join("\n"),
      });

      console.log("notifyNewLead: email sent:", info.messageId, sessionId);
      return null;
    } catch (err) {
      console.error("notifyNewLead error:", err);
      if (err && typeof err === "object") {
        console.error("code:", err.code);
        console.error("response:", err.response);
      }
      return null;
    }
  });
