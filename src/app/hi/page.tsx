"use client";

import React, { useEffect, useState, useRef } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ChatBubble } from "@/components/ChatBubble";
import { ContactFormHi } from "@/components/ContactFormHi";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query, doc, getDoc } from "firebase/firestore";

type HomeGalleryItem = {
  id: string;
  title: string;
  titleEn?: string;
  titleHi?: string;
  imageUrl?: string;
  showOnHome?: boolean;
  createdAt?: string;
};

type HomeProduct = {
  id: string;
  category: string;
  categoryEn?: string;
  categoryHi?: string;
  name: string;
  nameEn?: string;
  nameHi?: string;
  brief: string;
  briefEn?: string;
  briefHi?: string;
  enabled: boolean;
  imageUrl?: string;
  homeOrder?: number;
};

type SiteConfigHome = {
  logoImageUrl?: string;
};

function pickTextHi(hi?: string, en?: string, fallback?: string) {
  const h = hi?.trim();
  if (h) return h;
  const e = en?.trim();
  if (e) return e;
  return fallback || "";
}

export default function HomeHi() {
  const [homeItems, setHomeItems] = useState<HomeGalleryItem[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [products, setProducts] = useState<HomeProduct[]>([]);
  const [siteConfig, setSiteConfig] = useState<SiteConfigHome>({});

  const productsRowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function loadConfig() {
      try {
        const snap = await getDoc(doc(db, "config", "site"));
        if (snap.exists()) {
          const data = snap.data() as any;
          setSiteConfig({ logoImageUrl: data.logoImageUrl || "" });
        }
      } catch (err) {
        console.error("load config/site in HomeHi error", err);
      }
    }
    loadConfig();
  }, []);

  useEffect(() => {
    async function loadHomeGallery() {
      try {
        const q = query(collection(db, "jyc_gallery"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);

        const all: HomeGalleryItem[] = snap.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            title: data.title || "",
            titleEn: data.titleEn || "",
            titleHi: data.titleHi || "",
            imageUrl: data.imageUrl || "",
            showOnHome: !!data.showOnHome,
            createdAt: data.createdAt || "",
          };
        });

        const filtered = all.filter((item) => item.imageUrl && item.showOnHome);
        setHomeItems(filtered);
        setCurrentSlide(0);
      } catch (err) {
        console.error("load home gallery items from Firestore error (hi)", err);
      }
    }
    loadHomeGallery();
  }, []);

  useEffect(() => {
    async function loadProducts() {
      try {
        const q = query(collection(db, "jyc_products"), orderBy("name", "asc"));
        const snap = await getDocs(q);

        const raw: HomeProduct[] = snap.docs
          .map((d) => {
            const data = d.data() as any;
            const homeOrderRaw = data.homeOrder;
            const homeOrder = typeof homeOrderRaw === "number" ? homeOrderRaw : Number.MAX_SAFE_INTEGER;

            return {
              id: d.id,
              category: data.category || "",
              categoryEn: data.categoryEn || "",
              categoryHi: data.categoryHi || "",
              name: data.name || "",
              nameEn: data.nameEn || "",
              nameHi: data.nameHi || "",
              brief: data.brief || "",
              briefEn: data.briefEn || "",
              briefHi: data.briefHi || "",
              enabled: data.enabled ?? true,
              imageUrl: data.imageUrl || "",
              homeOrder,
            };
          })
          .filter((p) => p.enabled);

        raw.sort((a, b) => {
          const ao = typeof a.homeOrder === "number" ? a.homeOrder : Number.MAX_SAFE_INTEGER;
          const bo = typeof b.homeOrder === "number" ? b.homeOrder : Number.MAX_SAFE_INTEGER;
          if (ao !== bo) return ao - bo;

          const aName = pickTextHi(a.nameHi, a.nameEn, a.name);
          const bName = pickTextHi(b.nameHi, b.nameEn, b.name);
          return aName.localeCompare(bName);
        });

        setProducts(raw);
      } catch (err) {
        console.error("load home products from Firestore error (hi)", err);
      }
    }
    loadProducts();
  }, []);

  useEffect(() => {
    if (homeItems.length <= 1) return;
    const timer = setInterval(() => setCurrentSlide((prev) => (prev + 1) % homeItems.length), 5000);
    return () => clearInterval(timer);
  }, [homeItems.length]);

  const currentItem = homeItems[currentSlide];
  const productThumbs = homeItems.slice(0, products.length || 3);
  const galleryItems = homeItems.slice(0, 12);

  const scrollProducts = (direction: "left" | "right") => {
    const container = productsRowRef.current;
    if (!container) return;

    const firstCard = container.querySelector<HTMLElement>(".jyc-card") || null;
    const step = (firstCard?.offsetWidth || container.clientWidth * 0.8) + 24;
    const delta = direction === "left" ? -step : step;

    container.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <main className="jyc-page">
      <Header />

      {/* Hero - HI */}
      <section className="jyc-hero jyc-hero-en">
        <div className="jyc-hero-inner">
          <div className="jyc-hero-text">
            <h1>Seamless Pipe Mills और Rolling Equipment के लिए Turn-key Solutions</h1>
            <p>
              1993 में स्थापित, Taiyuan Jingyecheng Steel Equip Ltd. hot-rolled
              seamless steel pipe production के उपकरणों में विशेषज्ञ है—जैसे
              piercing mills, pipe rolling mills, sizing / reducing mills,
              straightening machines, cooling beds, hot centering machines और
              cold drawing machines। हम professional design, manufacturing और
              service capabilities के साथ विश्वसनीय production lines और तकनीकी
              समर्थन प्रदान करते हैं।
            </p>

            <div className="jyc-hero-actions">
              <a href="#contact" className="jyc-btn-primary">
                संपर्क करें
              </a>
              <a href="/hi/products" className="jyc-btn-secondary">
                उत्पाद देखें
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="jyc-section">
        <h2>मुख्य उत्पाद</h2>

        <p className="jyc-section-intro">
          {products.length === 0
            ? 'अभी admin के "Product Management" पेज में कोई उत्पाद कॉन्फ़िगर नहीं है। जैसे ही आप उत्पाद जोड़कर "Show on website" सक्षम करेंगे, वे यहाँ दिखेंगे।'
            : "नीचे मुख्य उत्पाद श्रेणियाँ दी गई हैं। विस्तृत line configurations और technical specifications Products पेज पर उपलब्ध हैं।"}
        </p>

        {products.length > 0 && (
          <div style={{ position: "relative" }}>
            <button
              type="button"
              aria-label="बाएँ स्क्रॉल करें"
              onClick={() => scrollProducts("left")}
              style={{
                position: "absolute",
                left: 0,
                top: "50%",
                transform: "translateY(-50%)",
                border: "none",
                background: "rgba(255,255,255,0.9)",
                boxShadow: "0 0 6px rgba(0, 0, 0, 0.15)",
                borderRadius: "50%",
                width: 32,
                height: 32,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 5,
              }}
            >
              ‹
            </button>

            <div className="jyc-home-products-row" ref={productsRowRef} aria-label="Main products horizontal list">
              {products.map((p, index) => {
                const thumb = productThumbs[index];
                const bgUrl = p.imageUrl || thumb?.imageUrl || "";

                const displayName = pickTextHi(p.nameHi, p.nameEn, p.name);
                const displayBrief = pickTextHi(p.briefHi, p.briefEn, p.brief);

                return (
                  <article key={p.id} className="jyc-card">
                    <div className="jyc-card-image" style={bgUrl ? { backgroundImage: `url(${bgUrl})` } : undefined} />
                    <h3>{displayName}</h3>
                    <p>{displayBrief}</p>
                    <button
                      type="button"
                      className="jyc-card-btn"
                      onClick={() => {
                        if (typeof window === "undefined") return;

                        const msg =
                          `मैं “${displayName}” उपकरण के बारे में अधिक जानना चाहता/चाहती हूँ—` +
                          `जिसमें विस्तृत तकनीकी पैरामीटर और कॉन्फ़िगरेशन सुझाव शामिल हों।`;

                        window.dispatchEvent(
                          new CustomEvent("jyc-open-chat", {
                            detail: { message: msg },
                          }) as any
                        );
                      }}
                    >
                      और जानें
                    </button>
                  </article>
                );
              })}
            </div>

            <button
              type="button"
              aria-label="दाएँ स्क्रॉल करें"
              onClick={() => scrollProducts("right")}
              style={{
                position: "absolute",
                right: 0,
                top: "50%",
                transform: "translateY(-50%)",
                border: "none",
                background: "rgba(255,255,255,0.9)",
                boxShadow: "0 0 6px rgba(0, 0, 0, 0.15)",
                borderRadius: "50%",
                width: 32,
                height: 32,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 5,
              }}
            >
              ›
            </button>
          </div>
        )}
      </section>

      {/* About */}
      <section id="about" className="jyc-section jyc-section-alt">
        <div className="jyc-about-header">
          {siteConfig.logoImageUrl && (
            <div className="jyc-about-logo-wrap">
              <img src={siteConfig.logoImageUrl} alt="Company logo" className="jyc-about-logo" />
            </div>
          )}
          <h2>हमारे बारे में</h2>
        </div>
        <p>
          Taiyuan Jingyecheng Heavy Equipment Ltd. ताइयुआन, शानक्सी प्रांत में स्थित है,
          जिसका साइट क्षेत्र लगभग 70,000 m² है। कंपनी seamless steel pipes के लिए
          rolling equipment में विशेषज्ञ है—piercing mills, pipe rolling mills, sizing / reducing mills,
          straightening machines, cooling beds, hot centering machines और cold drawing machines सहित।
          हम design, manufacturing और sales को एकीकृत करते हैं, और line planning से लेकर installation,
          commissioning और after-sales support तक पूर्ण सेवाएँ प्रदान करते हैं।
        </p>
      </section>

      {/* Gallery */}
      <section id="gallery" className="jyc-section">
        <h2>गैलरी</h2>
        <p className="jyc-section-intro">
          प्रमुख उपकरणों और प्रोडक्शन लाइनों की तस्वीरें—जैसे piercing mills, pipe rolling mills,
          sizing / reducing mills, straightening machines, cooling beds, hot centering machines और
          cold drawing machines—साथ ही typical project references।
        </p>

        {homeItems.length > 0 && (
          <div className="jyc-home-slideshow">
            <div className="jyc-home-slideshow-main">
              <div
                className="jyc-home-slideshow-main-inner"
                style={currentItem?.imageUrl ? { backgroundImage: `url(${currentItem.imageUrl})` } : undefined}
              />
            </div>
            <div className="jyc-home-slideshow-caption">
              {pickTextHi(currentItem?.titleHi, currentItem?.titleEn, currentItem?.title)}
            </div>
            <div className="jyc-home-slideshow-dots">
              {homeItems.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={"jyc-home-slideshow-dot" + (idx === currentSlide ? " jyc-home-slideshow-dot-active" : "")}
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        )}

        <div className="jyc-gallery-grid">
          {galleryItems.length === 0
            ? [1,2,3,4,5,6,7,8,9,10,11,12].map((i) => <div key={i} className="jyc-gallery-thumb" />)
            : galleryItems.map((item) => (
                <div
                  key={item.id}
                  className="jyc-gallery-thumb"
                  style={item.imageUrl ? { backgroundImage: `url(${item.imageUrl})` } : undefined}
                  title={pickTextHi(item.titleHi, item.titleEn, item.title)}
                />
              ))}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="jyc-section jyc-section-alt">
        <h2>संपर्क करें</h2>
        <p className="jyc-section-intro">
          कृपया अपनी संपर्क जानकारी और परियोजना आवश्यकताएँ छोड़ें। हमारी sales टीम जल्द से जल्द आपसे संपर्क करेगी।
          आप हमें सीधे कॉल या ईमेल भी कर सकते हैं।
        </p>

        <ContactFormHi />
      </section>

      <Footer />
      <ChatBubble />
    </main>
  );
}
