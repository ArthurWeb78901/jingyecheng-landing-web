// src/app/admin/customers/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { db } from "@/lib/firebase";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";

type Lead = {
  id: string;
  name: string;
  company: string;
  contact: string; // 旧字段：展示用（会由 phone + email 拼成）
  contactPerson?: string;
  phone?: string;
  email?: string;
  need: string;
  createdAt: number | null;
  source?: string;
};

export default function AdminCustomersPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  // 编辑浮窗相关 state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    company: "",
    contactPerson: "",
    phone: "",
    email: "",
    need: "",
  });

  // 从 Firestore 订阅 jyc_leads
  useEffect(() => {
    const q = query(collection(db, "jyc_leads"), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list: Lead[] = snap.docs.map((d) => {
          const data = d.data() as any;
          const c = data.createdAt;
          let ts: number | null = null;
          if (c && typeof c.toMillis === "function") {
            ts = c.toMillis();
          } else if (c && typeof c.seconds === "number") {
            ts = c.seconds * 1000;
          } else if (typeof c === "number") {
            ts = c;
          }

          return {
            id: d.id,
            name: data.name || "",
            company: data.company || "",
            contact: data.contact || "",
            contactPerson: data.contactPerson || "",
            phone: data.phone || "",
            email: data.email || "",
            need: data.need || "",
            createdAt: ts,
            source: data.source || "",
          };
        });

        setLeads(list);
        setLoading(false);
      },
      (err) => {
        console.error("load leads error", err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  const handleClear = async () => {
    if (!window.confirm("确定要清空当前所有客户资料吗？此操作无法恢复。")) return;

    try {
      const coll = collection(db, "jyc_leads");
      // 简单做法：前端根据当前 state 一条条删
      await Promise.all(leads.map((lead) => deleteDoc(doc(coll, lead.id))));
      setLeads([]);
    } catch (err) {
      console.error("clear leads error", err);
      window.alert("清空客户资料失败，请稍后再试。");
    }
  };

  const renderSourceLabel = (source?: string) => {
    if (!source) return "";
    if (source === "chat-bubble") {
      return "来源：在线助手（离线自动收集）";
    }
    if (
      source === "online-chat-archive" ||
      source === "在线助手（人工接管会话归档）"
    ) {
      return "来源：在线助手（人工接管会话归档）";
    }
    if (source === "admin-manual") {
      return "来源：后台手动新增";
    }
    return `来源：${source}`;
  };

  const handleDelete = async (lead: Lead) => {
    if (!window.confirm(`确定要删除「${lead.name || "（未填写称呼）"}」这笔资料吗？`))
      return;

    try {
      await deleteDoc(doc(db, "jyc_leads", lead.id));
      setLeads((prev) => prev.filter((l) => l.id !== lead.id));
    } catch (err) {
      console.error("delete lead error", err);
      window.alert("删除客户资料失败，请稍后再试。");
    }
  };

  // 打开编辑浮窗
  const openEditModal = (lead: Lead) => {
    setEditingLead(lead);
    setEditForm({
      name: lead.name || "",
      company: lead.company || "",
      contactPerson: lead.contactPerson || "",
      phone: lead.phone || "",
      email: lead.email || "",
      need: lead.need || "",
    });
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingLead(null);
  };

  const handleEditFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // 保存编辑结果
  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;

    const { name, company, contactPerson, phone, email, need } = editForm;

    // 用电话 + Email 合成一行 contact（兼容旧字段）
    let contact = editingLead.contact || "";
    if (phone || email) {
      if (phone && email) {
        contact = `电话：${phone} / Email：${email}`;
      } else if (phone) {
        contact = `电话：${phone}`;
      } else if (email) {
        contact = `Email：${email}`;
      }
    }

    try {
      await updateDoc(doc(db, "jyc_leads", editingLead.id), {
        name,
        company,
        contactPerson,
        phone,
        email,
        need,
        contact,
      });

      setLeads((prev) =>
        prev.map((l) =>
          l.id === editingLead.id
            ? {
                ...l,
                name,
                company,
                contactPerson,
                phone,
                email,
                need,
                contact,
              }
            : l
        )
      );

      closeEditModal();
    } catch (err) {
      console.error("update lead error", err);
      window.alert("更新客户资料失败，请稍后再试。");
    }
  };

  return (
    <main className="jyc-page">
      <Header />

      <section className="jyc-section jyc-section-alt">
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <h1 style={{ fontSize: "24px", marginBottom: "8px" }}>
            客户资料 / CRM
          </h1>
          <p className="jyc-section-intro">
            本页面汇总由前台「在线助手」产生的基础客户资讯。
            <br />
            ・离线模式：脚本自动询问称呼、公司、联络方式与需求。
            <br />
            ・人工接管：结束会话时可将对话整理成一笔线索保存到 Firestore。
            <br />
            你也可以在此页面对任一线索进行编辑与删除。
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
              fontSize: 13,
            }}
          >
            <div>
              {loading
                ? "载入中…"
                : `共 ${leads.length} 笔记录${
                    leads.length > 0 ? "（依建立时间由新到旧排列）" : ""
                  }`}
            </div>
            {leads.length > 0 && (
              <button
                type="button"
                style={{
                  padding: "4px 10px",
                  borderRadius: 4,
                  border: "1px solid #c33",
                  background: "#fff",
                  color: "#c33",
                  fontSize: 12,
                  cursor: "pointer",
                }}
                onClick={handleClear}
              >
                清空全部客户资料
              </button>
            )}
          </div>

          {leads.length === 0 && !loading ? (
            <div
              style={{
                padding: 16,
                borderRadius: 8,
                border: "1px solid #e5e5e5",
                background: "#fff",
                fontSize: 13,
                color: "#666",
              }}
            >
              目前尚无客户资料，请先透过「在线助手」产生线索，或在后台聊天面板中手动保存线索。
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {leads.map((lead) => (
                <article
                  key={lead.id}
                  style={{
                    borderRadius: 8,
                    border: "1px solid #e5e5e5",
                    padding: 12,
                    background: "#fff",
                    fontSize: 13,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 4,
                    }}
                  >
                    <div>
                      <strong>{lead.name || "（未填写称呼）"}</strong>
                      {lead.company && (
                        <span style={{ marginLeft: 8, color: "#777" }}>
                          ｜{lead.company}
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#999",
                        textAlign: "right",
                      }}
                    >
                      <div>
                        {lead.createdAt
                          ? new Date(lead.createdAt).toLocaleString()
                          : ""}
                      </div>
                      <div>{renderSourceLabel(lead.source)}</div>
                    </div>
                  </div>

                  {lead.contactPerson && (
                    <div style={{ marginBottom: 2 }}>
                      <span style={{ fontSize: 12, color: "#555" }}>
                        负责人：{lead.contactPerson}
                      </span>
                    </div>
                  )}

                  <div style={{ marginBottom: 2 }}>
                    <span style={{ fontSize: 12, color: "#555" }}>
                      联络方式：
                      {lead.contact
                        ? lead.contact
                        : lead.phone || lead.email
                        ? `${lead.phone || ""}${
                            lead.phone && lead.email ? " / " : ""
                          }${lead.email || ""}`
                        : "（未填写）"}
                    </span>
                  </div>

                  <div style={{ marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: "#555" }}>
                      需求说明：
                      {lead.need
                        ? lead.need
                        : "（未填写／若为在线聊天归档，仅会记录访客对话内容）"}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 8,
                      marginTop: 4,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => openEditModal(lead)}
                      style={{
                        padding: "4px 10px",
                        borderRadius: 999,
                        border: "1px solid #555",
                        background: "#fff",
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >
                      编辑
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(lead)}
                      style={{
                        padding: "4px 10px",
                        borderRadius: 999,
                        border: "1px solid #c33",
                        background: "#fff5f5",
                        color: "#c33",
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >
                      删除
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />

      {/* 编辑浮窗 */}
      {editModalOpen && editingLead && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 480,
              background: "#fff",
              borderRadius: 8,
              padding: 16,
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            }}
          >
            <h2
              style={{
                fontSize: 18,
                margin: "0 0 8px",
              }}
            >
              编辑客户资料
            </h2>
            <p
              style={{
                fontSize: 12,
                color: "#777",
                marginBottom: 12,
              }}
            >
              访客编号：{editingLead.id.slice(-6)}
            </p>

            <form onSubmit={handleEditSave} style={{ fontSize: 13 }}>
              <div style={{ marginBottom: 8 }}>
                <label>
                  称呼（姓名）
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleEditFormChange}
                    style={{
                      width: "100%",
                      marginTop: 4,
                      padding: "6px 8px",
                      borderRadius: 4,
                      border: "1px solid #ccc",
                    }}
                  />
                </label>
              </div>

              <div style={{ marginBottom: 8 }}>
                <label>
                  公司 / 单位
                  <input
                    type="text"
                    name="company"
                    value={editForm.company}
                    onChange={handleEditFormChange}
                    style={{
                      width: "100%",
                      marginTop: 4,
                      padding: "6px 8px",
                      borderRadius: 4,
                      border: "1px solid #ccc",
                    }}
                  />
                </label>
              </div>

              <div style={{ marginBottom: 8 }}>
                <label>
                  负责人姓名
                  <input
                    type="text"
                    name="contactPerson"
                    value={editForm.contactPerson}
                    onChange={handleEditFormChange}
                    style={{
                      width: "100%",
                      marginTop: 4,
                      padding: "6px 8px",
                      borderRadius: 4,
                      border: "1px solid #ccc",
                    }}
                  />
                </label>
              </div>

              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <label>
                    电话
                    <input
                      type="text"
                      name="phone"
                      value={editForm.phone}
                      onChange={handleEditFormChange}
                      style={{
                        width: "100%",
                        marginTop: 4,
                        padding: "6px 8px",
                        borderRadius: 4,
                        border: "1px solid #ccc",
                      }}
                    />
                  </label>
                </div>
                <div style={{ flex: 1 }}>
                  <label>
                    Email
                    <input
                      type="email"
                      name="email"
                      value={editForm.email}
                      onChange={handleEditFormChange}
                      style={{
                        width: "100%",
                        marginTop: 4,
                        padding: "6px 8px",
                        borderRadius: 4,
                        border: "1px solid #ccc",
                      }}
                    />
                  </label>
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label>
                  需求说明
                  <textarea
                    name="need"
                    value={editForm.need}
                    onChange={handleEditFormChange}
                    rows={4}
                    style={{
                      width: "100%",
                      marginTop: 4,
                      padding: "6px 8px",
                      borderRadius: 4,
                      border: "1px solid #ccc",
                      resize: "vertical",
                    }}
                  />
                </label>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 8,
                }}
              >
                <button
                  type="button"
                  onClick={closeEditModal}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 4,
                    border: "1px solid #ccc",
                    background: "#fff",
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  取消
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "6px 14px",
                    borderRadius: 4,
                    border: "none",
                    background: "#333",
                    color: "#fff",
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
