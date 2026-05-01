# File System Simulator

A full-stack web app simulating OS file system concepts — block allocation, fragmentation, defragmentation, compression, and AI-based duplicate detection.

---

## Prerequisites

- Python 3.11
- Node.js v18+
- npm

---

## How to Run

### 1. Clone the repository

```bash
git clone https://github.com/your-username/OperatingSystemPBL.git
cd OperatingSystemPBL
```

### 2. Set up the Backend

```bash
cd backend

# Create and activate a virtual environment
python -m venv .venv

# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# Remove conflicting TensorFlow packages (one-time step)
pip uninstall tensorflow-intel tensorflow keras tf_keras -y

# Install all dependencies
pip install -r requirements.txt

# Start the Flask server
python app.py
```

Backend runs at: `http://localhost:5000`

### 3. Set up the Frontend

Open a new terminal:

```bash
cd frontend

# Install node dependencies
npm install

# Start the development server
npm run dev
```

Opens in browser at: **http://localhost:5173**

---
```
OperatingSystemPBL/
│
├── .venv/                        # Python virtual environment
│
├── backend/
│   ├── uploads/                  # Uploaded files stored here at runtime
│   ├── app.py                    # Main Flask application (all routes + logic)
│   ├── database.db               # SQLite database (auto-created on first run)
│   └── requirements.txt          # Python dependencies
│
├── data/                         # Additional data assets
│
├── frontend/
│   ├── public/                   # Static public assets
│   ├── src/
│   │   ├── assets/               # Images and static assets
│   │   ├── App.css               # Global app styles
│   │   ├── App.jsx               # Root React component
│   │   ├── index.css             # Base CSS reset/styles
│   │   ├── LandingPage.css       # Landing page styles
│   │   ├── LandingPage.jsx       # Landing page component
│   │   └── main.jsx              # React entry point
│   ├── index.html                # HTML entry point
│   ├── package.json              # Frontend dependencies and scripts
│   └── vite.config.js            # Vite dev server configuration
│
├── uploads/                      # Root-level uploads folder
└── database.db                   # Root-level DB (auto-created)
```

---

## How It Works

- **Block Allocation** — Files are allocated using contiguous or linked strategy across 4KB disk blocks stored in SQLite.
- **Fragmentation** — Tracks and calculates fragmentation % across the block table.
- **Defragmentation** — Reassigns all blocks contiguously ordered by upload sequence.
- **Compression** — gzip compresses files >200KB; original and compressed sizes are tracked.
- **Duplicate Detection** — SHA-256 for exact matches; `sentence-transformers` cosine similarity (≥80%) for semantic duplicates.
- **Journaling** — Every operation is timestamped and logged to a `logs` table.

---

## Tech Stack

| Layer    | Technology                              |
|----------|-----------------------------------------|
| Frontend | React, Vite                             |
| Backend  | Python, Flask, Flask-CORS               |
| Database | SQLite                                  |
| AI/ML    | sentence-transformers, PyTorch, Whisper |
| Files    | pdfplumber, python-docx                 |

---

> ⚠️ Do not install `tensorflow`, `keras`, or `tf_keras` — not required and causes import conflicts.
