// The shop sells in US dollars only. One formatter, so every price on the site
// reads the same way ($1,250.00) instead of each component rolling its own.
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export const formatUSD = (amount) => usd.format(Number(amount) || 0);
