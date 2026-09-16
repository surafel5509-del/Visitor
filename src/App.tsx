import React from 'react';
import { VistoraProvider, useVistora } from './context/VistoraContext';
import { Navbar } from './components/navigation/Navbar';
import { MobileNav } from './components/navigation/MobileNav';
import { MainContent } from './components/MainContent';
import { MediaViewerModal } from './components/media/MediaViewerModal';
import { SaveCollectionModal } from './components/collections/SaveCollectionModal';
import { CreateModal } from './components/create/CreateModal';
import { AuthModal } from './components/auth/AuthModal';
import { ToastContainer } from './components/ui/ToastContainer';
import { OnboardingModal } from './components/auth/OnboardingModal';
import { ImageEditorModal } from './components/editor/ImageEditorModal';

function AppContent() {
  const {
    isOnboardingOpen,
    setIsOnboardingOpen,
    updateUserPreferences,
    editingMedia,
    setEditingMedia,
    setSelectedCategory,
  } = useVistora();

  // Bulletproof prevention of native mobile browser image long-press context menu / callouts
  React.useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'IMG' ||
          target.tagName === 'VIDEO' ||
          target.closest('img') ||
          target.closest('video') ||
          target.closest('[data-no-callout]') ||
          target.classList.contains('media-shield'))
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    window.addEventListener('contextmenu', handleContextMenu, { capture: true });
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu, { capture: true });
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0E0E0E] text-[#171717] dark:text-[#EAEAEA] font-sans antialiased transition-colors duration-200">
      {/* Sticky Desktop & Mobile Navbar */}
      <Navbar />

      {/* Dynamic Route & Discovery Content */}
      <MainContent />

      {/* Global Overlays & Modals */}
      <MediaViewerModal />
      <SaveCollectionModal />
      <CreateModal />
      <AuthModal />
      <ToastContainer />

      {/* Post-Registration & Preferences Onboarding Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onComplete={(prefs) => {
          updateUserPreferences(prefs);
          if (prefs.preferredCategories && prefs.preferredCategories.length > 0) {
            const primary = prefs.preferredCategories[0].toLowerCase();
            setSelectedCategory(primary);
          }
        }}
      />

      {/* In-Place Image Editor & Visual Filter Studio */}
      {editingMedia && (
        <ImageEditorModal
          media={editingMedia}
          onClose={() => setEditingMedia(null)}
        />
      )}

      {/* Fixed Mobile Bottom Navigation Bar */}
      <MobileNav />
    </div>
  );
}

export default function App() {
  return (
    <VistoraProvider>
      <AppContent />
    </VistoraProvider>
  );
}
