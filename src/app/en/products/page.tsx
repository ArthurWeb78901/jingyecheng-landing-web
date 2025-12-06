// src/app/en/products/page.tsx
import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

type Product = {
  key: string;
  name: string;
  brief: string;
  features: string[];
};

const products: Product[] = [
  {
    key: "seamless-mill",
    name: "Seamless Pipe Mill Line",
    brief:
      "Complete mill lines for producing seamless steel pipes in various sizes and grades.",
    features: [
      "Configurable according to pipe size range and capacity requirements",
      "Applicable to multiple steel grades and end-use applications",
      "Covers heating, piercing, rolling, sizing, cooling and other process sections",
    ],
  },
  {
    key: "rolling-equipment",
    name: "Rolling Mill Equipment",
    brief:
      "Rolling stands and related equipment for different steel products, planned as a complete line.",
    features: [
      "Supports different stand layouts and rolling methods",
      "Can be integrated with cutting, cooling bed and conveying systems",
      "Suitable for hot rolling, sizing and other process stages",
    ],
  },
  {
    key: "finishing-line",
    name: "Finishing & Post-processing Line",
    brief:
      "Finishing and inspection equipment for seamless pipes and rolled products, improving final quality.",
    features: [
      "Customizable with straightening, flaw detection, length measuring and bundling units",
      "Modular combination based on customer process requirements",
      "Improves consistency and traceability of outgoing products",
    ],
  },
];

export default function ProductsEnPage() {
  return (
    <main className="jyc-page">
      <Header />

      <section className="jyc-section jyc-section-alt">
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <h1 style={{ fontSize: "26px", marginBottom: "8px" }}>
            Products Overview
          </h1>
          <p className="jyc-section-intro">
            Below are the main product categories of Shanxi Taikuang Steel Pipe
            Equipment Co., Ltd. Detailed technical specifications and line
            configurations can be customized according to process, capacity and
            plant layout requirements, and are subject to the final technical
            proposal and quotation.
          </p>

          <div className="jyc-card-grid">
            {products.map((p) => (
              <article key={p.key} className="jyc-card">
                <div className="jyc-card-image" />
                <h2 style={{ fontSize: "18px", marginBottom: "4px" }}>
                  {p.name}
                </h2>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#555",
                    marginBottom: "10px",
                  }}
                >
                  {p.brief}
                </p>

                <ul
                  style={{
                    paddingLeft: "18px",
                    margin: "0 0 12px 0",
                    fontSize: "13px",
                    color: "#555",
                    lineHeight: 1.6,
                  }}
                >
                  {p.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>

                <button type="button" className="jyc-card-btn">
                  Ask About This Category
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
