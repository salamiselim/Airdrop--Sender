// Import necessary Synthetix modules
import { defineWalletSetup } from '@synthetixio/synpress'
import { MetaMask } from '@synthetixio/synpress/playwright'

// Define a test seed phrase and password
const SEED_PHRASE = 'test test test test test test test test test test test junk'
const PASSWORD = 'SynpressIsAwesomeNow!!!'

// Define the basic wallet setup
export default defineWalletSetup(PASSWORD, async (context, walletPage) => {
    const metamask = new MetaMask(context, walletPage, PASSWORD)
     
    // Import the wallet using seed phrase
    await metamask.importWallet(SEED_PHRASE)

    // Additional setup steps can be added here such as:
    // - Adding custom networks
    // - Importing tokens
    // - Setting up specific account state
})