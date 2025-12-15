// functions/index.js
const { firestore } = require("firebase-functions/v1"); // 1st Gen
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

// ====== 基本設定 ======
const WEBSITE_NAME = "JYC Steel Equip 网站";
const ADMIN_EMAIL = "jycsteelequip@hotmail.com";

// 這裡用 Hotmail / Outlook 的「應用程式密碼」，不要用登入密碼
const SMTP_PASS = "kqnwsfbgqxoctxgg";

// Hotmail / Outlook SMTP 設定
const transporter = nodemailer.createTransport({
  host: "smtp.office365.com",
  port: 587,
  secure: false,
  auth: {
    user: ADMIN_EMAIL,
    pass: SMTP_PASS,
  },
});

// =======================================================
// 1) Firestore 觸發：有新的聊天訊息寫入 jyc_chat_messages
//    只在「每個 session 的第一則訪客訊息」時寄信一次
// =======================================================
exports.notifyNewChatMessage = firestore
  .document("jyc_chat_messages/{docId}")
  .onCreate(async (snap, context) => {
    const data = snap.data() || {};

    const from = data.from || "user";
    const sessionId = data.sessionId || "unknown";
    const text = (data.text || "").toString().slice(0, 2000);
    const pathname = data.pathname || "/";

    // 只針對「訪客」發的訊息寄信；bot / admin 的一律忽略
    if (from !== "user") {
      return;
    }

    const db = admin.firestore();

    try {
      // 用 jyc_chat_sessions 做「此 session 只寄一次信」的鎖
      const sessionRef = db.collection("jyc_chat_sessions").doc(sessionId);
      const sessionSnap = await sessionRef.get();

      if (sessionSnap.exists) {
        // 這個 session 已經寄過通知，就不再寄
        return;
      }

      // 第一次看到這個 session：建立鎖
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
            "",
            "Please log in to the website admin chat console to reply.",
          ]
        : [
            "有访客在 JYC 官网发起新的在线咨询。",
            "",
            `访问页面：${pathname}`,
            `会话编号：${sessionId}`,
            "",
            "客户的首条留言：",
            text || "（空白讯息）",
            "",
            "请登入网站后台的在线客服视窗进行回复。",
          ];

      await transporter.sendMail({
        from: `"${WEBSITE_NAME}" <${ADMIN_EMAIL}>`,
        to: ADMIN_EMAIL,
        subject,
        text: bodyLines.join("\n"),
      });

      console.log("notifyNewChatMessage: email sent for session:", sessionId);
    } catch (err) {
      console.error("notifyNewChatMessage error:", err);
    }
  });

// =======================================================
// 2) Firestore 觸發：有新的客户線索寫入 jyc_leads
//    （離線機器人 & admin 手動保存都會寫入這個 collection）
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
          "Customer information:",
          `Name: ${name}`,
          `Company: ${company || "(not provided)"}`,
          `Contact: ${contact || "(not provided)"}`,
          `Language: ${language || "(unknown)"}`,
          `Source: ${source}`,
          `Session ID: ${sessionId}`,
          "",
          "Customer requirement / message:",
          need || "(no content)",
          "",
          "This email was generated automatically by the website.",
        ]
      : [
          "您在 JYC 官网有一条新的客户线索。",
          "",
          "客户基本资料：",
          `姓名：${name}`,
          `公司 / 单位：${company || "（未填写）"}`,
          `联系方式：${contact || "（未填写）"}`,
          `语言：${language || "（未知）"}`,
          `来源：${source}`,
          `会话编号：${sessionId}`,
          "",
          "客户留言 / 需求说明：",
          need || "（无内容）",
          "",
          "本邮件由网站自动发送。",
        ];

    try {
      console.log("notifyNewLead: sending email for lead:", sessionId);

      await transporter.sendMail({
        from: `"${WEBSITE_NAME}" <${ADMIN_EMAIL}>`,
        to: "wendy@jycsteelequip.com", // 也可以改成多個收件人
        subject,
        text: bodyLines.join("\n"),
      });

      console.log("notifyNewLead: email sent for lead:", sessionId);
    } catch (err) {
      console.error("notifyNewLead error:", err);
    }
  });
