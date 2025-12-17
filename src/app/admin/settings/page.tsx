// src/app/admin/settings/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { db, storage } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

type SiteSettings = {
  // Header Logo
  logoMark: string;
  logoTextZh: string; // 保留舊資料相容（不在 UI 編輯）
  logoTextEn: string;
  logoTextHi?: string;
  logoTextId?: string;
  logoImageUrl: string;

  // Company info（保留 zh 相容，但不在 UI 編輯）
  companyNameZh: string;
  companyNameEn: string;
  companyNameHi?: string;
  companyNameId?: string;

  addressZh: string;
  addressEn: string;
  addressHi?: string;
  addressId?: string;

  phone: string;
  email: string;
  icp: string;

  footerZh: string;
  footerEn: string;
  footerHi?: string;
  footerId?: string;
};

const DEFAULT_SETTINGS: SiteSettings = {
  logoMark: "JYC",
  logoTextZh: "太原精业城重工设备有限公司",
  logoTextEn: "JYC Steel Equip",
  logoTextHi: "JYC स्टील उपकरण",
  logoTextId: "Peralatan Baja JYC",
  logoImageUrl: "",

  companyNameZh: "山西太矿钢管设备有限公司",
  companyNameEn: "Shanxi Taikuang Steel Pipe Equipment Co., Ltd.",
  companyNameHi: "",
  companyNameId: "",

  addressZh: "山西省太原市百花谷",
  addressEn: "Baihuagu, Taiyuan, Shanxi Province, China",
  addressHi: "",
  addressId: "",

  phone: "0351-2028121",
  email: "sxtkgg@aliyun.com",
  icp: "晋ICP备07000249号-1",

  footerZh: "版权所有：山西太矿钢管设备有限公司　晋ICP备07000249号-1",
  footerEn:
    "All rights reserved: Shanxi Taikuang Steel Pipe Equipment Co., Ltd. ICP No. 晋ICP备07000249号-1",
  footerHi: "",
  footerId: "",
};

const CONFIG_DOC = doc(db, "config", "site");

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(CONFIG_DOC);
        if (snap.exists()) {
          const data = snap.data() as Partial<SiteSettings>;
          setSettings({ ...DEFAULT_SETTINGS, ...data });
        } else {
          setSettings(DEFAULT_SETTINGS);
        }
      } catch (err) {
        console.error("load site config error", err);
        setSettings(DEFAULT_SETTINGS);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const updateField =
    <K extends keyof SiteSettings>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      setSettings((prev) => ({ ...prev, [key]: value }));
    };

  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingLogo(true);

      const ext = file.name.includes(".")
        ? file.name.substring(file.name.lastIndexOf("."))
        : "";
      const storageRef = ref(storage, `config/logo${ext}`);

      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      setSettings((prev) => ({ ...prev, logoImageUrl: url }));
      alert('Logo uploaded. Please click "Save settings" to apply on frontend.');
    } catch (err) {
      console.error("upload logo error", err);
      alert("Failed to upload logo. Please try again.");
    } finally {
      setUploadingLogo(false);
      e.target.value = "";
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // ✅ merge=true：不会覆盖未包含字段；且我们 state 里保留了旧 zh 字段，不会丢
      await setDoc(CONFIG_DOC, settings, { merge: true });
      alert("Settings saved.");
    } catch (err: any) {
      console.error("save site config error", err);
      alert("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="jyc-page">
      <Header />

      <section className="jyc-section jyc-section-alt">
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <h1 style={{ fontSize: "24px", marginBottom: "8px" }}>
            Site Settings (Admin)
          </h1>
          <p className="jyc-section-intro">
            Manage site-wide texts for English / Hindi / Indonesian. (Chinese fields are kept for backward compatibility but are not editable here.)
          </p>

          {loading ? (
            <div style={{ marginTop: 16, fontSize: 13, color: "#666" }}>
              Loading…
            </div>
          ) : (
            <form
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
                marginTop: 16,
                background: "#fff",
                borderRadius: 8,
                border: "1px solid #e5e5e5",
                padding: 16,
              }}
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
            >
              {/* Header Logo */}
              <div style={{ paddingBottom: 10, borderBottom: "1px dashed #eee" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#333" }}>
                  Header Logo
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
                  <div style={{ flex: "0 0 120px" }}>
                    <label style={{ fontSize: 12, color: "#555" }}>Logo Mark</label>
                    <input
                      type="text"
                      maxLength={12}
                      value={settings.logoMark}
                      onChange={updateField("logoMark")}
                      style={{
                        width: "100%",
                        padding: "6px 8px",
                        borderRadius: 4,
                        border: "1px solid #ccc",
                        fontSize: 12,
                      }}
                    />
                  </div>

                  <div style={{ flex: 1, minWidth: 220 }}>
                    <label style={{ fontSize: 12, color: "#555" }}>Logo Text (English)</label>
                    <input
                      type="text"
                      value={settings.logoTextEn}
                      onChange={updateField("logoTextEn")}
                      style={{
                        width: "100%",
                        padding: "6px 8px",
                        borderRadius: 4,
                        border: "1px solid #ccc",
                        fontSize: 12,
                      }}
                    />
                  </div>

                  <div style={{ flex: 1, minWidth: 220 }}>
                    <label style={{ fontSize: 12, color: "#555" }}>Logo Text (Hindi)</label>
                    <input
                      type="text"
                      value={settings.logoTextHi || ""}
                      onChange={updateField("logoTextHi")}
                      style={{
                        width: "100%",
                        padding: "6px 8px",
                        borderRadius: 4,
                        border: "1px solid #ccc",
                        fontSize: 12,
                      }}
                    />
                  </div>

                  <div style={{ flex: 1, minWidth: 220 }}>
                    <label style={{ fontSize: 12, color: "#555" }}>Logo Text (Indonesian)</label>
                    <input
                      type="text"
                      value={settings.logoTextId || ""}
                      onChange={updateField("logoTextId")}
                      style={{
                        width: "100%",
                        padding: "6px 8px",
                        borderRadius: 4,
                        border: "1px solid #ccc",
                        fontSize: 12,
                      }}
                    />
                  </div>
                </div>

                {/* Logo image upload */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginTop: 12,
                    flexWrap: "wrap",
                  }}
                >
                  {settings.logoImageUrl && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <span style={{ fontSize: 12, color: "#555" }}>Current Logo Preview</span>
                      <img
                        src={settings.logoImageUrl}
                        alt="Site logo"
                        style={{
                          height: 40,
                          objectFit: "contain",
                          borderRadius: 4,
                          border: "1px solid #eee",
                          background: "#fafafa",
                          padding: 4,
                        }}
                      />
                    </div>
                  )}

                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <label style={{ fontSize: 12, color: "#555" }}>Upload Logo</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoFileChange}
                      disabled={uploadingLogo}
                      style={{ fontSize: 12 }}
                    />
                    <span style={{ fontSize: 11, color: "#888" }}>
                      PNG with transparent background recommended.
                    </span>
                  </div>
                </div>
              </div>

              {/* Company Name */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, color: "#444" }}>Company Name (English)</label>
                <input
                  type="text"
                  value={settings.companyNameEn}
                  onChange={updateField("companyNameEn")}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 4,
                    border: "1px solid #ccc",
                    fontSize: 13,
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, color: "#444" }}>Company Name (Hindi)</label>
                <input
                  type="text"
                  value={settings.companyNameHi || ""}
                  onChange={updateField("companyNameHi")}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 4,
                    border: "1px solid #ccc",
                    fontSize: 13,
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, color: "#444" }}>Company Name (Indonesian)</label>
                <input
                  type="text"
                  value={settings.companyNameId || ""}
                  onChange={updateField("companyNameId")}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 4,
                    border: "1px solid #ccc",
                    fontSize: 13,
                  }}
                />
              </div>

              {/* Address */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, color: "#444" }}>Address (English)</label>
                <input
                  type="text"
                  value={settings.addressEn}
                  onChange={updateField("addressEn")}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 4,
                    border: "1px solid #ccc",
                    fontSize: 13,
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, color: "#444" }}>Address (Hindi)</label>
                <input
                  type="text"
                  value={settings.addressHi || ""}
                  onChange={updateField("addressHi")}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 4,
                    border: "1px solid #ccc",
                    fontSize: 13,
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, color: "#444" }}>Address (Indonesian)</label>
                <input
                  type="text"
                  value={settings.addressId || ""}
                  onChange={updateField("addressId")}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 4,
                    border: "1px solid #ccc",
                    fontSize: 13,
                  }}
                />
              </div>

              {/* Phone & Email */}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <label style={{ fontSize: 13, color: "#444" }}>Phone</label>
                  <input
                    type="text"
                    value={settings.phone}
                    onChange={updateField("phone")}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: 4,
                      border: "1px solid #ccc",
                      fontSize: 13,
                    }}
                  />
                </div>

                <div style={{ flex: 1, minWidth: 200 }}>
                  <label style={{ fontSize: 13, color: "#444" }}>Email</label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={updateField("email")}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: 4,
                      border: "1px solid #ccc",
                      fontSize: 13,
                    }}
                  />
                </div>
              </div>

              {/* ICP */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, color: "#444" }}>ICP</label>
                <input
                  type="text"
                  value={settings.icp}
                  onChange={updateField("icp")}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 4,
                    border: "1px solid #ccc",
                    fontSize: 13,
                  }}
                />
              </div>

              {/* Footer */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, color: "#444" }}>Footer (English)</label>
                <textarea
                  rows={2}
                  value={settings.footerEn}
                  onChange={updateField("footerEn")}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 4,
                    border: "1px solid #ccc",
                    fontSize: 13,
                    resize: "vertical",
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, color: "#444" }}>Footer (Hindi)</label>
                <textarea
                  rows={2}
                  value={settings.footerHi || ""}
                  onChange={updateField("footerHi")}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 4,
                    border: "1px solid #ccc",
                    fontSize: 13,
                    resize: "vertical",
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, color: "#444" }}>Footer (Indonesian)</label>
                <textarea
                  rows={2}
                  value={settings.footerId || ""}
                  onChange={updateField("footerId")}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 4,
                    border: "1px solid #ccc",
                    fontSize: 13,
                    resize: "vertical",
                  }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
                <button
                  type="submit"
                  className="jyc-btn-primary"
                  style={{ fontSize: 13, padding: "8px 18px" }}
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Save settings"}
                </button>
                <span style={{ fontSize: 12, color: "#888" }}>
                  Data is saved to <code>config/site</code>.
                </span>
              </div>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
