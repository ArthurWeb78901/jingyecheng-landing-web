// src/app/products/page.tsx
import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

type Product = {
  model: string;
  name: string;
  brief: string;
  features: string[];
};

const products: Product[] = [
  {
    model: '无缝钢管机组',
    name: '无缝钢管生产机组',
    brief: '用于生产各类规格无缝钢管的成套机组设备，结构扎实、运行稳定。',
    features: [
      '可依钢管规格与产量需求客制机组配置',
      '适用于多种钢级与应用领域',
      '整线考虑加热、穿孔、轧制、冷却等工艺环节',
    ],
  },
  {
    model: '轧钢设备',
    name: '轧钢生产线设备',
    brief: '适用于多种钢材成型的轧机与配套设备，可依工艺需求规划整线。',
    features: [
      '支持不同机架形式与轧制方式',
      '可与切割、冷床、输送等设备整合',
      '适合热轧、定径等多种工段应用',
    ],
  },
  {
    model: '精整线',
    name: '精整与后处理设备',
    brief: '配合无缝钢管与轧制产品的后段精整与检测，提升产品质量。',
    features: [
      '可配置矫直、探伤、测长、打包等单元',
      '依据客户工艺需求进行模块化组合',
      '提升出厂产品一致性与可追溯性',
    ],
  },
];

export default function ProductsPage() {
  return (
    <main className="jyc-page">
      <Header />

      {/* 产品列表主体 */}
      <section className="jyc-section">
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <h1 style={{ fontSize: '26px', marginBottom: '8px' }}>产品与设备一览</h1>
          <p className="jyc-section-intro">
            以下为山西太矿钢管设备有限公司主要产品方向，实际机组配置与详细技术规格可依现场工艺、
            产量与设备布局需求客制，最终以正式技术方案与报价文件为准。
          </p>

          <div className="jyc-card-grid">
            {products.map((p) => (
              <article key={p.model} className="jyc-card">
                <div className="jyc-card-image" />
                <h2 style={{ fontSize: '18px', marginBottom: '4px' }}>{p.name}</h2>
                <div
                  style={{
                    fontSize: '13px',
                    color: '#999',
                    marginBottom: '8px',
                  }}
                >
                  类别：{p.model}
                </div>
                <p style={{ fontSize: '14px', color: '#555', marginBottom: '10px' }}>{p.brief}</p>

                <ul
                  style={{
                    paddingLeft: '18px',
                    margin: '0 0 12px 0',
                    fontSize: '13px',
                    color: '#555',
                    lineHeight: 1.6,
                  }}
                >
                  {p.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>

                <button type="button" className="jyc-card-btn">
                  询问此类设备
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
