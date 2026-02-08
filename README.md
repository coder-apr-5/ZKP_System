# ZKP Multi-System Attribute Verification

## Project Overview
A Zero-Knowledge Proof (ZKP) credential system allowing selective disclosure of attributes (e.g., Age) without revealing identity. Built with Next.js (Frontend) and FastAPI (Backend).

## Architecture
- **Frontend**: Next.js 14 (App Router), TailwindCSS, Zustand (State), Lucid React (Icons).
- **Backend**: Python FastAPI, SQLAlchemy (SQLite), Mocked BBS+ Signatures (for prototype ease).
- **Crypto**: Uses a BBS+ signature scheme simulation. In production, this would use `@mattrglobal/bbs-signatures` WASM and Python bindings.

## Prerequisites
- Node.js 18+
- Python 3.10+

## Setup & Run

### 1. Automated Setup (Windows)
Run the following scripts in order:
1. `install_backend.bat` - Sets up Python venv and installs dependencies.
2. `start_server.bat` - Starts both Backend (port 8000) and Frontend (port 3000).

### 2. Manual Setup

**Backend:**
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Usage
1. Open [http://localhost:3000](http://localhost:3000).
2. Go to **Issuer Portal** (/issuer) to create a credential.
3. Go to **Wallet** (/wallet) to view your credentials.
4. Go to **Verifier** (/verify/bar) to prove age > 21.
5. Or try the **Automated Demo** (/demo) for a guided walkthrough.

## Key Features implemented
- **Selective Disclosure**: Reveal only specific attributes.
- **Unlinkability**: Every proof uses a unique nonce preventing correlation.
- **Multi-Verifier**: Different verifiers (Bar, Liquor Store) can request different proofs.
