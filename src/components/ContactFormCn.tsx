// src/components/ContactFormCn.tsx
"use client";

import React, { useState } from "react";

export function ContactFormCn() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get("name") as string,
      company: formData.get("company") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      content: formData.get("content") as string,
      source: "contact-form" as const,
    };

    try {
      const res = await fetch("/api/jyc/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("failed");

      // update //
      setDone(true);
      e.currentTarget.reset();
    } catch (err) {
      console.error(err);
      setError("送出失败，请稍后再试。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="jyc-contact-form" onSubmit={handleSubmit}>
      <div className="jyc-form-row">
        <input name="name" type="text" placeholder="姓名" required />
        <input name="company" type="text" placeholder="公司 / 单位" />
      </div>
      <div className="jyc-form-row">
        <input name="email" type="email" placeholder="Email" />
        <input name="phone" type="tel" placeholder="电话 / 手机" />
      </div>
      <textarea
        name="content"
        rows={4}
        placeholder="请输入您的需求或问题…"
        required
      />
      <button
        type="submit"
        className="jyc-btn-primary jyc-contact-submit"
        disabled={loading}
      >
        {loading ? "送出中…" : "送出咨询"}
      </button>

      {done && (
        <p style={{ fontSize: 12, color: "#0a7d32", marginTop: 6 }}>
          已成功送出，我们会尽快与您联系。
        </p>
      )}
      {error && (
        <p style={{ fontSize: 12, color: "#c33", marginTop: 6 }}>{error}</p>
      )}
    </form>
  );
}
