"use client";
import React, { useState, useRef } from 'react';

export default function BgmPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {
        alert("브라우저 설정에서 오디오 자동 재생을 허용하거나 화면을 한 번 클릭해주세요!");
      });
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex items-center gap-2">
      <audio 
        ref={audioRef} 
        loop 
        src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" // 실제 BGM URL로 교체 가능
      />
      <button 
        onClick={toggleMusic}
        className="bg-white/10 hover:bg-white/20 backdrop-blur-md p-2 rounded-full transition-all border border-white/20 shadow-lg text-lg"
      >
        {isPlaying ? '🔊' : '🔇'}
      </button>
    </div>
  );
}
