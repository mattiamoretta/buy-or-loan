import { describe, it, expect } from 'vitest';
import {
  calculateMonthlyPayment,
  calculateInvestmentFutureValue,
  calculateMortgageCosts,
  calculateScenarioGain,
  calculateBreakEvenGrossReturn,
  calculateMortgageBalance,
  generateAmortizationSchedule,
  calculatePayOffTime,
} from './finance';

describe('finance utilities', () => {
  it('calculates payment', () => {
    expect(calculateMonthlyPayment(100000, 0.05, 30)).toBeCloseTo(536.8216230121399, 5);
  });

  it('computes investment future value', () => {
    expect(
      calculateInvestmentFutureValue({ initial: 1000, monthly: 100, grossReturn: 0.05, taxRate: 0.2, years: 1 })
    ).toBeCloseTo(2262.9878305134794, 5);
  });

  it('computes mortgage costs', () => {
    const res = calculateMortgageCosts({ principal: 100000, annualRate: 0.05, years: 30, inflation: 0.02 });
    expect(res.payment).toBeCloseTo(536.8216230121399, 5);
    expect(res.totalPaid).toBeCloseTo(193255.78428437034, 5);
    expect(res.interestNominal).toBeCloseTo(93255.78428437034, 5);
    expect(res.interestReal).toBeCloseTo(45236.29372310749, 5);
  });

  it('evaluates scenario gain', () => {
    const res = calculateScenarioGain({
      price: 200000,
      downPaymentRatio: 0.2,
      annualRate: 0.05,
      years: 30,
      grossReturnRate: 0.05,
      taxRate: 0.2,
      inflationRate: 0.02,
      initialCapital: 40000,
      monthlyContribution: 100,
    });
    expect(res.principal).toBe(160000);
    expect(res.payment).toBeCloseTo(858.9145968194237, 5);
    expect(res.gainReal).toBeCloseTo(-36890.19100736438, 5);
  });

  it('computes break-even gross return', () => {
    const res = calculateBreakEvenGrossReturn({
      price: 200000,
      downPaymentRatio: 0.2,
      annualRate: 0.05,
      years: 30,
      taxRate: 0.2,
      inflationRate: 0.02,
      initialCapital: 40000,
      monthlyContribution: 100,
    });
    expect(res).toBeCloseTo(0.06372442977267745, 5);
  });

  it('calculates mortgage balance', () => {
    expect(
      calculateMortgageBalance({ principal: 160000, annualRate: 0.05, years: 30, afterYears: 5 })
    ).toBeCloseTo(146925.97133605107, 5);
  });

  it('provides amortization schedule', () => {
    const res = generateAmortizationSchedule({
      principal: 160000,
      annualRate: 0.05,
      years: 30,
      initial: 10000,
      monthly: 100,
      grossReturn: 0.05,
      taxRate: 0.2,
    });
    expect(res.rows[0]).toMatchObject({ month: 1 });
    expect(res.rows.length).toBe(360);
    expect(res.payoffMonth).toBe(266);
  });

  it('computes payoff time', () => {
    const res = calculatePayOffTime({
      price: 200000,
      downPaymentRatio: 0.2,
      annualRate: 0.05,
      years: 30,
      grossReturnRate: 0.05,
      taxRate: 0.2,
      initialCapital: 40000,
      monthlyContribution: 100,
    });
    expect(res).toBeCloseTo(16.125, 3);
  });
});
