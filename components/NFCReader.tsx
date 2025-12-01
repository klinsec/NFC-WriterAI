import React, { useState, useEffect } from 'react';

interface NFCReaderProps {
  onLog: (msg: string, type: 'success' | 'error' | 'info') => void;
}

const NFCReader: React.FC<NFCReaderProps> = ({ onLog }) => {
  const [isReading, setIsReading] = useState(false);
  const [scannedData, setScannedData] = useState<any[]>([]);

  // Cleanup scan on unmount
  useEffect(() => {
    const abortController = new AbortController();
    return () => {
      abortController.abort();
    };
  }, []);

  const startScan = async () => {
    if (!('NDEFReader' in window)) {
      onLog("Web NFC is not supported on this device/browser.", 'error');
      return;
    }

    setIsReading(true);
    setScannedData([]); // Clear previous
    onLog("Approach an NFC tag to read...", 'info');

    try {
      const abortController = new AbortController();
      // @ts-ignore
      const ndef = new window.NDEFReader();
      await ndef.scan({ signal: abortController.signal });

      ndef.onreading = (event: any) => {
        const { message, serialNumber } = event;
        onLog(`Tag detected! Serial: ${serialNumber}`, 'success');
        
        const records: any[] = [];
        
        for (const record of message.records) {
          const textDecoder = new TextDecoder(record.encoding);
          let content = "";
          
          if (record.recordType === "text") {
            content = textDecoder.decode(record.data);
          } else if (record.recordType === "url") {
            content = textDecoder.decode(record.data);
          } else {
             // Try best effort decode for other types
             try {
                content = textDecoder.decode(record.data);
             } catch (e) {
                content = "Binary/Unknown Data";
             }
          }

          records.push({
            recordType: record.recordType,
            mediaType: record.mediaType,
            id: record.id,
            content: content
          });
        }
        
        setScannedData(records);
        setIsReading(false); // Stop "scanning" UI state after one successful read usually
        // Note: In a real continuos scan app we might keep it true.
      };

      ndef.onreadingerror = () => {
        onLog("Cannot read data from the NFC tag. Try another one?", 'error');
        setIsReading(false);
      };

    } catch (error: any) {
      onLog(`Read error: ${error.message}`, 'error');
      setIsReading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 bg-zinc-900 rounded-2xl border border-zinc-800 p-6 shadow-2xl">
      <div className="mb-6 flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-white mb-1">Read Tag</h2>
           <p className="text-zinc-400 text-sm">View contents of existing tags.</p>
        </div>
        
        {!isReading && scannedData.length === 0 && (
           <button 
             onClick={startScan}
             className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-2 rounded-full font-medium transition-colors border border-zinc-700"
           >
             Start Scan
           </button>
        )}
        
        {isReading && (
            <div className="flex items-center space-x-2 text-blue-400 animate-pulse">
                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                <span>Listening...</span>
            </div>
        )}
      </div>

      {scannedData.length > 0 ? (
        <div className="space-y-4">
          {scannedData.map((record, idx) => (
            <div key={idx} className="bg-black/40 rounded-xl p-4 border border-zinc-800">
               <div className="flex justify-between items-start mb-2">
                 <span className="text-xs font-mono uppercase bg-zinc-800 text-zinc-300 px-2 py-1 rounded">
                    {record.recordType}
                 </span>
                 {record.mediaType && (
                    <span className="text-xs text-zinc-500">{record.mediaType}</span>
                 )}
               </div>
               <p className="text-lg text-white font-mono break-all">{record.content}</p>
            </div>
          ))}
          <button 
             onClick={startScan}
             className="w-full mt-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-all"
           >
             Scan Another
           </button>
        </div>
      ) : (
        <div className="text-center py-10 border-2 border-dashed border-zinc-800 rounded-xl">
           <p className="text-zinc-600">No data scanned yet.</p>
        </div>
      )}
    </div>
  );
};

export default NFCReader;
