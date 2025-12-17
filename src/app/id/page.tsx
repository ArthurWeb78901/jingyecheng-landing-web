"use client";

import React, { useEffect, useState, useRef } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ChatBubble } from "@/components/ChatBubble";
import { ContactFormId } from "@/components/ContactFormId";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query, doc, getDoc } from "firebase/firestore";

type HomeGalleryItem = {
  id: string;
  title: string;
  titleEn?: string;
  titleHi?: string;
  titleId?: string;
  imageUrl?: string;
  showOnHome?: boolean;
  createdAt?: string;
};

type HomeProduct = {
  id: string;
  category: string;
  categoryEn?: string;
  categoryHi?: string;
  categoryId?: string;
  name: string;
  nameEn?: string;
  nameHi?: string;
  nameId?: string;
  brief: string;
  briefEn?: string;
  briefHi?: string;
  briefId?: string;
  enabled: boolean;
  imageUrl?: string;
  homeOrder?: number;
};

type SiteConfigHome = {
  logoImageUrl?: string;
};

function pickTextId(id?: string, en?: string, fallback?: string) {
  const vId = id?.trim();
  if (vId) return vId;
  const vEn = en?.trim();
  if (vEn) return vEn;
  return fallback || "";
}

export default function HomeId() {
  const [homeItems, setHomeItems] = useState<HomeGalleryItem[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [products, setProducts] = useState<HomeProduct[]>([]);
  const [siteConfig, setSiteConfig] = useState<SiteConfigHome>({});

  const productsRowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function loadConfig() {
      try {
        const snap = await getDoc(doc(db, "config", "site"));
        if (snap.exists()) {
          const data = snap.data() as any;
          setSiteConfig({ logoImageUrl: data.logoImageUrl || "" });
        }
      } catch (err) {
        console.error("load config/site in HomeId error", err);
      }
    }
    loadConfig();
  }, []);

  useEffect(() => {
    async function loadHomeGallery() {
      try {
        const q = query(collection(db, "jyc_gallery"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);

        const all: HomeGalleryItem[] = snap.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            title: data.title || "",
            titleEn: data.titleEn || "",
            titleHi: data.titleHi || "",
            titleId: data.titleId || "",
            imageUrl: data.imageUrl || "",
            showOnHome: !!data.showOnHome,
            createdAt: data.createdAt || "",
          };
        });

        const filtered = all.filter((item) => item.imageUrl && item.showOnHome);
        setHomeItems(filtered);
        setCurrentSlide(0);
      } catch (err) {
        console.error("load home gallery items from Firestore error (id)", err);
      }
    }
    loadHomeGallery();
  }, []);

  useEffect(() => {
    async function loadProducts() {
      try {
        const q = query(collection(db, "jyc_products"), orderBy("name", "asc"));
        const snap = await getDocs(q);

        const raw: HomeProduct[] = snap.docs
          .map((d) => {
            const data = d.data() as any;
            const homeOrderRaw = data.homeOrder;
            const homeOrder = typeof homeOrderRaw === "number" ? homeOrderRaw : Number.MAX_SAFE_INTEGER;

            return {
              id: d.id,
              category: data.category || "",
              categoryEn: data.categoryEn || "",
              categoryHi: data.categoryHi || "",
              categoryId: data.categoryId || "",
              name: data.name || "",
              nameEn: data.nameEn || "",
              nameHi: data.nameHi || "",
              nameId: data.nameId || "",
              brief: data.brief || "",
              briefEn: data.briefEn || "",
              briefHi: data.briefHi || "",
              briefId: data.briefId || "",
              enabled: data.enabled ?? true,
              imageUrl: data.imageUrl || "",
              homeOrder,
            };
          })
          .filter((p) => p.enabled);

        raw.sort((a, b) => {
          const ao = typeof a.homeOrder === "number" ? a.homeOrder : Number.MAX_SAFE_INTEGER;
          const bo = typeof b.homeOrder === "number" ? b.homeOrder : Number.MAX_SAFE_INTEGER;
          if (ao !== bo) return ao - bo;

          const aName = pickTextId(a.nameId, a.nameEn, a.name);
          const bName = pickTextId(b.nameId, b.nameEn, b.name);
          return aName.localeCompare(bName);
        });

        setProducts(raw);
      } catch (err) {
        console.error("load home products from Firestore error (id)", err);
      }
    }
    loadProducts();
  }, []);

  useEffect(() => {
    if (homeItems.length <= 1) return;
    const timer = setInterval(() => setCurrentSlide((prev) => (prev + 1) % homeItems.length), 5000);
    return () => clearInterval(timer);
  }, [homeItems.length]);

  const currentItem = homeItems[currentSlide];
  const productThumbs = homeItems.slice(0, products.length || 3);
  const galleryItems = homeItems.slice(0, 12);

  const scrollProducts = (direction: "left" | "right") => {
    const container = productsRowRef.current;
    if (!container) return;

    const firstCard = container.querySelector<HTMLElement>(".jyc-card") || null;
    const step = (firstCard?.offsetWidth || container.clientWidth * 0.8) + 24;
    const delta = direction === "left" ? -step : step;

    container.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <main className="jyc-page">
      <Header />

      {/* Hero - ID */}
      <section className="jyc-hero jyc-hero-en">
        <div className="jyc-hero-inner">
          <div className="jyc-hero-text">
            <h1>Solusi Turn-key untuk Seamless Pipe Mills &amp; Rolling Equipment</h1>
            <p>
              Didirikan pada tahun 1993, Taiyuan Jingyecheng Steel Equip Ltd. berfokus pada
              peralatan untuk produksi pipa baja seamless hot-rolled, termasuk piercing mills,
              pipe rolling mills, sizing / reducing mills, straightening machines, cooling beds,
              hot centering machines, dan cold drawing machines. Kami menyediakan lini produksi
              yang andal serta dukungan teknis dengan kemampuan desain, manufaktur, dan layanan
              yang profesional.
            </p>

            <div className="jyc-hero-actions">
              <a href="#contact" className="jyc-btn-primary">
                Hubungi Kami
              </a>
              <a href="/id/products" className="jyc-btn-secondary">
                Lihat Produk
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="jyc-section">
        <h2>Produk Utama</h2>

        <p className="jyc-section-intro">
          {products.length === 0
            ? 'Belum ada produk yang dikonfigurasi di halaman admin "Product Management". Setelah Anda menambahkan produk dan mencentang "Show on website", produk akan muncul otomatis di sini.'
            : "Berikut kategori produk utama yang saat ini telah dikonfigurasi. Konfigurasi lini dan spesifikasi teknis detail tersedia di halaman Products."}
        </p>

        {products.length > 0 && (
          <div style={{ position: "relative" }}>
            <button
              type="button"
              aria-label="Scroll kiri"
              onClick={() => scrollProducts("left")}
              style={{
                position: "absolute",
                left: 0,
                top: "50%",
                transform: "translateY(-50%)",
                border: "none",
                background: "rgba(255,255,255,0.9)",
                boxShadow: "0 0 6px rgba(0, 0, 0, 0.15)",
                borderRadius: "50%",
                width: 32,
                height: 32,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 5,
              }}
            >
              ‹
            </button>

            <div className="jyc-home-products-row" ref={productsRowRef} aria-label="Daftar produk utama (horizontal)">
              {products.map((p, index) => {
                const thumb = productThumbs[index];
                const bgUrl = p.imageUrl || thumb?.imageUrl || "";

                const displayName = pickTextId(p.nameId, p.nameEn, p.name);
                const displayBrief = pickTextId(p.briefId, p.briefEn, p.brief);

                return (
                  <article key={p.id} className="jyc-card">
                    <div className="jyc-card-image" style={bgUrl ? { backgroundImage: `url(${bgUrl})` } : undefined} />
                    <h3>{displayName}</h3>
                    <p>{displayBrief}</p>
                    <button
                      type="button"
                      className="jyc-card-btn"
                      onClick={() => {
                        if (typeof window === "undefined") return;

                        const msg =
                          `Saya ingin mengetahui lebih lanjut tentang peralatan “${displayName}”, ` +
                          `termasuk parameter teknis detail dan saran konfigurasi.`;

                        window.dispatchEvent(
                          new CustomEvent("jyc-open-chat", {
                            detail: { message: msg },
                          }) as any
                        );
                      }}
                    >
                      Pelajari Lebih Lanjut
                    </button>
                  </article>
                );
              })}
            </div>

            <button
              type="button"
              aria-label="Scroll kanan"
              onClick={() => scrollProducts("right")}
              style={{
                position: "absolute",
                right: 0,
                top: "50%",
                transform: "translateY(-50%)",
                border: "none",
                background: "rgba(255,255,255,0.9)",
                boxShadow: "0 0 6px rgba(0, 0, 0, 0.15)",
                borderRadius: "50%",
                width: 32,
                height: 32,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 5,
              }}
            >
              ›
            </button>
          </div>
        )}
      </section>

      {/* About */}
      <section id="about" className="jyc-section jyc-section-alt">
        <div className="jyc-about-header">
          {siteConfig.logoImageUrl && (
            <div className="jyc-about-logo-wrap">
              <img src={siteConfig.logoImageUrl} alt="Logo perusahaan" className="jyc-about-logo" />
            </div>
          )}
          <h2>Tentang Kami</h2>
        </div>
        <p>
          Taiyuan Jingyecheng Heavy Equipment Ltd. berlokasi di Taiyuan, Provinsi Shanxi,
          dengan luas area sekitar 70.000 m². Perusahaan ini merupakan produsen industri berat
          yang mengkhususkan diri pada rolling equipment untuk pipa baja seamless, mencakup
          piercing mills, pipe rolling mills, sizing / reducing mills, straightening machines,
          cooling beds, hot centering machines, dan cold drawing machines. Kami mengintegrasikan
          desain, manufaktur, dan penjualan, serta menyediakan layanan lengkap mulai dari
          perencanaan lini dan penyediaan peralatan hingga instalasi, commissioning, dan dukungan purna jual.
        </p>
      </section>

      {/* Gallery */}
      <section id="gallery" className="jyc-section">
        <h2>Galeri</h2>
        <p className="jyc-section-intro">
          Foto peralatan utama dan lini produksi—seperti piercing mills, pipe rolling mills,
          sizing / reducing mills, straightening machines, cooling beds, hot centering machines,
          dan cold drawing machines—serta referensi proyek tipikal.
        </p>

        {homeItems.length > 0 && (
          <div className="jyc-home-slideshow">
            <div className="jyc-home-slideshow-main">
              <div
                className="jyc-home-slideshow-main-inner"
                style={currentItem?.imageUrl ? { backgroundImage: `url(${currentItem.imageUrl})` } : undefined}
              />
            </div>
            <div className="jyc-home-slideshow-caption">
              {pickTextId(currentItem?.titleId, currentItem?.titleEn, currentItem?.title)}
            </div>
            <div className="jyc-home-slideshow-dots">
              {homeItems.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={"jyc-home-slideshow-dot" + (idx === currentSlide ? " jyc-home-slideshow-dot-active" : "")}
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        )}

        <div className="jyc-gallery-grid">
          {galleryItems.length === 0
            ? [1,2,3,4,5,6,7,8,9,10,11,12].map((i) => <div key={i} className="jyc-gallery-thumb" />)
            : galleryItems.map((item) => (
                <div
                  key={item.id}
                  className="jyc-gallery-thumb"
                  style={item.imageUrl ? { backgroundImage: `url(${item.imageUrl})` } : undefined}
                  title={pickTextId(item.titleId, item.titleEn, item.title)}
                />
              ))}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="jyc-section jyc-section-alt">
        <h2>Hubungi Kami</h2>
        <p className="jyc-section-intro">
          Silakan tinggalkan informasi kontak dan kebutuhan proyek Anda. Tim sales kami akan menghubungi Anda sesegera mungkin.
          Anda juga dapat menghubungi kami langsung melalui telepon atau email.
        </p>

        <ContactFormId />
      </section>

      <Footer />
      <ChatBubble />
    </main>
  );
}
