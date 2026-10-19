import React, { useState } from 'react';
import { LeaderboardEntry, PlayerProfile } from '../game/types';
import { getGlobalLeaderboard, getFriendLeaderboard, savePlayerProfile } from '../services/leaderboard';
import { Trophy, Globe, Users, Flame, X, Edit3, Check, Search } from 'lucide-react';
import { soundEngine } from '../game/audio';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerProfile: PlayerProfile;
  onProfileUpdated: (updated: PlayerProfile) => void;
  onChallengeFriend?: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  playerProfile,
  onProfileUpdated,
  onChallengeFriend,
}) => {
  const [activeTab, setActiveTab] = useState<'GLOBAL' | 'TODAY' | 'FRIENDS'>('GLOBAL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(playerProfile.name);
  const [editAvatar, setEditAvatar] = useState(playerProfile.avatar);
  const [editCountry, setEditCountry] = useState(playerProfile.country);

  if (!isOpen) return null;

  const { list: globalList, userRank } = getGlobalLeaderboard();
  const friendList = getFriendLeaderboard();

  // Filter based on active tab
  let displayList: LeaderboardEntry[] = [];
  if (activeTab === 'GLOBAL') {
    displayList = globalList;
  } else if (activeTab === 'TODAY') {
    // Today's list: top scores recorded today or seeded
    displayList = globalList.filter((e, idx) => idx % 2 === 0 || e.isUser);
  } else {
    displayList = friendList.length > 0 ? friendList : globalList.slice(0, 10);
  }

  // Filter by search query
  if (searchQuery.trim()) {
    displayList = displayList.filter(
      (e) =>
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.country.includes(searchQuery)
    );
  }

  const handleSaveProfile = () => {
    soundEngine.playButtonClick();
    const updated: PlayerProfile = {
      ...playerProfile,
      name: editName.trim() || '블록마스터',
      avatar: editAvatar,
      country: editCountry,
    };
    savePlayerProfile(updated);
    onProfileUpdated(updated);
    setIsEditingProfile(false);
  };

  const AVATAR_OPTIONS = ['💎', '👑', '⚡', '🚀', '🔥', '🦊', '🐱', '🐉', '🎯', '⭐', '🌸', '🦁'];
  const COUNTRY_OPTIONS = [
    { flag: '🇰🇷', code: 'KR', label: '대한민국' },
    { flag: '🇺🇸', code: 'US', label: '미국' },
    { flag: '🇯🇵', code: 'JP', label: '일본' },
    { flag: '🇩🇪', code: 'DE', label: '독일' },
    { flag: '🇬🇧', code: 'GB', label: '영국' },
    { flag: '🇫🇷', code: 'FR', label: '프랑스' },
    { flag: '🇨🇦', code: 'CA', label: '캐나다' },
    { flag: '🇦🇺', code: 'AU', label: '호주' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]">
      <div className="bg-[#101726] border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">전 세계 리더보드</h2>
              <p className="text-xs text-slate-400">실시간 글로벌 블록블라스트 순위</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundEngine.playButtonClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Status Bar */}
        <div className="px-5 py-3 bg-gradient-to-r from-blue-950/40 via-indigo-950/40 to-slate-900/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{playerProfile.avatar}</span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-white">{playerProfile.name}</span>
                <span className="text-xs">{playerProfile.country}</span>
                <button
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="text-slate-400 hover:text-amber-400 transition-colors p-0.5 ml-1"
                  title="프로필 수정"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <span>최고 기록: <strong className="text-amber-400 tabular-nums">{playerProfile.highScore.toLocaleString()}</strong>점</span>
                <span>·</span>
                <span className="flex items-center gap-0.5 text-rose-400">
                  <Flame className="w-3 h-3" /> {playerProfile.maxCombo} 콤보
                </span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block">내 글로벌 순위</span>
            <span className="text-sm sm:text-base font-extrabold text-amber-400 tabular-nums">
              {userRank ? `#${userRank}위` : '플레이 전'}
            </span>
          </div>
        </div>

        {/* Profile Editor (Inline expand) */}
        {isEditingProfile && (
          <div className="px-5 py-3.5 bg-slate-800/80 border-b border-slate-700/80 flex flex-col gap-3">
            <div className="text-xs font-semibold text-slate-300">내 프로필 수정</div>
            <div className="flex gap-2">
              <input
                type="text"
                value={editName}
                maxLength={14}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="닉네임 입력"
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
              />
              <button
                onClick={handleSaveProfile}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" /> 저장
              </button>
            </div>
            {/* Avatar selector */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <span className="text-[11px] text-slate-400 shrink-0">아바타:</span>
              {AVATAR_OPTIONS.map((av) => (
                <button
                  key={av}
                  onClick={() => setEditAvatar(av)}
                  className={`w-7 h-7 rounded-md text-sm flex items-center justify-center transition-all ${
                    editAvatar === av
                      ? 'bg-amber-500/30 border border-amber-400 scale-110'
                      : 'bg-slate-900 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
            {/* Country selector */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <span className="text-[11px] text-slate-400 shrink-0">국가:</span>
              {COUNTRY_OPTIONS.map((c) => (
                <button
                  key={c.code}
                  onClick={() => setEditCountry(c.flag)}
                  className={`px-2 py-1 rounded text-xs flex items-center gap-1 transition-all ${
                    editCountry === c.flag
                      ? 'bg-amber-500/20 border border-amber-400 text-white'
                      : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span>{c.flag}</span>
                  <span className="text-[10px]">{c.code}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab Buttons & Search */}
        <div className="p-3 border-b border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 bg-slate-900/40">
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg">
            <button
              onClick={() => {
                soundEngine.playButtonClick();
                setActiveTab('GLOBAL');
              }}
              className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'GLOBAL'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>전체 랭킹</span>
            </button>
            <button
              onClick={() => {
                soundEngine.playButtonClick();
                setActiveTab('TODAY');
              }}
              className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'TODAY'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>오늘</span>
            </button>
            <button
              onClick={() => {
                soundEngine.playButtonClick();
                setActiveTab('FRIENDS');
              }}
              className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'FRIENDS'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>친구 대결</span>
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="플레이어 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-44 bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-600"
            />
          </div>
        </div>

        {/* Scrollable Ranking List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-2 sm:p-3">
          {displayList.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              기록된 순위가 없습니다.
            </div>
          ) : (
            displayList.map((entry) => {
              const isFirst = entry.rank === 1;
              const isSecond = entry.rank === 2;
              const isThird = entry.rank === 3;

              return (
                <div
                  key={entry.id + '_' + entry.rank}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${
                    entry.isUser
                      ? 'bg-amber-500/15 border border-amber-400/40'
                      : 'hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Rank Badge */}
                    <div className="w-7 text-center">
                      {isFirst ? (
                        <span className="text-xl">🥇</span>
                      ) : isSecond ? (
                        <span className="text-xl">🥈</span>
                      ) : isThird ? (
                        <span className="text-xl">🥉</span>
                      ) : (
                        <span className="text-xs font-bold text-slate-400 tabular-nums">
                          #{entry.rank}
                        </span>
                      )}
                    </div>

                    {/* Avatar & Flag */}
                    <div className="relative">
                      <span className="text-xl">{entry.avatar}</span>
                      <span className="absolute -bottom-1 -right-1 text-[11px] drop-shadow-sm">
                        {entry.country}
                      </span>
                    </div>

                    {/* Name & Details */}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs sm:text-sm font-bold ${entry.isUser ? 'text-amber-300' : 'text-slate-100'}`}>
                          {entry.name}
                        </span>
                        {entry.isUser && (
                          <span className="text-[10px] text-amber-400 bg-amber-400/10 px-1 rounded font-semibold">
                            나
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                        <span>최고 {entry.maxCombo} 콤보</span>
                        <span>·</span>
                        <span>{entry.date}</span>
                      </div>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <span className="text-sm sm:text-base font-extrabold text-white tabular-nums tracking-tight">
                      {entry.score.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500 block">점수</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with Challenge action */}
        {onChallengeFriend && (
          <div className="p-3 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between gap-3">
            <span className="text-xs text-slate-400 hidden sm:inline">
              친구와 동일한 블록으로 실력 대결을 펼쳐보세요!
            </span>
            <button
              onClick={() => {
                soundEngine.playButtonClick();
                onChallengeFriend();
              }}
              className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <Users className="w-4 h-4" />
              <span>친구에게 대결 신청하기</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
