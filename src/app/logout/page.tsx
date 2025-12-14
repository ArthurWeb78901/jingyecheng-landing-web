// src/app/logout/page.tsx
"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { markAdminOffline } from "@/lib/adminStatus";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    async function doLogout() {
      if (typeof window !== "undefined") {
        // 清除登入状态（本机）
        window.localStorage.removeItem("jyc_admin_logged_in");
      }

      // ✅ 更新 Firestore，标记管理员离线
      try {
        await markAdminOffline();
      } catch (err) {
        console.error("markAdminOffline error", err);
      }

      // 稍微停一下再导回首页
      setTimeout(() => {
        router.push("/");
      }, 800);
    }

    void doLogout();
  }, [router]);

  return (
    <main className="jyc-page">
      <Header />
      <section className="jyc-section jyc-section-alt">
        <div
          style={{
            maxWidth: 480,
            margin: "0 auto",
            textAlign: "center",
            padding: "40px 16px",
          }}
        >
          <h1 style={{ fontSize: 22, marginBottom: 12 }}>后台已登出</h1>
          <p style={{ fontSize: 13, color: "#666" }}>
            已清除当前浏览器的后台登入状态，稍后将自动返回首页。
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
}
