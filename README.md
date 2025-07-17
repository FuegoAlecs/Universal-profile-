# Universal Profile Card

This project aims to create a dynamic and shareable "Universal Profile Card" for Web3 users, leveraging blockchain data (NFTs, token balances, activity) and decentralized storage (IPFS via Pinata).

## Features

**Phase 1-4 (Already Implemented/Summarized):**
*   **Basic Wallet Connection:** Connects to MetaMask or similar injected wallets.
*   **Profile Header:** Displays wallet address, ENS name (if available), and profile image.
*   **NFT Gallery:** Shows owned NFTs with detail modals.
*   **Activity Feed:** Displays recent blockchain transactions.
*   **Wallet Portfolio:** Tracks and displays token balances.
*   **Alchemy Integration:** Uses Alchemy APIs for fetching real-time blockchain data.
*   **Dark Mode Toggle:** Allows switching between light and dark themes.

**Phase 5 (Implemented in this response):**
*   **Profile Card Image Generation:** Users can download their profile card as a PNG image.
*   **Social Media Sharing:** Direct sharing to Twitter with a pre-filled tweet and profile link.
*   **Scannable Universal Profile (QR Code):** A QR code is generated for easy sharing and direct navigation to the profile.
*   **Dedicated Profile Page:** A dynamic route (`/profile/[address]`) allows any Universal Profile to be viewed via a shareable URL.

**Phase 6 (Conceptual/Future):**
*   **Profile NFT Minting (Testnet):** Concept for minting the profile card as an ERC-721 NFT, with metadata stored on IPFS via Pinata.
*   **Advanced Decentralized Social Graph:** Future integration with protocols like Lens Protocol or Farcaster for on-chain social interactions.

## Getting Started

### 1. Environment Variables

Create a `.env` file in the root of your project and add the following:

\`\`\`
NEXT_PUBLIC_ALCHEMY_API_KEY="YOUR_ALCHEMY_API_KEY_HERE"
ALCHEMY_API_KEY="YOUR_ALCHEMY_API_KEY_HERE" # For server-side use
NEXT_PUBLIC_ALCHEMY_NETWORK="eth-sepolia" # e.g., "eth-mainnet", "polygon-mainnet"

PINATA_API_KEY="YOUR_PINATA_API_KEY_HERE"
PINATA_SECRET_API_KEY="YOUR_PINATA_SECRET_API_KEY_HERE"

# Smart contract addresses (after deployment)
NEXT_PUBLIC_PROFILE_REGISTRY_ADDRESS="0xYourProfileRegistryAddressHere"
NEXT_PUBLIC_ERC6551_REGISTRY_ADDRESS="0xYourERC6551RegistryAddressHere"
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
# or
yarn install
# or
pnpm install
\`\`\`

### 3. Run the Development Server

\`\`\`bash
npm run dev
# or
yarn dev
# or
pnpm dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 4. Deploy Smart Contracts (for real data)

To use real data and enable the "Mint as Profile NFT" feature, you'll need to deploy your smart contracts to a testnet (e.g., Sepolia).

1.  **Compile Contracts:**
    \`\`\`bash
    npx hardhat compile
    \`\`\`
2.  **Deploy Contracts:**
    \`\`\`bash
    npx hardhat run scripts/deploy.js --network sepolia # or your chosen network
    \`\`\`
3.  **Update `.env`:** After deployment, update `NEXT_PUBLIC_PROFILE_REGISTRY_ADDRESS` and `NEXT_PUBLIC_ERC6551_REGISTRY_ADDRESS` in your `.env` file with the actual deployed addresses.

## Project Structure

\`\`\`
.
├── app/
│   ├── api/
│   │   ├── alchemy/
│   │   │   ├── activity/[address]/route.ts
│   │   │   ├── balances/[address]/route.ts
│   │   │   ├── nfts/[address]/route.ts
│   │   │   └── profile/[address]/route.ts
│   │   └── pinata/
│   │       └── upload/route.ts  # New: Pinata upload API
│   ├── layout.tsx
│   ├── page.tsx
│   └── profile/
│       └── [address]/
│           └── page.tsx         # New: Dynamic profile page
├── components/
│   ├── ui/                      # Shadcn UI components
│   ├── ActivityFeed.tsx
│   ├── ConnectWallet.tsx
│   ├── NFTDetailModal.tsx
│   ├── NFTGallery.tsx
│   ├── ProfileCard.tsx
│   ├── ProfileHeader.tsx
│   ├── ShareProfileCard.tsx     # New: Sharing component
│   ├── SocialLinks.tsx
│   └── WalletPortfolio.tsx
├── contracts/
│   ├── ProfileRegistry.sol
│   └── TokenBoundAccount.sol
│   └── ProfileNFT.sol           # Conceptual: For Phase 6
├── hooks/
│   ├── useAlchemyActivity.ts
│   ├── useAlchemyNftApi.ts
│   ├── useAlchemyProfile.ts
│   ├── useAlchemyTokenBalances.ts
│   ├── use-mobile.tsx
│   └── use-toast.ts
├── lib/
│   ├── alchemy.ts
│   ├── contract-service.ts
│   ├── profile-service.ts
│   ├── redis.ts
│   ├── utils.ts
│   └── websocket-service.ts
├── public/                      # Static assets
├── scripts/
│   └── deploy.js
├── styles/
│   └── globals.css
├── types/
│   └── alchemy.ts
├── .env                         # Environment variables
├── components.json
├── hardhat.config.js
├── next.config.mjs
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json
