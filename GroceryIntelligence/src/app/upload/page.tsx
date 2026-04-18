"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { TopBar } from "@/components/ui/TopBar";
import { CameraIcon, UploadIcon, XIcon } from "@/components/Icon";
import { parseReceipt } from "@/lib/client-api";
import { saveSession } from "@/lib/receipt-session";

const SUPPORTED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const ACCEPT = "image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif";

function normalizeMime(raw: string): string {
  const t = raw.toLowerCase().trim();
  if (t === "image/jpg") return "image/jpeg";
  if (SUPPORTED_TYPES.has(t)) return t;
  return "image/jpeg";
}

export default function UploadPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [base64, setBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("image/jpeg");
  const [parsing, setParsing] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onFile(f: File) {
    setErr(null);
    const raw = f.type?.toLowerCase() || "";
    if (
      raw.includes("heic") ||
      raw.includes("heif") ||
      f.name.toLowerCase().endsWith(".heic") ||
      f.name.toLowerCase().endsWith(".heif")
    ) {
      setErr(
        "HEIC/HEIF is not supported. Please convert to JPG first (Preview → File → Export as JPEG), or take a screenshot of the receipt instead."
      );
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      setPreview(url);
      const data = url.split(",")[1] ?? "";
      setBase64(data);
      setMimeType(normalizeMime(raw));
    };
    reader.readAsDataURL(f);
  }

  async function onParse() {
    if (!base64) return;
    setParsing(true);
    setErr(null);
    try {
      const parsed = await parseReceipt(base64, mimeType);
      saveSession(parsed);
      router.push("/review");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Parse failed";
      setErr(msg);
      setParsing(false);
    }
  }

  return (
    <Screen nav={false}>
      <TopBar showBack title="New receipt" />

      <div className="px-6 mt-1">
        <p className="text-body text-[var(--ink-50)]">
          Take a clear photo or upload a screenshot. I&apos;ll parse every line
          and build your checklist.
        </p>
      </div>

      <div className="px-6 mt-6">
        {!preview ? (
          <div className="aspect-[3/4] rounded-[var(--radius-2xl)] bg-white border border-dashed border-[var(--ink-15)] flex items-center justify-center">
            <div className="text-center px-6">
              <div className="inline-flex w-16 h-16 rounded-[16px] bg-[var(--ink-04)] items-center justify-center">
                <CameraIcon size={28} className="text-[var(--ink-30)]" />
              </div>
              <p className="text-h3 mt-4 text-[var(--ink-50)]">No photo yet</p>
              <p className="text-meta text-[var(--ink-30)] mt-1">
                Supported: JPG, PNG, WebP, GIF
              </p>
            </div>
          </div>
        ) : (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Receipt preview"
              className="w-full max-h-[62vh] object-contain rounded-[var(--radius-2xl)] bg-white border border-[var(--ink-15)] shadow-[var(--shadow-card)]"
            />
            <button
              onClick={() => {
                setPreview(null);
                setBase64(null);
                if (fileRef.current) fileRef.current.value = "";
                if (cameraRef.current) cameraRef.current.value = "";
              }}
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur border border-[var(--ink-15)] shadow-[var(--shadow-sm)] flex items-center justify-center transition-transform active:scale-95"
              aria-label="Remove"
            >
              <XIcon size={18} />
            </button>
          </div>
        )}
      </div>

      {err && (
        <div className="px-6 mt-4">
          <Card color="cream" padded>
            <p className="text-h3 text-[var(--terracotta)]">Upload issue</p>
            <p className="text-meta text-[var(--ink-50)] mt-1">{err}</p>
          </Card>
        </div>
      )}

      <div className="px-6 mt-6 flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={() => cameraRef.current?.click()}
          >
            <CameraIcon size={18} />
            Camera
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={() => fileRef.current?.click()}
          >
            <UploadIcon size={18} />
            Upload
          </Button>
        </div>

        <Button
          variant="fill"
          size="lg"
          block
          disabled={!base64 || parsing}
          onClick={onParse}
        >
          {parsing ? "Reading receipt…" : "Parse with AI"}
        </Button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />
      <input
        ref={cameraRef}
        type="file"
        accept={ACCEPT}
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />

      <div className="h-8" />
    </Screen>
  );
}
