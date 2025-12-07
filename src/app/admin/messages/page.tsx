// src/app/admin/messages/page.tsx
import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { db } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

type MessageStatus = "new" | "in_progress" | "closed";

type Message = {
  id: string;
  name: string;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  content: string;
  source: "contact-form" | "chatbot";
  status: MessageStatus;
  createdAt: string;
};

async function getMessages(): Promise<Message[]> {
  try {
    const snap = await db
      .collection("jyc_messages")
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();

    return snap.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as any),
    }));
  } catch (err) {
    console.error("Admin getMessages error:", err);
    return [];
  }
}

function renderStatusLabel(status: MessageStatus) {
  switch (status) {
    case "new":
      return "待处理";
    case "in_progress":
      return "跟进中";
    case "closed":
      return "已结案";
    default:
      return "";
  }
}

export default async function AdminMessagesPage() {
  const messages = await getMessages();

  return (
    <main className="jyc-page">
      <Header />

      <section className="jyc-section jyc-section-alt">
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <h1 style={{ fontSize: "24px", marginBottom: "8px" }}>
            留言管理（内部）
          </h1>
          <p className="jyc-section-intro">
            本页面仅供公司内部人员使用，用于浏览与管理通过网站提交的在线留言。
            当前版本会从 Firestore 的 jyc_messages 集合读取资料；若读取失败，
            页面会先显示为空列表，并在主机端记录错误日志以便排查。
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              marginTop: 16,
            }}
          >
            {messages.length === 0 && (
              <p style={{ fontSize: 13, color: "#777" }}>
                目前尚未查询到留言资料，或读取权限尚未完成设定。
              </p>
            )}

            {messages.map((msg) => (
              <article
                key={msg.id}
                style={{
                  borderRadius: 8,
                  border: "1px solid #e5e5e5",
                  padding: 16,
                  background: "#fff",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 6,
                    fontSize: 13,
                    color: "#555",
                  }}
                >
                  <div>
                    <strong>{msg.name}</strong>
                    {msg.company ? (
                      <span style={{ marginLeft: 8 }}>｜{msg.company}</span>
                    ) : null}
                    {msg.email ? (
                      <span style={{ marginLeft: 8, color: "#777" }}>
                        ｜{msg.email}
                      </span>
                    ) : null}
                  </div>
                  <span style={{ color: "#999", fontSize: 12 }}>
                    {msg.createdAt?.slice(0, 10)}
                  </span>
                </div>

                <p
                  style={{
                    fontSize: 14,
                    color: "#444",
                    lineHeight: 1.7,
                    margin: 0,
                  }}
                >
                  {msg.content}
                </p>

                <div
                  style={{
                    marginTop: 8,
                    fontSize: 12,
                    color: "#777",
                    display: "flex",
                    gap: 12,
                  }}
                >
                  <span>
                    来源：
                    {msg.source === "contact-form" ? "联系表单" : "在线助手"}
                  </span>
                  <span>状态：{renderStatusLabel(msg.status)}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
