# fe-dapp-voting

> 🌐 The frontend for System DApp Voting — on-chain, modular, and verifiable voting platform. <br />
> Try it live at h[https://smart-voting-dapp.vercel.app](https://smart-voting-dapp.vercel.app)

## ⚙️ Getting Started

### 1. Install dependencies


```bash
npm install
```

### 2. Configure Environment Variables

Create a .env file in the project root:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourVotingContractAddress
DATABASE_URL=Database URI
```

### 3. Start the Development Server

```bash
npm run dev
```

App will live at [http://localhost:3000](http://localhost:3000)

## 🗳️ Voting User Flow

### 1. Connect Wallet
Log in using MetaMask or any supported wallet.

### 2. View Sessions
Browse active and upcoming voting sessions using session id. Eligibility and status are loaded from the contract.

### 3. See Candidates:
View candidate names and addresses for each session.

### 4. Vote
If eligible, cast your vote (on-chain transaction).

### 5. Results
See vote counts per candidate and current session winner in real time.