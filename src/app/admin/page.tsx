// src/app/admin/page.tsx
import React from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function AdminHomePage() {
  return (
    <main className="jyc-page">
      <Header />

      <section className="jyc-section jyc-section-alt">
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <h1 style={{ fontSize: "24px", marginBottom: "8px" }}>
            后台首页（内部管理）
          </h1>
          <p className="jyc-section-intro">
            此区域为公司内部使用，用于管理网站内容与客户资料。目前预留的模块包含：
            客户留言、客户资料 / CRM、图片 / Gallery 管理、产品资讯管理与网站基本资讯。
            正式上线时可依实际需求开启或关闭相关模块，并串接数据库与登入权限控管。
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 16,
              marginTop: 24,
            }}
          >
            {/* 留言管理 */}
            <Link
              href="/admin/messages"
              style={{
                display: "block",
                borderRadius: 8,
                border: "1px solid #e5e5e5",
                padding: 16,
                background: "#fff",
                textDecoration: "none",
              }}
            >
              <h2
                style={{ fontSize: 18, marginBottom: 8, color: "#222" }}
              >
                留言管理
              </h2>
              <p
                style={{
                  fontSize: 13,
                  color: "#666",
                  lineHeight: 1.6,
                }}
              >
                浏览通过「联系我们」表单与在线助手提交的客户留言。
                后续可新增标记处理状态、负责人、回复记录与跟进提醒等功能，
                方便业务团队分工处理。
              </p>
            </Link>

            {/* 客户资料 / CRM */}
            <Link
              href="/admin/customers"
              style={{
                display: "block",
                borderRadius: 8,
                border: "1px solid #e5e5e5",
                padding: 16,
                background: "#fff",
                textDecoration: "none",
              }}
            >
              <h2
                style={{ fontSize: 18, marginBottom: 8, color: "#222" }}
              >
                客户资料 / CRM
              </h2>
              <p
                style={{
                  fontSize: 13,
                  color: "#666",
                  lineHeight: 1.6,
                }}
              >
                汇总由在线助手与网站表单收集到的客户基础资讯，包括称呼、公司、联络方式、
                需求说明与感兴趣的机组类型，方便业务后续分级管理与跟进。
              </p>
            </Link>

            {/* Gallery 管理 */}
            <Link
              href="/admin/gallery"
              style={{
                display: "block",
                borderRadius: 8,
                border: "1px solid #e5e5e5",
                padding: 16,
                background: "#fff",
                textDecoration: "none",
              }}
            >
              <h2
                style={{ fontSize: 18, marginBottom: 8, color: "#222" }}
              >
                图片 / Gallery 管理
              </h2>
              <p
                style={{
                  fontSize: 13,
                  color: "#666",
                  lineHeight: 1.6,
                }}
              >
                管理网站上的设备照片、生产线现场与工程案例图片。
                可指定哪些图片要显示在首页产品卡片与 Gallery
                区块（中英文首页共用），并透过排序决定优先顺序。
                目前为预留入口，后续可与 Firebase Storage / 数据库串接实际上传与管理流程。
              </p>
            </Link>

            {/* 产品资讯管理 */}
            <Link
              href="/admin/products"
              style={{
                display: "block",
                borderRadius: 8,
                border: "1px solid #e5e5e5",
                padding: 16,
                background: "#fff",
                textDecoration: "none",
              }}
            >
              <h2
                style={{ fontSize: 18, marginBottom: 8, color: "#222" }}
              >
                产品资讯管理
              </h2>
              <p
                style={{
                  fontSize: 13,
                  color: "#666",
                  lineHeight: 1.6,
                }}
              >
                维护网站上显示的主要产品类别与说明文字，例如热轧无缝钢管生产线、
                穿孔与轧管机组、定径减径机 / 矫直机 / 冷床等精整与辅助设备。
                后续可与首页产品区块及中英文「产品一览」页面共用同一份资料，
                并配合数据库设计具体字段与启用 / 停用逻辑。
              </p>
            </Link>

            {/* 网站基本资讯 */}
            <Link
              href="/admin/settings"
              style={{
                display: "block",
                borderRadius: 8,
                border: "1px solid #e5e5e5",
                padding: 16,
                background: "#fff",
                textDecoration: "none",
              }}
            >
              <h2
                style={{ fontSize: 18, marginBottom: 8, color: "#222" }}
              >
                网站基本资讯
              </h2>
              <p
                style={{
                  fontSize: 13,
                  color: "#666",
                  lineHeight: 1.6,
                }}
              >
                维护网站上显示的公司名称、地址、电话、邮箱、联系人等基本资讯，
                以及页脚版权文字与多语言版本的联络资讯。 目前为预留页面，日后可增加权限设定、
                语言切换与 SEO 相关设定等功能。
              </p>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
