import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function AboutHiPage() {
  return (
    <main className="jyc-page">
      <Header />

      <section className="jyc-section jyc-section-alt">
        <div className="jyc-container">
          {/* HERO */}
          <div className="jyc-about-hero">
            <div>
              <div className="jyc-chip">Since 1993 • Heavy Industry</div>

              <h1 className="jyc-about-title">ताइयुआन जिंगयेचेंग स्टील इक्विपमेंट कं.</h1>

              <p className="jyc-about-lead">
                Taiyuan Jingyecheng Heavy Equipment Ltd. ताइयुआन, शानक्सी प्रांत में
                स्थित है, जिसका साइट क्षेत्र लगभग 70,000 m² है। कंपनी सीमलेस स्टील पाइप
                के लिए रोलिंग उपकरणों में विशेषज्ञ है—जिसमें पियर्सिंग मिल्स, पाइप रोलिंग
                मिल्स, साइजिंग/रिड्यूसिंग मिल्स, स्ट्रेटनिंग मशीनें, कूलिंग बेड्स, हॉट
                सेंट्रिंग मशीनें और कोल्ड ड्रॉइंग मशीनें शामिल हैं। हम डिज़ाइन, निर्माण और
                बिक्री को एकीकृत करते हैं, और लाइन प्लानिंग से लेकर इंस्टॉलेशन, कमीशनिंग
                तथा आफ्टर-सेल्स सपोर्ट तक पूर्ण सेवाएँ प्रदान करते हैं।
              </p>

              <div className="jyc-about-stats">
                <div className="jyc-stat">
                  <div className="jyc-stat-num">70,000</div>
                  <div className="jyc-stat-label">m² साइट क्षेत्र</div>
                </div>
                <div className="jyc-stat">
                  <div className="jyc-stat-num">1993</div>
                  <div className="jyc-stat-label">स्थापना वर्ष</div>
                </div>
                <div className="jyc-stat">
                  <div className="jyc-stat-num">Seamless</div>
                  <div className="jyc-stat-label">पाइप मिल लाइन्स</div>
                </div>
              </div>

              <div className="jyc-about-actions">
                <a className="jyc-btn-primary" href="/hi/contact">
                  संपर्क करें
                </a>
                <a className="jyc-btn-secondary" href="/hi/products">
                  उत्पाद देखें
                </a>
              </div>
            </div>

            {/* Photo card */}
            <figure className="jyc-about-photoCard">
              <img
                className="jyc-about-photo"
                src="/company.jpg"
                alt="Taiyuan Jingyecheng Steel Equipment manufacturing facility"
              />
              <figcaption className="jyc-about-caption">
                निर्माण सुविधा और उत्पादन लाइन का अवलोकन
              </figcaption>
            </figure>
          </div>

          {/* CONTENT GRID */}
          <div className="jyc-about-grid">
            <div className="jyc-panel">
              <h2 className="jyc-panel-title">मुख्य उत्पाद और सेवाएँ</h2>
              <ul className="jyc-list">
                <li>सीमलेस पाइप मिल लाइनों और संबंधित रोलिंग उपकरणों का डिज़ाइन व निर्माण।</li>
                <li>ग्राहक की प्रक्रिया आवश्यकताओं के अनुसार लाइन लेआउट योजना और तकनीकी सहायता।</li>
                <li>स्थापना पर्यवेक्षण, कमीशनिंग, ऑपरेटर प्रशिक्षण तथा बिक्री-पश्चात सेवा।</li>
                <li>मौजूदा सुविधाओं के लिए लाइन अपग्रेड, आधुनिकीकरण और अनुकूलन समाधान।</li>
              </ul>
            </div>

            <div className="jyc-panel jyc-panel-accent">
              <h2 className="jyc-panel-title">संपर्क जानकारी</h2>

              <div className="jyc-contactCard">
                <div className="jyc-contactRow">
                  <span className="jyc-contactKey">Email</span>
                  <a className="jyc-contactVal" href="mailto:wendy@jycsteelequip.com">
                    wendy@jycsteelequip.com
                  </a>
                </div>

                <div className="jyc-divider" />

                <p className="jyc-contactHint">
                  कृपया अपने प्रोजेक्ट/आवश्यकता का संक्षिप्त विवरण भेजें—हम जल्द ही जवाब देंगे।
                </p>

                <a className="jyc-btn-primary jyc-contactCta" href="/hi/contact">
                  संदेश भेजें
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
