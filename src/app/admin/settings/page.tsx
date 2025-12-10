// src/app/admin/settings/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { db, storage } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

type SiteSettings = {
  // Header Logo 設定
  logoMark: string;      // 左边徽章（如：JYC）
  logoTextZh: string;    // 中文 logo 文字
  logoTextEn: string;    // 英文 logo 文字
  logoImageUrl: string;  // Logo 圖片網址

  companyNameZh: string;
  companyNameEn: string;
  addressZh: string;
  addressEn: string;
  phone: string;
  email: string;
  icp: string;
  footerZh: string;
  footerEn: string;
};

const DEFAULT_SETTINGS: SiteSettings = {
  // Logo 預設
  logoMark: "JYC",
  logoTextZh: "太原精业城重工设备有限公司",
  logoTextEn: "JYC Steel Equip",
  logoImageUrl: "",

  // 其它預設
  companyNameZh: "山西太矿钢管设备有限公司",
  companyNameEn: "Shanxi Taikuang Steel Pipe Equipment Co., Ltd.",
  addressZh: "山西省太原市百花谷",
  addressEn: "Baihuagu, Taiyuan, Shanxi Province, China",
  phone: "0351-2028121",
  email: "sxtkgg@aliyun.com",
  icp: "晋ICP备07000249号-1",
  footerZh: "版权所有：山西太矿钢管设备有限公司　晋ICP备07000249号-1",
  footerEn:
    "All rights reserved: Shanxi Taikuang Steel Pipe Equipment Co., Ltd. ICP No. 晋ICP备07000249号-1",
};

const CONFIG_DOC = doc(db, "config", "site");

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // 載入 Firestore 設定
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

  // 處理 Logo 圖片上傳
  const handleLogoFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingLogo(true);

      // 固定存到 config/logo.{ext}
      const ext = file.name.includes(".")
        ? file.name.substring(file.name.lastIndexOf("."))
        : "";
      const storageRef = ref(storage, `config/logo${ext}`);

      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      setSettings((prev) => ({ ...prev, logoImageUrl: url }));
      alert("Logo 图片已上传成功，记得按下「保存设定」让前台生效。");
    } catch (err) {
      console.error("upload logo error", err);
      alert("上传 Logo 图片时发生错误，请稍后再试。");
    } finally {
      setUploadingLogo(false);
      // 讓同一張圖可以重選
      e.target.value = "";
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(CONFIG_DOC, settings, { merge: true });
      alert("网站基本资讯已保存。");
    } catch (err: any) {
      console.error("save site config error", err);
      if (err?.code === "permission-denied") {
        alert("保存失败：目前帐号没有写入 config 的权限（需 admin 角色）。");
      } else {
        alert("保存网站资讯时发生错误，请稍后再试。");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="jyc-page">
      <Header />

      <section className="jyc-section jyc-section-alt">
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <h1 style={{ fontSize: "24px", marginBottom: "8px" }}>
            网站基本资讯（内部管理）
          </h1>
          <p className="jyc-section-intro">
            此页面用于维护网站上显示的公司名称、地址、电话、邮箱与页尾版权说明等资讯，
            支援中英文两种版本。资料会写入 Firestore 的
            <code> config/site </code> 文件，前台的 Header / Footer
            未来可以统一从此处读取。
          </p>

          {loading ? (
            <div
              style={{
                marginTop: 16,
                fontSize: 13,
                color: "#666",
              }}
            >
              载入中…
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
              {/* Logo 文字设定（Header 用） */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  paddingBottom: 10,
                  borderBottom: "1px dashed #eee",
                  marginBottom: 10,
                }}
              >
                <div
                  style={{ fontSize: 13, fontWeight: 600, color: "#333" }}
                >
                  Logo 文字（Header 显示）
                </div>

                <div
                  style={{ display: "flex", gap: 10, flexWrap: "wrap" }}
                >
                  {/* 徽章文字 */}
                  <div
                    style={{
                      flex: "0 0 120px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                    }}
                  >
                    <label
                      style={{ fontSize: 12, color: "#555" }}
                    >
                      徽章文字（Mark）
                    </label>
                    <input
                      type="text"
                      maxLength={8}
                      value={settings.logoMark}
                      onChange={updateField("logoMark")}
                      style={{
                        padding: "6px 8px",
                        borderRadius: 4,
                        border: "1px solid #ccc",
                        fontSize: 12,
                      }}
                    />
                  </div>

                  {/* Logo 中文 */}
                  <div
                    style={{
                      flex: 1,
                      minWidth: 220,
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                    }}
                  >
                    <label
                      style={{ fontSize: 12, color: "#555" }}
                    >
                      Logo 文案（中文）
                    </label>
                    <input
                      type="text"
                      value={settings.logoTextZh}
                      onChange={updateField("logoTextZh")}
                      style={{
                        padding: "6px 8px",
                        borderRadius: 4,
                        border: "1px solid #ccc",
                        fontSize: 12,
                      }}
                    />
                  </div>

                  {/* Logo 英文 */}
                  <div
                    style={{
                      flex: 1,
                      minWidth: 220,
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                    }}
                  >
                    <label
                      style={{ fontSize: 12, color: "#555" }}
                    >
                      Logo Text (English)
                    </label>
                    <input
                      type="text"
                      value={settings.logoTextEn}
                      onChange={updateField("logoTextEn")}
                      style={{
                        padding: "6px 8px",
                        borderRadius: 4,
                        border: "1px solid #ccc",
                        fontSize: 12,
                      }}
                    />
                  </div>
                </div>

                {/* Logo 圖片上傳區 */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginTop: 10,
                    flexWrap: "wrap",
                  }}
                >
                  {settings.logoImageUrl && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                      }}
                    >
                      <span
                        style={{ fontSize: 12, color: "#555" }}
                      >
                        目前 Logo 预览
                      </span>
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

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                    }}
                  >
                    <label
                      style={{ fontSize: 12, color: "#555" }}
                    >
                      上传 Logo 图片
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoFileChange}
                      disabled={uploadingLogo}
                      style={{ fontSize: 12 }}
                    />
                    <span
                      style={{ fontSize: 11, color: "#888" }}
                    >
                      建议使用透明背景 PNG，Logo 高度约 40 像素。上传后记得按下「保存设定」。
                    </span>
                  </div>
                </div>
              </div>

              {/* 公司名稱（中 / EN） */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: 4 }}
              >
                <label style={{ fontSize: 13, color: "#444" }}>
                  公司名称（中文）
                </label>
                <input
                  type="text"
                  value={settings.companyNameZh}
                  onChange={updateField("companyNameZh")}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 4,
                    border: "1px solid #ccc",
                    fontSize: 13,
                  }}
                />
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: 4 }}
              >
                <label style={{ fontSize: 13, color: "#444" }}>
                  Company Name (English)
                </label>
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

              {/* 地址 */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: 4 }}
              >
                <label style={{ fontSize: 13, color: "#444" }}>
                  公司地址（中文）
                </label>
                <input
                  type="text"
                  value={settings.addressZh}
                  onChange={updateField("addressZh")}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 4,
                    border: "1px solid #ccc",
                    fontSize: 13,
                  }}
                />
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: 4 }}
              >
                <label style={{ fontSize: 13, color: "#444" }}>
                  Company Address (English)
                </label>
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

              {/* 电话 & 邮箱 */}
              <div
                style={{ display: "flex", gap: 10, flexWrap: "wrap" }}
              >
                <div
                  style={{
                    flex: 1,
                    minWidth: 200,
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                  }}
                >
                  <label style={{ fontSize: 13, color: "#444" }}>
                    联系电话
                  </label>
                  <input
                    type="text"
                    value={settings.phone}
                    onChange={updateField("phone")}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 4,
                      border: "1px solid #ccc",
                      fontSize: 13,
                    }}
                  />
                </div>

                <div
                  style={{
                    flex: 1,
                    minWidth: 200,
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                  }}
                >
                  <label style={{ fontSize: 13, color: "#444" }}>
                    联系邮箱
                  </label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={updateField("email")}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 4,
                      border: "1px solid #ccc",
                      fontSize: 13,
                    }}
                  />
                </div>
              </div>

              {/* ICP & 版权信息 */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: 4 }}
              >
                <label style={{ fontSize: 13, color: "#444" }}>
                  ICP备案号
                </label>
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

              <div
                style={{ display: "flex", flexDirection: "column", gap: 4 }}
              >
                <label style={{ fontSize: 13, color: "#444" }}>
                  页尾版权说明（中文）
                </label>
                <textarea
                  rows={2}
                  value={settings.footerZh}
                  onChange={updateField("footerZh")}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 4,
                    border: "1px solid #ccc",
                    fontSize: 13,
                    resize: "vertical",
                  }}
                />
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: 4 }}
              >
                <label style={{ fontSize: 13, color: "#444" }}>
                  Footer text (English)
                </label>
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

              {/* 保存按鈕 */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginTop: 8,
                }}
              >
                <button
                  type="submit"
                  className="jyc-btn-primary"
                  style={{ fontSize: 13, padding: "8px 18px" }}
                  disabled={saving}
                >
                  {saving ? "保存中…" : "保存设定"}
                </button>
                <span style={{ fontSize: 12, color: "#888" }}>
                  资料会写入 Firestore 的 <code>config/site</code>。
                  若出现权限错误，请确认当前帐号在 users 表中具备 admin 角色。
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
