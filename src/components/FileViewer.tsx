import React from 'react';
import { X, Download, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FileViewerProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  fileName: string;
  mimeType?: string;
}

const FileViewer: React.FC<FileViewerProps> = ({ isOpen, onClose, fileUrl, fileName, mimeType }) => {
  if (!isOpen) return null;

  const isImage = mimeType?.startsWith('image/');
  const isPDF = mimeType === 'application/pdf';
  const isVideo = mimeType?.startsWith('video/');
  const isAudio = mimeType?.startsWith('audio/');

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-5xl h-full max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <ExternalLink size={20} />
              </div>
              <h3 className="font-bold text-slate-900 truncate">{fileName}</h3>
            </div>
            <div className="flex items-center gap-2">
              <a 
                href={fileUrl} 
                download={fileName}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                title="Download"
              >
                <Download size={20} />
              </a>
              <button 
                onClick={onClose}
                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 bg-slate-50 overflow-auto flex items-center justify-center p-4">
            {isImage ? (
              <img 
                src={fileUrl} 
                alt={fileName} 
                className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                referrerPolicy="no-referrer"
              />
            ) : isPDF ? (
              <iframe 
                src={`${fileUrl}#toolbar=0`} 
                className="w-full h-full rounded-lg border-0"
                title={fileName}
              />
            ) : isVideo ? (
              <video 
                src={fileUrl} 
                controls 
                className="max-w-full max-h-full rounded-lg"
              />
            ) : isAudio ? (
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 w-full max-w-md">
                <audio src={fileUrl} controls className="w-full" />
              </div>
            ) : (
              <div className="text-center p-12">
                <div className="w-20 h-20 bg-white rounded-3xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-300 mx-auto mb-6">
                  <ExternalLink size={40} />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">Preview not available</h4>
                <p className="text-slate-500 mb-8 max-w-xs mx-auto">
                  This file type cannot be previewed directly. You can download it to view on your device.
                </p>
                <a 
                  href={fileUrl} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-sm"
                >
                  <Download size={20} />
                  Download File
                </a>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default FileViewer;
