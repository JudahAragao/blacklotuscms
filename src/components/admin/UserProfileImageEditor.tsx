'use client';

import React, { useState } from 'react';
import { Camera } from 'lucide-react';
import MediaPicker from '@/components/admin/MediaPicker';

interface UserProfileImageEditorProps {
  initialImage: string | null;
  email: string;
}

export default function UserProfileImageEditor({ initialImage, email }: UserProfileImageEditorProps) {
  const [image, setImage] = useState(initialImage || '');

  return (
    <div className="flex flex-col items-center justify-center pb-8 border-b border-outline-variant/10">
      <div className="relative group">
        <MediaPicker 
          onSelect={(media) => {
            setImage(media.url);
          }}
        >
          <div className="w-32 h-32 rounded-full bg-surface-container border-2 border-outline-variant/20 flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary/50 transition-all shadow-xl group">
            {image ? (
              <img 
                src={image} 
                alt="Avatar" 
                className="w-full h-full object-cover transition-transform group-hover:scale-110"
              />
            ) : (
              <img 
                src={`https://ui-avatars.com/api/?name=${email}&background=121212&color=f2ca50`}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={24} className="text-white" />
            </div>
          </div>
        </MediaPicker>
        <input type="hidden" name="image" value={image} />
      </div>
      <p className="label-caps text-[9px] text-on-surface-variant/40 mt-4 tracking-widest">Clique para alterar a foto de perfil</p>
    </div>
  );
}
