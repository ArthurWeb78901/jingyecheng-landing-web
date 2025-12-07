// src/app/en/page.tsx
import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ChatBubble } from "@/components/ChatBubble";

export default function HomeEn() {
  return (
    <main className="jyc-page">
      <Header />

      {/* Hero - 和中文共用背景图，英文加 jyc-hero-en 让渐层更浅 */}
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
              Seamless pipe mill production line (sample photo)
            </p>
          </div>
        </div>
      </section>

      {/* Products overview */}
      <section id="products" className="jyc-section">
        <h2>Main Products</h2>

        <div className="jyc-card-grid">
          {[
            {
              model: "Seamless Pipe Mill Lines",
              desc: "Turn-key hot rolling lines for seamless steel pipes, covering billet piercing, pipe rolling, sizing / reducing, straightening, cooling and finishing for tube diameters of approximately φ50–φ325 mm.",
            },
            {
              model: "Piercing & Pipe Rolling Mills",
              desc: "Mannesmann piercing mills, horizontal cone-type piercing mills and automatic / Accu-Roll pipe mills, including our proprietary two-roll mandrel mills with guide plates for high dimensional accuracy, large elongation and uniform wall thickness of hollow shells (typically φ50–φ280 mm).",
            },
            {
              model: "Finishing & Auxiliary Equipment",
              desc: "Two-roll and three-roll sizing / reducing mills, six-roll and seven-roll straightening machines, chain and walking-beam cooling beds, hot centering machines and cold drawing machines for precise, straight and clean tubes in the φ10–φ325 mm range.",
            },
          ].map((item, index) => (
            <article key={item.model} className="jyc-card">
              {/* 第一张卡片加上 jyc-card-image-1，复用中文版的背景图样式 */}
              <div
                className={`jyc-card-image${
                  index === 0 ? " jyc-card-image-1" : ""
                }`}
              />
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
          Photos of key equipment such as piercing mills, pipe rolling mills,
          sizing / reducing mills, straightening machines, cooling beds, hot
          centering machines and cold drawing machines, as well as production
          line layouts and project references. This section can be connected to
          the backend gallery management in the future to auto-update the latest
          cases.
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
