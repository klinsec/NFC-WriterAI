import React, { useState } from 'react';
import { RecordType, SocialPlatform } from '../types';
import { SOCIAL_PREFIXES, SOCIAL_ICONS, SOCIAL_SCHEMES } from '../constants';
import { generateTagContent } from '../services/geminiService';

interface NFCWriterProps {
  onLog: (msg: string, type: 'success' | 'error' | 'info') => void;
}

const NFCWriter: React.FC<NFCWriterProps> = ({ onLog }) => {
  const [activeTab, setActiveTab] = useState<'text' | 'url' | 'social' | 'ai'>('url');
  const [isWriting, setIsWriting] = useState(false);

  // Form States
  const [textVal, setTextVal] = useState('');
  const [urlVal, setUrlVal] = useState('');
  const [socialUser, setSocialUser] = useState('');
  const [socialPlatform, setSocialPlatform] = useState<SocialPlatform>(SocialPlatform.INSTAGRAM);
  const [useDeepLink, setUseDeepLink] = useState(false);
  
  // AI State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const handleAIBSGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const result = await generateTagContent(aiPrompt);
      setTextVal(result);
      setActiveTab('text');
      if (result.includes("disabled") || result.includes("Error")) {
          onLog("AI Service unavailable (see text box)", 'info');
      } else {
          onLog("Content generated! Ready to write.", 'success');
      }
    } catch (e) {
      onLog("Failed to generate AI content.", 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const getRecordPayload = (): any => {
    switch (activeTab) {
      case 'url':
        let finalUrl = urlVal.trim();
        if (!finalUrl) return null;
        if (!finalUrl.startsWith('http')) finalUrl = `https://${finalUrl}`;
        return {
          recordType: "url",
          data: finalUrl
        };
      case 'social':
        const cleanUser = socialUser.replace(/^@/, '').trim();
        if (!cleanUser) return null;
        let fullLink = '';

        if (useDeepLink && SOCIAL_SCHEMES[socialPlatform]) {
          fullLink = `${SOCIAL_SCHEMES[socialPlatform]}${cleanUser}`;
        } else {
          const prefix = SOCIAL_PREFIXES[socialPlatform];
          fullLink = `${prefix}${cleanUser}`;
        }

        return {
          recordType: "url",
          data: fullLink
        };
      case 'text':
      default:
        if (!textVal) return null;
        return {
          recordType: "text",
          data: textVal
        };
    }
  };

  const writeToTag = async () => {
    if (!('NDEFReader' in window)) {
      onLog("Hardware Error: NFC not supported on this device.", 'error');
      return;
    }

    const payload = getRecordPayload();
    if (!payload) {
        onLog("Please enter content to write.", 'error');
        return;
    }

    setIsWriting(true);
    onLog("APPROACH TAG NOW...", 'info');

    try {
      // @ts-ignore
      const ndef = new window.NDEFReader();
      await ndef.write({ records: [payload] });
      onLog("✅ SUCCESS! Tag Written.", 'success');
    } catch (error: any) {
      console.error(error);
      onLog(`Write Failed: ${error.message || "Unknown error"}`, 'error');
    } finally {
      setIsWriting(false);
    }
  };

  return (
    <div className="w-full bg-zinc-900 rounded-2xl border border-zinc-800 p-4 sm:p-6 shadow-2xl mb-24">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Write Data</h2>
        <p className="text-zinc-400 text-sm">Create actions for your NFC tag.</p>
      </div>

      {/* Mobile-friendly horizontal scroll tabs */}
      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
        {[
          { id: 'url', label: '🔗 Link' },
          { id: 'social', label: '📱 Social' },
          { id: 'text', label: '📝 Text' },
          { id: 'ai', label: '🤖 AI Magic' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-5 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex-shrink-0 border ${
              activeTab === tab.id
                ? 'bg-blue-600 border-blue-500 text-white shadow-lg'
                : 'bg-zinc-800 border-zinc-700 text-zinc-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {activeTab === 'url' && (
          <div className="animate-fadeIn">
            <label className="block text-sm font-medium text-zinc-300 mb-2">Website URL</label>
            <input
              type="url"
              placeholder="example.com"
              value={urlVal}
              onChange={(e) => setUrlVal(e.target.value)}
              className="w-full bg-black border border-zinc-700 rounded-xl px-4 py-4 text-white text-base focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        )}

        {activeTab === 'social' && (
          <div className="animate-fadeIn space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {Object.values(SocialPlatform).map((platform) => (
                <button
                  key={platform}
                  onClick={() => setSocialPlatform(platform)}
                  className={`flex items-center space-x-3 p-3 rounded-xl border transition-all text-left ${
                    socialPlatform === platform
                      ? 'border-purple-500 bg-purple-500/20 text-white'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-400'
                  }`}
                >
                  <span className="text-xl">{SOCIAL_ICONS[platform]}</span>
                  <span className="capitalize text-sm font-medium">{platform}</span>
                </button>
              ))}
            </div>
            
            <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Username / Handle</label>
                <input
                    type="text"
                    placeholder="username"
                    value={socialUser}
                    onChange={(e) => setSocialUser(e.target.value)}
                    className="w-full bg-black border border-zinc-700 rounded-xl px-4 py-4 text-white text-base focus:outline-none focus:border-purple-500 transition-colors"
                />
            </div>

            <div className="flex items-center justify-between bg-zinc-800/50 p-4 rounded-xl border border-zinc-700/50">
              <div className="pr-4">
                <span className="text-white font-medium block">Native App Launch</span>
                <span className="text-xs text-zinc-400 block mt-1">Try to open Instagram/Twitter app directly instead of browser.</span>
              </div>
              <button 
                onClick={() => setUseDeepLink(!useDeepLink)}
                className={`w-14 h-8 rounded-full transition-colors relative ${
                  useDeepLink ? 'bg-purple-600' : 'bg-zinc-600'
                }`}
              >
                <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform ${
                    useDeepLink ? 'left-7' : 'left-1'
                }`} />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'text' && (
          <div className="animate-fadeIn">
            <label className="block text-sm font-medium text-zinc-300 mb-2">Content</label>
            <textarea
              rows={6}
              value={textVal}
              onChange={(e) => setTextVal(e.target.value)}
              className="w-full bg-black border border-zinc-700 rounded-xl px-4 py-4 text-white text-base focus:outline-none focus:border-green-500 font-mono"
            />
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="animate-fadeIn">
             <div className="p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl border border-blue-500/30">
                <label className="block text-sm font-medium text-blue-200 mb-2">Describe your tag</label>
                <textarea
                    rows={3}
                    placeholder="e.g. A wifi password for my guests..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="w-full bg-black/50 border border-blue-500/30 rounded-lg px-4 py-3 text-white text-base mb-4 focus:outline-none focus:border-blue-400"
                />
                <button
                    onClick={handleAIBSGenerate}
                    disabled={aiLoading}
                    className="w-full py-3 bg-blue-600 rounded-lg font-bold text-white shadow-lg shadow-blue-900/20"
                >
                    {aiLoading ? "Generating..." : "Generate Content"}
                </button>
             </div>
          </div>
        )}
      </div>

      {activeTab !== 'ai' && (
          <button
            onClick={writeToTag}
            disabled={isWriting}
            className={`w-full mt-8 py-5 rounded-2xl font-bold text-xl tracking-wide transition-all shadow-xl active:scale-95 ${
                isWriting
                ? 'bg-zinc-800 text-zinc-500'
                : 'bg-white text-black hover:bg-zinc-200'
            }`}
            >
            {isWriting ? "HOLD NEAR TAG..." : "WRITE TAG"}
            </button>
      )}
    </div>
  );
};

export default NFCWriter;