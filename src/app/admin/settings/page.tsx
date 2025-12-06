// src/app/admin/settings/page.tsx
import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function AdminSettingsPage() {
  return (
    <main className="jyc-page">
      <Header />

      <section className="jyc-section jyc-section-alt">
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>网站基本资讯（内部管理）</h1>
          <p className="jyc-section-intro">
            此页面用于维护网站上显示的公司名称、地址、电话、邮箱与页尾版权说明等资讯。
            当前画面仅为示意，正式上线时可将这些字段串接到数据库，并由前台共用。
          </p>

          {/* 基本资讯表单（示意用，不连后端） */}
          <form
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              marginTop: 16,
              background: '#fff',
              borderRadius: 8,
              border: '1px solid #e5e5e5',
              padding: 16,
            }}
          >
            {/* 公司名称 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 13, color: '#444' }}>公司名称</label>
              <input
                type="text"
                defaultValue="山西太矿钢管设备有限公司"
                style={{
                  padding: '8px 10px',
                  borderRadius: 4,
                  border: '1px solid #ccc',
                  fontSize: 13,
                }}
              />
            </div>

            {/* 地址 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 13, color: '#444' }}>公司地址</label>
              <input
                type="text"
                defaultValue="山西省太原市百花谷"
                style={{
                  padding: '8px 10px',
                  borderRadius: 4,
                  border: '1px solid #ccc',
                  fontSize: 13,
                }}
              />
            </div>

            {/* 电话 & 邮箱 */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 13, color: '#444' }}>联系电话</label>
                <input
                  type="text"
                  defaultValue="0351-2028121"
                  style={{
                    padding: '8px 10px',
                    borderRadius: 4,
                    border: '1px solid #ccc',
                    fontSize: 13,
                  }}
                />
              </div>

              <div style={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 13, color: '#444' }}>联系邮箱</label>
                <input
                  type="email"
                  defaultValue="sxtkgg@aliyun.com"
                  style={{
                    padding: '8px 10px',
                    borderRadius: 4,
                    border: '1px solid #ccc',
                    fontSize: 13,
                  }}
                />
              </div>
            </div>

            {/* ICP & 版权信息 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 13, color: '#444' }}>ICP备案号</label>
              <input
                type="text"
                defaultValue="晋ICP备07000249号-1"
                style={{
                  padding: '8px 10px',
                  borderRadius: 4,
                  border: '1px solid #ccc',
                  fontSize: 13,
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 13, color: '#444' }}>页尾版权说明</label>
              <textarea
                rows={2}
                defaultValue="版权所有：山西太矿钢管设备有限公司　晋ICP备07000249号-1"
                style={{
                  padding: '8px 10px',
                  borderRadius: 4,
                  border: '1px solid #ccc',
                  fontSize: 13,
                  resize: 'vertical',
                }}
              />
            </div>

            {/* 保存提示（目前不实际保存） */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginTop: 8,
              }}
            >
              <button
                type="button"
                className="jyc-btn-primary"
                style={{ fontSize: 13, padding: '8px 18px' }}
              >
                保存设定（示意）
              </button>
              <span style={{ fontSize: 12, color: '#888' }}>
                当前为示意页面，按钮尚未连接后台系统；正式上线时可改为写入统一设定表。
              </span>
            </div>
          </form>
        </div>
      </section>

      <Footer />
    </main>
  );
}
