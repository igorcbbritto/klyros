import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { subject, description } = await request.json();

    if (!subject && !description) {
      return NextResponse.json(
        { error: "subject or description is required" },
        { status: 400 }
      );
    }

    const aiUrl = process.env.AI_API_URL || "https://api.groq.com/openai/v1";
    const apiKey = process.env.AI_API_KEY;
    const model = process.env.AI_MODEL || "llama-3.3-70b-versatile";

    if (!apiKey) {
      return NextResponse.json(
        { error: "AI_API_KEY not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(`${aiUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: `You are a help desk ticket classifier. Analyze the ticket and return a JSON object with:
  - "category": one of "technical", "billing", "sales", "feedback", "other"
  - "priority": one of "low", "medium", "high", "urgent"
  - "classification": a brief description in Brazilian Portuguese of what the ticket is about
  - "suggestedResponse": a helpful response suggestion in Brazilian Portuguese, max 150 characters

  Return ONLY the JSON object, no markdown, no explanation.`,
          },
          {
            role: "user",
            content: `Subject: ${subject}\nDescription: ${description}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      console.error("AI API error:", await response.text());
      return NextResponse.json(
        { error: "Failed to get AI classification" },
        { status: 502 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";

    // Parse the AI response
    let classification;
    try {
      classification = JSON.parse(content);
    } catch {
      classification = {
        category: "other",
        priority: "medium",
        classification: "Não foi possível classificar automaticamente",
        suggestedResponse: null,
      };
    }

    return NextResponse.json(classification);
  } catch (error) {
    console.error("AI classification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
