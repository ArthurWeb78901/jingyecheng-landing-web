"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ChatBubble } from "@/components/ChatBubble";
import { ContactFormCn } from "@/components/ContactFormCn";

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
  const [currentSlide, setCurrentSlide] = useState(0);

  // 暂时仍从 localStorage 读取后台图库（示意），后续可改为 Firestore / 后台管理
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

  // 简单自动轮播：每 5 秒切一张（有 1 张图时不轮播）
  useEffect(() => {
    if (homeItems.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % homeItems.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [homeItems.length]);

  // 这两个区块还是用后台勾选出来的图片（之后可改为 Firestore）
  const productThumbs = homeItems.slice(0, 3); // 给 3 张产品卡片用
  const galleryItems = homeItems.slice(0, 4); // Gallery 区块最多 4 张

  const products = [
    {
      model: "热轧无缝钢管生产线",
      desc: "覆盖加热、穿孔、轧管、定径 / 减径、冷床、矫直、锯切等工序的整线机组，用于生产 φ50–φ325 mm 范围内的热轧无缝钢管，结构扎实、运行稳定。",
    },
    {
      model: "穿孔与轧管机组",
      desc: "包括曼内斯曼穿孔机、卧式锥形辊穿孔机、自动 / Accu-Roll 轧管机以及自研导板式二辊限动芯棒轧管机，适用于生产高尺寸精度、大延伸系数、壁厚均匀的空心坯与钢管。",
    },
    {
      model: "精整与辅助设备",
      desc: "提供二辊 / 三辊定径减径机、六辊 / 七辊矫直机、链式与步进式冷床、热定心机、冷拔机及相关输送辅助设备，用于 φ10–φ325 mm 钢管的定径、矫直、冷却与后续精整。",
    },
  ];

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
          「显示在首页轮播」后，同步到此区域与首页产品卡片显示；后续可改由 Firestore / 后台系统统一管理。
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
          {galleryItems.length === 0
            ? [1, 2, 3, 4].map((i) => (
                <div key={i} className="jyc-gallery-item" />
              ))
            : galleryItems.map((item) => (
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

      {/* 右下角在线助手泡泡 */}
      <ChatBubble />
    </main>
  );
}
