import React from 'react';
import { FileMetadata } from '../types';
import { PieChart, HardDrive } from 'lucide-react';

interface StorageUsageProps {
  files: FileMetadata[];
}

const StorageUsage: React.FC<StorageUsageProps> = ({ files }) => {
  const totalUsed = files.reduce((acc, file) => acc + file.size, 0);
  const limit = 5 * 1024 * 1024 * 1024; // 5GB
  const percentage = Math.min((totalUsed / limit) * 100, 100);

  const formatSize = (bytes: number) => {
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
            <HardDrive size={20} />
          </div>
          <h3 className="font-bold text-slate-900">Storage Usage</h3>
        </div>
        <PieChart size={20} className="text-slate-400" />
      </div>

      <div className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-2xl font-bold text-slate-900">{formatSize(totalUsed)}</span>
            <span className="text-slate-500 text-sm ml-1">of 5 GB used</span>
          </div>
          <span className="text-sm font-semibold text-indigo-600">{percentage.toFixed(1)}%</span>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 rounded-full ${
              percentage > 90 ? 'bg-red-500' : percentage > 70 ? 'bg-orange-500' : 'bg-indigo-600'
            }`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="p-3 bg-slate-50 rounded-2xl">
            <p className="text-xs text-slate-500 mb-1">Total Files</p>
            <p className="font-bold text-slate-900">{files.length}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl">
            <p className="text-xs text-slate-500 mb-1">Avg. Size</p>
            <p className="font-bold text-slate-900">
              {files.length > 0 ? formatSize(totalUsed / files.length) : '0 B'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorageUsage;
