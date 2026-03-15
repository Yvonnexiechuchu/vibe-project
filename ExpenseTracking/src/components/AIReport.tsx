"use client";

import { useState, useMemo } from "react";

interface AIReportProps {
  dateRangeEnd: string; // YYYY-MM-DD from summary
}

function lastCompleteMonth(maxDate: string) {
  const [y, m] = maxDate.slice(0, 7).split("-").map(Number);
  const lastDay = new Date(y, m, 0).getDate();
  const isComplete = +maxDate.slice(8) >= lastDay;
  if (isComplete) return { y, m };
  const d = new Date(y, m - 2, 1);
  return { y: d.getFullYear(), m: d.getMonth() + 1 };
}

const MO = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function AIReport({ dateRangeEnd }: AIReportProps) {
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const reportMonth = useMemo(() => {
    const { y, m } = lastCompleteMonth(dateRangeEnd);
    const start = `${y}-${String(m).padStart(2, "0")}-01`;
    const end = `${y}-${String(m).padStart(2, "0")}-${String(new Date(y, m, 0).getDate()).padStart(2, "0")}`;
    const label = `${MO[m - 1]} ${y}`;
    return { start, end, label };
  }, [dateRangeEnd]);

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
                `请基于 ${reportMonth.start} 至 ${reportMonth.end} (${reportMonth.label}) 这一个月的交易数据，生成一份完整的AI财务体检报告，包含以下部分：\n` +
                '1. 近期消费人设（一句话人设标签+简短解释）\n' +
                '2. 收支健康度（收支比评估、储蓄率）\n' +
                '3. 消费结构诊断（固定vs可控、最大可控类别）\n' +
                '4. 隐藏的"漏水点"（拿铁因子、订阅蠕变、冲动消费）\n' +
                '5. 行为洞察（工作日vs周末、消费速度趋势）\n' +
                '6. 旅行消费复盘（如有）\n' +
                '7. Top 3 优化建议（具体、可操作、附预估节省金额）\n\n' +
                `重要：报告必须仅基于 ${reportMonth.label} 的数据，忽略其他月份的交易。`,
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

      {/* Report period badge */}
      <div className="mb-3 inline-flex items-center gap-1.5 bg-[#F2E8D5] text-[#5A7394] text-xs font-medium px-3 py-1 rounded-full">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Report period: {reportMonth.label} ({reportMonth.start} to {reportMonth.end})
      </div>

      {report && (
        <div className="bg-cream/50 rounded-xl p-5 text-sm whitespace-pre-wrap leading-relaxed max-h-[600px] overflow-auto">
          {report}
        </div>
      )}
    </div>
  );
}
