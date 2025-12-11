// src/app/page.tsx
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/en"); // 這裡改成你的英文首頁路徑
}
