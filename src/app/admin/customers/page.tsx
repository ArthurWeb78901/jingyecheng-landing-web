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
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";

type Lead = {
  id: string; // Firestore doc id
  name: string; // 称呼
  company: string; // 公司
  contact: string; // 旧版合并联络方式（兼容用）
  contactPerson?: string; // 负责人姓名
  phone?: string; // 电话
  email?: string; // Email
  need: string; // 需求说明
  createdAt: string; // ISO string
  source?: string;
};

export default function AdminCustomersPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  // 从 Firestore 读取 jyc_leads
  useEffect(() => {
    async function fetchLeads() {
      try {
        const q = query(
          collection(db, "jyc_leads"),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);

        const list: Lead[] = snap.docs.map((d) => {
          const data = d.data() as any;
          const c = data.createdAt;
          let createdAtISO = "";
          if (c && typeof c.toDate === "function") {
            createdAtISO = c.toDate().toISOString();
          } else if (typeof c === "string") {
            createdAtISO = c;
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
            createdAt: createdAtISO,
            source: data.source || "",
          };
        });

        setLeads(list);
      } catch (err) {
        console.error("load leads from Firestore error", err);
      } finally {
        setLoading(false);
      }
    }

    fetchLeads();
  }, []);

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
      return "来源：后台手动添加";
    }
    return `来源：${source}`;
  };

  // 编辑单条线索（一次编辑所有字段）
  const handleEdit = async (lead: Lead) => {
    if (typeof window === "undefined") return;

    const name = window.prompt("称呼（姓名）", lead.name) ?? lead.name;
    const company =
      window.prompt("公司 / 单位（可留空）", lead.company) ?? lead.company;
    const contactPerson =
      window.prompt("负责人姓名（可留空）", lead.contactPerson || "") ??
      lead.contactPerson ||
      "";
    const phone =
      window.prompt("联系电话（可留空）", lead.phone || "") ??
      lead.phone ||
      "";
    const email =
      window.prompt("Email（可留空）", lead.email || "") ?? lead.email || "";
    const need =
      window.prompt("需求说明（可留空）", lead.need || "") ?? lead.need || "";

    // 用电话 + Email 合成一行 contact，兼容旧字段
    let contact = lead.contact || "";
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
      await updateDoc(doc(db, "jyc_leads", lead.id), {
        name,
        company,
        contact,
        contactPerson,
        phone,
        email,
        need,
      });

      setLeads((prev) =>
        prev.map((l) =>
          l.id === lead.id
            ? {
                ...l,
                name,
                company,
                contact,
                contactPerson,
                phone,
                email,
                need,
              }
            : l
        )
      );
    } catch (err) {
      console.error("update lead error", err);
      window.alert("更新客户资料失败，请稍后再试。");
    }
  };

  // 删除单条线索
  const handleDeleteOne = async (lead: Lead) => {
    if (typeof window === "undefined") return;
    const ok = window.confirm(
      `确定要删除这笔客户资料吗？\n\n称呼：${lead.name || "（未填写）"}`
    );
    if (!ok) return;

    try {
      await deleteDoc(doc(db, "jyc_leads", lead.id));
      setLeads((prev) => prev.filter((l) => l.id !== lead.id));
    } catch (err) {
      console.error("delete lead error", err);
      window.alert("删除客户资料失败，请稍后再试。");
    }
  };

  // 清空全部线索
  const handleClearAll = async () => {
    if (typeof window === "undefined") return;
    if (leads.length === 0) return;

    const ok = window.confirm(
      `确定要清空当前所有 ${leads.length} 笔客户资料吗？此操作将从 Firestore 中永久删除，无法恢复！`
    );
    if (!ok) return;

    try {
      await Promise.all(
        leads.map((lead) => deleteDoc(doc(db, "jyc_leads", lead.id)))
      );
      setLeads([]);
    } catch (err) {
      console.error("clear all leads error", err);
      window.alert("清空客户资料失败，请稍后再试。");
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
            本页面汇总由前台「在线助手」产生的客户线索，数据存放于
            Firestore 集合 <code>jyc_leads</code> 中：
            <br />
            ・访客在<strong>离线模式</strong>
            下完成资料填写，会自动生成一笔线索；
            <br />
            ・客服在<strong>人工接管</strong>
            时，可以在访客聊天视窗中点击「手动添加客人信息」，将该会话整理成一笔线索；
            <br />
            ・本页支持对任一线索进行编辑与删除，修改会即时写回 Firestore。
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
                ? "资料载入中…"
                : `共 ${leads.length} 笔记录${
                    leads.length > 0 ? "（依建立时间由新到旧排列）" : ""
                  }`}
            </div>
            <button
              type="button"
              style={{
                padding: "4px 10px",
                borderRadius: 4,
                border: "1px solid #c33",
                background: "#fff",
                color: "#c33",
                fontSize: 12,
                cursor: leads.length === 0 ? "not-allowed" : "pointer",
                opacity: leads.length === 0 ? 0.5 : 1,
              }}
              disabled={leads.length === 0}
              onClick={handleClearAll}
            >
              清空全部客户资料
            </button>
          </div>

          {loading ? (
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
              正在从 Firestore 读取客户资料…
            </div>
          ) : leads.length === 0 ? (
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
              目前尚无从在线助手收集或归档的客户资料。
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

                  <div style={{ marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: "#555" }}>
                      联络方式：
                      {lead.phone || lead.email || lead.contact
                        ? [
                            lead.phone && `电话：${lead.phone}`,
                            lead.email && `Email：${lead.email}`,
                            !lead.phone && !lead.email && lead.contact
                              ? lead.contact
                              : null,
                          ]
                            .filter(Boolean)
                            .join(" / ")
                        : "（未填写）"}
                    </span>
                  </div>

                  <div style={{ marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: "#555" }}>
                      需求说明：
                      {lead.need
                        ? lead.need
                        : "（未填写／若为在线聊天归档，仅会记录访客对话内容）"}
                    </span>
                  </div>

                  {/* 操作按钮：编辑 / 删除 */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 8,
                      fontSize: 12,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => handleEdit(lead)}
                      style={{
                        borderRadius: 999,
                        border: "1px solid #333",
                        padding: "2px 10px",
                        background: "#fff",
                        cursor: "pointer",
                      }}
                    >
                      编辑
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteOne(lead)}
                      style={{
                        borderRadius: 999,
                        border: "1px solid #c33",
                        padding: "2px 10px",
                        background: "#fff",
                        color: "#c33",
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
    </main>
  );
}
