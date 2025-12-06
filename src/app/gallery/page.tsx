// src/app/gallery/page.tsx
import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

type GalleryItem = {
  id: number;
  label: string;
};

type GallerySection = {
  title: string;
  description: string;
  items: GalleryItem[];
};

const sections: GallerySection[] = [
  {
    title: '设备展示',
    description: '无缝钢管机组、轧钢设备等主要设备外观与结构细节照片。',
    items: [
      { id: 1, label: '无缝钢管机组主视图' },
      { id: 2, label: '轧钢机架与传动系统' },
      { id: 3, label: '自动化控制柜与操作台' },
      { id: 4, label: '设备细节与工艺部位' },
    ],
  },
  {
    title: '生产线现场',
    description: '设备实际运行中的现场照片，包含产线布局与作业环境。',
    items: [
      { id: 5, label: '生产线整体布局' },
      { id: 6, label: '穿孔、轧制工段现场' },
      { id: 7, label: '冷床与输送系统' },
      { id: 8, label: '成品堆放与出货区' },
    ],
  },
  {
    title: '工程案例',
    description: '为不同客户规划与建置的典型工程案例，展示项目成果。',
    items: [
      { id: 9, label: '项目 A 机组交机现场' },
      { id: 10, label: '项目 B 产线验收' },
      { id: 11, label: '项目 C 客制设备细节' },
      { id: 12, label: '项目 D 综合改造前后对比' },
    ],
  },
  {
    title: '展会与交流',
    description: '公司参与行业展会与技术交流活动的照片。',
    items: [
      { id: 13, label: '行业展会展位' },
      { id: 14, label: '与客户技术交流' },
      { id: 15, label: '现场设备演示' },
      { id: 16, label: '团队合影与活动剪影' },
    ],
  },
];

export default function GalleryPage() {
  return (
    <main className="jyc-page">
      <Header />

      <section className="jyc-section">
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h1 style={{ fontSize: '26px', marginBottom: '12px' }}>图片集 / Gallery</h1>
          <p className="jyc-section-intro">
            以下为山西太矿钢管设备有限公司相关设备、生产线现场与工程案例之示意排版。
            实际上线时，可由后台上传与管理照片档案，并依类别进行归档呈现。
          </p>

          {sections.map((section) => (
            <div key={section.title} style={{ marginTop: 32 }}>
              <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>{section.title}</h2>
              <p
                style={{
                  fontSize: '14px',
                  color: '#666',
                  marginBottom: 12,
                  lineHeight: 1.6,
                }}
              >
                {section.description}
              </p>

              <div className="jyc-gallery-grid">
                {section.items.map((item) => (
                  <div key={item.id} className="jyc-gallery-item" style={{ position: 'relative' }}>
                    <span
                      style={{
                        position: 'absolute',
                        left: 8,
                        bottom: 8,
                        fontSize: 12,
                        color: '#555',
                        background: 'rgba(255,255,255,0.85)',
                        padding: '2px 6px',
                        borderRadius: 4,
                      }}
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
