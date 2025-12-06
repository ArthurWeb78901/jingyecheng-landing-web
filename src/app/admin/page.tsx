// src/app/admin/page.tsx
import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function AdminHomePage() {
  return (
    <main className="jyc-page">
      <Header />

      <section className="jyc-section jyc-section-alt">
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>后台首页（内部管理）</h1>
          <p className="jyc-section-intro">
            此区域为公司内部使用，用于管理网站内容与客户留言。下方功能目前为示意入口，
            正式上线时可依实际需求开启或关闭相关模块，并串接数据库与登入权限控管。
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 16,
              marginTop: 24,
            }}
          >
            {/* 留言管理 */}
            <Link
              href="/admin/messages"
              style={{
                display: 'block',
                borderRadius: 8,
                border: '1px solid #e5e5e5',
                padding: 16,
                background: '#fff',
                textDecoration: 'none',
              }}
            >
              <h2 style={{ fontSize: 18, marginBottom: 8, color: '#222' }}>留言管理</h2>
              <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>
                浏览通过「在线留言 / 联系我们」页面提交的客户留言，
                后续可新增标记处理状态、回复记录等功能。
              </p>
            </Link>

            {/* 客户资料 / CRM */}
            <Link
              href="/admin/customers"
              style={{
                display: 'block',
                borderRadius: 8,
                border: '1px solid #e5e5e5',
                padding: 16,
                background: '#fff',
                textDecoration: 'none',
              }}
            >
              <h2 style={{ fontSize: 18, marginBottom: 8, color: '#222' }}>客户资料 / CRM</h2>
              <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>
                汇总由在线助手与网站表单收集到的客户基础资讯，包括称呼、公司、联络方式与需求说明，
                方便业务后续跟进。
              </p>
            </Link>

            {/* Gallery 管理 */}
            <Link
              href="/admin/gallery"
              style={{
                display: 'block',
                borderRadius: 8,
                border: '1px solid #e5e5e5',
                padding: 16,
                background: '#fff',
                textDecoration: 'none',
              }}
            >
              <h2 style={{ fontSize: 18, marginBottom: 8, color: '#222' }}>图片 / Gallery 管理</h2>
              <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>
                管理网站上的设备照片、生产线现场与工程案例图片。包含新增、删除与排序调整等功能
                （目前为预留入口，尚未实现具体操作画面）。
              </p>
            </Link>

            {/* 产品资讯管理 */}
            <Link
              href="/admin/products"
              style={{
                display: 'block',
                borderRadius: 8,
                border: '1px solid #e5e5e5',
                padding: 16,
                background: '#fff',
                textDecoration: 'none',
              }}
            >
              <h2 style={{ fontSize: 18, marginBottom: 8, color: '#222' }}>产品资讯管理</h2>
              <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>
                维护网站上显示的产品类别与说明文字，例如无缝钢管机组、轧钢设备、精整线等
                （目前为示意，后续可配合数据库设计具体字段）。
              </p>
            </Link>

            {/* 网站基本资讯 */}
            <Link
              href="/admin/settings"
              style={{
                display: 'block',
                borderRadius: 8,
                border: '1px solid #e5e5e5',
                padding: 16,
                background: '#fff',
                textDecoration: 'none',
              }}
            >
              <h2 style={{ fontSize: 18, marginBottom: 8, color: '#222' }}>网站基本资讯</h2>
              <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>
                维护网站上显示的公司名称、地址、电话、邮箱等基本资讯，
                以及页脚版权文字等内容（目前为预留页面）。
              </p>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
