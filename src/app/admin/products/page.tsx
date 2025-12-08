// src/app/admin/products/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

type AdminProduct = {
  id: number;
  category: string;
  name: string;
  brief: string;
  enabled: boolean;
};

const INITIAL_PRODUCTS: AdminProduct[] = [
  {
    id: 1,
    category: "无缝钢管生产线",
    name: "热轧无缝钢管生产机组",
    brief:
      "覆盖加热、穿孔、轧管、定径 / 减径、冷床、矫直、锯切等工序的整线机组，用于生产 φ50–φ325 mm 范围内的热轧无缝钢管，结构扎实、运行稳定。",
    enabled: true,
  },
  {
    id: 2,
    category: "穿孔与轧管机组",
    name: "穿孔机与轧管机组设备",
    brief:
      "包括曼内斯曼穿孔机、卧式锥形辊穿孔机、自动 / Accu-Roll 轧管机以及自研导板式二辊限动芯棒轧管机，适用于生产高尺寸精度、大延伸系数、壁厚均匀的空心坯与钢管。",
    enabled: true,
  },
  {
    id: 3,
    category: "精整与辅助设备",
    name: "定径减径机、矫直机及冷床等精整设备",
    brief:
      "提供二辊 / 三辊定径减径机、六辊 / 七辊矫直机、链步梁式冷床、热定心机、冷拔机及相关输送辅助设备，用于 φ10–φ325 mm 钢管的定径、矫直、冷却与后续精整，提高成品直线度与表面质量。",
    enabled: true,
  },
];

const STORAGE_KEY = "jyc_admin_products";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  // 表單欄位
  const [formCategory, setFormCategory] = useState("");
  const [formName, setFormName] = useState("");
  const [formBrief, setFormBrief] = useState("");
  const [formEnabled, setFormEnabled] = useState(true);

  // 初始化：從 localStorage 讀取，沒有的話就用預設三筆
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setProducts(INITIAL_PRODUCTS);
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(INITIAL_PRODUCTS)
        );
        return;
      }
      const list: AdminProduct[] = JSON.parse(raw);
      setProducts(list);
    } catch (e) {
      console.error("load products error", e);
      setProducts(INITIAL_PRODUCTS);
    }
  }, []);

  const saveProducts = (next: AdminProduct[]) => {
    setProducts(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  };

  // 讓「新增」與「編輯」共用同一組表單
  const resetForm = () => {
    setEditingId(null);
    setFormCategory("");
    setFormName("");
    setFormBrief("");
    setFormEnabled(true);
  };

  const handleEditClick = (p: AdminProduct) => {
    setEditingId(p.id);
    setFormCategory(p.category);
    setFormName(p.name);
    setFormBrief(p.brief);
    setFormEnabled(p.enabled);

    // 滾回表單區（可選）
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleDeleteClick = (id: number) => {
    if (typeof window !== "undefined") {
      if (!window.confirm("确定要删除这条产品资讯吗？")) return;
    }
    const next = products.filter((p) => p.id !== id);
    saveProducts(next);

    if (editingId === id) {
      resetForm();
    }
  };

  const handleSaveClick = () => {
    if (!formCategory.trim() || !formName.trim() || !formBrief.trim()) {
      alert("请填写产品分类、名称与简介。");
      return;
    }

    if (editingId == null) {
      // 新增
      const newItem: AdminProduct = {
        id: Date.now(),
        category: formCategory.trim(),
        name: formName.trim(),
        brief: formBrief.trim(),
        enabled: formEnabled,
      };
      const next = [newItem, ...products];
      saveProducts(next);
    } else {
      // 更新
      const next = products.map((p) =>
        p.id === editingId
          ? {
              ...p,
              category: formCategory.trim(),
              name: formName.trim(),
              brief: formBrief.trim(),
              enabled: formEnabled,
            }
          : p
      );
      saveProducts(next);
    }

    resetForm();
  };

  return (
    <main className="jyc-page">
      <Header />

      <section className="jyc-section jyc-section-alt">
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <h1 style={{ fontSize: "24px", marginBottom: "8px" }}>
            产品资讯管理
          </h1>
          <p className="jyc-section-intro">
            用于维护网站上显示的产品类别与说明文字，例如热轧无缝钢管生产线、穿孔与轧管机组、
            精整与辅助设备等。可作为公司内部的产品目录，方便与首页及中英文产品页面保持一致。
            之后若接上数据库，只需在此维护一次即可同步到前台。
          </p>

          {/* 新增 / 编辑表单 */}
          <div
            style={{
              marginTop: 16,
              marginBottom: 24,
              padding: 16,
              borderRadius: 8,
              border: "1px solid #e5e5e5",
              background: "#fff",
            }}
          >
            <h2 style={{ fontSize: 16, marginBottom: 8 }}>
              {editingId ? "编辑产品" : "新增产品"}
            </h2>
            <p
              style={{
                fontSize: 12,
                color: "#777",
                marginBottom: 12,
              }}
            >
              在此填写产品资讯并保存。资料目前暂存于浏览器 localStorage，正式上线时可以改为
              Firestore 或其他后台系统。
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveClick();
              }}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                maxWidth: 640,
              }}
            >
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <input
                  type="text"
                  placeholder="产品分类（例如：无缝钢管生产线 / 穿孔与轧管机组）"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  style={{
                    flex: 1,
                    minWidth: 200,
                    padding: "8px 10px",
                    borderRadius: 4,
                    border: "1px solid #ccc",
                    fontSize: 13,
                  }}
                />
                <input
                  type="text"
                  placeholder="产品名称（例如：热轧无缝钢管生产机组）"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  style={{
                    flex: 1,
                    minWidth: 200,
                    padding: "8px 10px",
                    borderRadius: 4,
                    border: "1px solid #ccc",
                    fontSize: 13,
                  }}
                />
              </div>

              <textarea
                placeholder="产品简介（前台页面将显示在产品卡片中，可简要说明适用规格、工艺范围与设备特点）"
                rows={3}
                value={formBrief}
                onChange={(e) => setFormBrief(e.target.value)}
                style={{
                  padding: "8px 10px",
                  borderRadius: 4,
                  border: "1px solid #ccc",
                  fontSize: 13,
                  resize: "vertical",
                }}
              />

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginTop: 4,
                  fontSize: 12,
                  color: "#555",
                  flexWrap: "wrap",
                }}
              >
                <label
                  style={{ display: "flex", alignItems: "center", gap: 4 }}
                >
                  <input
                    type="checkbox"
                    checked={formEnabled}
                    onChange={(e) => setFormEnabled(e.target.checked)}
                  />
                  <span>在前台显示此产品</span>
                </label>

                <button
                  type="submit"
                  className="jyc-btn-primary"
                  style={{ fontSize: 13, padding: "8px 16px" }}
                >
                  {editingId ? "保存修改" : "新增产品"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="jyc-btn-secondary"
                    style={{ fontSize: 13, padding: "8px 16px" }}
                  >
                    取消编辑
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* 产品列表 */}
          <div>
            <h2 style={{ fontSize: 16, marginBottom: 8 }}>现有产品列表</h2>
            <p
              style={{
                fontSize: 12,
                color: "#777",
                marginBottom: 12,
              }}
            >
              目前列出的为公司现阶段重点产品。后续若有新增机组或规格调整，可同步更新此处内容，
              以便与首页和产品一览页面保持一致。
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {products.map((p) => (
                <article
                  key={p.id}
                  style={{
                    borderRadius: 8,
                    border: "1px solid #e5e5e5",
                    padding: 12,
                    background: "#fff",
                    fontSize: 13,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 6,
                    }}
                  >
                    <div>
                      <strong>{p.name}</strong>
                      <span style={{ marginLeft: 8, color: "#777" }}>
                        （{p.category}）
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        color: p.enabled ? "#0a7d32" : "#999",
                      }}
                    >
                      {p.enabled ? "前台显示中" : "已隐藏"}
                    </span>
                  </div>

                  <p
                    style={{
                      margin: 0,
                      fontSize: 13,
                      color: "#555",
                      lineHeight: 1.6,
                    }}
                  >
                    {p.brief}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      marginTop: 10,
                      fontSize: 12,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => handleEditClick(p)}
                      style={{
                        padding: "4px 10px",
                        borderRadius: 4,
                        border: "1px solid #333",
                        background: "#fff",
                        cursor: "pointer",
                      }}
                    >
                      编辑
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(p.id)}
                      style={{
                        padding: "4px 10px",
                        borderRadius: 4,
                        border: "1px solid #c33",
                        background: "#fff",
                        color: "#c33",
                        cursor: "pointer",
                      }}
                    >
                      删除
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
