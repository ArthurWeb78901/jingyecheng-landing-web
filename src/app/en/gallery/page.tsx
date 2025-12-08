// src/app/en/gallery/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

type GalleryCategory = "设备展示" | "生产线现场" | "工程案例" | "展会与交流";

type GalleryDoc = {
  id: string;
  title: string;
  titleEn?: string;
  category: GalleryCategory;
  imageUrl?: string;
  createdAt?: string;
};

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

          let category = data.category as GalleryCategory;
          if (
            category !== "设备展示" &&
            category !== "生产线现场" &&
            category !== "工程案例" &&
            category !== "展会与交流"
          ) {
            category = "设备展示";
          }

          return {
            id: d.id,
            title: data.title || "",
            titleEn: data.titleEn || "",
            category,
            imageUrl: data.imageUrl || "",
            createdAt: data.createdAt || "",
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

  const sections = CATEGORY_META_EN.map((meta) => ({
    ...meta,
    items: items.filter((it) => it.category === meta.key),
  })).filter((sec) => sec.items.length > 0);

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

          {loading ? (
            <p style={{ fontSize: 14, color: "#777" }}>Loading…</p>
          ) : sections.length === 0 ? (
            <div className="jyc-gallery-grid">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="jyc-gallery-item" />
              ))}
            </div>
          ) : (
            sections.map((section) => (
              <div key={section.key} style={{ marginTop: 32 }}>
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
            ))
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
