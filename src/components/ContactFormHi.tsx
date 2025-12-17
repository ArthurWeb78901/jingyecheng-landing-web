"use client";

import React from "react";

export function ContactFormHi() {
  return (
    <form className="jyc-contact-form">
      <div className="jyc-form-row">
        <input type="text" placeholder="नाम" />
        <input type="text" placeholder="कंपनी / संगठन" />
      </div>
      <div className="jyc-form-row">
        <input type="email" placeholder="ईमेल" />
        <input type="tel" placeholder="फ़ोन" />
      </div>
      <textarea
        rows={4}
        placeholder="कृपया अपनी वर्तमान प्रोडक्शन लाइन, नियोजित क्षमता या उपकरण आवश्यकताओं का वर्णन करें…"
      />
      <button type="submit" className="jyc-btn-primary jyc-contact-submit">
        भेजें
      </button>
    </form>
  );
}
