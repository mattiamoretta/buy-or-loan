import React from "react";

const data = [
  { feature: "Rendimento potenziale", mutuo: "Risparmio sugli interessi", investimento: "Crescita del capitale" },
  { feature: "Rischio", mutuo: "Basso e prevedibile", investimento: "Variabile" },
  { feature: "Liquidità", mutuo: "Vincolata nel bene", investimento: "Flessibile" }
];

export default function MutuoVsInvestimento() {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold text-center">Mutuo vs Investimento</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border border-slate-200">
          <thead className="bg-orange-100">
            <tr>
              <th className="px-2 py-1 border">Parametro</th>
              <th className="px-2 py-1 border">Mutuo</th>
              <th className="px-2 py-1 border">Investimento</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="odd:bg-white even:bg-slate-50">
                <td className="px-2 py-1 border">{row.feature}</td>
                <td className="px-2 py-1 border">{row.mutuo}</td>
                <td className="px-2 py-1 border">{row.investimento}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col md:flex-row md:justify-center gap-2 text-sm">
        <a
          href="https://www.calcolomutuo.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-orange-600 underline"
        >
          Calcolatore mutuo
        </a>
        <a
          href="https://www.calcolatoreinvestimenti.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-orange-600 underline"
        >
          Calcolatore investimento
        </a>
      </div>
    </section>
  );
}

