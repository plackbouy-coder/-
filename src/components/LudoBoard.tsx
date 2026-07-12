import React from 'react';

export const LudoBoard = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex justify-center items-center w-full h-[600px] p-4">
      <div className="grid grid-cols-15 grid-rows-15 w-[600px] h-[600px] border-4 border-white rounded-lg bg-gray-900 shadow-2xl">
        {/* Ludo layout implementation with grid cells */}
        {/* Placeholder for now, will implement actual quadrants */}
        <div className="col-span-15 row-span-15 flex items-center justify-center">
            {children}
        </div>
      </div>
    </div>
  );
};
