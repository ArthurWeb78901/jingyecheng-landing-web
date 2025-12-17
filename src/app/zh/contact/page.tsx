// src/app/contact/page.tsx
import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function ContactPage() {
  return (
    <main className="jyc-page">
      <Header />

      {/* 公开的联络表单（留言内容仅内部可见，不对外展示） */}
      <section className="jyc-section jyc-section-alt">
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h1 style={{ fontSize: '26px', marginBottom: '12px' }}>在线留言 / 联系我们</h1>
          <p className="jyc-section-intro">
            欢迎在此留下您的需求与问题，我们会尽快安排相关人员与您联系。
            您填写的资料与留言内容仅供公司内部业务与技术人员查阅，不会公开展示在网站上。
          </p>

          <form className="jyc-contact-form">
            <div className="jyc-form-row">
              <input type="text" placeholder="姓名（必填）" />
              <input type="text" placeholder="公司 / 单位（选填）" />
            </div>
            <div className="jyc-form-row">
              <input type="email" placeholder="Email（建议填写，方便回复）" />
              <input type="tel" placeholder="电话 / 手机（选填）" />
            </div>
            <textarea rows={4} placeholder="请输入您的需求或问题…" />

            <button
              type="button"
              className="jyc-btn-primary jyc-contact-submit"
              style={{ marginTop: 8 }}
            >
              提交留言
            </button>

            <p
              style={{
                fontSize: 12,
                color: '#888',
                marginTop: 8,
              }}
            >
              ※ 当前为示意页面，提交按钮尚未连接后台系统。正式上线时，可将留言写入数据库并通知相关人员处理。
            </p>
          </form>
        </div>
      </section>

      <Footer />
    </main>
  );
}
