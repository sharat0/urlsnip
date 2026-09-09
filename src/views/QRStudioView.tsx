import React, { useState, useRef } from 'react';
import { useLinks } from '../context/LinkContext';
import { getShortUrl } from '../utils/url';
import { QRCodeCanvas } from 'qrcode.react';
import {
  QrCode,
  Download,
  Copy,
  Check,
  Palette,
  Sparkles,
  Link2
} from 'lucide-react';

export const QRStudioView: React.FC = () => {
  const { links, addToast } = useLinks();
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const [selectedLinkId, setSelectedLinkId] = useState<string>(links[0]?.id || '');
  const [customText, setCustomText] = useState<string>('');
  const [fgColor, setFgColor] = useState<string>('#0f172a');
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [size, setSize] = useState<number>(220);
  const [copied, setCopied] = useState(false);

  const activeTargetLink = links.find(l => l.id === selectedLinkId);
  const qrTargetValue = customText.trim()
    ? customText.trim()
    : activeTargetLink
    ? getShortUrl(activeTargetLink.shortCode)
    : 'https://snipurl.com';

  const handleDownload = () => {
    const canvas = canvasContainerRef.current?.querySelector('canvas');
    if (canvas) {
      const imageUri = canvas.toDataURL('image/png');
      const anchor = document.createElement('a');
      anchor.href = imageUri;
      anchor.download = `qr_studio_${activeTargetLink?.shortCode || 'code'}.png`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      addToast('High-resolution QR Code downloaded!', 'success');
    }
  };

  const handleCopyValue = () => {
    navigator.clipboard.writeText(qrTargetValue);
    setCopied(true);
    addToast('Target link copied!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const colorPresets = [
    { name: 'Dark Slate', fg: '#0f172a', bg: '#ffffff' },
    { name: 'Indigo Brand', fg: '#4f46e5', bg: '#eef2ff' },
    { name: 'Emerald Trust', fg: '#059669', bg: '#ecfdf5' },
    { name: 'Violet Glow', fg: '#7c3aed', bg: '#f5f3ff' },
    { name: 'Rose Accent', fg: '#e11d48', bg: '#fff1f2' },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/25">
            <QrCode className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              QR Code Customization Studio
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Design high-res, vector-accurate QR codes for print, campaigns, and digital sharing
            </p>
          </div>
        </div>

        <button
          onClick={handleDownload}
          className="px-5 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-lg shadow-brand-500/20 flex items-center space-x-2 transition-all shrink-0 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export High-Res PNG</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Controls Studio Panel */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Target Link Selector */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-1.5">
              <Link2 className="w-4 h-4 text-brand-500" />
              <span>Select Destination Short Link</span>
            </h3>

            {links.length > 0 ? (
              <select
                value={selectedLinkId}
                onChange={(e) => {
                  setSelectedLinkId(e.target.value);
                  setCustomText('');
                }}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
              >
                {links.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.title || l.shortCode} (/#/r/{l.shortCode})
                  </option>
                ))}
              </select>
            ) : null}

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Or type custom URL / text for QR Code:
              </label>
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="https://example.com/custom-promo"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Color & Preset Customizations */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
            <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-1.5">
              <Palette className="w-4 h-4 text-indigo-500" />
              <span>Color Themes & Custom Palette</span>
            </h3>

            {/* Presets Row */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
                Quick Color Themes:
              </label>
              <div className="flex flex-wrap gap-2">
                {colorPresets.map(preset => (
                  <button
                    key={preset.name}
                    onClick={() => {
                      setFgColor(preset.fg);
                      setBgColor(preset.bg);
                    }}
                    className="px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-2 transition-all hover:scale-105"
                    style={{ backgroundColor: preset.bg, borderColor: preset.fg + '40', color: preset.fg }}
                  >
                    <span className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: preset.fg }} />
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Foreground Color (Dots)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer border border-slate-300 dark:border-slate-700"
                  />
                  <input
                    type="text"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 font-mono text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Background Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer border border-slate-300 dark:border-slate-700"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 font-mono text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Size Slider */}
            <div className="pt-2">
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>QR Dimensions Size:</span>
                <span>{size}px x {size}px</span>
              </div>
              <input
                type="range"
                min="140"
                max="320"
                step="10"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full accent-brand-600 cursor-pointer"
              />
            </div>

          </div>

        </div>

        {/* Right Studio Live Canvas Preview */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="w-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-8 shadow-xl text-center space-y-6">
            
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Live Render Canvas</span>
            </div>

            {/* QR Canvas Box */}
            <div
              ref={canvasContainerRef}
              className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-inner mx-auto transition-all"
              style={{ backgroundColor: bgColor }}
            >
              <QRCodeCanvas
                value={qrTargetValue}
                size={size}
                fgColor={fgColor}
                bgColor={bgColor}
                level="H"
                includeMargin={true}
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 truncate max-w-xs mx-auto">
                {qrTargetValue}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-center space-x-2 pt-2">
              <button
                onClick={handleDownload}
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md flex items-center space-x-2 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download PNG</span>
              </button>

              <button
                onClick={handleCopyValue}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors flex items-center space-x-1.5"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy URL'}</span>
              </button>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
