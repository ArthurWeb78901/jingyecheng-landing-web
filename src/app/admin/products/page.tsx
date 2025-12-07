// src/app/admin/products/page.tsx
import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

type AdminProduct = {
  id: number;
  category: string;
  name: string;
  brief: string;
  enabled: boolean;
};

const mockAdminProducts: AdminProduct[] = [
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

export default function AdminProductsPage() {
  return (
    <main className="jyc-page">
      <Header />

      <section className="jyc-section jyc-section-alt">
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <h1 style={{ fontSize: "24px", marginBottom: "8px" }}>
            产品资讯管理（内部）
          </h1>
          <p className="jyc-section-intro">
            此页面用于维护网站上显示的产品类别与说明文字，例如热轧无缝钢管生产线、穿孔与轧管机组、
            精整与辅助设备等。 目前为示意画面，正式上线时可串接数据库，并提供新增、编辑与删除功能。
          </p>

          {/* 新增 / 编辑表单（UI 示意） */}
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
              新增 / 编辑产品（示意）
            </h2>
            <p
              style={{
                fontSize: 12,
                color: "#777",
                marginBottom: 12,
              }}
            >
              正式上线时，可在此输入产品名称、分类与简介，并储存到后台系统（数据库 /
              后台管理）。 当前仅为版面示意，按钮不会真正写入资料。
            </p>

            <form
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
                }}
              >
                <label
                  style={{ display: "flex", alignItems: "center", gap: 4 }}
                >
                  <input type="checkbox" defaultChecked />
                  <span>在前台显示此产品</span>
                </label>

                <button
                  type="button"
                  className="jyc-btn-primary"
                  style={{ fontSize: 13, padding: "8px 16px" }}
                >
                  保存（示意）
                </button>
              </div>
            </form>
          </div>

          {/* 产品列表（目前是样板数据） */}
          <div>
            <h2 style={{ fontSize: 16, marginBottom: 8 }}>
              现有产品列表（示意）
            </h2>
            <p
              style={{
                fontSize: 12,
                color: "#777",
                marginBottom: 12,
              }}
            >
              下方为样板数据，正式上线时可从数据库读取，并提供排序、启用 / 停用与编辑功能，
              以便与首页和产品一览页面的中英文内容保持一致。
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {mockAdminProducts.map((p) => (
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
                      style={{
                        padding: "4px 10px",
                        borderRadius: 4,
                        border: "1px solid #333",
                        background: "#fff",
                        cursor: "default",
                      }}
                    >
                      编辑（示意）
                    </button>
                    <button
                      type="button"
                      style={{
                        padding: "4px 10px",
                        borderRadius: 4,
                        border: "1px solid #c33",
                        background: "#fff",
                        color: "#c33",
                        cursor: "default",
                      }}
                    >
                      删除（示意）
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
