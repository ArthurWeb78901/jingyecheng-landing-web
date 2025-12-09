// src/components/Footer.tsx
import React from 'react';

export function Footer() {
  return (
    <footer className="jyc-footer">
      <div>© {new Date().getFullYear()} 太原精业城重工设备有限公司 All rights reserved.</div>
      <div className="jyc-footer-sub">
        地址：山西省太原市百花谷　电话：0351-2028121　邮箱：Wendy@jycsteelequip.com
      </div>
    </footer>
  );
}
