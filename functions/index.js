// functions/index.js
const functions = require("firebase-functions/v1"); // 1st Gen triggers + runWith
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

// v7 params
const { defineString, defineSecret } = require("firebase-functions/params");

// ✅ Gmail App Password secret
const GMAIL_APP_PASS = defineSecret("GMAIL_APP_PASS");

const WEBSITE_NAME = defineString("WEBSITE_NAME", { default: "JYC Steel Equip 网站" });
const ADMIN_EMAIL = defineString("ADMIN_EMAIL", { default: "jycsteelequipment@gmail.com" });
const LEAD_TO = defineString("LEAD_TO", {
  default: "wendy@jycsteelequip.com,jycsteelequipment@gmail.com",
});

// ✅ 用这个确保你看 log 就知道是不是新代码
const CODE_VERSION = "2025-12-15_gmail_smtp_force_v1";

admin.initializeApp();

function parseToList(csv) {
  return (csv || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function createTransporter() {
  const user = ADMIN_EMAIL.value();
  const pass = GMAIL_APP_PASS.value();

  // ✅ 关键：log 一定要出现，没出现就表示你云端不是跑这份代码
  console.log("CODE_VERSION =", CODE_VERSION);
  console.log("SMTP_HOST =", "smtp.gmail.com", "USER =", user, "PASS_LEN =", pass ? pass.length : 0);

  // ✅ 强制 Gmail SMTP（不要用 service: hotmail / office365）
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass },
  });
}

// =======================================================
// 1) 新聊天首则访客讯息 -> 发信（每个 session 只发一次）
// =======================================================
exports.notifyNewChatMessage = functions
  .runWith({ secrets: [GMAIL_APP_PASS] })
  .firestore.document("jyc_chat_messages/{docId}")
  .onCreate(async (snap) => {
    const data = snap.data() || {};
    const from = data.from || "user";
    const sessionId = data.sessionId || "unknown";
    const text = (data.text || "").toString().slice(0, 2000);
    const pathname = data.pathname || "/";

    if (from !== "user") return null;

    const db = admin.firestore();

    try {
      const sessionRef = db.collection("jyc_chat_sessions").doc(sessionId);
      const sessionSnap = await sessionRef.get();
      if (sessionSnap.exists) return null;

      await sessionRef.set({
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        firstMessageId: snap.id,
      });

      const isEnglish = typeof pathname === "string" && pathname.startsWith("/en");
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
      await transporter.verify();

      await transporter.sendMail({
        from: `"${WEBSITE_NAME.value()}" <${ADMIN_EMAIL.value()}>`,
        to: ADMIN_EMAIL.value(),
        subject,
        text: bodyLines.join("\n"),
      });

      console.log("notifyNewChatMessage: email sent for session:", sessionId);
      return null;
    } catch (err) {
      console.error("notifyNewChatMessage error:", err);
      if (err && typeof err === "object") {
        console.error("code:", err.code);
        console.error("response:", err.response);
      }
      return null;
    }
  });

// =======================================================
// 2) 新 lead 写入 jyc_leads -> 发信
// =======================================================
exports.notifyNewLead = functions
  .runWith({ secrets: [GMAIL_APP_PASS] })
  .firestore.document("jyc_leads/{leadId}")
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
          "Message:",
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
          "客户留言 / 需求说明：",
          need || "（无内容）",
        ];

    try {
      console.log("notifyNewLead: sending email for lead:", sessionId);

      const transporter = createTransporter();
      await transporter.verify();

      const info = await transporter.sendMail({
        from: `"${WEBSITE_NAME.value()}" <${ADMIN_EMAIL.value()}>`,
        to: parseToList(LEAD_TO.value()),
        subject,
        text: bodyLines.join("\n"),
      });

      console.log("notifyNewLead: email sent:", info && info.messageId, sessionId);
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
