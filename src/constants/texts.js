export const STEP_LABELS = {
  it: ["Scenari", "Mutuo", "Patrimonio", "Investimenti", "Energia", "Risultati"],
  en: ["Scenarios", "Mortgage", "Assets", "Investments", "Energy", "Results"],
};

export const STEP_DESCRIPTIONS = {
  it: [
    "Immagina i possibili scenari e scegli la durata perfetta per il tuo viaggio finanziario.",
    "Configura il tuo mutuo: i dettagli che ti porteranno alla casa dei tuoi sogni.",
    "Fotografa il tuo patrimonio iniziale, il punto di partenza per costruire il futuro.",
    "Definisci la strategia d'investimento per far crescere i tuoi risparmi.",
    "Valuta interventi energetici come pannelli solari e caldaia.",
    "Scopri i risultati: l'epilogo del tuo percorso tra mutuo e investimenti.",
  ],
  en: [
    "Imagine possible scenarios and choose the perfect duration for your financial journey.",
    "Configure your mortgage: the details that lead you to your dream home.",
    "Capture your starting assets, the launch pad for building your future.",
    "Define your investment strategy to grow your savings.",
    "Evaluate energy improvements like solar panels and boiler.",
    "Explore the results: the conclusion of your path between loan and investments.",
  ],
};
export const UI_TEXTS = {
  it: {
    popup: { cancel: "Annulla", proceed: "Prosegui", ok: "OK" },
    configCard: { seeSteps: "Vedi step", results: "Risultati" },
    amortization: {
      heading: "Andamento mutuo",
      payoffNote: "La riga in verde indica la prima rata in cui i risparmi coprono il residuo del mutuo.",
      month: "Mese",
      interest: "Interessi",
      principal: "Capitale",
      balance: "Residuo",
      totalPrincipal: "Capitale tot.",
      savings: "Disp. potenziale"
    },
    recap: {
      heading: "Riepilogo dati",
      price: "Prezzo casa",
      downPayment: "Anticipo",
      annualRate: "TAN",
      scenarioDurations: "Durate scenari",
      initialCapital: "Capitale iniziale",
      monthlyContribution: "Disponibilità mensile",
      inflation: "Inflazione",
      grossReturn: "Rendimento lordo",
      taxRate: "Tasse rendimenti",
      investInitial: "Investi capitale iniziale",
      investMonthly: "Investi disponibilità mensile",
      minimumGain: "Soglia guadagno minimo",
      salary: "Stipendio netto annuo",
      yes: "Sì",
      no: "No"
    },
    step1: {
      heading: "Scenari",
      subheading: "Durata del mutuo e dell'investimento",
      addScenario: "Aggiungi scenario",
      durationLabel: "Durata scenario {n} (anni)",
      durationDesc: "Durata del confronto {n}"
    },
    step2: {
      mortgageValues: "Valori del mutuo",
      priceLabel: "Importo considerato (€)",
      priceDesc: "Prezzo dell'immobile da finanziare",
      tanLabel: "TAN (%)",
      tanDesc: "Tasso annuo nominale del mutuo"
    },
    navigation: { back: "Indietro", restart: "Ricomincia", next: "Avanti", viewResults: "Vedi risultati", export: "Esporta / Salva PDF" },
    landing: {
      mortgage: "Mutuo",
      investment: "Investimento",
      mortgageVsCash: "Mutuo vs pagamento",
      tagline: "Simula e confronta mutuo e investimento per trovare la strategia migliore.",
      start: "Inizia",
      chooseExample: "Oppure scegli un esempio",
    },
    messages: {
      noLoan: "L'importo del mutuo è 0; i risultati mostreranno solo l'investimento.",
      noInvestment: "Nessun investimento sarà applicato; i risultati mostreranno solo l'evoluzione del mutuo.",
    }
  },
  en: {
    popup: { cancel: "Cancel", proceed: "Continue", ok: "OK" },
    configCard: { seeSteps: "See steps", results: "Results" },
    amortization: {
      heading: "Mortgage trend",
      payoffNote: "The green row indicates the first payment where savings cover the remaining mortgage.",
      month: "Month",
      interest: "Interest",
      principal: "Principal",
      balance: "Balance",
      totalPrincipal: "Total principal",
      savings: "Potential avail."
    },
    recap: {
      heading: "Data summary",
      price: "House price",
      downPayment: "Down payment",
      annualRate: "APR",
      scenarioDurations: "Scenario durations",
      initialCapital: "Initial capital",
      monthlyContribution: "Monthly contribution",
      inflation: "Inflation",
      grossReturn: "Gross return",
      taxRate: "Return taxes",
      investInitial: "Invest initial capital",
      investMonthly: "Invest monthly availability",
      minimumGain: "Minimum gain threshold",
      salary: "Net annual salary",
      yes: "Yes",
      no: "No"
    },
    step1: {
      heading: "Scenarios",
      subheading: "Mortgage and investment duration",
      addScenario: "Add scenario",
      durationLabel: "Scenario duration {n} (years)",
      durationDesc: "Comparison duration {n}"
    },
    step2: {
      mortgageValues: "Mortgage values",
      priceLabel: "Considered amount (€)",
      priceDesc: "Price of the property to finance",
      tanLabel: "APR (%)",
      tanDesc: "Annual nominal rate of the loan"
    },
    navigation: { back: "Back", restart: "Restart", next: "Next", viewResults: "See results", export: "Export / Save PDF" },
    landing: {
      mortgage: "Mortgage",
      investment: "Investment",
      mortgageVsCash: "Mortgage vs cash",
      tagline: "Simulate and compare mortgage and investment to find the best strategy.",
      start: "Start",
      chooseExample: "Or pick an example",
    },
    messages: {
      noLoan: "The mortgage amount is 0; results will show only the investment.",
      noInvestment: "No investment will be applied; results will show only the mortgage evolution.",
    }
  }
};

export const CONFIG_TEXTS = {
  it: [
    {
      title: "Stai valutando un mutuo?",
      description: "Scopri l'andamento del debito. Es: mutuo €150k, anticipo 15% con durate 15-25 anni.",
      details: ["Mutuo €150k", "Anticipo 15%"],
    },
    {
      title: "Stai valutando un mutuo per chiuderlo anticipatamente?",
      description: "Valuta quando chiudere il mutuo risparmiando 300€ al mese senza investire. Durate 10-20-30 anni.",
      details: ["Mutuo €150k", "Anticipo 15%", "Risparmi 300€/mese"],
    },
    {
      title: "Stai valutando un mutuo per chiuderlo anticipatamente, investendo nel mentre i risparmi accumulati?",
      description: "Valuta quando chiudere il mutuo investendo 300€ al mese con rendimenti attesi del 5%. Durate 15-25-35 anni.",
      details: ["Mutuo €150k", "Anticipo 15%", "Investi 300€/mese", "Rendimento atteso 5%"],
    },
    {
      title: "Stai valutando un investimento?",
      description: "Simula un investimento senza mutuo: €10k iniziali e 300€/mese per 20 anni.",
      details: ["Capitale iniziale €10k", "Versamento 300€/mese"],
    },
    {
      title: "Stai valutando se accendere un mutuo avendo già il capitale necessario?",
      description: "Hai €150k disponibili: meglio pagare cash o accendere un mutuo e investirli? Confronta durate 20 e 40 anni.",
      details: ["Mutuo €150k", "Anticipo 0%", "Capitale investito €150k", "Rendimento atteso 5%"],
    },
  ],
  en: [
    {
      title: "Are you considering a mortgage?",
      description: "Discover debt progression. E.g., €150k mortgage, 15% down payment with 15-25 year terms.",
      details: ["€150k mortgage", "15% down payment"],
    },
    {
      title: "Thinking about paying off your mortgage early?",
      description: "Evaluate when to close the mortgage by saving €300 per month without investing. Terms 10-20-30 years.",
      details: ["€150k mortgage", "15% down payment", "Save €300/month"],
    },
    {
      title: "Considering early payoff while investing saved money?",
      description: "Assess when to close the mortgage while investing €300 per month with 5% expected returns. Terms 15-25-35 years.",
      details: ["€150k mortgage", "15% down payment", "Invest €300/month", "Expected return 5%"],
    },
    {
      title: "Considering an investment?",
      description: "Simulate an investment without a mortgage: €10k initial and €300/month for 20 years.",
      details: ["Initial capital €10k", "Contribution €300/month"],
    },
    {
      title: "Considering a mortgage even if you already have the capital?",
      description: "You have €150k available: better to pay cash or take a mortgage and invest? Compare 20 and 40 year terms.",
      details: ["€150k mortgage", "0% down payment", "€150k invested capital", "Expected return 5%"],
    },
  ],
};
