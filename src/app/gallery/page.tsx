// src/app/gallery/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

type GalleryCategory = "设备展示" | "生产线现场" | "工程案例" | "展会与交流";

// 冷 / 热
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

const CATEGORY_META_CN: {
  key: GalleryCategory;
  title: string;
  description: string;
}[] = [
  {
    key: "设备展示",
    title: "设备展示",
    description:
      "无缝钢管机组、轧钢设备等主要设备外观与结构细节照片。",
  },
  {
    key: "生产线现场",
    title: "生产线现场",
    description:
      "设备实际运行中的现场照片，包含产线布局、穿孔、轧制、冷床与输送系统等工艺工段。",
  },
  {
    key: "工程案例",
    title: "工程案例",
    description:
      "为不同客户规划与建置的典型工程案例，展示设备配置与现场实施成效。",
  },
  {
    key: "展会与交流",
    title: "展会与交流",
    description:
      "公司参与行业展会、技术交流与客户参观活动的现场照片。",
  },
];

export default function GalleryPage() {
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

          // 冷 / 热：只接受 "hot" / "cold"
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
        console.error("load gallery items from Firestore (CN) error", err);
      } finally {
        setLoading(false);
      }
    }

    loadGallery();
  }, []);

  // 依「冷 / 热 + 类别」分组
  const hotSections = CATEGORY_META_CN.map((meta) => ({
    ...meta,
    items: items.filter(
      (it) => it.machineTemp === "hot" && it.category === meta.key
    ),
  })).filter((sec) => sec.items.length > 0);

  const coldSections = CATEGORY_META_CN.map((meta) => ({
    ...meta,
    items: items.filter(
      (it) => it.machineTemp === "cold" && it.category === meta.key
    ),
  })).filter((sec) => sec.items.length > 0);

  const hasHot = hotSections.length > 0;
  const hasCold = coldSections.length > 0;

  // 渲染单个「类别」区块（设备展示 / 生产线现场 / 工程案例 / 展会与交流）
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
        {section.items.map((item) => (
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
            {item.title && (
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
                {item.title}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <main className="jyc-page">
      <Header />

      <section className="jyc-section">
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <h1 style={{ fontSize: "24px", marginBottom: "8px" }}>
            图片集 / Gallery
          </h1>
          <p className="jyc-section-intro">
            以下为山西太矿钢管设备有限公司热加工设备、冷加工设备及生产线现场与工程案例照片。
          </p>

          {loading ? (
            <p style={{ fontSize: 14, color: "#777" }}>加载中…</p>
          ) : !hasHot && !hasCold ? (
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
                    热加工设备
                  </h2>
                  <p
                    style={{
                      fontSize: 14,
                      color: "#666",
                      marginBottom: 12,
                      lineHeight: 1.6,
                    }}
                  >
                    主要用于热轧、穿孔、加热等工艺环节的设备与生产线，如穿孔机、热轧机组、
                    加热炉及相关辅助设备。
                  </p>

                  {hotSections.map(renderCategorySection)}
                </section>
              )}

              {/* ❄️ 冷加工设备 */}
              {hasCold && (
                <section style={{ marginTop: 32 }}>
                  <h2 style={{ fontSize: "20px", marginBottom: 6 }}>
                    冷加工设备
                  </h2>
                  <p
                    style={{
                      fontSize: 14,
                      color: "#666",
                      marginBottom: 12,
                      lineHeight: 1.6,
                    }}
                  >
                    主要用于冷拔、矫直、精整等工艺环节的设备与生产线，如冷拔机、矫直机、
                    冷床及配套输送系统。
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
