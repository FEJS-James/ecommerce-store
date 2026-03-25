'use client';

import { useState, useEffect } from 'react';

interface FilePreviewPanelProps {
  fileUrl: string;
  fileName: string;
}

function getExtension(name: string): string {
  return name.split('.').pop()?.toLowerCase() ?? '';
}

export default function FilePreviewPanel({ fileUrl, fileName }: FilePreviewPanelProps) {
  const ext = getExtension(fileName);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [textLoading, setTextLoading] = useState(false);
  const [textError, setTextError] = useState<string | null>(null);

  const isText = ['txt', 'md', 'csv'].includes(ext);

  useEffect(() => {
    if (!isText) return;
    setTextLoading(true);
    setTextError(null);
    fetch(fileUrl)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch file');
        return res.text();
      })
      .then((text) => {
        setTextContent(text);
        setTextLoading(false);
      })
      .catch((err) => {
        setTextError(err instanceof Error ? err.message : 'Failed to load file');
        setTextLoading(false);
      });
  }, [fileUrl, isText]);

  const renderPreview = () => {
    if (ext === 'pdf') {
      return <iframe src={fileUrl} className="w-full h-[600px] rounded-lg" title={fileName} />;
    }

    if (['png', 'jpg', 'jpeg'].includes(ext)) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={fileUrl} alt={fileName} className="max-w-full rounded-lg" />
      );
    }

    if (ext === 'zip') {
      return (
        <p className="text-zinc-400 text-sm">
          ZIP file — download to view contents
        </p>
      );
    }

    if (isText) {
      if (textLoading) {
        return <p className="text-zinc-500 text-sm">Loading preview…</p>;
      }
      if (textError) {
        return <p className="text-red-400 text-sm">{textError}</p>;
      }
      return (
        <pre className="text-sm text-zinc-300 font-mono whitespace-pre-wrap break-words max-h-[600px] overflow-auto">
          {textContent}
        </pre>
      );
    }

    return (
      <p className="text-zinc-400 text-sm">
        Preview not available for this file type
      </p>
    );
  };

  return (
    <div className="bg-zinc-900/80 backdrop-blur border border-zinc-700/50 rounded-xl p-6 mt-4">
      <h4 className="text-sm font-medium text-zinc-300 mb-4">File Preview</h4>
      {renderPreview()}
    </div>
  );
}
