import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function AboutHiPage() {
  return (
    <main className="jyc-page">
      <Header />

      <section className="jyc-section jyc-section-alt">
        <div style={{ maxWidth: 920, margin: "0 auto" }}>
          <h1 style={{ fontSize: "26px", marginBottom: "12px" }}>
            ताइयुआन जिंगयेचेंग स्टील इक्विपमेंट कं.
          </h1>

          <p className="jyc-section-intro">
            1993 में स्थापित, Taiyuan Jingyecheng Steel Equip Co., Ltd. का कुल
            क्षेत्रफल लगभग 70,000 वर्ग मीटर है और यह शानक्सी प्रांत के ताइयुआन
            शहर में स्थित है—जो ऊर्जा व भारी रासायनिक उद्योगों का प्रमुख केंद्र
            है। कंपनी रोलिंग इक्विपमेंट में विशेषज्ञ है, विशेष रूप से seamless
            steel pipe mill lines और संबंधित मशीनरी के निर्माण पर केंद्रित।
          </p>

          <section style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: "20px", marginBottom: "8px" }}>
              मुख्य उत्पाद और सेवाएँ
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
                Seamless pipe mill lines और संबंधित rolling equipment का डिज़ाइन
                व निर्माण।
              </li>
              <li>
                ग्राहक की process requirements के अनुसार line layout planning
                और तकनीकी समर्थन।
              </li>
              <li>
                Installation supervision, commissioning, operator training और
                after-sales service।
              </li>
              <li>
                मौजूदा सुविधाओं के लिए line upgrades, modernization और
                optimization solutions।
              </li>
            </ul>
          </section>

          <section style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: "20px", marginBottom: "8px" }}>
              संपर्क जानकारी
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
