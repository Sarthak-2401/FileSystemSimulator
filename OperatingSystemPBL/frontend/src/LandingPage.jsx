import React, { useState } from "react";
import {
  HardDrive,
  Play,
  Zap,
  Database,
  Activity,
  FileText,
  RefreshCw,
  Cpu,
  ArrowRight,
  CheckCircle,
  Code,
  BookOpen,
  Target,
} from "lucide-react";
import FileSystemSimulator from "./App";
import "./LandingPage.css";

const LandingPage = () => {
  const [showSimulator, setShowSimulator] = useState(false);

  if (showSimulator) {
    return (
      <div className="simulator-page">
        <div className="simulator-container">
          <button
            onClick={() => setShowSimulator(false)}
            className="back-button"
          >
            ← Back to Home
          </button>
          <FileSystemSimulator />
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: <Database size={32} />,
      title: "Multiple Allocation Methods",
      description:
        "Experience Contiguous, Linked, and Indexed allocation strategies in action.",
    },
    {
      icon: <Activity size={32} />,
      title: "Real-time Monitoring",
      description:
        "Track disk usage, fragmentation levels, and system performance live.",
    },
    {
      icon: <RefreshCw size={32} />,
      title: "Disk Defragmentation",
      description:
        "Optimize performance by reorganizing fragmented files seamlessly.",
    },
    {
      icon: <Zap size={32} />,
      title: "File Compression",
      description: "Reduce file sizes efficiently with built-in compression.",
    },
    {
      icon: <FileText size={32} />,
      title: "Smart File Detection",
      description:
        "Automatically detect and manage duplicate or junk files.",
    },
    {
      icon: <Cpu size={32} />,
      title: "Visual Block Management",
      description:
        "See how files are stored across disk blocks with interactive visuals.",
    },
  ];

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-icon">
            <HardDrive size={80} />
          </div>
          <h1 className="hero-title">File System Simulator</h1>
          <p className="hero-subtitle">An Interactive Operating System Project</p>
          <p className="hero-desc">
            Learn how files are allocated, managed, and optimized through
            real-time visualizations and file system simulations.
          </p>

          <button
            className="launch-button"
            onClick={() => setShowSimulator(true)}
          >
            <Play size={32} />
            Launch Simulator
            <ArrowRight size={32} />
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Powerful Features</h2>
        <div className="features-grid">
          {features.map((f, i) => (
            <div key={i} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>File System Simulator — Interactive OS Project © 2025</p>
        <p>Learn file allocation, compression, and disk management visually.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
