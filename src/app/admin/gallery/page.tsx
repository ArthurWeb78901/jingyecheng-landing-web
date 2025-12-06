// src/app/admin/gallery/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

type AdminGalleryItem = {
  id: number;
  title: string;
  category: "设备展示" | "生产线现场" | "工程案例" | "展会与交流";
  filename: string;        // 原始档名
  description?: string;    // 图片说明
  imageUrl?: string;       // 实际图片网址（Firebase 或外部 URL）
  showOnHome: boolean;
  createdAt?: string;
};

const STORAGE_KEY = "jyc_admin_gallery_items";

const mockAdminGallery: AdminGalleryItem[] = [
  {
    id: 1,
    title: "无缝钢管机组主视图",
    category: "设备展示",
    filename: "line-main-01.jpg",
    description: "无缝钢管机组整体外观，可用于首页主视觉。",
    imageUrl: "/gallery/line-main-01.jpg",
    showOnHome: true,
  },
  {
    id: 2,
    title: "轧钢机架与传动系统",
    category: "设备展示",
    filename: "mill-structure-01.jpg",
    description: "轧机机架及传动结构特写，用于说明设备刚性。",
    imageUrl: "/gallery/mill-structure-01.jpg",
    showOnHome: true,
  },
  {
    id: 3,
    title: "生产线整体布局",
    category: "生产线现场",
    filename: "plant-layout-01.jpg",
    description: "示意整条生产线的布置，可用在工程规划介绍。",
    imageUrl: "/gallery/plant-layout-01.jpg",
    showOnHome: false,
  },
  {
    id: 4,
    title: "项目 A 机组交机现场",
    category: "工程案例",
    filename: "project-a-01.jpg",
    description: "某项目现场交机照片，可用在典型案例说明。",
    imageUrl: "/gallery/project-a-01.jpg",
    showOnHome: false,
  },
];

export default function AdminGalleryPage() {
  const [items, setItems] = useState<AdminGalleryItem[]>([]);

  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadCategory, setUploadCategory] =
    useState<AdminGalleryItem["category"] | "">("");
  const [uploadFileName, setUploadFileName] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadImageUrl, setUploadImageUrl] = useState(""); // 选填：若没上传档案，可直接用外部 URL
  const [isUploading, setIsUploading] = useState(false);

  // 载入 / 初始化示意数据
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const seeded = mockAdminGallery.map((x) => ({
          ...x,
          createdAt: new Date().toISOString(),
        }));
        setItems(seeded);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
        return;
      }

      const list: AdminGalleryItem[] = JSON.parse(raw);
      list.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
      setItems(list);
    } catch (err) {
      console.error("load gallery items error", err);
      setItems(mockAdminGallery);
    }
  }, []);

  const saveItems = (next: AdminGalleryItem[]) => {
    setItems(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  };

  // 上传（真实：若有档案则传 Firebase，没有档案但填了 URL 就直接用 URL）
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

      // 有选档案时：优先上传到 Firebase Storage
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

      const newItem: AdminGalleryItem = {
        id: Date.now(),
        title: uploadTitle.trim() || finalFilename || "未命名图片",
        category: uploadCategory as AdminGalleryItem["category"],
        filename: finalFilename || "（外部图片）",
        description: uploadDescription.trim() || undefined,
        imageUrl: finalUrl || undefined,
        showOnHome: true,
        createdAt: now,
      };

      const next = [newItem, ...items];
      saveItems(next);

      // 清空表单
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

  const handleToggleShowOnHome = (id: number) => {
    const next = items.map((item) =>
      item.id === id ? { ...item, showOnHome: !item.showOnHome } : item
    );
    saveItems(next);
  };

  const handleDelete = (id: number) => {
    if (typeof window !== "undefined") {
      if (!window.confirm("确定要删除这张图片（不会删除 Firebase 实体档案，仅删除后台记录）吗？"))
        return;
    }
    const next = items.filter((item) => item.id !== id);
    saveItems(next);
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
            图片档案会上传到 Firebase Storage（nooko-hub 项目），而图片资讯
            （标题、说明、类别、是否显示在首页轮播）暂存在浏览器 localStorage
            中，方便 Demo 使用。正式上线时可改为串接 Firestore 或其他数据库。
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
              通常建议直接选择图片档案，上传后系统会将档案存到
              Firebase Storage 的 <code>jyc-gallery/</code> 资料夹，并自动取得网址做为预览。
              若暂时没有档案，也可以只填「图片网址」作为外部图片来源。
              （当两者都有时，以上传档案为主）
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
              下方为目前保存在 localStorage 的图片资料，正式环境可改由数据库读取，
              并让前台首页 / Gallery 依据「显示在首页轮播」勾选状态来决定要不要显示。
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
                目前尚未有任何图片资料。你可以透过上方上传区新增几笔测试数据。
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
