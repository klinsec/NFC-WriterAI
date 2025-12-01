import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import NFCWriter from './components/NFCWriter';
import NFCReader from './components/NFCReader';
import { ToastMessage } from './types';

// Simple Toast Notification Component
const ToastContainer: React.FC<{ toasts: ToastMessage[]; removeToast: (id: string) => void }> = ({ toasts, removeToast }) => (
  <div className="fixed bottom-6 left-0 right-0 px-4 z-50 flex flex-col items-center space-y-3 pointer-events-none">
    {toasts.map((toast) => (
      <div
        key={toast.id}
        onAnimationEnd={() => setTimeout(() => removeToast(toast.id), 3000)} // Auto remove logic helper
        className={`pointer-events-auto w-full max-w-md p-4 rounded-xl shadow-2xl border flex items-center justify-between transform transition-all duration-300 animate-slideIn backdrop-blur-md ${
          toast.type === 'success' ? 'bg-green-950/80 border-green-500/30 text-green-200' :
          toast.type === 'error' ? 'bg-red-950/80 border-red-500/30 text-red-200' :
          'bg-blue-950/80 border-blue-500/30 text-blue-200'
        }`}
      >
        <span className="text-sm font-medium">{toast.text}</span>
        <button onClick={() => removeToast(toast.id)} className="ml-4 hover:opacity-70 p-1">✕</button>
      </div>
    ))}
  </div>
);

// Navigation Header
const Nav: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="flex justify-center mb-8 sticky top-4 z-40">
      <div className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 p-1.5 rounded-full flex space-x-1 shadow-2xl">
        <Link 
          to="/" 
          className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
            isActive('/') ? 'bg-zinc-100 text-black shadow-lg' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Write
        </Link>
        <Link 
          to="/read" 
          className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
            isActive('/read') ? 'bg-zinc-100 text-black shadow-lg' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Read
        </Link>
      </div>
    </nav>
  );
}

const App: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [nfcStatus, setNfcStatus] = useState<{supported: boolean, reason?: string}>({ supported: true });

  useEffect(() => {
    // Check for Secure Context first
    if (!window.isSecureContext) {
      setNfcStatus({ 
        supported: false, 
        reason: "HTTPS Required. Web NFC does not work on HTTP/Localhost IP. Deploy to Github Pages or use localhost." 
      });
      return;
    }

    if (!('NDEFReader' in window)) {
      setNfcStatus({ 
        supported: false, 
        reason: "Device not compatible. Please use Google Chrome on Android." 
      });
    }
  }, []);

  const addToast = (text: string, type: 'success' | 'error' | 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, text, type }]);
    // Fallback auto-remove
    setTimeout(() => {
      setToasts((prev) => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <HashRouter>
      <div className="min-h-screen bg-black bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black text-white selection:bg-blue-500/30">
        
        <header className="pt-10 pb-6 text-center px-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-400 to-zinc-600 bg-clip-text text-transparent mb-4">
            NFC Forge
          </h1>
          <p className="text-zinc-500 max-w-md mx-auto text-sm md:text-base leading-relaxed">
            Deployable Web NFC Toolset. Create advanced social tags and automation triggers.
          </p>
          {!nfcStatus.supported && (
             <div className="mt-6 mx-auto max-w-sm bg-yellow-950/40 border border-yellow-600/30 text-yellow-200 px-4 py-3 rounded-xl text-sm text-left flex items-start space-x-3">
               <span className="text-xl">⚠️</span>
               <div>
                  <p className="font-bold mb-1">Feature Restricted</p>
                  <p className="opacity-80">{nfcStatus.reason}</p>
               </div>
             </div>
          )}
        </header>

        <main className="container mx-auto px-4 pb-24">
          <Nav />
          
          <Routes>
            <Route path="/" element={<NFCWriter onLog={addToast} />} />
            <Route path="/read" element={<NFCReader onLog={addToast} />} />
          </Routes>
        </main>

        <footer className="text-center text-zinc-700 pb-8 text-xs fixed bottom-0 w-full bg-gradient-to-t from-black via-black/90 to-transparent pt-8 pointer-events-none">
          <p className="mb-2">v2.0 • Github Pages Ready</p>
        </footer>

        <ToastContainer toasts={toasts} removeToast={removeToast} />
        
        <style>{`
          @keyframes slideIn {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          .animate-slideIn { animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
          .animate-fadeIn { animation: slideIn 0.4s ease-out; }
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
      </div>
    </HashRouter>
  );
};

export default App;