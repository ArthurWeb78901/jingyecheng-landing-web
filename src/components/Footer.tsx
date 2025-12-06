// src/components/Footer.tsx
import React from 'react';

export function Footer() {
  return (
    <footer className="jyc-footer">
      <div>© {new Date().getFullYear()} 山西太矿钢管设备有限公司. All rights reserved.</div>
      <div className="jyc-footer-sub">
        地址：山西省太原市百花谷　电话：0351-2028121　邮箱：sxtkgg@aliyun.com
      </div>
    </footer>
  );
}
