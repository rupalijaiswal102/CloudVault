import React from 'react';
import { 
  FileText, 
  FileImage, 
  FileVideo, 
  FileAudio, 
  FileArchive, 
  FileCode, 
  FileSpreadsheet, 
  FileTerminal,
  File as FileIcon,
  Presentation
} from 'lucide-react';

export const getFileIcon = (fileName: string, mimeType?: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase();

  // Extension based checks
  switch (extension) {
    case 'pdf':
      return <FileText className="text-orange-500" />;
    case 'doc':
    case 'docx':
      return <FileText className="text-blue-500" />;
    case 'xls':
    case 'xlsx':
    case 'csv':
      return <FileSpreadsheet className="text-emerald-500" />;
    case 'ppt':
    case 'pptx':
      return <Presentation className="text-rose-500" />;
    case 'zip':
    case 'rar':
    case '7z':
    case 'tar':
    case 'gz':
      return <FileArchive className="text-amber-500" />;
    case 'js':
    case 'ts':
    case 'tsx':
    case 'jsx':
    case 'html':
    case 'css':
    case 'json':
    case 'py':
    case 'java':
    case 'c':
    case 'cpp':
      return <FileCode className="text-slate-600" />;
    case 'sh':
    case 'bat':
      return <FileTerminal className="text-slate-700" />;
  }

  // MIME type fallbacks
  if (mimeType) {
    if (mimeType.startsWith('image/')) return <FileImage className="text-blue-500" />;
    if (mimeType.startsWith('video/')) return <FileVideo className="text-purple-500" />;
    if (mimeType.startsWith('audio/')) return <FileAudio className="text-pink-500" />;
    if (mimeType.includes('pdf')) return <FileText className="text-orange-500" />;
    if (mimeType.includes('word')) return <FileText className="text-blue-500" />;
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType.includes('csv')) 
      return <FileSpreadsheet className="text-emerald-500" />;
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) 
      return <Presentation className="text-rose-500" />;
  }

  return <FileIcon className="text-slate-400" />;
};
