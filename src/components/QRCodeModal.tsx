import React, { useRef, useState } from 'react';
import { useLinks } from '../context/LinkContext';
import { getShortUrl } from '../utils/url';
import { QRCodeCanvas } from 'qrcode.react';
import { X, Download, Copy, Check, QrCode } from 'lucide-react';

export const QRCodeModal: React.FC = () => {
  const { activeQrModalLink, closeQrModal, addToast } = useLinks();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [fgColor, setFgColor] = useState('#0f172a');
  const [bgColor, setBgColor] = useState('#ffffff');

  if (!activeQrModalLink) return null;

  const fullShortUrl = getShortUrl(activeQrModalLink.shortCode);

  const handleDownload = () => {
    const canvas = canvasRef.current?.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `qr_${activeQrModalLink.shortCode}.png`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      addToast('QR code downloaded as PNG!', 'success');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullShortUrl);
    setCopied(true);
    addToast('Link copied!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={closeQrModal}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="text-center mb-5">
          <div className="w-10 h-10 rounded-2xl bg-brand-100 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto mb-2">
            <QrCode className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
            QR Code Generator
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-xs mx-auto">
            {activeQrModalLink.title || activeQrModalLink.shortCode}
          </p>
        </div>

        {/* QR Code Canvas Box */}
        <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center mb-5" ref={canvasRef}>
          <QRCodeCanvas
            value={fullShortUrl}
            size={180}
            fgColor={fgColor}
            bgColor={bgColor}
            level="H"
            includeMargin={true}
          />
          <div className="mt-3 text-center">
            <div className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
              {activeQrModalLink.shortCode}
            </div>
          </div>
        </div>

        {/* Customization Colors */}
        <div className="flex items-center justify-between mb-5 px-1 text-xs">
          <div className="flex items-center space-x-2">
            <label className="text-slate-600 dark:text-slate-400 font-medium">Foreground:</label>
            <input
              type="color"
              value={fgColor}
              onChange={(e) => setFgColor(e.target.value)}
              className="w-6 h-6 rounded cursor-pointer border border-slate-300 dark:border-slate-700"
            />
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-slate-600 dark:text-slate-400 font-medium">Background:</label>
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="w-6 h-6 rounded cursor-pointer border border-slate-300 dark:border-slate-700"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleDownload}
            className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold flex items-center justify-center space-x-2 shadow-lg shadow-brand-500/25 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download High-Res PNG</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center justify-center space-x-2 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied Link' : 'Copy Short Link'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
