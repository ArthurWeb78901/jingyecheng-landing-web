// src/app/products/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

type ProductDoc = {
  id: string;          // Firestore doc id
  category: string;    // 产品分类（穿孔机、轧钢生产线设备…）
  name: string;        // 产品名称
  brief: string;       // 简短简介
  heroImageUrl?: string; // 列表 / 首页用的主图
  enabled: boolean;    // 是否在前台显示
  createdAt?: string;  // 排序用（ISO 字串，可选）
};

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        // 按 createdAt 新到旧排，集合名和后端保持一致：jyc_products
        const q = query(
          collection(db, "jyc_products"),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);

        const list: ProductDoc[] = snap.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            category: data.category || "",
            name: data.name || "",
            brief: data.brief || "",
            heroImageUrl: data.heroImageUrl || data.imageUrl || "",
            enabled: data.enabled !== false, // 没填就当作 true
            createdAt: data.createdAt || "",
          };
        });

        // 只显示启用（前台显示）的产品
        const enabled = list.filter((p) => p.enabled);

        setProducts(enabled);
      } catch (err) {
        console.error("load products from Firestore error", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

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
            以下为山西太矿钢管设备有限公司目前已上线的产品资讯。实际机组配置与详细技术规格可依据现场工艺、
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
              {products.map((p) => (
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
                      marginBottom: "10px",
                      whiteSpace: "pre-line", // 如果简介有分行，可以正确换行
                    }}
                  >
                    {p.brief}
                  </p>

                  <button type="button" className="jyc-card-btn">
                    询问此类设备
                  </button>
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
