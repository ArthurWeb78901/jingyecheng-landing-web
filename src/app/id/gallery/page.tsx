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

const CATEGORY_META_ID: {
  key: GalleryCategory;
  title: string;
  description: string;
}[] = [
  {
    key: "设备展示",
    title: "Ikhtisar Peralatan",
    description:
      "Mesin utama untuk pabrik pipa seamless dan rolling mill, termasuk unit utama dan detail struktur.",
  },
  {
    key: "生产线现场",
    title: "Lokasi Lini Produksi",
    description:
      "Foto on-site dari lini produksi lengkap, menampilkan layout dan lingkungan operasi.",
  },
  {
    key: "工程案例",
    title: "Referensi Proyek",
    description:
      "Proyek representatif yang telah diserahkan kepada pelanggan, menonjolkan hasil implementasi.",
  },
  {
    key: "展会与交流",
    title: "Pameran & Pertukaran Teknis",
    description:
      "Foto dari pameran industri dan kegiatan pertukaran teknis dengan pelanggan serta mitra.",
  },
];

function pickTitleId(item: GalleryDoc) {
  const id = item.titleId?.trim();
  if (id) return id;
  const en = item.titleEn?.trim();
  if (en) return en;
  return item.title || "";
}

export default function GalleryIdPage() {
  const [items, setItems] = useState<GalleryDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGallery() {
      try {
        const q = query(collection(db, "jyc_gallery"), orderBy("createdAt", "desc"));
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
        console.error("load gallery items from Firestore (ID) error", err);
      } finally {
        setLoading(false);
      }
    }

    loadGallery();
  }, []);

  const hotSections = CATEGORY_META_ID.map((meta) => ({
    ...meta,
    items: items.filter((it) => it.machineTemp === "hot" && it.category === meta.key),
  })).filter((sec) => sec.items.length > 0);

  const coldSections = CATEGORY_META_ID.map((meta) => ({
    ...meta,
    items: items.filter((it) => it.machineTemp === "cold" && it.category === meta.key),
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
      <p style={{ fontSize: "13px", color: "#666", marginBottom: 10, lineHeight: 1.6 }}>
        {section.description}
      </p>

      <div className="jyc-gallery-grid">
        {section.items.map((item) => {
          const label = pickTitleId(item);

          return (
            <div
              key={item.id}
              className="jyc-gallery-item"
              style={{
                position: "relative",
                backgroundColor: "#e0e0e0",
                backgroundImage: item.imageUrl ? `url(${item.imageUrl})` : undefined,
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
          <h1 style={{ fontSize: "24px", marginBottom: "8px" }}>Galeri</h1>
          <p className="jyc-section-intro">
            Galeri foto peralatan proses panas dan dingin, lini produksi, serta referensi proyek.
          </p>

          {loading ? (
            <p style={{ fontSize: 14, color: "#777" }}>Memuat…</p>
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
                    Peralatan Proses Panas
                  </h2>
                  <p style={{ fontSize: 14, color: "#666", marginBottom: 12, lineHeight: 1.6 }}>
                    Peralatan dan lini produksi untuk hot rolling dan proses termal, termasuk piercing mills,
                    hot rolling mills, serta unit pendukung terkait.
                  </p>

                  {hotSections.map(renderCategorySection)}
                </section>
              )}

              {hasCold && (
                <section style={{ marginTop: 32 }}>
                  <h2 style={{ fontSize: "20px", marginBottom: 6 }}>
                    Peralatan Proses Dingin
                  </h2>
                  <p style={{ fontSize: 14, color: "#666", marginBottom: 12, lineHeight: 1.6 }}>
                    Peralatan dan lini untuk proses cold drawing dan cold finishing, seperti cold drawing benches,
                    straightening machines, dan unit pendukung terkait.
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
