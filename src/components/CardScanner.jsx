import React, { useState, useEffect, useRef } from 'react';
import { createWorker } from 'tesseract.js';
import { matchCardByName, detectCardRegions, preprocessCardTitleCanvas, scanCardRegion } from '../utils/cardRecognizer';
import { optimizeSealedPool } from '../utils/deckOptimizer';
import { cardsData } from '../data/cardsData';
import { archetypesData } from '../data/archetypesData';
import { 
  Camera, RefreshCw, Check, Trash2, Plus, Sparkles, Upload, 
  Loader2, Play, Pause, AlertCircle, Eye, EyeOff, ShieldAlert, 
  RotateCcw, Sliders, ChevronDown, CheckCircle2, Info
} from 'lucide-react';

export default function CardScanner({ onImportToSimulator }) {
  // Skenovací stavy
  const [scanMode, setScanMode] = useState('batch'); // 'batch' (více karet naráz) | 'continuous' (kontinuální video) | 'manual' (ruční)
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [scannedPool, setScannedPool] = useState([]);
  
  // Tesseract Worker
  const [worker, setWorker] = useState(null);
  const [isWorkerLoading, setIsWorkerLoading] = useState(false);

  // Kamerové a kreslící prvky
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

  // Stavy pro Batch Foto (Zpracování)
  const [batchPhoto, setBatchPhoto] = useState(null); // base64 / ImageData
  const [detectedBoxes, setDetectedBoxes] = useState([]); // { id, x, y, width, height, selected }
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0, status: '' });
  const [batchResults, setBatchResults] = useState([]); // { boxId, name, card, confidence, count }

  // Kontinuální stavy
  const [continuousStatus, setContinuousStatus] = useState('Připraven k zahájení kontinuálního skenování');
  const [lastScannedName, setLastScannedName] = useState('');
  const [scanSuccessPulse, setScanSuccessPulse] = useState(false);

  // Ruční zadávání stavy
  const [manualQuery, setManualQuery] = useState('');
  const [manualResults, setManualResults] = useState([]);

  // Nastavení & Zobrazení
  const [showImages, setShowImages] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Výsledek optimalizátoru
  const [optimizationResult, setOptimizationResult] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Načtení uloženého poolu karet z localStorage při mountu
  useEffect(() => {
    const saved = localStorage.getItem('scanned_card_pool');
    if (saved) {
      try {
        setScannedPool(JSON.parse(saved));
      } catch (e) {
        console.error("Nepodařilo se načíst naskenované karty:", e);
      }
    }
    
    // Inicializujeme OCR Worker
    initOCRWorker();

    return () => {
      stopCamera();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Uložení poolu při každé změně
  useEffect(() => {
    localStorage.setItem('scanned_card_pool', JSON.stringify(scannedPool));
  }, [scannedPool]);

  // Inicializace Tesseract Workeru
  const initOCRWorker = async () => {
    setIsWorkerLoading(true);
    try {
      const tWorker = await createWorker('eng');
      setWorker(tWorker);
    } catch (err) {
      console.error("Selhala inicializace Tesseract workeru:", err);
    } finally {
      setIsWorkerLoading(false);
    }
  };

  // Syntetický zvukový tón pro úspěšnou detekci
  const playSuccessSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5 tón
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.04);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.25);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      // Prohlížeč může blokovat autoplay zvuku před interakcí
    }
  };

  // Spuštění fotoaparátu
  const startCamera = async () => {
    setCameraError(null);
    setBatchPhoto(null);
    setDetectedBoxes([]);
    setBatchResults([]);
    
    const constraints = {
      video: {
        facingMode: 'environment', // preferovat zadní kameru
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);

        // Pokud je zvolen kontinuální režim, spustíme interval detekce
        if (scanMode === 'continuous') {
          startContinuousScanningLoop();
        }
      }
    } catch (err) {
      console.error("Chyba při přístupu ke kameře:", err);
      // Fallback pro iOS/starší prohlížeče, které nepodporují facingMode: environment striktně
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = fallbackStream;
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          videoRef.current.play();
          setCameraActive(true);
          if (scanMode === 'continuous') {
            startContinuousScanningLoop();
          }
        }
      } catch (errFallback) {
        setCameraError("Kamera nebyla nalezena nebo přístup byl odepřen. Můžete nahrát fotku ručně.");
      }
    }
  };

  // Zastavení fotoaparátu
  const stopCamera = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // Změna režimu skenování za běhu
  const handleScanModeChange = (mode) => {
    setScanMode(mode);
    stopCamera();
    setBatchPhoto(null);
    setDetectedBoxes([]);
    setBatchResults([]);
    setOptimizationResult(null);
  };

  // Spuštění smyčky pro kontinuální scan
  const startContinuousScanningLoop = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    intervalRef.current = setInterval(async () => {
      if (!videoRef.current || !worker || isWorkerLoading) return;
      
      const video = videoRef.current;
      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Ve video streamu analyzujeme pouze středový obdélník o velikosti 320x180 px (oblast pro název karty)
      const boxW = Math.round(canvas.width * 0.5);
      const boxH = Math.round(canvas.height * 0.25);
      const boxX = Math.round((canvas.width - boxW) / 2);
      const boxY = Math.round((canvas.height - boxH) / 2);

      const ocrCanvas = document.createElement('canvas');
      ocrCanvas.width = boxW;
      ocrCanvas.height = boxH;
      const ocrCtx = ocrCanvas.getContext('2d');
      ocrCtx.drawImage(canvas, boxX, boxY, boxW, boxH, 0, 0, boxW, boxH);

      // Zvýšení kontrastu pro ořez
      const imgData = ocrCtx.getImageData(0, 0, boxW, boxH);
      const d = imgData.data;
      let total = 0;
      for (let i = 0; i < d.length; i += 4) {
        total += (d[i] + d[i+1] + d[i+2]) / 3;
      }
      const avg = total / (d.length / 4);
      for (let i = 0; i < d.length; i += 4) {
        const val = ((d[i] + d[i+1] + d[i+2]) / 3) > avg ? 255 : 0;
        d[i] = d[i+1] = d[i+2] = val;
      }
      ocrCtx.putImageData(imgData, 0, 0);

      setContinuousStatus("Skenuji náhled...");
      try {
        const { data: { text } } = await worker.recognize(ocrCanvas);
        if (text && text.trim().length >= 4) {
          const matchResult = matchCardByName(text);
          if (matchResult && matchResult.confidence > 70) {
            const card = matchResult.card;
            
            // Ověříme, že neduplikujeme ihned stejnou kartu, pokud ji uživatel drží před objektivem
            if (card.name !== lastScannedName) {
              setLastScannedName(card.name);
              playSuccessSound();
              setScanSuccessPulse(true);
              setTimeout(() => setScanSuccessPulse(false), 800);
              
              setScannedPool(prev => {
                const existing = prev.find(item => item.id === card.id);
                if (existing) {
                  return prev.map(item => item.id === card.id ? { ...item, count: item.count + 1 } : item);
                } else {
                  return [...prev, { id: card.id, count: 1 }];
                }
              });
              setContinuousStatus(`Detekováno: ${card.name} (${matchResult.confidence}%)`);
            }
          } else {
            setContinuousStatus("Text detekován, ale karta neodpovídá databázi.");
          }
        } else {
          setContinuousStatus("Hledám text karty...");
        }
      } catch (err) {
        console.error("Chyba v kontinuálním OCR:", err);
      }
    }, 1200); // OCR každých 1.2 sekundy
  };

  // Vyfocení snímku pro Hromadný scan (Batch Scan)
  const captureBatchPhoto = () => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    stopCamera();

    // Detekujeme obdélníky karet na vyfoceném plátně
    const boxes = detectCardRegions(canvas);
    
    // Uložíme canvas a nalezené bounding boxy
    setBatchPhoto(canvas);
    setDetectedBoxes(boxes.map(b => ({ ...b, selected: true })));
    
    if (boxes.length === 0) {
      setContinuousStatus("Na fotce nebyly nalezeny žádné karty. Můžete vyzkoušet jiný úhel nebo přidat ručně.");
    }
  };

  // Spuštění hromadného zpracování detekovaných boxů
  const processBatchQueue = async () => {
    if (!batchPhoto || !worker) return;

    const selectedBoxes = detectedBoxes.filter(b => b.selected);
    if (selectedBoxes.length === 0) {
      alert("Vyberte alespoň jednu oblast karty.");
      return;
    }

    setIsProcessingBatch(true);
    setBatchResults([]);
    
    const results = [];
    const total = selectedBoxes.length;

    for (let i = 0; i < total; i++) {
      const box = selectedBoxes[i];
      setBatchProgress({
        current: i + 1,
        total: total,
        status: `Zpracovávám kartu ${i + 1} z ${total}...`
      });

      // Předzpracování ořezu titulu
      const titleCanvas = preprocessCardTitleCanvas(batchPhoto, box);
      
      // Provedeme OCR
      const scanResult = await scanCardRegion(titleCanvas, worker);
      
      if (scanResult && scanResult.match) {
        results.push({
          boxId: box.id,
          name: scanResult.match.card.name,
          card: scanResult.match.card,
          confidence: scanResult.match.confidence,
          count: 1
        });
      } else {
        // Pokud nebylo OCR úspěšné, dáme možnost uživateli kartu vybrat ručně
        results.push({
          boxId: box.id,
          name: 'Nerozpoznaná karta',
          card: null,
          confidence: 0,
          count: 1,
          rawText: scanResult?.rawText || ''
        });
      }
    }

    setBatchResults(results);
    setIsProcessingBatch(false);
  };

  // Přidání výsledků z hromadného skenu do poolu karet
  const confirmBatchResults = () => {
    setScannedPool(prev => {
      let updated = [...prev];
      batchResults.forEach(res => {
        if (!res.card) return; // přeskočíme nerozpoznané
        const existing = updated.find(item => item.id === res.card.id);
        if (existing) {
          existing.count += res.count;
        } else {
          updated.push({ id: res.card.id, count: res.count });
        }
      });
      return updated;
    });

    // Resetujeme rozhraní
    setBatchPhoto(null);
    setDetectedBoxes([]);
    setBatchResults([]);
    playSuccessSound();
  };

  // Nahrání souboru s fotkou (Fallback pro zařízení bez funkční webkamery)
  const handlePhotoUpload = (e) => {
    const file = e.target.targetFiles ? e.target.targetFiles[0] : e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        stopCamera();
        setBatchPhoto(canvas);
        const boxes = detectCardRegions(canvas);
        setDetectedBoxes(boxes.map(b => ({ ...b, selected: true })));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Změna výběru boxu na plátně před spuštěním OCR
  const toggleBoxSelection = (boxId) => {
    setDetectedBoxes(prev => prev.map(b => b.id === boxId ? { ...b, selected: !b.selected } : b));
  };

  // Změna naskenovaného výsledku v batch review
  const updateBatchResultCard = (boxId, cardId) => {
    const card = cardsData.find(c => c.id === cardId);
    if (!card) return;
    
    setBatchResults(prev => prev.map(res => 
      res.boxId === boxId ? { ...res, name: card.name, card: card, confidence: 100 } : res
    ));
  };

  // Smazání výsledku z dávky před schválením
  const removeBatchResult = (boxId) => {
    setBatchResults(prev => prev.filter(res => res.boxId !== boxId));
  };

  // Změna množství v batch review
  const changeBatchResultCount = (boxId, amount) => {
    setBatchResults(prev => prev.map(res => 
      res.boxId === boxId ? { ...res, count: Math.max(1, res.count + amount) } : res
    ));
  };

  // --- RUČNÍ ZADÁVÁNÍ KARET ---
  const handleManualSearch = (query) => {
    setManualQuery(query);
    if (!query || query.trim().length < 2) {
      setManualResults([]);
      return;
    }
    
    const lowerQuery = query.toLowerCase();
    const matches = cardsData.filter(c => 
      c.name.toLowerCase().includes(lowerQuery)
    ).slice(0, 10);
    
    setManualResults(matches);
  };

  const addManualCard = (card) => {
    setScannedPool(prev => {
      const existing = prev.find(item => item.id === card.id);
      if (existing) {
        return prev.map(item => item.id === card.id ? { ...item, count: item.count + 1 } : item);
      } else {
        return [...prev, { id: card.id, count: 1 }];
      }
    });
    setManualQuery('');
    setManualResults([]);
    playSuccessSound();
  };

  // --- SPRÁVA AKTIVNÍHO POOLU ---
  const removeCardFromPool = (cardId) => {
    setScannedPool(prev => prev.filter(item => item.id !== cardId));
    setOptimizationResult(null);
  };

  const changeCardCountInPool = (cardId, amount) => {
    setScannedPool(prev => prev.map(item => {
      if (item.id === cardId) {
        return { ...item, count: Math.max(1, item.count + amount) };
      }
      return item;
    }));
    setOptimizationResult(null);
  };

  const clearPool = () => {
    if (window.confirm("Opravdu chcete smazat celý seznam naskenovaných karet?")) {
      setScannedPool([]);
      setOptimizationResult(null);
    }
  };

  // Spuštění Deck Optimizeru
  const runDeckOptimizer = () => {
    setIsOptimizing(true);
    setOptimizationResult(null);
    
    setTimeout(() => {
      const result = optimizeSealedPool(scannedPool, cardsData);
      setOptimizationResult(result);
      setIsOptimizing(false);
    }, 400); // Krátká animace
  };

  // Odeslání výsledků do hlavního Sealed Simulátoru
  const importToSimulator = () => {
    if (!optimizationResult || !optimizationResult.success) return;
    
    // Spustíme callback předaný z App.jsx
    onImportToSimulator(optimizationResult.fullPool);
  };

  // Rozdělení poolu podle barev pro dashboard
  const getPoolGrouped = () => {
    const groups = { W: [], U: [], B: [], R: [], G: [], Multicolor: [], Colorless: [], Land: [] };
    
    scannedPool.forEach(item => {
      const card = cardsData.find(c => c.id === item.id);
      if (!card) return;
      
      const poolItem = { ...card, count: item.count };
      if (card.type && card.type.includes('Land')) {
        groups.Land.push(poolItem);
      } else if (card.color.includes('Multicolor')) {
        groups.Multicolor.push(poolItem);
      } else if (card.color.includes('Colorless')) {
        groups.Colorless.push(poolItem);
      } else {
        card.color.forEach(col => {
          if (groups[col]) groups[col].push(poolItem);
        });
      }
    });
    
    return groups;
  };

  const groupedPool = getPoolGrouped();
  const totalScannedCount = scannedPool.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="card-scanner-container" style={{ paddingBottom: '5rem' }}>
      
      {/* Hlavní panel s výběrem režimu */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Camera size={26} style={{ color: '#8b5cf6' }} />
              Skener Karet & Optimizer
            </h2>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Naskenujte své fyzické karty a získejte okamžitý návrh na 2HG balíčky.
            </p>
          </div>
          
          <div className="tab-filters" style={{ display: 'flex', gap: '0.35rem', background: 'rgba(0,0,0,0.2)', padding: '0.25rem', borderRadius: '8px' }}>
            <button 
              className={`filter-btn ${scanMode === 'batch' ? 'active' : ''}`}
              onClick={() => handleScanModeChange('batch')}
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
            >
              Hromadné foto
            </button>
            <button 
              className={`filter-btn ${scanMode === 'continuous' ? 'active' : ''}`}
              onClick={() => handleScanModeChange('continuous')}
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
            >
              Kontinuální
            </button>
            <button 
              className={`filter-btn ${scanMode === 'manual' ? 'active' : ''}`}
              onClick={() => handleScanModeChange('manual')}
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
            >
              Ruční zadání
            </button>
          </div>
        </div>

        {isWorkerLoading && (
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '8px', padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fbbf24', fontSize: '0.85rem', marginBottom: '1rem' }}>
            <Loader2 className="animate-spin" size={16} />
            <span>Načítám OCR moduly na pozadí... Skener bude dostupný za okamžik.</span>
          </div>
        )}
      </div>

      {/* --- Zóna 1: Kamera a rozhraní skenování --- */}
      {scanMode !== 'manual' && (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem', overflow: 'hidden' }}>
          
          {!cameraActive && !batchPhoto && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', border: '2px dashed rgba(139, 92, 246, 0.2)', borderRadius: '12px', padding: '2rem', textAlign: 'center', background: 'rgba(139, 92, 246, 0.02)' }}>
              <Camera size={48} style={{ color: '#8b5cf6', marginBottom: '1rem', opacity: 0.7 }} />
              <h3>Spustit skenování fotoaparátem</h3>
              <p style={{ maxWidth: '400px', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                {scanMode === 'batch' 
                  ? "Vyfoťte více karet rozložených vedle sebe na stole (nejlépe na tmavém pozadí) pro hromadné rozpoznání."
                  : "Držte telefon nad kartami a postupně je pod kamerou posouvejte pro automatické zaznamenání."
                }
              </p>
              
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button className="cta-button" onClick={startCamera} disabled={isWorkerLoading}>
                  <Camera size={18} />
                  Povolit kameru
                </button>
                
                <label className="cta-button" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
                  <Upload size={18} />
                  Nahrát fotku
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                </label>
              </div>
              
              {cameraError && (
                <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <AlertCircle size={14} />
                  {cameraError}
                </div>
              )}
            </div>
          )}

          {/* Aktivní náhled kamery */}
          {cameraActive && (
            <div style={{ position: 'relative', width: '100%', maxWidth: '720px', margin: '0 auto', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
              <video 
                ref={videoRef} 
                style={{ width: '100%', display: 'block', transform: 'scaleX(1)' }} 
                playsInline 
                muted 
              />
              
              {/* Překryvný zaměřovací rámeček pro kontinuální režim */}
              {scanMode === 'continuous' && (
                <div style={{ 
                  position: 'absolute', 
                  inset: 0, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  pointerEvents: 'none'
                }}>
                  <div style={{ 
                    width: '60%', 
                    height: '25%', 
                    border: scanSuccessPulse ? '3px solid #10b981' : '2px dashed #8b5cf6', 
                    borderRadius: '8px',
                    boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: scanSuccessPulse ? '#10b981' : '#c084fc',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    transition: 'all 0.15s ease'
                  }}>
                    {scanSuccessPulse ? 'KARTA NASKENOVÁNA!' : 'UMÍSTĚTE NÁZEV KARTY SEM'}
                  </div>
                </div>
              )}

              {/* Překryvný rámeček pro hromadné focení */}
              {scanMode === 'batch' && (
                <div style={{ 
                  position: 'absolute', 
                  inset: 0, 
                  border: '2px solid rgba(139, 92, 246, 0.4)', 
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  padding: '1rem'
                }}>
                  <span style={{ background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
                    Rozložte karty vedle sebe a stiskněte tlačítko vyfotit
                  </span>
                </div>
              )}

              {/* Spodní lišta ovládání kamery */}
              <div style={{ position: 'absolute', bottom: 0, insetInline: 0, padding: '1rem', background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button 
                  className="nav-button" 
                  onClick={stopCamera}
                  style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444' }}
                >
                  Vypnout
                </button>
                
                {scanMode === 'batch' ? (
                  <button 
                    className="cta-button" 
                    onClick={captureBatchPhoto}
                    style={{ background: '#8b5cf6', boxShadow: '0 0 15px rgba(139, 92, 246, 0.4)' }}
                  >
                    Vyfotit a detekovat
                  </button>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', fontSize: '0.8rem' }}>
                    <Loader2 className="animate-spin" size={14} />
                    <span>{continuousStatus}</span>
                  </div>
                )}
                
                <div style={{ width: '60px' }}></div> {/* Spacer */}
              </div>
            </div>
          )}

          {/* Náhled vyfoceného snímku pro hromadnou detekci (Batch Canvas View) */}
          {batchPhoto && !isProcessingBatch && batchResults.length === 0 && (
            <div>
              <h3 style={{ marginBottom: '0.75rem' }}>Detekované karty na fotografii</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Kliknutím na označené obdélníky můžete zapnout/vypnout skenování dané karty. Následně stiskněte "Spustit OCR".
              </p>
              
              <div style={{ position: 'relative', maxWidth: '720px', margin: '0 auto', overflow: 'hidden', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                {/* Vykreslíme canvas s fotkou */}
                <div style={{ position: 'relative' }}>
                  <img 
                    src={batchPhoto.toDataURL()} 
                    alt="Vyfocený snímek" 
                    style={{ width: '100%', display: 'block' }} 
                  />
                  
                  {/* Vykreslíme nalezené bounding boxy */}
                  {detectedBoxes.map((box) => (
                    <div
                      key={box.id}
                      onClick={() => toggleBoxSelection(box.id)}
                      style={{
                        position: 'absolute',
                        left: `${(box.x / batchPhoto.width) * 100}%`,
                        top: `${(box.y / batchPhoto.height) * 100}%`,
                        width: `${(box.width / batchPhoto.width) * 100}%`,
                        height: `${(box.height / batchPhoto.height) * 100}%`,
                        border: box.selected ? '2.5px solid #10b981' : '2px dashed rgba(255, 255, 255, 0.4)',
                        background: box.selected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(0, 0, 0, 0.4)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: 'bold',
                        fontSize: '0.7rem',
                        textShadow: '0 1px 3px rgba(0,0,0,0.8)'
                      }}
                    >
                      {box.selected ? '✓ Sken' : 'X Přeskočit'}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '1.25rem' }}>
                <button className="nav-button" onClick={startCamera}>
                  <RotateCcw size={16} />
                  Vyfotit znovu
                </button>
                
                <button className="cta-button" onClick={processBatchQueue} style={{ background: '#10b981' }}>
                  <Play size={16} />
                  Spustit OCR ({detectedBoxes.filter(b => b.selected).length} karet)
                </button>
              </div>
            </div>
          )}

          {/* Průběh analýzy (OCR Spinner) */}
          {isProcessingBatch && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '260px', padding: '2rem' }}>
              <Loader2 className="animate-spin" size={42} style={{ color: '#8b5cf6', marginBottom: '1rem' }} />
              <h4>Probíhá optické rozpoznávání znaků (OCR)...</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                {batchProgress.status}
              </p>
              <div style={{ width: '100%', maxWidth: '300px', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', marginTop: '1rem', overflow: 'hidden' }}>
                <div style={{ 
                  width: `${(batchProgress.current / batchProgress.total) * 100}%`, 
                  height: '100%', 
                  background: '#8b5cf6', 
                  borderRadius: '3px',
                  transition: 'width 0.2s ease'
                }} />
              </div>
            </div>
          )}

          {/* Rozhraní pro revizi detekovaných karet (Batch Review Grid) */}
          {batchResults.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>Zkontrolujte naskenované výsledky</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Před přidáním do celkového poolu prosím opravte případné chyby OCR.
                </span>
              </div>
              
              <div className="grid-2col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {batchResults.map((res) => (
                  <div 
                    key={res.boxId} 
                    className="glass-panel" 
                    style={{ 
                      padding: '0.75rem', 
                      display: 'flex', 
                      gap: '0.75rem', 
                      alignItems: 'center', 
                      border: res.card ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.25)',
                      background: res.card ? 'rgba(16, 185, 129, 0.02)' : 'rgba(239, 68, 68, 0.02)'
                    }}
                  >
                    {/* Náhled karty (pokud je spárovaná) */}
                    <div style={{ width: '55px', height: '78px', flexShrink: 0, borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {res.card?.imageUrl ? (
                        <img src={res.card.imageUrl} alt={res.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <AlertCircle size={22} style={{ color: '#ef4444' }} />
                      )}
                    </div>
                    
                    {/* Informace o výsledku */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem', borderRadius: '4px', fontWeight: 600, background: res.card ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.15)', color: res.card ? '#10b981' : '#f87171', marginBottom: '0.25rem', display: 'inline-block' }}>
                          {res.card ? `Shoda: ${res.confidence}%` : 'Nerozpoznáno'}
                        </span>
                        
                        <button 
                          onClick={() => removeBatchResult(res.boxId)} 
                          style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '0.1rem' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      
                      {/* Pokud je karta spárována, zobrazíme jméno, jinak select vyhledávač */}
                      {res.card ? (
                        <div style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#fff', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {res.name}
                        </div>
                      ) : (
                        <div style={{ color: '#f87171', fontSize: '0.75rem', margin: '0.1rem 0 0.25rem 0' }}>
                          OCR detekovalo: "{res.rawText || '?'}"
                        </div>
                      )}

                      {/* Dropdown pro manuální opravu */}
                      <div style={{ marginTop: '0.25rem' }}>
                        <select
                          className="search-input"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', width: '100%', height: '28px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}
                          value={res.card?.id || ''}
                          onChange={(e) => updateBatchResultCard(res.boxId, e.target.value)}
                        >
                          <option value="">-- Vyberte správnou kartu --</option>
                          {cardsData.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Množství karty */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Množství:</span>
                        <button onClick={() => changeBatchResultCount(res.boxId, -1)} style={{ width: '20px', height: '20px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.7rem' }}>-</button>
                        <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{res.count}</span>
                        <button onClick={() => changeBatchResultCount(res.boxId, 1)} style={{ width: '20px', height: '20px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.7rem' }}>+</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                <button className="nav-button" onClick={() => { setBatchResults([]); startCamera(); }}>
                  <RotateCcw size={16} />
                  Skenovat znovu
                </button>
                
                <button 
                  className="cta-button" 
                  onClick={confirmBatchResults} 
                  disabled={batchResults.filter(r => r.card).length === 0}
                  style={{ background: '#10b981' }}
                >
                  <Check size={16} />
                  Uložit rozpoznané do poolu ({batchResults.filter(r => r.card).length} karet)
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* --- Zóna 2: Ruční zadávání karet --- */}
      {scanMode === 'manual' && (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3>Ruční přidání karet do poolu</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Pokud se vám nedaří kartu vyfotit, můžete ji rychle vyhledat a přidat ručně podle názvu.
          </p>
          
          <div style={{ position: 'relative' }}>
            <input 
              type="text" 
              className="search-input" 
              placeholder="Začněte psát název karty (např. Captain America, Doctor Doom...)"
              value={manualQuery}
              onChange={(e) => handleManualSearch(e.target.value)}
            />
            
            {manualResults.length > 0 && (
              <div style={{ 
                position: 'absolute', 
                top: '100%', 
                left: 0, 
                right: 0, 
                background: 'var(--panel-bg)', 
                border: '1px solid rgba(255,255,255,0.1)', 
                borderRadius: '8px', 
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                zIndex: 10,
                maxHeight: '260px',
                overflowY: 'auto',
                marginTop: '0.25rem'
              }}>
                {manualResults.map(card => (
                  <div 
                    key={card.id} 
                    onClick={() => addManualCard(card)}
                    style={{ 
                      padding: '0.65rem 1rem', 
                      borderBottom: '1px solid rgba(255,255,255,0.05)', 
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'background 0.2s'
                    }}
                    className="manual-search-item"
                  >
                    <div>
                      <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{card.name}</span>
                      <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#a78bfa' }}>{card.cost}</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', padding: '0.1rem 0.35rem', borderRadius: '4px', background: 'rgba(139, 92, 246, 0.15)', color: '#c084fc', fontWeight: 600 }}>
                      Tier {card.tier2HG}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- Zóna 3: Seznam naskenovaných karet (Aktivní pool) --- */}
      {scannedPool.length > 0 && (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 style={{ margin: 0 }}>Naskenovaný pool karet</h3>
              <span className="badge-color W" style={{ background: '#8b5cf6', width: 'auto', padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.7rem' }}>
                {totalScannedCount} karet
              </span>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button 
                className="filter-btn"
                onClick={() => setShowImages(!showImages)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
              >
                {showImages ? <EyeOff size={13} /> : <Eye size={13} />}
                {showImages ? 'Skrýt náhledy' : 'Zobrazit náhledy'}
              </button>
              
              <button 
                className="nav-button"
                onClick={clearPool}
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171' }}
              >
                <Trash2 size={13} />
                Vyčistit pool
              </button>
            </div>
          </div>

          {/* Seskupené zobrazení karet v poolu */}
          <div className="grid-auto" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {Object.keys(groupedPool).map(color => {
              const list = groupedPool[color];
              if (list.length === 0) return null;
              
              const colorNames = {
                W: 'Bílá (White)',
                U: 'Modrá (Blue)',
                B: 'Černá (Black)',
                R: 'Červená (Red)',
                G: 'Zelená (Green)',
                Multicolor: 'Vícebarevné',
                Colorless: 'Bezbarvé',
                Land: 'Země'
              };

              const colorBorders = {
                W: 'rgba(243, 244, 246, 0.2)',
                U: 'rgba(59, 130, 246, 0.2)',
                B: 'rgba(31, 41, 55, 0.3)',
                R: 'rgba(239, 68, 68, 0.2)',
                G: 'rgba(16, 185, 129, 0.2)',
                Multicolor: 'rgba(251, 191, 36, 0.2)',
                Colorless: 'rgba(156, 163, 175, 0.2)',
                Land: 'rgba(139, 92, 246, 0.2)'
              };

              return (
                <div 
                  key={color} 
                  className="color-group-box"
                  style={{ 
                    background: 'rgba(0, 0, 0, 0.15)', 
                    border: `1px solid ${colorBorders[color] || 'rgba(255,255,255,0.06)'}`,
                    borderRadius: '8px',
                    padding: '0.75rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '0.8rem', color: '#c084fc' }}>{colorNames[color]}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{list.reduce((sum, c) => sum + c.count, 0)}x</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {list.map(card => (
                      <div 
                        key={card.id}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.02)', padding: '0.35rem', borderRadius: '4px' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: 0 }}>
                          {showImages && card.imageUrl && (
                            <div style={{ width: '28px', height: '40px', flexShrink: 0, borderRadius: '2px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                              <img src={card.imageUrl} alt={card.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                          )}
                          <div style={{ fontSize: '0.8rem', fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', color: '#fff' }} title={card.name}>
                            {card.name}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                          <span style={{ fontSize: '0.7rem', padding: '0.05rem 0.25rem', borderRadius: '3px', background: 'rgba(255,255,255,0.08)', fontWeight: 600 }}>T-{card.tier2HG}</span>
                          <button onClick={() => changeCardCountInPool(card.id, -1)} style={{ width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', color: '#fff', cursor: 'pointer', fontSize: '0.65rem' }}>-</button>
                          <span style={{ fontSize: '0.75rem', fontWeight: 'bold', minWidth: '12px', textAlign: 'center' }}>{card.count}</span>
                          <button onClick={() => changeCardCountInPool(card.id, 1)} style={{ width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', color: '#fff', cursor: 'pointer', fontSize: '0.65rem' }}>+</button>
                          <button onClick={() => removeCardFromPool(card.id)} style={{ border: 'none', background: 'none', color: '#f87171', padding: '0.2rem', cursor: 'pointer' }}>✖</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <button 
              className="cta-button" 
              onClick={runDeckOptimizer} 
              disabled={isOptimizing || scannedPool.length < 15}
              style={{ background: '#8b5cf6', padding: '0.75rem 2rem', fontSize: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)' }}
            >
              {isOptimizing ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
              Navrhnout nejsilnější decky
            </button>
            {scannedPool.length < 15 && (
              <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                * Naskenujte alespoň 15 karet, abyste mohli spustit optimalizaci.
              </p>
            )}
          </div>
        </div>
      )}

      {/* --- Zóna 4: Výsledky optimalizátoru --- */}
      {optimizationResult && (
        <div className="glass-panel" style={{ padding: '1.5rem', border: '1px solid rgba(139, 92, 246, 0.35)', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(16, 185, 129, 0.03))' }}>
          
          {optimizationResult.error ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444' }}>
              <AlertCircle size={20} />
              <span>{optimizationResult.error}</span>
            </div>
          ) : (
            <div>
              {/* Hlavička výsledku */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', padding: '0.2rem 0.5rem', borderRadius: '12px', background: '#10b981', color: '#fff' }}>
                      Optimální volba
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Skóre synergie: {optimizationResult.bestCombo.score.toFixed(1)} bodů
                    </span>
                  </div>
                  <h2 style={{ margin: '0.35rem 0 0 0', color: '#fff', fontSize: '1.4rem' }}>
                    Balíček A: {optimizationResult.bestCombo.g1.name} & Balíček B: {optimizationResult.bestCombo.g2.name}
                  </h2>
                </div>

                <button 
                  className="cta-button"
                  onClick={importToSimulator}
                  style={{ background: '#10b981', padding: '0.6rem 1.25rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 0 15px rgba(16, 185, 129, 0.25)' }}
                >
                  <CheckCircle2 size={16} />
                  Přenést do Sealed Simulátoru
                </button>
              </div>

              {/* Taktický audit párování */}
              <div style={{ background: 'rgba(139, 92, 246, 0.06)', border: '1px dashed rgba(139, 92, 246, 0.25)', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem' }}>
                <h4 style={{ color: '#c084fc', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.4rem' }}>
                  <Info size={16} />
                  Taktické hodnocení týmové kompozice ({optimizationResult.bestCombo.synergy.tier} Tier)
                </h4>
                <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.45, color: 'var(--text-primary)' }}>
                  <strong>{optimizationResult.bestCombo.synergy.title}:</strong>{' '}
                  {optimizationResult.bestCombo.synergy.synergies?.[0] || 'Tato barevná kombinace má nulový barevný překrýv, což maximalizuje využití nejsilnějších karet z vašeho poolu.'}
                </p>
                {optimizationResult.bestCombo.synergy.risks?.length > 0 && (
                  <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.8rem', color: '#fbbf24' }}>
                    <strong>Riziko:</strong> {optimizationResult.bestCombo.synergy.risks[0]}
                  </p>
                )}
              </div>

              {/* Dvě balíčky vedle sebe (Split View) */}
              <div className="grid-2col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                
                {/* Hráč A Deck */}
                <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#c084fc' }}>
                      Balíček Hráče A
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {optimizationResult.deckA.length} karet
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', maxHeight: '350px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                    {optimizationResult.deckA.map((card, idx) => (
                      <div key={`${card.id}-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                        <span style={{ fontWeight: 600, color: '#fff' }}>{card.name}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{card.cost || 'Země'}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hráč B Deck */}
                <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#c084fc' }}>
                      Balíček Hráče B
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {optimizationResult.deckB.length} karet
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', maxHeight: '350px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                    {optimizationResult.deckB.map((card, idx) => (
                      <div key={`${card.id}-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                        <span style={{ fontWeight: 600, color: '#fff' }}>{card.name}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{card.cost || 'Země'}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Alternativní doporučení */}
              {optimizationResult.alternatives?.length > 0 && (
                <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Alternativní barevné možnosti pro tento pool:
                  </h4>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {optimizationResult.alternatives.map((alt, idx) => (
                      <div 
                        key={idx} 
                        style={{ 
                          background: 'rgba(255,255,255,0.03)', 
                          border: '1px solid rgba(255,255,255,0.06)', 
                          borderRadius: '6px', 
                          padding: '0.4rem 0.75rem', 
                          fontSize: '0.75rem' 
                        }}
                      >
                        <strong>{alt.g1.name}</strong> + <strong>{alt.g2.name}</strong>{' '}
                        <span style={{ color: '#a78bfa', marginLeft: '0.25rem' }}>
                          ({alt.synergy.tier} Tier, {alt.score.toFixed(0)} b.)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      )}

    </div>
  );
}
