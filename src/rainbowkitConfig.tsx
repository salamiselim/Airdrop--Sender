"use client"

import { getDefaultConfig } from "@rainbow-me/rainbowkit"
import {sepolia, mainnet, anvil} from "wagmi/chains"

export default getDefaultConfig({
    appName: "Airdrop Sender",
    projectId: "82721db4d10b78e9ec1eb4de7f0f983b",
    chains: [sepolia, mainnet, anvil],
    ssr: false
})