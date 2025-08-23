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

// -------------------- UI helpers --------------------
function Card({ children }){ return <motion.div layout className="bg-white rounded-2xl shadow p-5 border border-slate-200">{children}</motion.div>; }
function Grid({ children }){ return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">{children}</div>; }
function Field({ label, value, onChange, min, max, step, prefix, suffix }){
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-slate-600">{label}</label>
      <div className="flex items-center gap-2">
        {prefix && <span className="text-slate-500 text-sm">{prefix}</span>}
        <input type="number" className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300" value={value} onChange={(e)=>onChange(parseFloat(e.target.value||"0"))} min={min} max={max} step={step} />
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
      <div className="text-lg font-semibold text-indigo-600">{value}</div>
      {subtitle && <div className="text-xs text-slate-400">{subtitle}</div>}
    </div>
  );
}
function MiniTable({ title, rows }){
  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-4 py-2 bg-slate-50 text-sm font-semibold text-slate-700">{title}</div>
      <div className="divide-y">
        {rows.map(([k,v], i)=> (
          <div key={i} className="flex items-center justify-between px-4 py-2 text-sm">
            <span className="text-slate-600">{k}</span>
            <span className="font-medium">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// -------------------- App --------------------
export default function App(){
  // Wizard: 0..3
  const [step, setStep] = useState(0);

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

  // Calcoli
  const sA = useMemo(()=>scenarioGain({ price, downPct, tan, years: yearsA, grossReturn: gross, taxRate: tax, inflation: infl, monthlyExtra, reinvest }), [price, downPct, tan, yearsA, gross, tax, infl, monthlyExtra, reinvest]);
  const sB = useMemo(()=>scenarioGain({ price, downPct, tan, years: yearsB, grossReturn: gross, taxRate: tax, inflation: infl, monthlyExtra, reinvest }), [price, downPct, tan, yearsB, gross, tax, infl, monthlyExtra, reinvest]);
  const beA = useMemo(()=>breakEvenGross({ price, downPct, tan, years: yearsA, taxRate: tax, inflation: infl, monthlyExtra, reinvest }), [price, downPct, tan, yearsA, tax, infl, monthlyExtra, reinvest]);
  const beB = useMemo(()=>breakEvenGross({ price, downPct, tan, years: yearsB, taxRate: tax, inflation: infl, monthlyExtra, reinvest }), [price, downPct, tan, yearsB, tax, infl, monthlyExtra, reinvest]);
  const labelA = `Scenario ${yearsA} anni`; const labelB = `Scenario ${yearsB} anni`;
  const chartData = useMemo(()=>{
    const rows=[]; for(let r=0.02;r<=0.07+1e-9;r+=0.0025){
      const gA = scenarioGain({ price, downPct, tan, years: yearsA, grossReturn: r, taxRate: tax, inflation: infl, monthlyExtra, reinvest }).gainReal;
      const gB = scenarioGain({ price, downPct, tan, years: yearsB, grossReturn: r, taxRate: tax, inflation: infl, monthlyExtra, reinvest }).gainReal;
      rows.push({ r:+(r*100).toFixed(2), [labelA]: gA, [labelB]: gB });
    }
    return rows;
  }, [price, downPct, tan, yearsA, yearsB, tax, infl, monthlyExtra, reinvest, labelA, labelB]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-slate-100 text-slate-800">
      <div className="max-w-5xl mx-auto p-6">
        <header className="flex items-center gap-3 mb-6">
          <Calculator className="w-7 h-7 text-indigo-600" />
          <h1 className="text-2xl md:text-3xl font-semibold">Simulatore Mutuo vs Cash – Wizard</h1>
        </header>

        <AnimatePresence mode="wait">
          {step===0 && (
            <motion.div key="s0" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} className="bg-white p-6 rounded-2xl shadow space-y-6">
              <h2 className="text-lg font-medium">Step 1 – Parametri base</h2>
              <Grid>
                <Field label="Prezzo casa" value={price} onChange={setPrice} min={50000} max={2000000} step={1000} prefix="€" />
                <Field label="Anticipo (%)" value={downPct*100} onChange={(v)=>setDownPct(v/100)} min={0} max={90} step={1} suffix="%" />
                <Field label="Durata scenario A (anni)" value={yearsA} onChange={setYearsA} min={1} max={40} step={1} />
                <Field label="Durata scenario B (anni)" value={yearsB} onChange={setYearsB} min={1} max={40} step={1} />
              </Grid>
              <button onClick={()=>setStep(1)} className="px-4 py-2 bg-indigo-600 text-white rounded-xl inline-flex items-center gap-2">Avanti <ArrowRight className="w-4 h-4"/></button>
            </motion.div>
          )}

          {step===1 && (
            <motion.div key="s1" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} className="bg-white p-6 rounded-2xl shadow space-y-6">
              <h2 className="text-lg font-medium">Step 2 – Tassi & inflazione</h2>
              <Grid>
                <Field label="TAN mutuo (%)" value={tan*100} onChange={(v)=>setTan(v/100)} min={0} max={10} step={0.1} suffix="%" />
                <Field label="Inflazione (%)" value={infl*100} onChange={(v)=>setInfl(v/100)} min={0} max={10} step={0.1} suffix="%" />
                <Field label="Tasse rendimenti (%)" value={tax*100} onChange={(v)=>setTax(v/100)} min={0} max={43} step={1} suffix="%" />
                <Field label="Rendimento lordo (%)" value={gross*100} onChange={(v)=>setGross(v/100)} min={0} max={20} step={0.1} suffix="%" />
              </Grid>
              <div className="flex justify-between">
                <button onClick={()=>setStep(0)} className="px-4 py-2 rounded-xl border">Indietro</button>
                <button onClick={()=>setStep(2)} className="px-4 py-2 bg-indigo-600 text-white rounded-xl inline-flex items-center gap-2">Avanti <ArrowRight className="w-4 h-4"/></button>
              </div>
            </motion.div>
          )}

          {step===2 && (
            <motion.div key="s2" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} className="bg-white p-6 rounded-2xl shadow space-y-6">
              <h2 className="text-lg font-medium">Step 3 – Contributi extra</h2>
              <div className="space-y-3">
                <Field label="Contributo mensile (€)" value={monthlyExtra} onChange={setMonthlyExtra} min={0} max={50000} step={50} prefix="€" />
                <Checkbox label="Reinvesti mensilmente" checked={reinvest} onChange={setReinvest} />
              </div>
              <div className="flex justify-between">
                <button onClick={()=>setStep(1)} className="px-4 py-2 rounded-xl border">Indietro</button>
                <button onClick={()=>setStep(3)} className="px-4 py-2 bg-indigo-600 text-white rounded-xl inline-flex items-center gap-2">Vedi risultati <ArrowRight className="w-4 h-4"/></button>
              </div>
            </motion.div>
          )}

          {step===3 && (
            <motion.div key="s3" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} className="space-y-6">
              <Card>
                <h2 className="text-lg font-medium mb-2">Risultati</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <KPICard title={`Mutuo ${yearsA} anni – rata`} value={fmt2(sA.payment)} subtitle="€/mese"/>
                  <KPICard title={`Mutuo ${yearsB} anni – rata`} value={fmt2(sB.payment)} subtitle="€/mese"/>
                  <KPICard title={`Break-even lordo ${yearsA}y`} value={pct(beA)} subtitle="guadagno reale = 0"/>
                  <KPICard title={`Break-even lordo ${yearsB}y`} value={pct(beB)} subtitle="guadagno reale = 0"/>
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <MiniTable title={`Mutuo ${yearsA} anni`} rows={[["Invest. finale nominale", fmt(sA.fvNominal)],["Invest. finale reale", fmt(sA.fvReal)],["Interessi nominali", fmt(sA.interestNominal)],["Interessi reali (PV)", fmt(sA.interestReal)],["Guadagno nominale", fmt(sA.gainNominal)],["Guadagno reale", fmt(sA.gainReal)]]} />
                  <MiniTable title={`Mutuo ${yearsB} anni`} rows={[["Invest. finale nominale", fmt(sB.fvNominal)],["Invest. finale reale", fmt(sB.fvReal)],["Interessi nominali", fmt(sB.interestNominal)],["Interessi reali (PV)", fmt(sB.interestReal)],["Guadagno nominale", fmt(sB.gainNominal)],["Guadagno reale", fmt(sB.gainReal)]]} />
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
                <div className="mt-3 flex justify-end">
                  <button onClick={()=>window.print()} className="px-4 py-2 rounded-xl border bg-white hover:bg-slate-50">Esporta / Salva PDF</button>
                </div>
              </Card>

              <Card>
                <h2 className="text-lg font-medium mb-2">Conclusione guidata</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-slate-200 p-4 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold">{labelA}</div>
                      <span className={`px-2 py-1 text-xs rounded-full ${sA.gainReal>=0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {sA.gainReal>=0 ? 'Conviene MUTUO + investimento' : 'Conviene CASH'}
                      </span>
                    </div>
                    <ul className="text-sm text-slate-600 space-y-1">
                      <li>Break-even lordo: <b>{pct(beA)}</b></li>
                      <li>Guadagno reale stimato: <b>{fmt(sA.gainReal)}</b></li>
                      <li>Interessi reali (PV): <b>{fmt(sA.interestReal)}</b></li>
                    </ul>
                    <p className="text-xs text-slate-500 mt-2">Regola pratica: se il rendimento lordo atteso supera il break-even e tolleri la volatilità, ha senso il mutuo. Altrimenti meglio pagare cash.</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-4 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold">{labelB}</div>
                      <span className={`px-2 py-1 text-xs rounded-full ${sB.gainReal>=0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {sB.gainReal>=0 ? 'Conviene MUTUO + investimento' : 'Conviene CASH'}
                      </span>
                    </div>
                    <ul className="text-sm text-slate-600 space-y-1">
                      <li>Break-even lordo: <b>{pct(beB)}</b></li>
                      <li>Guadagno reale stimato: <b>{fmt(sB.gainReal)}</b></li>
                      <li>Interessi reali (PV): <b>{fmt(sB.interestReal)}</b></li>
                    </ul>
                    <p className="text-xs text-slate-500 mt-2">Con durate più lunghe l'interesse composto aiuta: sopra il break-even i vantaggi crescono molto più che nei periodi brevi.</p>
                  </div>
                </div>
              </Card>

              <div className="flex justify-between">
                <button onClick={()=>setStep(2)} className="px-4 py-2 rounded-xl border">Indietro</button>
                <button onClick={()=>setStep(0)} className="px-4 py-2 rounded-xl border">Ricomincia</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
