// src/app/en/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ChatBubble } from "@/components/ChatBubble";
import { ContactFormEn } from "@/components/ContactFormEn";

type HomeGalleryItem = {
  id: number;
  title: string;
  description?: string;
  imageUrl?: string;
  showOnHome?: boolean;
  createdAt?: string;
};

const STORAGE_KEY = "jyc_admin_gallery_items";

export default function HomeEn() {
  const [homeItems, setHomeItems] = useState<HomeGalleryItem[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  // 从后台 Gallery 资料读取要在首页用的图片（目前还是 localStorage）
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
      console.error("load home gallery items error (en)", err);
    }
  }, []);

  // 简单轮播
  useEffect(() => {
    if (homeItems.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % homeItems.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [homeItems.length]);

  // 首页要用到的图：前三张给产品卡片、前四张给 gallery
  const productThumbs = homeItems.slice(0, 3);
  const galleryItems = homeItems.slice(0, 4);
  const currentItem = homeItems[currentSlide];

  const products = [
    {
      model: "Seamless Pipe Mill Lines",
      desc: "Turn-key hot rolling lines for seamless steel pipes, covering billet heating and piercing, pipe rolling, sizing / reducing, straightening, cooling and cutting, typically for tube diameters of approximately φ50–φ325 mm.",
    },
    {
      model: "Piercing & Pipe Rolling Mills",
      desc: "Mannesmann piercing mills, horizontal cone-type piercing mills and automatic / Accu-Roll pipe mills, including our proprietary two-roll mandrel mills with guide plates, designed for high dimensional accuracy, large elongation and uniform wall thickness of hollow shells and pipes.",
    },
    {
      model: "Finishing & Auxiliary Equipment",
      desc: "Two-roll and three-roll sizing / reducing mills, six-roll and seven-roll straightening machines, chain and walking-beam cooling beds, hot centering machines, cold drawing machines and related conveying equipment for tube diameters of approx. φ10–φ325 mm.",
    },
  ];

  return (
    <main className="jyc-page">
      <Header />

      {/* Hero - 和中文共用背景图，英文用 jyc-hero-en 渐层较浅 */}
      <section className="jyc-hero jyc-hero-en">
        <div className="jyc-hero-inner">
          <div className="jyc-hero-text">
            <h1>
              Turn-key Solutions for Seamless Pipe Mills &amp; Rolling Equipment
            </h1>
            <p>
              Founded in 1993, Shanxi Taikuang Steel Pipe Equipment Co., Ltd.
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

      {/* Products overview */}
      <section id="products" className="jyc-section">
        <h2>Main Products</h2>

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
                  Learn More
                </button>
              </article>
            );
          })}
        </div>
      </section>

      {/* About (short) */}
      <section id="about" className="jyc-section jyc-section-alt">
        <h2>About Us</h2>
        <p>
          Shanxi Taikuang Steel Pipe Equipment Co., Ltd. is located in Taiyuan,
          Shanxi Province, with a site area of about 70,000 m². The company is a
          heavy industry manufacturer specialized in rolling equipment for
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

        {/* 首页轮播（与中文逻辑相同） */}
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
