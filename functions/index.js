// functions/index.js
const { firestore } = require("firebase-functions/v1");  // 👈 用 v1，強制 1st Gen
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

// ====== 基本設定 ======
const WEBSITE_NAME = "JYC Steel Equip 网站";
const ADMIN_EMAIL = "jycsteelequip@hotmail.com";

// 這裡用你剛剛申請好的「應用程式密碼」，不要用登入密碼
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

// Firestore 觸發：有新的聊天訊息寫入 jyc_chat_messages
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
        ? "New website chat inquiry (JYC)"
        : "【JYC 官网】有新的访客在线咨询";

      const bodyLines = isEnglish
        ? [
            "A visitor has started a new chat on the JYC website.",
            "",
            `Path: ${pathname}`,
            `Session ID: ${sessionId}`,
            "",
            "First message:",
            text || "(empty)",
            "",
            "Please reply in the admin chat window on the website.",
          ]
        : [
            "有访客在 JYC 官网发起新的在线咨询。",
            "",
            `访问页面：${pathname}`,
            `会话编号：${sessionId}`,
            "",
            "首条留言：",
            text || "（空白讯息）",
            "",
            "请登入后台在线客服视窗进行回复。",
          ];

      await transporter.sendMail({
        from: `"${WEBSITE_NAME}" <${ADMIN_EMAIL}>`,
        to: ADMIN_EMAIL,
        subject,
        text: bodyLines.join("\n"),
      });

      console.log("Notify email sent for session:", sessionId);
    } catch (err) {
      console.error("notifyNewChatMessage error:", err);
    }
  });
