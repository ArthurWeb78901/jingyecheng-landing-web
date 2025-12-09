// src/app/admin/customers/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

type Lead = {
  id: number;
  name: string;
  company: string;
  contact: string;
  need: string;
  createdAt: string;
  source?: string;
};

export default function AdminCustomersPage() {
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem("jyc_crm_leads");
      const list: Lead[] = raw ? JSON.parse(raw) : [];
      list.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
      setLeads(list);
    } catch (err) {
      console.error("load leads error", err);
    }
  }, []);

  const handleClear = () => {
    if (typeof window === "undefined") return;
    if (!window.confirm("确定要清空当前浏览器中保存的客户资料示意数据吗？")) return;

    window.localStorage.removeItem("jyc_crm_leads");
    setLeads([]);
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
    return `来源：${source}`;
  };

  return (
    <main className="jyc-page">
      <Header />

      <section className="jyc-section jyc-section-alt">
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <h1 style={{ fontSize: "24px", marginBottom: "8px" }}>
            客户资料 / CRM（示意）
          </h1>
          <p className="jyc-section-intro">
            本页面汇总由前台「在线助手」产生的基础客户资讯：
            <br />
            ・在<strong>客服未登入后台（离线模式）</strong>时，系统会依脚本自动向访客询问称呼、公司、联络方式与需求，并记录为一笔线索。
            <br />
            ・在<strong>客服登入后台（人工接管）</strong>时，您可以在访客对话视窗中点击「结束并清除此对话」，系统会将该会话的访客对话内容整合为一笔记录归档到此页面。
            <br />
            当前资料仅保存在<strong>当前浏览器的 localStorage</strong>
            中，方便 Demo 使用；正式上线时可改为储存于服务器端数据库，
            并与正式 CRM / 业务跟进流程整合。
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
              共 {leads.length} 笔记录
              {leads.length > 0 && "（依建立时间由新到旧排列）"}
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
                cursor: "pointer",
              }}
              onClick={handleClear}
            >
              清空示意资料
            </button>
          </div>

          {leads.length === 0 ? (
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
              <br />
              你可以：
              <br />
              1）在<strong>未登入后台</strong>
              的情况下，前往前台首页打开右下角「在线助手」，依照流程输入称呼、公司、联络方式与需求；
              <br />
              2）在<strong>登入后台</strong>
              的情况下，由另一支手机或电脑打开前台网页，使用「在线助手」与客服端聊天，
              然后在后台访客列表中点击「结束并清除此对话」进行归档；
              <br />
              完成后再回到此页面查看效果。
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

                  <div style={{ marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: "#555" }}>
                      联络方式：{lead.contact || "（未填写）"}
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: 12, color: "#555" }}>
                      需求说明：
                      {lead.need
                        ? lead.need
                        : "（未填写／若为在线聊天归档，仅会记录访客对话内容）"}
                    </span>
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
