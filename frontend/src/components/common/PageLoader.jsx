import React from 'react';

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-cream">
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-4 border-beige"></div>
        <div className="absolute inset-0 rounded-full border-4 border-rose border-t-transparent animate-spin"></div>
      </div>
      <p className="font-label text-sm text-brown-light tracking-wide">Stitching things together…</p>
    </div>
  </div>
);

export default PageLoader;
