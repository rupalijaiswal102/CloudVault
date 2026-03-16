import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase';
import { useAuth } from '../AuthContext';
import { FileMetadata } from '../types';
import { toast } from 'react-hot-toast';
import FileCard from '../components/FileCard';
import StorageUsage from '../components/StorageUsage';
import { Search, Filter, Plus } from 'lucide-react';

interface DashboardProps {
  onNavigate: (view: any) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'users', user.uid, 'files'),
      orderBy('uploadDate', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fileList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FileMetadata[];
      setFiles(fileList);
      setLoading(false);
    }, (error) => {
      console.error("Files fetch error:", error);
      toast.error("Failed to load files");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleDelete = async (file: FileMetadata) => {
    if (!user || !window.confirm(`Are you sure you want to delete ${file.name}?`)) return;

    try {
      // Delete from Storage
      const storageRef = ref(storage, file.storagePath);
      await deleteObject(storageRef);

      // Delete from Firestore
      await deleteDoc(doc(db, 'users', user.uid, 'files', file.id));
      toast.success('File deleted successfully');
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error("Failed to delete file");
    }
  };

  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Files</h1>
          <p className="text-slate-500">Manage and view your uploaded documents</p>
        </div>
        <button
          onClick={() => onNavigate('upload')}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md"
        >
          <Plus size={20} />
          Upload New File
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
            <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2">
              <Filter size={18} />
              Filter
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
              <p className="text-slate-500">Loading your vault...</p>
            </div>
          ) : filteredFiles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredFiles.map(file => (
                <FileCard 
                  key={file.id} 
                  file={file} 
                  onDelete={() => handleDelete(file)} 
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed text-center px-4">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                <Search size={32} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">No files found</h3>
              <p className="text-slate-500 max-w-xs mx-auto mt-1">
                {searchQuery ? "Try a different search term or clear the filter." : "Start by uploading your first file to CloudVault."}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => onNavigate('upload')}
                  className="mt-6 text-indigo-600 font-semibold hover:underline"
                >
                  Upload your first file
                </button>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <StorageUsage files={files} />
          
          <div className="bg-indigo-600 rounded-3xl p-6 text-white overflow-hidden relative">
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2">Go Premium</h3>
              <p className="text-indigo-100 text-sm mb-4">Get up to 100GB of storage and advanced AI summarization features.</p>
              <button className="px-4 py-2 bg-white text-indigo-600 rounded-xl text-sm font-bold hover:bg-indigo-50 transition-colors">
                Upgrade Now
              </button>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-500 rounded-full opacity-50 blur-2xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
