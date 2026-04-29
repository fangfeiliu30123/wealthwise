import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export interface W2Data {
  grossIncome?: number;
  federalTaxWithheld?: number;
  stateTaxWithheld?: number;
  socialSecurityWages?: number;
  medicareWages?: number;
  state?: string;
  employer?: string;
  year?: number;
}

interface W2UploadProps {
  onExtracted: (data: W2Data[]) => void;
  onSkip: () => void;
  maxFiles?: number;
}

const compressImage = (file: File, maxWidth = 1600, quality = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxWidth / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", quality);
      resolve(dataUrl.split(",")[1]);
    };
    img.onerror = reject;
    img.src = url;
  });
};

const W2Upload = ({ onExtracted, onSkip, maxFiles = 3 }: W2UploadProps) => {
  const [uploads, setUploads] = useState<Array<{
    fileName: string;
    status: "uploading" | "processing" | "done" | "error";
    data?: W2Data;
    errorMsg?: string;
  }>>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File): Promise<W2Data> => {
    const validTypes = ["image/png", "image/jpeg", "image/webp", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      throw new Error("Please upload a PNG, JPG, or PDF file");
    }
    if (file.size > 4 * 1024 * 1024) {
      throw new Error("File must be under 4MB");
    }

    let base64: string;
    let mimeType = file.type;

    if (file.type.startsWith("image/")) {
      base64 = await compressImage(file);
      mimeType = "image/jpeg";
    } else {
      base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    const { data, error } = await supabase.functions.invoke("parse-w2", {
      body: { fileBase64: base64, mimeType, fileName: file.name },
    });

    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return data.extracted;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remaining = maxFiles - uploads.filter(u => u.status === "done").length;
    const toProcess = files.slice(0, remaining);

    setIsProcessing(true);

    for (const file of toProcess) {
      const idx = uploads.length + toProcess.indexOf(file);

      setUploads(prev => [...prev, { fileName: file.name, status: "processing" }]);

      try {
        const extracted = await processFile(file);
        setUploads(prev => prev.map((u, i) =>
          i === idx ? { ...u, status: "done" as const, data: extracted } : u
        ));
      } catch (err: any) {
        setUploads(prev => prev.map((u, i) =>
          i === idx ? { ...u, status: "error" as const, errorMsg: err.message } : u
        ));
      }
    }

    setIsProcessing(false);
    // Reset input so user can select again
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeUpload = (idx: number) => {
    setUploads(prev => prev.filter((_, i) => i !== idx));
  };

  const doneUploads = uploads.filter(u => u.status === "done" && u.data);

  const handleConfirm = () => {
    const allData = doneUploads.map(u => u.data!);
    onExtracted(allData);
  };

  const canAddMore = doneUploads.length < maxFiles && !isProcessing;

  return (
    <div className="space-y-6">
      {/* Uploaded files list */}
      {uploads.length > 0 && (
        <div className="space-y-3">
          {uploads.map((upload, i) => (
            <div key={i} className="glass-card rounded-lg p-4 flex items-center gap-3">
              {upload.status === "processing" && (
                <Loader2 size={18} className="text-primary animate-spin shrink-0" />
              )}
              {upload.status === "done" && (
                <CheckCircle2 size={18} className="text-primary shrink-0" />
              )}
              {upload.status === "error" && (
                <AlertCircle size={18} className="text-destructive shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{upload.fileName}</p>
                {upload.status === "done" && upload.data && (
                  <p className="text-xs text-muted-foreground">
                    {upload.data.employer && `${upload.data.employer} · `}
                    {upload.data.grossIncome != null && `$${upload.data.grossIncome.toLocaleString()}`}
                    {upload.data.year && ` (${upload.data.year})`}
                  </p>
                )}
                {upload.status === "error" && (
                  <p className="text-xs text-destructive">{upload.errorMsg}</p>
                )}
                {upload.status === "processing" && (
                  <p className="text-xs text-muted-foreground">AI is reading your W-2...</p>
                )}
              </div>
              {upload.status !== "processing" && (
                <button onClick={() => removeUpload(i)} className="text-muted-foreground hover:text-foreground">
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload area */}
      {canAddMore && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="glass-card rounded-xl p-8 border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer text-center"
        >
          <Upload size={36} className="mx-auto mb-3 text-muted-foreground" />
          <p className="font-medium mb-1">
            {uploads.length === 0
              ? "Upload W-2s, tax returns, or pay stubs"
              : `Add another document (${doneUploads.length}/${maxFiles})`}
          </p>
          <p className="text-sm text-muted-foreground">PNG, JPG, or PDF — up to 4MB each</p>
          <p className="text-xs text-muted-foreground mt-1">
            AI extracts income and tax data from W-2s, 1040s, or pay stubs automatically
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,application/pdf"
        onChange={handleFileChange}
        multiple
        className="hidden"
      />

      {/* Average income summary */}
      {doneUploads.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card rounded-lg p-4 text-center"
        >
          <p className="text-sm text-muted-foreground mb-1">Average income across {doneUploads.length} W-2{doneUploads.length > 1 ? "s" : ""}</p>
          <p className="text-2xl font-heading font-bold gold-text">
            ${Math.round(
              doneUploads.reduce((sum, u) => sum + (u.data?.grossIncome || 0), 0) / doneUploads.length
            ).toLocaleString()}
          </p>
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {doneUploads.length > 0 && (
          <button
            onClick={handleConfirm}
            className="flex-1 px-6 py-3 rounded-lg gold-gradient text-primary-foreground font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <FileText size={18} />
            Use This Data
          </button>
        )}
        <button
          onClick={onSkip}
          className={`px-6 py-3 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors ${
            doneUploads.length === 0 ? "flex-1 text-center" : ""
          }`}
        >
          {doneUploads.length === 0 ? "Skip — I'll enter my details manually" : "Skip"}
        </button>
      </div>
    </div>
  );
};

export default W2Upload;