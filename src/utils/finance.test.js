import { describe, it, expect } from 'vitest';
import { pmt, investFV, mortgageCosts, scenarioGain, breakEvenGross, mortgageBalance, amortizationSchedule, payOffTime } from './finance';

describe('finance utilities', () => {
  it('calculates payment', () => {
    expect(pmt(100000, 0.05, 30)).toBeCloseTo(536.8216230121399, 5);
  });

  it('computes investment future value', () => {
    expect(
      investFV({ initial: 1000, monthly: 100, grossReturn: 0.05, taxRate: 0.2, years: 1 })
    ).toBeCloseTo(2262.9878305134794, 5);
  });

  it('computes mortgage costs', () => {
    const res = mortgageCosts({ principal: 100000, annualRate: 0.05, years: 30, inflation: 0.02 });
    expect(res.payment).toBeCloseTo(536.8216230121399, 5);
    expect(res.totalPaid).toBeCloseTo(193255.78428437034, 5);
    expect(res.interestNominal).toBeCloseTo(93255.78428437034, 5);
    expect(res.interestReal).toBeCloseTo(45236.29372310749, 5);
  });

  it('evaluates scenario gain', () => {
    const res = scenarioGain({
      price: 200000,
      downPct: 0.2,
      tan: 0.05,
      years: 30,
      grossReturn: 0.05,
      taxRate: 0.2,
      inflation: 0.02,
      initialCapital: 40000,
      monthlyExtra: 100,
    });
    expect(res.principal).toBe(160000);
    expect(res.payment).toBeCloseTo(858.9145968194237, 5);
    expect(res.gainReal).toBeCloseTo(-36890.19100736438, 5);
  });

  it('computes break-even gross return', () => {
    const res = breakEvenGross({
      price: 200000,
      downPct: 0.2,
      tan: 0.05,
      years: 30,
      taxRate: 0.2,
      inflation: 0.02,
      initialCapital: 40000,
      monthlyExtra: 100,
    });
    expect(res).toBeCloseTo(0.06372442977267745, 5);
  });

  it('calculates mortgage balance', () => {
    expect(
      mortgageBalance({ principal: 160000, annualRate: 0.05, years: 30, afterYears: 5 })
    ).toBeCloseTo(146925.97133605107, 5);
  });

  it('provides amortization schedule', () => {
    const res = amortizationSchedule({
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
    const res = payOffTime({
      price: 200000,
      downPct: 0.2,
      tan: 0.05,
      years: 30,
      grossReturn: 0.05,
      taxRate: 0.2,
      initialCapital: 40000,
      monthlyExtra: 100,
    });
    expect(res).toBeCloseTo(16.125, 3);
  });
});
