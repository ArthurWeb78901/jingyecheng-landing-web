// src/app/admin/products/page.tsx
import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

type AdminProduct = {
  id: number;
  category: string;
  name: string;
  brief: string;
  enabled: boolean;
};

const mockAdminProducts: AdminProduct[] = [
  {
    id: 1,
    category: '无缝钢管机组',
    name: '无缝钢管生产机组',
    brief: '用于生产各类规格无缝钢管的成套机组设备，结构扎实、运行稳定。',
    enabled: true,
  },
  {
    id: 2,
    category: '轧钢设备',
    name: '轧钢生产线设备',
    brief: '适用于多种钢材成型的轧机与配套设备，可依工艺需求规划整线。',
    enabled: true,
  },
  {
    id: 3,
    category: '精整线',
    name: '精整与后处理设备',
    brief: '配合无缝钢管与轧制产品的后段精整与检测，提升产品质量。',
    enabled: true,
  },
];

export default function AdminProductsPage() {
  return (
    <main className="jyc-page">
      <Header />

      <section className="jyc-section jyc-section-alt">
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>产品资讯管理（内部）</h1>
          <p className="jyc-section-intro">
            此页面用于维护网站上显示的产品类别与说明文字，例如无缝钢管机组、轧钢设备、精整线等。
            目前为示意画面，正式上线时可串接数据库，并提供新增、编辑与删除功能。
          </p>

          {/* 新增 / 编辑表单（UI 示意） */}
          <div
            style={{
              marginTop: 16,
              marginBottom: 24,
              padding: 16,
              borderRadius: 8,
              border: '1px solid #e5e5e5',
              background: '#fff',
            }}
          >
            <h2 style={{ fontSize: 16, marginBottom: 8 }}>新增 / 编辑产品（示意）</h2>
            <p
              style={{
                fontSize: 12,
                color: '#777',
                marginBottom: 12,
              }}
            >
              正式上线时，可在此输入产品名称、分类与简介，并储存到后台系统。
              当前仅为版面示意，按钮不会真正写入资料。
            </p>

            <form
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                maxWidth: 640,
              }}
            >
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="产品分类（例如：无缝钢管机组）"
                  style={{
                    flex: 1,
                    minWidth: 200,
                    padding: '8px 10px',
                    borderRadius: 4,
                    border: '1px solid #ccc',
                    fontSize: 13,
                  }}
                />
                <input
                  type="text"
                  placeholder="产品名称（例如：无缝钢管生产机组）"
                  style={{
                    flex: 1,
                    minWidth: 200,
                    padding: '8px 10px',
                    borderRadius: 4,
                    border: '1px solid #ccc',
                    fontSize: 13,
                  }}
                />
              </div>

              <textarea
                placeholder="产品简介（前台页面将显示在卡片中）"
                rows={3}
                style={{
                  padding: '8px 10px',
                  borderRadius: 4,
                  border: '1px solid #ccc',
                  fontSize: 13,
                  resize: 'vertical',
                }}
              />

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginTop: 4,
                  fontSize: 12,
                  color: '#555',
                }}
              >
                <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <input type="checkbox" defaultChecked />
                  <span>在前台显示此产品</span>
                </label>

                <button
                  type="button"
                  className="jyc-btn-primary"
                  style={{ fontSize: 13, padding: '8px 16px' }}
                >
                  保存（示意）
                </button>
              </div>
            </form>
          </div>

          {/* 产品列表（目前是样板数据） */}
          <div>
            <h2 style={{ fontSize: 16, marginBottom: 8 }}>现有产品列表（示意）</h2>
            <p
              style={{
                fontSize: 12,
                color: '#777',
                marginBottom: 12,
              }}
            >
              下方为样板数据，正式上线时可从数据库读取，并提供排序、启用 / 停用与编辑功能。
            </p>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              {mockAdminProducts.map((p) => (
                <article
                  key={p.id}
                  style={{
                    borderRadius: 8,
                    border: '1px solid #e5e5e5',
                    padding: 12,
                    background: '#fff',
                    fontSize: 13,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 6,
                    }}
                  >
                    <div>
                      <strong>{p.name}</strong>
                      <span style={{ marginLeft: 8, color: '#777' }}>（{p.category}）</span>
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        color: p.enabled ? '#0a7d32' : '#999',
                      }}
                    >
                      {p.enabled ? '前台显示中' : '已隐藏'}
                    </span>
                  </div>

                  <p
                    style={{
                      margin: 0,
                      fontSize: 13,
                      color: '#555',
                      lineHeight: 1.6,
                    }}
                  >
                    {p.brief}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      gap: 8,
                      marginTop: 10,
                      fontSize: 12,
                    }}
                  >
                    <button
                      type="button"
                      style={{
                        padding: '4px 10px',
                        borderRadius: 4,
                        border: '1px solid #333',
                        background: '#fff',
                        cursor: 'default',
                      }}
                    >
                      编辑（示意）
                    </button>
                    <button
                      type="button"
                      style={{
                        padding: '4px 10px',
                        borderRadius: 4,
                        border: '1px solid #c33',
                        background: '#fff',
                        color: '#c33',
                        cursor: 'default',
                      }}
                    >
                      删除（示意）
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
