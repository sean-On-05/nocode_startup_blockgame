import React from 'react';
import { ScorePopup } from '../game/types';

interface ScorePopupsProps {
  popups: ScorePopup[];
}

export const ScorePopups: React.FC<ScorePopupsProps> = ({ popups }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-40">
      {popups.map((popup) => (
        <div
          key={popup.id}
          style={{
            left: popup.x,
            top: popup.y,
            transform: 'translate(-50%, -50%)',
          }}
          className="absolute flex flex-col items-center justify-center animate-[floatUp_1s_ease-out_forwards]"
        >
          {popup.text && (
            <div
              className={`text-sm sm:text-base font-black tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] ${
                popup.combo && popup.combo >= 4
                  ? 'text-amber-300 scale-110 animate-bounce'
                  : 'text-white'
              }`}
            >
              {popup.text}
            </div>
          )}
          <div
            className={`font-black tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] ${
              popup.points >= 100
                ? 'text-2xl sm:text-3xl text-amber-400'
                : popup.points >= 50
                ? 'text-xl sm:text-2xl text-cyan-300'
                : 'text-lg sm:text-xl text-emerald-400'
            }`}
          >
            +{popup.points}
          </div>
        </div>
      ))}
    </div>
  );
};
