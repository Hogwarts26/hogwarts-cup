"use client";
import React from 'react';

export default function LogoutButton() {
  const handleLogout = () => {
    if (confirm("연회를 마치고 기숙사에서 나가시겠습니까?")) {
      localStorage.removeItem('selectedName');
      window.location.href = '/';
    }
  };

  return (
    <button 
      onClick={handleLogout}
      className="bg-white/10 hover:bg-red-500/20 backdrop-blur-md px-4 py-1.5 rounded-full transition-all border border-white/20 shadow-lg text-[10px] font-black uppercase tracking-widest font-magic"
    >
      Logout
    </button>
  );
}
