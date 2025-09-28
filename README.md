# 🗳️ On-Chain Election dApp

A **single-page application (SPA)** built with **React + Vite**, styled with **Tailwind CSS**, and powered by **Ethereum smart contracts** via **Truffle**.
This project demonstrates a decentralized voting platform with user registration, login, candidate management, secure vote casting, and results visualization.

---

## 📌 Features

* **Authentication & Access Control**

  * User login and registration
  * Admin login with privileged access
  * Protected routes via `ProtectedRoute.jsx`

* **User Functionality**

  * Register and update voter profile
  * View election details
  * Cast votes securely on-chain

* **Admin Functionality**

  * Add and manage candidates
  * Monitor election progress
  * View detailed results (tables + graphs)

* **Results Visualization**

  * Public results view
  * Admin-specific results dashboard
  * Graph-based results (React + chart.js wrapper)

* **Blockchain Integration**

  * Smart contracts managed via **Truffle**
  * Interaction with Ethereum (local Ganache or Infura node)
  * Shared helper utilities (`utils.js`) for web3 interactions

---

## 📂 Project Structure

```
.
├── package.json             # Project dependencies & scripts
├── vite.config.js           # Vite build & dev server config
├── postcss.config.mjs       # PostCSS pipeline
├── tailwind.config.js       # Tailwind CSS configuration
├── truffle-config.js        # Ethereum smart contract deployment
├── index.html               # SPA host page
└── src/
    ├── main.jsx             # React entry point
    ├── lib/
    │   └── utils.js         # Shared helpers (web3, contracts, etc.)
    ├── components/
    │   ├── AuthContext.jsx  # Global auth state (React Context API)
    │   ├── ProtectedRoute.jsx
    │   ├── Dashboards/
    │   │   ├── AdminDashboard.jsx
    │   │   └── UserDashboard.jsx
    │   ├── Elections/
    │   │   ├── ElectionDetails.jsx
    │   │   └── Vote.jsx
    │   ├── Login/
    │   │   ├── Login.jsx
    │   │   └── AdminLogin.jsx
    │   ├── Register/
    │   │   ├── Register.jsx
    │   │   ├── AddCandidate.jsx
    │   │   ├── CandidateDetails.jsx
    │   │   └── EditProfile.jsx
    │   ├── Results/
    │   │   ├── Results.jsx
    │   │   ├── AdminResultsView.jsx
    │   │   └── ElectionResultsGraph.jsx
    │   ├── Navbar/
    │   │   ├── Navbar.jsx
    │   │   └── Navbar.css
    │   └── ui/
    │       ├── card.jsx
    │       └── chart.jsx
```

---

## 🛠️ Technologies Used

* **Frontend**

  * React (SPA, hooks, Context API, component-based design)
  * Vite (fast dev server + build tool)
  * Tailwind CSS (utility-first styling)
  * PostCSS (CSS transformations)

* **Blockchain**

  * Truffle (smart contract management & migrations)
  * Ethereum (local Ganache or external node via Infura)
  * Web3/Ethers.js (on-chain calls & interactions)

* **Visualization & UI**

  * Custom React UI components (`ui/card`, `ui/chart`)
  * Tailwind utilities for styling
  * Charts for election results

---

## ⚙️ Setup & Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/election-dapp.git
cd election-dapp
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup blockchain environment

* Install [Truffle](https://trufflesuite.com/) and [Ganache](https://trufflesuite.com/ganache/).
* Configure your local blockchain or connect to Infura in `truffle-config.js`.
* Compile & deploy contracts:

```bash
truffle compile
truffle migrate --network development
```

### 4. Start development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Build for production

```bash
npm run build
```

---

## 🏛️ System Architecture

```plaintext
                        ┌────────────────────────┐
                        │   Build/Dev Tools      │
                        │ Vite, Tailwind, PostCSS│
                        └──────────┬────────────┘
                                   │
                                   ▼
                        ┌────────────────────────┐
                        │  React SPA (Client)    │
                        │ main.jsx, components/* │
                        └──────────┬────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         ▼                         ▼                         ▼
 ┌───────────────┐        ┌────────────────┐         ┌────────────────┐
 │ AuthContext   │        │ Feature Groups │         │ Shared Helpers │
 │ (state mgmt)  │        │ Login, Register│         │ utils.js       │
 └───────────────┘        │ Elections, ... │         └────────────────┘
                          └────────────────┘
                                   │
                                   ▼
                        ┌────────────────────────┐
                        │  Web3/Ethers Calls     │
                        └──────────┬────────────┘
                                   │
                                   ▼
                        ┌────────────────────────┐
                        │ Ethereum Network        │
                        │ (Ganache/Infura)       │
                        └──────────┬────────────┘
                                   │
                                   ▼
                        ┌────────────────────────┐
                        │ Smart Contracts        │
                        │ Managed by Truffle     │
                        └────────────────────────┘
```

---

## 🚀 Usage Flow

1. **User Registration** → Register as voter or admin
2. **Login** → Access user/admin dashboard
3. **Admin** → Add/manage candidates, monitor votes
4. **User** → View elections, cast vote on-chain
5. **Results** → View aggregated results & charts

---

## 📊 Future Improvements

* Add MetaMask wallet integration
* Implement zero-knowledge proofs for anonymous voting
* Enable multi-election management
* Improve admin analytics dashboard

---

## 📄 License

This project is licensed under the **MIT License**.
