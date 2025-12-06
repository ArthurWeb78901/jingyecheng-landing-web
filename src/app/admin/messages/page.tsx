// src/app/admin/messages/page.tsx
import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

type Message = {
  id: number;
  name: string;
  company?: string;
  createdAt: string;
  content: string;
};

const mockMessages: Message[] = [
  {
    id: 1,
    name: '张先生',
    company: '某钢管厂',
    createdAt: '2025-03-12',
    content: '目前规划新增一条中小规格无缝钢管生产线，想了解完整机组配置与现场勘查服务。',
  },
  {
    id: 2,
    name: '李工程师',
    company: '设备技术部',
    createdAt: '2025-02-28',
    content: '现有产线部分设备年限较久，想评估局部改造与自动化升级的可行性与预算范围。',
  },
  {
    id: 3,
    name: '王经理',
    createdAt: '2025-01-15',
    content: '近期有参加行业展会计划，想了解公司是否有现场展示或技术交流活动安排。',
  },
];

export default function AdminMessagesPage() {
  return (
    <main className="jyc-page">
      <Header />

      <section className="jyc-section jyc-section-alt">
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>留言管理（内部）</h1>
          <p className="jyc-section-intro">
            本页面仅供公司内部人员使用，用于浏览与管理通过网站提交的在线留言。
            正式上线后，可将资料改为从数据库读取，并依处理状态进行筛选与标记。
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
            {mockMessages.map((msg) => (
              <article
                key={msg.id}
                style={{
                  borderRadius: 8,
                  border: '1px solid #e5e5e5',
                  padding: 16,
                  background: '#fff',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 6,
                    fontSize: 13,
                    color: '#555',
                  }}
                >
                  <div>
                    <strong>{msg.name}</strong>
                    {msg.company ? <span style={{ marginLeft: 8 }}>｜{msg.company}</span> : null}
                  </div>
                  <span style={{ color: '#999', fontSize: 12 }}>{msg.createdAt}</span>
                </div>

                <p
                  style={{
                    fontSize: 14,
                    color: '#444',
                    lineHeight: 1.7,
                    margin: 0,
                  }}
                >
                  {msg.content}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
