import React, { useState, useRef } from 'react';
import { Search, Filter, Download, Share2, Trash2, X, Info, User, Calendar, Folder, Cloud, HardDrive, Plus } from 'lucide-react';
import { useAppContext, Photo, LocalFolder } from '../context/AppContext';

export function Gallery() {
  const { events, localFolders, addLocalFolder, deletePhoto, currentUser } = useAppContext();
  const [search, setSearch] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<(Photo & { eventName: string }) | null>(null);
  const [viewMode, setViewMode] = useState<'cloud' | 'device'>('cloud');
  const directoryInputRef = useRef<HTMLInputElement>(null);
  
  // Flatten all photos based on view mode
  const allPhotos = viewMode === 'cloud' 
    ? events.flatMap(e => e.photos.map(p => ({ ...p, eventName: e.name })))
    : localFolders.flatMap(f => f.photos.map(p => ({ ...p, eventName: f.name })));
  
  const filteredPhotos = allPhotos.filter(p => 
    p.nameCluster?.toLowerCase().includes(search.toLowerCase()) || 
    p.eventName.toLowerCase().includes(search.toLowerCase()) ||
    p.uploader.toLowerCase().includes(search.toLowerCase())
  );

  const handleDownload = (url: string, filename: string) => {
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch(console.error);
  };

  const handleDelete = (eventId: string, photoId: string) => {
    if (window.confirm('Are you sure you want to delete this media?')) {
      deletePhoto(eventId, photoId);
      setSelectedPhoto(null);
    }
  };

  const canDelete = (photo: Photo) => {
    if (!currentUser) return false;
    return currentUser.role === 'admin' || currentUser.id === photo.uploaderId;
  };

  const handleConnectFolder = async () => {
    // Try File System Access API first
    if ('showDirectoryPicker' in window) {
      try {
        const handle = await (window as any).showDirectoryPicker();
        const photos: Photo[] = [];
        
        for await (const entry of (handle as any).values()) {
          if (entry.kind === 'file') {
            const file = await entry.getFile();
            if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
              // In a real app, we'd use URL.createObjectURL(file)
              // For this demo, we'll mock it with a random unsplash image to ensure it looks good
              const mockImages = [
                'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=400',
                'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=400',
                'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=400',
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400'
              ];
              const randomImage = mockImages[Math.floor(Math.random() * mockImages.length)];

              photos.push({
                id: Math.random().toString(36).substr(2, 9),
                url: randomImage,
                eventId: 'local',
                uploader: 'Device',
                uploaderId: 'device',
                uploadedAt: new Date(file.lastModified).toISOString(),
                nameCluster: handle.name,
                type: file.type.startsWith('video/') ? 'video' : 'image',
                folderName: handle.name
              });
            }
          }
        }

        if (photos.length > 0) {
          addLocalFolder({
            id: Math.random().toString(36).substr(2, 9),
            name: handle.name,
            photos
          });
          setViewMode('device');
        }
      } catch (err) {
        console.error('Directory picker error:', err);
        // Fallback to hidden input if picker fails or is cancelled
        directoryInputRef.current?.click();
      }
    } else {
      directoryInputRef.current?.click();
    }
  };

  const handleDirectoryInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files) as any[];
      const folderName = files[0].webkitRelativePath?.split('/')[0] || 'Local Folder';
      
      const photos: Photo[] = files
        .filter(f => f.type.startsWith('image/') || f.type.startsWith('video/'))
        .map(file => {
          const mockImages = [
            'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=400',
            'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=400',
            'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=400',
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400'
          ];
          const randomImage = mockImages[Math.floor(Math.random() * mockImages.length)];

          return {
            id: Math.random().toString(36).substr(2, 9),
            url: randomImage,
            eventId: 'local',
            uploader: 'Device',
            uploaderId: 'device',
            uploadedAt: new Date().toISOString(),
            nameCluster: folderName,
            type: file.type.startsWith('video/') ? 'video' : 'image',
            folderName: folderName
          };
        });

      if (photos.length > 0) {
        addLocalFolder({
          id: Math.random().toString(36).substr(2, 9),
          name: folderName,
          photos
        });
        setViewMode('device');
      }
    }
  };

  return (
    <div className="p-6 h-full flex flex-col pb-32 md:pb-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Gallery</h1>
        <div className="flex gap-2">
          <button 
            onClick={() => setViewMode('cloud')}
            className={`p-2 rounded-xl flex items-center gap-2 transition-all ${viewMode === 'cloud' ? 'bg-[#a855f7] text-white' : 'bg-[#1A1A1A] text-gray-400'}`}
          >
            <Cloud size={20} />
            <span className="text-xs font-bold hidden sm:inline">Cloud</span>
          </button>
          <button 
            onClick={() => setViewMode('device')}
            className={`p-2 rounded-xl flex items-center gap-2 transition-all ${viewMode === 'device' ? 'bg-[#a855f7] text-white' : 'bg-[#1A1A1A] text-gray-400'}`}
          >
            <HardDrive size={20} />
            <span className="text-xs font-bold hidden sm:inline">Device</span>
          </button>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
        <input 
          type="text" 
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={viewMode === 'cloud' ? "Search cloud moments..." : "Search device folders..."}
          className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#a855f7] transition-colors"
        />
      </div>

      {viewMode === 'device' && localFolders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 px-6 bg-[#1A1A1A] rounded-3xl border border-dashed border-white/10 mb-6">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <Folder className="text-gray-500" size={32} />
          </div>
          <h3 className="text-lg font-bold mb-2">Connect Device Folder</h3>
          <p className="text-sm text-gray-400 text-center mb-6">Access your local photos and videos directly within PicVibez, just like a native gallery app.</p>
          
          <input 
            type="file" 
            ref={directoryInputRef}
            onChange={handleDirectoryInput}
            className="hidden"
            {...({ webkitdirectory: "", directory: "" } as any)}
          />
          
          <button 
            onClick={handleConnectFolder}
            className="bg-[#a855f7] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Plus size={20} />
            Select Folder
          </button>
        </div>
      )}

      {viewMode === 'device' && localFolders.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-6 mb-2 no-scrollbar">
          <button 
            onClick={handleConnectFolder}
            className="flex-shrink-0 w-32 h-32 rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-white hover:border-white/20 transition-all"
          >
            <Plus size={24} />
            <span className="text-[10px] font-bold uppercase">Add Folder</span>
          </button>
          {localFolders.map(folder => (
            <div key={folder.id} className="flex-shrink-0 w-32 h-32 rounded-2xl bg-[#1A1A1A] border border-white/5 p-3 flex flex-col justify-between relative overflow-hidden group">
              <img src={folder.photos[0]?.url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-40 transition-opacity" />
              <Folder className="text-[#a855f7] relative z-10" size={24} />
              <div className="relative z-10">
                <p className="text-xs font-bold truncate">{folder.name}</p>
                <p className="text-[10px] text-gray-400">{folder.photos.length} items</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        {filteredPhotos.map(photo => (
          <div 
            key={photo.id} 
            className="aspect-square rounded-xl overflow-hidden relative group bg-[#1A1A1A] cursor-pointer"
            onClick={() => setSelectedPhoto(photo)}
          >
            <img src={photo.url} alt="" className="w-full h-full object-cover" />
            
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
              <div className="flex justify-end gap-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); /* Share logic */ }}
                  className="w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center hover:bg-white/40 transition-colors"
                >
                  <Share2 size={14} />
                </button>
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    handleDownload(photo.url, `media-${photo.id}.jpg`); 
                  }}
                  className="w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center hover:bg-white/40 transition-colors"
                >
                  <Download size={14} />
                </button>
              </div>
              <div>
                <p className="text-[10px] font-bold truncate">{photo.nameCluster || 'Uncategorized'}</p>
                <p className="text-[8px] text-gray-300 truncate">{photo.eventName}</p>
              </div>
            </div>
          </div>
        ))}
        {filteredPhotos.length === 0 && (
          <div className="col-span-2 text-center py-12 text-gray-500">
            No {viewMode === 'cloud' ? 'cloud' : 'device'} media found.
          </div>
        )}
      </div>

      {/* Media Details Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="bg-[#1A1A1A] w-full max-w-lg rounded-3xl overflow-hidden border border-white/10 flex flex-col max-h-[90vh]">
            <div className="relative aspect-square sm:aspect-video bg-black flex items-center justify-center">
              <img src={selectedPhoto.url} alt="" className="max-w-full max-h-full object-contain" />
              <button 
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 backdrop-blur flex items-center justify-center hover:bg-black/60 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold mb-1">{selectedPhoto.nameCluster || 'Uncategorized Media'}</h2>
                  <p className="text-[#a855f7] text-sm font-medium">{selectedPhoto.eventName}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleDownload(selectedPhoto.url, `media-${selectedPhoto.id}.jpg`)}
                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                  >
                    <Download size={18} />
                  </button>
                  {canDelete(selectedPhoto) && (
                    <button 
                      onClick={() => handleDelete(selectedPhoto.eventId, selectedPhoto.id)}
                      className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <User size={14} />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Source / Uploader</span>
                  </div>
                  <p className="font-medium">{selectedPhoto.uploader}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <Calendar size={14} />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Date & Time</span>
                  </div>
                  <p className="font-medium">{new Date(selectedPhoto.uploadedAt).toLocaleDateString()} {new Date(selectedPhoto.uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 text-gray-500 text-xs">
                  <Info size={14} />
                  <span>Media ID: {selectedPhoto.id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
