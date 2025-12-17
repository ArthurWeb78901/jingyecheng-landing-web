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
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// ✅ Firestore 欄位（保留舊欄位相容 + 新增 HI/ID）
type FirestoreProduct = {
  // legacy / compatibility
  category: string;
  name: string;
  brief: string;

  // EN
  categoryEn?: string;
  nameEn?: string;
  briefEn?: string;

  // HI / ID
  categoryHi?: string;
  nameHi?: string;
  briefHi?: string;

  categoryId?: string;
  nameId?: string;
  briefId?: string;

  enabled: boolean;
  imageUrl?: string;
  homeOrder?: number;
};

type AdminProduct = FirestoreProduct & { id: string };

const sortByHomeOrder = (a: AdminProduct, b: AdminProduct) => {
  const ao = a.homeOrder ?? 9999;
  const bo = b.homeOrder ?? 9999;
  if (ao !== bo) return ao - bo;

  const aName = (a.nameEn || a.name || "").toLowerCase();
  const bName = (b.nameEn || b.name || "").toLowerCase();
  return aName.localeCompare(bName);
};

const PRODUCTS_COLLECTION = "jyc_products";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // ✅ 表单：只编辑 EN/HI/ID（中文不在 UI）
  const [formCategoryEn, setFormCategoryEn] = useState("");
  const [formNameEn, setFormNameEn] = useState("");
  const [formBriefEn, setFormBriefEn] = useState("");

  const [formCategoryHi, setFormCategoryHi] = useState("");
  const [formNameHi, setFormNameHi] = useState("");
  const [formBriefHi, setFormBriefHi] = useState("");

  const [formCategoryId, setFormCategoryId] = useState("");
  const [formNameId, setFormNameId] = useState("");
  const [formBriefId, setFormBriefId] = useState("");

  const [formEnabled, setFormEnabled] = useState(true);
  const [formImageUrl, setFormImageUrl] = useState<string | undefined>(undefined);

  // 上传用
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadFileName, setUploadFileName] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const colRef = collection(db, PRODUCTS_COLLECTION);
        const snap = await getDocs(colRef);

        const list: AdminProduct[] = snap.docs.map((d, index) => {
          const data = d.data() as FirestoreProduct;
          const homeOrder =
            typeof data.homeOrder === "number" ? data.homeOrder : index + 1;

          return { id: d.id, ...data, homeOrder };
        });

        setProducts(list.sort(sortByHomeOrder));
      } catch (err) {
        console.error("load products error", err);
      }
    };

    fetchProducts();
  }, []);

  const resetForm = () => {
    setEditingId(null);

    setFormCategoryEn("");
    setFormNameEn("");
    setFormBriefEn("");

    setFormCategoryHi("");
    setFormNameHi("");
    setFormBriefHi("");

    setFormCategoryId("");
    setFormNameId("");
    setFormBriefId("");

    setFormEnabled(true);
    setFormImageUrl(undefined);
    setUploadFile(null);
    setUploadFileName("");
  };

  const handleEditClick = (p: AdminProduct) => {
    setEditingId(p.id);

    // ✅ EN：若旧资料没填 EN，就用 legacy 字段当预填（避免空）
    setFormCategoryEn(p.categoryEn || p.category || "");
    setFormNameEn(p.nameEn || p.name || "");
    setFormBriefEn(p.briefEn || p.brief || "");

    setFormCategoryHi(p.categoryHi || "");
    setFormNameHi(p.nameHi || "");
    setFormBriefHi(p.briefHi || "");

    setFormCategoryId(p.categoryId || "");
    setFormNameId(p.nameId || "");
    setFormBriefId(p.briefId || "");

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
      if (!window.confirm("Delete this product doc? (Firestore only)")) return;
    }

    try {
      await deleteDoc(doc(db, PRODUCTS_COLLECTION, id));
      setProducts((prev) => prev.filter((p) => p.id !== id));
      if (editingId === id) resetForm();
    } catch (err) {
      console.error("delete product error", err);
      alert("Failed to delete. Please try again.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setUploadFile(file);
    setUploadFileName(file ? file.name : "");
  };

  // ✅ 调整首页排序：上移 / 下移
  const handleMove = async (id: string, direction: "up" | "down") => {
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= products.length) return;

    const current = products[index];
    const target = products[targetIndex];

    const currentOrder = current.homeOrder ?? index + 1;
    const targetOrder = target.homeOrder ?? targetIndex + 1;

    try {
      await Promise.all([
        updateDoc(doc(db, PRODUCTS_COLLECTION, current.id), { homeOrder: targetOrder }),
        updateDoc(doc(db, PRODUCTS_COLLECTION, target.id), { homeOrder: currentOrder }),
      ]);

      setProducts((prev) => {
        const updated = prev.map((p) => {
          if (p.id === current.id) return { ...p, homeOrder: targetOrder };
          if (p.id === target.id) return { ...p, homeOrder: currentOrder };
          return p;
        });
        return [...updated].sort(sortByHomeOrder);
      });
    } catch (err) {
      console.error("update product order error", err);
      alert("Failed to update order.");
    }
  };

  const handleSave = async () => {
    if (!formCategoryEn.trim() || !formNameEn.trim() || !formBriefEn.trim()) {
      alert("Please fill Category/Name/Brief (English).");
      return;
    }

    setIsSaving(true);
    try {
      // 1) upload image if needed
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

      // 2) homeOrder
      let homeOrder: number | undefined;
      const existing = editingId ? products.find((p) => p.id === editingId) : undefined;

      if (editingId) {
        homeOrder = existing?.homeOrder;
      } else {
        const maxOrder = products.reduce(
          (max, p) => (typeof p.homeOrder === "number" && p.homeOrder > max ? p.homeOrder : max),
          0
        );
        homeOrder = maxOrder + 1;
      }

      // ✅ compatibility:
      // - editing: keep legacy CN fields as-is
      // - creating: set legacy fields = EN to avoid old pages blank
      const legacyCategory = existing?.category || formCategoryEn.trim();
      const legacyName = existing?.name || formNameEn.trim();
      const legacyBrief = existing?.brief || formBriefEn.trim();

      const payload: FirestoreProduct = {
        category: legacyCategory,
        name: legacyName,
        brief: legacyBrief,

        categoryEn: formCategoryEn.trim(),
        nameEn: formNameEn.trim(),
        briefEn: formBriefEn.trim(),

        categoryHi: formCategoryHi.trim() || undefined,
        nameHi: formNameHi.trim() || undefined,
        briefHi: formBriefHi.trim() || undefined,

        categoryId: formCategoryId.trim() || undefined,
        nameId: formNameId.trim() || undefined,
        briefId: formBriefId.trim() || undefined,

        enabled: formEnabled,
        imageUrl: finalImageUrl,
        homeOrder,
      };

      if (editingId) {
        await updateDoc(doc(db, PRODUCTS_COLLECTION, editingId), payload as any);
        const updated: AdminProduct = { id: editingId, ...payload };

        setProducts((prev) => {
          const list = prev.map((p) => (p.id === editingId ? updated : p));
          return [...list].sort(sortByHomeOrder);
        });
      } else {
        const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), payload as any);
        const created: AdminProduct = { id: docRef.id, ...payload };
        setProducts((prev) => [...prev, created].sort(sortByHomeOrder));
      }

      resetForm();
    } catch (err) {
      console.error("save product error", err);
      alert("Failed to save product.");
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
            Products (Admin)
          </h1>
          <p className="jyc-section-intro">
            Edit English / Hindi / Indonesian fields. Legacy Chinese fields are kept for backward compatibility and will not be editable here.
          </p>

          {/* Form */}
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
              {editingId ? "Edit product" : "Add product"}
            </h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
              style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 720 }}
            >
              {/* EN required */}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <input
                  type="text"
                  placeholder="Category (English) *"
                  value={formCategoryEn}
                  onChange={(e) => setFormCategoryEn(e.target.value)}
                  style={{
                    flex: 1,
                    minWidth: 220,
                    padding: "8px 10px",
                    borderRadius: 4,
                    border: "1px solid #ccc",
                    fontSize: 13,
                  }}
                />
                <input
                  type="text"
                  placeholder="Name (English) *"
                  value={formNameEn}
                  onChange={(e) => setFormNameEn(e.target.value)}
                  style={{
                    flex: 1,
                    minWidth: 220,
                    padding: "8px 10px",
                    borderRadius: 4,
                    border: "1px solid #ccc",
                    fontSize: 13,
                  }}
                />
              </div>

              <textarea
                placeholder="Brief (English) *"
                rows={3}
                value={formBriefEn}
                onChange={(e) => setFormBriefEn(e.target.value)}
                style={{
                  padding: "8px 10px",
                  borderRadius: 4,
                  border: "1px solid #ccc",
                  fontSize: 13,
                  resize: "vertical",
                }}
              />

              {/* HI optional */}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <input
                  type="text"
                  placeholder="Category (Hindi, optional)"
                  value={formCategoryHi}
                  onChange={(e) => setFormCategoryHi(e.target.value)}
                  style={{
                    flex: 1,
                    minWidth: 220,
                    padding: "8px 10px",
                    borderRadius: 4,
                    border: "1px solid #ccc",
                    fontSize: 13,
                  }}
                />
                <input
                  type="text"
                  placeholder="Name (Hindi, optional)"
                  value={formNameHi}
                  onChange={(e) => setFormNameHi(e.target.value)}
                  style={{
                    flex: 1,
                    minWidth: 220,
                    padding: "8px 10px",
                    borderRadius: 4,
                    border: "1px solid #ccc",
                    fontSize: 13,
                  }}
                />
              </div>
              <textarea
                placeholder="Brief (Hindi, optional)"
                rows={3}
                value={formBriefHi}
                onChange={(e) => setFormBriefHi(e.target.value)}
                style={{
                  padding: "8px 10px",
                  borderRadius: 4,
                  border: "1px solid #ccc",
                  fontSize: 13,
                  resize: "vertical",
                }}
              />

              {/* ID optional */}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <input
                  type="text"
                  placeholder="Category (Indonesian, optional)"
                  value={formCategoryId}
                  onChange={(e) => setFormCategoryId(e.target.value)}
                  style={{
                    flex: 1,
                    minWidth: 220,
                    padding: "8px 10px",
                    borderRadius: 4,
                    border: "1px solid #ccc",
                    fontSize: 13,
                  }}
                />
                <input
                  type="text"
                  placeholder="Name (Indonesian, optional)"
                  value={formNameId}
                  onChange={(e) => setFormNameId(e.target.value)}
                  style={{
                    flex: 1,
                    minWidth: 220,
                    padding: "8px 10px",
                    borderRadius: 4,
                    border: "1px solid #ccc",
                    fontSize: 13,
                  }}
                />
              </div>
              <textarea
                placeholder="Brief (Indonesian, optional)"
                rows={3}
                value={formBriefId}
                onChange={(e) => setFormBriefId(e.target.value)}
                style={{
                  padding: "8px 10px",
                  borderRadius: 4,
                  border: "1px solid #ccc",
                  fontSize: 13,
                  resize: "vertical",
                }}
              />

              {/* Image */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13 }}>
                <label>Product image (optional)</label>
                <input type="file" onChange={handleFileChange} />
                {uploadFileName && (
                  <div style={{ fontSize: 12, color: "#777" }}>Selected: {uploadFileName}</div>
                )}
                {formImageUrl && !uploadFile && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
                      Current image (upload a new file to replace)
                    </span>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                  <input
                    type="checkbox"
                    checked={formEnabled}
                    onChange={(e) => setFormEnabled(e.target.checked)}
                  />
                  Show on frontend
                </label>

                <button
                  type="submit"
                  className="jyc-btn-primary"
                  style={{ fontSize: 13, padding: "8px 16px" }}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving…" : editingId ? "Save changes" : "Add product"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="jyc-btn-secondary"
                    style={{ fontSize: 13, padding: "8px 16px" }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List */}
          <div>
            <h2 style={{ fontSize: 16, marginBottom: 8 }}>Product list</h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {products.map((p, index) => {
                const displayName = p.nameEn || p.name || "(no name)";
                const displayCategory = p.categoryEn || p.category || "(no category)";

                return (
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
                          <strong>{displayName}</strong>
                          <div style={{ fontSize: 12, color: "#777" }}>{displayCategory}</div>
                          {(p.nameHi || p.nameId) && (
                            <div style={{ fontSize: 12, color: "#999" }}>
                              {p.nameHi ? `HI: ${p.nameHi} ` : ""}
                              {p.nameId ? `ID: ${p.nameId}` : ""}
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                        <span style={{ fontSize: 11, color: "#555" }}>
                          Home order: {p.homeOrder ?? index + 1}
                        </span>
                        <span style={{ fontSize: 11, color: p.enabled ? "#0a7d32" : "#999" }}>
                          {p.enabled ? "Visible" : "Hidden"}
                        </span>
                      </div>
                    </div>

                    <p style={{ margin: 0, fontSize: 13, color: "#555", lineHeight: 1.6 }}>
                      {p.briefEn || p.brief}
                    </p>

                    <div style={{ display: "flex", gap: 8, marginTop: 10, fontSize: 12, flexWrap: "wrap" }}>
                      <button
                        type="button"
                        onClick={() => handleMove(p.id, "up")}
                        disabled={index === 0}
                        style={{
                          padding: "4px 10px",
                          borderRadius: 4,
                          border: "1px solid #888",
                          background: index === 0 ? "#f5f5f5" : "#fff",
                          cursor: index === 0 ? "not-allowed" : "pointer",
                        }}
                      >
                        Up
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(p.id, "down")}
                        disabled={index === products.length - 1}
                        style={{
                          padding: "4px 10px",
                          borderRadius: 4,
                          border: "1px solid #888",
                          background: index === products.length - 1 ? "#f5f5f5" : "#fff",
                          cursor: index === products.length - 1 ? "not-allowed" : "pointer",
                        }}
                      >
                        Down
                      </button>

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
                        Edit
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
                        Delete
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
