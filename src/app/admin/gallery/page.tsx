// src/app/admin/gallery/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { storage, db } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
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

// ✅ 保留旧 category 值（中文）以确保旧前台/旧数据不被破坏
type GalleryCategory = "设备展示" | "生产线现场" | "工程案例" | "展会与交流";
type MachineTemp = "hot" | "cold";

type AdminGalleryItem = {
  id: string;

  // legacy / compatibility（旧前台仍可能用到）
  title: string; // legacy zh title（admin 不编辑）
  description?: string; // legacy zh description（admin 不编辑）

  // EN/HI/ID（admin 可编辑）
  titleEn?: string;
  titleHi?: string;
  titleId?: string;
  descriptionEn?: string;
  descriptionHi?: string;
  descriptionId?: string;

  category: GalleryCategory;
  filename: string;
  imageUrl?: string;
  showOnHome: boolean;
  createdAt?: string;

  machineTemp?: MachineTemp;
};

export default function AdminGalleryPage() {
  const [items, setItems] = useState<AdminGalleryItem[]>([]);

  // ✅ 表单：移除中文可编辑，只保留 EN/HI/ID
  const [uploadTitleEn, setUploadTitleEn] = useState("");
  const [uploadTitleHi, setUploadTitleHi] = useState("");
  const [uploadTitleId, setUploadTitleId] = useState("");

  const [uploadCategory, setUploadCategory] = useState<GalleryCategory | "">("");
  const [uploadFileName, setUploadFileName] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const [uploadDescriptionEn, setUploadDescriptionEn] = useState("");
  const [uploadDescriptionHi, setUploadDescriptionHi] = useState("");
  const [uploadDescriptionId, setUploadDescriptionId] = useState("");

  const [uploadImageUrl, setUploadImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const [uploadMachineTemp, setUploadMachineTemp] = useState<MachineTemp | "">(
    ""
  );

  const [editingId, setEditingId] = useState<string | null>(null);

  const resetForm = () => {
    setUploadTitleEn("");
    setUploadTitleHi("");
    setUploadTitleId("");
    setUploadCategory("");
    setUploadFileName("");
    setUploadFile(null);
    setUploadDescriptionEn("");
    setUploadDescriptionHi("");
    setUploadDescriptionId("");
    setUploadImageUrl("");
    setUploadMachineTemp("");
    setEditingId(null);
  };

  useEffect(() => {
    async function fetchItems() {
      try {
        const q = query(collection(db, "jyc_gallery"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        const list: AdminGalleryItem[] = snap.docs.map((d) => {
          const data = d.data() as Omit<AdminGalleryItem, "id">;
          return { id: d.id, ...data };
        });
        setItems(list);
      } catch (err) {
        console.error("load gallery items from Firestore error", err);
      }
    }
    fetchItems();
  }, []);

  const handleStartEdit = (item: AdminGalleryItem) => {
    setEditingId(item.id);

    // ✅ EN/HI/ID：若没填就用 legacy 预填（方便快速补齐多语言，但不等于编辑中文）
    setUploadTitleEn(item.titleEn || item.title || "");
    setUploadTitleHi(item.titleHi || "");
    setUploadTitleId(item.titleId || "");

    setUploadCategory(item.category);
    setUploadFileName(item.filename || "");
    setUploadDescriptionEn(item.descriptionEn || item.description || "");
    setUploadDescriptionHi(item.descriptionHi || "");
    setUploadDescriptionId(item.descriptionId || "");
    setUploadImageUrl(item.imageUrl || "");
    setUploadMachineTemp(item.machineTemp ?? "");
    setUploadFile(null);
  };

  const handleCancelEdit = () => resetForm();

  const handleUpload = async () => {
    if (!uploadCategory) {
      alert("Please select a category.");
      return;
    }

    if (!uploadFile && !uploadImageUrl.trim()) {
      alert("Please upload an image OR provide an image URL.");
      return;
    }

    if (!uploadTitleEn.trim()) {
      alert("Please fill Title (English).");
      return;
    }

    setIsUploading(true);

    try {
      let finalUrl = uploadImageUrl.trim() || "";
      let finalFilename = uploadFileName || "";

      if (uploadFile) {
        const ext = uploadFile.name.split(".").pop() || "jpg";
        const storagePath = `jyc-gallery/${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}.${ext}`;
        const storageRef = ref(storage, storagePath);
        const snap = await uploadBytes(storageRef, uploadFile);
        finalUrl = await getDownloadURL(snap.ref);
        finalFilename = uploadFile.name;
      }

      const now = new Date().toISOString();
      const existing = editingId ? items.find((i) => i.id === editingId) : undefined;

      const machineTempValue: MachineTemp | undefined =
        uploadMachineTemp === "" ? undefined : uploadMachineTemp;

      // ✅ legacy zh：编辑时保留原值；新增时用 EN 兜底，避免旧前台空白
      const legacyTitle = existing?.title || uploadTitleEn.trim() || finalFilename || "Untitled";
      const legacyDesc = existing?.description || "";

      const payload: Omit<AdminGalleryItem, "id"> = {
        // legacy
        title: legacyTitle,
        description: legacyDesc,

        // EN/HI/ID
        titleEn: uploadTitleEn.trim() || undefined,
        titleHi: uploadTitleHi.trim() || undefined,
        titleId: uploadTitleId.trim() || undefined,
        descriptionEn: uploadDescriptionEn.trim() || undefined,
        descriptionHi: uploadDescriptionHi.trim() || undefined,
        descriptionId: uploadDescriptionId.trim() || undefined,

        category: uploadCategory as GalleryCategory,
        filename: finalFilename || "external-image",
        imageUrl: finalUrl || "",
        showOnHome: existing?.showOnHome ?? true,
        createdAt: existing?.createdAt || now,
        machineTemp: machineTempValue,
      };

      if (editingId && existing) {
        await updateDoc(doc(db, "jyc_gallery", editingId), payload);
        setItems((prev) => prev.map((i) => (i.id === editingId ? { ...i, ...payload } : i)));
      } else {
        const docRef = await addDoc(collection(db, "jyc_gallery"), payload);
        setItems((prev) => [{ id: docRef.id, ...payload }, ...prev]);
      }

      resetForm();
    } catch (err) {
      console.error("upload error", err);
      alert("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleToggleShowOnHome = async (id: string) => {
    const target = items.find((i) => i.id === id);
    if (!target) return;

    const nextValue = !target.showOnHome;
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, showOnHome: nextValue } : i)));

    try {
      await updateDoc(doc(db, "jyc_gallery", id), { showOnHome: nextValue });
    } catch (err) {
      console.error("update showOnHome error", err);
      alert("Failed to update showOnHome.");
    }
  };

  const handleDelete = async (id: string) => {
    if (typeof window !== "undefined") {
      const ok = window.confirm("Delete this gallery record (Firestore only)?");
      if (!ok) return;
    }

    setItems((prev) => prev.filter((i) => i.id !== id));

    try {
      await deleteDoc(doc(db, "jyc_gallery", id));
    } catch (err) {
      console.error("delete gallery item error", err);
      alert("Delete failed. Please try again.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setUploadFileName("");
      setUploadFile(null);
      return;
    }
    setUploadFile(file);
    setUploadFileName(file.name);
  };

  const categoryLabel = (c: GalleryCategory) => {
    switch (c) {
      case "设备展示":
        return "Equipment";
      case "生产线现场":
        return "Production Line";
      case "工程案例":
        return "Projects";
      case "展会与交流":
        return "Exhibitions";
      default:
        return c;
    }
  };

  return (
    <main className="jyc-page">
      <Header />

      <section className="jyc-section jyc-section-alt">
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <h1 style={{ fontSize: "24px", marginBottom: "8px" }}>
            Gallery (Admin)
          </h1>
          <p className="jyc-section-intro">
            Edit English / Hindi / Indonesian content. Legacy Chinese fields are kept for backward compatibility (not editable here).
          </p>

          {/* Upload / Edit */}
          <div
            style={{
              marginTop: 20,
              marginBottom: 24,
              padding: 16,
              borderRadius: 8,
              border: "1px solid #e5e5e5",
              background: "#fff",
            }}
          >
            <h2 style={{ fontSize: 16, marginBottom: 8 }}>
              {editingId ? "Edit item" : "Add new item"}
            </h2>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                alignItems: "center",
                fontSize: 13,
                marginBottom: 8,
              }}
            >
              <input type="file" onChange={handleFileChange} />

              <select
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value as GalleryCategory | "")}
                style={{
                  padding: "6px 10px",
                  borderRadius: 4,
                  border: "1px solid #ccc",
                  fontSize: 13,
                }}
              >
                <option value="">Select category</option>
                <option value="设备展示">Equipment</option>
                <option value="生产线现场">Production Line</option>
                <option value="工程案例">Projects</option>
                <option value="展会与交流">Exhibitions</option>
              </select>
            </div>

            {/* Titles */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
              <input
                type="text"
                placeholder="Title (English) *"
                value={uploadTitleEn}
                onChange={(e) => setUploadTitleEn(e.target.value)}
                style={{
                  width: "100%",
                  padding: "6px 8px",
                  borderRadius: 4,
                  border: "1px solid #ccc",
                  fontSize: 13,
                }}
              />
              <input
                type="text"
                placeholder="Title (Hindi, optional)"
                value={uploadTitleHi}
                onChange={(e) => setUploadTitleHi(e.target.value)}
                style={{
                  width: "100%",
                  padding: "6px 8px",
                  borderRadius: 4,
                  border: "1px solid #ccc",
                  fontSize: 13,
                }}
              />
              <input
                type="text"
                placeholder="Title (Indonesian, optional)"
                value={uploadTitleId}
                onChange={(e) => setUploadTitleId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "6px 8px",
                  borderRadius: 4,
                  border: "1px solid #ccc",
                  fontSize: 13,
                }}
              />
            </div>

            {/* Machine temp */}
            <div
              style={{
                marginBottom: 8,
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span>Machine type:</span>
              <select
                value={uploadMachineTemp}
                onChange={(e) => setUploadMachineTemp(e.target.value as MachineTemp | "")}
                style={{
                  padding: "6px 10px",
                  borderRadius: 4,
                  border: "1px solid #ccc",
                  fontSize: 13,
                }}
              >
                <option value="">Unspecified</option>
                <option value="hot">Hot processing</option>
                <option value="cold">Cold processing</option>
              </select>
            </div>

            {/* URL + Descriptions */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
              <input
                type="text"
                placeholder="Image URL (optional if uploaded)"
                value={uploadImageUrl}
                onChange={(e) => setUploadImageUrl(e.target.value)}
                style={{
                  width: "100%",
                  padding: "6px 8px",
                  borderRadius: 4,
                  border: "1px solid #ccc",
                  fontSize: 13,
                }}
              />
              <textarea
                placeholder="Description (English, optional)"
                value={uploadDescriptionEn}
                onChange={(e) => setUploadDescriptionEn(e.target.value)}
                rows={2}
                style={{
                  width: "100%",
                  padding: "6px 8px",
                  borderRadius: 4,
                  border: "1px solid #ccc",
                  fontSize: 13,
                  resize: "vertical",
                }}
              />
              <textarea
                placeholder="Description (Hindi, optional)"
                value={uploadDescriptionHi}
                onChange={(e) => setUploadDescriptionHi(e.target.value)}
                rows={2}
                style={{
                  width: "100%",
                  padding: "6px 8px",
                  borderRadius: 4,
                  border: "1px solid #ccc",
                  fontSize: 13,
                  resize: "vertical",
                }}
              />
              <textarea
                placeholder="Description (Indonesian, optional)"
                value={uploadDescriptionId}
                onChange={(e) => setUploadDescriptionId(e.target.value)}
                rows={2}
                style={{
                  width: "100%",
                  padding: "6px 8px",
                  borderRadius: 4,
                  border: "1px solid #ccc",
                  fontSize: 13,
                  resize: "vertical",
                }}
              />
            </div>

            <button
              type="button"
              className="jyc-btn-primary"
              style={{ fontSize: 13, padding: "8px 16px", minWidth: 140 }}
              onClick={handleUpload}
              disabled={isUploading}
            >
              {isUploading ? "Working..." : editingId ? "Save changes" : "Add item"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                style={{
                  marginLeft: 8,
                  fontSize: 13,
                  padding: "8px 16px",
                  minWidth: 100,
                  borderRadius: 4,
                  border: "1px solid #999",
                  background: "#fff",
                  color: "#555",
                }}
              >
                Cancel
              </button>
            )}

            {uploadFileName && (
              <div style={{ fontSize: 12, color: "#777", marginTop: 6 }}>
                Selected file: {uploadFileName}
              </div>
            )}
          </div>

          {/* List */}
          <div>
            <h2 style={{ fontSize: 16, marginBottom: 8 }}>Items</h2>

            {items.length === 0 ? (
              <div
                style={{
                  padding: 16,
                  borderRadius: 8,
                  border: "1px solid #e5e5e5",
                  background: "#fff",
                  fontSize: 13,
                  color: "#666",
                }}
              >
                No items yet.
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 16,
                }}
              >
                {items.map((item) => {
                  const displayTitle = item.titleEn || item.title || "(untitled)";
                  return (
                    <article
                      key={item.id}
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
                          marginBottom: 8,
                          height: 120,
                          position: "relative",
                          backgroundColor: "#e0e0e0",
                          backgroundImage: item.imageUrl ? `url(${item.imageUrl})` : undefined,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      >
                        <span
                          style={{
                            position: "absolute",
                            left: 8,
                            bottom: 8,
                            fontSize: 11,
                            color: "#555",
                            background: "rgba(255,255,255,0.9)",
                            padding: "2px 6px",
                            borderRadius: 4,
                          }}
                        >
                          {item.filename}
                        </span>
                      </div>

                      <div style={{ marginBottom: 2, fontWeight: 600 }}>
                        {displayTitle}
                      </div>

                      {(item.titleHi || item.titleId) && (
                        <div style={{ marginBottom: 4, fontSize: 12, color: "#777" }}>
                          {item.titleHi ? `HI: ${item.titleHi} ` : ""}
                          {item.titleId ? `ID: ${item.titleId}` : ""}
                        </div>
                      )}

                      {(item.descriptionEn || item.description) && (
                        <div style={{ marginBottom: 4, color: "#555", fontSize: 12, lineHeight: 1.5 }}>
                          {item.descriptionEn || item.description}
                        </div>
                      )}

                      <div style={{ marginBottom: 6, color: "#777" }}>
                        Category: {categoryLabel(item.category)}
                      </div>

                      {item.machineTemp && (
                        <div style={{ marginBottom: 6, color: "#777", fontSize: 12 }}>
                          Machine: {item.machineTemp === "hot" ? "Hot" : "Cold"}
                        </div>
                      )}

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                        <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#555" }}>
                          <input
                            type="checkbox"
                            checked={item.showOnHome}
                            onChange={() => handleToggleShowOnHome(item.id)}
                          />
                          <span>Show on home</span>
                        </label>

                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            type="button"
                            onClick={() => handleStartEdit(item)}
                            style={{
                              fontSize: 12,
                              padding: "4px 8px",
                              borderRadius: 4,
                              border: "1px solid #888",
                              background: "#fff",
                              color: "#333",
                            }}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            style={{
                              fontSize: 12,
                              padding: "4px 8px",
                              borderRadius: 4,
                              border: "1px solid #c33",
                              background: "#fff",
                              color: "#c33",
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
