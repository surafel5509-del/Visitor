import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Sliders,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Download,
  Bookmark,
  Sparkles,
  RefreshCw,
  Check,
  ZoomIn,
  Eye,
} from 'lucide-react';
import { MediaItem } from '../../types';
import { useVistora } from '../../context/VistoraContext';

interface ImageEditorModalProps {
  media: MediaItem | null;
  onClose: () => void;
}

interface FilterSettings {
  brightness: number; // 50 to 150 (default 100)
  contrast: number; // 50 to 150 (default 100)
  saturation: number; // 0 to 200 (default 100)
  sepia: number; // 0 to 100 (default 0)
  grayscale: number; // 0 to 100 (default 0)
  invert: number; // 0 to 100 (default 0)
  blur: number; // 0 to 10 (default 0)
}

const DEFAULT_FILTERS: FilterSettings = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  sepia: 0,
  grayscale: 0,
  invert: 0,
  blur: 0,
};

export const ImageEditorModal: React.FC<ImageEditorModalProps> = ({ media, onClose }) => {
  const { showToast, setMediaToSave } = useVistora();

  const [filters, setFilters] = useState<FilterSettings>(DEFAULT_FILTERS);
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'adjust' | 'presets' | 'transform'>('adjust');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageObjRef = useRef<HTMLImageElement | null>(null);

  const targetUrl = media?.originalUrl || media?.previewUrl || media?.thumbnailUrl || '';

  // Load image object for canvas rendering
  useEffect(() => {
    if (!targetUrl) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = targetUrl;
    img.onload = () => {
      imageObjRef.current = img;
      renderCanvas();
    };
  }, [targetUrl]);

  // Re-render canvas whenever filters or transformations change
  useEffect(() => {
    if (imageObjRef.current && media) {
      renderCanvas();
    }
  }, [filters, rotation, flipH, flipV, media]);

  const getCssFilterString = () => {
    return `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) sepia(${filters.sepia}%) grayscale(${filters.grayscale}%) invert(${filters.invert}%) blur(${filters.blur}px)`;
  };

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    const img = imageObjRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isRotated90or270 = rotation % 180 !== 0;
    const canvasWidth = isRotated90or270 ? img.naturalHeight : img.naturalWidth;
    const canvasHeight = isRotated90or270 ? img.naturalWidth : img.naturalHeight;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply CSS Filters to context
    ctx.filter = getCssFilterString();

    // Center and rotate / flip
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

    // Draw image centered
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
    ctx.restore();
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    showToast('Filters reset to original', 'info');
  };

  const handleApplyPreset = (presetName: string) => {
    switch (presetName) {
      case 'natural':
        setFilters(DEFAULT_FILTERS);
        break;
      case 'warm-cinematic':
        setFilters({
          brightness: 105,
          contrast: 115,
          saturation: 120,
          sepia: 25,
          grayscale: 0,
          invert: 0,
          blur: 0,
        });
        break;
      case 'monochrome':
        setFilters({
          brightness: 100,
          contrast: 130,
          saturation: 0,
          sepia: 0,
          grayscale: 100,
          invert: 0,
          blur: 0,
        });
        break;
      case 'cyberpunk':
        setFilters({
          brightness: 110,
          contrast: 140,
          saturation: 160,
          sepia: 0,
          grayscale: 0,
          invert: 10,
          blur: 0,
        });
        break;
      case 'vintage':
        setFilters({
          brightness: 95,
          contrast: 90,
          saturation: 85,
          sepia: 50,
          grayscale: 10,
          invert: 0,
          blur: 0,
        });
        break;
    }
    showToast(`Applied preset: ${presetName}`, 'success');
  };

  const handleDownload = () => {
    setIsProcessing(true);
    showToast('Exporting edited visual...', 'info');

    try {
      const canvas = canvasRef.current;
      if (!canvas) throw new Error('Canvas not ready');

      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      const link = document.createElement('a');
      const cleanTitle = (media.title || 'edited-visual').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      link.download = `${cleanTitle}-vistora-edit.jpg`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast('Edited visual downloaded successfully!', 'success');
    } catch (err) {
      showToast('Failed to export edited image', 'warning');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!media) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-5xl h-[90vh] bg-white dark:bg-[#161616] rounded-3xl shadow-2xl overflow-hidden border border-[#E5E5E5] dark:border-[#262626] flex flex-col md:flex-row relative"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-[#171717] dark:hover:text-white rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 transition-colors cursor-pointer z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left / Center Canvas Area */}
        <div className="flex-1 bg-[#0A0A0A] flex flex-col items-center justify-center p-4 relative overflow-hidden">
          {/* Subtle grid backdrop */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          {/* Active Canvas / Image Preview */}
          <div className="relative max-w-full max-h-[70vh] flex items-center justify-center shadow-2xl rounded-xl overflow-hidden">
            <canvas
              ref={canvasRef}
              className="max-w-full max-h-[70vh] object-contain rounded-xl select-none"
              style={{
                filter: getCssFilterString(),
                transform: `rotate(${rotation}deg) scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1})`,
              }}
            />
          </div>

          {/* Bottom Bar Details */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-gray-400">
            <span className="font-mono">{media.width} × {media.height} px</span>
            <span className="truncate max-w-[200px]">{media.title}</span>
          </div>
        </div>

        {/* Right Controls Panel */}
        <div className="w-full md:w-88 sm:w-96 bg-white dark:bg-[#181818] border-t md:border-t-0 md:border-l border-[#EBEBEB] dark:border-[#262626] flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#EBEBEB] dark:border-[#262626] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#FFF4B8] dark:bg-[#FFD21F]/20 flex items-center justify-center text-[#171717] dark:text-[#FFD21F]">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm text-[#171717] dark:text-white">
                  Creative Studio
                </h3>
                <p className="text-[11px] text-gray-500">Fine-tune & export</p>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="text-xs font-semibold text-gray-500 hover:text-[#171717] dark:hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[#EBEBEB] dark:border-[#262626]">
            <button
              onClick={() => setActiveTab('adjust')}
              className={`flex-1 py-2.5 text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'adjust'
                  ? 'border-b-2 border-[#FFD21F] text-[#171717] dark:text-white bg-[#FFF4B8]/10'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Adjust
            </button>
            <button
              onClick={() => setActiveTab('presets')}
              className={`flex-1 py-2.5 text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'presets'
                  ? 'border-b-2 border-[#FFD21F] text-[#171717] dark:text-white bg-[#FFF4B8]/10'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Presets
            </button>
            <button
              onClick={() => setActiveTab('transform')}
              className={`flex-1 py-2.5 text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'transform'
                  ? 'border-b-2 border-[#FFD21F] text-[#171717] dark:text-white bg-[#FFF4B8]/10'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Transform
            </button>
          </div>

          {/* Controls Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {activeTab === 'adjust' && (
              <div className="space-y-4">
                {/* Brightness */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-[#171717] dark:text-gray-200 mb-1">
                    <span>Brightness</span>
                    <span>{filters.brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={filters.brightness}
                    onChange={e => setFilters(f => ({ ...f, brightness: Number(e.target.value) }))}
                    className="w-full accent-[#FFD21F] cursor-pointer"
                  />
                </div>

                {/* Contrast */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-[#171717] dark:text-gray-200 mb-1">
                    <span>Contrast</span>
                    <span>{filters.contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={filters.contrast}
                    onChange={e => setFilters(f => ({ ...f, contrast: Number(e.target.value) }))}
                    className="w-full accent-[#FFD21F] cursor-pointer"
                  />
                </div>

                {/* Saturation */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-[#171717] dark:text-gray-200 mb-1">
                    <span>Saturation</span>
                    <span>{filters.saturation}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={filters.saturation}
                    onChange={e => setFilters(f => ({ ...f, saturation: Number(e.target.value) }))}
                    className="w-full accent-[#FFD21F] cursor-pointer"
                  />
                </div>

                {/* Warmth / Sepia */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-[#171717] dark:text-gray-200 mb-1">
                    <span>Warmth (Sepia)</span>
                    <span>{filters.sepia}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filters.sepia}
                    onChange={e => setFilters(f => ({ ...f, sepia: Number(e.target.value) }))}
                    className="w-full accent-[#FFD21F] cursor-pointer"
                  />
                </div>

                {/* Grayscale */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-[#171717] dark:text-gray-200 mb-1">
                    <span>Black & White</span>
                    <span>{filters.grayscale}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filters.grayscale}
                    onChange={e => setFilters(f => ({ ...f, grayscale: Number(e.target.value) }))}
                    className="w-full accent-[#FFD21F] cursor-pointer"
                  />
                </div>

                {/* Invert */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-[#171717] dark:text-gray-200 mb-1">
                    <span>Film Negative (Invert)</span>
                    <span>{filters.invert}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filters.invert}
                    onChange={e => setFilters(f => ({ ...f, invert: Number(e.target.value) }))}
                    className="w-full accent-[#FFD21F] cursor-pointer"
                  />
                </div>
              </div>
            )}

            {activeTab === 'presets' && (
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: 'natural', label: 'Original Natural', desc: 'No modifications' },
                  { id: 'warm-cinematic', label: 'Warm Cinematic', desc: 'Golden hour mood' },
                  { id: 'monochrome', label: 'Classic Noir', desc: 'High-contrast B&W' },
                  { id: 'cyberpunk', label: 'Vibrant Neon', desc: 'Saturated electric' },
                  { id: 'vintage', label: 'Muted Film', desc: 'Soft 35mm tone' },
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleApplyPreset(p.id)}
                    className="p-3 text-left rounded-2xl border border-[#EAEAEA] dark:border-[#2D2D2D] hover:border-[#FFD21F] hover:bg-[#FFF4B8]/10 dark:hover:bg-[#FFD21F]/10 transition-all cursor-pointer"
                  >
                    <p className="font-bold text-xs text-[#171717] dark:text-white">{p.label}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{p.desc}</p>
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'transform' && (
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Orientation</p>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setRotation(r => (r + 90) % 360)}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl border border-[#EAEAEA] dark:border-[#2D2D2D] hover:border-[#FFD21F] transition-all cursor-pointer"
                  >
                    <RotateCw className="w-5 h-5 text-[#171717] dark:text-white mb-1" />
                    <span className="text-[11px] font-bold">Rotate 90°</span>
                  </button>

                  <button
                    onClick={() => setFlipH(v => !v)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer ${
                      flipH ? 'border-[#FFD21F] bg-[#FFF4B8]/20' : 'border-[#EAEAEA] dark:border-[#2D2D2D]'
                    }`}
                  >
                    <FlipHorizontal className="w-5 h-5 text-[#171717] dark:text-white mb-1" />
                    <span className="text-[11px] font-bold">Flip Horiz</span>
                  </button>

                  <button
                    onClick={() => setFlipV(v => !v)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer ${
                      flipV ? 'border-[#FFD21F] bg-[#FFF4B8]/20' : 'border-[#EAEAEA] dark:border-[#2D2D2D]'
                    }`}
                  >
                    <FlipVertical className="w-5 h-5 text-[#171717] dark:text-white mb-1" />
                    <span className="text-[11px] font-bold">Flip Vert</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="p-4 sm:p-5 border-t border-[#EBEBEB] dark:border-[#262626] space-y-2 bg-[#FAFAFA] dark:bg-[#1A1A1A]">
            <button
              onClick={handleDownload}
              disabled={isProcessing}
              className="w-full py-3 rounded-full bg-[#FFD21F] hover:bg-[#F2C410] active:scale-98 text-[#171717] font-bold text-xs sm:text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Edited Image</span>
            </button>

            <button
              onClick={() => {
                setMediaToSave(media);
                onClose();
              }}
              className="w-full py-2.5 rounded-full bg-white dark:bg-[#252525] border border-[#E5E5E5] dark:border-[#333333] hover:bg-gray-50 text-[#171717] dark:text-white font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Save to Collection</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
