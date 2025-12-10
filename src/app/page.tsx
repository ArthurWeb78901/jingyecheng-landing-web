// src/app/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ChatBubble } from "@/components/ChatBubble";
import { ContactFormCn } from "@/components/ContactFormCn";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

type HomeGalleryItem = {
  id: string;
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
  enabled: boolean;
  imageUrl?: string;
};

export default function Home() {
  const [homeItems, setHomeItems] = useState<HomeGalleryItem[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [products, setProducts] = useState<HomeProduct[]>([]);

  // 读取首页轮播 / Gallery
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
        console.error("load home gallery items from Firestore error", err);
      }
    }

    loadHomeGallery();
  }, []);

  // 读取首页产品列表
  useEffect(() => {
    async function loadProducts() {
      try {
        const q = query(
          collection(db, "jyc_products"),
          orderBy("name", "asc")
        );
        const snap = await getDocs(q);

        const list: HomeProduct[] = snap.docs
          .map((d) => {
            const data = d.data() as any;
            return {
              id: d.id,
              category: data.category || "",
              name: data.name || "",
              brief: data.brief || "",
              enabled: data.enabled ?? true,
              imageUrl: data.imageUrl || "",
            };
          })
          .filter((p) => p.enabled);

        setProducts(list);
      } catch (err) {
        console.error("load home products from Firestore error", err);
      }
    }

    loadProducts();
  }, []);

  // 简单自动轮播
  useEffect(() => {
    if (homeItems.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % homeItems.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [homeItems.length]);

  const currentItem = homeItems[currentSlide];

  // 首页要用到的图
  const productThumbs = homeItems.slice(0, products.length || 3);
  const galleryItems = homeItems.slice(0, 12);

  return (
    <main className="jyc-page">
      <Header />

      {/* Hero */}
      <section className="jyc-hero">
        <div className="jyc-hero-inner">
          <div className="jyc-hero-text">
            <h1>无缝钢管机组与轧钢设备整体解决方案提供商</h1>
            <p>
              太原精业城重工设备有限公司成立于 1993 年，深耕无缝钢管机组设备与轧钢设备领域，
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

      {/* 产品概要区块 */}
      <section id="products" className="jyc-section">
        <h2>主要产品一览</h2>

        <p className="jyc-section-intro">
          {products.length === 0
            ? "目前尚未在后台「产品资讯管理」新增任何产品。新增产品并勾选「在前台显示此产品」后，将自动显示在此区块。"
            : "以下为目前已在后台配置的主要产品方向，详细机组配置与技术参数可在「产品与设备一览」页面查看。"}
        </p>

        {products.length > 0 && (
          <>
            <div
              className="jyc-home-products-row"
              aria-label="主要产品横向列表"
            >
              {products.map((p, index) => {
                const thumb = productThumbs[index];
                const bgUrl = p.imageUrl || thumb?.imageUrl || "";

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
                    <h3>{p.name}</h3>
                    <p>{p.brief}</p>
                    <button
                      type="button"
                      className="jyc-card-btn"
                      onClick={() => {
                        if (typeof window === "undefined") return;
                        const msg = `我想进一步了解贵公司的「${p.name}」设备，请协助提供更详细的技术参数与配置建议。`;

                        window.dispatchEvent(
                          new CustomEvent("jyc-open-chat", {
                            detail: { message: msg },
                          }) as any
                        );
                      }}
                    >
                      了解更多
                    </button>
                  </article>
                );
              })}
            </div>
            {/* 小提示：让用户知道可以左右滑动 */}
            <p
              style={{
                fontSize: 12,
                color: "#888",
                marginTop: 8,
              }}
            >
              在手机上可左右滑动查看更多产品。
            </p>
          </>
        )}
      </section>

      {/* 公司介绍 */}
      {/* ……下面几段保持不变，我就不重复贴了 …… */}

      <section id="about" className="jyc-section jyc-section-alt">
        <h2>关于我们</h2>
        <p>
          太原精业城重工设备有限公司位于能源重化工城市——山西省太原市，占地面积约 7 万平方米，
          是一家专业从事轧钢设备的重工企业。公司以无缝钢管机组设备的制造为主，集设计、生产、
          经营于一体，为国内外客户提供从方案规划、设备制造到安装调试、售后服务的完整支持。
        </p>
      </section>

      {/* Gallery / Contact / Footer / ChatBubble 都可以继续用你原来的代码 */}
      {/* ... */}
      <section id="gallery" className="jyc-section">
        {/* 原来的 gallery 代码保持不变 */}
        {/* ... */}
      </section>

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
