import React, { useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";
import { Calculator, TrendingUp, ArrowRight, Home, PiggyBank, Wallet, WalletCards, ArrowDownCircle, ArrowUpCircle, Clock, Percent, Sun, Flame } from "lucide-react";
import DataCard from "./components/DataCard";
import ExampleGroup from "./components/ExampleGroup";

import {
  formatCurrency,
  formatCurrencyWithCents,
  formatPercentage,
} from "./utils/format";
import {
  calculateScenarioGain,
  calculateBreakEvenGrossReturn,
  generateAmortizationSchedule,
  calculatePayOffTime,
} from "./utils/finance";
import Field from "./components/Field";
import YearSelector from "./components/YearSelector";
import Checkbox from "./components/Checkbox";
import DownPaymentField from "./components/DownPaymentField";
import KPICard from "./components/KPICard";
import Stepper from "./components/Stepper";
import LanguageSelector from "./components/LanguageSelector";
import { STEP_LABELS, STEP_DESCRIPTIONS, UI_TEXTS, CONFIG_TEXTS } from "./constants/texts";

// -------------------- UI helpers --------------------
function Card({ children }){ return <motion.div layout className="bg-white rounded-2xl shadow p-5 border border-slate-200">{children}</motion.div>; }
function Grid({ children }){ return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">{children}</div>; }
function Popup({ message, onConfirm, onCancel, texts }){
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white p-6 rounded-xl shadow max-w-sm text-center space-y-4">
        <p className="text-sm">{message}</p>
        <div className="flex justify-center gap-3">
          {onCancel && (
            <button onClick={onCancel} className="px-4 py-2 rounded-xl border">{texts.cancel}</button>
          )}
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-orange-600 text-white rounded-xl"
          >
            {onCancel ? texts.proceed : texts.ok}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfigCard({ title, description, details = [], icon: Icon, onSteps, onResults, texts }) {
  return (
    <div className="rounded-2xl p-5 shadow bg-gradient-to-br from-orange-50 to-amber-100 border border-orange-200 flex flex-col gap-2">
      {Icon ? (
        <div className="flex items-center gap-3">
          <Icon className="w-8 h-8 text-orange-600" />
          <h3 className="text-md font-medium text-slate-800">{title}</h3>
        </div>
      ) : (
        <h3 className="text-md font-medium text-slate-800">{title}</h3>
      )}
      <p className="text-sm text-slate-600">{description}</p>
      {details.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {details.map((d, i) => (
              <span key={i} className="px-2 py-1 bg-white rounded-full text-xs text-slate-600">
                {d}
              </span>
            ))}
          </div>
        )}
      <div className="flex gap-2 justify-center mt-2">
        {onSteps && (
          <button
            onClick={onSteps}
            className="px-3 py-1 bg-white text-orange-600 border border-orange-600 rounded-xl text-sm"
          >
            {texts.seeSteps}
          </button>
        )}
        {onResults && (
          <button
            onClick={onResults}
            className="px-3 py-1 bg-orange-600 text-white rounded-xl text-sm"
          >
            {texts.results}
          </button>
        )}
      </div>
    </div>
  );
}

function AmortizationTable({ principal, annualRate, years, initial=0, monthly=0, grossReturn=0, taxRate=0, investInitial=true, investMonthly=true, texts }) {
  const { rows, payoffMonth } = useMemo(() => generateAmortizationSchedule({ principal, annualRate, years, initial, monthly, grossReturn, taxRate, investInitial, investMonthly }), [principal, annualRate, years, initial, monthly, grossReturn, taxRate, investInitial, investMonthly]);
  const showSavings = initial > 0 || monthly > 0;
  const containerRef = useRef(null);
  const payoffRef = useRef(null);
  useEffect(() => {
    if (containerRef.current && payoffRef.current) {
      const container = containerRef.current;
      const row = payoffRef.current;
      const headerHeight = container.querySelector('thead')?.offsetHeight || 0;
      container.scrollTop = Math.max(row.offsetTop - headerHeight, 0);
    }
  }, [rows, payoffMonth]);
  return (
    <details className="mt-4" open>
      <summary className="cursor-pointer text-sm text-orange-600">{texts.heading}</summary>
      {showSavings && payoffMonth && (
        <p className="text-xs text-slate-500 mt-1">{texts.payoffNote}</p>
      )}
      <div ref={containerRef} className="overflow-x-auto max-h-64 overflow-y-auto mt-2">
        <table className="min-w-full text-xs tabular-nums">
          <thead className="bg-slate-100 sticky top-0 z-10">
            <tr>
              <th className="px-2 py-1 text-left">{texts.month}</th>
              <th className="px-2 py-1 text-right">{texts.interest}</th>
              <th className="px-2 py-1 text-right">{texts.principal}</th>
              <th className="px-2 py-1 text-right">{texts.balance}</th>
              <th className="px-2 py-1 text-right">{texts.totalPrincipal}</th>
              {showSavings && <th className="px-2 py-1 text-right">{texts.savings}</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr
                key={r.month}
                ref={showSavings && r.month === payoffMonth ? payoffRef : null}
                className={`odd:bg-white even:bg-slate-50 ${showSavings && r.month === payoffMonth ? '!bg-emerald-100 font-medium' : ''}`}
              >
                <td className="px-2 py-1 font-mono text-right">{r.month}</td>
                <td className="px-2 py-1 font-mono text-right">{formatCurrencyWithCents(r.interest)}</td>
                <td className="px-2 py-1 font-mono text-right">{formatCurrencyWithCents(r.capital)}</td>
                <td className="px-2 py-1 font-mono text-right">{formatCurrencyWithCents(r.balance)}</td>
                <td className="px-2 py-1 font-mono text-right">{formatCurrencyWithCents(r.paidPrincipal)}</td>
                {showSavings && <td className="px-2 py-1 font-mono text-right">{formatCurrencyWithCents(r.available)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

function Recap({ price, downPaymentRatio, annualInterestRate, scenarioYears, initialCapital, monthlyContribution, inflationRate, grossReturnRate, taxRate, investInitial, investMonthly, minimumGainPercentage, salary, texts }){
  return (
    <details className="mb-4">
      <summary className="cursor-pointer text-sm text-white bg-orange-600 px-2 py-1 rounded">{texts.heading}</summary>
      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm bg-orange-50 p-2 rounded">
        {price > 0 && <span>{texts.price}: <b>{formatCurrency(price)}</b></span>}
        <span>{texts.downPayment}: <b>{formatCurrency(price * downPaymentRatio)} ({formatPercentage(downPaymentRatio)})</b></span>
        <span>{texts.annualRate}: <b>{formatPercentage(annualInterestRate)}</b></span>
        <span>{texts.scenarioDurations}: <b>{scenarioYears.join(', ')} anni</b></span>
        <span>{texts.initialCapital}: <b>{formatCurrency(initialCapital)}</b></span>
        <span>{texts.monthlyContribution}: <b>{formatCurrency(monthlyContribution)}</b></span>
        <span>{texts.inflation}: <b>{formatPercentage(inflationRate)}</b></span>
        {(investInitial || investMonthly) && (
          <>
            <span>{texts.grossReturn}: <b>{formatPercentage(grossReturnRate)}</b></span>
            <span>{texts.taxRate}: <b>{formatPercentage(taxRate)}</b></span>
          </>
        )}
        <span>{texts.investInitial}: <b>{investInitial ? texts.yes : texts.no}</b></span>
        <span>{texts.investMonthly}: <b>{investMonthly ? texts.yes : texts.no}</b></span>
        <span>{texts.minimumGain}: <b>{formatPercentage(minimumGainPercentage)}</b></span>
        <span>{texts.salary}: <b>{formatCurrency(salary)}</b></span>
      </div>
    </details>
  );
}

// -------------------- App --------------------
export default function App(){
  // Wizard: 0..6 (0 = landing)
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState(null);
  const [language, setLanguage] = useState("it");

  const backgrounds = [
    'from-orange-50 via-amber-50 to-yellow-50',
    'from-orange-100 via-amber-100 to-yellow-100',
    'from-orange-200 via-amber-200 to-yellow-200',
    'from-orange-300 via-amber-300 to-yellow-300',
    'from-orange-400 via-amber-400 to-yellow-400',
    'from-orange-500 via-amber-500 to-yellow-500',
    'from-orange-600 via-amber-600 to-yellow-600',
  ];

  // Base
  const [price, setPrice] = useState(150000);
  const [downPaymentRatio, setDownPaymentRatio] = useState(0.15);
  const [downMode, setDownMode] = useState('pct');
  const [scenarioYears, setScenarioYears] = useState([20]);
  const [initialCapital, setInitialCapital] = useState(price*(1-downPaymentRatio));

  // Tassi
  const [annualInterestRate, setAnnualInterestRate] = useState(0.03);
  const [inflationRate, setInflationRate] = useState(0.02);
  const [taxRate, setTaxRate] = useState(0.26);
  const [grossReturnRate, setGrossReturnRate] = useState(0.05);

  // Contributi e investimenti
  const [monthlyContribution, setMonthlyContribution] = useState(0);
  const [investInitial, setInvestInitial] = useState(true);
  const [investMonthly, setInvestMonthly] = useState(true);

  // Patrimonio
  const [salary, setSalary] = useState(30000);
  const [minimumGainPercentage, setMinimumGainPercentage] = useState(0.1);

  // Energia
  const [enableEnergy, setEnableEnergy] = useState(false);
  const [solarCost, setSolarCost] = useState(0);
  const [annualElectricCost, setAnnualElectricCost] = useState(0);
  const [solarSavingsPct, setSolarSavingsPct] = useState(0.5);
  const [boilerCost, setBoilerCost] = useState(0);
  const [annualHeatingCost, setAnnualHeatingCost] = useState(0);
  const [boilerSavingsPct, setBoilerSavingsPct] = useState(0.5);

  // Calcoli
  const scenarioStats = useMemo(
    () =>
      scenarioYears.map((years) => {
        const scenario = calculateScenarioGain({
          price,
          downPaymentRatio,
          annualRate: annualInterestRate,
          years,
          grossReturnRate,
          taxRate,
          inflationRate,
          initialCapital,
          monthlyContribution,
          investInitial,
          investMonthly,
        });
        const breakEven = calculateBreakEvenGrossReturn({
          price,
          downPaymentRatio,
          annualRate: annualInterestRate,
          years,
          taxRate,
          inflationRate,
          initialCapital,
          monthlyContribution,
          investInitial,
          investMonthly,
        });
        const payOffTimeYears = calculatePayOffTime({
          price,
          downPaymentRatio,
          annualRate: annualInterestRate,
          years,
          grossReturnRate,
          taxRate,
          initialCapital,
          monthlyContribution,
          investInitial,
          investMonthly,
        });
        const label = `Scenario ${years} anni`;
        return {
          years,
          scenario,
          breakEven,
          payOffTimeYears,
          label,
          labelN: `${label} nominale`,
          labelR: `${label} reale`,
        };
      }),
    [
      scenarioYears,
      price,
      downPaymentRatio,
      annualInterestRate,
      grossReturnRate,
      taxRate,
      inflationRate,
      initialCapital,
      monthlyContribution,
      investInitial,
      investMonthly,
    ]
  );

  const energyStats = useMemo(() => {
    if (!enableEnergy) return [];
    const solarYearly = annualElectricCost * solarSavingsPct;
    const boilerYearly = annualHeatingCost * boilerSavingsPct;
    return scenarioYears.map((years) => ({
      years,
      solarPayback: solarYearly > 0 ? solarCost / solarYearly : Infinity,
      solarGain: solarYearly * years - solarCost,
      boilerPayback: boilerYearly > 0 ? boilerCost / boilerYearly : Infinity,
      boilerGain: boilerYearly * years - boilerCost,
    }));
  }, [enableEnergy, annualElectricCost, solarSavingsPct, solarCost, annualHeatingCost, boilerSavingsPct, boilerCost, scenarioYears]);

  const colors = ["#2563eb", "#f97316", "#16a34a", "#9333ea", "#14b8a6"]; 

  const chartData = useMemo(() => {
    const rows = [];
    for (let r = 0.02; r <= 0.07 + 1e-9; r += 0.0025) {
      const row = { r: +(r * 100).toFixed(2) };
      scenarioYears.forEach((years) => {
        const label = `Scenario ${years} anni`;
        row[label] = calculateScenarioGain({
          price,
          downPaymentRatio,
          annualRate: annualInterestRate,
          years,
          grossReturnRate: r,
          taxRate,
          inflationRate,
          initialCapital,
          monthlyContribution,
          investInitial,
          investMonthly,
        }).gainReal;
      });
      rows.push(row);
    }
    return rows;
  }, [scenarioYears, price, downPaymentRatio, annualInterestRate, taxRate, inflationRate, initialCapital, monthlyContribution, investInitial, investMonthly]);

  const yearlyData = useMemo(() => {
    const maxY = Math.max(...scenarioYears);
    const rows = [];
    for (let y = 1; y <= maxY; y++) {
      const row = { year: y };
      scenarioYears.forEach((years) => {
        if (y <= years) {
          const scenario = calculateScenarioGain({
            price,
            downPaymentRatio,
            annualRate: annualInterestRate,
            years: y,
            grossReturnRate,
            taxRate,
            inflationRate,
            initialCapital,
            monthlyContribution,
            investInitial,
            investMonthly,
          });
          const label = `Scenario ${years} anni`;
          row[`${label} nominale`] = scenario.gainNominal;
          row[`${label} reale`] = scenario.gainReal;
        }
      });
      rows.push(row);
    }
    return rows;
  }, [scenarioYears, price, downPaymentRatio, annualInterestRate, grossReturnRate, taxRate, inflationRate, initialCapital, monthlyContribution, investInitial, investMonthly]);

  const better = scenarioStats.map(({ scenario }) =>
    minimumGainPercentage > 0
      ? scenario.gainReal >= scenario.principal * minimumGainPercentage
      : scenario.gainReal >= 0
  );

  const targetPct = minimumGainPercentage > 0 ? minimumGainPercentage : 0;
  const diffs = scenarioStats.map(({ scenario }) => ({
    diffPct: scenario.principal > 0 ? scenario.gainReal / scenario.principal - targetPct : 0,
    diffAmt: scenario.gainReal - scenario.principal * targetPct,
  }));

    const titleColor = step >= 6 ? "text-white" : "text-slate-800";
    const hasInvestment = (investInitial && initialCapital > 0) || (investMonthly && monthlyContribution > 0);

    const resetAll = () => {
      setPrice(150000);
      setDownPaymentRatio(0.15);
      setScenarioYears([20]);
      setInitialCapital(150000 * (1 - 0.15));
      setAnnualInterestRate(0.03);
      setInflationRate(0.02);
      setTaxRate(0.26);
      setGrossReturnRate(0.05);
      setMonthlyContribution(0);
      setInvestInitial(true);
      setInvestMonthly(true);
      setSalary(30000);
      setMinimumGainPercentage(0.1);
      setEnableEnergy(false);
      setSolarCost(0);
      setAnnualElectricCost(0);
      setSolarSavingsPct(0.5);
      setBoilerCost(0);
      setAnnualHeatingCost(0);
      setBoilerSavingsPct(0.5);
    };

    const applyConfig = (cfg) => {
      switch (cfg) {
        case 1:
          setScenarioYears([15, 25]);
          setInitialCapital(0);
          setMonthlyContribution(0);
          setInvestInitial(false);
          setInvestMonthly(false);
          break;
        case 2:
          setScenarioYears([10, 20, 30]);
          setInitialCapital(0);
          setMonthlyContribution(300);
          setInvestInitial(false);
          setInvestMonthly(false);
          break;
        case 3:
          setScenarioYears([15, 25, 35]);
          setInitialCapital(0);
          setMonthlyContribution(300);
          setInvestInitial(false);
          setInvestMonthly(true);
          break;
        case 4:
          setPrice(150000);
          setDownPaymentRatio(0);
          setScenarioYears([20, 40]);
          setInitialCapital(150000);
          setMonthlyContribution(0);
          setInvestInitial(true);
          setInvestMonthly(false);
          break;
        case 5:
          setPrice(0);
          setDownPaymentRatio(0);
          setAnnualInterestRate(0);
          setScenarioYears([20]);
          setInitialCapital(10000);
          setMonthlyContribution(300);
          setInvestInitial(true);
          setInvestMonthly(true);
          break;
        default:
          break;
      }
    };

    const handleInvestNext = () => {
      const proceed = () => {
        setLoading(true);
        setTimeout(()=>{setLoading(false); setStep(enableEnergy ? 5 : 6);},2000);
      };
      const principal = price * (1 - downPaymentRatio);
      if(principal <= 0){
        setPopup({
          message: UI_TEXTS[language].messages.noLoan,
          onConfirm: () => { setPopup(null); proceed(); },
          onCancel: () => setPopup(null),
          texts: UI_TEXTS[language].popup,
        });
        return;
      }
      if((!investInitial || initialCapital<=0) && (!investMonthly || monthlyContribution<=0)){
        setPopup({
          message: UI_TEXTS[language].messages.noInvestment,
          onConfirm: () => { setPopup(null); proceed(); },
          onCancel: () => setPopup(null),
          texts: UI_TEXTS[language].popup,
        });
        return;
      }
      proceed();
    };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${backgrounds[step]} animate-gradient text-slate-800`}>
      {popup && <Popup {...popup} />}
      <LanguageSelector language={language} setLanguage={setLanguage} />
      <div className="max-w-5xl mx-auto p-6">
        <header className="flex items-center justify-center gap-3 mb-6">
          <Calculator className="w-7 h-7 text-orange-600" />
          <h1 className={`text-2xl md:text-3xl font-semibold ${titleColor}`}>The wise investor's wizard 🚀</h1>
        </header>

        {step > 0 && <Stepper step={step} labels={STEP_LABELS[language]} />}

        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-white flex flex-col items-center justify-center gap-4"
            >
              <h1 className="text-2xl font-semibold text-orange-600">The wise investor's wizard 🚀</h1>
              <div className="h-16 w-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </motion.div>
          )}

          {!loading && step===0 && (
            <motion.div key="landing" initial={{opacity:0,x:50}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-50}} transition={{duration:0.4}} className="space-y-6">
              <p className="text-center text-lg text-slate-700">{UI_TEXTS[language].landing.tagline}</p>
              <div className="text-center">
                <button onClick={()=>{resetAll(); setStep(1);}} className="px-6 py-3 bg-orange-600 text-white rounded-xl text-lg shadow">{UI_TEXTS[language].landing.start}</button>
              </div>
              <h2 className="text-xl font-semibold text-center">{UI_TEXTS[language].landing.chooseExample}</h2>
              <div className="space-y-4">
                <ExampleGroup title={UI_TEXTS[language].landing.mortgage}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ConfigCard
                      texts={UI_TEXTS[language].configCard}
                      icon={Home}
                      title={CONFIG_TEXTS[language][0].title}
                      description={CONFIG_TEXTS[language][0].description}
                      details={CONFIG_TEXTS[language][0].details}
                      onSteps={() => {
                        applyConfig(1);
                        setStep(1);
                      }}
                      onResults={() => {
                        applyConfig(1);
                        setLoading(true);
                        setTimeout(() => {
                          setLoading(false);
                          setStep(6);
                        }, 2000);
                      }}
                    />
                    <ConfigCard
                      texts={UI_TEXTS[language].configCard}
                      icon={PiggyBank}
                      title={CONFIG_TEXTS[language][1].title}
                      description={CONFIG_TEXTS[language][1].description}
                      details={CONFIG_TEXTS[language][1].details}
                      onSteps={() => {
                        applyConfig(2);
                        setStep(1);
                      }}
                      onResults={() => {
                        applyConfig(2);
                        setLoading(true);
                        setTimeout(() => {
                          setLoading(false);
                          setStep(6);
                        }, 2000);
                      }}
                    />
                    <ConfigCard
                      texts={UI_TEXTS[language].configCard}
                      icon={Wallet}
                      title={CONFIG_TEXTS[language][2].title}
                      description={CONFIG_TEXTS[language][2].description}
                      details={CONFIG_TEXTS[language][2].details}
                      onSteps={() => {
                        applyConfig(3);
                        setStep(1);
                      }}
                      onResults={() => {
                        applyConfig(3);
                        setLoading(true);
                        setTimeout(() => {
                          setLoading(false);
                          setStep(6);
                        }, 2000);
                      }}
                    />
                  </div>
                </ExampleGroup>
                <ExampleGroup title={UI_TEXTS[language].landing.investment}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ConfigCard
                      texts={UI_TEXTS[language].configCard}
                      icon={TrendingUp}
                      title={CONFIG_TEXTS[language][3].title}
                      description={CONFIG_TEXTS[language][3].description}
                      details={CONFIG_TEXTS[language][3].details}
                      onSteps={() => {
                        applyConfig(5);
                        setStep(1);
                      }}
                      onResults={() => {
                        applyConfig(5);
                        setLoading(true);
                        setTimeout(() => {
                          setLoading(false);
                          setStep(6);
                        }, 2000);
                      }}
                    />
                  </div>
                </ExampleGroup>
                <ExampleGroup title={UI_TEXTS[language].landing.mortgageVsCash}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ConfigCard
                      texts={UI_TEXTS[language].configCard}
                      icon={WalletCards}
                      title={CONFIG_TEXTS[language][4].title}
                      description={CONFIG_TEXTS[language][4].description}
                      details={CONFIG_TEXTS[language][4].details}
                      onSteps={() => {
                        applyConfig(4);
                        setStep(1);
                      }}
                      onResults={() => {
                        applyConfig(4);
                        setLoading(true);
                        setTimeout(() => {
                          setLoading(false);
                          setStep(6);
                        }, 2000);
                      }}
                    />
                  </div>
                </ExampleGroup>
              </div>
            </motion.div>
          )}

          {!loading && step===2 && (
            <motion.div key="s2" initial={{opacity:0,x:50}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-50}} transition={{duration:0.4}} className="bg-white p-6 rounded-2xl shadow space-y-6">
              <h2 className="text-lg font-medium">{`Step 2 – ${STEP_LABELS[language][1]}`}</h2>
              <p className="text-sm text-slate-600">{STEP_DESCRIPTIONS[language][1]}</p>
              <div className="space-y-3">
                <Card>
                  <h3 className="text-md font-medium mb-2">{UI_TEXTS[language].step2.mortgageValues}</h3>
                  <Grid>
                    <Field label={UI_TEXTS[language].step2.priceLabel} description={UI_TEXTS[language].step2.priceDesc} value={price} onChange={setPrice} min={0} max={2000000} step={1000} suffix="€" />
                    <DownPaymentField price={price} downPaymentRatio={downPaymentRatio} setDownPaymentRatio={setDownPaymentRatio} mode={downMode} setMode={setDownMode} />
                    <Field label={UI_TEXTS[language].step2.tanLabel} description={UI_TEXTS[language].step2.tanDesc} value={annualInterestRate*100} onChange={(v)=>setAnnualInterestRate(v/100)} min={0} max={10} step={0.1} suffix="%" />
                  </Grid>
                </Card>
              </div>
              <div className="flex justify-between">
                <button onClick={()=>setStep(1)} className="px-4 py-2 rounded-xl border border-orange-600 text-orange-600 bg-white">{UI_TEXTS[language].navigation.back}</button>
                <div className="flex gap-2">
                  <button onClick={()=>{resetAll(); setStep(0);}} className="px-4 py-2 rounded-xl border bg-white">{UI_TEXTS[language].navigation.restart}</button>
                  <button onClick={()=>setStep(3)} className="px-4 py-2 bg-white text-orange-600 border border-orange-600 rounded-xl inline-flex items-center gap-2">{UI_TEXTS[language].navigation.next} <ArrowRight className="w-4 h-4"/></button>
                </div>
              </div>
              </motion.div>
          )}

          {!loading && step===1 && (
            <motion.div key="s1" initial={{opacity:0,x:50}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-50}} transition={{duration:0.4}} className="bg-white p-6 rounded-2xl shadow space-y-6">
              <h2 className="text-lg font-medium">{`Step 1 – ${STEP_LABELS[language][0]}`}</h2>
              <p className="text-sm text-slate-600">{STEP_DESCRIPTIONS[language][0]}</p>
              <div className="space-y-3">
                <Card>
                  <h3 className="text-md font-medium mb-2">{UI_TEXTS[language].step1.heading}</h3>
                  <p className="text-sm text-slate-600 mb-2">{UI_TEXTS[language].step1.subheading}</p>
                  <div className="flex flex-col gap-3">
                    {scenarioYears.map((y, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <YearSelector
                          label={UI_TEXTS[language].step1.durationLabel.replace('{n}', i + 1)}
                          description={UI_TEXTS[language].step1.durationDesc.replace('{n}', i + 1)}
                          value={y}
                          onChange={(v) => {
                            const arr = [...scenarioYears];
                            arr[i] = v;
                            setScenarioYears(arr);
                          }}
                        />
                        {scenarioYears.length > 1 && (
                          <button
                            type="button"
                            className="text-rose-600 text-sm"
                            onClick={() => setScenarioYears(scenarioYears.filter((_, idx) => idx !== i))}
                          >
                            &times;
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setScenarioYears([...scenarioYears, 20])}
                      className="self-start px-3 py-1 bg-white text-orange-600 border border-orange-600 rounded-xl text-sm"
                    >
                      {UI_TEXTS[language].step1.addScenario}
                    </button>
                  </div>
                </Card>
              </div>
              <div className="flex justify-between">
                <button onClick={()=>setStep(0)} className="px-4 py-2 rounded-xl border border-orange-600 text-orange-600 bg-white">{UI_TEXTS[language].navigation.back}</button>
                <div className="flex gap-2">
                  <button onClick={()=>{resetAll(); setStep(0);}} className="px-4 py-2 rounded-xl border bg-white">{UI_TEXTS[language].navigation.restart}</button>
                  <button onClick={()=>setStep(2)} className="px-4 py-2 bg-white text-orange-600 border border-orange-600 rounded-xl inline-flex items-center gap-2">{UI_TEXTS[language].navigation.next} <ArrowRight className="w-4 h-4"/></button>
                </div>
              </div>
              </motion.div>
          )}

          {!loading && step===3 && (
            <motion.div key="s3" initial={{opacity:0,x:50}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-50}} transition={{duration:0.4}} className="bg-white p-6 rounded-2xl shadow space-y-6">
              <h2 className="text-lg font-medium">{`Step 3 – ${STEP_LABELS[language][2]}`}</h2>
              <p className="text-sm text-slate-600">{STEP_DESCRIPTIONS[language][2]}</p>
              <div className="space-y-3">
                <Card>
                  <h3 className="text-md font-medium mb-2">Risorse</h3>
                  <Grid>
                    <Field label="Capitale iniziale (€)" description="Somma disponibile subito" value={initialCapital} onChange={setInitialCapital} min={0} max={5000000} step={1000} suffix="€" />
                    <Field label="Disponibilità mensile (€)" description="Può derivare da risparmi sullo stipendio oppure da guadagni legati al mutuo (ad esempio un immobile in affitto)" value={monthlyContribution} onChange={setMonthlyContribution} min={0} max={50000} step={50} suffix="€" />
                    <Field label="Inflazione (%)" description="Inflazione prevista" value={inflationRate*100} onChange={(v)=>setInflationRate(v/100)} min={0} max={10} step={0.1} suffix="%" />
                  </Grid>
                </Card>
              </div>
              <div className="flex justify-between">
                <button onClick={()=>setStep(2)} className="px-4 py-2 rounded-xl border border-orange-600 text-orange-600 bg-white">{UI_TEXTS[language].navigation.back}</button>
                <div className="flex gap-2">
                  <button onClick={()=>{resetAll(); setStep(0);}} className="px-4 py-2 rounded-xl border bg-white">{UI_TEXTS[language].navigation.restart}</button>
                  <button onClick={()=>setStep(4)} className="px-4 py-2 bg-white text-orange-600 border border-orange-600 rounded-xl inline-flex items-center gap-2">{UI_TEXTS[language].navigation.next} <ArrowRight className="w-4 h-4"/></button>
                </div>
              </div>
              </motion.div>
          )}

          {!loading && step===4 && (
            <motion.div key="s4" initial={{opacity:0,x:50}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-50}} transition={{duration:0.4}} className="bg-white p-6 rounded-2xl shadow space-y-6">
              <h2 className="text-lg font-medium">{`Step 4 – ${STEP_LABELS[language][3]}`}</h2>
              <p className="text-sm text-slate-600">{STEP_DESCRIPTIONS[language][3]}</p>
              <div className="space-y-3">
                <Card>
                  <h3 className="text-md font-medium mb-2">Piano di investimento</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
                    <Checkbox label="Investi capitale iniziale" checked={investInitial} onChange={setInvestInitial} />
                    <Checkbox label="Investi disponibilità mensile" checked={investMonthly} onChange={setInvestMonthly} />
                  </div>
                </Card>
                {(investInitial || investMonthly) && (
                  <>
                    <Card>
                      <h3 className="text-md font-medium mb-2">Rendimento</h3>
                      <Grid>
                        <Field label="Rendimento lordo (%)" description="Rendimento annuo lordo previsto" value={grossReturnRate*100} onChange={(v)=>setGrossReturnRate(v/100)} min={0} max={20} step={0.1} suffix="%" />
                        <Field label="Tasse rendimenti (%)" description="Aliquota fiscale sui profitti" value={taxRate*100} onChange={(v)=>setTaxRate(v/100)} min={0} max={43} step={1} suffix="%" />
                      </Grid>
                    </Card>
                    <Card>
                      <h3 className="text-md font-medium mb-2">Obiettivo</h3>
                      <Field label="Soglia guadagno minimo (in % rispetto al prezzo della casa, 0=disattiva)" description="Percentuale minima di guadagno desiderata" value={minimumGainPercentage*100} onChange={(v)=>setMinimumGainPercentage(v/100)} min={0} max={100} step={1} suffix="%" />
                    </Card>
                    <Card>
                      <h3 className="text-md font-medium mb-2">Indicatore</h3>
                      <Field label="Stipendio netto annuale" description="Usato solo per ragionare sul guadagno dall'investimento" value={salary} onChange={setSalary} min={0} max={1000000} step={1000} suffix="€" />
                    </Card>
                  </>
                )}
                <Card>
                  <h3 className="text-md font-medium mb-2">Migliorie energetiche (opzionale)</h3>
                  <Checkbox label="Considera pannelli solari e caldaia" checked={enableEnergy} onChange={setEnableEnergy} />
                </Card>
              </div>
              <div className="flex justify-between">
                <button onClick={()=>setStep(3)} className="px-4 py-2 rounded-xl border border-orange-600 text-orange-600 bg-white">{UI_TEXTS[language].navigation.back}</button>
                <div className="flex gap-2">
                  <button onClick={()=>{resetAll(); setStep(0);}} className="px-4 py-2 rounded-xl border bg-white">{UI_TEXTS[language].navigation.restart}</button>
                  <button onClick={handleInvestNext} className="px-4 py-2 bg-white text-orange-600 border border-orange-600 rounded-xl inline-flex items-center gap-2">{UI_TEXTS[language].navigation[enableEnergy ? 'next' : 'viewResults']} <ArrowRight className="w-4 h-4"/></button>
                </div>
              </div>
              </motion.div>
          )}

          {!loading && step===5 && (
            <motion.div key="s5" initial={{opacity:0,x:50}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-50}} transition={{duration:0.4}} className="bg-white p-6 rounded-2xl shadow space-y-6">
              <h2 className="text-lg font-medium">{`Step 5 – ${STEP_LABELS[language][4]}`}</h2>
              <p className="text-sm text-slate-600">{STEP_DESCRIPTIONS[language][4]}</p>
              <div className="space-y-3">
                <Card>
                  <h3 className="text-md font-medium mb-2">Impianto fotovoltaico</h3>
                  <Grid>
                    <Field label="Costo pannelli (€)" description="Prezzo comprensivo di installazione" value={solarCost} onChange={setSolarCost} min={0} max={500000} step={100} suffix="€" />
                    <Field label="Spesa elettrica annua (€)" description="Costo annuo dell'energia" value={annualElectricCost} onChange={setAnnualElectricCost} min={0} max={50000} step={100} suffix="€" />
                    <Field label="Copertura solare (%)" description="Quota della bolletta coperta dai pannelli" value={solarSavingsPct*100} onChange={(v)=>setSolarSavingsPct(v/100)} min={0} max={100} step={1} suffix="%" />
                  </Grid>
                </Card>
                <Card>
                  <h3 className="text-md font-medium mb-2">Caldaia</h3>
                  <Grid>
                    <Field label="Costo caldaia (€)" description="Prezzo comprensivo di installazione" value={boilerCost} onChange={setBoilerCost} min={0} max={500000} step={100} suffix="€" />
                    <Field label="Spesa riscaldamento annua (€)" description="Costo annuo attuale del riscaldamento" value={annualHeatingCost} onChange={setAnnualHeatingCost} min={0} max={50000} step={100} suffix="€" />
                    <Field label="Riduzione spesa (%)" description="Risparmio atteso con la nuova caldaia" value={boilerSavingsPct*100} onChange={(v)=>setBoilerSavingsPct(v/100)} min={0} max={100} step={1} suffix="%" />
                  </Grid>
                </Card>
              </div>
              <div className="flex justify-between">
                <button onClick={()=>setStep(4)} className="px-4 py-2 rounded-xl border border-orange-600 text-orange-600 bg-white">{UI_TEXTS[language].navigation.back}</button>
                <div className="flex gap-2">
                  <button onClick={()=>{resetAll(); setStep(0);}} className="px-4 py-2 rounded-xl border bg-white">{UI_TEXTS[language].navigation.restart}</button>
                  <button onClick={()=>setStep(6)} className="px-4 py-2 bg-white text-orange-600 border border-orange-600 rounded-xl inline-flex items-center gap-2">{UI_TEXTS[language].navigation.viewResults} <ArrowRight className="w-4 h-4"/></button>
                </div>
              </div>
            </motion.div>
          )}

          {!loading && step===6 && (
              <motion.div key="s6" initial={{opacity:0,x:50}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-50}} transition={{duration:0.4}} className="space-y-6">
                <h2 className="text-lg font-medium">{`Step 6 – ${STEP_LABELS[language][5]}`}</h2>
                <p className="text-sm text-slate-600">{STEP_DESCRIPTIONS[language][5]}</p>
                <Recap price={price} downPaymentRatio={downPaymentRatio} annualInterestRate={annualInterestRate} scenarioYears={scenarioYears} initialCapital={initialCapital} monthlyContribution={monthlyContribution} inflationRate={inflationRate} grossReturnRate={grossReturnRate} taxRate={taxRate} investInitial={investInitial} investMonthly={investMonthly} minimumGainPercentage={minimumGainPercentage} salary={salary} texts={UI_TEXTS[language].recap} />
                <div className="text-xs text-slate-500">
                  <span className="font-semibold">Legenda:</span> Nominale = senza inflazione; Reale = valore attualizzato considerando l'inflazione.
                </div>
                {!hasInvestment && (
                  <p className="text-sm text-slate-600">Nessun investimento applicato: vengono mostrati solo i dettagli del mutuo.</p>
                )}
                {hasInvestment ? (
                  <>
                    {scenarioStats.map(({ years, scenario, breakEven, payOffTimeYears, label }, idx) => {
                      const finalNom = scenario.fvNominal + (price > 0 ? price : 0);
                      const finalReal = scenario.fvReal + (price > 0 ? price / Math.pow(1 + inflationRate, years) : 0);
                      return (
                      <Card key={idx}>
                        <h3 className="text-md font-medium mb-2">{price>0 ? `Mutuo ${years} anni` : `Investimento ${years} anni`}</h3>
                        <div className="mt-4 space-y-6">
                          {price > 0 && (
                            <div>
                              <div className="text-xs font-semibold text-slate-600 mb-2">Mutuo</div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-3">
                                <DataCard icon={Wallet} iconClass="text-red-500" label="Rata" value={`${formatCurrencyWithCents(scenario.payment)} / mese`} />
                                <DataCard
                                  icon={ArrowDownCircle}
                                  iconClass="text-red-500"
                                  label="Interessi"
                                  items={[
                                    { label: "Nominali", value: formatCurrency(scenario.interestNominal) },
                                    { label: "Reali", value: formatCurrency(scenario.interestReal) },
                                  ]}
                                />
                                <DataCard icon={Clock} iconClass="text-slate-500" label="Anno chiusura mutuo" value={isFinite(payOffTimeYears) ? `${payOffTimeYears.toFixed(1)} anni` : `> ${years} anni`} />
                              </div>
                              <AmortizationTable principal={scenario.principal} annualRate={annualInterestRate} years={years} initial={initialCapital} monthly={monthlyContribution} grossReturn={grossReturnRate} taxRate={taxRate} investInitial={investInitial} investMonthly={investMonthly} texts={UI_TEXTS[language].amortization} />
                            </div>
                          )}
                          <div>
                            <div className="text-xs font-semibold text-slate-600 mb-2">Investimento</div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                              <DataCard
                                icon={ArrowUpCircle}
                                iconClass="text-emerald-600"
                                label="Valore finale"
                                items={[
                                  { label: "Nominale", value: formatCurrency(scenario.fvNominal) },
                                  { label: "Reale", value: formatCurrency(scenario.fvReal) },
                                ]}
                              />
                              <DataCard
                                icon={ArrowUpCircle}
                                iconClass="text-emerald-600"
                                label="Guadagno"
                                items={[
                                  { label: "Nominale", value: formatCurrency(scenario.gainNominal) },
                                  { label: "Reale", value: formatCurrency(scenario.gainReal) },
                                ]}
                              />
                              <DataCard icon={Percent} iconClass="text-slate-500" label="% stipendio annuo" value={salary>0 ? formatPercentage(scenario.gainReal/salary) : "–"} />
                              {price > 0 && <DataCard icon={Percent} iconClass="text-slate-500" label="% prezzo casa" value={formatPercentage(scenario.gainReal/price)} />}
                              <DataCard icon={Clock} iconClass="text-slate-500" label="Mesi di lavoro equivalenti" value={salary>0 ? (scenario.gainReal/(salary/12)).toFixed(1) : "–"} />
                              {price > 0 && <DataCard icon={Percent} iconClass="text-slate-500" label="Break-even lordo" value={formatPercentage(breakEven)} />}
                            </div>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="text-xs font-semibold text-slate-600 mb-2 text-center">Capitale finale</div>
                            <DataCard
                              featured
                              icon={PiggyBank}
                              iconClass="text-emerald-600"
                              label="Capitale finale"
                              items={[
                                { label: "Nominale", value: formatCurrency(finalNom) },
                                { label: "Reale", value: formatCurrency(finalReal) },
                              ]}
                            />
                          </div>
                        </div>
                      </Card>
                      );
                    })}

                    {enableEnergy && (
                      <Card>
                        <h3 className="text-md font-medium mb-2">Pannelli solari e caldaia</h3>
                        {energyStats.map(({ years, solarPayback, solarGain, boilerPayback, boilerGain }) => (
                          <div key={years} className="mb-4">
                            <div className="font-semibold mb-2">Scenario {years} anni</div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {solarCost>0 && (
                                <DataCard icon={Sun} iconClass="text-yellow-500" label="Pannelli solari" items={[
                                  { label: "Payback", value: isFinite(solarPayback) ? `${solarPayback.toFixed(1)} anni` : `> ${years} anni` },
                                  { label: "Guadagno", value: formatCurrency(solarGain) },
                                ]} />
                              )}
                              {boilerCost>0 && (
                                <DataCard icon={Flame} iconClass="text-orange-500" label="Caldaia" items={[
                                  { label: "Payback", value: isFinite(boilerPayback) ? `${boilerPayback.toFixed(1)} anni` : `> ${years} anni` },
                                  { label: "Guadagno", value: formatCurrency(boilerGain) },
                                ]} />
                              )}
                            </div>
                          </div>
                        ))}
                      </Card>
                    )}

                    {price > 0 ? (
                      <>
                        <Card>
                          <div className="flex items-center gap-2 mb-3">
                            <TrendingUp className="w-5 h-5" />
                            <h2 className="text-lg font-medium">Guadagno reale netto vs rendimento lordo</h2>
                          </div>
                          <div className="h-72">
                            <ResponsiveContainer>
                              <LineChart data={chartData} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                                <XAxis dataKey="r" tickFormatter={(v) => `${v}%`} />
                                <YAxis tickFormatter={(v) => v.toLocaleString("it-IT")} />
                                <Tooltip formatter={(v) => formatCurrency(v)} labelFormatter={(l) => `Rendimento lordo ${l}%`} />
                                <Legend />
                                <ReferenceLine y={0} stroke="#222" strokeDasharray="4 4" />
                                {scenarioStats.map(({ label }, idx) => (
                                  <Line key={label} type="monotone" dataKey={label} stroke={colors[idx % colors.length]} dot={false} strokeWidth={2} />
                                ))}
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </Card>

                        <Card>
                          <div className="flex items-center gap-2 mb-3">
                            <TrendingUp className="w-5 h-5" />
                            <h2 className="text-lg font-medium">Guadagno nominale e reale nel tempo</h2>
                          </div>
                          <div className="h-72">
                            <ResponsiveContainer>
                              <LineChart data={yearlyData} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                                <XAxis dataKey="year" />
                                <YAxis tickFormatter={(v) => v.toLocaleString("it-IT")} />
                                <Tooltip formatter={(v) => formatCurrency(v)} labelFormatter={(l) => `Anno ${l}`} />
                                <Legend />
                                <ReferenceLine y={0} stroke="#222" strokeDasharray="4 4" />
                                {scenarioStats.map(({ label }, idx) => (
                                  <React.Fragment key={label}>
                                    <Line type="monotone" dataKey={`${label} nominale`} stroke={colors[idx % colors.length]} strokeDasharray="5 5" dot={false} />
                                    <Line type="monotone" dataKey={`${label} reale`} stroke={colors[idx % colors.length]} strokeWidth={2} dot={false} />
                                  </React.Fragment>
                                ))}
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </Card>
                      </>
                    ) : (
                      <Card>
                        <div className="flex items-center gap-2 mb-3">
                          <TrendingUp className="w-5 h-5" />
                          <h2 className="text-lg font-medium">Andamento dei guadagni nel tempo</h2>
                        </div>
                        <div className="h-72">
                          <ResponsiveContainer>
                            <LineChart data={yearlyData} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                              <XAxis dataKey="year" />
                              <YAxis tickFormatter={(v) => v.toLocaleString("it-IT")} />
                              <Tooltip formatter={(v) => formatCurrency(v)} labelFormatter={(l) => `Anno ${l}`} />
                              <Legend />
                              <ReferenceLine y={0} stroke="#222" strokeDasharray="4 4" />
                              {scenarioStats.map(({ label }, idx) => (
                                <React.Fragment key={label}>
                                  <Line type="monotone" dataKey={`${label} nominale`} stroke={colors[idx % colors.length]} strokeDasharray="5 5" dot={false} />
                                  <Line type="monotone" dataKey={`${label} reale`} stroke={colors[idx % colors.length]} strokeWidth={2} dot={false} />
                                </React.Fragment>
                              ))}
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </Card>
                    )}

                    <Card>
                      <h2 className="text-lg font-medium mb-2">Conclusione</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {scenarioStats.map(({ label, scenario, breakEven }, idx) => (
                          <div key={label} className="rounded-xl border border-slate-200 p-4 bg-white">
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-semibold">{label}</div>
                              <span className={`px-2 py-1 text-xs rounded-full ${better[idx] ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                {better[idx] ? (price>0 ? 'Conviene MUTUO + investimento' : 'Investimento profittevole') : (price>0 ? 'Conviene CASH' : 'Meglio non investire')}
                              </span>
                            </div>
                            <ul className="text-sm text-slate-600 space-y-1">
                              <li>% stipendio annuo: <b>{salary > 0 ? formatPercentage(scenario.gainReal / salary) : "–"}</b></li>
                              {price > 0 && <li>% prezzo casa: <b>{formatPercentage(scenario.gainReal / price)}</b></li>}
                              <li>Mesi di lavoro equivalenti: <b>{salary > 0 ? (scenario.gainReal / (salary / 12)).toFixed(1) : "–"}</b></li>
                              <li>Break-even lordo: <b>{formatPercentage(breakEven)}</b></li>
                              <li>Guadagno reale stimato: <b>{formatCurrency(scenario.gainReal)}</b></li>
                              <li>Interessi reali: <b>{formatCurrency(scenario.interestReal)}</b></li>
                              <li>
                                {minimumGainPercentage > 0 ? (
                                  <>Scostamento dalla % attesa: <b>{formatPercentage(diffs[idx].diffPct)}</b> ({formatCurrency(diffs[idx].diffAmt)})</>
                                ) : (
                                  <>Scostamento dallo smenarci: <b>{formatPercentage(diffs[idx].diffPct)}</b> ({formatCurrency(diffs[idx].diffAmt)})</>
                                )}
                              </li>
                            </ul>
                            <p className="text-xs text-slate-500 mt-2">Regola pratica: se il rendimento lordo atteso supera il break-even{minimumGainPercentage>0 && ` e il guadagno supera il ${formatPercentage(minimumGainPercentage)} del mutuo`} e tolleri la volatilità, ha senso il mutuo. Altrimenti meglio pagare cash.</p>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </>
                ) : (
                  <>
                    {scenarioStats.map(({ years, scenario, payOffTimeYears }, idx) => {
                      const finalNom = scenario.fvNominal + price;
                      const finalReal = scenario.fvReal + price / Math.pow(1 + inflationRate, years);
                      return (
                      <Card key={idx}>
                        <h3 className="text-md font-medium mb-2">Mutuo {years} anni</h3>
                        <div className="mt-4">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
                                <DataCard icon={Wallet} iconClass="text-red-500" label="Rata" value={`${formatCurrencyWithCents(scenario.payment)} / mese`} />
                            <DataCard
                              icon={ArrowDownCircle}
                              iconClass="text-red-500"
                              label="Interessi"
                              items={[
                                { label: "Nominali", value: formatCurrency(scenario.interestNominal) },
                                { label: "Reali", value: formatCurrency(scenario.interestReal) },
                              ]}
                            />
                            <DataCard icon={Clock} iconClass="text-slate-500" label="Anno chiusura mutuo" value={isFinite(payOffTimeYears) ? `${payOffTimeYears.toFixed(1)} anni` : `> ${years} anni`} />
                          </div>
                          <AmortizationTable principal={scenario.principal} annualRate={annualInterestRate} years={years} initial={initialCapital} monthly={monthlyContribution} grossReturn={grossReturnRate} taxRate={taxRate} investInitial={investInitial} investMonthly={investMonthly} texts={UI_TEXTS[language].amortization} />
                          <div className="mt-4">
                            <div className="text-xs font-semibold text-slate-600 mb-2">Capitale finale</div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <DataCard
                                icon={PiggyBank}
                                iconClass="text-emerald-600"
                                label="Capitale finale"
                                items={[
                                { label: "Nominale", value: formatCurrency(finalNom) },
                                { label: "Reale", value: formatCurrency(finalReal) },
                                ]}
                              />
                            </div>
                          </div>
                        </div>
                      </Card>
                      );
                    })}
                    {enableEnergy && (
                      <Card>
                        <h3 className="text-md font-medium mb-2">Pannelli solari e caldaia</h3>
                        {energyStats.map(({ years, solarPayback, solarGain, boilerPayback, boilerGain }) => (
                          <div key={years} className="mb-4">
                            <div className="font-semibold mb-2">Scenario {years} anni</div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {solarCost>0 && (
                                <DataCard icon={Sun} iconClass="text-yellow-500" label="Pannelli solari" items={[
                                  { label: "Payback", value: isFinite(solarPayback) ? `${solarPayback.toFixed(1)} anni` : `> ${years} anni` },
                                  { label: "Guadagno", value: formatCurrency(solarGain) },
                                ]} />
                              )}
                              {boilerCost>0 && (
                                <DataCard icon={Flame} iconClass="text-orange-500" label="Caldaia" items={[
                                  { label: "Payback", value: isFinite(boilerPayback) ? `${boilerPayback.toFixed(1)} anni` : `> ${years} anni` },
                                  { label: "Guadagno", value: formatCurrency(boilerGain) },
                                ]} />
                              )}
                            </div>
                          </div>
                        ))}
                      </Card>
                    )}
                  </>
                )}
                <div className="flex justify-end">
                  <button onClick={()=>window.print()} className="px-4 py-2 rounded-xl border bg-white hover:bg-slate-50">{UI_TEXTS[language].navigation.export}</button>
                </div>
                <div className="flex justify-between">
                  <button onClick={()=>setStep(enableEnergy ? 5 : 4)} className="px-4 py-2 rounded-xl border bg-white">{UI_TEXTS[language].navigation.back}</button>
                  <button onClick={()=>{resetAll(); setStep(0);}} className="px-4 py-2 rounded-xl border bg-white">{UI_TEXTS[language].navigation.restart}</button>
                </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
