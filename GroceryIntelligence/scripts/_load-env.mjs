import fs from "node:fs";
import path from "node:path";

/**
 * Minimal .env.local loader — avoids adding dotenv as a dep.
 * Returns a plain object AND mutates process.env.
 */
export function loadEnv() {
  const p = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(p)) return {};
  const content = fs.readFileSync(p, "utf8");
  const env = {};
  for (const raw of content.split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    env[key] = val;
    process.env[key] = val;
  }
  return env;
}
