import React, { useRef, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Upload, Users, Share2, Settings, Download, Trash2, X, User, Calendar, Info, 
  ArrowUpDown, Filter, LayoutGrid, List, Check, FolderDown, UserPlus, FileDown,
  Loader2, CheckCircle2, AlertCircle, Sparkles, ChevronDown, ChevronUp, Search, Tag, Pencil, Plus
} from 'lucide-react';
import { useAppContext, Photo, DetectedPerson } from '../context/AppContext';
import { useUpload } from '../context/UploadContext';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { clusterPhotosWithAI } from '../services/aiService';
import { motion, AnimatePresence } from 'motion/react';

interface UploadingFile {
  id: string;
  name: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
}

export function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { events, addPhoto, deletePhoto, deletePhotos, updatePhotoClusters, updatePhotoDetails, currentUser } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const [editPhotoData, setEditPhotoData] = useState<Partial<Photo>>({});
  const [isDownloading, setIsDownloading] = useState(false);
  const [isClustering, setIsClustering] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [collapsedClusters, setCollapsedClusters] = useState<Set<string>>(new Set());
  
  // Filter and Sort States
  const [viewMode, setViewMode] = useState<'clusters' | 'feed' | 'ads' | 'members'>('clusters');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [personFilter, setPersonFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const event = events.find(e => e.id === id);

  if (!event) return <div className="p-6">Event not found</div>;

  // Get unique uploaders for the filter and members list
  const memberStats = useMemo(() => {
    const uploaderMap = new Map<string, { count: number; lastActive: string; role: string }>();
    
    event.photos.forEach(p => {
      const current = uploaderMap.get(p.uploader) || { count: 0, lastActive: p.uploadedAt, role: 'Member' };
      uploaderMap.set(p.uploader, {
        count: current.count + 1,
        lastActive: new Date(p.uploadedAt) > new Date(current.lastActive) ? p.uploadedAt : current.lastActive,
        role: p.uploader === 'John Doe' || p.uploader === 'Admin' ? 'Admin' : 'Member' // Mock role logic
      });
    });

    const members = Array.from(uploaderMap.entries()).map(([name, stats]) => ({
      name,
      ...stats
    }));

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const newPhotosCount = event.photos.filter(p => new Date(p.uploadedAt) > twentyFourHoursAgo).length;

    return {
      members,
      totalMembers: members.length,
      newPhotosCount,
      totalPhotos: event.photos.length
    };
  }, [event.photos]);

  const uploaders = useMemo(() => {
    return ['all', ...memberStats.members.map(m => m.name)];
  }, [memberStats.members]);

  const allPeople = useMemo(() => {
    const peopleSet = new Set<string>();
    event.photos.forEach(p => {
      p.detectedPeople?.forEach(person => peopleSet.add(person.name));
    });
    return ['all', ...Array.from(peopleSet).sort()];
  }, [event.photos]);

  const handleCleanupDuplicates = () => {
    if (!event.photos || event.photos.length === 0) return;

    const seen = new Map<string, string>(); // key: name+size, value: first photo id
    const duplicateIds: string[] = [];

    event.photos.forEach(photo => {
      if (photo.fileName && photo.fileSize) {
        const key = `${photo.fileName}_${photo.fileSize}`;
        if (seen.has(key)) {
          duplicateIds.push(photo.id);
        } else {
          seen.set(key, photo.id);
        }
      }
    });

    if (duplicateIds.length > 0) {
      if (window.confirm(`Found ${duplicateIds.length} duplicate photos. Do you want to delete them?`)) {
        deletePhotos(event.id, duplicateIds);
        alert(`Deleted ${duplicateIds.length} duplicates.`);
      }
    } else {
      alert('No duplicates found.');
    }
  };

  const calculateAge = (dob: string) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Filter and Sort Logic
  const filteredAndSortedPhotos = useMemo(() => {
    let result = [...event.photos];

    // Filter by user
    if (userFilter !== 'all') {
      result = result.filter(p => p.uploader === userFilter);
    }

    // Filter by person
    if (personFilter !== 'all') {
      result = result.filter(p => p.detectedPeople?.some(person => person.name === personFilter));
    }

    // Search Query Logic
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(p => {
        // Search in uploader
        if (p.uploader.toLowerCase().includes(query)) return true;
        
        // Search in detected people
        if (p.detectedPeople?.some(person => 
          person.name.toLowerCase().includes(query) || 
          person.gender?.toLowerCase().includes(query) || 
          person.relation?.toLowerCase().includes(query)
        )) return true;
        
        // Search in visual tags (dress color, etc.)
        if (p.visualTags?.some(tag => tag.toLowerCase().includes(query))) return true;
        
        // Search in gift given
        if (p.giftGiven?.toLowerCase().includes(query)) return true;
        
        // Search in cluster name
        if (p.nameCluster?.toLowerCase().includes(query)) return true;
        
        return false;
      });
    }

    // Sort by date
    result.sort((a, b) => {
      const dateA = new Date(a.uploadedAt).getTime();
      const dateB = new Date(b.uploadedAt).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [event.photos, userFilter, sortOrder]);

  // Group photos by nameCluster (using filtered results)
  const clusters = useMemo(() => {
    return filteredAndSortedPhotos.reduce((acc, photo) => {
      const cluster = photo.nameCluster || 'Uncategorized';
      if (!acc[cluster]) acc[cluster] = [];
      acc[cluster].push(photo);
      return acc;
    }, {} as Record<string, Photo[]>);
  }, [filteredAndSortedPhotos]);

  // Group photos by uploader (using filtered results)
  const groupedByUploader = useMemo(() => {
    return filteredAndSortedPhotos.reduce((acc, photo) => {
      const uploader = photo.uploader || 'Anonymous';
      if (!acc[uploader]) acc[uploader] = [];
      acc[uploader].push(photo);
      return acc;
    }, {} as Record<string, Photo[]>);
  }, [filteredAndSortedPhotos]);

  const { uploadFiles } = useUpload();

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      uploadFiles(files, event.id);
      
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

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

  const handleDownloadBatch = async (photos: Photo[], zipName: string) => {
    if (photos.length === 0) return;
    setIsDownloading(true);
    const zip = new JSZip();
    
    try {
      const downloadPromises = photos.map(async (photo, index) => {
        const response = await fetch(photo.url);
        const blob = await response.blob();
        const extension = photo.type === 'video' ? 'mp4' : (photo.type === 'gif' ? 'gif' : 'jpg');
        zip.file(`${photo.uploader}-${index}.${extension}`, blob);
      });

      await Promise.all(downloadPromises);
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${zipName}.zip`);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download media batch.');
    } finally {
      setIsDownloading(false);
    }
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

  const handleAICluster = async () => {
    if (event.photos.length === 0) return;
    setIsClustering(true);
    try {
      const photosForClustering = event.photos.map(p => ({ id: p.id, url: p.url }));
      const clusters = await clusterPhotosWithAI(photosForClustering);
      updatePhotoClusters(event.id, clusters);
    } catch (error) {
      console.error("AI Clustering failed:", error);
    } finally {
      setIsClustering(false);
    }
  };

  const toggleCluster = (clusterName: string) => {
    setCollapsedClusters(prev => {
      const next = new Set(prev);
      if (next.has(clusterName)) {
        next.delete(clusterName);
      } else {
        next.add(clusterName);
      }
      return next;
    });
  };

  const handleSavePhotoDetails = () => {
    if (selectedPhoto) {
      updatePhotoDetails(event.id, selectedPhoto.id, editPhotoData);
      setSelectedPhoto({ ...selectedPhoto, ...editPhotoData });
      setIsEditingPhoto(false);
    }
  };

  const handleAddPerson = () => {
    setEditPhotoData(prev => ({
      ...prev,
      detectedPeople: [...(prev.detectedPeople || []), { name: '', gender: 'Unknown', relation: '', dob: '' }]
    }));
  };

  const handleUpdatePerson = (index: number, field: keyof DetectedPerson, value: string) => {
    setEditPhotoData(prev => {
      const newPeople = [...(prev.detectedPeople || [])];
      newPeople[index] = { ...newPeople[index], [field]: value };
      return { ...prev, detectedPeople: newPeople };
    });
  };

  const handleRemovePerson = (index: number) => {
    setEditPhotoData(prev => {
      const newPeople = [...(prev.detectedPeople || [])];
      newPeople.splice(index, 1);
      return { ...prev, detectedPeople: newPeople };
    });
  };

  return (
    <div className="h-full flex flex-col bg-[#0A0A0A] overflow-y-auto pb-24 text-white">
      {/* Header Image */}
      <div className="h-72 relative">
        <img src={event.coverImage} alt={event.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#0A0A0A]" />
        
        <div className="absolute top-6 left-4 right-4 flex justify-between items-center">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur flex items-center justify-center hover:bg-black/60 transition-colors">
            <ChevronLeft size={24} />
          </button>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur flex items-center justify-center hover:bg-black/60 transition-colors">
              <Share2 size={20} />
            </button>
            <button 
              onClick={() => setShowSettingsModal(true)}
              className="w-10 h-10 rounded-full bg-black/40 backdrop-blur flex items-center justify-center hover:bg-black/60 transition-colors"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>

        <div className="absolute bottom-4 left-6 right-6">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-[#a855f7] text-xs font-bold tracking-wider uppercase mb-1 block">{event.type}</span>
              <h1 className="text-3xl font-bold leading-tight mb-2">{event.name}</h1>
              <p className="text-sm text-gray-300">{event.date} • {event.location}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Actions */}
        <div className="flex gap-4">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleUpload} 
            className="hidden" 
            accept="image/*,video/*"
            multiple
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 bg-[#a855f7] rounded-2xl py-3.5 flex items-center justify-center gap-2 font-bold hover:opacity-90 transition-opacity"
          >
            <Upload size={20} />
            Upload
          </button>
          <button 
            onClick={() => setShowInviteModal(true)}
            className="flex-1 bg-[#1A1A1A] border border-white/5 rounded-2xl py-3.5 flex items-center justify-center gap-2 font-bold hover:bg-[#2A2A2A] transition-colors"
          >
            <Users size={20} />
            Invite
          </button>
          <button 
            onClick={handleAICluster}
            disabled={isClustering || event.photos.length === 0}
            className="w-14 h-14 bg-gradient-to-br from-[#8b5cf6] to-[#d946ef] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#8b5cf6]/20 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all"
            title="AI Cluster Photos"
          >
            {isClustering ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              <Sparkles size={24} />
            )}
          </button>
        </div>

        {/* Sponsored Ads Section - Only shown in feed/clusters as a small preview or if explicitly in ads mode */}
        {viewMode !== 'ads' && (
          <div className="mt-8 mb-4">
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] animate-pulse" />
                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Public Advertisement FYIP</h3>
              </div>
              <button 
                onClick={() => setViewMode('ads')}
                className="text-[8px] font-bold text-[#3b82f6] border border-[#3b82f6]/20 px-2 py-0.5 rounded-full uppercase tracking-widest hover:bg-[#3b82f6]/10 transition-colors"
              >
                View All Ads
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="group relative bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] rounded-3xl p-5 border border-white/5 overflow-hidden hover:border-[#3b82f6]/30 transition-all duration-500">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#3b82f6]/10 blur-[50px] -mr-16 -mt-16 group-hover:bg-[#3b82f6]/20 transition-all duration-700" />
                
                <div className="relative z-10 flex items-center gap-5">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border border-white/10 shadow-2xl group-hover:scale-105 transition-transform duration-500">
                    <img 
                      src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=200&auto=format&fit=crop" 
                      alt="Ad" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white mb-1 truncate group-hover:text-[#3b82f6] transition-colors">Premium Event Planning</h4>
                    <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed mb-3">Make your next event unforgettable with our professional planning services. Special discounts for PicVibez users!</p>
                    
                    <div className="flex items-center gap-3">
                      <button className="text-[10px] font-black text-[#3b82f6] uppercase tracking-widest hover:underline">Learn More</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter Bar */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex bg-[#1A1A1A] p-1 rounded-xl border border-white/5 overflow-x-auto no-scrollbar">
              <button 
                onClick={() => setViewMode('clusters')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${viewMode === 'clusters' ? 'bg-[#a855f7] text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <LayoutGrid size={14} />
                Clusters
              </button>
              <button 
                onClick={() => setViewMode('feed')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${viewMode === 'feed' ? 'bg-[#a855f7] text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <List size={14} />
                Feed
              </button>
              <button 
                onClick={() => setViewMode('ads')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${viewMode === 'ads' ? 'bg-[#a855f7] text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <Share2 size={14} />
                Public Ads
              </button>
              <button 
                onClick={() => setViewMode('members')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${viewMode === 'members' ? 'bg-[#a855f7] text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <Users size={14} />
                Members
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                <input 
                  type="text"
                  placeholder="Search people, colors, roles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#1A1A1A] border border-white/5 rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-[#a855f7] transition-all w-full"
                />
              </div>
              <button 
                onClick={() => setShowFilters(true)}
                className={`p-2.5 rounded-xl border transition-all ${userFilter !== 'all' || personFilter !== 'all' || searchQuery ? 'bg-[#a855f7]/10 border-[#a855f7] text-[#a855f7]' : 'bg-white/5 border-white/5 text-gray-400 hover:text-white'}`}
              >
                <Filter size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Media Display */}
        <div>
          {viewMode === 'members' ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Stats Overview */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-[#1A1A1A] border border-white/5 p-4 rounded-3xl text-center">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Members</p>
                  <p className="text-2xl font-black text-white">{memberStats.totalMembers}</p>
                </div>
                <div className="bg-[#1A1A1A] border border-white/5 p-4 rounded-3xl text-center">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Photos</p>
                  <p className="text-2xl font-black text-white">{memberStats.totalPhotos}</p>
                </div>
                <div className="bg-[#1A1A1A] border border-white/5 p-4 rounded-3xl text-center">
                  <p className="text-[10px] font-black text-[#a855f7] uppercase tracking-widest mb-1">New Today</p>
                  <p className="text-2xl font-black text-[#a855f7]">{memberStats.newPhotosCount}</p>
                </div>
              </div>

              {/* Members List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Group Members</h3>
                  <span className="text-[10px] font-bold text-gray-600">{memberStats.totalMembers} people in this group</span>
                </div>

                <div className="bg-[#1A1A1A] border border-white/5 rounded-[2rem] overflow-hidden">
                  {memberStats.members.map((member, idx) => (
                    <div 
                      key={member.name} 
                      className={`flex items-center justify-between p-5 hover:bg-white/5 transition-colors ${idx !== memberStats.members.length - 1 ? 'border-bottom border-white/5' : ''}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#a855f7] to-[#3b82f6] flex items-center justify-center text-white font-black text-lg shadow-lg">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-white">{member.name}</h4>
                            {member.role === 'Admin' && (
                              <span className="text-[8px] font-black bg-[#a855f7]/20 text-[#a855f7] px-2 py-0.5 rounded-full uppercase tracking-widest border border-[#a855f7]/30">
                                Admin
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-gray-500 font-medium">
                            {member.count} photos contributed • Last active {new Date(member.lastActive).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                        <User size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Invite Section */}
              <div className="bg-gradient-to-br from-[#a855f7]/10 to-[#3b82f6]/10 border border-white/5 p-8 rounded-[2.5rem] text-center">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="text-[#a855f7]" size={32} />
                </div>
                <h3 className="text-xl font-black text-white mb-2">Grow the Vibe</h3>
                <p className="text-sm text-gray-400 mb-6">Invite more friends to this event and capture every perspective together.</p>
                <button 
                  onClick={() => setShowInviteModal(true)}
                  className="bg-white text-black px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-opacity"
                >
                  Send Invite
                </button>
              </div>
            </div>
          ) : viewMode === 'ads' ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#3b82f6] animate-pulse" />
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Public Advertisement FYIP</h3>
                </div>
                <button className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors">
                  Submit Ad
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="group relative bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] rounded-[2.5rem] p-8 border border-white/5 overflow-hidden hover:border-[#3b82f6]/30 transition-all duration-500">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#3b82f6]/10 blur-[80px] -mr-32 -mt-32 group-hover:bg-[#3b82f6]/20 transition-all duration-700" />
                  
                  <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-40 h-40 rounded-3xl overflow-hidden flex-shrink-0 border border-white/10 shadow-2xl group-hover:scale-105 transition-transform duration-500">
                      <img 
                        src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=400&auto=format&fit=crop" 
                        alt="Ad" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    
                    <div className="flex-1 text-center md:text-left">
                      <div className="inline-block px-3 py-1 rounded-full bg-[#3b82f6]/10 border border-[#3b82f6]/20 text-[10px] font-black text-[#3b82f6] uppercase tracking-[0.2em] mb-4">
                        Featured Service
                      </div>
                      <h4 className="text-2xl font-black text-white mb-3 group-hover:text-[#3b82f6] transition-colors">Premium Event Planning</h4>
                      <p className="text-sm text-gray-400 leading-relaxed mb-6">Make your next event unforgettable with our professional planning services. From weddings to corporate galas, we handle every detail so you can enjoy the vibe. Special discounts for PicVibez users!</p>
                      
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                        <button className="bg-[#3b82f6] text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                          Learn More
                        </button>
                        <button className="bg-white/5 border border-white/10 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-colors">
                          Visit Site
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="group relative bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] rounded-[2.5rem] p-8 border border-white/5 overflow-hidden hover:border-[#a855f7]/30 transition-all duration-500">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#a855f7]/10 blur-[80px] -mr-32 -mt-32 group-hover:bg-[#a855f7]/20 transition-all duration-700" />
                  
                  <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-40 h-40 rounded-3xl overflow-hidden flex-shrink-0 border border-white/10 shadow-2xl group-hover:scale-105 transition-transform duration-500">
                      <img 
                        src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=400&auto=format&fit=crop" 
                        alt="Ad" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    
                    <div className="flex-1 text-center md:text-left">
                      <div className="inline-block px-3 py-1 rounded-full bg-[#a855f7]/10 border border-[#a855f7]/20 text-[10px] font-black text-[#a855f7] uppercase tracking-[0.2em] mb-4">
                        Professional Photography
                      </div>
                      <h4 className="text-2xl font-black text-white mb-3 group-hover:text-[#a855f7] transition-colors">Vibe Photography Pro</h4>
                      <p className="text-sm text-gray-400 leading-relaxed mb-6">Capture every moment in stunning detail. Our team of expert photographers specializes in event coverage, ensuring your memories are preserved forever. Book a professional photographer for your PicVibez event today.</p>
                      
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                        <button className="bg-[#a855f7] text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                          Book Now
                        </button>
                        <button className="bg-white/5 border border-white/10 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-colors">
                          Portfolio
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : filteredAndSortedPhotos.length === 0 ? (
            <div className="text-center py-20 bg-[#1A1A1A] rounded-3xl border border-white/5">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Info className="text-gray-600" size={32} />
              </div>
              <p className="text-gray-400 font-medium">No media matches your filters.</p>
              <button 
                onClick={() => { setUserFilter('all'); setPersonFilter('all'); setSearchQuery(''); setSortOrder('desc'); }}
                className="mt-4 text-[#a855f7] text-sm font-bold"
              >
                Reset Filters
              </button>
            </div>
          ) : viewMode === 'clusters' ? (
            <div className="space-y-10">
              {Object.entries(clusters).map(([clusterName, photos]) => (
                <div key={clusterName} className="space-y-4">
                  <button 
                    onClick={() => toggleCluster(clusterName)}
                    className="w-full flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-6 bg-[#a855f7] rounded-full" />
                      <h4 className="font-bold text-xl group-hover:text-[#a855f7] transition-colors">{clusterName}</h4>
                      <span className="text-xs text-gray-500 bg-white/5 px-2.5 py-1 rounded-lg">{(photos as Photo[]).length}</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadBatch(photos as Photo[], `${event.name}-${clusterName}`);
                        }}
                        className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-[#a855f7] transition-all"
                        title="Download All"
                      >
                        <FolderDown size={18} />
                      </button>
                    </div>
                    <div className="text-gray-500 group-hover:text-white transition-colors">
                      {collapsedClusters.has(clusterName) ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                    </div>
                  </button>
                  
                  <AnimatePresence>
                    {!collapsedClusters.has(clusterName) && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-3 gap-3 pt-2">
                          {(photos as Photo[]).map(photo => (
                            <motion.div 
                              layout
                              key={photo.id} 
                              className="aspect-square rounded-2xl overflow-hidden bg-[#1A1A1A] border border-white/5 cursor-pointer hover:border-white/20 transition-all hover:scale-[1.02] relative group"
                              onClick={() => setSelectedPhoto(photo)}
                            >
                              <img src={photo.url} alt="" className="w-full h-full object-cover" />
                              {photo.detectedPeople && photo.detectedPeople.length > 0 && (
                                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <div className="flex items-center gap-1.5">
                                    <User size={10} className="text-[#a855f7]" />
                                    <span className="text-[8px] font-black uppercase tracking-widest text-white">
                                      {photo.detectedPeople.length} {photo.detectedPeople.length === 1 ? 'Person' : 'People'}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          ) : viewMode === 'feed' ? (
            <div className="space-y-10">
              {Object.entries(groupedByUploader).map(([uploader, photos]) => (
                <div key={uploader} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#d946ef] flex items-center justify-center text-white font-bold">
                        {uploader.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">{uploader}</h4>
                        <p className="text-xs text-gray-500">{(photos as Photo[]).length} Photos</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDownloadBatch(photos as Photo[], `${event.name}-${uploader}`)}
                      className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition-all"
                    >
                      <FolderDown size={16} className="text-[#a855f7]" />
                      Download All
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {(photos as Photo[]).map(photo => (
                      <div 
                        key={photo.id} 
                        className="rounded-2xl overflow-hidden bg-[#1A1A1A] border border-white/5 cursor-pointer hover:border-white/20 transition-all group relative"
                        onClick={() => setSelectedPhoto(photo)}
                      >
                        <div className="aspect-[3/4]">
                          <img src={photo.url} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                          {photo.detectedPeople && photo.detectedPeople.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {photo.detectedPeople.slice(0, 2).map(p => (
                                <span key={p.name} className="text-[8px] bg-[#a855f7] text-white px-1.5 py-0.5 rounded-md font-bold">{p.name}</span>
                              ))}
                              {photo.detectedPeople.length > 2 && (
                                <span className="text-[8px] bg-white/20 text-white px-1.5 py-0.5 rounded-md font-bold">+{photo.detectedPeople.length - 2}</span>
                              )}
                            </div>
                          )}
                          <p className="text-xs font-bold truncate">{photo.uploader}</p>
                          <p className="text-[10px] text-gray-400">{new Date(photo.uploadedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {filteredAndSortedPhotos.map(photo => (
                <div 
                  key={photo.id} 
                  className="rounded-2xl overflow-hidden bg-[#1A1A1A] border border-white/5 cursor-pointer hover:border-white/20 transition-all group relative"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <div className="aspect-[3/4]">
                    <img src={photo.url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                    {photo.detectedPeople && photo.detectedPeople.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {photo.detectedPeople.slice(0, 2).map(p => (
                          <span key={p.name} className="text-[8px] bg-[#a855f7] text-white px-1.5 py-0.5 rounded-md font-bold">{p.name}</span>
                        ))}
                        {photo.detectedPeople.length > 2 && (
                          <span className="text-[8px] bg-white/20 text-white px-1.5 py-0.5 rounded-md font-bold">+{photo.detectedPeople.length - 2}</span>
                        )}
                      </div>
                    )}
                    <p className="text-xs font-bold truncate">{photo.uploader}</p>
                    <p className="text-[10px] text-gray-400">{new Date(photo.uploadedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Media Details Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="bg-[#1A1A1A] w-full max-w-lg rounded-3xl overflow-hidden border border-white/10 flex flex-col max-h-[90vh]">
            <div className="relative aspect-square sm:aspect-video bg-black flex items-center justify-center">
              <img src={selectedPhoto.url} alt="" className="max-w-full max-h-full object-contain" />
              <button 
                onClick={() => {
                  setSelectedPhoto(null);
                  setIsEditingPhoto(false);
                }}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 backdrop-blur flex items-center justify-center hover:bg-black/60 transition-colors"
              >
                <X size={20} />
              </button>
              {isDownloading && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3 z-30">
                  <div className="w-8 h-8 border-4 border-[#a855f7] border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs font-bold tracking-widest uppercase">Zipping Media...</span>
                </div>
              )}
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto">
              <div className="flex justify-between items-start">
                <div className="flex-1 mr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold">{selectedPhoto.nameCluster || 'Uncategorized Media'}</h2>
                    <button 
                      onClick={() => {
                        const clusterPhotos = event.photos.filter(p => p.nameCluster === selectedPhoto.nameCluster);
                        handleDownloadBatch(clusterPhotos, `${event.name}-${selectedPhoto.nameCluster || 'Uncategorized'}`);
                      }}
                      className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                      title="Download all from this cluster"
                    >
                      <FolderDown size={14} />
                    </button>
                  </div>
                  <p className="text-[#a855f7] text-sm font-medium">{event.name}</p>
                </div>
                <div className="flex gap-2">
                  {canDelete(selectedPhoto) && !isEditingPhoto && (
                    <button 
                      onClick={() => {
                        setIsEditingPhoto(true);
                        setEditPhotoData({
                          detectedPeople: selectedPhoto.detectedPeople || [],
                          giftGiven: selectedPhoto.giftGiven || ''
                        });
                      }}
                      className="w-10 h-10 rounded-full bg-[#a855f7]/10 border border-[#a855f7]/20 text-[#a855f7] flex items-center justify-center hover:bg-[#a855f7]/20 transition-colors"
                      title="Edit labels"
                    >
                      <Pencil size={18} />
                    </button>
                  )}
                  <button 
                    onClick={() => handleDownload(selectedPhoto.url, `media-${selectedPhoto.id}.jpg`)}
                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                    title="Download this file"
                  >
                    <Download size={18} />
                  </button>
                  {canDelete(selectedPhoto) && (
                    <button 
                      onClick={() => handleDelete(event.id, selectedPhoto.id)}
                      className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center hover:bg-red-500/20 transition-colors"
                      title="Delete this file"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 relative group">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 text-gray-400">
                      <User size={14} />
                      <span className="text-[10px] uppercase font-bold tracking-wider">Uploaded By</span>
                    </div>
                    <button 
                      onClick={() => {
                        const userPhotos = event.photos.filter(p => p.uploader === selectedPhoto.uploader);
                        handleDownloadBatch(userPhotos, `${event.name}-${selectedPhoto.uploader}`);
                      }}
                      className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                      title="Download all from this uploader"
                    >
                      <FileDown size={12} />
                    </button>
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

              {isEditingPhoto ? (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-[#a855f7]" />
                        <span className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-500">People in Photo</span>
                      </div>
                      <button 
                        onClick={handleAddPerson}
                        className="text-xs font-bold text-[#a855f7] hover:text-white transition-colors flex items-center gap-1"
                      >
                        <Plus size={14} /> Add Person
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {editPhotoData.detectedPeople?.map((person, index) => (
                        <div key={index} className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-3 relative">
                          <button 
                            onClick={() => handleRemovePerson(index)}
                            className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition-colors"
                          >
                            <X size={16} />
                          </button>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 block">Name</label>
                              <input 
                                type="text" 
                                value={person.name} 
                                onChange={(e) => handleUpdatePerson(index, 'name', e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#a855f7]"
                                placeholder="Person's name"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 block">Relation</label>
                              <input 
                                type="text" 
                                value={person.relation || ''} 
                                onChange={(e) => handleUpdatePerson(index, 'relation', e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#a855f7]"
                                placeholder="e.g. Friend, Sister"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 block">Gender</label>
                              <select 
                                value={person.gender || 'Unknown'} 
                                onChange={(e) => handleUpdatePerson(index, 'gender', e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#a855f7] appearance-none"
                              >
                                <option value="Unknown">Unknown</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 block">DOB (Optional)</label>
                              <input 
                                type="date" 
                                value={person.dob ? person.dob.split('T')[0] : ''} 
                                onChange={(e) => handleUpdatePerson(index, 'dob', e.target.value ? new Date(e.target.value).toISOString() : '')}
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#a855f7]"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      {(!editPhotoData.detectedPeople || editPhotoData.detectedPeople.length === 0) && (
                        <p className="text-sm text-gray-500 text-center py-4">No people added yet.</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Sparkles size={14} className="text-[#a855f7]" />
                      <span className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-500">Gift Given</span>
                    </div>
                    <input 
                      type="text" 
                      value={editPhotoData.giftGiven || ''} 
                      onChange={(e) => setEditPhotoData(prev => ({ ...prev, giftGiven: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#a855f7]"
                      placeholder="What gift was given? (e.g. Coffee Maker, $100)"
                    />
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-white/5">
                    <button 
                      onClick={() => setIsEditingPhoto(false)}
                      className="flex-1 py-3 rounded-xl border border-white/10 text-sm font-bold hover:bg-white/5 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSavePhotoDetails}
                      className="flex-1 py-3 rounded-xl bg-[#a855f7] text-white text-sm font-bold hover:opacity-90 transition-opacity"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {selectedPhoto.detectedPeople && selectedPhoto.detectedPeople.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Sparkles size={14} className="text-[#a855f7]" />
                        <span className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-500">AI Identified People</span>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {selectedPhoto.detectedPeople.map(person => (
                          <div key={person.name} className="bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition-colors">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#a855f7] to-[#3b82f6] flex items-center justify-center text-sm font-black text-white shadow-lg">
                                  {person.name.charAt(0)}
                                </div>
                                <div>
                                  <h4 className="font-bold text-white">{person.name}</h4>
                                  {person.relation && (
                                    <span className="text-[10px] text-[#a855f7] font-bold uppercase tracking-wider">{person.relation}</span>
                                  )}
                                </div>
                              </div>
                              {person.gender && (
                                <span className="text-[10px] bg-white/10 text-gray-400 px-2 py-1 rounded-lg font-bold uppercase tracking-widest">
                                  {person.gender}
                                </span>
                              )}
                            </div>
                            
                            <div className="flex gap-6">
                              {person.dob && (
                                <div>
                                  <p className="text-[8px] uppercase font-black text-gray-500 tracking-widest mb-0.5">Date of Birth</p>
                                  <p className="text-xs font-bold text-gray-300">{new Date(person.dob).toLocaleDateString()}</p>
                                </div>
                              )}
                              {person.dob && (
                                <div>
                                  <p className="text-[8px] uppercase font-black text-gray-500 tracking-widest mb-0.5">Current Age</p>
                                  <p className="text-xs font-bold text-white">{calculateAge(person.dob)} Years</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedPhoto.giftGiven && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Sparkles size={14} className="text-[#a855f7]" />
                        <span className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-500">Gift Given</span>
                      </div>
                      <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                        <p className="text-sm font-medium text-white">{selectedPhoto.giftGiven}</p>
                      </div>
                    </div>
                  )}

                  {selectedPhoto.visualTags && selectedPhoto.visualTags.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Tag size={14} className="text-[#a855f7]" />
                        <span className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-500">Visual Attributes</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedPhoto.visualTags.map(tag => (
                          <span key={tag} className="text-[10px] bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg font-bold text-gray-300">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

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
      {/* Filter Drawer */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-[#111] border-l border-white/10 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Filter size={20} className="text-[#a855f7]" />
                  Filters & Sorting
                </h2>
                <button 
                  onClick={() => setShowFilters(false)}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Sort Order */}
                <div>
                  <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 mb-3 block">Sort by Date</label>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setSortOrder('desc')}
                      className={`flex-1 py-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${sortOrder === 'desc' ? 'bg-[#a855f7] border-[#a855f7] text-white shadow-lg shadow-[#a855f7]/20' : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'}`}
                    >
                      <ArrowUpDown size={14} className="rotate-180" />
                      Newest First
                    </button>
                    <button 
                      onClick={() => setSortOrder('asc')}
                      className={`flex-1 py-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${sortOrder === 'asc' ? 'bg-[#a855f7] border-[#a855f7] text-white shadow-lg shadow-[#a855f7]/20' : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'}`}
                    >
                      <ArrowUpDown size={14} />
                      Oldest First
                    </button>
                  </div>
                </div>

                {/* User Filter */}
                <div>
                  <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 mb-3 block">Filter by Uploader</label>
                  <div className="flex flex-wrap gap-2">
                    {uploaders.map(uploader => (
                      <button 
                        key={uploader}
                        onClick={() => setUserFilter(uploader)}
                        className={`px-4 py-2 rounded-full border text-xs font-bold transition-all flex items-center gap-2 ${userFilter === uploader ? 'bg-[#3b82f6] border-[#3b82f6] text-white shadow-lg shadow-[#3b82f6]/20' : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'}`}
                      >
                        {userFilter === uploader && <Check size={12} />}
                        {uploader === 'all' ? 'All Users' : uploader}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Person Filter */}
                {allPeople.length > 1 && (
                  <div>
                    <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 mb-3 block">Filter by Person</label>
                    <div className="flex flex-wrap gap-2">
                      {allPeople.map(person => (
                        <button 
                          key={person}
                          onClick={() => setPersonFilter(person)}
                          className={`px-4 py-2 rounded-full border text-xs font-bold transition-all flex items-center gap-2 ${personFilter === person ? 'bg-[#ec4899] border-[#ec4899] text-white shadow-lg shadow-[#ec4899]/20' : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'}`}
                        >
                          {personFilter === person && <Check size={12} />}
                          {person === 'all' ? 'All People' : person}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-white/10 bg-black/20">
                <button 
                  onClick={() => {
                    setSortOrder('desc');
                    setUserFilter('all');
                    setPersonFilter('all');
                    setSearchQuery('');
                  }}
                  className="w-full py-3.5 rounded-xl border border-white/10 text-sm font-bold text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettingsModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#1A1A1A] border border-white/10 rounded-3xl p-6 w-full max-w-md"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Event Settings</h3>
                <button onClick={() => setShowSettingsModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <h4 className="font-bold mb-1">Storage Management</h4>
                  <p className="text-sm text-gray-400 mb-4">Clean up duplicate photos to save space and keep the gallery organized.</p>
                  <button 
                    onClick={() => {
                      handleCleanupDuplicates();
                      setShowSettingsModal(false);
                    }}
                    className="w-full bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 rounded-xl py-3 flex items-center justify-center gap-2 font-bold transition-colors"
                  >
                    <Trash2 size={18} />
                    Group Delete Duplicates
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="bg-[#1A1A1A] w-full max-w-md rounded-3xl overflow-hidden border border-white/10 flex flex-col">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h2 className="text-xl font-bold">Invite Friends</h2>
              <button 
                onClick={() => setShowInviteModal(false)}
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-[#a855f7]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#a855f7]/20">
                  <Share2 className="text-[#a855f7]" size={32} />
                </div>
                <h3 className="text-lg font-bold mb-2">Share Event Link</h3>
                <p className="text-sm text-gray-400">Anyone with this link can join as a guest and upload photos.</p>
              </div>

              <div className="bg-black/40 rounded-2xl p-4 border border-white/5 flex items-center gap-3">
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs text-gray-500 mb-1 font-bold uppercase tracking-widest">Invite Link</p>
                  <p className="text-sm font-mono truncate text-[#a855f7]">
                    {`${window.location.origin}/login?join=${event.id}`}
                  </p>
                </div>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/login?join=${event.id}`);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${copied ? 'bg-green-500 text-white' : 'bg-[#a855f7] text-white hover:opacity-90'}`}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>

              <div className="pt-4">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Or Share Via</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>
                
                <div className="grid grid-cols-4 gap-4">
                  <button className="flex flex-col items-center gap-2 group">
                    <div className="w-12 h-12 rounded-full bg-[#25D366]/10 flex items-center justify-center border border-[#25D366]/20 group-hover:bg-[#25D366]/20 transition-all">
                      <svg className="w-6 h-6 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.067 2.877 1.215 3.076.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </div>
                    <span className="text-[10px] text-gray-500 font-bold">WhatsApp</span>
                  </button>
                  <button className="flex flex-col items-center gap-2 group">
                    <div className="w-12 h-12 rounded-full bg-[#1DA1F2]/10 flex items-center justify-center border border-[#1DA1F2]/20 group-hover:bg-[#1DA1F2]/20 transition-all">
                      <svg className="w-6 h-6 text-[#1DA1F2]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                    </div>
                    <span className="text-[10px] text-gray-500 font-bold">Twitter</span>
                  </button>
                  <button className="flex flex-col items-center gap-2 group">
                    <div className="w-12 h-12 rounded-full bg-[#0088cc]/10 flex items-center justify-center border border-[#0088cc]/20 group-hover:bg-[#0088cc]/20 transition-all">
                      <svg className="w-6 h-6 text-[#0088cc]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.52-1.4.51-.46-.01-1.35-.26-2.01-.48-.81-.27-1.45-.42-1.39-.89.03-.24.36-.49.99-.75 3.88-1.69 6.47-2.8 7.76-3.32 3.69-1.5 4.46-1.76 4.96-1.77.11 0 .35.03.51.16.13.1.17.24.18.33.01.06.02.19.01.28z"/>
                      </svg>
                    </div>
                    <span className="text-[10px] text-gray-500 font-bold">Telegram</span>
                  </button>
                  <button className="flex flex-col items-center gap-2 group">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-all">
                      <X className="text-white" size={20} />
                    </div>
                    <span className="text-[10px] text-gray-500 font-bold">More</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
