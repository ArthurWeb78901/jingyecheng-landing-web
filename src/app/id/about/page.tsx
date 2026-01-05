import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function AboutIdPage() {
  return (
    <main className="jyc-page">
      <Header />

      <section className="jyc-section jyc-section-alt">
        <div style={{ maxWidth: 920, margin: "0 auto" }}>
          <h1 style={{ fontSize: "26px", marginBottom: "12px" }}>
            Taiyuan Jingyecheng Steel Equip Co.
          </h1>

          <p className="jyc-section-intro">
            Didirikan pada tahun 1993, Taiyuan Jingyecheng Steel Equip Co., Ltd.
            memiliki luas area sekitar 70.000 meter persegi dan berlokasi di
            Taiyuan, Provinsi Shanxi—kota penting untuk industri energi dan
            kimia berat. Perusahaan ini merupakan pelaku industri berat yang
            berfokus pada peralatan rolling, khususnya manufaktur lini pabrik
            pipa baja tanpa sambungan (seamless) serta mesin-mesin terkait.
          </p>

          {/* ✅ Foto fasilitas perusahaan */}
          <div style={{ margin: "20px 0 28px" }}>
            <img
              src="/company.jpg"
              alt="Fasilitas manufaktur Taiyuan Jingyecheng Steel Equipment"
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
              Gambaran fasilitas manufaktur dan lini produksi
            </p>
          </div>

          <section style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: "20px", marginBottom: "8px" }}>
              Produk & Layanan Utama
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
                Desain dan manufaktur lini pabrik pipa seamless serta peralatan
                rolling terkait.
              </li>
              <li>
                Perencanaan layout lini dan dukungan teknis sesuai kebutuhan
                proses pelanggan.
              </li>
              <li>
                Supervisi instalasi, commissioning, pelatihan operator, dan
                layanan purna jual.
              </li>
              <li>
                Upgrade lini, modernisasi, dan solusi optimasi untuk fasilitas
                yang sudah ada.
              </li>
            </ul>
          </section>

          <section style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: "20px", marginBottom: "8px" }}>
              Informasi Kontak
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
