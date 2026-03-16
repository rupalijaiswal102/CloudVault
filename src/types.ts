export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  createdAt: any; // Firestore Timestamp
}

export interface FileMetadata {
  id: string;
  name: string;
  size: number;
  storagePath: string;
  notes?: string;
  uploadDate: any; // Firestore Timestamp
  summary?: string;
  mimeType?: string;
}

export interface StorageStats {
  used: number;
  total: number;
}
