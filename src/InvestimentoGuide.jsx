import React from "react";

export default function InvestimentoGuide() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Guida all'Investimento</h1>
      <p className="mb-4">
        Concetti base per iniziare a investire e costruire un portafoglio diversificato.
      </p>
      <h2 className="text-xl font-semibold mb-2">Esempio pratico</h2>
      <p className="mb-4">
        Investendo 300€ al mese in un ETF globale con rendimento medio del 6% puoi accumulare circa 20.000€ in 5 anni.
      </p>
      <h2 className="text-xl font-semibold mb-2">Link utili</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <a
            href="https://www.mef.gov.it/it/Focus/Investire-con-consapevolezza/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            Investire con consapevolezza - MEF
          </a>
        </li>
        <li>
          <a
            href="https://www.morningstar.it/it/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            Analisi su fondi ed ETF
          </a>
        </li>
      </ul>
    </div>
  );
}
