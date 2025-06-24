 "use client"

import { InputField } from "@/components/InputField"
import { useState, useMemo, useEffect } from "react"
import { chainsToTSender, tsenderAbi, erc20Abi } from "@/constants"
import { useChainId, useConfig, useAccount, useWriteContract } from "wagmi"
import { readContract, waitForTransactionReceipt } from "@wagmi/core"
import { calculateTotal } from "@/utils"

export default function AirdropForm () {
    const [tokenAddress, setTokenAddress] = useState("")
    const [recipient, setRecipient] = useState("")
    const [amounts, setAmounts] = useState("")
    const [tokenDetails, setTokenDetails] = useState({ 
        name: "", 
        symbol: "", 
        decimals: 0,
        loading: false
    })
    const [isProcessing, setIsProcessing] = useState(false)
    const chainId = useChainId()
    const config = useConfig()
    const account = useAccount()
    const total = useMemo(() => calculateTotal(amounts), [amounts])
    const {data: hash, isPending, writeContractAsync} = useWriteContract()

    // Load saved data from localStorage on mount
    useEffect(() => {
        const savedData = localStorage.getItem('airdropFormData')
        if (savedData) {
            try {
                const { tokenAddress, recipient, amounts } = JSON.parse(savedData)
                setTokenAddress(tokenAddress || "")
                setRecipient(recipient || "")
                setAmounts(amounts || "")
            } catch (e) {
                console.error("Failed to load saved data:", e)
            }
        }
    }, [])

    // Save inputs to localStorage
    useEffect(() => {
        const formData = { tokenAddress, recipient, amounts }
        localStorage.setItem('airdropFormData', JSON.stringify(formData))
    }, [tokenAddress, recipient, amounts])

    // Fetch token details when token address changes
    useEffect(() => {
        const fetchTokenDetails = async () => {
            if (!tokenAddress || tokenAddress.length !== 42) {
                setTokenDetails({ name: "", symbol: "", decimals: 0, loading: false })
                return
            }
            
            setTokenDetails(prev => ({ ...prev, loading: true }))
            
            try {
                const [name, symbol, decimals] = await Promise.all([
                    readContract(config, {
                        abi: erc20Abi,
                        address: tokenAddress as `0x${string}`,
                        functionName: "name",
                    }),
                    readContract(config, {
                        abi: erc20Abi,
                        address: tokenAddress as `0x${string}`,
                        functionName: "symbol",
                    }),
                    readContract(config, {
                        abi: erc20Abi,
                        address: tokenAddress as `0x${string}`,
                        functionName: "decimals",
                    }),
                ])
                
                setTokenDetails({
                    name: name as string,
                    symbol: symbol as string,
                    decimals: decimals as number,
                    loading: false
                })
            } catch (error) {
                console.error("Failed to fetch token details:", error)
                setTokenDetails({
                    name: "Invalid token",
                    symbol: "N/A",
                    decimals: 0,
                    loading: false
                })
            }
        }
        
        fetchTokenDetails()
    }, [tokenAddress, config])

    async function getApproveAmount(tSenderAddress: string | null): Promise<bigint> {
        if (!tSenderAddress) {
            alert("No address found, use a supported chain")
            // Use BigInt() constructor instead of 0n literal
            return BigInt(0)
        }
        const response = await readContract(config,{
            abi: erc20Abi,
            address: tokenAddress as `0x${string}`,
            functionName: "allowance",
            args: [account.address as `0x${string}`, tSenderAddress as `0x${string}`],
        })
        return response as bigint
    }

    async function handleSubmit() {
        setIsProcessing(true)
        try {
            const tSenderAddress = chainsToTSender[chainId]?.["tsender"] || null
            if (!tSenderAddress) {
                alert("Unsupported chain")
                return
            }
            
            const approveAmount = await getApproveAmount(tSenderAddress)
            const totalBigInt = BigInt(total)
            
            if (approveAmount < totalBigInt) {
                const approvalHash = await writeContractAsync({
                    abi: erc20Abi,
                    address: tokenAddress as `0x${string}`,
                    functionName: "approve",
                    args: [tSenderAddress as `0x${string}`, totalBigInt],
                })
                
                const approvalReceipt = await waitForTransactionReceipt(config,{
                    hash: approvalHash
                }) 
                console.log("Approval confirmed:", approvalReceipt)
            }

            await writeContractAsync({
                abi: tsenderAbi,
                address: tSenderAddress as `0x${string}`,
                functionName: "airdropERC20",
                args: [
                    tokenAddress,
                    recipient.split(/[,\n]+/).map(addr => addr.trim()).filter(addr => addr !== ''),
                    amounts.split(/[,\n]+/).map(amt => amt.trim()).filter(amt => amt !== ''),
                    totalBigInt,
                ],
            })
        } catch (error) {
            console.error("Transaction failed:", error)
            alert(`Transaction failed: ${(error as Error).message}`)
        } finally {
            setIsProcessing(false)
        }
    }

    // Calculate recipient count
    const recipientCount = useMemo(() => {
        return recipient.split(/[,\n]+/)
            .map(addr => addr.trim())
            .filter(addr => addr !== '').length
    }, [recipient])

    return (
        <div className="flex flex-col gap-6 max-w-2xl mx-auto">
            <InputField
                label="Token Address"
                placeholder="0x..."
                value={tokenAddress}
                onChange={e => setTokenAddress(e.target.value)}
            />
            
            <InputField
                label="Recipient Addresses"
                placeholder="0x851, 0x234"
                value={recipient}
                onChange={e => setRecipient(e.target.value)}
                large={true} 
            />
            
            <InputField
                label="Amounts"
                placeholder="100,200,300..."
                value={amounts}
                onChange={e => setAmounts(e.target.value)}
                large={true}
            />
            
            {/* Information Box - Always visible */}
            <div className="border border-zinc-200 rounded-lg p-4 bg-zinc-50">
                <h3 className="font-medium text-zinc-800 mb-2">Airdrop Details</h3>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                    {/* Recipient Count */}
                    <div className="text-zinc-600">Recipients:</div>
                    <div className="text-zinc-800 font-medium">
                        {recipientCount}
                    </div>
                    
                    {/* Total Amount */}
                    <div className="text-zinc-600">Total to Send:</div>
                    <div className="text-zinc-800 font-medium">
                        {total} {tokenDetails.symbol ? tokenDetails.symbol : 'tokens'}
                    </div>
                    
                    {/* Token Details - Only show if token address exists */}
                    {tokenAddress && (
                        <>
                            <div className="text-zinc-600">Token Name:</div>
                            <div className="text-zinc-800 font-medium">
                                {tokenDetails.loading ? "Loading..." : tokenDetails.name || "N/A"}
                            </div>
                            
                            <div className="text-zinc-600">Symbol:</div>
                            <div className="text-zinc-800 font-medium">
                                {tokenDetails.loading ? "Loading..." : tokenDetails.symbol || "N/A"}
                            </div>
                            
                            <div className="text-zinc-600">Decimals:</div>
                            <div className="text-zinc-800 font-medium">
                                {tokenDetails.loading ? "Loading..." : tokenDetails.decimals || "N/A"}
                            </div>
                        </>
                    )}
                </div>
            </div>
            
            <button 
                onClick={handleSubmit}
                disabled={isProcessing || isPending}
                className={`
                    px-6 py-3 rounded-lg font-medium flex items-center justify-center
                    bg-gradient-to-r from-blue-500 to-indigo-600
                    text-white shadow-lg
                    transform transition-all duration-300
                    hover:scale-105 hover:from-blue-600 hover:to-indigo-700
                    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                    active:scale-95
                    disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100
                `}
            >
                {(isProcessing || isPending) ? (
                    <>
                        <svg 
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
                            xmlns="http://www.w3.org/2000/svg" 
                            fill="none" 
                            viewBox="0 0 24 24"
                        >
                            <circle 
                                className="opacity-25" 
                                cx="12" 
                                cy="12" 
                                r="10" 
                                stroke="currentColor" 
                                strokeWidth="4"
                            ></circle>
                            <path 
                                className="opacity-75" 
                                fill="currentColor" 
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                        </svg>
                        Processing...
                    </>
                ) : (
                    "Send tokens"
                )}
            </button>
            
            {hash && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                    <p className="font-medium text-blue-800">Transaction Submitted</p>
                    <p className="text-blue-600 break-all mt-1">
                        Hash: {hash}
                    </p>
                </div>
            )}
        </div>
    )
}