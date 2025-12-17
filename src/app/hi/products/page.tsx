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
  brief: string;
  briefEn?: string;
  briefHi?: string;
  heroImageUrl?: string;
  imageUrl?: string;
  enabled: boolean;
  createdAt?: string;
  homeOrder?: number;
};

function pickTextHi(preferHi?: string, preferEn?: string, fallback?: string) {
  const hi = preferHi?.trim();
  if (hi) return hi;
  const en = preferEn?.trim();
  if (en) return en;
  return fallback || "";
}

export default function ProductsHiPage() {
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
            brief: data.brief || "",
            briefEn: data.briefEn || "",
            briefHi: data.briefHi || "",
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

          const aName = pickTextHi(a.nameHi, a.nameEn, a.name);
          const bName = pickTextHi(b.nameHi, b.nameEn, b.name);
          return aName.localeCompare(bName);
        });

        setProducts(enabled);
      } catch (err) {
        console.error("load products from Firestore (HI) error", err);
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
            उत्पाद अवलोकन
          </h1>
          <p className="jyc-section-intro">
            नीचे Taiyuan Jingyecheng Steel Equip Co., Ltd. द्वारा उपलब्ध उत्पादों का
            संक्षिप्त परिचय है। विस्तृत तकनीकी स्पेसिफिकेशन और लाइन कॉन्फ़िगरेशन
            आपकी process, capacity और plant layout requirements के अनुसार कस्टमाइज़
            किए जा सकते हैं—अंतिम तकनीकी प्रस्ताव व कोटेशन के अधीन।
          </p>

          {loading ? (
            <p style={{ fontSize: 14, color: "#777" }}>लोड हो रहा है…</p>
          ) : products.length === 0 ? (
            <p style={{ fontSize: 14, color: "#777" }}>
              अभी कोई प्रकाशित उत्पाद उपलब्ध नहीं है। कृपया admin panel में उत्पाद जोड़ें
              और “Show on frontend” सक्षम करें।
            </p>
          ) : (
            <div className="jyc-card-grid">
              {products.map((p) => {
                const displayName = pickTextHi(p.nameHi, p.nameEn, p.name);
                const fullBrief = pickTextHi(p.briefHi, p.briefEn, p.brief);
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
                        {isExpanded ? "कम दिखाएँ" : "और पढ़ें"}
                      </button>
                    )}

                    <button type="button" className="jyc-card-btn">
                      इस उत्पाद के बारे में पूछें
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
