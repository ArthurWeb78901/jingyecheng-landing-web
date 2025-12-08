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

type AdminGalleryItem = {
  id: string; // Firestore doc id
  title: string;
  category: "设备展示" | "生产线现场" | "工程案例" | "展会与交流";
  filename: string;
  description?: string;
  imageUrl?: string;
  showOnHome: boolean;
  createdAt?: string; // ISO 字串
};

export default function AdminGalleryPage() {
  const [items, setItems] = useState<AdminGalleryItem[]>([]);

  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadCategory, setUploadCategory] =
    useState<AdminGalleryItem["category"] | "">("");
  const [uploadFileName, setUploadFileName] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadImageUrl, setUploadImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // ✅ 讀取 Firestore 裡的 jyc_gallery
  useEffect(() => {
    async function fetchItems() {
      try {
        const q = query(
          collection(db, "jyc_gallery"),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        const list: AdminGalleryItem[] = snap.docs.map((d) => {
          const data = d.data() as Omit<AdminGalleryItem, "id">;
          return {
            id: d.id,
            ...data,
          };
        });
        setItems(list);
      } catch (err) {
        console.error("load gallery items from Firestore error", err);
      }
    }

    fetchItems();
  }, []);

  // 上傳圖片 + 寫入 Firestore
  const handleUpload = async () => {
    if (!uploadCategory) {
      alert("请选择图片类别。");
      return;
    }

    if (!uploadFile && !uploadImageUrl.trim()) {
      alert("请至少上传一张图片，或填写图片网址。");
      return;
    }

    setIsUploading(true);

    try {
      let finalUrl = uploadImageUrl.trim() || "";
      let finalFilename = uploadFileName || "";

      // 有檔案 → 優先上傳 Firebase Storage
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

      const payload = {
        title: uploadTitle.trim() || finalFilename || "未命名图片",
        category: uploadCategory as AdminGalleryItem["category"],
        filename: finalFilename || "（外部图片）",
        description: uploadDescription.trim() || "",
        imageUrl: finalUrl || "",
        showOnHome: true,
        createdAt: now,
      };

      // ✅ 寫入 Firestore -> jyc_gallery
      const docRef = await addDoc(collection(db, "jyc_gallery"), payload);

      const newItem: AdminGalleryItem = {
        id: docRef.id,
        ...payload,
      };

      // 更新本地 state，讓畫面立即顯示
      setItems((prev) => [newItem, ...prev]);

      // 清空表單
      setUploadTitle("");
      setUploadCategory("");
      setUploadFileName("");
      setUploadFile(null);
      setUploadDescription("");
      setUploadImageUrl("");
    } catch (err) {
      console.error("upload error", err);
      alert("上传图片时发生错误，请稍后再试。");
    } finally {
      setIsUploading(false);
    }
  };

  // 切換「顯示在首頁輪播」
  const handleToggleShowOnHome = async (id: string) => {
    const target = items.find((i) => i.id === id);
    if (!target) return;

    const nextValue = !target.showOnHome;

    // 先更新畫面
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, showOnHome: nextValue } : i))
    );

    try {
      await updateDoc(doc(db, "jyc_gallery", id), {
        showOnHome: nextValue,
      });
    } catch (err) {
      console.error("update showOnHome error", err);
      alert("更新「显示在首页轮播」状态时发生错误。");
    }
  };

  // 刪除記錄（這裡先只刪 Firestore，不刪實體檔案）
  const handleDelete = async (id: string) => {
    if (
      typeof window !== "undefined" &&
      !window.confirm("确定要删除这张图片记录吗？（不会删除 Firebase 实体档案）")
    ) {
      return;
    }

    // 先更新畫面
    setItems((prev) => prev.filter((i) => i.id !== id));

    try {
      await deleteDoc(doc(db, "jyc_gallery", id));
    } catch (err) {
      console.error("delete gallery item error", err);
      alert("删除记录时发生错误，请稍后再试。");
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

  return (
    <main className="jyc-page">
      <Header />

      <section className="jyc-section jyc-section-alt">
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <h1 style={{ fontSize: "24px", marginBottom: "8px" }}>
            图片 / Gallery 管理（内部）
          </h1>
          <p className="jyc-section-intro">
            此页面用于管理网站上的设备照片、生产线现场与工程案例图片。
            图片档案会上传到 Firebase Storage，而图片资讯
            （标题、说明、类别、是否显示在首页轮播）会写入 Firestore 的
            <code> jyc_gallery </code> 集合，供首页与图片集页面共用。
          </p>

          {/* 上传区 */}
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
            <h2 style={{ fontSize: 16, marginBottom: 8 }}>上传新图片</h2>
            <p
              style={{
                fontSize: 12,
                color: "#777",
                marginBottom: 12,
              }}
            >
              建议直接选择图片档案，上传后系统会将档案存到
              Firebase Storage 的 <code>jyc-gallery/</code> 资料夹，并取得网址做为预览。
              若暂时没有档案，也可以只填「图片网址」作为外部图片来源。
            </p>

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
              <input
                type="text"
                placeholder="图片标题（选填）"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: 140,
                  padding: "6px 8px",
                  borderRadius: 4,
                  border: "1px solid #ccc",
                  fontSize: 13,
                }}
              />
              <select
                value={uploadCategory}
                onChange={(e) =>
                  setUploadCategory(
                    e.target.value as AdminGalleryItem["category"] | ""
                  )
                }
                style={{
                  padding: "6px 10px",
                  borderRadius: 4,
                  border: "1px solid #ccc",
                  fontSize: 13,
                }}
              >
                <option value="">请选择类别</option>
                <option value="设备展示">设备展示</option>
                <option value="生产线现场">生产线现场</option>
                <option value="工程案例">工程案例</option>
                <option value="展会与交流">展会与交流</option>
              </select>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                marginBottom: 8,
                fontSize: 13,
              }}
            >
              <input
                type="text"
                placeholder="图片网址（选填：若未上传档案，可填 Firebase 以外的 https://... 或 /gallery/xxx.jpg）"
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
                placeholder="图片说明 / Description（选填，会显示在卡片标题下方）"
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
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
              style={{ fontSize: 13, padding: "8px 16px", minWidth: 120 }}
              onClick={handleUpload}
              disabled={isUploading}
            >
              {isUploading ? "上传中…" : "上传图片"}
            </button>

            {uploadFileName && (
              <div style={{ fontSize: 12, color: "#777", marginTop: 6 }}>
                已选择档案：{uploadFileName}
              </div>
            )}
          </div>

          {/* 图片列表 */}
          <div>
            <h2 style={{ fontSize: 16, marginBottom: 8 }}>已上传图片列表</h2>
            <p
              style={{
                fontSize: 12,
                color: "#777",
                marginBottom: 12,
              }}
            >
              下方为目前保存在 Firestore 中的图片资料，首页与图片集页面会依据
              「显示在首页轮播」勾选状态决定是否显示。
            </p>

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
                目前尚未有任何图片资料。你可以透过上方上传区新增几笔资料。
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 16,
                }}
              >
                {items.map((item) => (
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
                      className="jyc-gallery-item"
                      style={{
                        marginBottom: 8,
                        height: 120,
                        position: "relative",
                        backgroundColor: "#e0e0e0",
                        backgroundImage: item.imageUrl
                          ? `url(${item.imageUrl})`
                          : undefined,
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

                    <div style={{ marginBottom: 4, fontWeight: 600 }}>
                      {item.title}
                    </div>

                    {item.description && (
                      <div
                        style={{
                          marginBottom: 4,
                          color: "#555",
                          fontSize: 12,
                          lineHeight: 1.5,
                        }}
                      >
                        {item.description}
                      </div>
                    )}

                    <div style={{ marginBottom: 6, color: "#777" }}>
                      类别：{item.category}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 8,
                        marginTop: 4,
                      }}
                    >
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: 12,
                          color: "#555",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={item.showOnHome}
                          onChange={() => handleToggleShowOnHome(item.id)}
                        />
                        <span>显示在首页轮播</span>
                      </label>

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
                        删除
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
