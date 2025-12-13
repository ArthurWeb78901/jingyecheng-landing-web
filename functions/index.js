// functions/index.js
const functions = require("firebase-functions/v1");  // 👈 改成 v1 相容層
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

// ====== 基本設定 ======
const WEBSITE_NAME = "JYC Steel Equip 网站";
const ADMIN_EMAIL = "jycsteelequip@hotmail.com";

// ⚠️ 這裡用 Hotmail/Outlook 的「應用程式密碼」，不要用一般登入密碼
const SMTP_PASS = "kqnwsfbgqxoctxgg";

// Hotmail / Outlook 用的 SMTP 設定
const transporter = nodemailer.createTransport({
  host: "smtp.office365.com",
  port: 587,
  secure: false,
  auth: {
    user: ADMIN_EMAIL,
    pass: SMTP_PASS,
  },
});

// Firestore 觸發：有新的聊天訊息時
exports.notifyNewChatMessage = functions.firestore
  .document("jyc_chat_messages/{docId}")
  .onCreate(async (snap, context) => {
    const data = snap.data() || {};

    const from = data.from || "user";
    const sessionId = data.sessionId || "unknown";
    const text = (data.text || "").toString().slice(0, 2000);
    const pathname = data.pathname || "/";

    // 只針對「訪客」發的訊息；機器人 / 管理員的不發信
    if (from !== "user") {
      return;
    }

    const db = admin.firestore();

    try {
      // 用 jyc_chat_sessions/{sessionId} 做「只寄一次」的鎖
      const sessionRef = db.collection("jyc_chat_sessions").doc(sessionId);
      const sessionSnap = await sessionRef.get();

      // 如果這個 session 已經做過通知，就不再寄信
      if (sessionSnap.exists) {
        return;
      }

      // 第一次看到這個 session：記錄一下
      await sessionRef.set({
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        firstMessageId: snap.id,
      });

      // 粗略判斷語系：看 path 是否以 /en 開頭
      const isEnglish =
        typeof pathname === "string" && pathname.startsWith("/en");

      const subject = isEnglish
        ? "New website chat inquiry (JYC)"
        : "【JYC 官网】有新的访客在线咨询";

      const body = isEnglish
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
          ].join("\n")
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
          ].join("\n");

      await transporter.sendMail({
        from: `"${WEBSITE_NAME}" <${ADMIN_EMAIL}>`,
        to: ADMIN_EMAIL,
        subject,
        text: body,
      });

      console.log("Notify email sent for session:", sessionId);
    } catch (err) {
      console.error("notifyNewChatMessage error:", err);
    }
  });
