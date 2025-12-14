// src/components/chat/adminStatus.ts
import { db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

/**
 * 設定客服在線 / 離線狀態
 * 這支 function 會更新 jyc_meta/adminStatus 這一筆
 */
export async function setAdminOnlineStatus(online: boolean) {
  try {
    await setDoc(
      doc(db, "jyc_meta", "adminStatus"),
      {
        online,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error("setAdminOnlineStatus error:", err);
  }
}
