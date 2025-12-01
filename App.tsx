import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import NFCWriter from './components/NFCWriter';
import NFCReader from './components/NFCReader';
import { ToastMessage } from './types';

// Simple Toast Notification Component
const ToastContainer: React.FC<{ toasts: ToastMessage[]; removeToast: (id: string) => void }> = ({ toasts, removeToast }) => (
  <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-3 pointer-events-none">
    {toasts.map((toast) => (
      <div
        key={toast.id}
        onAnimationEnd={() => setTimeout(() => removeToast(toast.id), 3000)} // Auto remove logic helper
        className={`pointer-events-auto min-w-[300px] p-4 rounded-xl shadow-2xl border flex items-center justify-between transform transition-all duration-300 animate-slideIn ${
          toast.type === 'success' ? 'bg-green-950/90 border-green-500/30 text-green-200' :
          toast.type === 'error' ? 'bg-red-950/90 border-red-500/30 text-red-200' :
          'bg-blue-950/90 border-blue-500/30 text-blue-200'
        }`}
      >
        <span className="text-sm font-medium">{toast.text}</span>
        <button onClick={() => removeToast(toast.id)} className="ml-4 hover:opacity-70">✕</button>
      </div>
    ))}
  </div>
);

// Navigation Header
const Nav: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="flex justify-center mb-10">
      <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 p-1.5 rounded-full flex space-x-1">
        <Link 
          to="/" 
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
            isActive('/') ? 'bg-zinc-100 text-black shadow-lg' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Write
        </Link>
        <Link 
          to="/read" 
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
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
  const [nfcSupported, setNfcSupported] = useState<boolean>(true);

  useEffect(() => {
    if (!('NDEFReader' in window)) {
      setNfcSupported(false);
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
        
        <header className="pt-12 pb-6 text-center px-4">
          <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-400 to-zinc-600 bg-clip-text text-transparent mb-4">
            NFC Forge
          </h1>
          <p className="text-zinc-500 max-w-md mx-auto">
            The advanced web-toolset for NDEF tag management. Deployable. Secure. Fast.
          </p>
          {!nfcSupported && (
             <div className="mt-4 inline-block bg-yellow-900/30 border border-yellow-600/30 text-yellow-200 px-4 py-2 rounded-lg text-sm">
               ⚠️ Web NFC is not supported on this device (Try Chrome on Android)
             </div>
          )}
        </header>

        <main className="container mx-auto px-4 pb-20">
          <Nav />
          
          <Routes>
            <Route path="/" element={<NFCWriter onLog={addToast} />} />
            <Route path="/read" element={<NFCReader onLog={addToast} />} />
          </Routes>
        </main>

        <footer className="text-center text-zinc-700 pb-8 text-sm">
          <p>Designed for GitHub Pages Deployment</p>
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
