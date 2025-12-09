// src/lib/adminStatus.ts
import { db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

/**
 * 后台登入后，标记管理员为在线
 */
export async function markAdminOnline() {
  const ref = doc(db, "jyc_meta", "adminStatus");
  await setDoc(
    ref,
    {
      online: true,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

/**
 * 后台登出时，标记管理员为离线
 * （之後你在 /admin 页面做登出按钮时会用到）
 */
export async function markAdminOffline() {
  const ref = doc(db, "jyc_meta", "adminStatus");
  await setDoc(
    ref,
    {
      online: false,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}
