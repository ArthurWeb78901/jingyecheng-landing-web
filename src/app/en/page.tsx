// src/app/en/page.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ChatBubble } from "@/components/ChatBubble";
import { ContactFormEn } from "@/components/ContactFormEn";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  orderBy,
  query,
  doc,
  getDoc,
} from "firebase/firestore";

type HomeGalleryItem = {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  showOnHome?: boolean;
  createdAt?: string;
};

type HomeProduct = {
  id: string;
  category: string;
  categoryEn?: string;
  name: string;
  nameEn?: string;
  brief: string;
  briefEn?: string;
  enabled: boolean;
  imageUrl?: string;
  // ⭐ 新增：控制首頁顯示順序（數字越小越前面）
  sortOrder: number;
};

type SiteConfigHome = {
  logoImageUrl?: string;
};

export default function HomeEn() {
  const [homeItems, setHomeItems] = useState<HomeGalleryItem[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [products, setProducts] = useState<HomeProduct[]>([]);
  const [siteConfig, setSiteConfig] = useState<SiteConfigHome>({});

  // ✅ EN 首页产品横向滚动容器
  const productsRowRef = useRef<HTMLDivElement | null>(null);

  // 讀取 config/site（拿 logoImageUrl 給 About Us 大 logo 用）
  useEffect(() => {
    async function loadConfig() {
      try {
        const snap = await getDoc(doc(db, "config", "site"));
        if (snap.exists()) {
          const data = snap.data() as any;
          setSiteConfig({
            logoImageUrl: data.logoImageUrl || "",
          });
        }
      } catch (err) {
        console.error("load config/site in HomeEn error", err);
      }
    }

    loadConfig();
  }, []);

  // gallery from jyc_gallery
  useEffect(() => {
    async function loadHomeGallery() {
      try {
        const q = query(
          collection(db, "jyc_gallery"),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);

        const all: HomeGalleryItem[] = snap.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            title: data.title || "",
            description: data.description || "",
            imageUrl: data.imageUrl || "",
            showOnHome: !!data.showOnHome,
            createdAt: data.createdAt || "",
          };
        });

        const filtered = all.filter(
          (item) => item.imageUrl && item.showOnHome
        );

        setHomeItems(filtered);
        setCurrentSlide(0);
      } catch (err) {
        console.error(
          "load home gallery items from Firestore error (en)",
          err
        );
      }
    }

    loadHomeGallery();
  }, []);

  // products from jyc_products（依 sortOrder + name 排序）
  useEffect(() => {
    async function loadProducts() {
      try {
        const q = query(
          collection(db, "jyc_products"),
          // ⭐ 先依 sortOrder，再用 name 當次排序鍵，確保順序穩定
          orderBy("sortOrder", "asc"),
          orderBy("name", "asc")
        );
        const snap = await getDocs(q);

        const list: HomeProduct[] = snap.docs
          .map((d) => {
            const data = d.data() as any;

            // ⭐ 若舊資料沒有 sortOrder，就先給一個較大的預設值
            const sortOrder =
              typeof data.sortOrder === "number" ? data.sortOrder : 9999;

            return {
              id: d.id,
              category: data.category || "",
              categoryEn: data.categoryEn || "",
              name: data.name || "",
              nameEn: data.nameEn || "",
              brief: data.brief || "",
              briefEn: data.briefEn || "",
              enabled: data.enabled ?? true,
              imageUrl: data.imageUrl || "",
              sortOrder,
            };
          })
          .filter((p) => p.enabled);

        setProducts(list);
      } catch (err) {
        console.error("load home products from Firestore error (en)", err);
      }
    }

    loadProducts();
  }, []);

  // slideshow
  useEffect(() => {
    if (homeItems.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % homeItems.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [homeItems.length]);

  const currentItem = homeItems[currentSlide];

  // thumbs 數量與產品數同步，不足時只是備用來源
  const productThumbs = homeItems.slice(0, products.length || 3);
  const galleryItems = homeItems.slice(0, 12); // 跟中文首頁一樣最多 12 張

  // ✅ 横向滚动逻辑（跟中文首页一致）
  const scrollProducts = (direction: "left" | "right") => {
    const container = productsRowRef.current;
    if (!container) return;

    const firstCard =
      container.querySelector<HTMLElement>(".jyc-card") || null;

    const step =
      (firstCard?.offsetWidth || container.clientWidth * 0.8) + 24;

    const delta = direction === "left" ? -step : step;

    container.scrollBy({
      left: delta,
      behavior: "smooth",
    });
  };

  return (
    <main className="jyc-page">
      <Header />

      {/* Hero - EN */}
      <section className="jyc-hero jyc-hero-en">
        <div className="jyc-hero-inner">
          <div className="jyc-hero-text">
            <h1>
              Turn-key Solutions for Seamless Pipe Mills &amp; Rolling Equipment
            </h1>
            <p>
              Founded in 1993, Taiyuan Jingyecheng Steel Equip Co., Ltd.
              specializes in equipment for hot-rolled seamless steel pipe
              production, including piercing mills, pipe rolling mills, sizing
              and reducing mills, straightening machines, cooling beds, hot
              centering machines and cold drawing machines. We provide reliable
              production lines and technical support with professional design,
              manufacturing and service capabilities.
            </p>

            <div className="jyc-hero-actions">
              <a href="#contact" className="jyc-btn-primary">
                Contact Us
              </a>
              <a href="/en/products" className="jyc-btn-secondary">
                View Products
              </a>
            </div>

            <p className="jyc-hero-caption">
              Sample view of a seamless pipe mill line
            </p>
          </div>
        </div>
      </section>

      {/* Products overview from Firestore */}
      <section id="products" className="jyc-section">
        <h2>Main Products</h2>

        <p className="jyc-section-intro">
          {products.length === 0
            ? 'No products have been configured yet in the admin "Product Management" page. Once you add products and tick "Show on website", they will automatically appear here.'
            : "Below are the main product categories currently configured. Detailed line configurations and technical specifications are available on the Products page."}
        </p>

        {products.length > 0 && (
          <div style={{ position: "relative" }}>
            {/* 左箭头 */}
            <button
              type="button"
              aria-label="Scroll left to see more products"
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

            <div
              className="jyc-home-products-row"
              ref={productsRowRef}
              aria-label="Main products horizontal list"
            >
              {products.map((p, index) => {
                const thumb = productThumbs[index];
                const bgUrl = p.imageUrl || thumb?.imageUrl || "";

                const displayName = p.nameEn || p.name;
                const displayBrief = p.briefEn || p.brief;

                return (
                  <article key={p.id} className="jyc-card">
                    <div
                      className="jyc-card-image"
                      style={
                        bgUrl
                          ? { backgroundImage: `url(${bgUrl})` }
                          : undefined
                      }
                    />
                    <h3>{displayName}</h3>
                    <p>{displayBrief}</p>
                    <button
                      type="button"
                      className="jyc-card-btn"
                      onClick={() => {
                        if (typeof window === "undefined") return;

                        const msg = `I would like to learn more about your “${displayName}” equipment, including detailed technical parameters and configuration suggestions.`;

                        window.dispatchEvent(
                          new CustomEvent("jyc-open-chat", {
                            detail: { message: msg },
                          }) as any
                        );
                      }}
                    >
                      Learn More
                    </button>
                  </article>
                );
              })}
            </div>

            {/* 右箭头 */}
            <button
              type="button"
              aria-label="Scroll right to see more products"
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

      {/* About (short) + big logo */}
      <section id="about" className="jyc-section jyc-section-alt">
        <div className="jyc-about-header">
          {siteConfig.logoImageUrl && (
            <div className="jyc-about-logo-wrap">
              <img
                src={siteConfig.logoImageUrl}
                alt="Company logo"
                className="jyc-about-logo"
              />
            </div>
          )}
          <h2>About Us</h2>
        </div>
        <p>
          Taiyuan Jingyecheng Heavy Equipment Co., Ltd. is located in Taiyuan,
          Shanxi Province, with a site area of about 70,000 m². The company is a
          heavy-industry manufacturer specialized in rolling equipment for
          seamless steel pipes, covering piercing mills, pipe rolling mills,
          sizing / reducing mills, straightening machines, cooling beds, hot
          centering machines and cold drawing machines. We integrate design,
          manufacturing and sales, and provide complete services from line
          planning and equipment supply to installation, commissioning and
          after-sales support.
        </p>
      </section>

      {/* Gallery */}
      <section id="gallery" className="jyc-section">
        <h2>Gallery</h2>
        <p className="jyc-section-intro">
          Photos of key equipment and production lines, such as piercing mills,
          pipe rolling mills, sizing / reducing mills, straightening machines,
          cooling beds, hot centering machines and cold drawing machines, as
          well as typical project references.
        </p>

        {homeItems.length > 0 && (
          <div className="jyc-home-slideshow">
            <div className="jyc-home-slideshow-main">
              <div
                className="jyc-home-slideshow-main-inner"
                style={
                  currentItem?.imageUrl
                    ? { backgroundImage: `url(${currentItem.imageUrl})` }
                    : undefined
                }
              />
            </div>
            <div className="jyc-home-slideshow-caption">
              {currentItem?.title}
            </div>
            <div className="jyc-home-slideshow-dots">
              {homeItems.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={
                    "jyc-home-slideshow-dot" +
                    (idx === currentSlide
                      ? " jyc-home-slideshow-dot-active"
                      : "")
                  }
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        )}

        <div className="jyc-gallery-grid">
          {galleryItems.length === 0
            ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                <div key={i} className="jyc-gallery-thumb" />
              ))
            : galleryItems.map((item) => (
                <div
                  key={item.id}
                  className="jyc-gallery-thumb"
                  style={
                    item.imageUrl
                      ? { backgroundImage: `url(${item.imageUrl})` }
                      : undefined
                  }
                  title={item.title}
                />
              ))}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="jyc-section jyc-section-alt">
        <h2>Contact Us</h2>
        <p className="jyc-section-intro">
          Please leave your contact information and project requirements. Our
          sales team will get back to you as soon as possible. You may also call
          or email us directly.
        </p>

        <ContactFormEn />
      </section>

      <Footer />
      <ChatBubble />
    </main>
  );
}
