// src/app/en/about/page.tsx
import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function AboutEnPage() {
  return (
    <main className="jyc-page">
      <Header />

      {/* About Hero */}
      <section className="jyc-section jyc-section-alt">
        <div className="jyc-container">
          <div className="jyc-about-hero">
            <div className="jyc-about-hero-left">
              <div className="jyc-chip">Since 1993 • Heavy Industry</div>

              <h1 className="jyc-about-title">
                Taiyuan JingYeCheng Steel Equipment Ltd.
              </h1>

              <p className="jyc-about-lead">
                Founded in 1993, Taiyuan Jingyecheng Steel Equip Co., Ltd. covers a total
                area of about 70,000 square meters and is located in Taiyuan, Shanxi
                Province, a key city for energy and heavy chemical industries. The company
                is a heavy industry enterprise specialized in rolling equipment, focusing
                on the manufacturing of seamless steel pipe mill lines and related
                machinery.
              </p>

              <div className="jyc-about-stats">
                <div className="jyc-stat">
                  <div className="jyc-stat-num">70,000</div>
                  <div className="jyc-stat-label">m² facility area</div>
                </div>
                <div className="jyc-stat">
                  <div className="jyc-stat-num">1993</div>
                  <div className="jyc-stat-label">established</div>
                </div>
                <div className="jyc-stat">
                  <div className="jyc-stat-num">Seamless</div>
                  <div className="jyc-stat-label">pipe mill lines</div>
                </div>
              </div>

              <div className="jyc-about-actions">
                <a className="jyc-btn-primary" href="/en/products">
                  View Products
                </a>
                <a className="jyc-btn-secondary" href="/en/contact">
                  Contact Us
                </a>
              </div>
            </div>

            {/* Right: Photo Card */}
            <div className="jyc-about-hero-right">
              <figure className="jyc-about-photoCard">
                <img
                  src="/company.jpg"
                  alt="Taiyuan Jingyecheng Steel Equipment manufacturing facility"
                  className="jyc-about-photo"
                />
                <figcaption className="jyc-about-caption">
                  Manufacturing facility and production line overview
                </figcaption>
              </figure>
            </div>
          </div>

          {/* Main content grid */}
          <div className="jyc-about-grid">
            {/* Main Products */}
            <section className="jyc-panel">
              <h2 className="jyc-panel-title">Main Products & Services</h2>

              <ul className="jyc-list">
                <li>
                  Design and manufacturing of seamless pipe mill lines and related rolling equipment.
                </li>
                <li>
                  Line layout planning and technical support according to customer process requirements.
                </li>
                <li>
                  Installation supervision, commissioning, operator training and after-sales service.
                </li>
                <li>
                  Line upgrades, modernization and optimization solutions for existing facilities.
                </li>
              </ul>

              <div className="jyc-divider" />
              <p className="jyc-panel-note">
                We support end-to-end delivery: planning → manufacturing → installation → commissioning → after-sales.
              </p>
            </section>

            {/* Contact card */}
            <aside className="jyc-panel jyc-panel-accent">
              <h2 className="jyc-panel-title">Contact Information</h2>

              <div className="jyc-contactCard">
                <div className="jyc-contactRow">
                  <span className="jyc-contactKey">Email</span>
                  <a className="jyc-contactVal" href="mailto:wendy@jycsteelequip.com">
                    wendy@jycsteelequip.com
                  </a>
                </div>

                <div className="jyc-divider" />

                <div className="jyc-contactHint">
                  For quotations and technical inquiries, please email us with your mill line requirements.
                </div>

                <a className="jyc-btn-primary jyc-contactCta" href="mailto:wendy@jycsteelequip.com">
                  Email Us
                </a>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
