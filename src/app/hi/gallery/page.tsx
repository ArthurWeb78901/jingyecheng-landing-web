"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

type GalleryCategory = "设备展示" | "生产线现场" | "工程案例" | "展会与交流";
type MachineTemp = "hot" | "cold";

type GalleryDoc = {
  id: string;
  title: string;
  titleEn?: string;
  titleHi?: string;
  titleId?: string;
  category: GalleryCategory;
  imageUrl?: string;
  createdAt?: string;
  machineTemp?: MachineTemp;
};

const CATEGORY_META_HI: {
  key: GalleryCategory;
  title: string;
  description: string;
}[] = [
  {
    key: "设备展示",
    title: "उपकरण अवलोकन",
    description:
      "सीमलेस पाइप मिल्स और रोलिंग मिल्स के प्रमुख उपकरण—मुख्य यूनिट्स और संरचनात्मक विवरण सहित।",
  },
  {
    key: "生产线现场",
    title: "प्रोडक्शन लाइन साइट्स",
    description:
      "पूर्ण प्रोडक्शन लाइनों की ऑन-साइट तस्वीरें—लेआउट और संचालन वातावरण सहित।",
  },
  {
    key: "工程案例",
    title: "प्रोजेक्ट रेफ़रेंसेज़",
    description:
      "ग्राहकों को डिलीवर किए गए प्रतिनिधि प्रोजेक्ट्स और उनके कार्यान्वयन परिणाम।",
  },
  {
    key: "展会与交流",
    title: "प्रदर्शनियाँ और तकनीकी आदान-प्रदान",
    description:
      "उद्योग प्रदर्शनियों तथा ग्राहकों/साझेदारों के साथ तकनीकी आदान-प्रदान गतिविधियों की तस्वीरें।",
  },
];

function pickTitleHi(item: GalleryDoc) {
  const hi = item.titleHi?.trim();
  if (hi) return hi;
  const en = item.titleEn?.trim();
  if (en) return en;
  return item.title || "";
}

export default function GalleryHiPage() {
  const [items, setItems] = useState<GalleryDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGallery() {
      try {
        const q = query(
          collection(db, "jyc_gallery"),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);

        const list: GalleryDoc[] = snap.docs.map((d) => {
          const data = d.data() as any;

          let category = data.category as GalleryCategory;
          if (
            category !== "设备展示" &&
            category !== "生产线现场" &&
            category !== "工程案例" &&
            category !== "展会与交流"
          ) {
            category = "设备展示";
          }

          let machineTemp: MachineTemp | undefined;
          if (data.machineTemp === "hot" || data.machineTemp === "cold") {
            machineTemp = data.machineTemp;
          }

          return {
            id: d.id,
            title: data.title || "",
            titleEn: data.titleEn || "",
            titleHi: data.titleHi || "",
            titleId: data.titleId || "",
            category,
            imageUrl: data.imageUrl || "",
            createdAt: data.createdAt || "",
            machineTemp,
          };
        });

        setItems(list);
      } catch (err) {
        console.error("load gallery items from Firestore (HI) error", err);
      } finally {
        setLoading(false);
      }
    }

    loadGallery();
  }, []);

  const hotSections = CATEGORY_META_HI.map((meta) => ({
    ...meta,
    items: items.filter(
      (it) => it.machineTemp === "hot" && it.category === meta.key
    ),
  })).filter((sec) => sec.items.length > 0);

  const coldSections = CATEGORY_META_HI.map((meta) => ({
    ...meta,
    items: items.filter(
      (it) => it.machineTemp === "cold" && it.category === meta.key
    ),
  })).filter((sec) => sec.items.length > 0);

  const hasHot = hotSections.length > 0;
  const hasCold = coldSections.length > 0;

  const renderCategorySection = (section: {
    key: GalleryCategory;
    title: string;
    description: string;
    items: GalleryDoc[];
  }) => (
    <div key={section.key} style={{ marginTop: 24 }}>
      <h3 style={{ fontSize: "18px", marginBottom: "6px" }}>{section.title}</h3>
      <p
        style={{
          fontSize: "13px",
          color: "#666",
          marginBottom: 10,
          lineHeight: 1.6,
        }}
      >
        {section.description}
      </p>

      <div className="jyc-gallery-grid">
        {section.items.map((item) => {
          const label = pickTitleHi(item);

          return (
            <div
              key={item.id}
              className="jyc-gallery-item"
              style={{
                position: "relative",
                backgroundColor: "#e0e0e0",
                backgroundImage: item.imageUrl
                  ? `url(${item.imageUrl})`
                  : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {label && (
                <span
                  style={{
                    position: "absolute",
                    left: 8,
                    bottom: 8,
                    fontSize: 12,
                    color: "#555",
                    background: "rgba(255,255,255,0.9)",
                    padding: "2px 6px",
                    borderRadius: 4,
                  }}
                >
                  {label}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <main className="jyc-page">
      <Header />

      <section className="jyc-section">
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <h1 style={{ fontSize: "24px", marginBottom: "8px" }}>गैलरी</h1>
          <p className="jyc-section-intro">
            प्रमुख उपकरणों और प्रोडक्शन लाइनों की तस्वीरें—जैसे पियर्सिंग मिल्स, पाइप
            रोलिंग मिल्स, साइजिंग/रिड्यूसिंग मिल्स, स्ट्रेटनिंग मशीनें, कूलिंग बेड्स,
            हॉट सेंट्रिंग मशीनें और कोल्ड ड्रॉइंग मशीनें—साथ ही सामान्य/प्रतिनिधि
            प्रोजेक्ट संदर्भ।
          </p>

          {loading ? (
            <p style={{ fontSize: 14, color: "#777" }}>लोड हो रहा है…</p>
          ) : !hasHot && !hasCold ? (
            <div className="jyc-gallery-grid">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="jyc-gallery-item" />
              ))}
            </div>
          ) : (
            <>
              {hasHot && (
                <section style={{ marginTop: 24 }}>
                  <h2 style={{ fontSize: "20px", marginBottom: 6 }}>
                    हॉट प्रोसेसिंग उपकरण
                  </h2>
                  <p
                    style={{
                      fontSize: 14,
                      color: "#666",
                      marginBottom: 12,
                      lineHeight: 1.6,
                    }}
                  >
                    हॉट रोलिंग और थर्मल प्रोसेसिंग में उपयोग होने वाले उपकरण और
                    प्रोडक्शन लाइनें—पियर्सिंग मिल्स, हॉट रोलिंग मिल्स तथा संबंधित
                    सहायक यूनिट्स सहित।
                  </p>

                  {hotSections.map(renderCategorySection)}
                </section>
              )}

              {hasCold && (
                <section style={{ marginTop: 32 }}>
                  <h2 style={{ fontSize: "20px", marginBottom: 6 }}>
                    कोल्ड प्रोसेसिंग उपकरण
                  </h2>
                  <p
                    style={{
                      fontSize: 14,
                      color: "#666",
                      marginBottom: 12,
                      lineHeight: 1.6,
                    }}
                  >
                    कोल्ड ड्रॉइंग और कोल्ड फिनिशिंग प्रक्रियाओं में उपयोग होने वाले
                    उपकरण—जैसे कोल्ड ड्रॉइंग बेंच, स्ट्रेटनिंग मशीनें तथा संबंधित
                    सहायक उपकरण।
                  </p>

                  {coldSections.map(renderCategorySection)}
                </section>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
