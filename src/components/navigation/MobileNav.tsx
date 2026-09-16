import React from 'react';
import { Compass, Sparkles, Plus, Bookmark, User } from 'lucide-react';
import { useVistora, ActiveTab } from '../../context/VistoraContext';

export const MobileNav: React.FC = () => {
  const {
    currentTab,
    setCurrentTab,
    setIsCreateModalOpen,
    setSelectedCreatorUsername,
    currentUser,
    setSearchQuery,
    setSelectedIdeaSlug,
    setSelectedCollectionId,
  } = useVistora();

  const handleNavClick = (tab: ActiveTab) => {
    setSearchQuery('');
    setSelectedIdeaSlug(null);
    setSelectedCollectionId(null);
    if (tab === 'creator') {
      setSelectedCreatorUsername(currentUser.username);
    } else {
      setSelectedCreatorUsername(null);
    }
    setCurrentTab(tab);
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#111111]/95 backdrop-blur-md border-t border-[#EAEAEA] dark:border-[#222222] px-2 py-1.5 transition-colors">
      <div className="flex items-center justify-around">
        {/* Home */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex flex-col items-center justify-center p-2 rounded-xl transition-colors cursor-pointer"
        >
          <Compass
            className={`w-5 h-5 ${
              currentTab === 'home' ? 'text-[#FFD21F] stroke-[2.5]' : 'text-[#666666] dark:text-[#A0A0A0]'
            }`}
          />
          <span
            className={`text-[10px] mt-1 font-semibold ${
              currentTab === 'home' ? 'text-[#171717] dark:text-white font-bold' : 'text-[#666666] dark:text-[#A0A0A0]'
            }`}
          >
            Home
          </span>
        </button>

        {/* Explore */}
        <button
          onClick={() => handleNavClick('explore')}
          className="flex flex-col items-center justify-center p-2 rounded-xl transition-colors cursor-pointer"
        >
          <Sparkles
            className={`w-5 h-5 ${
              currentTab === 'explore' ? 'text-[#FFD21F] stroke-[2.5]' : 'text-[#666666] dark:text-[#A0A0A0]'
            }`}
          />
          <span
            className={`text-[10px] mt-1 font-semibold ${
              currentTab === 'explore' ? 'text-[#171717] dark:text-white font-bold' : 'text-[#666666] dark:text-[#A0A0A0]'
            }`}
          >
            Explore
          </span>
        </button>

        {/* Create (Centered Yellow Button) */}
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex flex-col items-center justify-center p-2 rounded-xl transition-transform active:scale-95 cursor-pointer -mt-4"
        >
          <div className="w-11 h-11 rounded-full bg-[#FFD21F] hover:bg-[#F2C410] text-[#171717] flex items-center justify-center shadow-md">
            <Plus className="w-6 h-6 stroke-[3]" />
          </div>
          <span className="text-[10px] mt-1 font-bold text-[#171717] dark:text-white">
            Create
          </span>
        </button>

        {/* Saved (Collections) */}
        <button
          onClick={() => handleNavClick('collections')}
          className="flex flex-col items-center justify-center p-2 rounded-xl transition-colors cursor-pointer"
        >
          <Bookmark
            className={`w-5 h-5 ${
              currentTab === 'collections' ? 'text-[#FFD21F] stroke-[2.5]' : 'text-[#666666] dark:text-[#A0A0A0]'
            }`}
          />
          <span
            className={`text-[10px] mt-1 font-semibold ${
              currentTab === 'collections' ? 'text-[#171717] dark:text-white font-bold' : 'text-[#666666] dark:text-[#A0A0A0]'
            }`}
          >
            Saved
          </span>
        </button>

        {/* Profile */}
        <button
          onClick={() => handleNavClick('creator')}
          className="flex flex-col items-center justify-center p-2 rounded-xl transition-colors cursor-pointer"
        >
          <User
            className={`w-5 h-5 ${
              currentTab === 'creator' ? 'text-[#FFD21F] stroke-[2.5]' : 'text-[#666666] dark:text-[#A0A0A0]'
            }`}
          />
          <span
            className={`text-[10px] mt-1 font-semibold ${
              currentTab === 'creator' ? 'text-[#171717] dark:text-white font-bold' : 'text-[#666666] dark:text-[#A0A0A0]'
            }`}
          >
            Profile
          </span>
        </button>
      </div>
    </div>
  );
};
