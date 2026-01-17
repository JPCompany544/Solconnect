# Network Fee Structure - Updated

## Current Fee Tiers (Fixed Amounts)

The network fees are now **fixed amounts** based on the loan tier, not percentages:

| Loan Amount | Network Fee | You Receive | Fee % of Loan |
|-------------|-------------|-------------|---------------|
| **$500**    | **$20**     | $480        | 4.0%          |
| **$1,000**  | **$25**     | $975        | 2.5%          |
| **$2,500**  | **$50**     | $2,450      | 2.0%          |
| **$5,000**  | **$65**     | $4,935      | 1.3%          |
| **$10,000** | **$100**    | $9,900      | 1.0%          |

## Why Fixed Fees?

Fixed fee structure provides:
- **Transparency**: Users know exactly what they'll pay
- **Better value for larger loans**: Fee percentage decreases as loan amount increases
- **Simplified calculations**: No complex math required

## Implementation

The fee logic is centralized in `lib/fees.ts`:

```typescript
export function getNetworkFee(loanAmount: number): number {
  switch (loanAmount) {
    case 500: return 20
    case 1000: return 25
    case 2500: return 50
    case 5000: return 65
    case 10000: return 100
    default: return 20 // Fallback
  }
}
```

## Where Fees Are Used

1. **Transaction Summary** (`components/TransactionSummary.tsx`)
   - Displays the fee before user confirms
   - Shows "Minimum received" amount

2. **Dashboard Transaction** (`app/dashboard/page.tsx`)
   - Calculates the actual SOL amount to transfer
   - Converts USD fee to SOL using mock rate (1 SOL = $100)

3. **Phantom Wallet Flow**
   - User approves the fee amount in Phantom
   - Transaction is sent to treasury address

## SOL Conversion Examples

Using mock rate of **1 SOL = $100 USD**:

| Loan | Fee (USD) | Fee (SOL) | Lamports |
|------|-----------|-----------|----------|
| $500 | $20 | 0.20 SOL | 200,000,000 |
| $1,000 | $25 | 0.25 SOL | 250,000,000 |
| $2,500 | $50 | 0.50 SOL | 500,000,000 |
| $5,000 | $65 | 0.65 SOL | 650,000,000 |
| $10,000 | $100 | 1.00 SOL | 1,000,000,000 |

> **Note:** In production, replace the mock conversion rate with real-time SOL/USD pricing from an oracle or API.

## Testing the New Fees

1. Select any loan amount on the dashboard
2. Check the Transaction Summary shows correct fee:
   - $500 loan → $20 fee → $480 minimum received
   - $1,000 loan → $25 fee → $975 minimum received
   - etc.
3. Click "Continue with Loan"
4. Verify Phantom shows correct SOL amount to approve
5. After approval, check transaction on Solana Explorer

## Changes From Previous Version

**Previous (Percentage-based):**
- $1,000 loan → $45 fee (4.5%)
- $2,500 loan → $225 fee (9%)
- $5,000 loan → $450 fee (9%)
- $10,000 loan → $900 fee (9%)

**Current (Fixed-tier):**
- $1,000 loan → $25 fee (2.5%) ✅ **Better!**
- $2,500 loan → $50 fee (2.0%) ✅ **Much better!**
- $5,000 loan → $65 fee (1.3%) ✅ **Way better!**
- $10,000 loan → $100 fee (1.0%) ✅ **Significantly better!**

Users get **much better value** with the new fee structure, especially on larger loans!
