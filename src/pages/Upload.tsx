import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, storage } from '../firebase';
import { useAuth } from '../AuthContext';
import { summarizeFile } from '../services/gemini';
import { toast } from 'react-hot-toast';
import { Upload as UploadIcon, File, X, CheckCircle2, Loader2, FileText, Image as ImageIcon, Music, Video } from 'lucide-react';

interface UploadProps {
  onNavigate: (view: any) => void;
}

const Upload: React.FC<UploadProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [notes, setNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false
  } as any);

  const handleUpload = async () => {
    if (!user || !selectedFile) return;

    setUploading(true);
    setProgress(10);

    try {
      const fileName = `${Date.now()}_${selectedFile.name}`;
      const storagePath = `user_uploads/${user.uid}/${fileName}`;
      const storageRef = ref(storage, storagePath);

      // 1. Upload to Storage
      await uploadBytes(storageRef, selectedFile);
      setProgress(40);

      // 2. Get Base64 for Gemini (if it's an image or small doc)
      let summary = "Generating summary...";
      try {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
          };
          reader.readAsDataURL(selectedFile);
        });
        
        const base64 = await base64Promise;
        setProgress(60);
        
        // Only send to Gemini if it's a reasonable size (under 4MB for base64)
        if (selectedFile.size < 4 * 1024 * 1024) {
          summary = await summarizeFile(selectedFile.name, selectedFile.type, base64);
        } else {
          summary = await summarizeFile(selectedFile.name, selectedFile.type);
        }
      } catch (e) {
        console.error("Gemini error:", e);
        summary = "Summary generation failed.";
      }
      setProgress(80);

      // 3. Save to Firestore
      await addDoc(collection(db, 'users', user.uid, 'files'), {
        name: selectedFile.name,
        size: selectedFile.size,
        storagePath: storagePath,
        notes: notes,
        uploadDate: serverTimestamp(),
        summary: summary,
        mimeType: selectedFile.type
      });

      setProgress(100);
      toast.success('File uploaded and analyzed!');
      onNavigate('dashboard');
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="text-blue-500" />;
    if (type.startsWith('video/')) return <Video className="text-purple-500" />;
    if (type.startsWith('audio/')) return <Music className="text-pink-500" />;
    if (type.includes('pdf') || type.includes('word') || type.includes('text')) return <FileText className="text-orange-500" />;
    return <File className="text-slate-400" />;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Upload File</h1>
        <p className="text-slate-500">Securely store and analyze your documents with AI</p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
        {!selectedFile ? (
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
              isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-indigo-400'
            }`}
          >
            <input {...getInputProps()} />
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mx-auto mb-4">
              <UploadIcon size={32} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Click or drag file to upload</h3>
            <p className="text-slate-500 mt-1">PDF, Images, Word, and more (Max 20MB)</p>
          </div>
        ) : (
          <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-4 border border-slate-100 relative">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
              {getFileIcon(selectedFile.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 truncate">{selectedFile.name}</p>
              <p className="text-xs text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            {!uploading && (
              <button 
                onClick={() => setSelectedFile(null)}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Add Notes (Optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={uploading}
            className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[100px]"
            placeholder="What is this file about?"
          />
        </div>

        {uploading ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm font-medium">
              <span className="text-indigo-600 flex items-center gap-2">
                <Loader2 className="animate-spin" size={16} />
                {progress < 100 ? 'Uploading and analyzing...' : 'Finalizing...'}
              </span>
              <span className="text-slate-500">{progress}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-indigo-600 h-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-xs text-center text-slate-400">
              Gemini AI is currently reading and summarizing your file.
            </p>
          </div>
        ) : (
          <div className="flex gap-4">
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex-1 py-3 px-4 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!selectedFile}
              className="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={20} />
              Confirm Upload
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Upload;
