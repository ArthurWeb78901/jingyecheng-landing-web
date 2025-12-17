"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

type ProductDoc = {
  id: string;
  category: string;
  name: string;
  nameEn?: string;
  nameHi?: string;
  nameId?: string;
  brief: string;
  briefEn?: string;
  briefHi?: string;
  briefId?: string;
  heroImageUrl?: string;
  imageUrl?: string;
  enabled: boolean;
  createdAt?: string;
  homeOrder?: number;
};

function pickTextId(preferId?: string, preferEn?: string, fallback?: string) {
  const id = preferId?.trim();
  if (id) return id;
  const en = preferEn?.trim();
  if (en) return en;
  return fallback || "";
}

export default function ProductsIdPage() {
  const [products, setProducts] = useState<ProductDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function fetchProducts() {
      try {
        const q = query(collection(db, "jyc_products"), orderBy("name", "asc"));
        const snap = await getDocs(q);

        const list: ProductDoc[] = snap.docs.map((d) => {
          const data = d.data() as any;
          const homeOrderRaw = data.homeOrder;
          const homeOrder = typeof homeOrderRaw === "number" ? homeOrderRaw : Number.MAX_SAFE_INTEGER;

          return {
            id: d.id,
            category: data.category || "",
            name: data.name || "",
            nameEn: data.nameEn || "",
            nameHi: data.nameHi || "",
            nameId: data.nameId || "",
            brief: data.brief || "",
            briefEn: data.briefEn || "",
            briefHi: data.briefHi || "",
            briefId: data.briefId || "",
            heroImageUrl: data.heroImageUrl || data.imageUrl || "",
            imageUrl: data.imageUrl || "",
            enabled: data.enabled ?? true,
            createdAt: data.createdAt || "",
            homeOrder,
          };
        });

        const enabled = list.filter((p) => p.enabled);

        enabled.sort((a, b) => {
          const ao = typeof a.homeOrder === "number" ? a.homeOrder : Number.MAX_SAFE_INTEGER;
          const bo = typeof b.homeOrder === "number" ? b.homeOrder : Number.MAX_SAFE_INTEGER;
          if (ao !== bo) return ao - bo;

          const aName = pickTextId(a.nameId, a.nameEn, a.name);
          const bName = pickTextId(b.nameId, b.nameEn, b.name);
          return aName.localeCompare(bName);
        });

        setProducts(enabled);
      } catch (err) {
        console.error("load products from Firestore (ID) error", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const MAX_CHARS = 300;

  return (
    <main className="jyc-page">
      <Header />

      <section className="jyc-section jyc-section-alt">
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <h1 style={{ fontSize: "26px", marginBottom: "8px" }}>
            Ikhtisar Produk
          </h1>
          <p className="jyc-section-intro">
            Berikut adalah produk yang saat ini disediakan oleh Taiyuan Jingyecheng
            Steel Equip Co., Ltd. Spesifikasi teknis dan konfigurasi lini dapat
            disesuaikan dengan proses, kapasitas, dan kebutuhan tata letak pabrik,
            serta mengacu pada proposal teknis dan penawaran final.
          </p>

          {loading ? (
            <p style={{ fontSize: 14, color: "#777" }}>Memuat…</p>
          ) : products.length === 0 ? (
            <p style={{ fontSize: 14, color: "#777" }}>
              Belum ada produk yang dipublikasikan. Silakan tambahkan produk di admin panel
              dan aktifkan “Show on frontend”.
            </p>
          ) : (
            <div className="jyc-card-grid">
              {products.map((p) => {
                const displayName = pickTextId(p.nameId, p.nameEn, p.name);
                const fullBrief = pickTextId(p.briefId, p.briefEn, p.brief);
                const bgUrl = p.heroImageUrl || p.imageUrl || "";

                const isExpanded = !!expandedMap[p.id];
                const isLong = fullBrief && fullBrief.length > MAX_CHARS;
                const shownText = !isLong || isExpanded ? fullBrief : fullBrief.slice(0, MAX_CHARS) + "…";

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
                      <div style={{ fontSize: "13px", color: "#999", marginBottom: "8px" }}>
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
                        {isExpanded ? "Tampilkan lebih sedikit" : "Baca selengkapnya"}
                      </button>
                    )}

                    <button type="button" className="jyc-card-btn">
                      Tanyakan Produk Ini
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
