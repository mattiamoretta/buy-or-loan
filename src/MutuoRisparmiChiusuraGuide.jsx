import React from "react";

export default function MutuoRisparmiChiusuraGuide() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Mutuo, Risparmi e Chiusura Anticipata</h1>
      <p className="mb-4">
        Questa pagina spiega come accumulare risparmi durante il mutuo e valutarne la chiusura anticipata.
      </p>
      <h2 className="text-xl font-semibold mb-2">Esempio pratico</h2>
      <p className="mb-4">
        Con un risparmio extra di 200€ al mese puoi ridurre la durata del mutuo ventennale di diversi anni.
      </p>
      <h2 className="text-xl font-semibold mb-2">Link utili</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <a
            href="https://www.altroconsumo.it/soldi/mutuo/consigli/mutuo-estinzione-anticipata"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            Consigli sull'estinzione anticipata del mutuo
          </a>
        </li>
        <li>
          <a
            href="https://www.ilmutuoblog.it/2019/10/come-estinguere-mutuo-anticipatamente.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            Come estinguere un mutuo in anticipo
          </a>
        </li>
      </ul>
    </div>
  );
}
