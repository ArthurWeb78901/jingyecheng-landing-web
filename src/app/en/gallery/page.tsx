// src/app/en/gallery/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

type GalleryCategory = "设备展示" | "生产线现场" | "工程案例" | "展会与交流";

type AdminGalleryItem = {
  id: number;
  title: string;
  category: GalleryCategory;
  filename: string;
  description?: string;
  imageUrl?: string;
  showOnHome: boolean;
  createdAt?: string;
};

type EnGalleryItem = {
  id: number;
  label: string;
  imageUrl?: string;
  filename?: string;
};

type EnGallerySection = {
  title: string;
  description: string;
  items: EnGalleryItem[];
};

const STORAGE_KEY = "jyc_admin_gallery_items";

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
  const [items, setItems] = useState<AdminGalleryItem[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const parsed: AdminGalleryItem[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setItems(parsed);
      }
    } catch (err) {
      console.error("load gallery items error (EN)", err);
    }
  }, []);

  const hasData = items.length > 0;

  const dynamicSections: EnGallerySection[] = CATEGORY_META_EN.map((meta) => {
    const list = items.filter((it) => it.category === meta.key);
    return {
      title: meta.title,
      description: meta.description,
      items: list.map((it) => ({
        id: it.id,
        // 目前后台标题是中文，这里先直接沿用；未来可以在后台加英文标题字段
        label: it.title,
        imageUrl: it.imageUrl,
        filename: it.filename,
      })),
    };
  }).filter((sec) => sec.items.length > 0);

  return (
    <main className="jyc-page">
      <Header />

      <section className="jyc-section">
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <h1 style={{ fontSize: "24px", marginBottom: "8px" }}>Gallery</h1>
          <p className="jyc-section-intro">
            Photo gallery of equipment installations, production lines and
            project references.
          </p>

          {hasData ? (
            dynamicSections.map((section) => (
              <div key={section.title} style={{ marginTop: 32 }}>
                <h2 style={{ fontSize: "20px", marginBottom: "8px" }}>
                  {section.title}
                </h2>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#666",
                    marginBottom: 12,
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
                      <span
                        style={{
                          position: "absolute",
                          left: 8,
                          bottom: 8,
                          fontSize: 12,
                          color: "#555",
                          background: "rgba(255,255,255,0.88)",
                          padding: "2px 6px",
                          borderRadius: 4,
                        }}
                      >
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            // 没有资料时，维持原本的 6 格示意布局
            <div className="jyc-gallery-grid">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="jyc-gallery-item" />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
