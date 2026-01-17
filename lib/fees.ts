/**
 * Get the network fee for a given loan amount
 * Fee structure:
 * $500 → $20
 * $1000 → $25
 * $2500 → $50
 * $5000 → $65
 * $10,000 → $100
 */
export function getNetworkFee(loanAmount: number): number {
    switch (loanAmount) {
        case 500:
            return 20
        case 1000:
            return 25
        case 2500:
            return 50
        case 5000:
            return 65
        case 10000:
            return 100
        default:
            // Fallback for any other amount (shouldn't happen with fixed loan tiers)
            return 20
    }
}
