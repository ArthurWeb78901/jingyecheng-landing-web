// src/app/en/about/page.tsx
import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function AboutEnPage() {
  return (
    <main className="jyc-page">
      <Header />

      <section className="jyc-section jyc-section-alt">
        <div style={{ maxWidth: 920, margin: "0 auto" }}>
          <h1 style={{ fontSize: "26px", marginBottom: "12px" }}>
            Taiyuan Jingyecheng Steel Equip Co.
          </h1>

          <p className="jyc-section-intro">
            Founded in 1993, Taiyuan Jingyecheng Steel Equip Co., Ltd.
            covers a total area of about 70,000 square meters and is located in
            Taiyuan, Shanxi Province, a key city for energy and heavy chemical
            industries. The company is a heavy industry enterprise specialized
            in rolling equipment, focusing on the manufacturing of seamless
            steel pipe mill lines and related machinery.
          </p>

          {/* ✅ 公司實景照片 */}
          <div style={{ margin: "20px 0 28px" }}>
            <img
              src="/company.jpg"
              alt="Taiyuan Jingyecheng Steel Equipment manufacturing facility"
              style={{
                width: "100%",
                maxWidth: 900,
                borderRadius: 8,
                display: "block",
                margin: "0 auto",
              }}
            />
            <p
              style={{
                fontSize: 12,
                color: "#777",
                textAlign: "center",
                marginTop: 6,
              }}
            >
              Manufacturing facility and production line overview
            </p>
          </div>

          <section style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: "20px", marginBottom: "8px" }}>
              Main Products & Services
            </h2>
            <ul
              style={{
                paddingLeft: 18,
                fontSize: "14px",
                color: "#555",
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              <li>
                Design and manufacturing of seamless pipe mill lines and related
                rolling equipment.
              </li>
              <li>
                Line layout planning and technical support according to customer
                process requirements.
              </li>
              <li>
                Installation supervision, commissioning, operator training and
                after-sales service.
              </li>
              <li>
                Line upgrades, modernization and optimization solutions for
                existing facilities.
              </li>
            </ul>
          </section>

          <section style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: "20px", marginBottom: "8px" }}>
              Contact Information
            </h2>
            <p
              style={{
                fontSize: "14px",
                color: "#555",
                lineHeight: 1.8,
                marginBottom: 8,
              }}
            >
              <br />
              Email: wendy@jycsteelequip.com
            </p>
          </section>
        </div>
      </section>

      <Footer />
    </main>
  );
}
