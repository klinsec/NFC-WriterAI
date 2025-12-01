import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import NFCWriter from './components/NFCWriter';
import NFCReader from './components/NFCReader';
import { ToastMessage } from './types';

// Toast Notification
const ToastContainer: React.FC<{ toasts: ToastMessage[]; removeToast: (id: string) => void }> = ({ toasts, removeToast }) => (
  <div className="fixed top-4 left-0 right-0 px-4 z-[100] flex flex-col items-center space-y-2 pointer-events-none">
    {toasts.map((toast) => (
      <div
        key={toast.id}
        className={`pointer-events-auto w-full max-w-md p-4 rounded-xl shadow-2xl border flex items-center justify-between animate-slideIn backdrop-blur-md ${
          toast.type === 'success' ? 'bg-green-900/90 border-green-500 text-white' :
          toast.type === 'error' ? 'bg-red-900/90 border-red-500 text-white' :
          'bg-zinc-800/90 border-zinc-600 text-white'
        }`}
      >
        <span className="font-medium text-sm">{toast.text}</span>
      </div>
    ))}
  </div>
);

const Nav: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex justify-center mb-8">
      <div className="bg-zinc-900 p-1 rounded-2xl flex border border-zinc-800 shadow-xl">
        <Link 
          to="/" 
          className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${
            isActive('/') ? 'bg-zinc-100 text-black' : 'text-zinc-500'
          }`}
        >
          Write
        </Link>
        <Link 
          to="/read" 
          className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${
            isActive('/read') ? 'bg-zinc-100 text-black' : 'text-zinc-500'
          }`}
        >
          Read
        </Link>
      </div>
    </div>
  );
}

const App: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [secureError, setSecureError] = useState(false);

  useEffect(() => {
    // Basic environment check
    if (typeof window !== 'undefined' && !window.isSecureContext) {
        setSecureError(true);
    }
  }, []);

  const addToast = (text: string, type: 'success' | 'error' | 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (secureError) {
      return (
          <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center text-white">
              <div className="w-16 h-16 bg-red-900/50 rounded-full flex items-center justify-center mb-4 text-3xl">🚫</div>
              <h1 className="text-2xl font-bold mb-2">Insecure Context</h1>
              <p className="text-zinc-400 max-w-md">
                  NFC requires a secure HTTPS connection. <br/>
                  If you are testing locally, use <code>localhost</code>. <br/>
                  If on mobile, deploy to GitHub Pages with HTTPS.
              </p>
          </div>
      )
  }

  return (
    <HashRouter>
      <div className="min-h-screen text-white font-sans selection:bg-blue-500/30 pb-10">
        
        <header className="pt-12 pb-8 px-6 text-center">
          <h1 className="text-5xl font-black tracking-tighter text-white mb-2">
            NFC<span className="text-blue-500">FORGE</span>
          </h1>
          <p className="text-zinc-500 text-sm font-medium uppercase tracking-widest">
            Advanced Web NFC Tools
          </p>
        </header>

        <main className="container mx-auto px-4 max-w-lg">
          <Nav />
          <Routes>
            <Route path="/" element={<NFCWriter onLog={addToast} />} />
            <Route path="/read" element={<NFCReader onLog={addToast} />} />
          </Routes>
        </main>
        
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
    </HashRouter>
  );
};

export default App;