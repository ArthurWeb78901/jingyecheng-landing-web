import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function AboutIdPage() {
  return (
    <main className="jyc-page">
      <Header />

      <section className="jyc-section jyc-section-alt">
        <div className="jyc-container">
          {/* HERO */}
          <div className="jyc-about-hero">
            <div>
              <div className="jyc-chip">Since 1993 • Heavy Industry</div>

              <h1 className="jyc-about-title">Taiyuan Jingyecheng Steel Equip Co.</h1>

              <p className="jyc-about-lead">
                Didirikan pada tahun 1993, Taiyuan Jingyecheng Steel Equip Co., Ltd.
                memiliki luas area sekitar 70.000 meter persegi dan berlokasi di Taiyuan,
                Provinsi Shanxi—kota penting untuk industri energi dan kimia berat.
                Perusahaan ini berfokus pada peralatan rolling, khususnya manufaktur lini
                pabrik pipa baja tanpa sambungan (seamless) serta mesin-mesin terkait.
              </p>

              <div className="jyc-about-stats">
                <div className="jyc-stat">
                  <div className="jyc-stat-num">70.000</div>
                  <div className="jyc-stat-label">m² luas area</div>
                </div>
                <div className="jyc-stat">
                  <div className="jyc-stat-num">1993</div>
                  <div className="jyc-stat-label">tahun berdiri</div>
                </div>
                <div className="jyc-stat">
                  <div className="jyc-stat-num">Seamless</div>
                  <div className="jyc-stat-label">pipe mill lines</div>
                </div>
              </div>

              <div className="jyc-about-actions">
                <a className="jyc-btn-primary" href="/id/contact">
                  Hubungi Kami
                </a>
                <a className="jyc-btn-secondary" href="/id/products">
                  Lihat Produk
                </a>
              </div>
            </div>

            {/* Photo card */}
            <figure className="jyc-about-photoCard">
              <img
                className="jyc-about-photo"
                src="/company.jpg"
                alt="Fasilitas manufaktur Taiyuan Jingyecheng Steel Equipment"
              />
              <figcaption className="jyc-about-caption">
                Gambaran fasilitas manufaktur dan lini produksi
              </figcaption>
            </figure>
          </div>

          {/* CONTENT GRID */}
          <div className="jyc-about-grid">
            <div className="jyc-panel">
              <h2 className="jyc-panel-title">Produk & Layanan Utama</h2>
              <ul className="jyc-list">
                <li>Desain dan manufaktur lini pabrik pipa seamless serta peralatan rolling terkait.</li>
                <li>Perencanaan layout lini dan dukungan teknis sesuai kebutuhan proses pelanggan.</li>
                <li>Supervisi instalasi, commissioning, pelatihan operator, dan layanan purna jual.</li>
                <li>Upgrade lini, modernisasi, dan solusi optimasi untuk fasilitas yang sudah ada.</li>
              </ul>
            </div>

            <div className="jyc-panel jyc-panel-accent">
              <h2 className="jyc-panel-title">Informasi Kontak</h2>

              <div className="jyc-contactCard">
                <div className="jyc-contactRow">
                  <span className="jyc-contactKey">Email</span>
                  <a className="jyc-contactVal" href="mailto:wendy@jycsteelequip.com">
                    wendy@jycsteelequip.com
                  </a>
                </div>

                <div className="jyc-divider" />

                <p className="jyc-contactHint">
                  Kirim ringkasan kebutuhan/proyek Anda—kami akan segera menghubungi Anda kembali.
                </p>

                <a className="jyc-btn-primary jyc-contactCta" href="/id/contact">
                  Kirim Pesan
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
