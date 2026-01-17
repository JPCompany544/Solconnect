# Testing the Phantom Wallet Transaction Flow

## Prerequisites
- Phantom wallet browser extension installed
- Phantom wallet connected to your dApp
- Some SOL in your devnet wallet (for testing)

## How to Get Devnet SOL (for testing)

1. Open your Phantom wallet
2. Switch to **Devnet** network:
   - Click Settings (gear icon)
   - Developer Settings
   - Enable "Testnet Mode"
   - Select "Devnet" from network dropdown
3. Copy your wallet address
4. Go to: https://solfaucet.com/
5. Paste your address and request airdrop
6. Wait for SOL to arrive (~30 seconds)

## Testing Steps

### Happy Path (Success Flow)
1. Open the dApp: `http://localhost:3000`
2. Connect your Phantom wallet if not already connected
3. Navigate to the dashboard
4. Click on any loan amount (e.g., $1,000, $2,500, etc.)
5. Scroll down to see the **Transaction Summary**
6. Click **"Continue with Loan"** button
7. **Expected:** Phantom wallet pop-up appears asking you to approve the transaction
8. Click **"Approve"** in Phantom
9. **Expected:** Loading modal appears with spinner (⏳ Processing Transaction...)
10. **Expected:** After exactly 3 seconds, success modal appears (✓ Transaction Successful!)
11. Click **"Close"** on success modal
12. **Expected:** Returns to dashboard, selection is reset

### Error Flow 1: User Rejection
1. Follow steps 1-6 above
2. When Phantom pop-up appears, click **"Reject"** or **"Cancel"**
3. **Expected:** Error modal appears: "Transaction cancelled by user"
4. Click **"Close"** to dismiss

### Error Flow 2: Insufficient Balance
1. Make sure your devnet wallet has very little or no SOL
2. Follow steps 1-6 above
3. Click **"Approve"** in Phantom
4. **Expected:** Error modal appears: "Insufficient SOL balance for transaction"

### Error Flow 3: Wallet Not Connected
1. Disconnect your Phantom wallet
2. Navigate to dashboard (or you might be redirected to home)
3. If you somehow reach the transaction summary, try clicking "Continue with Loan"
4. **Expected:** Error modal: "Wallet not connected properly. Please reconnect your wallet."

## What to Look For

### ✅ Success Indicators
- Phantom pop-up appears smoothly
- Loading modal shows for exactly 3 seconds
- Success modal displays correct loan amount
- All modals are centered on screen
- Animations are smooth
- No console errors
- Transaction signature logged in console

### ⚠️ Potential Issues
- If Phantom doesn't open: Check if wallet is connected
- If "insufficient balance" error: Get devnet SOL from faucet
- If network errors: Check internet connection
- If modal doesn't center: Try different screen sizes/browsers

## Checking the Transaction

1. After successful transaction, check browser console for:
   ```
   Transaction signature: <long-hash-here>
   ```
2. Copy the signature
3. Go to: https://explorer.solana.com/?cluster=devnet
4. Paste the signature in search
5. Verify the transaction details:
   - From: Your wallet address
   - To: `6mz6bQ88xsrpDeKLzdDhRdqqEZYYrVVTqJbKF1aYCzU3` (treasury)
   - Amount: Network fee in SOL

## Common Issues & Solutions

### Issue: "Transaction failed" with unclear error
**Solution:** Check console for detailed error message

### Issue: Phantom doesn't open
**Solution:** 
- Ensure Phantom extension is unlocked
- Try refreshing the page
- Check if wallet is connected (look for wallet address in UI)

### Issue: Transaction takes too long
**Solution:**
- Devnet can be slow sometimes
- Wait up to 30 seconds
- If it fails, try again

### Issue: Wrong network
**Solution:**
- Make sure Phantom is set to **Devnet**
- Code is configured for devnet by default
- Don't use mainnet for testing!

## Current Configuration

- **Network:** Devnet (safe for testing)
- **Treasury Address:** `6mz6bQ88xsrpDeKLzdDhRdqqEZYYrVVTqJbKF1aYCzU3`
- **Mock SOL/USD Rate:** 1 SOL = $100
- **Network Fee:** 9% of loan amount (or $45 for $1000 loan)

## Example Calculations

| Loan Amount | Network Fee (USD) | Network Fee (SOL) | Lamports |
|-------------|-------------------|-------------------|----------|
| $1,000      | $45.00           | 0.45 SOL          | 450,000,000 |
| $2,500      | $225.00          | 2.25 SOL          | 2,250,000,000 |
| $5,000      | $450.00          | 4.50 SOL          | 4,500,000,000 |
| $10,000     | $900.00          | 9.00 SOL          | 9,000,000,000 |

## After Testing

Once you've verified everything works:
1. Review `PHANTOM_INTEGRATION.md` for production deployment steps
2. Update network to mainnet-beta
3. Implement real SOL/USD pricing
4. Consider deleting unused Cryptomus files
5. Add backend verification of transaction signatures

## Need Help?

- Check browser console for errors
- Review `PHANTOM_INTEGRATION.md` for technical details
- Ensure you're on devnet (not mainnet!)
- Make sure you have devnet SOL
