"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ChatBubble } from "@/components/ChatBubble";
import { ContactFormCn } from "@/components/ContactFormCn";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

type HomeGalleryItem = {
  id: string; // Firestore doc id
  title: string;
  description?: string;
  imageUrl?: string;
  showOnHome: boolean;
  createdAt?: string;
};

type HomeProduct = {
  id: string;
  category: string;
  name: string;
  brief: string;
  heroImageUrl?: string;
  enabled: boolean;
  createdAt?: string;
};

export default function Home() {
  const [homeItems, setHomeItems] = useState<HomeGalleryItem[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  // 🔹 首頁產品卡片資料（完全來自 jyc_products）
  const [products, setProducts] = useState<HomeProduct[]>([]);

  // ✅ 從 Firestore 讀取 jycGallery（給圖片集 & 輪播用）
  useEffect(() => {
    async function loadHomeGallery() {
      try {
        const q = query(
          collection(db, "jycGallery"),
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

        // 只留有圖片網址且勾選「顯示在首頁輪播」的
        const filtered = all.filter(
          (item) => item.imageUrl && item.showOnHome
        );

        setHomeItems(filtered);
        setCurrentSlide(0);
      } catch (err) {
        console.error("load home gallery items from Firestore error", err);
      }
    }

    loadHomeGallery();
  }, []);

  // ✅ 從 Firestore 讀取 jyc_products（給首頁「主要產品一覽」用）
  useEffect(() => {
    async function loadProducts() {
      try {
        const q = query(
          collection(db, "jyc_products"),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);

        const list: HomeProduct[] = snap.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            category: data.category || "",
            name: data.name || "",
            brief: data.brief || "",
            heroImageUrl: data.heroImageUrl || data.imageUrl || "",
            enabled: data.enabled !== false, // 預設視為 true
            createdAt: data.createdAt || "",
          };
        });

        // 只顯示「在前台顯示」的產品
        const enabled = list.filter((p) => p.enabled);
        setProducts(enabled);
      } catch (err) {
        console.error("load products from Firestore error", err);
      }
    }

    loadProducts();
  }, []);

  // 简单自动轮播：每 5 秒切一张（有 1 张图时不轮播）
  useEffect(() => {
    if (homeItems.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % homeItems.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [homeItems.length]);

  const currentItem = homeItems[currentSlide];

  return (
    <main className="jyc-page">
      <Header />

      {/* Hero：整块背景图 + 文字反白叠在左侧 */}
      <section className="jyc-hero">
        <div className="jyc-hero-inner">
          <div className="jyc-hero-text">
            <h1>无缝钢管机组与轧钢设备整体解决方案提供商</h1>
            <p>
              山西太矿钢管设备有限公司成立于 1993 年，深耕无缝钢管机组设备与轧钢设备领域，
              覆盖穿孔机、轧管机、定径 / 减径机、矫直机、冷床、热定心机及冷拔机等关键设备，
              以专业设计、制造与服务能力，为客户提供稳定可靠的生产线与完善的技术支持。
            </p>

            <div className="jyc-hero-actions">
              <a href="#contact" className="jyc-btn-primary">
                立即咨询
              </a>
              <a href="/products" className="jyc-btn-secondary">
                查看产品一览
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 🔹 产品概要区块：完全依照 jyc_products 集合顯示現有產品 */}
      <section id="products" className="jyc-section">
        <h2>主要产品一览</h2>

        {products.length === 0 ? (
          <p className="jyc-section-intro">
            目前尚未在后台「产品资讯管理」新增任何产品。新增产品并勾选「在前台显示此产品」后，
            将自动显示在此区块。
          </p>
        ) : (
          <div className="jyc-card-grid">
            {products.map((p) => (
              <article key={p.id} className="jyc-card">
                <div
                  className="jyc-card-image"
                  style={
                    p.heroImageUrl
                      ? {
                          backgroundImage: `url(${p.heroImageUrl})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }
                      : undefined
                  }
                />
                <h3>{p.name}</h3>
                <div
                  style={{
                    fontSize: 13,
                    color: "#999",
                    marginBottom: 8,
                  }}
                >
                  类别：{p.category}
                </div>
                <p>{p.brief}</p>
                <button type="button" className="jyc-card-btn">
                  了解更多
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* 公司介绍（首页简版） */}
      <section id="about" className="jyc-section jyc-section-alt">
        <h2>关于我们</h2>
        <p>
          山西太矿钢管设备有限公司位于能源重化工城市——山西省太原市，占地面积约 7 万平方米，
          是一家专业从事轧钢设备的重工企业。公司以无缝钢管机组设备的制造为主，集设计、生产、经营于一体，
          为国内外客户提供从方案规划、设备制造到安装调试、售后服务的完整支持。
        </p>
      </section>

      {/* Gallery */}
      <section id="gallery" className="jyc-section">
        <h2>图片集</h2>
        <p className="jyc-section-intro">
          设备现场、生产线布局与项目案例照片。后台「图片 / Gallery 管理」中勾选
          「显示在首页轮播」的图片，会同步显示在此处与首页图片轮播，并统一由 Firestore 管理。
        </p>

        {/* 首页轮播（根据 showOnHome 勾选） */}
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
                  aria-label={`切换到第 ${idx + 1} 张`}
                />
              ))}
            </div>
          </div>
        )}

        <div className="jyc-gallery-grid">
          {homeItems.slice(0, 4).length === 0
            ? [1, 2, 3, 4].map((i) => (
                <div key={i} className="jyc-gallery-item" />
              ))
            : homeItems.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="jyc-gallery-item"
                  style={
                    item.imageUrl
                      ? {
                          backgroundImage: `url(${item.imageUrl})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }
                      : undefined
                  }
                  title={item.title}
                />
              ))}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="jyc-section jyc-section-alt">
        <h2>联系我们</h2>
        <p className="jyc-section-intro">
          请留下您的联络资讯与需求，我们会尽快由相关人员与您联系，也可直接拨打电话或来信洽询。
        </p>

        <ContactFormCn />
      </section>

      <Footer />
      <ChatBubble />
    </main>
  );
}
