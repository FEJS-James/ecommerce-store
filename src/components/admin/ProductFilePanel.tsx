'use client';

import { useState, useCallback, useRef } from 'react';
import { FileText, FileArchive, ImageIcon, File, Upload, Trash2, RefreshCw } from 'lucide-react';

interface ProductFilePanelProps {
  productId: string;
  fileName: string | null;
  fileUrl: string | null;
  fileSizeBytes: number;
  onFileChange: () => void;
}

const ACCEPT = '.pdf,.zip,.xlsx,.csv,.txt,.md,.png,.jpg,.jpeg';

function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function getFileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'pdf') return <FileText className="w-8 h-8 text-red-400" />;
  if (ext === 'zip') return <FileArchive className="w-8 h-8 text-yellow-400" />;
  if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext))
    return <ImageIcon className="w-8 h-8 text-blue-400" />;
  return <File className="w-8 h-8 text-zinc-400" />;
}

export default function ProductFilePanel({
  productId,
  fileName,
  fileUrl,
  fileSizeBytes,
  onFileChange,
}: ProductFilePanelProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      setUploading(true);
      setError(null);
      setProgress(0);

      try {
        const formData = new FormData();
        formData.append('file', file);

        const xhr = new XMLHttpRequest();
        await new Promise<void>((resolve, reject) => {
          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              setProgress(Math.round((e.loaded / e.total) * 100));
            }
          });
          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
            } else {
              const body = JSON.parse(xhr.responseText);
              reject(new Error(body.error || 'Upload failed'));
            }
          });
          xhr.addEventListener('error', () => reject(new Error('Network error')));
          xhr.open('POST', `/api/admin/products/${productId}/upload`);
          xhr.send(formData);
        });

        onFileChange();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed');
      } finally {
        setUploading(false);
        setProgress(0);
      }
    },
    [productId, onFileChange]
  );

  const handleDelete = useCallback(async () => {
    if (!confirm('Delete this file? This cannot be undone.')) return;
    setError(null);
    try {
      const res = await fetch(`/api/admin/products/${productId}/upload`, { method: 'DELETE' });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Delete failed');
      }
      onFileChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  }, [productId, onFileChange]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) uploadFile(file);
    },
    [uploadFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) uploadFile(file);
      e.target.value = '';
    },
    [uploadFile]
  );

  return (
    <div className="bg-zinc-900/80 backdrop-blur border border-zinc-700/50 rounded-xl p-6">
      <h3 className="text-sm font-medium text-zinc-300 mb-4">Digital File</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-700/50 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}

      {uploading && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-zinc-400 mb-1">
            <span>Uploading…</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-2 bg-zinc-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {fileUrl && fileName ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {getFileIcon(fileName)}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-zinc-200 truncate">{fileName}</p>
              <p className="text-xs text-zinc-500">{formatSize(fileSizeBytes)}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <a
              href={fileUrl}
              download
              className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg transition-colors"
            >
              Download
            </a>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center justify-center gap-1 px-3 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className="w-4 h-4" />
              Replace
            </button>
            <button
              onClick={handleDelete}
              disabled={uploading}
              className="inline-flex items-center justify-center gap-1 px-3 py-2 text-sm bg-red-900/40 hover:bg-red-900/60 text-red-300 rounded-lg transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            dragOver
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-zinc-600 hover:border-zinc-500 hover:bg-zinc-800/50'
          }`}
        >
          <Upload className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
          <p className="text-sm text-zinc-400">
            Drop a file here or <span className="text-blue-400 underline">browse</span>
          </p>
          <p className="text-xs text-zinc-600 mt-1">PDF, ZIP, XLSX, CSV, TXT, MD, PNG, JPG — max 50 MB</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPT}
        onChange={handleInputChange}
        className="hidden"
      />
    </div>
  );
}
