export const fmt = (n) => n.toLocaleString("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
export const fmt2 = (n) => n.toLocaleString("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 2 });
export const pct = (n) => `${(n * 100).toFixed(2)}%`;
