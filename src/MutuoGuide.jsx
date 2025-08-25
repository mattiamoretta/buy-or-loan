import React from "react";

export default function MutuoGuide() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Guida al Mutuo</h1>
      <p className="mb-4">
        Un'introduzione ai mutui ipotecari, alle rate e alle principali voci di costo.
      </p>
      <h2 className="text-xl font-semibold mb-2">Esempio pratico</h2>
      <p className="mb-4">
        Per un mutuo di 200.000€ al 3% su 20 anni la rata mensile è circa 1.109€.
      </p>
      <h2 className="text-xl font-semibold mb-2">Link utili</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <a
            href="https://www.bancaditalia.it/compiti/vigilanza/linee-guida/guida-mutui/index.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            Guida ai mutui della Banca d'Italia
          </a>
        </li>
        <li>
          <a
            href="https://www.ilsole24ore.com/art/mutui-2024-come-scegliere-taeg-e-indici-riferimento-AEkkafLB"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            Articolo di approfondimento sui tassi
          </a>
        </li>
      </ul>
    </div>
  );
}
