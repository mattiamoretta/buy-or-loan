import React, { useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";
import { Calculator, TrendingUp, ArrowRight, Home, PiggyBank, Wallet, WalletCards, ArrowDownCircle, ArrowUpCircle, Clock, Percent } from "lucide-react";
import DataCard from "./components/DataCard";

// -------------------- Utils --------------------
const fmt = (n) => n.toLocaleString("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const fmt2 = (n) => n.toLocaleString("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 2 });
const pct = (n) => `${(n * 100).toFixed(2)}%`;

function pmt(principal, annualRate, years){
  if(principal === 0) return 0;
  const r = annualRate/12; const n = years*12;
  if(r === 0) return principal/n;
  return (principal*r)/(1-Math.pow(1+r,-n));
}
function investFV({ initial=0, monthly=0, grossReturn=0, taxRate=0, years=0, investInitial=true, investMonthly=true }){
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
function mortgageCosts({ principal, annualRate, years, inflation }){
  const n = years*12; const im = inflation/12; const payment = pmt(principal, annualRate, years); const totalPaid = payment*n; const interestNominal = totalPaid - principal;
  let pvPayments = 0; for(let m=1;m<=n;m++) pvPayments += payment/Math.pow(1+im,m);
  const interestReal = pvPayments - principal; return { payment, totalPaid, interestNominal, interestReal };
}
function scenarioGain({ price, downPct, tan, years, grossReturn, taxRate, inflation, initialCapital, monthlyExtra=0, investInitial=true, investMonthly=true }){
  const principal = price * (1 - downPct);
  const fvNominal = investFV({ initial: initialCapital, monthly: monthlyExtra, grossReturn, taxRate, years, investInitial, investMonthly });
  const { interestNominal, interestReal, payment } = mortgageCosts({ principal, annualRate: tan, years, inflation });
  const fvReal = fvNominal / Math.pow(1 + inflation, years);
  const totalContrib = (investInitial ? initialCapital : 0) + (investMonthly ? monthlyExtra * years * 12 : 0);
  const gainNominal = fvNominal - totalContrib - interestNominal;
  const gainReal = fvReal - totalContrib - interestReal;
  return { principal, initialCapital, payment, fvNominal, fvReal, interestNominal, interestReal, gainNominal, gainReal };
}
function breakEvenGross({ price, downPct, tan, years, taxRate, inflation, initialCapital, monthlyExtra=0, investInitial=true, investMonthly=true }){
  let lo=0, hi=0.2; // 0..20% lordo
  for(let i=0;i<60;i++){
    const mid=(lo+hi)/2; const g=scenarioGain({ price, downPct, tan, years, grossReturn: mid, taxRate, inflation, initialCapital, monthlyExtra, investInitial, investMonthly }).gainReal;
    if(g>=0) hi=mid; else lo=mid;
  }
  return (lo+hi)/2;
}


function mortgageBalance({ principal, annualRate, years, afterYears }){
  const payment = pmt(principal, annualRate, years);
  const r = annualRate/12; const t = Math.round(afterYears*12);
  if(r === 0) {
    const bal = principal - payment * t;
    return Math.max(0, bal);
  }
  const bal = principal*Math.pow(1+r, t) - payment*((Math.pow(1+r, t)-1)/r);
  return Math.max(0, bal);
}

function amortizationSchedule({ principal, annualRate, years, initial=0, monthly=0, grossReturn=0, taxRate=0, investInitial=true, investMonthly=true }) {
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

function payOffTime({ price, downPct, tan, years, grossReturn, taxRate, initialCapital, monthlyExtra=0, investInitial=true, investMonthly=true }){
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

// -------------------- UI helpers --------------------
function Card({ children }){ return <motion.div layout className="bg-white rounded-2xl shadow p-5 border border-slate-200">{children}</motion.div>; }
function Grid({ children }){ return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">{children}</div>; }
function Field({ label, value, onChange, min, max, step, prefix, suffix, description }){
  const decimals = step && step < 1 ? step.toString().split(".")[1]?.length || 0 : 0;
  const fmtNumber = (n) =>
    n.toLocaleString("it-IT", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  const parseNumber = (str) => {
    const cleaned = str.replace(/\./g, "").replace(",", ".");
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };
  const [display, setDisplay] = useState(fmtNumber(value));
  useEffect(() => {
    setDisplay(fmtNumber(value));
  }, [value]);
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm text-slate-600">{label}</label>}
      <div className="flex items-center gap-2">
        {prefix && <span className="text-slate-500 text-sm">{prefix}</span>}
        <input
          type="text"
          inputMode="decimal"
          className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
          value={display}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "") {
              setDisplay("");
              onChange(0);
            } else {
              const num = parseNumber(val);
              setDisplay(fmtNumber(num));
              onChange(num);
            }
          }}
          min={min}
          max={max}
          step={step}
        />
        {suffix && <span className="text-slate-500 text-sm">{suffix}</span>}
      </div>
      {description && <span className="text-xs text-slate-500">{description}</span>}
    </div>
  );
}

function Popup({ message, onConfirm, onCancel }){
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white p-6 rounded-xl shadow max-w-sm text-center space-y-4">
        <p className="text-sm">{message}</p>
        <div className="flex justify-center gap-3">
          {onCancel && (
            <button onClick={onCancel} className="px-4 py-2 rounded-xl border">Annulla</button>
          )}
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-orange-600 text-white rounded-xl"
          >
            {onCancel ? "Prosegui" : "OK"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfigCard({ title, description, details = [], icon: Icon, onSteps, onResults }) {
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
            Vedi step
          </button>
        )}
        {onResults && (
          <button
            onClick={onResults}
            className="px-3 py-1 bg-orange-600 text-white rounded-xl text-sm"
          >
            Risultati
          </button>
        )}
      </div>
    </div>
  );
}

function YearSelector({ label, value, onChange, description }){
  const presets = [10, 20, 30];
  const [custom, setCustom] = useState(!presets.includes(value));
  useEffect(() => {
    setCustom(!presets.includes(value));
  }, [value]);
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-slate-600">{label}</label>
      <div className="flex items-center gap-2 flex-wrap">
        {presets.map((p) => (
          <button
            key={p}
            type="button"
            className={`px-3 py-1 rounded-lg text-sm ${
              !custom && value === p ? "bg-orange-600 text-white" : "bg-slate-200 text-slate-600"
            }`}
            onClick={() => { onChange(p); setCustom(false); }}
          >
            {p}
          </button>
        ))}
        <button
          type="button"
          className={`px-3 py-1 rounded-lg text-sm ${
            custom ? "bg-orange-600 text-white" : "bg-slate-200 text-slate-600"
          }`}
          onClick={() => setCustom(true)}
        >
          Custom
        </button>
        {custom && (
          <input
            type="number"
            className="w-20 rounded-xl border border-slate-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-orange-300"
            value={value}
            onChange={(e) => onChange(e.target.value === "" ? 0 : parseInt(e.target.value))}
            min={1}
            max={40}
          />
        )}
      </div>
      {description && <span className="text-xs text-slate-500">{description}</span>}
    </div>
  );
}
function Checkbox({ label, checked, onChange, description }){
  return (
    <div className="flex flex-col gap-1">
      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input type="checkbox" className="rounded" checked={checked} onChange={(e)=>onChange(e.target.checked)} />
        {label}
      </label>
      {description && <span className="text-xs text-slate-500 ml-6">{description}</span>}
    </div>
  );
}

function DownPaymentField({ price, downPct, setDownPct, mode, setMode }){
  const value = mode === 'pct' ? downPct * 100 : price * downPct;
  const handleChange = (v) => {
    if (mode === 'pct') setDownPct(v / 100);
    else setDownPct(price ? v / price : 0);
  };
  const max = mode === 'pct' ? 90 : price;
  const step = mode === 'pct' ? 1 : 1000;
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-slate-600">Anticipo</label>
      <div className="flex items-center gap-2">
        <div className="flex rounded-xl overflow-hidden border border-slate-300">
          <button
            type="button"
            className={`px-3 py-1 text-sm ${mode === 'pct' ? 'bg-orange-600 text-white' : 'bg-white text-slate-600'}`}
            onClick={() => setMode('pct')}
          >
            %
          </button>
          <button
            type="button"
            className={`px-3 py-1 text-sm ${mode === 'amt' ? 'bg-orange-600 text-white' : 'bg-white text-slate-600'}`}
            onClick={() => setMode('amt')}
          >
            €
          </button>
        </div>
        <Field
          value={value}
          onChange={handleChange}
          min={0}
          max={max}
          step={step}
          suffix={mode === 'pct' ? '%' : '€'}
        />
      </div>
      <span className="text-xs text-slate-500">
        {mode === 'pct'
          ? 'Percentuale di anticipo che puoi versare'
          : "Importo dell'anticipo che puoi versare"}
      </span>
    </div>
  );
}
function KPICard({ title, value, subtitle, icon: Icon, iconClass = "" }){
  return (
    <div className="rounded-xl border border-slate-200 p-3 bg-slate-50">
      <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">
        {Icon && <Icon className={`w-4 h-4 ${iconClass}`} />}
        <span>{title}</span>
      </div>
      <div className="text-lg font-semibold text-orange-600">{value}</div>
      {subtitle && <div className="text-xs text-slate-400">{subtitle}</div>}
    </div>
  );
}

function AmortizationTable({ principal, annualRate, years, initial=0, monthly=0, grossReturn=0, taxRate=0, investInitial=true, investMonthly=true }) {
  const { rows, payoffMonth } = useMemo(() => amortizationSchedule({ principal, annualRate, years, initial, monthly, grossReturn, taxRate, investInitial, investMonthly }), [principal, annualRate, years, initial, monthly, grossReturn, taxRate, investInitial, investMonthly]);
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
      <summary className="cursor-pointer text-sm text-orange-600">Andamento mutuo</summary>
      {showSavings && payoffMonth && (
        <p className="text-xs text-slate-500 mt-1">La riga in verde indica la prima rata in cui i risparmi coprono il residuo del mutuo.</p>
      )}
      <div ref={containerRef} className="overflow-x-auto max-h-64 overflow-y-auto mt-2">
        <table className="min-w-full text-xs tabular-nums">
          <thead className="bg-slate-100 sticky top-0 z-10">
            <tr>
              <th className="px-2 py-1 text-left">Mese</th>
              <th className="px-2 py-1 text-right">Interessi</th>
              <th className="px-2 py-1 text-right">Capitale</th>
              <th className="px-2 py-1 text-right">Residuo</th>
              <th className="px-2 py-1 text-right">Capitale tot.</th>
              {showSavings && <th className="px-2 py-1 text-right">Disp. potenziale</th>}
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
                <td className="px-2 py-1 font-mono text-right">{fmt2(r.interest)}</td>
                <td className="px-2 py-1 font-mono text-right">{fmt2(r.capital)}</td>
                <td className="px-2 py-1 font-mono text-right">{fmt2(r.balance)}</td>
                <td className="px-2 py-1 font-mono text-right">{fmt2(r.paidPrincipal)}</td>
                {showSavings && <td className="px-2 py-1 font-mono text-right">{fmt2(r.available)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

function Recap({ price, downPct, tan, scenarioYears, initialCapital, cois, infl, gross, tax, investInitial, investMonthly, minGainPct, salary }){
  return (
    <details className="mb-4">
      <summary className="cursor-pointer text-sm text-white bg-orange-600 px-2 py-1 rounded">Riepilogo dati</summary>
      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm bg-orange-50 p-2 rounded">
        <span>Prezzo casa: <b>{fmt(price)}</b></span>
        <span>Anticipo: <b>{fmt(price * downPct)} ({pct(downPct)})</b></span>
        <span>TAN: <b>{pct(tan)}</b></span>
        <span>Durate scenari: <b>{scenarioYears.join(', ')} anni</b></span>
        <span>Capitale iniziale: <b>{fmt(initialCapital)}</b></span>
        <span>Disponibilità mensile: <b>{fmt(cois)}</b></span>
        <span>Inflazione: <b>{pct(infl)}</b></span>
        {(investInitial || investMonthly) && (
          <>
            <span>Rendimento lordo: <b>{pct(gross)}</b></span>
            <span>Tasse rendimenti: <b>{pct(tax)}</b></span>
          </>
        )}
        <span>Investi capitale iniziale: <b>{investInitial ? 'Sì' : 'No'}</b></span>
        <span>Investi disponibilità mensile: <b>{investMonthly ? 'Sì' : 'No'}</b></span>
        <span>Soglia guadagno minimo: <b>{pct(minGainPct)}</b></span>
        <span>Stipendio netto annuo: <b>{fmt(salary)}</b></span>
      </div>
    </details>
  );
}

function Stepper({ step }) {
  const labels = [
    "Scenari",
    "Mutuo",
    "Entrate",
    "Investimenti",
    "Risultati",
  ];
  const isFinal = step === labels.length;
  return (
    <div className="flex items-center mb-8">
      {labels.map((label, idx) => {
        const num = idx + 1;
        const active = step === num;
        const completed = step > num;
        return (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium ${
                  active || completed
                    ? "bg-orange-600 text-white"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {num}
              </div>
              <span className={`mt-2 text-xs ${isFinal ? "text-white" : "text-slate-600"}`}>{label}</span>
            </div>
            {idx < labels.length - 1 && (
              <div
                className={`flex-1 h-px mx-2 ${
                  step > num ? "bg-orange-600" : "bg-slate-300"
                }`}
              ></div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// -------------------- App --------------------
export default function App(){
  // Wizard: 0..5 (0 = landing)
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState(null);

  const backgrounds = [
    'from-orange-50 via-amber-50 to-yellow-50',
    'from-orange-100 via-amber-100 to-yellow-100',
    'from-orange-200 via-amber-200 to-yellow-200',
    'from-orange-300 via-amber-300 to-yellow-300',
    'from-orange-400 via-amber-400 to-yellow-400',
    'from-orange-500 via-amber-500 to-yellow-500',
  ];

  // Base
  const [price, setPrice] = useState(150000);
  const [downPct, setDownPct] = useState(0.15);
  const [downMode, setDownMode] = useState('pct');
  const [scenarioYears, setScenarioYears] = useState([20]);
  const [initialCapital, setInitialCapital] = useState(price*(1-downPct));

  // Tassi
  const [tan, setTan] = useState(0.03);
  const [infl, setInfl] = useState(0.02);
  const [tax, setTax] = useState(0.26);
  const [gross, setGross] = useState(0.05);

  // Contributi e investimenti
  const [cois, setCois] = useState(0);
  const [investInitial, setInvestInitial] = useState(true);
  const [investMonthly, setInvestMonthly] = useState(true);

  // Entrate
  const [salary, setSalary] = useState(30000);
  const [minGainPct, setMinGainPct] = useState(0.1);

  // Calcoli
  const scenarioStats = useMemo(
    () =>
      scenarioYears.map((years) => {
        const s = scenarioGain({
          price,
          downPct,
          tan,
          years,
          grossReturn: gross,
          taxRate: tax,
          inflation: infl,
          initialCapital,
          monthlyExtra: cois,
          investInitial,
          investMonthly,
        });
        const be = breakEvenGross({
          price,
          downPct,
          tan,
          years,
          taxRate: tax,
          inflation: infl,
          initialCapital,
          monthlyExtra: cois,
          investInitial,
          investMonthly,
        });
        const payTime = payOffTime({
          price,
          downPct,
          tan,
          years,
          grossReturn: gross,
          taxRate: tax,
          initialCapital,
          monthlyExtra: cois,
          investInitial,
          investMonthly,
        });
        const label = `Scenario ${years} anni`;
        return { years, s, be, payTime, label, labelN: `${label} nominale`, labelR: `${label} reale` };
      }),
    [scenarioYears, price, downPct, tan, gross, tax, infl, initialCapital, cois, investInitial, investMonthly]
  );

  const colors = ["#2563eb", "#f97316", "#16a34a", "#9333ea", "#14b8a6"]; 

  const chartData = useMemo(() => {
    const rows = [];
    for (let r = 0.02; r <= 0.07 + 1e-9; r += 0.0025) {
      const row = { r: +(r * 100).toFixed(2) };
      scenarioYears.forEach((years) => {
        const label = `Scenario ${years} anni`;
        row[label] = scenarioGain({
          price,
          downPct,
          tan,
          years,
          grossReturn: r,
          taxRate: tax,
          inflation: infl,
          initialCapital,
          monthlyExtra: cois,
          investInitial,
          investMonthly,
        }).gainReal;
      });
      rows.push(row);
    }
    return rows;
  }, [scenarioYears, price, downPct, tan, tax, infl, initialCapital, cois, investInitial, investMonthly]);

  const yearlyData = useMemo(() => {
    const maxY = Math.max(...scenarioYears);
    const rows = [];
    for (let y = 1; y <= maxY; y++) {
      const row = { year: y };
      scenarioYears.forEach((years) => {
        if (y <= years) {
          const g = scenarioGain({
            price,
            downPct,
            tan,
            years: y,
            grossReturn: gross,
            taxRate: tax,
            inflation: infl,
            initialCapital,
            monthlyExtra: cois,
            investInitial,
            investMonthly,
          });
          const label = `Scenario ${years} anni`;
          row[`${label} nominale`] = g.gainNominal;
          row[`${label} reale`] = g.gainReal;
        }
      });
      rows.push(row);
    }
    return rows;
  }, [scenarioYears, price, downPct, tan, gross, tax, infl, initialCapital, cois, investInitial, investMonthly]);

  const better = scenarioStats.map(({ s }) =>
    minGainPct > 0 ? s.gainReal >= s.principal * minGainPct : s.gainReal >= 0
  );

  const targetPct = minGainPct > 0 ? minGainPct : 0;
  const diffs = scenarioStats.map(({ s }) => ({
    diffPct: s.principal > 0 ? s.gainReal / s.principal - targetPct : 0,
    diffAmt: s.gainReal - s.principal * targetPct,
  }));

    const titleColor = step >= 5 ? "text-white" : "text-slate-800";
    const hasInvestment = (investInitial && initialCapital > 0) || (investMonthly && cois > 0);

    const resetAll = () => {
      setPrice(150000);
      setDownPct(0.15);
      setScenarioYears([20]);
      setInitialCapital(150000 * (1 - 0.15));
      setTan(0.03);
      setInfl(0.02);
      setTax(0.26);
      setGross(0.05);
      setCois(0);
      setInvestInitial(true);
      setInvestMonthly(true);
      setSalary(30000);
      setMinGainPct(0.1);
    };

    const applyConfig = (cfg) => {
      switch (cfg) {
        case 1:
          setScenarioYears([15, 25]);
          setInitialCapital(0);
          setCois(0);
          setInvestInitial(false);
          setInvestMonthly(false);
          break;
        case 2:
          setScenarioYears([10, 20, 30]);
          setInitialCapital(0);
          setCois(300);
          setInvestInitial(false);
          setInvestMonthly(false);
          break;
        case 3:
          setScenarioYears([15, 25, 35]);
          setInitialCapital(0);
          setCois(300);
          setInvestInitial(false);
          setInvestMonthly(true);
          break;
        case 4:
          setScenarioYears([20, 40]);
          setInitialCapital(50000);
          setCois(0);
          setInvestInitial(true);
          setInvestMonthly(false);
          break;
        case 5:
          setPrice(0);
          setDownPct(0);
          setTan(0);
          setScenarioYears([20]);
          setInitialCapital(10000);
          setCois(300);
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
        setTimeout(()=>{setLoading(false); setStep(5);},2000);
      };
      const principal = price * (1 - downPct);
      if(principal <= 0){
        setPopup({
          message: "L'importo del mutuo è 0; i risultati mostreranno solo l'investimento.",
          onConfirm: () => { setPopup(null); proceed(); },
          onCancel: () => setPopup(null),
        });
        return;
      }
      if((!investInitial || initialCapital<=0) && (!investMonthly || cois<=0)){
        setPopup({
          message: "Nessun investimento sarà applicato; i risultati mostreranno solo l'evoluzione del mutuo.",
          onConfirm: () => { setPopup(null); proceed(); },
          onCancel: () => setPopup(null),
        });
        return;
      }
      proceed();
    };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${backgrounds[step]} animate-gradient text-slate-800`}>
      {popup && <Popup {...popup} />}
      <div className="max-w-5xl mx-auto p-6">
        <header className="flex items-center justify-center gap-3 mb-6">
          <Calculator className="w-7 h-7 text-orange-600" />
          <h1 className={`text-2xl md:text-3xl font-semibold ${titleColor}`}>The wise investor's wizard 🚀</h1>
        </header>

        {step > 0 && <Stepper step={step} />}

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
              <div className="text-center">
                <button onClick={()=>{resetAll(); setStep(1);}} className="px-6 py-3 bg-orange-600 text-white rounded-xl text-lg shadow">Inizia</button>
              </div>
              <h2 className="text-xl font-semibold text-center">Oppure scegli un esempio</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ConfigCard
                  icon={Home}
                  title="Stai valutando un mutuo?"
                  description="Scopri l'andamento del debito. Es: mutuo €150k, anticipo 15% con durate 15-25 anni."
                  details={["Mutuo €150k", "Anticipo 15%"]}
                  onSteps={() => {
                    applyConfig(1);
                    setStep(1);
                  }}
                  onResults={() => {
                    applyConfig(1);
                    setLoading(true);
                    setTimeout(() => {
                      setLoading(false);
                      setStep(5);
                    }, 2000);
                  }}
                />
                <ConfigCard
                  icon={TrendingUp}
                  title="Stai valutando un investimento?"
                  description="Simula un investimento senza mutuo: €10k iniziali e 300€/mese per 20 anni."
                  details={["Capitale iniziale €10k", "Versamento 300€/mese"]}
                  onSteps={() => {
                    applyConfig(5);
                    setStep(1);
                  }}
                  onResults={() => {
                    applyConfig(5);
                    setLoading(true);
                    setTimeout(() => {
                      setLoading(false);
                      setStep(5);
                    }, 2000);
                  }}
                />
                <ConfigCard
                  icon={PiggyBank}
                  title="Stai valutando un mutuo con risparmi mensili?"
                  description="Valuta quando chiudere il mutuo risparmiando 300€ al mese senza investire. Durate 10-20-30 anni."
                  details={["Mutuo €150k", "Anticipo 15%", "Risparmi 300€/mese"]}
                  onSteps={() => {
                    applyConfig(2);
                    setStep(1);
                  }}
                  onResults={() => {
                    applyConfig(2);
                    setLoading(true);
                    setTimeout(() => {
                      setLoading(false);
                      setStep(5);
                    }, 2000);
                  }}
                />
                <ConfigCard
                  icon={Wallet}
                  title="Stai valutando un mutuo con risparmi mensili da investire?"
                  description="Valuta quando chiudere il mutuo investendo 300€ al mese con rendimenti attesi del 5%. Durate 15-25-35 anni."
                  details={["Mutuo €150k", "Anticipo 15%", "Investi 300€/mese", "Rendimento atteso 5%"]}
                  onSteps={() => {
                    applyConfig(3);
                    setStep(1);
                  }}
                  onResults={() => {
                    applyConfig(3);
                    setLoading(true);
                    setTimeout(() => {
                      setLoading(false);
                      setStep(5);
                    }, 2000);
                  }}
                />
                <ConfigCard
                  icon={WalletCards}
                  title="Stai valutando quanto convenga accedere ad un mutuo avendo capitale iniziale da investire?"
                  description="Decidi se accendere un mutuo tenendo investiti €50k. Confronta durate 20 e 40 anni."
                  details={["Mutuo €150k", "Anticipo 15%", "Capitale investito €50k", "Rendimento atteso 5%"]}
                  onSteps={() => {
                    applyConfig(4);
                    setStep(1);
                  }}
                  onResults={() => {
                    applyConfig(4);
                    setLoading(true);
                    setTimeout(() => {
                      setLoading(false);
                      setStep(5);
                    }, 2000);
                  }}
                />
              </div>
            </motion.div>
          )}

          {!loading && step===2 && (
            <motion.div key="s2" initial={{opacity:0,x:50}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-50}} transition={{duration:0.4}} className="bg-white p-6 rounded-2xl shadow space-y-6">
              <h2 className="text-lg font-medium">Step 2 – Mutuo</h2>
              <div className="space-y-3">
                <Card>
                  <h3 className="text-md font-medium mb-2">Valori del mutuo</h3>
                  <Grid>
                    <Field label="Importo considerato (€)" description="Prezzo dell'immobile da finanziare" value={price} onChange={setPrice} min={0} max={2000000} step={1000} suffix="€" />
                    <DownPaymentField price={price} downPct={downPct} setDownPct={setDownPct} mode={downMode} setMode={setDownMode} />
                    <Field label="TAN (%)" description="Tasso annuo nominale del mutuo" value={tan*100} onChange={(v)=>setTan(v/100)} min={0} max={10} step={0.1} suffix="%" />
                  </Grid>
                </Card>
              </div>
              <div className="flex justify-between">
                <button onClick={()=>setStep(1)} className="px-4 py-2 rounded-xl border border-orange-600 text-orange-600 bg-white">Indietro</button>
                <div className="flex gap-2">
                  <button onClick={()=>{resetAll(); setStep(0);}} className="px-4 py-2 rounded-xl border bg-white">Ricomincia</button>
                  <button onClick={()=>setStep(3)} className="px-4 py-2 bg-white text-orange-600 border border-orange-600 rounded-xl inline-flex items-center gap-2">Avanti <ArrowRight className="w-4 h-4"/></button>
                </div>
              </div>
              </motion.div>
          )}

          {!loading && step===1 && (
            <motion.div key="s1" initial={{opacity:0,x:50}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-50}} transition={{duration:0.4}} className="bg-white p-6 rounded-2xl shadow space-y-6">
              <h2 className="text-lg font-medium">Step 1 – Scenari</h2>
              <div className="space-y-3">
                <Card>
                  <h3 className="text-md font-medium mb-2">Scenari</h3>
                  <p className="text-sm text-slate-600 mb-2">Durata del mutuo e dell'investimento</p>
                  <div className="flex flex-col gap-3">
                    {scenarioYears.map((y, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <YearSelector
                          label={`Durata scenario ${i + 1} (anni)`}
                          description={`Durata del confronto ${i + 1}`}
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
                      Aggiungi scenario
                    </button>
                  </div>
                </Card>
              </div>
              <div className="flex justify-between">
                <button onClick={()=>setStep(0)} className="px-4 py-2 rounded-xl border border-orange-600 text-orange-600 bg-white">Indietro</button>
                <div className="flex gap-2">
                  <button onClick={()=>{resetAll(); setStep(0);}} className="px-4 py-2 rounded-xl border bg-white">Ricomincia</button>
                  <button onClick={()=>setStep(2)} className="px-4 py-2 bg-white text-orange-600 border border-orange-600 rounded-xl inline-flex items-center gap-2">Avanti <ArrowRight className="w-4 h-4"/></button>
                </div>
              </div>
              </motion.div>
          )}

          {!loading && step===3 && (
            <motion.div key="s3" initial={{opacity:0,x:50}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-50}} transition={{duration:0.4}} className="bg-white p-6 rounded-2xl shadow space-y-6">
              <h2 className="text-lg font-medium">Step 3 – Entrate</h2>
              <div className="space-y-3">
                <Card>
                  <h3 className="text-md font-medium mb-2">Risorse</h3>
                  <Grid>
                    <Field label="Capitale iniziale (€)" description="Somma disponibile subito" value={initialCapital} onChange={setInitialCapital} min={0} max={5000000} step={1000} suffix="€" />
                    <Field label="Disponibilità mensile (€)" description="Può derivare da risparmi sullo stipendio oppure da guadagni legati al mutuo (ad esempio un immobile in affitto)" value={cois} onChange={setCois} min={0} max={50000} step={50} suffix="€" />
                    <Field label="Inflazione (%)" description="Inflazione prevista" value={infl*100} onChange={(v)=>setInfl(v/100)} min={0} max={10} step={0.1} suffix="%" />
                  </Grid>
                </Card>
              </div>
              <div className="flex justify-between">
                <button onClick={()=>setStep(2)} className="px-4 py-2 rounded-xl border border-orange-600 text-orange-600 bg-white">Indietro</button>
                <div className="flex gap-2">
                  <button onClick={()=>{resetAll(); setStep(0);}} className="px-4 py-2 rounded-xl border bg-white">Ricomincia</button>
                  <button onClick={()=>setStep(4)} className="px-4 py-2 bg-white text-orange-600 border border-orange-600 rounded-xl inline-flex items-center gap-2">Avanti <ArrowRight className="w-4 h-4"/></button>
                </div>
              </div>
              </motion.div>
          )}

          {!loading && step===4 && (
            <motion.div key="s4" initial={{opacity:0,x:50}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-50}} transition={{duration:0.4}} className="bg-white p-6 rounded-2xl shadow space-y-6">
              <h2 className="text-lg font-medium">Step 4 – Investimenti</h2>
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
                        <Field label="Rendimento lordo (%)" description="Rendimento annuo lordo previsto" value={gross*100} onChange={(v)=>setGross(v/100)} min={0} max={20} step={0.1} suffix="%" />
                        <Field label="Tasse rendimenti (%)" description="Aliquota fiscale sui profitti" value={tax*100} onChange={(v)=>setTax(v/100)} min={0} max={43} step={1} suffix="%" />
                      </Grid>
                    </Card>
                    <Card>
                      <h3 className="text-md font-medium mb-2">Obiettivo</h3>
                      <Field label="Soglia guadagno minimo (in % rispetto al prezzo della casa, 0=disattiva)" description="Percentuale minima di guadagno desiderata" value={minGainPct*100} onChange={(v)=>setMinGainPct(v/100)} min={0} max={100} step={1} suffix="%" />
                    </Card>
                    <Card>
                      <h3 className="text-md font-medium mb-2">Indicatore</h3>
                      <Field label="Stipendio netto annuale" description="Usato solo per ragionare sul guadagno dall'investimento" value={salary} onChange={setSalary} min={0} max={1000000} step={1000} suffix="€" />
                    </Card>
                  </>
                )}
              </div>
              <div className="flex justify-between">
                <button onClick={()=>setStep(3)} className="px-4 py-2 rounded-xl border border-orange-600 text-orange-600 bg-white">Indietro</button>
                <div className="flex gap-2">
                  <button onClick={()=>{resetAll(); setStep(0);}} className="px-4 py-2 rounded-xl border bg-white">Ricomincia</button>
                  <button onClick={handleInvestNext} className="px-4 py-2 bg-white text-orange-600 border border-orange-600 rounded-xl inline-flex items-center gap-2">Vedi risultati <ArrowRight className="w-4 h-4"/></button>
                </div>
              </div>
              </motion.div>
          )}

            {!loading && step===5 && (
              <motion.div key="s5" initial={{opacity:0,x:50}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-50}} transition={{duration:0.4}} className="space-y-6">
                <h2 className="text-lg font-medium">Here we go!</h2>
                <Recap price={price} downPct={downPct} tan={tan} scenarioYears={scenarioYears} initialCapital={initialCapital} cois={cois} infl={infl} gross={gross} tax={tax} investInitial={investInitial} investMonthly={investMonthly} minGainPct={minGainPct} salary={salary} />
                <div className="text-xs text-slate-500">
                  <span className="font-semibold">Legenda:</span> Nominale = senza inflazione; Reale = valore attualizzato considerando l'inflazione.
                </div>
                {!hasInvestment && (
                  <p className="text-sm text-slate-600">Nessun investimento applicato: vengono mostrati solo i dettagli del mutuo.</p>
                )}
                {hasInvestment ? (
                  <>
                    {scenarioStats.map(({ years, s, be, payTime, label }, idx) => {
                      const finalNom = s.fvNominal + (price > 0 ? price : 0);
                      const finalReal = s.fvReal + (price > 0 ? price / Math.pow(1 + infl, years) : 0);
                      return (
                      <Card key={idx}>
                        <h3 className="text-md font-medium mb-2">{price>0 ? `Mutuo ${years} anni` : `Investimento ${years} anni`}</h3>
                        <div className="mt-4 space-y-6">
                          {price > 0 && (
                            <div>
                              <div className="text-xs font-semibold text-slate-600 mb-2">Mutuo</div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-3">
                                <DataCard icon={Wallet} iconClass="text-red-500" label="Rata" value={`${fmt2(s.payment)} / mese`} />
                                <DataCard
                                  icon={ArrowDownCircle}
                                  iconClass="text-red-500"
                                  label="Interessi"
                                  items={[
                                    { label: "Nominali", value: fmt(s.interestNominal) },
                                    { label: "Reali", value: fmt(s.interestReal) },
                                  ]}
                                />
                                <DataCard icon={Clock} iconClass="text-slate-500" label="Anno chiusura mutuo" value={isFinite(payTime) ? `${payTime.toFixed(1)} anni` : `> ${years} anni`} />
                              </div>
                              <AmortizationTable principal={s.principal} annualRate={tan} years={years} initial={initialCapital} monthly={cois} grossReturn={gross} taxRate={tax} investInitial={investInitial} investMonthly={investMonthly} />
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
                                  { label: "Nominale", value: fmt(s.fvNominal) },
                                  { label: "Reale", value: fmt(s.fvReal) },
                                ]}
                              />
                              <DataCard
                                icon={ArrowUpCircle}
                                iconClass="text-emerald-600"
                                label="Guadagno"
                                items={[
                                  { label: "Nominale", value: fmt(s.gainNominal) },
                                  { label: "Reale", value: fmt(s.gainReal) },
                                ]}
                              />
                              <DataCard icon={Percent} iconClass="text-slate-500" label="% stipendio annuo" value={salary>0 ? pct(s.gainReal/salary) : "–"} />
                              <DataCard icon={Percent} iconClass="text-slate-500" label="% prezzo casa" value={price>0 ? pct(s.gainReal/price) : "–"} />
                              <DataCard icon={Clock} iconClass="text-slate-500" label="Mesi di lavoro equivalenti" value={salary>0 ? (s.gainReal/(salary/12)).toFixed(1) : "–"} />
                              {price > 0 && <DataCard icon={Percent} iconClass="text-slate-500" label="Break-even lordo" value={pct(be)} />}
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
                                { label: "Nominale", value: fmt(finalNom) },
                                { label: "Reale", value: fmt(finalReal) },
                              ]}
                            />
                          </div>
                        </div>
                      </Card>
                      );
                    })}

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
                                <Tooltip formatter={(v) => fmt(v)} labelFormatter={(l) => `Rendimento lordo ${l}%`} />
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
                                <Tooltip formatter={(v) => fmt(v)} labelFormatter={(l) => `Anno ${l}`} />
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
                              <Tooltip formatter={(v) => fmt(v)} labelFormatter={(l) => `Anno ${l}`} />
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
                        {scenarioStats.map(({ label, s, be }, idx) => (
                          <div key={label} className="rounded-xl border border-slate-200 p-4 bg-white">
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-semibold">{label}</div>
                              <span className={`px-2 py-1 text-xs rounded-full ${better[idx] ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                {better[idx] ? (price>0 ? 'Conviene MUTUO + investimento' : 'Investimento profittevole') : (price>0 ? 'Conviene CASH' : 'Meglio non investire')}
                              </span>
                            </div>
                            <ul className="text-sm text-slate-600 space-y-1">
                              <li>% stipendio annuo: <b>{salary > 0 ? pct(s.gainReal / salary) : "–"}</b></li>
                              <li>% prezzo casa: <b>{price>0 ? pct(s.gainReal / price) : "–"}</b></li>
                              <li>Mesi di lavoro equivalenti: <b>{salary > 0 ? (s.gainReal / (salary / 12)).toFixed(1) : "–"}</b></li>
                              <li>Break-even lordo: <b>{pct(be)}</b></li>
                              <li>Guadagno reale stimato: <b>{fmt(s.gainReal)}</b></li>
                              <li>Interessi reali: <b>{fmt(s.interestReal)}</b></li>
                              <li>
                                {minGainPct > 0 ? (
                                  <>Scostamento dalla % attesa: <b>{pct(diffs[idx].diffPct)}</b> ({fmt(diffs[idx].diffAmt)})</>
                                ) : (
                                  <>Scostamento dallo smenarci: <b>{pct(diffs[idx].diffPct)}</b> ({fmt(diffs[idx].diffAmt)})</>
                                )}
                              </li>
                            </ul>
                            <p className="text-xs text-slate-500 mt-2">Regola pratica: se il rendimento lordo atteso supera il break-even{minGainPct>0 && ` e il guadagno supera il ${pct(minGainPct)} del mutuo`} e tolleri la volatilità, ha senso il mutuo. Altrimenti meglio pagare cash.</p>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </>
                ) : (
                  <>
                    {scenarioStats.map(({ years, s, payTime }, idx) => {
                      const finalNom = s.fvNominal + price;
                      const finalReal = s.fvReal + price / Math.pow(1 + infl, years);
                      return (
                      <Card key={idx}>
                        <h3 className="text-md font-medium mb-2">Mutuo {years} anni</h3>
                        <div className="mt-4">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
                            <DataCard icon={Wallet} iconClass="text-red-500" label="Rata" value={`${fmt2(s.payment)} / mese`} />
                            <DataCard
                              icon={ArrowDownCircle}
                              iconClass="text-red-500"
                              label="Interessi"
                              items={[
                                { label: "Nominali", value: fmt(s.interestNominal) },
                                { label: "Reali", value: fmt(s.interestReal) },
                              ]}
                            />
                            <DataCard icon={Clock} iconClass="text-slate-500" label="Anno chiusura mutuo" value={isFinite(payTime) ? `${payTime.toFixed(1)} anni` : `> ${years} anni`} />
                          </div>
                          <AmortizationTable principal={s.principal} annualRate={tan} years={years} initial={initialCapital} monthly={cois} grossReturn={gross} taxRate={tax} investInitial={investInitial} investMonthly={investMonthly} />
                          <div className="mt-4">
                            <div className="text-xs font-semibold text-slate-600 mb-2">Capitale finale</div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <DataCard
                                icon={PiggyBank}
                                iconClass="text-emerald-600"
                                label="Capitale finale"
                                items={[
                                { label: "Nominale", value: fmt(finalNom) },
                                { label: "Reale", value: fmt(finalReal) },
                                ]}
                              />
                            </div>
                          </div>
                        </div>
                      </Card>
                      );
                    })}
                  </>
                )}
              <div className="flex justify-end">
                <button onClick={()=>window.print()} className="px-4 py-2 rounded-xl border bg-white hover:bg-slate-50">Esporta / Salva PDF</button>
              </div>
              <div className="flex justify-between">
                <button onClick={()=>setStep(4)} className="px-4 py-2 rounded-xl border bg-white">Indietro</button>
                <button onClick={()=>{resetAll(); setStep(0);}} className="px-4 py-2 rounded-xl border bg-white">Ricomincia</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
