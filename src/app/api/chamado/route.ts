import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, description, category, priority } = body;

    if (!name || !email || !subject || !description) {
      return NextResponse.json(
        { error: "Campos obrigatórios: name, email, subject, description" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 1. Create or find customer by email
    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("id")
      .eq("email", email)
      .single();

    let customerId = existingCustomer?.id;

    if (!customerId) {
      const { data: newCustomer } = await supabase
        .from("customers")
        .insert({
          name,
          email,
          phone: phone || null,
          company_id: "00000000-0000-0000-0000-000000000001", // Default company for public submissions
        })
        .select("id")
        .single();

      customerId = newCustomer?.id;
    }

    if (!customerId) {
      return NextResponse.json({ error: "Erro ao criar cliente" }, { status: 500 });
    }

    // 2. Create ticket
    const { data: ticket, error } = await supabase
      .from("tickets")
      .insert({
        company_id: "00000000-0000-0000-0000-000000000001",
        customer_id: customerId,
        created_by: null, // Public form, no user
        subject,
        description,
        category: category || "other",
        priority: priority || "medium",
        source: "public_form",
        status: "open",
      })
      .select("id")
      .single();

    if (error) {
      console.error("Ticket create error:", error);
      return NextResponse.json(
        { error: "Erro ao criar chamado" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, ticketId: ticket.id });
  } catch (err) {
    console.error("Public ticket API error:", err);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
