// src/components/ContactForm.tsx
"use client";

import React, { useState } from "react";

export function ContactFormEn() {
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
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("failed");
      }

      setDone(true);
      e.currentTarget.reset();
    } catch (err) {
      console.error(err);
      setError("Failed to send. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="jyc-contact-form" onSubmit={handleSubmit}>
      <div className="jyc-form-row">
        <input type="text" name="name" placeholder="Name" required />
        <input type="text" name="company" placeholder="Company" />
      </div>
      <div className="jyc-form-row">
        <input type="email" name="email" placeholder="Email" />
        <input type="tel" name="phone" placeholder="Phone" />
      </div>
      <textarea
        rows={4}
        name="content"
        placeholder="Please describe your requirements or questions…"
        required
      />
      <button
        type="submit"
        className="jyc-btn-primary jyc-contact-submit"
        disabled={loading}
      >
        {loading ? "Sending…" : "Send Inquiry"}
      </button>

      {done && (
        <p style={{ fontSize: 12, color: "#0a7d32", marginTop: 6 }}>
          Your inquiry has been sent. We will contact you shortly.
        </p>
      )}
      {error && (
        <p style={{ fontSize: 12, color: "#c33", marginTop: 6 }}>{error}</p>
      )}
    </form>
  );
}
