'use client';

import React, { useState } from 'react';
import MediaPicker from './MediaPicker';

interface MediaPickerInputProps {
  name: string;
  defaultValue?: string;
}

export default function MediaPickerInput({ name, defaultValue }: MediaPickerInputProps) {
  const [value, setValue] = useState(defaultValue || '');

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name={name} value={value} />
      <MediaPicker 
        currentValue={value}
        onSelect={(media) => {
          setValue(media.url);
        }}
      />
    </div>
  );
}
