// src/app/api/jyc/messages/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";

type MessageStatus = "new" | "in_progress" | "closed";

type IncomingMessage = {
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  content: string;
  source?: "contact-form" | "chatbot";
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as IncomingMessage;

    if (!body.name || !body.content) {
      return NextResponse.json(
        { error: "name and content are required" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const docRef = await db.collection("jyc_messages").add({
      name: body.name,
      company: body.company || null,
      email: body.email || null,
      phone: body.phone || null,
      content: body.content,
      source: body.source || "contact-form",
      status: "new" as MessageStatus,
      createdAt: now,
    });

    return NextResponse.json({ id: docRef.id }, { status: 201 });
  } catch (err) {
    console.error("Create jyc message error", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

export async function GET() {
  // 给后台用的列表接口（之后 Admin 页会用到）
  try {
    const snap = await db
      .collection("jyc_messages")
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();

    const data = snap.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as any),
    }));

    return NextResponse.json(data);
  } catch (err) {
    console.error("List jyc messages error", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
