/**
 * Fetch the current SOL/USD price from CoinGecko API
 * Includes caching to avoid rate limits
 */

interface PriceCache {
    price: number
    timestamp: number
}

let priceCache: PriceCache | null = null
const CACHE_DURATION = 30000 // 30 seconds cache

export async function getSolPrice(): Promise<number> {
    // Check if we have a valid cached price
    if (priceCache && Date.now() - priceCache.timestamp < CACHE_DURATION) {
        console.log('Using cached SOL price:', priceCache.price)
        return priceCache.price
    }

    try {
        // Fetch from CoinGecko API (free, no API key required)
        const response = await fetch(
            'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd',
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            }
        )

        if (!response.ok) {
            throw new Error(`CoinGecko API error: ${response.status}`)
        }

        const data = await response.json()
        const price = data.solana?.usd

        if (!price || typeof price !== 'number') {
            throw new Error('Invalid price data from CoinGecko')
        }

        // Update cache
        priceCache = {
            price,
            timestamp: Date.now(),
        }

        console.log('Fetched fresh SOL price:', price)
        return price

    } catch (error) {
        console.error('Error fetching SOL price:', error)

        // If we have an old cached price, use it as fallback
        if (priceCache) {
            console.warn('Using stale cached price as fallback:', priceCache.price)
            return priceCache.price
        }

        // Ultimate fallback: use a reasonable default
        const fallbackPrice = 140
        console.warn('Using fallback SOL price:', fallbackPrice)
        return fallbackPrice
    }
}

/**
 * Convert USD amount to SOL using current market price
 */
export async function usdToSol(usdAmount: number): Promise<number> {
    const solPrice = await getSolPrice()
    return usdAmount / solPrice
}

/**
 * Convert SOL amount to USD using current market price
 */
export async function solToUsd(solAmount: number): Promise<number> {
    const solPrice = await getSolPrice()
    return solAmount * solPrice
}

/**
 * Format SOL amount with appropriate decimal places
 */
export function formatSol(solAmount: number): string {
    return solAmount.toFixed(4)
}
