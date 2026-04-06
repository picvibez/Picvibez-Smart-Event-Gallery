import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { LocalNotifications } from '@capacitor/local-notifications';
import { storage, db } from '../firebase';
import { useAuth } from './AuthContext';
import { useAppContext } from './AppContext';
import { AlertCircle, CheckCircle, X, UploadCloud, ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface UploadTask {
  id: string;
  file: File;
  eventId: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

interface UploadContextType {
  uploads: UploadTask[];
  uploadFiles: (files: File[], eventId: string) => void;
  removeUpload: (id: string) => void;
  retryUpload: (id: string) => void;
  clearCompleted: () => void;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export const useUpload = () => {
  const context = useContext(UploadContext);
  if (!context) throw new Error('useUpload must be used within an UploadProvider');
  return context;
};

export const UploadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [uploads, setUploads] = useState<UploadTask[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const { user } = useAuth();
  const { addPhoto, events } = useAppContext();

  // Request notification permissions on mount
  useEffect(() => {
    const requestPermissions = async () => {
      try {
        await LocalNotifications.requestPermissions();
      } catch (e) {
        console.warn('Local notifications permission request failed', e);
      }
    };
    requestPermissions();
  }, []);

  const notifyOutsideApp = async (title: string, body: string) => {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: new Date().getTime(),
            schedule: { at: new Date(Date.now() + 1000) },
            sound: undefined,
            attachments: undefined,
            actionTypeId: '',
            extra: null
          }
        ]
      });
    } catch (e) {
      console.warn('Failed to schedule local notification', e);
    }
  };

  const processUpload = useCallback(async (uploadTask: UploadTask) => {
    if (!user) return;

    setUploads(prev => prev.map(u => u.id === uploadTask.id ? { ...u, status: 'uploading', progress: 0 } : u));

    const fileExtension = uploadTask.file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExtension}`;
    const storageRef = ref(storage, `events/${uploadTask.eventId}/${fileName}`);

    const task = uploadBytesResumable(storageRef, uploadTask.file);

    task.on('state_changed', 
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploads(prev => prev.map(u => u.id === uploadTask.id ? { ...u, progress } : u));
      },
      (error) => {
        console.error("Upload failed", error);
        setUploads(prev => prev.map(u => u.id === uploadTask.id ? { ...u, status: 'error', error: error.message } : u));
        notifyOutsideApp('Upload Failed', `Failed to upload ${uploadTask.file.name}. Tap to retry in the app.`);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(task.snapshot.ref);
          const isVideo = uploadTask.file.type.startsWith('video/');
          const isGif = uploadTask.file.type === 'image/gif';
          const mediaType = isVideo ? 'video' : (isGif ? 'gif' : 'image');
          
          // Save to Firestore
          await addDoc(collection(db, 'photos'), {
            eventId: uploadTask.eventId,
            url: downloadURL,
            uploaderId: user.uid,
            uploaderName: user.displayName || 'Anonymous',
            uploadedAt: serverTimestamp(),
            type: mediaType,
            fileName: uploadTask.file.name,
            fileSize: uploadTask.file.size
          });

          // Update local state so it appears immediately without refresh
          addPhoto(uploadTask.eventId, {
            url: downloadURL,
            uploader: user.displayName || 'Anonymous',
            type: mediaType,
            nameCluster: 'Just Uploaded',
            fileName: uploadTask.file.name,
            fileSize: uploadTask.file.size
          });

          setUploads(prev => prev.map(u => u.id === uploadTask.id ? { ...u, status: 'success', progress: 100 } : u));
          
          // Remove successful uploads after 5 seconds
          setTimeout(() => {
            setUploads(prev => prev.filter(u => u.id !== uploadTask.id));
          }, 5000);
        } catch (err: any) {
          console.error("Failed to save metadata", err);
          setUploads(prev => prev.map(u => u.id === uploadTask.id ? { ...u, status: 'error', error: 'Failed to save photo details' } : u));
          notifyOutsideApp('Upload Failed', `Failed to save ${uploadTask.file.name}.`);
        }
      }
    );
  }, [user, addPhoto]);

  const uploadFiles = useCallback((files: File[], eventId: string) => {
    const event = events.find(e => e.id === eventId);
    
    const newUploads: UploadTask[] = [];
    const skippedUploads: UploadTask[] = [];

    files.forEach(file => {
      // Check if file already exists in this event (by name and size)
      const isDuplicate = event?.photos.some(p => p.fileName === file.name && p.fileSize === file.size);
      
      if (isDuplicate) {
        skippedUploads.push({
          id: `skipped_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          file,
          eventId,
          progress: 0,
          status: 'error',
          error: 'Duplicate file skipped'
        });
      } else {
        newUploads.push({
          id: `${Date.now()}_${Math.random().toString(36).substring(7)}`,
          file,
          eventId,
          progress: 0,
          status: 'pending'
        });
      }
    });

    if (newUploads.length === 0 && skippedUploads.length === 0) return;

    setUploads(prev => [...prev, ...newUploads, ...skippedUploads]);
    setIsExpanded(true);

    // Process concurrently for fast scaling
    newUploads.forEach(upload => {
      processUpload(upload);
    });

    // Auto-remove skipped uploads after 5 seconds
    if (skippedUploads.length > 0) {
      setTimeout(() => {
        setUploads(prev => prev.filter(u => !u.id.startsWith('skipped_')));
      }, 5000);
    }
  }, [processUpload, events]);

  const removeUpload = useCallback((id: string) => {
    setUploads(prev => prev.filter(u => u.id !== id));
  }, []);

  const retryUpload = useCallback((id: string) => {
    setUploads(prev => {
      const upload = prev.find(u => u.id === id);
      if (upload) {
        processUpload(upload);
      }
      return prev;
    });
  }, [processUpload]);

  const clearCompleted = useCallback(() => {
    setUploads(prev => prev.filter(u => u.status !== 'success'));
  }, []);

  const activeUploadsCount = uploads.filter(u => u.status === 'uploading' || u.status === 'pending').length;
  const errorUploadsCount = uploads.filter(u => u.status === 'error').length;
  const successUploadsCount = uploads.filter(u => u.status === 'success').length;

  return (
    <UploadContext.Provider value={{ uploads, uploadFiles, removeUpload, retryUpload, clearCompleted }}>
      {children}
      
      {/* In-App Notification UI for Uploads */}
      <AnimatePresence>
        {uploads.length > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-20 left-4 right-4 md:left-auto md:right-8 md:w-96 z-50 flex flex-col pointer-events-none"
          >
            {/* Header / Summary */}
            <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/10 rounded-t-xl p-3 shadow-lg pointer-events-auto flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#a855f7]/10 text-[#a855f7]">
                  <UploadCloud size={14} className={activeUploadsCount > 0 ? 'animate-bounce' : ''} />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white">
                  {activeUploadsCount > 0 ? `Uploading ${activeUploadsCount} files...` : 'Uploads Complete'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {successUploadsCount > 0 && activeUploadsCount === 0 && (
                  <button 
                    onClick={clearCompleted}
                    className="text-[10px] font-bold text-[#a855f7] hover:underline"
                  >
                    Clear
                  </button>
                )}
                <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                >
                  {isExpanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                </button>
              </div>
            </div>

            {/* List of uploads */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-white dark:bg-[#1A1A1A] border-x border-b border-gray-200 dark:border-white/10 rounded-b-xl shadow-lg pointer-events-auto overflow-hidden"
                >
                  <div className="max-h-64 overflow-y-auto divide-y divide-gray-100 dark:divide-white/5 no-scrollbar">
                    {uploads.map(upload => (
                      <motion.div 
                        key={upload.id}
                        layout
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 20, opacity: 0 }}
                        className="p-3 flex flex-col gap-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 overflow-hidden">
                            {upload.status === 'uploading' || upload.status === 'pending' ? (
                              <div className="relative flex items-center justify-center">
                                <UploadCloud className="text-[#a855f7] shrink-0" size={16} />
                                <div className="absolute inset-0 animate-ping bg-[#a855f7]/20 rounded-full" />
                              </div>
                            ) : upload.status === 'success' ? (
                              <CheckCircle className="text-green-500 shrink-0" size={16} />
                            ) : (
                              <AlertCircle className="text-red-500 shrink-0" size={16} />
                            )}
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-bold truncate text-gray-900 dark:text-white">
                                {upload.file.name}
                              </span>
                              <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-black tracking-tighter">
                                {upload.status === 'uploading' ? `${Math.round(upload.progress)}%` : upload.status}
                              </span>
                            </div>
                          </div>
                          <button 
                            onClick={() => removeUpload(upload.id)} 
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          >
                            <X size={14} />
                          </button>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-100 dark:bg-white/5 rounded-full h-1 overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ 
                              width: `${upload.progress}%`,
                              backgroundColor: upload.status === 'error' ? '#ef4444' : (upload.status === 'success' ? '#22c55e' : '#a855f7')
                            }}
                            className="h-full rounded-full transition-all duration-300"
                          />
                        </div>

                        {upload.status === 'error' && (
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-red-500 font-medium truncate pr-2">
                              {upload.error || 'Failed'}
                            </span>
                            <button 
                              onClick={() => retryUpload(upload.id)}
                              className="text-[10px] font-black text-[#a855f7] uppercase tracking-widest hover:underline"
                            >
                              Retry
                            </button>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </UploadContext.Provider>
  );
};

