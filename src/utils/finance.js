export function calculateMonthlyPayment(principal, annualRate, years) {
  if (principal === 0) return 0;
  const monthlyRate = annualRate / 12;
  const totalMonths = years * 12;
  if (monthlyRate === 0) return principal / totalMonths;
  return (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -totalMonths));
}

export function calculateInvestmentFutureValue({
  initial = 0,
  monthly = 0,
  grossReturn = 0,
  taxRate = 0,
  years = 0,
  investInitial = true,
  investMonthly = true,
}) {
  const netAnnualReturn = grossReturn * (1 - taxRate);
  const monthlyReturnRate = netAnnualReturn / 12;
  const totalMonths = Math.round(years * 12);
  let investmentValue = investInitial ? initial : 0;
  let savedAmount = investInitial ? 0 : initial;
  for (let month = 1; month <= totalMonths; month++) {
    investmentValue = investmentValue * (1 + monthlyReturnRate);
    if (investMonthly) investmentValue += monthly; else savedAmount += monthly;
  }
  return investmentValue + savedAmount;
}

export function calculateMortgageCosts({ principal, annualRate, years, inflation }) {
  const totalMonths = years * 12;
  const monthlyInflation = inflation / 12;
  const payment = calculateMonthlyPayment(principal, annualRate, years);
  const totalPaid = payment * totalMonths;
  const interestNominal = totalPaid - principal;
  let presentValuePayments = 0;
  for (let month = 1; month <= totalMonths; month++) {
    presentValuePayments += payment / Math.pow(1 + monthlyInflation, month);
  }
  const interestReal = presentValuePayments - principal;
  return { payment, totalPaid, interestNominal, interestReal };
}

export function calculateScenarioGain({
  price,
  downPaymentRatio,
  annualRate,
  years,
  grossReturnRate,
  taxRate,
  inflationRate,
  initialCapital,
  monthlyContribution = 0,
  investInitial = true,
  investMonthly = true,
}) {
  const principal = price * (1 - downPaymentRatio);
  const futureValueNominal = calculateInvestmentFutureValue({
    initial: initialCapital,
    monthly: monthlyContribution,
    grossReturn: grossReturnRate,
    taxRate,
    years,
    investInitial,
    investMonthly,
  });
  const {
    interestNominal,
    interestReal,
    payment,
  } = calculateMortgageCosts({ principal, annualRate, years, inflation: inflationRate });
  const futureValueReal = futureValueNominal / Math.pow(1 + inflationRate, years);
  const totalContributions =
    (investInitial ? initialCapital : 0) +
    (investMonthly ? monthlyContribution * years * 12 : 0);
  const gainNominal = futureValueNominal - totalContributions - interestNominal;
  const gainReal = futureValueReal - totalContributions - interestReal;
  return {
    principal,
    initialCapital,
    payment,
    fvNominal: futureValueNominal,
    fvReal: futureValueReal,
    interestNominal,
    interestReal,
    gainNominal,
    gainReal,
  };
}

export function calculateBreakEvenGrossReturn({
  price,
  downPaymentRatio,
  annualRate,
  years,
  taxRate,
  inflationRate,
  initialCapital,
  monthlyContribution = 0,
  investInitial = true,
  investMonthly = true,
}) {
  let lowerBound = 0;
  let upperBound = 0.2; // 0..20% gross return
  for (let i = 0; i < 60; i++) {
    const midPoint = (lowerBound + upperBound) / 2;
    const gain = calculateScenarioGain({
      price,
      downPaymentRatio,
      annualRate,
      years,
      grossReturnRate: midPoint,
      taxRate,
      inflationRate,
      initialCapital,
      monthlyContribution,
      investInitial,
      investMonthly,
    }).gainReal;
    if (gain >= 0) upperBound = midPoint; else lowerBound = midPoint;
  }
  return (lowerBound + upperBound) / 2;
}

export function calculateMortgageBalance({ principal, annualRate, years, afterYears }) {
  const payment = calculateMonthlyPayment(principal, annualRate, years);
  const monthlyRate = annualRate / 12;
  const monthsElapsed = Math.round(afterYears * 12);
  if (monthlyRate === 0) {
    const balance = principal - payment * monthsElapsed;
    return Math.max(0, balance);
  }
  const balance =
    principal * Math.pow(1 + monthlyRate, monthsElapsed) -
    payment * ((Math.pow(1 + monthlyRate, monthsElapsed) - 1) / monthlyRate);
  return Math.max(0, balance);
}

export function generateAmortizationSchedule({
  principal,
  annualRate,
  years,
  initial = 0,
  monthly = 0,
  grossReturn = 0,
  taxRate = 0,
  investInitial = true,
  investMonthly = true,
}) {
  const payment = calculateMonthlyPayment(principal, annualRate, years);
  const monthlyRate = annualRate / 12;
  const monthlyReturnRate = (grossReturn * (1 - taxRate)) / 12;
  const totalMonths = Math.round(years * 12);
  let balance = principal;
  let paidPrincipal = 0;
  let investmentValue = investInitial ? initial : 0;
  let savedAmount = investInitial ? 0 : initial;
  let payoffMonth = null;
  const rows = [];
  for (let month = 1; month <= totalMonths; month++) {
    const interest = balance * monthlyRate;
    const capital = payment - interest;
    balance = Math.max(0, balance - capital);
    paidPrincipal += capital;

    investmentValue = investmentValue * (1 + monthlyReturnRate);
    if (investMonthly) investmentValue += monthly; else savedAmount += monthly;
    const available = investmentValue + savedAmount;
    if (payoffMonth === null && available >= balance) payoffMonth = month;

    rows.push({ month, interest, capital, balance, paidPrincipal, available });
  }
  return { rows, payoffMonth };
}

export function calculatePayOffTime({
  price,
  downPaymentRatio,
  annualRate,
  years,
  grossReturnRate,
  taxRate,
  initialCapital,
  monthlyContribution = 0,
  investInitial = true,
  investMonthly = true,
}) {
  const principal = price * (1 - downPaymentRatio);
  const initialInvestment = initialCapital;

  function totalSavedAt(yearsElapsed) {
    return calculateInvestmentFutureValue({
      initial: initialInvestment,
      monthly: monthlyContribution,
      grossReturn: grossReturnRate,
      taxRate,
      years: yearsElapsed,
      investInitial,
      investMonthly,
    });
  }

  function remainingBalanceAt(yearsElapsed) {
    return calculateMortgageBalance({
      principal,
      annualRate,
      years,
      afterYears: yearsElapsed,
    });
  }

  if (totalSavedAt(years) < remainingBalanceAt(years)) return Infinity;

  let lowerBound = 0;
  let upperBound = years;
  for (let i = 0; i < 60; i++) {
    const midPoint = (lowerBound + upperBound) / 2;
    if (totalSavedAt(midPoint) >= remainingBalanceAt(midPoint)) upperBound = midPoint;
    else lowerBound = midPoint;
  }
  return (lowerBound + upperBound) / 2;
}

