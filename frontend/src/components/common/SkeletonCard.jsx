import React from 'react';

const SkeletonCard = () => (
  <div className="animate-pulse">
    <div className="rounded-cozy aspect-[4/5] shimmer-bg mb-3" />
    <div className="h-3.5 shimmer-bg rounded-full w-3/4 mb-2" />
    <div className="h-3 shimmer-bg rounded-full w-1/3 mb-2" />
    <div className="h-4 shimmer-bg rounded-full w-1/2" />
  </div>
);

export const SkeletonGrid = ({ count = 8 }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-7">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export default SkeletonCard;
