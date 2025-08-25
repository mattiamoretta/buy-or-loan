import React from "react";

export default function MutuoInvestimentoGuide() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Mutuo e Investimento</h1>
      <p className="mb-4">
        Valutare se conviene investire il capitale disponibile o utilizzarlo per ridurre l'importo del mutuo.
      </p>
      <h2 className="text-xl font-semibold mb-2">Esempio pratico</h2>
      <p className="mb-4">
        Investendo 50.000€ al 5% annuo invece di versarli come anticipo si possono ottenere oltre 65.000€ dopo 5 anni.
      </p>
      <h2 className="text-xl font-semibold mb-2">Link utili</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <a
            href="https://www.money.it/mutuo-o-investimento-quale-conviene"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            Mutuo o investimento, cosa conviene?
          </a>
        </li>
        <li>
          <a
            href="https://www.soldionline.it/guide/risparmio/investire-medio-lungo-termine"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            Guida all'investimento a medio-lungo termine
          </a>
        </li>
      </ul>
    </div>
  );
}
