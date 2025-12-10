// src/app/admin/messages/page.tsx
import React from "react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
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

    return snap.docs.map((doc) => {
      const data = doc.data() as any;
      let createdAt = "";

      const c = data.createdAt;
      if (c && typeof c.toDate === "function") {
        createdAt = c.toDate().toISOString();
      } else if (typeof c === "string") {
        createdAt = c;
      } else if (typeof c === "number") {
        createdAt = new Date(c).toISOString();
      }

      return {
        id: doc.id,
        ...data,
        createdAt,
      } as Message;
    });
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

function renderStatusBadge(status: MessageStatus) {
  const label = renderStatusLabel(status);
  let bg = "#eee";
  let color = "#555";

  if (status === "new") {
    bg = "#fff3cd";
    color = "#b8860b";
  } else if (status === "in_progress") {
    bg = "#e6f4ff";
    color = "#1d5fbf";
  } else if (status === "closed") {
    bg = "#e8f5e9";
    color = "#2e7d32";
  }

  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: 999,
        fontSize: 11,
        background: bg,
        color,
      }}
    >
      {label}
    </span>
  );
}

function formatDate(input: string | undefined) {
  if (!input) return "";
  const d = new Date(input);
  if (!Number.isNaN(d.getTime())) {
    return d.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  // 兜底：如果不是 ISO，就简单截断
  return input.slice(0, 16);
}

// Server Action：更新留言状态
async function updateMessageStatus(formData: FormData) {
  "use server";

  const id = formData.get("id") as string | null;
  const status = formData.get("status") as MessageStatus | null;

  if (!id || !status) return;

  try {
    await db.collection("jyc_messages").doc(id).update({ status });
  } catch (err) {
    console.error("updateMessageStatus error:", err);
  }

  revalidatePath("/admin/messages");
}

type PageProps = {
  searchParams?: {
    status?: string;
  };
};

export default async function AdminMessagesPage({ searchParams }: PageProps) {
  const messages = await getMessages();

  const filterStatus = (searchParams?.status || "all") as
    | MessageStatus
    | "all";

  const filteredMessages =
    filterStatus === "all"
      ? messages
      : messages.filter((m) => m.status === filterStatus);

  const total = messages.length;
  const countNew = messages.filter((m) => m.status === "new").length;
  const countInProgress = messages.filter(
    (m) => m.status === "in_progress"
  ).length;
  const countClosed = messages.filter((m) => m.status === "closed").length;

  const statusFilters: { value: "all" | MessageStatus; label: string }[] = [
    { value: "all", label: `全部 (${total})` },
    { value: "new", label: `待处理 (${countNew})` },
    { value: "in_progress", label: `跟进中 (${countInProgress})` },
    { value: "closed", label: `已结案 (${countClosed})` },
  ];

  return (
    <main className="jyc-page">
      <Header />

      <section className="jyc-section jyc-section-alt">
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <h1 style={{ fontSize: "24px", marginBottom: "8px" }}>
            留言管理（内部）
          </h1>
          <p className="jyc-section-intro">
            本页面用于浏览与管理通过网站提交的在线留言（联系表单与在线助手）。
            当前版本会从 Firestore 的 <code>jyc_messages</code> 集合读取资料，
            并支持按状态筛选与更新处理状态。
          </p>

          {/* 筛选条 & 统计 */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 16,
              marginBottom: 12,
              fontSize: 13,
            }}
          >
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {statusFilters.map((f) => {
                const active = filterStatus === f.value;
                return (
                  <Link
                    key={f.value}
                    href={
                      f.value === "all"
                        ? "/admin/messages"
                        : `/admin/messages?status=${f.value}`
                    }
                    style={{
                      padding: "4px 10px",
                      borderRadius: 999,
                      border: active
                        ? "1px solid #333"
                        : "1px solid #ddd",
                      background: active ? "#333" : "#fff",
                      color: active ? "#fff" : "#333",
                      textDecoration: "none",
                      fontSize: 12,
                    }}
                  >
                    {f.label}
                  </Link>
                );
              })}
            </div>

            <div style={{ fontSize: 12, color: "#777" }}>
              共 {total} 笔留言（显示{" "}
              {filteredMessages.length}
              笔）
            </div>
          </div>

          {/* 列表区域 */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              marginTop: 4,
            }}
          >
            {filteredMessages.length === 0 && (
              <p style={{ fontSize: 13, color: "#777" }}>
                目前没有符合筛选条件的留言，或尚未查询到资料。
              </p>
            )}

            {filteredMessages.map((msg) => (
              <article
                key={msg.id}
                style={{
                  borderRadius: 8,
                  border: "1px solid #e5e5e5",
                  padding: 16,
                  background: "#fff",
                }}
              >
                {/* 顶部：基本资料 + 时间 + 状态 */}
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
                    <strong>{msg.name || "（未留姓名）"}</strong>
                    {msg.company && (
                      <span style={{ marginLeft: 8 }}>
                        ｜{msg.company}
                      </span>
                    )}
                    {msg.email && (
                      <span style={{ marginLeft: 8, color: "#777" }}>
                        ｜{" "}
                        <a
                          href={`mailto:${msg.email}`}
                          style={{ color: "#777" }}
                        >
                          {msg.email}
                        </a>
                      </span>
                    )}
                    {msg.phone && (
                      <span style={{ marginLeft: 8, color: "#777" }}>
                        ｜{" "}
                        <a
                          href={`tel:${msg.phone}`}
                          style={{ color: "#777" }}
                        >
                          {msg.phone}
                        </a>
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      textAlign: "right",
                      fontSize: 12,
                      color: "#999",
                    }}
                  >
                    <div>{formatDate(msg.createdAt)}</div>
                    <div>{renderStatusBadge(msg.status)}</div>
                  </div>
                </div>

                {/* 留言内容 */}
                <p
                  style={{
                    fontSize: 14,
                    color: "#444",
                    lineHeight: 1.7,
                    margin: "4px 0 0",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {msg.content}
                </p>

                {/* 底部：来源 + 状态操作 */}
                <div
                  style={{
                    marginTop: 10,
                    fontSize: 12,
                    color: "#777",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  <div>
                    来源：
                    {msg.source === "contact-form"
                      ? "联系表单"
                      : "在线助手"}
                  </div>

                  {/* 状态更新表单（Server Action） */}
                  <form
                    action={updateMessageStatus}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <input type="hidden" name="id" value={msg.id} />
                    <span>更新状态：</span>
                    <select
                      name="status"
                      defaultValue={msg.status}
                      style={{
                        fontSize: 12,
                        padding: "3px 6px",
                        borderRadius: 4,
                        border: "1px solid #ccc",
                      }}
                    >
                      <option value="new">待处理</option>
                      <option value="in_progress">跟进中</option>
                      <option value="closed">已结案</option>
                    </select>
                    <button
                      type="submit"
                      style={{
                        fontSize: 12,
                        padding: "4px 10px",
                        borderRadius: 4,
                        border: "none",
                        background: "#333",
                        color: "#fff",
                        cursor: "pointer",
                      }}
                    >
                      保存
                    </button>
                  </form>
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
