// src/app/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ChatBubble } from "@/components/ChatBubble";

type HomeGalleryItem = {
  id: number;
  title: string;
  description?: string;
  imageUrl?: string;
  showOnHome?: boolean;
  createdAt?: string;
};

const STORAGE_KEY = "jyc_admin_gallery_items";

export default function Home() {
  const [homeItems, setHomeItems] = useState<HomeGalleryItem[]>([]);

  // 从 localStorage 读取后台图库（示意）资料
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const list: HomeGalleryItem[] = JSON.parse(raw);

      const filtered = list
        .filter((item) => item.imageUrl && item.showOnHome)
        .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));

      setHomeItems(filtered);
    } catch (err) {
      console.error("load home gallery items error", err);
    }
  }, []);

  const heroItem = homeItems[0] || null;
  const productThumbs = homeItems.slice(1, 4); // 给 3 张产品卡片用
  const galleryItems = homeItems.slice(0, 4); // Gallery 区块最多 4 张

  const products = [
    {
      model: "无缝钢管机组",
      desc: "用于生产各类规格无缝钢管的成套机组设备，结构扎实、运行稳定。",
    },
    {
      model: "轧钢设备",
      desc: "适用于多种钢材成型的轧机与配套设备，可依工艺需求规划整线。",
    },
    {
      model: "整线自动化方案",
      desc: "结合输送、冷床、切割等单元，提供整线规划与自动化集成服务。",
    },
  ];

  return (
    <main className="jyc-page">
      <Header />

      {/* Hero 区块 */}
      <section className="jyc-hero">
        <div className="jyc-hero-text">
          <h1>无缝钢管机组与轧钢设备整体解决方案提供商</h1>
          <p>
            山西太矿钢管设备有限公司成立于 1993 年，深耕无缝钢管机组设备与轧钢设备领域，
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

        {/* Hero 图片：有图片时用 Firebase URL，当作背景图 */}
        <div
          className="jyc-hero-image"
          style={
            heroItem?.imageUrl
              ? {
                  backgroundImage: `url(${heroItem.imageUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  color: "#fff",
                }
              : undefined
          }
        >
          <span>
            {heroItem
              ? heroItem.title || "无缝钢管机组 / 轧钢生产线主视觉"
              : "无缝钢管机组 / 轧钢生产线主视觉图片预留区（Gallery slide）"}
          </span>
        </div>
      </section>

      {/* 产品概要区块 */}
      <section id="products" className="jyc-section">
        <h2>主要产品一览</h2>

        <div className="jyc-card-grid">
          {products.map((item, index) => {
            const thumb = productThumbs[index];

            return (
              <article key={item.model} className="jyc-card">
                <div
                  className="jyc-card-image"
                  style={
                    thumb?.imageUrl
                      ? {
                          backgroundImage: `url(${thumb.imageUrl})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }
                      : undefined
                  }
                />
                <h3>{item.model}</h3>
                <p>{item.desc}</p>
                <button type="button" className="jyc-card-btn">
                  了解更多
                </button>
              </article>
            );
          })}
        </div>
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
          设备现场、生产线布局与项目案例照片。当前版本示意由后台「图片 / Gallery 管理」勾选
          「显示在首页轮播」后，同步到此区域显示。
        </p>

        <div className="jyc-gallery-grid">
          {galleryItems.length === 0 ? (
            // 没有任何资料时仍旧显示占位块
            [1, 2, 3, 4].map((i) => <div key={i} className="jyc-gallery-item" />)
          ) : (
            galleryItems.map((item) => (
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
            ))
          )}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="jyc-section jyc-section-alt">
        <h2>联系我们</h2>
        <p className="jyc-section-intro">
          请留下您的联络资讯与需求，我们会尽快由相关人员与您联系，也可直接拨打电话或来信洽询。
        </p>

        <form className="jyc-contact-form">
          <div className="jyc-form-row">
            <input type="text" placeholder="姓名" />
            <input type="text" placeholder="公司 / 单位" />
          </div>
          <div className="jyc-form-row">
            <input type="email" placeholder="Email" />
            <input type="tel" placeholder="电话 / 手机" />
          </div>
          <textarea rows={4} placeholder="请输入您的需求或问题…" />
          <button type="submit" className="jyc-btn-primary jyc-contact-submit">
            送出咨询
          </button>
        </form>
      </section>

      <Footer />

      {/* 右下角在线助手泡泡 */}
      <ChatBubble />
    </main>
  );
}
