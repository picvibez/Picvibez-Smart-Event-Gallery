import React, { createContext, useContext, useState, ReactNode } from 'react';

export type EventType = 'Wedding' | 'House Warming' | 'Engagement' | 'Birthday' | 'Corporate' | 'Graduation' | 'Baby Shower' | 'Anniversary' | 'Reunion' | 'Party' | 'Other';

export interface DetectedPerson {
  name: string;
  dob?: string; // ISO date string
  gender?: 'Male' | 'Female' | 'Other' | 'Unknown';
  relation?: string; // e.g., "Father", "Friend"
}

export interface Photo {
  id: string;
  url: string;
  eventId: string;
  uploader: string;
  uploaderId: string;
  uploadedAt: string;
  nameCluster?: string; // e.g., "John's Photos", "Bride & Groom"
  detectedPeople?: DetectedPerson[]; // Detailed info about people identified in the photo
  visualTags?: string[]; // Visual attributes like "red dress", "blue shirt", "child", "adult"
  giftGiven?: string; // Gift given in the event
  type: 'image' | 'video' | 'gif';
  folderName?: string; // For local directory organization
  fileName?: string;
  fileSize?: number;
}

export interface LocalFolder {
  id: string;
  name: string;
  photos: Photo[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

export interface AppEvent {
  id: string;
  name: string;
  type: EventType;
  date: string;
  startDate?: string;
  endDate?: string;
  location: string;
  coverImage: string;
  photos: Photo[];
}

interface AppContextType {
  events: AppEvent[];
  localFolders: LocalFolder[];
  addEvent: (event: Omit<AppEvent, 'id' | 'photos'> & { id?: string }) => string;
  eventPasses: number;
  setEventPasses: (passes: number) => void;
  autoUpload: boolean;
  setAutoUpload: (val: boolean) => void;
  autoUploadEvents: string[];
  toggleAutoUploadForEvent: (eventId: string, enabled: boolean) => void;
  mergeEvents: (event1Id: string, event2Id: string, newName: string) => void;
  addPhoto: (eventId: string, photo: Omit<Photo, 'id' | 'eventId' | 'uploadedAt' | 'uploaderId'>) => void;
  deletePhoto: (eventId: string, photoId: string) => void;
  deletePhotos: (eventId: string, photoIds: string[]) => void;
  updatePhotoDetails: (eventId: string, photoId: string, details: Partial<Photo>) => void;
  addLocalFolder: (folder: LocalFolder) => void;
  updatePhotoClusters: (eventId: string, clusters: { clusterName: string; photoIds: string[]; detectedPeople?: Record<string, any[]>; visualTags?: Record<string, string[]> }[]) => void;
  isAuthenticated: boolean;
  currentUser: User | null;
  login: () => void;
  guestLogin: (name: string) => void;
  logout: () => void;
}

const defaultEvents: AppEvent[] = [
  {
    id: '1',
    name: 'Smith-Muller Wedding',
    type: 'Wedding',
    date: 'OCT 12',
    location: 'The Glass House, NY',
    coverImage: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=800&auto=format&fit=crop',
    photos: [
      { id: 'p1', url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=400', eventId: '1', uploader: 'Alice', uploaderId: 'u1', uploadedAt: new Date().toISOString(), nameCluster: 'Bride & Groom', type: 'image' },
      { id: 'p2', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=400', eventId: '1', uploader: 'Bob', uploaderId: 'u2', uploadedAt: new Date().toISOString(), nameCluster: 'Guests', type: 'image' },
    ]
  },
  {
    id: '2',
    name: 'Global Tech Summit',
    type: 'Other',
    date: 'OCT 15',
    location: 'Convention Center, SF',
    coverImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop',
    photos: []
  }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<AppEvent[]>(defaultEvents);
  const [localFolders, setLocalFolders] = useState<LocalFolder[]>([]);
  const [eventPasses, setEventPasses] = useState<number>(0);
  const [autoUpload, setAutoUpload] = useState(false);
  const [autoUploadEvents, setAutoUploadEvents] = useState<string[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const toggleAutoUploadForEvent = (eventId: string, enabled: boolean) => {
    setAutoUploadEvents(prev => 
      enabled ? [...prev, eventId] : prev.filter(id => id !== eventId)
    );
  };

  const login = () => {
    setIsAuthenticated(true);
    setCurrentUser({
      id: 'u_me',
      name: 'You',
      email: 'you@example.com',
      role: 'admin' // Making the user admin for testing purposes as requested
    });
  };

  const guestLogin = (name: string) => {
    setIsAuthenticated(true);
    setCurrentUser({
      id: `u_guest_${Math.random().toString(36).substr(2, 9)}`,
      name: name,
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@guest.picvibez.com`,
      role: 'user'
    });
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const addEvent = (eventData: Omit<AppEvent, 'id' | 'photos'> & { id?: string }) => {
    const newId = eventData.id || Math.random().toString(36).substr(2, 9);
    const newEvent: AppEvent = {
      ...eventData,
      id: newId,
      photos: []
    };
    setEvents([newEvent, ...events]);
    return newId;
  };

  const mergeEvents = (event1Id: string, event2Id: string, newName: string) => {
    const e1 = events.find(e => e.id === event1Id);
    const e2 = events.find(e => e.id === event2Id);
    if (!e1 || !e2) return;

    const mergedEvent: AppEvent = {
      id: Math.random().toString(36).substr(2, 9),
      name: newName,
      type: e1.type,
      date: e1.date,
      location: e1.location,
      coverImage: e1.coverImage,
      photos: [...e1.photos.map(p => ({...p, eventId: 'merged'})), ...e2.photos.map(p => ({...p, eventId: 'merged'}))]
    };

    setEvents(prev => [mergedEvent, ...prev.filter(e => e.id !== event1Id && e.id !== event2Id)]);
  };

  const addPhoto = (eventId: string, photoData: Omit<Photo, 'id' | 'eventId' | 'uploadedAt' | 'uploaderId'>) => {
    setEvents(prev => prev.map(e => {
      if (e.id === eventId) {
        return {
          ...e,
          photos: [...e.photos, { 
            ...photoData, 
            id: Math.random().toString(36).substr(2, 9), 
            eventId, 
            uploaderId: currentUser?.id || 'anonymous',
            uploadedAt: new Date().toISOString() 
          }]
        };
      }
      return e;
    }));
  };

  const deletePhoto = (eventId: string, photoId: string) => {
    setEvents(prev => prev.map(e => {
      if (e.id === eventId) {
        return {
          ...e,
          photos: e.photos.filter(p => p.id !== photoId)
        };
      }
      return e;
    }));
  };

  const deletePhotos = (eventId: string, photoIds: string[]) => {
    setEvents(prev => prev.map(e => {
      if (e.id === eventId) {
        return {
          ...e,
          photos: e.photos.filter(p => !photoIds.includes(p.id))
        };
      }
      return e;
    }));
  };

  const addLocalFolder = (folder: LocalFolder) => {
    setLocalFolders(prev => [folder, ...prev]);
  };

  const updatePhotoDetails = (eventId: string, photoId: string, details: Partial<Photo>) => {
    setEvents(prev => prev.map(event => {
      if (event.id !== eventId) return event;
      return {
        ...event,
        photos: event.photos.map(photo => {
          if (photo.id !== photoId) return photo;
          return { ...photo, ...details };
        })
      };
    }));
  };

  const updatePhotoClusters = (eventId: string, clusters: { clusterName: string; photoIds: string[]; detectedPeople?: Record<string, any[]>; visualTags?: Record<string, string[]> }[]) => {
    setEvents(prev => prev.map(event => {
      if (event.id !== eventId) return event;
      
      const updatedPhotos = event.photos.map(photo => {
        const cluster = clusters.find(c => c.photoIds.includes(photo.id));
        const people = clusters.find(c => c.detectedPeople?.[photo.id])?.detectedPeople?.[photo.id];
        const tags = clusters.find(c => c.visualTags?.[photo.id])?.visualTags?.[photo.id];
        
        if (cluster || people || tags) {
          return { 
            ...photo, 
            nameCluster: cluster?.clusterName || photo.nameCluster,
            detectedPeople: people || photo.detectedPeople,
            visualTags: tags || photo.visualTags
          };
        }
        return photo;
      });
      
      return { ...event, photos: updatedPhotos };
    }));
  };

  return (
    <AppContext.Provider value={{ 
      events, 
      localFolders,
      addEvent, 
      eventPasses, 
      setEventPasses, 
      autoUpload, 
      setAutoUpload, 
      autoUploadEvents,
      toggleAutoUploadForEvent,
      mergeEvents, 
      addPhoto, 
      deletePhoto,
      deletePhotos,
      updatePhotoDetails,
      addLocalFolder,
      updatePhotoClusters,
      isAuthenticated, 
      currentUser,
      login, 
      guestLogin,
      logout 
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
