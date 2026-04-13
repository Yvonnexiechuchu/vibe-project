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
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      setPreview(url);
      const data = url.split(",")[1] ?? "";
      setBase64(data);
      setMimeType(f.type || "image/jpeg");
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

      <div className="px-6 mt-2">
        <p className="text-body text-[var(--ink-800)]">
          Take a clear photo or upload a screenshot. I&apos;ll auto-read every
          line, detect the store, and build your checklist.
        </p>
      </div>

      <div className="px-6 mt-6">
        {!preview ? (
          <div className="aspect-[3/4] ink-border rounded-[16px] bg-[var(--ink-100)] flex items-center justify-center">
            <div className="text-center">
              <div className="inline-flex w-16 h-16 rounded-[16px] ink-border bg-white items-center justify-center">
                <CameraIcon size={28} />
              </div>
              <p className="text-h3 mt-4">No photo yet</p>
              <p className="text-meta text-[var(--ink-800)] mt-1">
                Pick a source below
              </p>
            </div>
          </div>
        ) : (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Receipt preview"
              className="w-full max-h-[62vh] object-contain rounded-[16px] ink-border bg-white"
            />
            <button
              onClick={() => {
                setPreview(null);
                setBase64(null);
                if (fileRef.current) fileRef.current.value = "";
                if (cameraRef.current) cameraRef.current.value = "";
              }}
              className="absolute top-3 right-3 w-10 h-10 rounded-full ink-border bg-white ink-shadow flex items-center justify-center"
              aria-label="Remove"
            >
              <XIcon />
            </button>
          </div>
        )}
      </div>

      {err && (
        <div className="px-6 mt-4">
          <Card color="red" padded>
            <p className="text-h3">Parse failed</p>
            <p className="text-meta mt-1">{err}</p>
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
            <CameraIcon size={20} />
            Camera
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={() => fileRef.current?.click()}
          >
            <UploadIcon size={20} />
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
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />

      <div className="h-10" />
    </Screen>
  );
}
