import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { companyName, clientName, clientEmail, message } = await request.json();

    if (!companyName || !clientName || !clientEmail) {
      return NextResponse.json({ error: "Fields required" }, { status: 400 });
    }

    const supabase = await createClient();

    // Find company by name or slug
    let companyId: string | null = null;
    const { data: company } = await supabase
      .from("companies")
      .select("id")
      .eq("name", companyName)
      .single();
    companyId = company?.id;

    if (!companyId) {
      // Fall back to first active company
      const { data: fallback } = await supabase
        .from("companies")
        .select("id")
        .eq("is_active", true)
        .single();
      companyId = fallback?.id;
    }

    if (!companyId) {
      return NextResponse.json({ error: "No company found" }, { status: 404 });
    }

    // Create or find customer
    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("id")
      .eq("email", clientEmail)
      .single();

    let customerId = existingCustomer?.id;

    if (!customerId) {
      const { data: newCustomer } = await supabase
        .from("customers")
        .insert({ name: clientName, email: clientEmail, company_id: companyId })
        .select("id")
        .single();
      customerId = newCustomer?.id;
    }

    // Create ticket
    const { data: ticket, error } = await supabase
      .from("tickets")
      .insert({
        company_id: companyId,
        customer_id: customerId,
        subject: `Chat - ${clientName}`,
        description: message || "Olá, preciso de suporte.",
        status: "open",
        priority: "medium",
        category: "other",
        source: "public_form",
      })
      .select("id")
      .single();

    if (error) {
      console.error("Ticket create error:", error);
      return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 });
    }

    return NextResponse.json({ ticketId: ticket.id });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
