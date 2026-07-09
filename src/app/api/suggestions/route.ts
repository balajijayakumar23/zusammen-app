import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";
import { monthName } from "@/lib/birthday";
import type { ActivitySuggestion } from "@/lib/types";
import { z } from "zod";

const schema = z.object({ friendId: z.string() });
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function fetchSuggestions(
  city: string,
  hobby: string,
  month: number
): Promise<ActivitySuggestion[]> {
  const prompt = `Suggest 5 group activity ideas for a birthday celebration in ${city} during ${monthName(month)}.
The birthday person's hobby is ${hobby}.
For each activity return ONLY strict JSON with this structure (no markdown, no extra text):
[
  {
    "title": "string",
    "description": "string (2-3 sentences)",
    "venue": "string (type of venue/location to search for)",
    "whyItFits": "string (1 sentence explaining the hobby connection)",
    "seasonalNote": "string (1 sentence for ${monthName(month)})"
  }
]`;

  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1500,
    messages: [{ role: "user", content: prompt }],
  });

  const text = msg.content[0].type === "text" ? msg.content[0].text : "";
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error("Invalid AI response format");
  return JSON.parse(jsonMatch[0]) as ActivitySuggestion[];
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Invalid request" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.groupId) return Response.json({ error: "No group" }, { status: 400 });

  const friend = await prisma.friend.findUnique({ where: { id: parsed.data.friendId } });
  if (!friend || friend.groupId !== user.groupId) {
    return Response.json({ error: "Friend not found" }, { status: 404 });
  }

  const month = friend.dateOfBirth.getMonth();

  try {
    const suggestions = await fetchSuggestions(friend.city, friend.hobby, month);
    return Response.json(suggestions);
  } catch {
    // retry once
    try {
      const suggestions = await fetchSuggestions(friend.city, friend.hobby, month);
      return Response.json(suggestions);
    } catch (err2) {
      const msg = err2 instanceof Error ? err2.message : "Unknown error";
      return Response.json(
        { error: "Could not generate suggestions. Please try again shortly.", detail: msg },
        { status: 502 }
      );
    }
  }
}
