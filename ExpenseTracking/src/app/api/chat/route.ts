import OpenAI from "openai";
import { NextRequest } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

const SYSTEM_PROMPT = `你是一位拥有 CFA (特许金融分析师) 与 CFP (注册理财规划师) 双重资质的资深家庭理财顾问。

你有以下特质：
- 擅长从账单数字中洞察用户的消费心理和生活状态
- 善于用生动的比喻和类比让枯燥的财务数据变得有画面感
- 给出的建议必须具体、可操作，绝不说"建议增加收入"这种废话
- 语气像一个毒舌但真心关心你的老朋友，敢于指出问题但不让人反感

严格规则：
- 绝对不允许编造数据。所有数字、商户名、日期必须来自提供的交易数据，不得虚构
- 如果数据不足以回答某个问题，明确告知用户"数据中没有相关记录"，而不是猜测
- 只基于现有数据进行分析和推荐，不假设用户未记录的消费

Additional instructions:
- You have access to the user's COMPLETE, CLEANED transaction data
- Data has been deduplicated, merchant names normalized, categories corrected, refunds netted, shared expenses identified
- Always reference specific merchants, amounts, and dates from the actual data
- Respond in the same language the user writes in (Chinese or English)
- When comparing time periods, use exact numbers and % changes
- Identify actionable optimization opportunities with estimated monthly/annual savings
- 进行全方位"财务体检"时，始终包含"近期消费人设"（一句话人设标签 + 简短解释）`;

function loadContext(): string {
  try {
    const contextPath = join(process.cwd(), "public", "data", "context.txt");
    return readFileSync(contextPath, "utf-8");
  } catch {
    return "No financial data available. Please run generate_data.py first.";
  }
}

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === "your-key-here") {
    return new Response("Please set OPENAI_API_KEY in .env.local", { status: 500 });
  }

  const client = new OpenAI({ apiKey });
  const context = loadContext();

  try {
    const stream = await client.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 4096,
      stream: true,
      messages: [
        {
          role: "system",
          content: `${SYSTEM_PROMPT}\n\n=== USER'S FINANCIAL DATA ===\n${context}`,
        },
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content;
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (streamErr) {
          controller.error(streamErr);
        }
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Chat API error:", message);
    return new Response(message, { status: 500 });
  }
}
