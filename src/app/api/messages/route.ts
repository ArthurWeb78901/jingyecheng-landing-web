// src/app/api/messages/route.ts
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

    const now = new Date();

    const docRef = await db.collection("messages").add({
      name: body.name,
      company: body.company || null,
      email: body.email || null,
      phone: body.phone || null,
      content: body.content,
      source: body.source || "contact-form",
      status: "new" as MessageStatus,
      createdAt: now.toISOString(), // 前端好處理；要 serverTimestamp 也可以再加一個欄位
    });

    return NextResponse.json({ id: docRef.id }, { status: 201 });
  } catch (err) {
    console.error("Create message error", err);
    return NextResponse.json(
      { error: "internal_error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const snapshot = await db
      .collection("messages")
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();

    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as any),
    }));

    return NextResponse.json(messages);
  } catch (err) {
    console.error("List messages error", err);
    return NextResponse.json(
      { error: "internal_error" },
      { status: 500 }
    );
  }
}
