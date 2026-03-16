import React, { useState } from 'react';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../firebase';
import { useAuth } from '../AuthContext';
import { toast } from 'react-hot-toast';
import { Camera, User, Mail, Save, Loader2 } from 'lucide-react';

interface ProfileProps {
  onNavigate: (view: any) => void;
}

const Profile: React.FC<ProfileProps> = ({ onNavigate }) => {
  const { user, profile } = useAuth();
  const [name, setName] = useState(profile?.name || '');
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      await updateProfile(user, { displayName: name });
      await updateDoc(doc(db, 'users', user.uid), { name });
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingPhoto(true);
    try {
      const photoRef = ref(storage, `profiles/${user.uid}_${Date.now()}`);
      await uploadBytes(photoRef, file);
      const photoURL = await getDownloadURL(photoRef);

      await updateProfile(user, { photoURL });
      await updateDoc(doc(db, 'users', user.uid), { photoURL });
      
      toast.success('Profile photo updated');
    } catch (error: any) {
      toast.error(error.message || 'Photo upload failed');
    } finally {
      setUploadingPhoto(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Profile Settings</h1>
        <p className="text-slate-500">Manage your account information and preferences</p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-8">
        <div className="flex flex-col items-center">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-50 shadow-inner bg-slate-100">
              <img 
                src={profile?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'User')}&background=random&size=128`} 
                alt="Profile" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {uploadingPhoto && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Loader2 className="text-white animate-spin" size={24} />
                </div>
              )}
            </div>
            <label className="absolute bottom-0 right-0 p-2 bg-indigo-600 text-white rounded-full cursor-pointer shadow-lg hover:bg-indigo-700 transition-colors">
              <Camera size={20} />
              <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={uploadingPhoto} />
            </label>
          </div>
          <h2 className="mt-4 text-xl font-bold text-slate-900">{profile?.name}</h2>
          <p className="text-slate-500 text-sm">{profile?.email}</p>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  disabled
                  value={profile?.email || ''}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                />
              </div>
              <p className="mt-1 text-xs text-slate-400">Email cannot be changed for security reasons.</p>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="flex-1 py-3 px-4 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
