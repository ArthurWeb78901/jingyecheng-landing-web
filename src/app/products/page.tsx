// src/app/products/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ChatBubble } from "@/components/ChatBubble";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

type ProductDoc = {
  id: string;            // Firestore doc id
  category: string;      // 产品分类
  name: string;          // 产品名称（中文）
  brief: string;         // 简短简介（中文）
  heroImageUrl?: string; // 列表 / 首页用的主图
  enabled: boolean;      // 是否在前台显示
  homeOrder?: number;    // ⭐ 首页 / 列表排序（1,2,3…，数字越小越靠前）
};

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductDoc[]>([]);
  const [loading, setLoading] = useState(true);

  // 「展开/收起」状态
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});

  // 超过这个字数就只显示前面一段
  const MAX_CHARS = 420;

  useEffect(() => {
    async function fetchProducts() {
      try {
        // Firestore 仍然用 name 排序，避免 createdAt 相关问题
        const q = query(
          collection(db, "jyc_products"),
          orderBy("name", "asc")
        );
        const snap = await getDocs(q);

        const list: ProductDoc[] = snap.docs.map((d) => {
          const data = d.data() as any;

          const homeOrderRaw = data.homeOrder;
          const homeOrder =
            typeof homeOrderRaw === "number"
              ? homeOrderRaw
              : Number.MAX_SAFE_INTEGER; // 没设定的排在最后

          return {
            id: d.id,
            category: data.category || "",
            name: data.name || "",
            brief: data.brief || "",
            heroImageUrl: data.heroImageUrl || data.imageUrl || "",
            enabled: data.enabled ?? true,
            homeOrder,
          };
        });

        // 只保留「前台显示」的
        const enabledList = list.filter((p) => p.enabled);

        // ⭐ 依 homeOrder 排序；同一个数字时再用名称当次序
        enabledList.sort((a, b) => {
          const ao =
            typeof a.homeOrder === "number"
              ? a.homeOrder
              : Number.MAX_SAFE_INTEGER;
          const bo =
            typeof b.homeOrder === "number"
              ? b.homeOrder
              : Number.MAX_SAFE_INTEGER;

          if (ao !== bo) return ao - bo;

          // 次要排序：按中文名称
          return a.name.localeCompare(b.name, "zh-Hans");
        });

        setProducts(enabledList);
      } catch (err) {
        console.error("load products from Firestore error", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  // 点击「询问此类设备」=> 打开右下角在线助手，并预填产品名
  function handleAskProduct(productName: string) {
    if (typeof window === "undefined") return;

    const msg = `您好，我想咨询一下关于「${productName}」这类设备的详细资讯。`;

    const evt = new CustomEvent("jyc-open-chat", {
      detail: { message: msg },
    });

    window.dispatchEvent(evt);
  }

  return (
    <main className="jyc-page">
      <Header />

      {/* 产品列表主体 */}
      <section className="jyc-section">
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <h1 style={{ fontSize: "26px", marginBottom: "8px" }}>
            产品与设备一览
          </h1>
          <p className="jyc-section-intro">
            以下为太原精业城重工设备有限公司目前已上线的产品资讯。实际机组配置与详细技术规格可依据现场工艺、
            产量与设备布局需求进行客制，最终以正式技术方案与报价文件为准。
          </p>

          {loading ? (
            <p style={{ fontSize: 14, color: "#777" }}>加载中…</p>
          ) : products.length === 0 ? (
            <p style={{ fontSize: 14, color: "#777" }}>
              目前尚未有任何已发布的产品。请先在「产品资讯管理」后台新增产品并勾选「在前台显示此产品」。
            </p>
          ) : (
            <div className="jyc-card-grid">
              {products.map((p) => {
                const isExpanded = !!expandedMap[p.id];
                const isLong = p.brief && p.brief.length > MAX_CHARS;

                const shownText =
                  !isLong || isExpanded
                    ? p.brief
                    : p.brief.slice(0, MAX_CHARS) + "…";

                return (
                  <article key={p.id} className="jyc-card">
                    <div
                      className="jyc-card-image"
                      style={{
                        backgroundColor: "#f0f0f0",
                        backgroundImage: p.heroImageUrl
                          ? `url(${p.heroImageUrl})`
                          : undefined,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />

                    <h2 style={{ fontSize: "18px", marginBottom: "4px" }}>
                      {p.name}
                    </h2>

                    <div
                      style={{
                        fontSize: "13px",
                        color: "#999",
                        marginBottom: "8px",
                      }}
                    >
                      类别：{p.category}
                    </div>

                    <p
                      style={{
                        fontSize: "14px",
                        color: "#555",
                        marginBottom: isLong ? "4px" : "10px",
                        whiteSpace: "pre-line",
                      }}
                    >
                      {shownText}
                    </p>

                    {isLong && (
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedMap((prev) => ({
                            ...prev,
                            [p.id]: !prev[p.id],
                          }))
                        }
                        style={{
                          border: "none",
                          background: "transparent",
                          color: "#0066cc",
                          fontSize: 13,
                          padding: 0,
                          marginBottom: 10,
                          cursor: "pointer",
                          textDecoration: "underline",
                          textUnderlineOffset: 2,
                          alignSelf: "flex-start",
                        }}
                      >
                        {isExpanded ? "收起全文" : "展开更多介绍"}
                      </button>
                    )}

                    <button
                      type="button"
                      className="jyc-card-btn"
                      onClick={() => handleAskProduct(p.name)}
                    >
                      询问此类设备
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />

      {/* 在线助手浮窗（全站共用） */}
      <ChatBubble />
    </main>
  );
}
