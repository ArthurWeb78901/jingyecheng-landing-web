// src/app/en/gallery/page.tsx
import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function GalleryEnPage() {
  return (
    <main className="jyc-page">
      <Header />

      <section className="jyc-section">
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <h1 style={{ fontSize: "24px", marginBottom: "8px" }}>Gallery</h1>
          <p className="jyc-section-intro">
            Photo gallery of equipment installation, production lines and
            project references. In the future, this page can be connected to a
            backend gallery management module for centralized maintenance and
            periodic updates.
          </p>

          <div className="jyc-gallery-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="jyc-gallery-item" />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
