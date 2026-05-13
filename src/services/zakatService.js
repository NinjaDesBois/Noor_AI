export async function getGoldPrice() {
  try {
    const res = await fetch('https://api.gold-api.com/price/XAU')
    const data = await res.json()
    // XAU = USD per troy ounce. 1 troy oz = 31.1035g
    const usdPerGram = data.price / 31.1035
    const fxRes  = await fetch('https://api.frankfurter.app/latest?from=USD&to=EUR')
    const fx     = await fxRes.json()
    const eurPerGram = usdPerGram * (fx.rates?.EUR || 0.92)
    return { eurPerGram, source: 'gold-api.com', live: true }
  } catch {
    return { eurPerGram: 85, source: 'indicative', live: false }
  }
}

export function calculateZakat({
  cash, goldGrams, silverGrams, investments, receivables, debts, goldPricePerGram
}) {
  const NISAB_GRAMS_GOLD   = 85
  const NISAB_GRAMS_SILVER = 595
  const SILVER_PRICE_EUR   = 0.85  // per gram approximate

  const goldValue   = goldGrams   * goldPricePerGram
  const silverValue = silverGrams * SILVER_PRICE_EUR
  const totalAssets = cash + goldValue + silverValue + investments + receivables
  const totalWealth = totalAssets - debts

  const nisabGold   = NISAB_GRAMS_GOLD   * goldPricePerGram
  const nisab       = nisabGold  // gold nisab (majority contemporary position)

  const zakatDue    = totalWealth >= nisab ? totalWealth * 0.025 : 0

  return {
    totalWealth: Math.round(totalWealth * 100) / 100,
    nisab:       Math.round(nisab * 100) / 100,
    zakatDue:    Math.round(zakatDue * 100) / 100,
    obligatory:  totalWealth >= nisab,
    breakdown: {
      goldValue:   Math.round(goldValue * 100) / 100,
      silverValue: Math.round(silverValue * 100) / 100,
      totalAssets: Math.round(totalAssets * 100) / 100,
    }
  }
}

export function calculateZakatFitr(familyMembers) {
  // ECFR recommendation for Western Europe: €7-10 per person
  const FITR_AMOUNT_EUR = 8
  return {
    perPerson: FITR_AMOUNT_EUR,
    total:     FITR_AMOUNT_EUR * familyMembers,
  }
}
