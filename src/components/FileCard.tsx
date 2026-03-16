import React, { useState } from 'react';
import { FileMetadata } from '../types';
import { format } from 'date-fns';
import { Download, Trash2, FileText, Image as ImageIcon, Music, Video, File, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '../firebase';
import { toast } from 'react-hot-toast';

interface FileCardProps {
  file: FileMetadata;
  onDelete: () => void;
}

const FileCard: React.FC<FileCardProps> = ({ file, onDelete }) => {
  const [expanded, setExpanded] = useState(false);

  const getFileIcon = (type?: string) => {
    if (!type) return <File className="text-slate-400" />;
    if (type.startsWith('image/')) return <ImageIcon className="text-blue-500" />;
    if (type.startsWith('video/')) return <Video className="text-purple-500" />;
    if (type.startsWith('audio/')) return <Music className="text-pink-500" />;
    if (type.includes('pdf') || type.includes('word') || type.includes('text')) return <FileText className="text-orange-500" />;
    return <File className="text-slate-400" />;
  };

  const handleDownload = async () => {
    try {
      const url = await getDownloadURL(ref(storage, file.storagePath));
      window.open(url, '_blank');
    } catch (error) {
      toast.error("Failed to get download link");
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group">
      <div className="p-4 flex items-start gap-4">
        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-indigo-50 transition-colors">
          {getFileIcon(file.mimeType)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 truncate mb-1" title={file.name}>
            {file.name}
          </h3>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>{formatSize(file.size)}</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
            <span>{file.uploadDate?.toDate ? format(file.uploadDate.toDate(), 'MMM d, yyyy') : 'Recently'}</span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <button 
            onClick={handleDownload}
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
            title="Download"
          >
            <Download size={18} />
          </button>
          <button 
            onClick={onDelete}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {file.summary && (
        <div className="px-4 pb-4">
          <button 
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            <Info size={14} />
            AI Summary
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          
          {expanded && (
            <div className="mt-3 p-3 bg-slate-50 rounded-xl text-sm text-slate-600 leading-relaxed border border-slate-100">
              {file.summary}
              {file.notes && (
                <div className="mt-2 pt-2 border-t border-slate-200">
                  <span className="font-bold text-slate-700 text-xs uppercase tracking-wider block mb-1">My Notes</span>
                  {file.notes}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FileCard;
