"use client";

import { useState } from "react";

export default function AIReport() {
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function generateReport() {
    setLoading(true);
    setReport("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content:
                '请生成一份完整的AI财务体检报告，包含以下部分：\n1. 近期消费人设（一句话人设标签+简短解释）\n2. 收支健康度（收支比评估、储蓄率）\n3. 消费结构诊断（固定vs可控、最大可控类别）\n4. 隐藏的"漏水点"（拿铁因子、订阅蠕变、冲动消费）\n5. 行为洞察（工作日vs周末、消费速度趋势）\n6. 旅行消费复盘（如有）\n7. Top 3 优化建议（具体、可操作、附预估节省金额）',
            },
          ],
        }),
      });

      if (!res.ok) throw new Error("Failed");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let content = "";

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        content += decoder.decode(value, { stream: true });
        setReport(content);
      }
    } catch {
      setReport("Failed to generate report. Please check your API key.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-sand/30 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-dark-blue">AI Financial Health Report</h2>
          <p className="text-sm text-slate-blue">Powered by Claude</p>
        </div>
        <button
          onClick={generateReport}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-slate-blue text-white text-sm font-medium hover:bg-dark-blue disabled:opacity-40 transition-colors"
        >
          {loading ? "Generating..." : report ? "Regenerate" : "Generate Report"}
        </button>
      </div>

      {report && (
        <div className="bg-cream/50 rounded-xl p-5 text-sm whitespace-pre-wrap leading-relaxed max-h-[600px] overflow-auto">
          {report}
        </div>
      )}
    </div>
  );
}
