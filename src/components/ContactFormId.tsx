"use client";

import React from "react";

export function ContactFormId() {
  return (
    <form className="jyc-contact-form">
      <div className="jyc-form-row">
        <input type="text" placeholder="Nama" />
        <input type="text" placeholder="Perusahaan / Organisasi" />
      </div>
      <div className="jyc-form-row">
        <input type="email" placeholder="Email" />
        <input type="tel" placeholder="Telepon" />
      </div>
      <textarea
        rows={4}
        placeholder="Jelaskan lini produksi Anda saat ini, kapasitas yang direncanakan, atau kebutuhan peralatan..."
      />
      <button type="submit" className="jyc-btn-primary jyc-contact-submit">
        Kirim
      </button>
    </form>
  );
}
