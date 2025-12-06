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
            Shanxi Taikuang Steel Pipe Equipment Co., Ltd.
          </h1>

          <p className="jyc-section-intro">
            Founded in 1993, Shanxi Taikuang Steel Pipe Equipment Co., Ltd.
            covers a total area of about 70,000 square meters and is located in
            Taiyuan, Shanxi Province, a key city for energy and heavy chemical
            industries. The company is a heavy industry enterprise specialized
            in rolling equipment, focusing on the manufacturing of seamless
            steel pipe mill lines and related machinery.
          </p>

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
              Address: Baihuagu, Taiyuan, Shanxi Province, China
              <br />
              Tel: 0351-2028121
              <br />
              Email: sxtkgg@aliyun.com
            </p>
            <p style={{ fontSize: "12px", color: "#888", marginTop: 4 }}>
              © Shanxi Taikuang Steel Pipe Equipment Co., Ltd. ICP No.
              晋ICP备07000249号-1
            </p>
          </section>
        </div>
      </section>

      <Footer />
    </main>
  );
}
