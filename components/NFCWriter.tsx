import React, { useState, useCallback } from 'react';
import { NFCRecordData, RecordType, SocialPlatform } from '../types';
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
      setActiveTab('text'); // Switch to text tab to review/write
      onLog("Content generated! Ready to write.", 'success');
    } catch (e) {
      onLog("Failed to generate AI content.", 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const getRecordPayload = (): any => {
    switch (activeTab) {
      case 'url':
        return {
          recordType: "url",
          data: urlVal.startsWith('http') ? urlVal : `https://${urlVal}`
        };
      case 'social':
        const cleanUser = socialUser.replace(/^@/, '');
        let fullLink = '';

        if (useDeepLink && SOCIAL_SCHEMES[socialPlatform]) {
          // Use Deep Link (URI Scheme)
          // Note: Some apps require specific IDs, but username works for Insta/Twitter usually
          fullLink = `${SOCIAL_SCHEMES[socialPlatform]}${cleanUser}`;
        } else {
          // Use Standard Web Link
          const prefix = SOCIAL_PREFIXES[socialPlatform];
          fullLink = `${prefix}${cleanUser}`;
        }

        return {
          recordType: "url",
          data: fullLink
        };
      case 'text':
      default:
        return {
          recordType: "text",
          data: textVal
        };
    }
  };

  const writeToTag = async () => {
    if (!('NDEFReader' in window)) {
      onLog("Web NFC is not supported. Use Chrome on Android with HTTPS.", 'error');
      return;
    }

    setIsWriting(true);
    onLog("Approach an NFC tag to write...", 'info');

    try {
      // @ts-ignore - Web NFC API
      const ndef = new window.NDEFReader();
      const payload = getRecordPayload();
      
      await ndef.write({ records: [payload] });
      onLog("Successfully wrote to tag!", 'success');
    } catch (error: any) {
      console.error(error);
      onLog(`Write failed: ${error.message || error}`, 'error');
    } finally {
      setIsWriting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-zinc-900 rounded-2xl border border-zinc-800 p-6 shadow-2xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Write to Tag</h2>
        <p className="text-zinc-400">Select a mode to program your NFC tag.</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
        {[
          { id: 'url', label: 'Link / URL' },
          { id: 'social', label: 'Social Profile' },
          { id: 'text', label: 'Raw Text' },
          { id: 'ai', label: 'Magic (AI)' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="min-h-[200px] mb-6">
        {activeTab === 'url' && (
          <div className="space-y-4 animate-fadeIn">
            <label className="block text-sm font-medium text-zinc-300">Destination URL</label>
            <input
              type="text"
              placeholder="google.com"
              value={urlVal}
              onChange={(e) => setUrlVal(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <p className="text-xs text-zinc-500">Must be a valid web address.</p>
          </div>
        )}

        {activeTab === 'social' && (
          <div className="space-y-4 animate-fadeIn">
            <label className="block text-sm font-medium text-zinc-300">Platform</label>
            <div className="grid grid-cols-3 gap-3">
              {Object.values(SocialPlatform).map((platform) => (
                <button
                  key={platform}
                  onClick={() => setSocialPlatform(platform)}
                  className={`flex items-center justify-center space-x-2 py-3 rounded-xl border transition-all ${
                    socialPlatform === platform
                      ? 'border-purple-500 bg-purple-500/10 text-white'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-500 hover:border-zinc-600'
                  }`}
                >
                  <span>{SOCIAL_ICONS[platform]}</span>
                  <span className="capitalize text-xs hidden sm:inline">{platform}</span>
                </button>
              ))}
            </div>
            
            <label className="block text-sm font-medium text-zinc-300 pt-2">Username</label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-zinc-500">@</span>
              <input
                type="text"
                placeholder="username"
                value={socialUser}
                onChange={(e) => setSocialUser(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl pl-8 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>

            {/* Deep Link Toggle */}
            <div className="pt-2 flex items-center justify-between bg-zinc-950/50 p-3 rounded-xl border border-zinc-800/50">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-zinc-200">Force App Open</span>
                <span className="text-xs text-zinc-500">Writes specific app protocol (e.g. instagram://)</span>
              </div>
              <button 
                onClick={() => setUseDeepLink(!useDeepLink)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  useDeepLink ? 'bg-purple-600' : 'bg-zinc-700'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  useDeepLink ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'text' && (
          <div className="space-y-4 animate-fadeIn">
            <label className="block text-sm font-medium text-zinc-300">Plain Text Content</label>
            <textarea
              rows={5}
              placeholder="Enter text here (e.g., Wifi Password, Notes, JSON)"
              value={textVal}
              onChange={(e) => setTextVal(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all font-mono text-sm"
            />
            <div className="text-right text-xs text-zinc-500">{textVal.length} chars (Typ. max 137-800 depending on tag)</div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 rounded-xl p-4 border border-indigo-500/20">
              <p className="text-sm text-indigo-200 mb-3">
                Describe what you want on the tag, and Gemini will generate the formatted content for you.
              </p>
              <textarea
                rows={3}
                placeholder="e.g., 'A funny wifi password message' or 'A JSON business card for John Doe'"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="w-full bg-black/40 border border-indigo-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all mb-3"
              />
              <button
                onClick={handleAIBSGenerate}
                disabled={aiLoading || !aiPrompt.trim()}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-all disabled:opacity-50 flex justify-center items-center"
              >
                {aiLoading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  "✨ Generate & Preview"
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action Button */}
      {activeTab !== 'ai' && (
        <button
          onClick={writeToTag}
          disabled={isWriting}
          className={`w-full py-4 rounded-xl font-bold text-lg tracking-wide transition-all shadow-lg transform active:scale-95 flex items-center justify-center space-x-2 ${
            isWriting
              ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
              : 'bg-white text-black hover:bg-zinc-200 shadow-white/10'
          }`}
        >
          {isWriting ? (
            <>
              <span className="w-5 h-5 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin"></span>
              <span>Writing...</span>
            </>
          ) : (
            <>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>WRITE TO TAG</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default NFCWriter;