// src/app/admin/products/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { db, storage } from "@/lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  query,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Firestore 中實際存的欄位
type FirestoreProduct = {
  category: string;
  name: string;
  brief: string;
  enabled: boolean;
  imageUrl?: string;
};

// 前端用的型別（多一個 id）
type AdminProduct = FirestoreProduct & {
  id: string;
};

const INITIAL_PRODUCTS: FirestoreProduct[] = [
  {
    category: "无缝钢管生产线",
    name: "热轧无缝钢管生产机组",
    brief:
      "覆盖加热、穿孔、轧管、定径 / 减径、冷床、矫直、锯切等工序的整线机组，用于生产 φ50–φ325 mm 范围内的热轧无缝钢管，结构扎实、运行稳定。",
    enabled: true,
  },
  {
    category: "穿孔与轧管机组",
    name: "穿孔机与轧管机组设备",
    brief:
      "包括曼内斯曼穿孔机、卧式锥形辊穿孔机、自动 / Accu-Roll 轧管机以及自研导板式二辊限动芯棒轧管机，适用于生产高尺寸精度、大延伸系数、壁厚均匀的空心坯与钢管。",
    enabled: true,
  },
  {
    category: "精整与辅助设备",
    name: "定径减径机、矫直机及冷床等精整设备",
    brief:
      "提供二辊 / 三辊定径减径机、六辊 / 七辊矫直机、链步梁式冷床、热定心机、冷拔机及相关输送辅助设备，用于 φ10–φ325 mm 钢管的定径、矫直、冷却与后续精整，提高成品直线度与表面质量。",
    enabled: true,
  },
];

const PRODUCTS_COLLECTION = "jyc_products";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // 表单字段
  const [formCategory, setFormCategory] = useState("");
  const [formName, setFormName] = useState("");
  const [formBrief, setFormBrief] = useState("");
  const [formEnabled, setFormEnabled] = useState(true);
  const [formImageUrl, setFormImageUrl] = useState<string | undefined>(
    undefined
  ); // 目前已設定的圖片網址（編輯時保留）

  // 上傳用暫存
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadFileName, setUploadFileName] = useState("");

  // 讀取 Firestore 產品列表；如為空則自動 seed 初始三筆
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const colRef = collection(db, PRODUCTS_COLLECTION);
        const q = query(colRef, orderBy("name", "asc"));
        const snap = await getDocs(q);

        if (snap.empty) {
          // 第一次：寫入預設三筆
          const created: AdminProduct[] = [];
          for (const base of INITIAL_PRODUCTS) {
            const docRef = await addDoc(colRef, base);
            created.push({ id: docRef.id, ...base });
          }
          setProducts(created);
          return;
        }

        const list: AdminProduct[] = snap.docs.map((d) => {
          const data = d.data() as FirestoreProduct;
          return {
            id: d.id,
            ...data,
          };
        });
        setProducts(list);
      } catch (err) {
        console.error("load products error", err);
      }
    };

    fetchProducts();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setFormCategory("");
    setFormName("");
    setFormBrief("");
    setFormEnabled(true);
    setFormImageUrl(undefined);
    setUploadFile(null);
    setUploadFileName("");
  };

  const handleEditClick = (p: AdminProduct) => {
    setEditingId(p.id);
    setFormCategory(p.category);
    setFormName(p.name);
    setFormBrief(p.brief);
    setFormEnabled(p.enabled);
    setFormImageUrl(p.imageUrl);
    setUploadFile(null);
    setUploadFileName("");

    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleDeleteClick = async (id: string) => {
    if (typeof window !== "undefined") {
      if (!window.confirm("确定要删除这条产品资讯吗？")) return;
    }

    try {
      await deleteDoc(doc(db, PRODUCTS_COLLECTION, id));
      setProducts((prev) => prev.filter((p) => p.id !== id));
      if (editingId === id) resetForm();
    } catch (err) {
      console.error("delete product error", err);
      alert("删除产品时发生错误，请稍后再试。");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setUploadFile(file);
    setUploadFileName(file ? file.name : "");
  };

  const handleSave = async () => {
    if (!formCategory.trim() || !formName.trim() || !formBrief.trim()) {
      alert("请填写产品分类、名称与简介。");
      return;
    }

    setIsSaving(true);
    try {
      const colRef = collection(db, PRODUCTS_COLLECTION);

      // 1) 先处理图片上传（若有选档案）
      let finalImageUrl = formImageUrl;
      if (uploadFile) {
        const ext = uploadFile.name.split(".").pop() || "jpg";
        const storagePath = `jyc-products/${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}.${ext}`;
        const storageRef = ref(storage, storagePath);
        const snap = await uploadBytes(storageRef, uploadFile);
        finalImageUrl = await getDownloadURL(snap.ref);
      }

      const payload: FirestoreProduct = {
        category: formCategory.trim(),
        name: formName.trim(),
        brief: formBrief.trim(),
        enabled: formEnabled,
        imageUrl: finalImageUrl,
      };

      if (editingId) {
        // 更新
        const docRef = doc(db, PRODUCTS_COLLECTION, editingId);
        await updateDoc(docRef, payload);
        setProducts((prev) =>
          prev.map((p) => (p.id === editingId ? { id: editingId, ...payload } : p))
        );
      } else {
        // 新增
        const docRef = await addDoc(colRef, payload);
        const created: AdminProduct = { id: docRef.id, ...payload };
        setProducts((prev) => [created, ...prev]);
      }

      resetForm();
    } catch (err) {
      console.error("save product error", err);
      alert("保存产品资讯时发生错误，请稍后再试。");
    } finally {
      setIsSaving(false);
    }
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
            精整与辅助设备等。资料会集中存放在 Firebase Firestore 的
            <code> jyc_products </code>集合中，方便与首页及中英文产品页面保持一致。
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
              在此维护产品资讯与缩略图。保存后会写入 Firestore，并可在首页与产品一览页复用。
              若上传产品图片，将存入 Firebase Storage 的
              <code> jyc-products/</code>资料夹中。
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
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
                placeholder="产品简介（将显示在前台产品卡片中，可说明适用规格、工艺范围与设备特点）"
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

              {/* 图片上传 */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  fontSize: 13,
                  marginTop: 4,
                }}
              >
                <label>
                  产品图片（选填，建议用在首页产品卡片缩略图）：
                </label>
                <input type="file" onChange={handleFileChange} />
                {uploadFileName && (
                  <div style={{ fontSize: 12, color: "#777" }}>
                    已选择档案：{uploadFileName}
                  </div>
                )}
                {formImageUrl && !uploadFile && (
                  <div
                    style={{
                      marginTop: 4,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        width: 80,
                        height: 60,
                        borderRadius: 4,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundImage: `url(${formImageUrl})`,
                        border: "1px solid #ddd",
                      }}
                    />
                    <span style={{ fontSize: 12, color: "#777" }}>
                      当前已设定的图片（如需更换，可重新选择档案上传）
                    </span>
                  </div>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginTop: 8,
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
                  disabled={isSaving}
                >
                  {isSaving
                    ? "保存中…"
                    : editingId
                    ? "保存修改"
                    : "新增产品"}
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
              下方列表直接对应 Firestore 中的产品资料。后续要让首页、产品一览页或英文站共用，
              只要从 <code>jyc_products</code> 集合读取即可。
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
                      gap: 12,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center" }}>
                      {p.imageUrl && (
                        <div
                          style={{
                            width: 72,
                            height: 54,
                            borderRadius: 4,
                            marginRight: 8,
                            backgroundImage: `url(${p.imageUrl})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            border: "1px solid #ddd",
                          }}
                        />
                      )}
                      <div>
                        <strong>{p.name}</strong>
                        <span style={{ marginLeft: 8, color: "#777" }}>
                          （{p.category}）
                        </span>
                      </div>
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
