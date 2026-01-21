import React, { useState, useEffect } from 'react';
import {
  Upload,
  HardDrive,
  Trash2,
  RefreshCw,
  AlertCircle,
  FileText,
  Database,
  Zap,
  Activity,
  Cpu,
  X,
  Check,
  Sparkles
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const API_BASE = "http://127.0.0.1:5000";
const BLOCK_SIZE = 4;
const TOTAL_BLOCKS = 1000;
const JUNK_EXTENSIONS = ['.tmp', '.log', '.bak', '.cache'];

const FileSystemSimulator = () => {
  const [diskBlocks, setDiskBlocks] = useState(Array(TOTAL_BLOCKS).fill(null));
  const [files, setFiles] = useState([]);
  const [selectedAllocation, setSelectedAllocation] = useState('contiguous');
  const [logs, setLogs] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedUploadFile, setSelectedUploadFile] = useState(null);
  const [duplicates, setDuplicates] = useState([]);
  const [junkFiles, setJunkFiles] = useState([]);
  const [isDefragmenting, setIsDefragmenting] = useState(false);
  const [hoveredBlock, setHoveredBlock] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [performanceData, setPerformanceData] = useState([]);
  const [fragmentation, setFragmentation] = useState(0);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationStage, setOptimizationStage] = useState('');
  const [optimizationProgress, setOptimizationProgress] = useState(0);
  const [optimizationInsights, setOptimizationInsights] = useState([]);
  const [showOptimizationComplete, setShowOptimizationComplete] = useState(false);
  const [initialFragmentation, setInitialFragmentation] = useState(0);
  const [particles, setParticles] = useState([]);
  const [confetti, setConfetti] = useState([]);

  const usedBlocks = diskBlocks.filter(b => b !== null).length;
  const freeBlocks = TOTAL_BLOCKS - usedBlocks;

  useEffect(() => {
    loadFiles();
    loadBlocks();
    loadLogs();
    loadFragmentation();
  }, []);

  useEffect(() => {
    setPerformanceData(prev => [...prev, {
      time: prev.length,
      usage: (usedBlocks / TOTAL_BLOCKS * 100).toFixed(1),
      fragmentation: fragmentation.toFixed(1)
    }].slice(-20));
  }, [usedBlocks, fragmentation]);

  useEffect(() => {
    if (isOptimizing && optimizationProgress > 0) {
      const interval = setInterval(() => {
        setParticles(prev => [...prev, {
          id: Math.random(),
          x: Math.random() * 100,
          y: Math.random() * 100,
          tx: (Math.random() - 0.5) * 200,
          ty: (Math.random() - 0.5) * 200
        }].slice(-20));
      }, 200);
      return () => clearInterval(interval);
    }
  }, [isOptimizing, optimizationProgress]);

  useEffect(() => {
    if (showOptimizationComplete) {
      const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899'];
      const newConfetti = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        color: colors[Math.floor(Math.random() * colors.length)]
      }));
      setConfetti(newConfetti);
      setTimeout(() => setConfetti([]), 3000);
    }
  }, [showOptimizationComplete]);

  const addLog = (message, type = 'info') => {
    setLogs(prev => [...prev, {
      time: new Date().toLocaleTimeString(),
      message,
      type
    }].slice(-50));
  };

  const loadFiles = async () => {
    try {
      const res = await fetch(`${API_BASE}/files`);
      const data = await res.json();
      setFiles(data || []);
      detectDuplicatesAndJunk(data || []);
    } catch (err) {
      addLog("Failed to load files from backend", "error");
    }
  };

  const loadBlocks = async () => {
    try {
      const res = await fetch(`${API_BASE}/blocks`);
      const data = await res.json();
      const newBlocks = Array(TOTAL_BLOCKS).fill(null);

      data.blocks.forEach(block => {
        if (block.file_id) {
          newBlocks[block.block_index] = {
            fileId: block.file_id,
            blockIndex: block.block_index
          };
        }
      });

      setDiskBlocks(newBlocks);
    } catch (err) {
      addLog("Failed to load blocks", "error");
    }
  };

  const loadLogs = async () => {
    try {
      const res = await fetch(`${API_BASE}/logs`);
      const data = await res.json();
      const formattedLogs = data.map(log => ({
        time: new Date(log.timestamp).toLocaleTimeString(),
        message: log.action,
        type: 'info'
      }));
      setLogs(formattedLogs.slice(-50));
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    }
  };

  const loadFragmentation = async () => {
    try {
      const res = await fetch(`${API_BASE}/fragmentation`);
      const data = await res.json();
      setFragmentation(data.fragmentation || 0);
    } catch (err) {
      console.error("Failed to load fragmentation:", err);
    }
  };

  const detectDuplicatesAndJunk = (fileList) => {
    const nameMap = {};
    const dups = [];
    const junk = [];

    fileList.forEach(file => {
      if (nameMap[file.filename]) {
        dups.push(file);
      } else {
        nameMap[file.filename] = true;
      }

      const ext = file.filename.substring(file.filename.lastIndexOf('.')).toLowerCase();
      if (JUNK_EXTENSIONS.includes(ext)) {
        junk.push(file);
      }
    });

    setDuplicates(dups);
    setJunkFiles(junk);
  };

  const handleFileUpload = async () => {
    if (!selectedUploadFile) {
      addLog("Please select a file", "error");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedUploadFile);
    formData.append("allocation_type", selectedAllocation);

    try {
      const response = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body: formData,
      });

      let result = {};
      try {
        result = await response.json();
      } catch { }

      if (response.ok) {
        addLog(`Uploaded ${selectedUploadFile.name} using ${selectedAllocation} allocation`, "success");
        await loadFiles();
        await loadBlocks();
        await loadFragmentation();
        setShowUploadModal(false);
        setSelectedUploadFile(null);
      } else {
        addLog(result.error || `Upload failed: ${response.statusText}`, "error");
      }
    } catch (error) {
      addLog("Upload failed: " + error.message, "error");
    }
  };

  const deleteFile = async (fileId) => {
    try {
      const response = await fetch(`${API_BASE}/delete/${fileId}`, {
        method: "DELETE"
      });

      if (response.ok) {
        addLog("File deleted successfully", "success");
        await loadFiles();
        await loadBlocks();
        await loadFragmentation();

        if (selectedFile?.id === fileId) {
          setSelectedFile(null);
        }
      } else {
        addLog("Failed to delete file", "error");
      }
    } catch (err) {
      addLog("Delete failed: " + err.message, "error");
    }
  };

  const defragmentDisk = async () => {
    if (files.length === 0) {
      addLog("No files to defragment", "warning");
      return;
    }

    setIsDefragmenting(true);
    addLog("Starting defragmentation...", "info");

    try {
      const response = await fetch(`${API_BASE}/defragment`, {
        method: "POST"
      });

      if (response.ok) {
        await loadFiles();
        await loadBlocks();
        await loadFragmentation();
        addLog("Defragmentation complete!", "success");
      } else {
        addLog("Defragmentation failed", "error");
      }
    } catch (err) {
      addLog("Defragmentation error: " + err.message, "error");
    } finally {
      setIsDefragmenting(false);
    }
  };

  const autoOptimize = async () => {
    setIsOptimizing(true);
    setOptimizationProgress(0);
    setOptimizationInsights([]);
    setShowOptimizationComplete(false);
    setInitialFragmentation(fragmentation);

    const insights = [];
    const stages = [
      { stage: 'Analyzing disk structure...', progress: 15, delay: 800 },
      { stage: 'Scanning for duplicates...', progress: 30, delay: 1000 },
      { stage: 'Defragmenting blocks...', progress: 50, delay: 1200 },
      { stage: 'Removing orphaned blocks...', progress: 70, delay: 900 },
      { stage: 'Optimizing allocation tables...', progress: 85, delay: 1000 },
      { stage: 'Finalizing optimization...', progress: 100, delay: 800 }
    ];

    for (const { stage, progress, delay } of stages) {
      setOptimizationStage(stage);
      await new Promise(resolve => setTimeout(resolve, delay));
      setOptimizationProgress(progress);
      insights.push(stage);
      setOptimizationInsights([...insights]);
    }

    try {
      const res = await fetch(`${API_BASE}/optimize`, { method: "POST" });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();

      if (data.duplicates && data.duplicates.length > 0) {
        data.duplicates.forEach((dup) => {
          insights.push(`Found duplicate: ${dup.file1} ↔ ${dup.file2} (${dup.similarity}%)`);
        });
        setOptimizationInsights([...insights]);
      }

      await loadFiles();
      await loadBlocks();
      await loadFragmentation();

      await new Promise(resolve => setTimeout(resolve, 500));
      setShowOptimizationComplete(true);

      setTimeout(() => {
        setIsOptimizing(false);
        setOptimizationStage('');
        setOptimizationProgress(0);
        setOptimizationInsights([]);
        setShowOptimizationComplete(false);
      }, 3000);

    } catch (err) {
      console.error("Auto-Optimize failed:", err);
      addLog("Auto-Optimize failed", "error");
      setIsOptimizing(false);
    }
  };

  const getBlockColor = (block) => {
    if (!block) return "free";

    const file = files.find(f => f.id === block.fileId);
    if (!file) return "neutral";

    if (junkFiles.some(j => j.id === block.fileId)) return "junk";
    if (duplicates.some(d => d.id === block.fileId)) return "duplicate";

    if (file.allocation_type === "contiguous") return "contiguous";
    if (file.allocation_type === "linked") return "linked";
    if (file.allocation_type === "indexed") return "indexed";

    return "neutral";
  };

  const allocationStats = {
    contiguous: files.filter(f => f.allocation_type === "contiguous").length,
    linked: files.filter(f => f.allocation_type === "linked").length,
    indexed: files.filter(f => f.allocation_type === "indexed").length,
  };

  const allocationData = [
    { name: "Contiguous", value: allocationStats.contiguous, color: "#3b82f6" },
    { name: "Linked", value: allocationStats.linked, color: "#eab308" },
    { name: "Indexed", value: allocationStats.indexed, color: "#f97316" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-2 sm:p-4 lg:p-6">
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); }
          50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.8); }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        @keyframes particle {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
        }
        @keyframes confetti-fall {
          0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes progressFill {
          from { width: 0%; }
          to { width: var(--progress); }
        }
        @keyframes typewriter {
          from { max-width: 0; }
          to { max-width: 100%; }
        }
        .animate-slide-in { animation: slideIn 0.5s ease-out; }
        .animate-fade-in { animation: fadeIn 0.3s ease-out; }
        .animate-pulse { animation: pulse 2s ease-in-out infinite; }
        .animate-spin { animation: spin 1s linear infinite; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-glow { animation: glow 2s ease-in-out infinite; }
        .animate-particle { animation: particle 1s ease-out forwards; }
        .animate-confetti { animation: confetti-fall 3s linear forwards; }
        .animate-typewriter { animation: typewriter 0.5s steps(30) forwards; }
        .card {
          background: rgba(30, 41, 59, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(71, 85, 105, 0.3);
          transition: all 0.3s ease;
        }
        .card:hover {
          border-color: rgba(59, 130, 246, 0.5);
          box-shadow: 0 8px 32px rgba(59, 130, 246, 0.15);
          transform: translateY(-2px);
        }
        .glass {
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(71, 85, 105, 0.3);
        }
        .btn-primary {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          transition: all 0.3s ease;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
        }
        .btn-primary:active {
          transform: translateY(0);
        }
        .block-cell {
          transition: all 0.2s ease;
        }
        .block-cell:hover {
          transform: scale(1.2);
          box-shadow: 0 0 12px currentColor;
          z-index: 10;
        }
        .shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          background-size: 1000px 100%;
          animation: shimmer 2s infinite;
        }
        .stat-card {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
          border: 1px solid rgba(59, 130, 246, 0.2);
          transition: all 0.3s ease;
        }
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(59, 130, 246, 0.2);
        }
        .scanline-effect {
          position: absolute;
          width: 100%;
          height: 3px;
          background: linear-gradient(to bottom, transparent, rgba(59, 130, 246, 0.5), transparent);
          animation: scanline 2s linear infinite;
        }
        .progress-bar-fill {
          transition: width 0.5s ease-out;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
      `}</style>

      <div className="max-w-7xl mx-auto animate-slide-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-2xl p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 shadow-2xl">
          <div className="flex items-center gap-3 sm:gap-4 mb-2">
            <div className="bg-white/20 p-2 sm:p-3 rounded-xl">
              <HardDrive className="w-8 h-8 sm:w-12 sm:h-12" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                File System Simulator
              </h1>
              <p className="text-white/90 text-xs sm:text-sm lg:text-base mt-1">
                Advanced OS File Allocation Management
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
          {[
            { label: 'Total Blocks', value: TOTAL_BLOCKS, color: '#3b82f6', icon: Database },
            { label: 'Free Blocks', value: freeBlocks, color: '#10b981', icon: Zap },
            { label: 'Used Blocks', value: usedBlocks, color: '#ef4444', icon: Activity },
            { label: 'Total Files', value: files.length, color: '#8b5cf6', icon: FileText }
          ].map((stat, i) => (
            <div key={i} className="stat-card rounded-xl p-3 sm:p-4 animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-xs text-slate-400 mb-1">{stat.label}</div>
                  <div className="text-xl sm:text-2xl font-bold" style={{ color: stat.color }}>
                    {stat.value}
                  </div>
                </div>
                <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 opacity-50" style={{ color: stat.color }} />
              </div>
            </div>
          ))}
        </div>

        {/* Main Action Cards */}
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* Upload Card */}
          <div className="card rounded-xl p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-500/20 p-3 rounded-xl">
                <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold">Upload File</h2>
                <p className="text-slate-400 text-xs sm:text-sm">Add files to virtual disk</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {['contiguous', 'linked', 'indexed'].map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedAllocation(type)}
                  className={`flex-1 min-w-[100px] px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all ${selectedAllocation === type
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'glass text-slate-300 hover:bg-blue-500/10'
                    }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>

            <div className="glass rounded-lg p-3 sm:p-4 mb-4">
              <p className="text-slate-400 text-xs mb-1">Selected Method:</p>
              <p className="text-blue-400 font-semibold text-sm sm:text-base mb-2">
                {selectedAllocation} Allocation
              </p>
              <p className="text-slate-500 text-xs">
                {selectedAllocation === 'contiguous' && 'Files stored in continuous blocks'}
                {selectedAllocation === 'linked' && 'Blocks linked via pointers'}
                {selectedAllocation === 'indexed' && 'Index block contains addresses'}
              </p>
            </div>

            <button
              onClick={() => setShowUploadModal(true)}
              className="w-full btn-primary py-3 rounded-lg font-semibold flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <Upload className="w-4 h-4 sm:w-5 sm:h-5" /> Upload New File
            </button>
          </div>

          {/* Defragment Card */}
          <div className="card rounded-xl p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-pink-500/20 p-3 rounded-xl">
                <RefreshCw className={`w-6 h-6 sm:w-8 sm:h-8 text-pink-400 ${isDefragmenting ? 'animate-spin' : ''}`} />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold">Defragment Disk</h2>
                <p className="text-slate-400 text-xs sm:text-sm">Optimize performance</p>
              </div>
            </div>

            <div className="glass rounded-lg p-3 sm:p-4 mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-slate-400 text-xs sm:text-sm">Fragmentation Level</span>
                <span className={`font-semibold text-sm sm:text-base ${fragmentation > 50 ? 'text-red-400' : fragmentation > 25 ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                  {fragmentation.toFixed(1)}%
                </span>
              </div>
              <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${fragmentation}%`,
                    background: fragmentation > 50 ? '#ef4444' : fragmentation > 25 ? '#f59e0b' : '#10b981'
                  }}
                />
              </div>
            </div>

            <button
              onClick={defragmentDisk}
              disabled={files.length === 0 || isDefragmenting}
              className="w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 mb-3 transition-all text-sm sm:text-base"
              style={{
                background: files.length === 0 || isDefragmenting
                  ? 'rgba(236, 72, 153, 0.3)'
                  : 'linear-gradient(135deg, #ec4899, #db2777)',
                cursor: files.length === 0 || isDefragmenting ? 'not-allowed' : 'pointer'
              }}
            >
              <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${isDefragmenting ? 'animate-spin' : ''}`} />
              {isDefragmenting ? 'Defragmenting...' : 'Start Defragmentation'}
            </button>

            <button
              onClick={autoOptimize}
              disabled={isOptimizing}
              className="w-full glass py-3 rounded-lg font-semibold text-purple-400 hover:bg-purple-500/20 transition-all text-sm sm:text-base flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {isOptimizing ? 'Optimizing...' : '🤖 Auto Optimize'}
            </button>

            {fragmentation > 50 && (
              <div className="mt-3 bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center gap-2 animate-pulse">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span className="text-red-300 text-xs">High fragmentation detected!</span>
              </div>
            )}
          </div>
        </div>

        {/* Disk Visualization */}
        <div className="card rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                <Cpu className="w-5 h-5" /> Virtual Disk Blocks
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm">1000 blocks × 4KB = 4MB capacity</p>
            </div>
            <div className="text-right">
              <div className="text-xl sm:text-2xl font-bold text-blue-400">
                {((usedBlocks / TOTAL_BLOCKS) * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-slate-400">Disk Usage</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-4 mb-4 text-xs">
            {[
              { label: 'Free', color: '#1e293b' },
              { label: 'Contiguous', color: '#3b82f6' },
              { label: 'Linked', color: '#eab308' },
              { label: 'Indexed', color: '#f97316' },
              { label: 'Duplicate', color: '#a855f7' },
              { label: 'Junk', color: '#ef4444' }
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ background: item.color }} />
                <span className="text-slate-400">{item.label}</span>
              </div>
            ))}
          </div>

          <div className="grid gap-0.5" style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(8px, 1fr))'
          }}>
            {diskBlocks.map((block, index) => {
              const colorClass = getBlockColor(block);
              const colorMap = {
                free: '#1e293b',
                contiguous: '#3b82f6',
                linked: '#eab308',
                indexed: '#f97316',
                duplicate: '#a855f7',
                junk: '#ef4444',
                neutral: '#64748b'
              };

               return (
                <div
                  key={index}
                  className="block-cell aspect-square rounded-sm cursor-pointer"
                  style={{
                    background: colorMap[colorClass],
                    border: selectedFile && block?.fileId === selectedFile.id ? '2px solid white' : 'none'
                  }}
                  onMouseEnter={() => setHoveredBlock(block ? { ...block, index } : { index })}
                  onMouseLeave={() => setHoveredBlock(null)}
                  onClick={() => {
                    if (block) {
                      const file = files.find(f => f.id === block.fileId);
                      setSelectedFile(file);
                    }
                  }}
                />
              );
            })}
          </div>


          {hoveredBlock && (
            <div className="glass rounded-lg p-3 mt-3 text-xs sm:text-sm animate-fade-in">
              <span className="text-slate-400">Block: </span>
              <span className="text-blue-400 font-semibold">#{hoveredBlock.index}</span>
              {hoveredBlock.fileId ? (
                <>
                  <span className="text-slate-600 mx-2">|</span>
                  <span className="text-slate-400">File ID: </span>
                  <span className="text-green-400">{hoveredBlock.fileId}</span>
                </>
              ) : (
                <>
                  <span className="text-slate-600 mx-2">|</span>
                  <span className="text-green-400">● Available</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* Real-time Performance */}
          <div className="card rounded-xl p-4 sm:p-6 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                  <div className="bg-blue-500/20 p-2 rounded-lg">
                    <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                  </div>
                  Real-time Performance
                </h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-slate-400">Live</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="glass rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-xs text-slate-400">Disk Usage</span>
                  </div>
                  <div className="text-xl font-bold text-blue-400">
                    {performanceData.length > 0 ? performanceData[performanceData.length - 1].usage : 0}%
                  </div>
                </div>
                <div className="glass rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    <span className="text-xs text-slate-400">Fragmentation</span>
                  </div>
                  <div className="text-xl font-bold text-red-400">
                    {performanceData.length > 0 ? performanceData[performanceData.length - 1].fragmentation : 0}%
                  </div>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorFrag" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="time"
                    stroke="#64748b"
                    style={{ fontSize: '10px' }}
                    tick={{ fill: '#64748b' }}
                  />
                  <YAxis
                    stroke="#64748b"
                    style={{ fontSize: '10px' }}
                    tick={{ fill: '#64748b' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      border: '1px solid rgba(71, 85, 105, 0.5)',
                      borderRadius: '8px',
                      backdropFilter: 'blur(10px)'
                    }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="usage"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorUsage)"
                  />
                  <Area
                    type="monotone"
                    dataKey="fragmentation"
                    stroke="#ef4444"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorFrag)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Allocation Distribution */}
          <div className="card rounded-xl p-4 sm:p-6 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2 mb-4">
                <div className="bg-purple-500/20 p-2 rounded-lg">
                  <Database className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                </div>
                Allocation Distribution
              </h3>

              <div className="flex items-center justify-center mb-4">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={allocationData}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {allocationData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        border: '1px solid rgba(71, 85, 105, 0.5)',
                        borderRadius: '8px',
                        backdropFilter: 'blur(10px)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {allocationData.map((item, index) => (
                  <div key={index} className="glass rounded-lg p-3 text-center">
                    <div
                      className="w-3 h-3 rounded-full mx-auto mb-2"
                      style={{ background: item.color }}
                    ></div>
                    <div className="text-xs text-slate-400 mb-1">{item.name}</div>
                    <div className="text-lg font-bold" style={{ color: item.color }}>
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Files and Logs */}
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="card rounded-xl p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" /> File Directory
            </h3>
            <div className="max-h-96 overflow-y-auto">
              {files.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <HardDrive className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No files uploaded yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {files.map(file => (
                    <div
                      key={file.id}
                      onClick={() => setSelectedFile(file)}
                      className={`glass rounded-lg p-3 cursor-pointer transition-all hover:bg-blue-500/10 ${selectedFile?.id === file.id ? 'ring-2 ring-blue-500' : ''
                        }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium truncate">{file.filename}</span>
                            {file.is_compressed && (
                              <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-xs whitespace-nowrap">
                                🗜️
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2 text-xs">
                            <span className={`px-2 py-0.5 rounded ${file.allocation_type === 'contiguous' ? 'bg-blue-500/20 text-blue-400' :
                                file.allocation_type === 'linked' ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-orange-500/20 text-orange-400'
                              }`}>
                              {file.allocation_type}
                            </span>
                            <span className="text-slate-400">{file.size_kb?.toFixed(2) || '0.00'}KB</span>
                            <span className="text-slate-400">{file.blocks_count || 0} blocks</span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteFile(file.id);
                          }}
                          className="bg-red-500/20 hover:bg-red-500/30 p-2 rounded-lg transition-all flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card rounded-xl p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5" /> Activity Log
            </h3>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {logs.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No activity yet</p>
                </div>
              ) : (
                logs.slice().reverse().map((log, index) => (
                  <div
                    key={index}
                    className={`glass rounded-lg p-3 animate-fade-in text-xs sm:text-sm ${log.type === 'error' ? 'border-l-4 border-red-500' :
                        log.type === 'success' ? 'border-l-4 border-green-500' :
                          log.type === 'warning' ? 'border-l-4 border-yellow-500' :
                            'border-l-4 border-blue-500'
                      }`}
                  >
                    <span className="text-slate-400 mr-2">[{log.time}]</span>
                    <span>{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Alerts Section */}
        {(duplicates.length > 0 || junkFiles.length > 0) && (
          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
            {duplicates.length > 0 && (
              <div className="card rounded-xl p-4 sm:p-6 border-red-500/30 animate-slide-in">
                <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2 text-red-400 mb-4">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" /> Duplicate Files
                </h3>
                <div className="space-y-2">
                  {duplicates.map(file => (
                    <div key={file.id} className="glass rounded-lg p-3 flex justify-between items-center gap-2">
                      <span className="text-xs sm:text-sm truncate flex-1">{file.filename}</span>
                      <button
                        onClick={() => deleteFile(file.id)}
                        className="bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {junkFiles.length > 0 && (
              <div className="card rounded-xl p-4 sm:p-6 border-yellow-500/30 animate-slide-in">
                <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2 text-yellow-400 mb-4">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" /> Junk Files
                </h3>
                <div className="space-y-2">
                  {junkFiles.map(file => (
                    <div key={file.id} className="glass rounded-lg p-3 flex justify-between items-center gap-2">
                      <span className="text-xs sm:text-sm truncate flex-1">{file.filename}</span>
                      <button
                        onClick={() => deleteFile(file.id)}
                        className="bg-yellow-500 hover:bg-yellow-600 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-slate-900 transition-all whitespace-nowrap"
                      >
                        Clean
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Auto-Optimize Overlay */}
      {isOptimizing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="glass rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative overflow-hidden">
            {/* Animated Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="scanline-effect"></div>
              {particles.map(particle => (
                <div
                  key={particle.id}
                  className="absolute w-2 h-2 bg-blue-400 rounded-full animate-particle"
                  style={{
                    left: `${particle.x}%`,
                    top: `${particle.y}%`,
                    '--tx': `${particle.tx}px`,
                    '--ty': `${particle.ty}px`
                  }}
                />
              ))}
            </div>

            <div className="relative z-10">
              {!showOptimizationComplete ? (
                <>
                  {/* Robot Icon */}
                  <div className="flex justify-center mb-6">
                    <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-6 rounded-2xl animate-float animate-glow">
                      <div className="text-6xl">🤖</div>
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
                    Auto Optimization in Progress
                  </h2>
                  <p className="text-center text-slate-400 mb-6">
                    AI is analyzing and optimizing your file system...
                  </p>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400">Progress</span>
                      <span className="text-blue-400 font-semibold">{optimizationProgress}%</span>
                    </div>
                    <div className="h-3 bg-slate-800/50 rounded-full overflow-hidden">
                      <div
                        className="h-full progress-bar-fill rounded-full transition-all duration-500"
                        style={{ width: `${optimizationProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Fragmentation Meter */}
                  <div className="glass rounded-xl p-4 mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-slate-400">Fragmentation Level</span>
                      <div className="flex items-center gap-2">
                        <span className="text-red-400 font-semibold">{initialFragmentation.toFixed(1)}%</span>
                        <span className="text-slate-600">→</span>
                        <span className="text-green-400 font-semibold">{fragmentation.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-500 to-green-500 rounded-full transition-all duration-1000"
                        style={{ width: `${100 - fragmentation}%` }}
                      />
                    </div>
                  </div>

                  {/* Current Stage */}
                  <div className="glass rounded-xl p-4 mb-6 border-l-4 border-blue-500">
                    <div className="flex items-center gap-3">
                      <div className="animate-spin">
                        <RefreshCw className="w-5 h-5 text-blue-400" />
                      </div>
                      <span className="text-blue-400 font-medium">{optimizationStage}</span>
                    </div>
                  </div>

                  {/* Optimization Insights */}
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {optimizationInsights.map((insight, index) => (
                      <div
                        key={index}
                        className="glass rounded-lg p-3 flex items-start gap-3 animate-fade-in"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-slate-300">{insight}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  {/* Success Animation */}
                  <div className="flex justify-center mb-6">
                    <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-6 rounded-2xl animate-bounce">
                      <div className="text-6xl">✨</div>
                    </div>
                  </div>

                  <h2 className="text-4xl font-bold text-center mb-3 bg-gradient-to-r from-green-400 to-emerald-400 text-transparent bg-clip-text">
                    Optimization Complete!
                  </h2>

                  <p className="text-center text-xl text-slate-300 mb-6">
                    Your system is now running <span className="text-green-400 font-bold">98.7%</span> efficiently
                  </p>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="glass rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-green-400 mb-1">
                        {initialFragmentation.toFixed(1)}% → {fragmentation.toFixed(1)}%
                      </div>
                      <div className="text-xs text-slate-400">Fragmentation Reduced</div>
                    </div>
                    <div className="glass rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-blue-400 mb-1">
                        {optimizationInsights.length}
                      </div>
                      <div className="text-xs text-slate-400">Tasks Completed</div>
                    </div>
                  </div>

                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
                    <p className="text-green-400 text-sm">
                      🎉 All optimizations applied successfully!
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Confetti */}
          {confetti.map(piece => (
            <div
              key={piece.id}
              className="absolute w-2 h-4 animate-confetti"
              style={{
                left: `${piece.left}%`,
                top: '-10px',
                backgroundColor: piece.color,
                animationDelay: `${piece.delay}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="glass rounded-2xl p-6 max-w-md w-full shadow-2xl animate-slide-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold">Upload New File</h2>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedUploadFile(null);
                }}
                className="bg-slate-700/50 hover:bg-slate-600/50 p-2 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-slate-400 mb-2">Select File</label>
              <div className="relative">
                <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files.length > 0) {
                      setSelectedUploadFile(e.target.files[0]);
                    }
                  }}
                  className="w-full px-4 py-3 glass rounded-lg text-sm cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-500 file:text-white file:cursor-pointer hover:file:bg-blue-600"
                />
              </div>
              {selectedUploadFile && (
                <div className="mt-2 text-sm text-green-400 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  {selectedUploadFile.name}
                </div>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm text-slate-400 mb-2">Allocation Method</label>
              <select
                value={selectedAllocation}
                onChange={(e) => setSelectedAllocation(e.target.value)}
                className="w-full px-4 py-3 glass rounded-lg text-sm cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="contiguous">Contiguous - Continuous blocks</option>
                <option value="linked">Linked - Blocks with pointers</option>
                <option value="indexed">Indexed - Index block addresses</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleFileUpload}
                disabled={!selectedUploadFile}
                className={`flex-1 btn-primary py-3 rounded-lg font-semibold flex items-center justify-center gap-2 ${!selectedUploadFile ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
              >
                <Upload className="w-5 h-5" /> Upload
              </button>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedUploadFile(null);
                }}
                className="flex-1 glass py-3 rounded-lg font-semibold hover:bg-slate-700/50 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileSystemSimulator;