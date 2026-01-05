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
{/* ✅ कंपनी की फोटो */}
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
              निर्माण सुविधा और उत्पादन लाइन का अवलोकन
            </p>
          </div>
          <p className="jyc-section-intro">
            Taiyuan Jingyecheng Heavy Equipment Ltd. ताइयुआन, शानक्सी प्रांत में स्थित है,
            जिसका साइट क्षेत्र लगभग 70,000 m² है। कंपनी सीमलेस स्टील पाइप के लिए रोलिंग
            उपकरणों में विशेषज्ञ है—जिसमें पियर्सिंग मिल्स, पाइप रोलिंग मिल्स,
            साइजिंग/रिड्यूसिंग मिल्स, स्ट्रेटनिंग मशीनें, कूलिंग बेड्स, हॉट सेंट्रिंग मशीनें
            और कोल्ड ड्रॉइंग मशीनें शामिल हैं। हम डिज़ाइन, निर्माण और बिक्री को एकीकृत करते हैं,
            और लाइन प्लानिंग से लेकर इंस्टॉलेशन, कमीशनिंग तथा आफ्टर-सेल्स सपोर्ट तक पूर्ण सेवाएँ प्रदान करते हैं।
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
                सीमलेस पाइप मिल लाइनों और संबंधित रोलिंग उपकरणों का डिज़ाइन व निर्माण।
              </li>
              <li>
                ग्राहक की प्रक्रिया आवश्यकताओं के अनुसार लाइन लेआउट योजना और तकनीकी सहायता।
              </li>
              <li>
                स्थापना पर्यवेक्षण, कमीशनिंग, ऑपरेटर प्रशिक्षण तथा बिक्री-पश्चात सेवा।
              </li>
              <li>
                मौजूदा सुविधाओं के लिए लाइन अपग्रेड, आधुनिकीकरण और अनुकूलन (ऑप्टिमाइज़ेशन) समाधान।
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
