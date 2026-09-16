import React, { useState } from 'react';
import {
  Sparkles,
  Check,
  ArrowRight,
  ShieldCheck,
  Compass,
  Camera,
  Video,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { useVistora } from '../../context/VistoraContext';
import { UserPreferences } from '../../types';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (prefs: UserPreferences) => void;
}

const VISUAL_INTEREST_OPTIONS = [
  { id: 'Architecture', label: 'Architecture & Spaces', icon: '🏛️', desc: 'Brutalist, travertine, modern villas' },
  { id: 'Nature', label: 'Nature & Landscapes', icon: '🌿', desc: 'Mountains, forests, ocean horizons' },
  { id: 'Interior', label: 'Minimalist Interior', icon: '🛋️', desc: 'Nordic living, organic textures' },
  { id: 'Cinematic', label: 'Cinematic Motion', icon: '🎬', desc: 'Atmospheric light, drone drift loops' },
  { id: 'Cyberpunk', label: 'Cyberpunk & Tech', icon: '⚡', desc: 'Neon cityscapes, futuristic design' },
  { id: 'Fashion', label: 'Fashion & Editorial', icon: '👗', desc: 'Runway styling, modern portraits' },
  { id: 'Automotive', label: 'Automotive & Design', icon: '🏎️', desc: 'Classic icons, exotic supercars' },
  { id: 'Abstract', label: 'Abstract & 3D Art', icon: '🎨', desc: 'Geometric renders, sculptured shapes' },
  { id: 'Aesthetic', label: 'Coffee & Aesthetic Life', icon: '☕', desc: 'Warm morning light, slow living' },
  { id: 'Space', label: 'Space & Cosmic', icon: '🌌', desc: 'Nebulae, deep galaxies, astrophotography' },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const { showToast } = useVistora();
  const [step, setStep] = useState<1 | 2 | 'verifying'>(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'Architecture',
    'Nature',
    'Minimalist Interior',
  ]);
  const [preferredMediaType, setPreferredMediaType] = useState<'all' | 'photo' | 'video'>('all');
  const [verifyProgress, setVerifyProgress] = useState(0);

  if (!isOpen) return null;

  const toggleCategory = (catId: string) => {
    setSelectedCategories(prev =>
      prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]
    );
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (selectedCategories.length === 0) {
        showToast('Please select at least one aesthetic interest', 'warning');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      // Begin verification animation
      setStep('verifying');
      let progress = 0;
      const interval = setInterval(() => {
        progress += 25;
        setVerifyProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            const preferences: UserPreferences = {
              preferredCategories: selectedCategories,
              preferredMediaType,
              onboardingCompleted: true,
            };
            onComplete(preferences);
            showToast('Feed personalized based on your visual taste!', 'success');
            onClose();
          }, 600);
        }
      }, 350);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-2xl bg-white dark:bg-[#181818] rounded-3xl shadow-2xl overflow-hidden border border-[#EBEBEB] dark:border-[#282828] relative"
      >
        {/* Progress header */}
        <div className="px-6 pt-6 pb-4 border-b border-[#F0F0F0] dark:border-[#262626]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#FFD21F] bg-[#171717] dark:bg-white/10 px-2.5 py-0.5 rounded-full">
              Personal Curation
            </span>
            <span className="text-xs font-bold text-gray-400">
              {step === 1 ? 'Step 1 of 2' : step === 2 ? 'Step 2 of 2' : 'Verifying Feed'}
            </span>
          </div>

          <div className="w-full h-1.5 bg-[#EEEEEE] dark:bg-[#2A2A2A] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#FFD21F] transition-all duration-300"
              style={{
                width: step === 1 ? '50%' : step === 2 ? '90%' : `${verifyProgress}%`,
              }}
            />
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8">
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-2xl font-black text-[#171717] dark:text-white">
                  What visual content do you love most?
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                  ምን አይነት ምስል ወይም ቪዲዮ ማግኘት ትፈልጋለህ? Select your favorite visual aesthetics to calibrate your home feed.
                </p>
              </div>

              {/* Grid of Interests */}
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5 max-h-[50vh] overflow-y-auto pr-1">
                {VISUAL_INTEREST_OPTIONS.map(opt => {
                  const isSelected = selectedCategories.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => toggleCategory(opt.id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                        isSelected
                          ? 'border-[#FFD21F] bg-[#FFF4B8]/20 dark:bg-[#FFD21F]/15 shadow-sm'
                          : 'border-[#EAEAEA] dark:border-[#2C2C2C] hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-[#1E1E1E]'
                      }`}
                    >
                      <span className="text-2xl shrink-0">{opt.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[#171717] dark:text-white truncate">
                          {opt.label}
                        </p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                          {opt.desc}
                        </p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                          isSelected
                            ? 'bg-[#FFD21F] border-[#FFD21F] text-[#171717]'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#F0F0F0] dark:border-[#262626]">
                <span className="text-xs text-gray-400 font-medium">
                  {selectedCategories.length} selected
                </span>

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-6 py-2.5 rounded-full bg-[#FFD21F] hover:bg-[#F2C410] active:scale-98 text-[#171717] font-bold text-xs sm:text-sm transition-all shadow-md cursor-pointer flex items-center gap-2"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-black text-[#171717] dark:text-white">
                  What media format do you prefer exploring?
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Choose the visual medium that inspires your daily workflow and discovery feed.
                </p>
              </div>

              {/* Media Format Choices */}
              <div className="space-y-3">
                {[
                  {
                    type: 'all',
                    title: 'Both Photography & Cinematic Video',
                    desc: 'A rich balanced mix of high-res still captures and fluid motion clips',
                    icon: Layers,
                  },
                  {
                    type: 'photo',
                    title: 'High-Resolution Photography Only',
                    desc: 'Still architectural compositions, textures, and editorial studies',
                    icon: Camera,
                  },
                  {
                    type: 'video',
                    title: 'Cinematic Videos & Loops Only',
                    desc: 'Slow motion, ocean currents, and ambient visual motion clips',
                    icon: Video,
                  },
                ].map(item => {
                  const isSelected = preferredMediaType === item.type;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => setPreferredMediaType(item.type as any)}
                      className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-[#FFD21F] bg-[#FFF4B8]/20 dark:bg-[#FFD21F]/15 shadow-sm'
                          : 'border-[#EAEAEA] dark:border-[#2C2C2C] hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-[#1E1E1E]'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            isSelected
                              ? 'bg-[#FFD21F] text-[#171717]'
                              : 'bg-gray-100 dark:bg-[#2A2A2A] text-gray-500'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-[#171717] dark:text-white">
                            {item.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {item.desc}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                          isSelected
                            ? 'bg-[#FFD21F] border-[#FFD21F] text-[#171717]'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#F0F0F0] dark:border-[#262626]">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-bold text-gray-500 hover:text-[#171717] dark:hover:text-white cursor-pointer"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-6 py-2.5 rounded-full bg-[#FFD21F] hover:bg-[#F2C410] active:scale-98 text-[#171717] font-bold text-xs sm:text-sm transition-all shadow-md cursor-pointer flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify & Personalize Feed</span>
                </button>
              </div>
            </div>
          )}

          {step === 'verifying' && (
            <div className="py-12 text-center space-y-6">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-[#FFF4B8] dark:border-[#FFD21F]/20" />
                <div
                  className="absolute inset-0 rounded-full border-4 border-[#FFD21F] border-t-transparent animate-spin"
                  style={{ animationDuration: '0.8s' }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-[#171717] dark:text-[#FFD21F]">
                  <Sparkles className="w-8 h-8" />
                </div>
              </div>

              <div>
                <h3 className="font-display text-xl font-bold text-[#171717] dark:text-white">
                  Verifying & Calibrating Feed...
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
                  ምርጫዎችህ እየተረጋገጡ ነው... Loading fresh visual creations matching your selected aesthetic interests.
                </p>
              </div>

              <div className="max-w-xs mx-auto space-y-2 text-left text-xs text-gray-600 dark:text-gray-300 bg-[#F8F8F8] dark:bg-[#202020] p-3.5 rounded-2xl border border-[#EEEEEE] dark:border-[#2D2D2D]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#FFD21F]" />
                  <span>Configured {selectedCategories.length} visual categories</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#FFD21F]" />
                  <span>Optimized for {preferredMediaType === 'all' ? 'Hybrid' : preferredMediaType} delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#FFD21F]" />
                  <span>Dynamic rotation enabled for every visit</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
