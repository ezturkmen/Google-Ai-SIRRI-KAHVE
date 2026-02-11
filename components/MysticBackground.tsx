
import React from 'react';

const MysticBackground: React.FC = () => {
  return (
    <>
      <div className="mystic-bg" />
      <div className="stars" />
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-900/10 blur-[120px] rounded-full" />
      </div>
    </>
  );
};

export default MysticBackground;
