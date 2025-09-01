export function pmt(principal, annualRate, years){
  if(principal === 0) return 0;
  const r = annualRate/12; const n = years*12;
  if(r === 0) return principal/n;
  return (principal*r)/(1-Math.pow(1+r,-n));
}

export function investFV({ initial=0, monthly=0, grossReturn=0, taxRate=0, years=0, investInitial=true, investMonthly=true }){
  const rNet = grossReturn * (1 - taxRate);
  const rm = rNet / 12;
  const months = Math.round(years * 12);
  let v = investInitial ? initial : 0;
  let saved = investInitial ? 0 : initial;
  for (let m = 1; m <= months; m++) {
    v = v * (1 + rm);
    if (investMonthly) v += monthly; else saved += monthly;
  }
  return v + saved;
}

export function mortgageCosts({ principal, annualRate, years, inflation }){
  const n = years * 12;
  const im = inflation / 12;
  const payment = pmt(principal, annualRate, years);
  const totalPaid = payment * n;
  const interestNominal = totalPaid - principal;
  let pvPayments = 0;
  for (let m = 1; m <= n; m++) pvPayments += payment / Math.pow(1 + im, m);
  const interestReal = pvPayments - principal;
  return { payment, totalPaid, interestNominal, interestReal };
}

export function scenarioGain({ price, downPct, tan, years, grossReturn, taxRate, inflation, initialCapital, monthlyExtra=0, investInitial=true, investMonthly=true }){
  const principal = price * (1 - downPct);
  const fvNominal = investFV({ initial: initialCapital, monthly: monthlyExtra, grossReturn, taxRate, years, investInitial, investMonthly });
  const { interestNominal, interestReal, payment } = mortgageCosts({ principal, annualRate: tan, years, inflation });
  const fvReal = fvNominal / Math.pow(1 + inflation, years);
  const totalContrib = (investInitial ? initialCapital : 0) + (investMonthly ? monthlyExtra * years * 12 : 0);
  const gainNominal = fvNominal - totalContrib - interestNominal;
  const gainReal = fvReal - totalContrib - interestReal;
  return { principal, initialCapital, payment, fvNominal, fvReal, interestNominal, interestReal, gainNominal, gainReal };
}

export function breakEvenGross({ price, downPct, tan, years, taxRate, inflation, initialCapital, monthlyExtra=0, investInitial=true, investMonthly=true }){
  let lo=0, hi=0.2; // 0..20% lordo
  for(let i=0;i<60;i++){
    const mid=(lo+hi)/2; const g=scenarioGain({ price, downPct, tan, years, grossReturn: mid, taxRate, inflation, initialCapital, monthlyExtra, investInitial, investMonthly }).gainReal;
    if(g>=0) hi=mid; else lo=mid;
  }
  return (lo+hi)/2;
}

export function mortgageBalance({ principal, annualRate, years, afterYears }){
  const payment = pmt(principal, annualRate, years);
  const r = annualRate/12; const t = Math.round(afterYears*12);
  if(r === 0) {
    const bal = principal - payment * t;
    return Math.max(0, bal);
  }
  const bal = principal*Math.pow(1+r, t) - payment*((Math.pow(1+r, t)-1)/r);
  return Math.max(0, bal);
}

export function amortizationSchedule({ principal, annualRate, years, initial=0, monthly=0, grossReturn=0, taxRate=0, investInitial=true, investMonthly=true }) {
  const payment = pmt(principal, annualRate, years);
  const r = annualRate / 12;
  const rm = grossReturn * (1 - taxRate) / 12;
  const n = Math.round(years * 12);
  let balance = principal;
  let paidPrincipal = 0;
  let v = investInitial ? initial : 0;
  let saved = investInitial ? 0 : initial;
  let payoffMonth = null;
  const rows = [];
  for (let m = 1; m <= n; m++) {
    const interest = balance * r;
    const capital = payment - interest;
    balance = Math.max(0, balance - capital);
    paidPrincipal += capital;

    v = v * (1 + rm);
    if (investMonthly) v += monthly; else saved += monthly;
    const available = v + saved;
    if (payoffMonth === null && available >= balance) payoffMonth = m;

    rows.push({ month: m, interest, capital, balance, paidPrincipal, available });
  }
  return { rows, payoffMonth };
}

export function payOffTime({ price, downPct, tan, years, grossReturn, taxRate, initialCapital, monthlyExtra=0, investInitial=true, investMonthly=true }){
  const principal = price*(1-downPct);
  const initialInvest = initialCapital;

  function totalSaved(y){
    return investFV({ initial: initialInvest, monthly: monthlyExtra, grossReturn, taxRate, years: y, investInitial, investMonthly });
  }

  function balance(y){
    return mortgageBalance({ principal, annualRate: tan, years, afterYears: y });
  }

  if(totalSaved(years) < balance(years)) return Infinity;

  let lo=0, hi=years;
  for(let i=0;i<60;i++){
    const mid=(lo+hi)/2;
    if(totalSaved(mid) >= balance(mid)) hi=mid; else lo=mid;
  }
  return (lo+hi)/2;
}
