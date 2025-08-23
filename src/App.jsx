import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";
import { Calculator, TrendingUp, ArrowRight } from "lucide-react";

// -------------------- Utils --------------------
const fmt = (n) => n.toLocaleString("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const fmt2 = (n) => n.toLocaleString("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 2 });
const pct = (n) => `${(n * 100).toFixed(2)}%`;

function pmt(principal, annualRate, years){
  const r = annualRate/12; const n = years*12; return (principal*r)/(1-Math.pow(1+r,-n));
}
function investFV({ initial, monthly, grossReturn, taxRate, years, reinvest=true }){
  const rNet = (grossReturn||0)*(1-taxRate); const rm = rNet/12; let v = initial; const months = Math.round(years*12);
  if(reinvest){
    for(let m=1;m<=months;m++) v = v*(1+rm) + (monthly||0);
    return v;
  } else {
    for(let m=1;m<=months;m++) v = v*(1+rm);
    return v + (monthly||0)*months;
  }
}
function mortgageCosts({ principal, annualRate, years, inflation }){
  const n = years*12; const im = inflation/12; const payment = pmt(principal, annualRate, years); const totalPaid = payment*n; const interestNominal = totalPaid - principal;
  let pvPayments = 0; for(let m=1;m<=n;m++) pvPayments += payment/Math.pow(1+im,m);
  const interestReal = pvPayments - principal; return { payment, totalPaid, interestNominal, interestReal };
}
function scenarioGain({ price, downPct, tan, years, grossReturn, taxRate, inflation, monthlyExtra=0, reinvest=true }){
  const principal = price*(1-downPct);
  const initialInvest = price - price*downPct; // capitale non usato sulla casa
  const fvNominal = investFV({ initial: initialInvest, monthly: monthlyExtra, grossReturn, taxRate, years, reinvest });
  const { interestNominal, interestReal, payment } = mortgageCosts({ principal, annualRate: tan, years, inflation });
  const fvReal = fvNominal/Math.pow(1+inflation, years);
  const gainNominal = fvNominal - (principal + interestNominal);
  const gainReal = fvReal - (principal + interestReal);
  return { principal, initialInvest, payment, fvNominal, fvReal, interestNominal, interestReal, gainNominal, gainReal };
}
function breakEvenGross({ price, downPct, tan, years, taxRate, inflation, monthlyExtra=0, reinvest=true }){
  let lo=0, hi=0.2; // 0..20% lordo
  for(let i=0;i<60;i++){
    const mid=(lo+hi)/2; const g=scenarioGain({ price, downPct, tan, years, grossReturn: mid, taxRate, inflation, monthlyExtra, reinvest }).gainReal;
    if(g>=0) hi=mid; else lo=mid;
  }
  return (lo+hi)/2;
}


function mortgageBalance({ principal, annualRate, years, afterYears }){
  const payment = pmt(principal, annualRate, years);
  const r = annualRate/12; const t = Math.round(afterYears*12);
  const bal = principal*Math.pow(1+r, t) - payment*((Math.pow(1+r, t)-1)/r);
  return Math.max(0, bal);
}

function payOffTime({ price, downPct, tan, years, grossReturn, taxRate, monthlyExtra=0, reinvest=true }){
  const principal = price*(1-downPct);
  const initialInvest = price - price*downPct;

  function profit(y){
    const fv = investFV({ initial: initialInvest, monthly: monthlyExtra, grossReturn, taxRate, years: y, reinvest });
    const contrib = initialInvest + monthlyExtra*12*y;
    return fv - contrib;
  }

  function balance(y){
    return mortgageBalance({ principal, annualRate: tan, years, afterYears: y });
  }

  if(profit(years) < balance(years)) return Infinity;

  let lo=0, hi=years;
  for(let i=0;i<60;i++){
    const mid=(lo+hi)/2;
    if(profit(mid) >= balance(mid)) hi=mid; else lo=mid;
  }
  return (lo+hi)/2;
}

// -------------------- UI helpers --------------------
function Card({ children }){ return <motion.div layout className="bg-white rounded-2xl shadow p-5 border border-slate-200">{children}</motion.div>; }
function Grid({ children }){ return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">{children}</div>; }
function Field({ label, value, onChange, min, max, step, prefix, suffix }){
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-slate-600">{label}</label>
      <div className="flex items-center gap-2">
        {prefix && <span className="text-slate-500 text-sm">{prefix}</span>}
        <input type="number" className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300" value={value} onChange={(e)=>onChange(parseFloat(e.target.value||"0"))} min={min} max={max} step={step} />
        {suffix && <span className="text-slate-500 text-sm">{suffix}</span>}
      </div>
    </div>
  );
}
function Checkbox({ label, checked, onChange }){
  return (
    <label className="flex items-center gap-2 text-sm text-slate-600">
      <input type="checkbox" className="rounded" checked={checked} onChange={(e)=>onChange(e.target.checked)} />
      {label}
    </label>
  );
}
function KPICard({ title, value, subtitle }){
  return (
    <div className="rounded-xl border border-slate-200 p-3 bg-slate-50">
      <div className="text-xs text-slate-500 mb-1">{title}</div>
      <div className="text-lg font-semibold text-orange-600">{value}</div>
      {subtitle && <div className="text-xs text-slate-400">{subtitle}</div>}
    </div>
  );
}
function MiniTable({ title, sections }){
  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-4 py-2 bg-slate-50 text-sm font-semibold text-slate-700">{title}</div>
      <div className="divide-y">
        {sections.map((s, i) => (
          <div key={i}>
            <div className="px-4 py-1 bg-slate-100 text-xs font-semibold text-slate-600">{s.title}</div>
            {s.rows.map(([k, v], j) => (
              <div key={j} className="flex items-center justify-between px-4 py-2 text-sm">
                <span className="text-slate-600">{k}</span>
                <span className="font-medium">{v}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function Stepper({ step }) {
  const labels = [
    "Acquisto",
    "Mutuo",
    "Investimenti",
    "Stipendio",
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
  const [yearsA, setYearsA] = useState(10);
  const [yearsB, setYearsB] = useState(30);

  // Tassi
  const [tan, setTan] = useState(0.03);
  const [infl, setInfl] = useState(0.02);
  const [tax, setTax] = useState(0.26);
  const [gross, setGross] = useState(0.05);

  // Contributi
  const [monthlyExtra, setMonthlyExtra] = useState(0);
  const [reinvest, setReinvest] = useState(true);

  // Stipendio
  const [salary, setSalary] = useState(30000);
  const [minGainPct, setMinGainPct] = useState(0.1);

  // Calcoli
  const sA = useMemo(()=>scenarioGain({ price, downPct, tan, years: yearsA, grossReturn: gross, taxRate: tax, inflation: infl, monthlyExtra, reinvest }), [price, downPct, tan, yearsA, gross, tax, infl, monthlyExtra, reinvest]);
  const sB = useMemo(()=>scenarioGain({ price, downPct, tan, years: yearsB, grossReturn: gross, taxRate: tax, inflation: infl, monthlyExtra, reinvest }), [price, downPct, tan, yearsB, gross, tax, infl, monthlyExtra, reinvest]);
  const beA = useMemo(()=>breakEvenGross({ price, downPct, tan, years: yearsA, taxRate: tax, inflation: infl, monthlyExtra, reinvest }), [price, downPct, tan, yearsA, tax, infl, monthlyExtra, reinvest]);
  const beB = useMemo(()=>breakEvenGross({ price, downPct, tan, years: yearsB, taxRate: tax, inflation: infl, monthlyExtra, reinvest }), [price, downPct, tan, yearsB, tax, infl, monthlyExtra, reinvest]);
  const payTimeA = useMemo(()=>payOffTime({ price, downPct, tan, years: yearsA, grossReturn: gross, taxRate: tax, monthlyExtra, reinvest }), [price, downPct, tan, yearsA, gross, tax, monthlyExtra, reinvest]);
  const payTimeB = useMemo(()=>payOffTime({ price, downPct, tan, years: yearsB, grossReturn: gross, taxRate: tax, monthlyExtra, reinvest }), [price, downPct, tan, yearsB, gross, tax, monthlyExtra, reinvest]);
  const labelA = `Scenario ${yearsA} anni`; const labelB = `Scenario ${yearsB} anni`;
  const labelAN = `${labelA} nominale`; const labelAR = `${labelA} reale`;
  const labelBN = `${labelB} nominale`; const labelBR = `${labelB} reale`;
  const chartData = useMemo(()=>{
    const rows=[]; for(let r=0.02;r<=0.07+1e-9;r+=0.0025){
      const gA = scenarioGain({ price, downPct, tan, years: yearsA, grossReturn: r, taxRate: tax, inflation: infl, monthlyExtra, reinvest }).gainReal;
      const gB = scenarioGain({ price, downPct, tan, years: yearsB, grossReturn: r, taxRate: tax, inflation: infl, monthlyExtra, reinvest }).gainReal;
      rows.push({ r:+(r*100).toFixed(2), [labelA]: gA, [labelB]: gB });
    }
    return rows;
  }, [price, downPct, tan, yearsA, yearsB, tax, infl, monthlyExtra, reinvest, labelA, labelB]);
  const yearlyData = useMemo(()=>{
    const maxY=Math.max(yearsA, yearsB); const rows=[];
    for(let y=1;y<=maxY;y++){
      const row={ year:y };
      if(y<=yearsA){ const gA=scenarioGain({ price, downPct, tan, years:y, grossReturn:gross, taxRate:tax, inflation:infl, monthlyExtra, reinvest }); row[labelAN]=gA.gainNominal; row[labelAR]=gA.gainReal; }
      if(y<=yearsB){ const gB=scenarioGain({ price, downPct, tan, years:y, grossReturn:gross, taxRate:tax, inflation:infl, monthlyExtra, reinvest }); row[labelBN]=gB.gainNominal; row[labelBR]=gB.gainReal; }
      rows.push(row);
    }
    return rows;
  }, [price, downPct, tan, yearsA, yearsB, gross, tax, infl, monthlyExtra, reinvest, labelAN, labelAR, labelBN, labelBR]);

  const betterA = minGainPct>0 ? sA.gainReal >= sA.principal*minGainPct : sA.gainReal >= 0;
  const betterB = minGainPct>0 ? sB.gainReal >= sB.principal*minGainPct : sB.gainReal >= 0;

  const targetPct = minGainPct>0 ? minGainPct : 0;
  const diffPctA = sA.gainReal / sA.principal - targetPct;
  const diffAmtA = sA.gainReal - sA.principal * targetPct;
  const diffPctB = sB.gainReal / sB.principal - targetPct;
  const diffAmtB = sB.gainReal - sB.principal * targetPct;

  const titleColor = step >= 4 ? "text-white" : "text-slate-800";

  return (
    <div className={`min-h-screen bg-gradient-to-br ${backgrounds[step]} animate-gradient text-slate-800`}>
      <div className="max-w-5xl mx-auto p-6">
        <header className="flex items-center gap-3 mb-6">
          <Calculator className="w-7 h-7 text-orange-600" />
          <h1 className={`text-2xl md:text-3xl font-semibold ${titleColor}`}>The wise investor's wizard - Cash oppure mutuo? 🚀</h1>
        </header>

        {step > 0 && <Stepper step={step} />}

        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-white flex items-center justify-center"
            >
              <div className="h-16 w-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </motion.div>
          )}

          {!loading && step===0 && (
            <motion.div key="landing" initial={{opacity:0,x:50}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-50}} transition={{duration:0.4}} className="bg-white p-6 rounded-2xl shadow space-y-6 text-center">
              <h2 className="text-2xl font-bold">Scopri se conviene andare di cash oppure affidarsi ad un mutuo.</h2>
              <p className="text-slate-600">Simula scenari diversi e trova la scelta migliore!</p>
              <button onClick={()=>setStep(1)} className="px-6 py-3 bg-orange-600 text-white rounded-xl inline-flex items-center gap-2">Prova ora <ArrowRight className="w-4 h-4"/></button>
            </motion.div>
          )}

          {!loading && step===1 && (
            <motion.div key="s1" initial={{opacity:0,x:50}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-50}} transition={{duration:0.4}} className="bg-white p-6 rounded-2xl shadow space-y-6">
              <h2 className="text-lg font-medium">Step 1 – Cosa vuoi acquistare?</h2>
              <Grid>
                <Field label="Prezzo casa (€)" value={price} onChange={setPrice} min={50000} max={2000000} step={1000} suffix="€" />
                <Field label="Anticipo (%)" value={downPct*100} onChange={(v)=>setDownPct(v/100)} min={0} max={90} step={1} suffix="%" />
              </Grid>
              <div className="flex justify-end">
                <button onClick={()=>setStep(2)} className="px-4 py-2 bg-orange-600 text-white rounded-xl inline-flex items-center gap-2">Avanti <ArrowRight className="w-4 h-4"/></button>
              </div>
            </motion.div>
          )}

          {!loading && step===2 && (
            <motion.div key="s2" initial={{opacity:0,x:50}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-50}} transition={{duration:0.4}} className="bg-white p-6 rounded-2xl shadow space-y-6">
              <h2 className="text-lg font-medium">Step 2 – Mutuo e scenari</h2>
              <div className="space-y-3">
                <Grid>
                  <Field label="TAN mutuo (%)" value={tan*100} onChange={(v)=>setTan(v/100)} min={0} max={10} step={0.1} suffix="%" />
                  <Field label="Inflazione (%)" value={infl*100} onChange={(v)=>setInfl(v/100)} min={0} max={10} step={0.1} suffix="%" />
                </Grid>
                  <Grid>
                    <Field label="Durata scenario A (anni)" value={yearsA} onChange={setYearsA} min={1} max={40} step={1}/>
                    <Field label="Durata scenario B (anni)" value={yearsB} onChange={setYearsB} min={1} max={40} step={1}/>
                  </Grid>
                </div>
              <div className="flex justify-between">
                <button onClick={()=>setStep(1)} className="px-4 py-2 rounded-xl border border-orange-600 text-orange-600 bg-white">Indietro</button>
                <button onClick={()=>setStep(3)} className="px-4 py-2 bg-white text-orange-600 border border-orange-600 rounded-xl inline-flex items-center gap-2">Avanti <ArrowRight className="w-4 h-4"/></button>
              </div>
            </motion.div>
          )}

          {!loading && step===3 && (
            <motion.div key="s3" initial={{opacity:0,x:50}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-50}} transition={{duration:0.4}} className="bg-white p-6 rounded-2xl shadow space-y-6">
                <h2 className="text-lg font-medium">Step 3 – Investimenti</h2>
                <div className="space-y-3">
                  <Field label="Rendimento lordo (%)" value={gross*100} onChange={(v)=>setGross(v/100)} min={0} max={20} step={0.1} suffix="%" />
                  <Field label="Tasse rendimenti (%)" value={tax*100} onChange={(v)=>setTax(v/100)} min={0} max={43} step={1} suffix="%" />
                  <Field label="Soglia guadagno minimo (in % rispetto al prezzo della casa, 0=disattiva)" value={minGainPct*100} onChange={(v)=>setMinGainPct(v/100)} min={0} max={100} step={1} suffix="%" />
                  <Field label="Contributo mensile (€)" value={monthlyExtra} onChange={setMonthlyExtra} min={0} max={50000} step={50} suffix="€" />
                  <Checkbox label="Reinvesti mensilmente" checked={reinvest} onChange={setReinvest} />
                  
                </div>
                <div className="flex justify-between">
                <button onClick={()=>setStep(2)} className="px-4 py-2 rounded-xl border border-orange-600 text-orange-600 bg-white">Indietro</button>
                <button onClick={()=>setStep(4)} className="px-4 py-2 bg-white text-orange-600 border border-orange-600 rounded-xl inline-flex items-center gap-2">Avanti <ArrowRight className="w-4 h-4"/></button>
              </div>
            </motion.div>
          )}

          {!loading && step===4 && (
            <motion.div key="s4" initial={{opacity:0,x:50}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-50}} transition={{duration:0.4}} className="bg-white p-6 rounded-2xl shadow space-y-6">
              <h2 className="text-lg font-medium">Step 4 – Il tuo stipendio</h2>
              <div className="space-y-3">
                <Field label="Stipendio netto annuale" value={salary} onChange={setSalary} min={0} max={1000000} step={1000} suffix="€" />
              </div>
              <div className="flex justify-between">
                <button onClick={()=>setStep(3)} className="px-4 py-2 rounded-xl border border-orange-600 text-orange-600 bg-white">Indietro</button>
                <button onClick={()=>{setLoading(true); setTimeout(()=>{setLoading(false); setStep(5);},2000);}} className="px-4 py-2 bg-white text-orange-600 border border-orange-600 rounded-xl inline-flex items-center gap-2">Vedi risultati <ArrowRight className="w-4 h-4"/></button>
              </div>
            </motion.div>
          )}

          {!loading && step===5 && (
            <motion.div key="s5" initial={{opacity:0,x:50}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-50}} transition={{duration:0.4}} className="space-y-6">
              <h2 className="text-lg font-medium">Here we go!</h2>
              <Card>
                <h3 className="text-md font-medium mb-2">Mutuo {yearsA} anni</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <KPICard title="Rata" value={fmt2(sA.payment)} subtitle="€/mese"/>
                  <KPICard title="Break-even lordo" value={pct(beA)} subtitle="guadagno reale = 0"/>
                </div>
                <div className="mt-4">
                  <MiniTable
                    title="Dettagli"
                    sections={[
                      { title: "Investimento", rows: [["Invest. finale nominale", fmt(sA.fvNominal)], ["Invest. finale reale", fmt(sA.fvReal)]] },
                      { title: "Interessi", rows: [["Interessi nominali", fmt(sA.interestNominal)], ["Interessi reali (PV)", fmt(sA.interestReal)]] },
                      { title: "Guadagno", rows: [["Guadagno nominale", fmt(sA.gainNominal)], ["Guadagno reale", fmt(sA.gainReal)]] },
                      { title: "Comparazione", rows: [["% stipendio annuo", salary>0 ? pct(sA.gainReal/salary) : "–"], ["% prezzo casa", pct(sA.gainReal/price)], ["Mesi di lavoro equivalenti", salary>0 ? (sA.gainReal/(salary/12)).toFixed(1) : "–"]] },
                      { title: "Chiusura mutuo", rows: [["Anno chiusura mutuo", isFinite(payTimeA) ? `${payTimeA.toFixed(1)} anni` : `> ${yearsA} anni`]] }
                    ]}
                  />
                </div>
              </Card>

              <Card>
                <h3 className="text-md font-medium mb-2">Mutuo {yearsB} anni</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <KPICard title="Rata" value={fmt2(sB.payment)} subtitle="€/mese"/>
                  <KPICard title="Break-even lordo" value={pct(beB)} subtitle="guadagno reale = 0"/>
                </div>
                <div className="mt-4">
                  <MiniTable
                    title="Dettagli"
                    sections={[
                      { title: "Investimento", rows: [["Invest. finale nominale", fmt(sB.fvNominal)], ["Invest. finale reale", fmt(sB.fvReal)]] },
                      { title: "Interessi", rows: [["Interessi nominali", fmt(sB.interestNominal)], ["Interessi reali (PV)", fmt(sB.interestReal)]] },
                      { title: "Guadagno", rows: [["Guadagno nominale", fmt(sB.gainNominal)], ["Guadagno reale", fmt(sB.gainReal)]] },
                      { title: "Comparazione", rows: [["% stipendio annuo", salary>0 ? pct(sB.gainReal/salary) : "–"], ["% prezzo casa", pct(sB.gainReal/price)], ["Mesi di lavoro equivalenti", salary>0 ? (sB.gainReal/(salary/12)).toFixed(1) : "–"]] },
                      { title: "Chiusura mutuo", rows: [["Anno chiusura mutuo", isFinite(payTimeB) ? `${payTimeB.toFixed(1)} anni` : `> ${yearsB} anni`]] }
                    ]}
                  />
                </div>
              </Card>

              <Card>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5"/>
                  <h2 className="text-lg font-medium">Guadagno reale netto vs rendimento lordo</h2>
                </div>
                <div className="h-72">
                  <ResponsiveContainer>
                    <LineChart data={chartData} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                      <XAxis dataKey="r" tickFormatter={(v)=>`${v}%`} />
                      <YAxis tickFormatter={(v)=>v.toLocaleString("it-IT")} />
                      <Tooltip formatter={(v)=>fmt(v)} labelFormatter={(l)=>`Rendimento lordo ${l}%`} />
                      <Legend />
                      <ReferenceLine y={0} stroke="#222" strokeDasharray="4 4" />
                      <Line type="monotone" dataKey={labelA} stroke="#2563eb" dot={false} strokeWidth={2} />
                      <Line type="monotone" dataKey={labelB} stroke="#f97316" dot={false} strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5"/>
                  <h2 className="text-lg font-medium">Guadagno nominale e reale nel tempo</h2>
                </div>
                <div className="h-72">
                  <ResponsiveContainer>
                    <LineChart data={yearlyData} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                      <XAxis dataKey="year" />
                      <YAxis yAxisId="A" tickFormatter={(v)=>v.toLocaleString("it-IT")} />
                      <YAxis yAxisId="B" orientation="right" tickFormatter={(v)=>v.toLocaleString("it-IT")} />
                      <Tooltip formatter={(v)=>fmt(v)} labelFormatter={(l)=>`Anno ${l}`} />
                      <Legend />
                      <ReferenceLine y={0} stroke="#222" strokeDasharray="4 4" />
                      <Line yAxisId="A" type="monotone" dataKey={labelAN} stroke="#2563eb" strokeDasharray="5 5" dot={false} />
                      <Line yAxisId="A" type="monotone" dataKey={labelAR} stroke="#2563eb" strokeWidth={2} dot={false} />
                      <Line yAxisId="B" type="monotone" dataKey={labelBN} stroke="#f97316" strokeDasharray="5 5" dot={false} />
                      <Line yAxisId="B" type="monotone" dataKey={labelBR} stroke="#f97316" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card>
                <h2 className="text-lg font-medium mb-2">Conclusione</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-slate-200 p-4 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold">{labelA}</div>
                      <span className={`px-2 py-1 text-xs rounded-full ${betterA ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {betterA ? 'Conviene MUTUO + investimento' : 'Conviene CASH'}
                      </span>
                    </div>
                    <ul className="text-sm text-slate-600 space-y-1">
                      <li>% stipendio annuo: <b>{salary>0 ? pct(sA.gainReal/salary) : "–"}</b></li>
                      <li>% prezzo casa: <b>{pct(sA.gainReal/price)}</b></li>
                      <li>Mesi di lavoro equivalenti: <b>{salary>0 ? (sA.gainReal/(salary/12)).toFixed(1) : "–"}</b></li>
                      <li>Break-even lordo: <b>{pct(beA)}</b></li>
                      <li>Guadagno reale stimato: <b>{fmt(sA.gainReal)}</b></li>
                      <li>Interessi reali (PV): <b>{fmt(sA.interestReal)}</b></li>
                      <li>{minGainPct>0 ? <>Scostamento dalla % attesa: <b>{pct(diffPctA)}</b> ({fmt(diffAmtA)})</> : <>Scostamento dallo smenarci: <b>{pct(diffPctA)}</b> ({fmt(diffAmtA)})</>}</li>
                    </ul>
                    <p className="text-xs text-slate-500 mt-2">Regola pratica: se il rendimento lordo atteso supera il break-even{minGainPct>0 && ` e il guadagno supera il ${pct(minGainPct)} del mutuo`} e tolleri la volatilità, ha senso il mutuo. Altrimenti meglio pagare cash.</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-4 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold">{labelB}</div>
                      <span className={`px-2 py-1 text-xs rounded-full ${betterB ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {betterB ? 'Conviene MUTUO + investimento' : 'Conviene CASH'}
                      </span>
                    </div>
                    <ul className="text-sm text-slate-600 space-y-1">
                      <li>% stipendio annuo: <b>{salary>0 ? pct(sB.gainReal/salary) : "–"}</b></li>
                      <li>% prezzo casa: <b>{pct(sB.gainReal/price)}</b></li>
                      <li>Mesi di lavoro equivalenti: <b>{salary>0 ? (sB.gainReal/(salary/12)).toFixed(1) : "–"}</b></li>
                      <li>Break-even lordo: <b>{pct(beB)}</b></li>
                      <li>Guadagno reale stimato: <b>{fmt(sB.gainReal)}</b></li>
                      <li>Interessi reali (PV): <b>{fmt(sB.interestReal)}</b></li>
                      <li>{minGainPct>0 ? <>Scostamento dalla % attesa: <b>{pct(diffPctB)}</b> ({fmt(diffAmtB)})</> : <>Scostamento dallo smenarci: <b>{pct(diffPctB)}</b> ({fmt(diffAmtB)})</>}</li>
                    </ul>
                    <p className="text-xs text-slate-500 mt-2">Con durate più lunghe l'interesse composto aiuta: sopra il break-even i vantaggi crescono molto più che nei periodi brevi.</p>
                  </div>
                </div>
              </Card>
              <div className="flex justify-end">
                <button onClick={()=>window.print()} className="px-4 py-2 rounded-xl border bg-white hover:bg-slate-50">Esporta / Salva PDF</button>
              </div>
              <div className="flex justify-between">
                <button onClick={()=>setStep(4)} className="px-4 py-2 rounded-xl border bg-white">Indietro</button>
                <button onClick={()=>setStep(0)} className="px-4 py-2 rounded-xl border bg-white">Ricomincia</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
