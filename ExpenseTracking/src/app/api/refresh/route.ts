import { NextResponse } from "next/server";
import { execFile } from "child_process";
import { existsSync } from "fs";
import { join } from "path";

export const dynamic = "force-dynamic";

export async function POST() {
  const cwd = process.cwd();
  const script = join(cwd, "generate_data.py");

  // Prefer the project's virtual environment Python over system Python,
  // so that dependencies like pandas are available.
  const venvPython = join(cwd, ".venv", "bin", "python3");
  const python = existsSync(venvPython) ? venvPython : "python3";

  return new Promise<NextResponse>((resolve) => {
    execFile(python, [script], { cwd, timeout: 120_000 }, (err, stdout, stderr) => {
      if (err) {
        resolve(
          NextResponse.json(
            { ok: false, error: stderr || err.message },
            { status: 500 }
          )
        );
      } else {
        resolve(NextResponse.json({ ok: true, output: stdout }));
      }
    });
  });
}
