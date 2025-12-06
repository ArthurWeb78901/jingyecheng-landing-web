// src/app/login/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 硬编码帐号／密码
    if (username === "wendy123" && password === "123456") {
      // 记在 localStorage，之後可以用来做简单判断
      if (typeof window !== "undefined") {
        window.localStorage.setItem("jyc_admin_logged_in", "true");
      }
      setError("");
      // 登入成功，导到后台首页
      router.push("/admin");
    } else {
      setError("帐号或密码错误，请再试一次。");
    }
  };

  return (
    <main className="jyc-page">
      <Header />

      <section className="jyc-section jyc-section-alt">
        <div
          style={{
            maxWidth: 420,
            margin: "0 auto",
            padding: "24px 24px 28px",
            borderRadius: 8,
            border: "1px solid #e5e5e5",
            background: "#fff",
          }}
        >
          <h1
            style={{
              fontSize: "22px",
              marginBottom: 16,
              textAlign: "center",
            }}
          >
            管理后台登入
          </h1>

          <p
            style={{
              fontSize: 13,
              color: "#777",
              textAlign: "center",
              marginBottom: 20,
            }}
          >
            此页为内部使用，登入后可维护产品资讯、图库照片与客户留言。
            （目前为示意环境，帐号硬编码在前端程式中。）
          </p>

          <form
            className="jyc-contact-form"
            style={{ gap: 12 }}
            onSubmit={handleSubmit}
          >
            <input
              type="text"
              placeholder="帐号 / 用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: 12,
                color: "#666",
                marginTop: 4,
              }}
            >
              <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <input type="checkbox" />
                <span>记住我（此电脑）</span>
              </label>

              <span style={{ opacity: 0.7 }}>忘记密码？</span>
            </div>

            {error && (
              <div
                style={{
                  marginTop: 8,
                  fontSize: 12,
                  color: "#c33",
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              className="jyc-btn-primary"
              style={{ marginTop: 12, width: "100%", justifyContent: "center" }}
            >
              登入后台
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </main>
  );
}
