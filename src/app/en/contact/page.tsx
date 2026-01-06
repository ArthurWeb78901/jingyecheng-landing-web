// src/app/en/contact/page.tsx
import React from "react";
import Image from "next/image";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function ContactEnPage() {
  return (
    <main className="jyc-page">
      <Header />

      <section className="jyc-section jyc-section-alt">
        <div className="jyc-container">
          <div className="jyc-contact-layout">
            {/* Left: Title + Form */}
            <div>
              <h1 style={{ fontSize: "24px", marginBottom: "8px" }}>Contact Us</h1>
              <p className="jyc-section-intro">
                Please fill out the form below and briefly describe your project
                requirements. We will arrange our sales engineer to contact you by
                phone or email as soon as possible.
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
                  placeholder="Please describe your current production line, planned capacity or equipment requirements..."
                />
                <button type="submit" className="jyc-btn-primary jyc-contact-submit">
                  Submit
                </button>
              </form>
            </div>

            {/* Right: Map */}
            <aside className="jyc-map-card" aria-label="Location map">
              <div className="jyc-map-media">
                <Image
                  src="/map.png"
                  alt="JYC location map"
                  fill
                  sizes="(max-width: 900px) 100vw, 520px"
                />
              </div>
              <div className="jyc-map-caption">Location map (for reference)</div>
            </aside>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
