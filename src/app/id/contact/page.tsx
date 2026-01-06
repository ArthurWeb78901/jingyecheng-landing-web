// src/app/id/contact/page.tsx
import React from "react";
import Image from "next/image";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function ContactIdPage() {
  return (
    <main className="jyc-page">
      <Header />

      <section className="jyc-section jyc-section-alt">
        <div className="jyc-container">
          <div className="jyc-contact-layout">
            {/* Left: Title + Form */}
            <div>
              <h1 style={{ fontSize: "24px", marginBottom: "8px" }}>
                Hubungi Kami
              </h1>
              <p className="jyc-section-intro">
                Silakan isi formulir di bawah ini dan jelaskan secara singkat
                kebutuhan proyek Anda. Kami akan mengatur agar sales engineer
                kami menghubungi Anda melalui telepon atau email sesegera mungkin.
              </p>

              <form className="jyc-contact-form">
                <div className="jyc-form-row">
                  <input type="text" placeholder="Nama" />
                  <input type="text" placeholder="Perusahaan / Organisasi" />
                </div>
                <div className="jyc-form-row">
                  <input type="email" placeholder="Email" />
                  <input type="tel" placeholder="Telepon" />
                </div>
                <textarea
                  rows={4}
                  placeholder="Jelaskan lini produksi Anda saat ini, kapasitas yang direncanakan, atau kebutuhan peralatan..."
                />
                <button
                  type="submit"
                  className="jyc-btn-primary jyc-contact-submit"
                >
                  Kirim
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
              <div className="jyc-map-caption">
                Location map (for reference)
              </div>
            </aside>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
