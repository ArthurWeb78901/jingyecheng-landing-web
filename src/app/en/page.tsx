// src/app/en/page.tsx
import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ChatBubble } from "@/components/ChatBubble";

export default function HomeEn() {
  return (
    <main className="jyc-page">
      <Header />

      {/* Hero：背景图已经在全局 CSS 的 .jyc-hero 里用 /background-image.png 设定 */}
      <section className="jyc-hero">
        <div className="jyc-hero-text">
          <h1>Turn-key Solutions for Seamless Pipe Mills & Rolling Equipment</h1>
          <p>
            Founded in 1993, Shanxi Taikuang Steel Pipe Equipment Co., Ltd.
            focuses on seamless steel pipe mill lines and rolling equipment,
            providing reliable production lines and technical support with
            professional design, manufacturing and service capabilities.
          </p>

          <div className="jyc-hero-actions">
            <a href="#contact" className="jyc-btn-primary">
              Contact Us
            </a>
            <a href="/en/products" className="jyc-btn-secondary">
              View Products
            </a>
          </div>

          {/* 背景照片说明文字（反白显示在左下角） */}
          <p
            style={{
              marginTop: 16,
              fontSize: 12,
              color: "#f5f5f5",
              opacity: 0.9,
            }}
          >
            Seamless pipe mill production line (sample photo)
          </p>
        </div>
      </section>

      {/* Products overview */}
      <section id="products" className="jyc-section">
        <h2>Main Products</h2>

        <div className="jyc-card-grid">
          {[
            {
              model: "Seamless Pipe Mill",
              desc: "Complete mill lines for producing various sizes of seamless steel pipes with robust structure and stable operation.",
            },
            {
              model: "Rolling Mill Equipment",
              desc: "Rolling stands and auxiliary equipment for different steel profiles, with line layout tailored to process requirements.",
            },
            {
              model: "Turn-key Automation",
              desc: "Integrated solutions combining conveying, cooling bed, cutting and packaging units for automated production lines.",
            },
          ].map((item) => (
            <article key={item.model} className="jyc-card">
              <div className="jyc-card-image" />
              <h3>{item.model}</h3>
              <p>{item.desc}</p>
              <button type="button" className="jyc-card-btn">
                Learn More
              </button>
            </article>
          ))}
        </div>
      </section>

      {/* About (short) */}
      <section id="about" className="jyc-section jyc-section-alt">
        <h2>About Us</h2>
        <p>
          Shanxi Taikuang Steel Pipe Equipment Co., Ltd. is located in Taiyuan,
          Shanxi Province, with a site area of about 70,000 m². The company is a
          heavy industry manufacturer specialized in rolling equipment, focusing
          on seamless pipe mill lines. We integrate design, manufacturing and
          sales, and provide complete services from line planning, equipment
          supply to installation, commissioning and after-sales support.
        </p>
      </section>

      {/* Gallery */}
      <section id="gallery" className="jyc-section">
        <h2>Gallery</h2>
        <p className="jyc-section-intro">
          Photos of equipment installation, production line layouts and project
          references. This section can be connected to the backend gallery
          management in the future to auto-update latest cases.
        </p>

        <div className="jyc-gallery-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="jyc-gallery-item" />
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

        <form className="jyc-contact-form">
          <div className="jyc-form-row">
            <input type="text" placeholder="Name" />
            <input type="text" placeholder="Company / Organization" />
          </div>
          <div className="jyc-form-row">
            <input type="email" placeholder="Email" />
            <input type="tel" placeholder="Phone" />
          </div>
          <textarea
            rows={4}
            placeholder="Please describe your needs or project idea..."
          />
          <button type="submit" className="jyc-btn-primary jyc-contact-submit">
            Submit Inquiry
          </button>
        </form>
      </section>

      <Footer />
      <ChatBubble />
    </main>
  );
}
