// src/app/en/gallery/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

type GalleryCategory = "设备展示" | "生产线现场" | "工程案例" | "展会与交流";

// ⭐ 冷 / 热
type MachineTemp = "hot" | "cold";

type GalleryDoc = {
  id: string;
  title: string;
  titleEn?: string;
  category: GalleryCategory;
  imageUrl?: string;
  createdAt?: string;
  machineTemp?: MachineTemp; // "hot" | "cold" | undefined
};

// 類別文案（英文）
const CATEGORY_META_EN: {
  key: GalleryCategory;
  title: string;
  description: string;
}[] = [
  {
    key: "设备展示",
    title: "Equipment Overview",
    description:
      "Key machines for seamless pipe mills and rolling mills, including main units and structural details.",
  },
  {
    key: "生产线现场",
    title: "Production Line Sites",
    description:
      "On-site photos of complete production lines, showing layouts and operating environments.",
  },
  {
    key: "工程案例",
    title: "Project References",
    description:
      "Representative projects delivered to customers, highlighting implementation results.",
  },
  {
    key: "展会与交流",
    title: "Exhibitions & Technical Exchanges",
    description:
      "Photos from industry exhibitions and technical exchange activities with customers and partners.",
  },
];

export default function GalleryEnPage() {
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

          // 類別保底
          let category = data.category as GalleryCategory;
          if (
            category !== "设备展示" &&
            category !== "生产线现场" &&
            category !== "工程案例" &&
            category !== "展会与交流"
          ) {
            category = "设备展示";
          }

          // ⭐ 冷 / 热：只接受 "hot" / "cold"，其他視為未分類
          let machineTemp: MachineTemp | undefined;
          if (data.machineTemp === "hot" || data.machineTemp === "cold") {
            machineTemp = data.machineTemp;
          }

          return {
            id: d.id,
            title: data.title || "",
            titleEn: data.titleEn || "",
            category,
            imageUrl: data.imageUrl || "",
            createdAt: data.createdAt || "",
            machineTemp,
          };
        });

        setItems(list);
      } catch (err) {
        console.error("load gallery items from Firestore (EN) error", err);
      } finally {
        setLoading(false);
      }
    }

    loadGallery();
  }, []);

  // ⭐ 依「冷 / 热 + 類別」分組
  const hotSections = CATEGORY_META_EN.map((meta) => ({
    ...meta,
    items: items.filter(
      (it) => it.machineTemp === "hot" && it.category === meta.key
    ),
  })).filter((sec) => sec.items.length > 0);

  const coldSections = CATEGORY_META_EN.map((meta) => ({
    ...meta,
    items: items.filter(
      (it) => it.machineTemp === "cold" && it.category === meta.key
    ),
  })).filter((sec) => sec.items.length > 0);

  const hasHot = hotSections.length > 0;
  const hasCold = coldSections.length > 0;

  // 方便重複渲染一個區塊（Equipment / Lines / Projects ...）
  const renderCategorySection = (section: {
    key: GalleryCategory;
    title: string;
    description: string;
    items: GalleryDoc[];
  }) => (
    <div key={section.key} style={{ marginTop: 24 }}>
      <h3 style={{ fontSize: "18px", marginBottom: "6px" }}>
        {section.title}
      </h3>
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
          const label =
            item.titleEn && item.titleEn.trim().length > 0
              ? item.titleEn
              : item.title;

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
          <h1 style={{ fontSize: "24px", marginBottom: "8px" }}>Gallery</h1>
          <p className="jyc-section-intro">
            Photo gallery of hot and cold processing equipment, production lines
            and project references.
          </p>

          {loading ? (
            <p style={{ fontSize: 14, color: "#777" }}>Loading…</p>
          ) : !hasHot && !hasCold ? (
            // 若目前還沒有標記冷/熱的資料，就顯示幾個占位
            <div className="jyc-gallery-grid">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="jyc-gallery-item" />
              ))}
            </div>
          ) : (
            <>
              {/* 🔥 热加工设备 */}
              {hasHot && (
                <section style={{ marginTop: 24 }}>
                  <h2 style={{ fontSize: "20px", marginBottom: 6 }}>
                    Hot Processing Equipment
                  </h2>
                  <p
                    style={{
                      fontSize: 14,
                      color: "#666",
                      marginBottom: 12,
                      lineHeight: 1.6,
                    }}
                  >
                    Equipment and production lines used in hot rolling and
                    thermal processing, including piercing mills, hot rolling
                    mills and associated auxiliary units.
                  </p>

                  {hotSections.map(renderCategorySection)}
                </section>
              )}

              {/* ❄️ 冷加工设备 */}
              {hasCold && (
                <section style={{ marginTop: 32 }}>
                  <h2 style={{ fontSize: "20px", marginBottom: 6 }}>
                    Cold Processing Equipment
                  </h2>
                  <p
                    style={{
                      fontSize: 14,
                      color: "#666",
                      marginBottom: 12,
                      lineHeight: 1.6,
                    }}
                  >
                    Equipment and lines used in cold drawing and cold finishing
                    processes, such as cold drawing benches, straightening
                    machines and related auxiliaries.
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
