// src/app/en/products/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

type ProductDoc = {
  id: string;           // Firestore doc id
  category: string;     // 中文分類（optional 顯示）
  name: string;         // 中文名稱
  nameEn?: string;      // 英文名稱（可選）
  brief: string;        // 中文簡介
  briefEn?: string;     // 英文簡介（可選）
  heroImageUrl?: string;
  imageUrl?: string;
  enabled: boolean;
  createdAt?: string;
};

export default function ProductsEnPage() {
  const [products, setProducts] = useState<ProductDoc[]>([]);
  const [loading, setLoading] = useState(true);

  // 每個產品的「展開 / 收合」狀態
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function fetchProducts() {
      try {
        // 和首頁邏輯統一：用 name 排序
        const q = query(
          collection(db, "jyc_products"),
          orderBy("name", "asc")
        );
        const snap = await getDocs(q);

        const list: ProductDoc[] = snap.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            category: data.category || "",
            name: data.name || "",
            nameEn: data.nameEn || "",
            brief: data.brief || "",
            briefEn: data.briefEn || "",
            heroImageUrl: data.heroImageUrl || data.imageUrl || "",
            imageUrl: data.imageUrl || "",
            // 沒填 enabled 就當作 true
            enabled: data.enabled ?? true,
            createdAt: data.createdAt || "",
          };
        });

        const enabled = list.filter((p) => p.enabled);
        setProducts(enabled);
      } catch (err) {
        console.error("load products from Firestore (EN) error", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  // 最大顯示字數（超過就顯示「Read more」）
  const MAX_CHARS = 420;

  return (
    <main className="jyc-page">
      <Header />

      <section className="jyc-section jyc-section-alt">
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <h1 style={{ fontSize: "26px", marginBottom: "8px" }}>
            Products Overview
          </h1>
          <p className="jyc-section-intro">
            Below are the products currently provided by Shanxi Taikuang Steel
            Pipe Equipment Co., Ltd. Detailed technical specifications and line
            configurations can be tailored to process, capacity and plant layout
            requirements, and are subject to the final technical proposal and
            quotation.
          </p>

          {loading ? (
            <p style={{ fontSize: 14, color: "#777" }}>Loading…</p>
          ) : products.length === 0 ? (
            <p style={{ fontSize: 14, color: "#777" }}>
              No published products are available yet. Please add products in
              the admin panel and enable &quot;Show on frontend&quot;.
            </p>
          ) : (
            <div className="jyc-card-grid">
              {products.map((p) => {
                const displayName =
                  p.nameEn && p.nameEn.trim().length > 0 ? p.nameEn : p.name;

                const fullBrief =
                  p.briefEn && p.briefEn.trim().length > 0
                    ? p.briefEn
                    : p.brief;

                const bgUrl = p.heroImageUrl || p.imageUrl || "";

                const isExpanded = !!expandedMap[p.id];
                const isLong = fullBrief && fullBrief.length > MAX_CHARS;

                const shownText =
                  !isLong || isExpanded
                    ? fullBrief
                    : fullBrief.slice(0, MAX_CHARS) + "…";

                return (
                  <article key={p.id} className="jyc-card">
                    <div
                      className="jyc-card-image"
                      style={{
                        backgroundColor: "#f0f0f0",
                        backgroundImage: bgUrl ? `url(${bgUrl})` : undefined,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />

                    <h2 style={{ fontSize: "18px", marginBottom: "4px" }}>
                      {displayName}
                    </h2>

                    {p.category && (
                      <div
                        style={{
                          fontSize: "13px",
                          color: "#999",
                          marginBottom: "8px",
                        }}
                      >
                        Category (CN): {p.category}
                      </div>
                    )}

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
                        {isExpanded ? "Show less" : "Read more"}
                      </button>
                    )}

                    <button type="button" className="jyc-card-btn">
                      Ask About This Product
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
