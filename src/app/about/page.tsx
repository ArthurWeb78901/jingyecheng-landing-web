// src/app/about/page.tsx
import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function AboutPage() {
  return (
    <main className="jyc-page">
      <Header />

      {/* 公司简介内容 */}
      <section className="jyc-section jyc-section-alt">
        <div style={{ maxWidth: 920, margin: '0 auto' }}>
          <h1 style={{ fontSize: '26px', marginBottom: '12px' }}>
            山西太矿钢管设备有限公司
          </h1>

          <p className="jyc-section-intro">
            山西太矿钢管设备有限公司成立于 1993 年，总占地面积 7 万平方米，公司位于能源重化工城市——山西省太原市，
            是一家专业从事轧钢设备的重工企业。公司按照专业经营的发展战略，以无缝钢管机组设备的制造为主，
            集设计、生产、经营于一体，为客户提供完善的服务。
          </p>

          {/* 主要产品与服务 */}
          <section style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>主要产品与服务</h2>
            <ul
              style={{
                paddingLeft: 18,
                fontSize: '14px',
                color: '#555',
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              <li>无缝钢管机组设备及相关轧钢设备的设计与制造。</li>
              <li>根据客户需求提供整线方案规划与技术支持。</li>
              <li>设备安装调试、操作培训与售后维护服务。</li>
              <li>设备升级改造、产线优化方案等增值服务。</li>
            </ul>
          </section>

          {/* 联系方式 */}
          <section style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>联系方式</h2>
            <p style={{ fontSize: '14px', color: '#555', lineHeight: 1.8, marginBottom: 8 }}>
              地址：山西省太原市百花谷
              <br />
              电话：0351-2028121
              <br />
              邮箱：sxtkgg@aliyun.com
            </p>
            <p style={{ fontSize: '12px', color: '#888', marginTop: 4 }}>
              版权所有：山西太矿钢管设备有限公司　晋ICP备07000249号-1
            </p>
          </section>
        </div>
      </section>

      <Footer />
    </main>
  );
}
