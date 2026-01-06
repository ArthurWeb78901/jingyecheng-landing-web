// src/app/hi/contact/page.tsx
import React from "react";
import Image from "next/image";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function ContactHiPage() {
  return (
    <main className="jyc-page">
      <Header />

      <section className="jyc-section jyc-section-alt">
        <div className="jyc-container">
          <div className="jyc-contact-layout">
            {/* Left: Title + Form */}
            <div>
              <h1 style={{ fontSize: "24px", marginBottom: "8px" }}>
                संपर्क करें
              </h1>
              <p className="jyc-section-intro">
                कृपया नीचे दिए गए फ़ॉर्म को भरें और अपनी परियोजना की आवश्यकताओं का
                संक्षिप्त विवरण दें। हम जल्द से जल्द हमारे sales engineer द्वारा फोन
                या ईमेल के माध्यम से संपर्क की व्यवस्था करेंगे।
              </p>

              <form className="jyc-contact-form">
                <div className="jyc-form-row">
                  <input type="text" placeholder="नाम" />
                  <input type="text" placeholder="कंपनी / संगठन" />
                </div>
                <div className="jyc-form-row">
                  <input type="email" placeholder="ईमेल" />
                  <input type="tel" placeholder="फ़ोन" />
                </div>
                <textarea
                  rows={4}
                  placeholder="कृपया अपनी वर्तमान प्रोडक्शन लाइन, नियोजित क्षमता या उपकरण आवश्यकताओं का वर्णन करें…"
                />
                <button type="submit" className="jyc-btn-primary jyc-contact-submit">
                  भेजें
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
