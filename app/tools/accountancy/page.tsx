"use client";

import { useMemo, useState } from "react";

type ClassMode = "XI" | "XII";
type Lab =
  | "overview"
  | "equation"
  | "journal"
  | "ledger"
  | "brs"
  | "depreciation"
  | "trial"
  | "statements"
  | "errors"
  | "partnership"
  | "goodwill"
  | "shares"
  | "ratios"
  | "cashflow"
  | "cas";

const money = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(n) ? n : 0);

const num = (v: string) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const XI_LABS: { id: Lab; title: string; description: string; tag: string }[] = [
  { id: "equation", title: "Accounting Equation", description: "See every transaction preserve Assets = Liabilities + Capital.", tag: "CORE" },
  { id: "journal", title: "Journal Builder", description: "Build debit-credit entries with GST, discounts and narration.", tag: "CORE" },
  { id: "ledger", title: "Ledger Lab", description: "Trace transactions from the journal into account balances.", tag: "CORE" },
  { id: "brs", title: "Bank Reconciliation", description: "Reconcile cash-book and bank-statement balances.", tag: "CORE" },
  { id: "depreciation", title: "Depreciation", description: "Compare SLM and WDV and model asset disposal.", tag: "CORE" },
  { id: "trial", title: "Trial Balance", description: "Construct and test a balance-method trial balance.", tag: "CORE" },
  { id: "statements", title: "Financial Statements", description: "Move from trial balance and adjustments to P&L and Balance Sheet.", tag: "CORE" },
  { id: "errors", title: "Error Detection", description: "Identify, classify and rectify accounting errors.", tag: "HOTS" },
];

const XII_LABS: { id: Lab; title: string; description: string; tag: string }[] = [
  { id: "partnership", title: "Partnership Lab", description: "Profit appropriation, ratios, capital and reconstitution.", tag: "CORE" },
  { id: "goodwill", title: "Goodwill Valuation", description: "Average profit, super profit and capitalisation methods.", tag: "CORE" },
  { id: "shares", title: "Share Capital", description: "Issue, calls, forfeiture and reissue of shares.", tag: "CORE" },
  { id: "ratios", title: "Ratio Analysis", description: "Liquidity, solvency, activity and profitability ratios.", tag: "CORE" },
  { id: "cashflow", title: "Cash Flow Statement", description: "Indirect-method AS 3 operating, investing and financing flows.", tag: "CORE" },
  { id: "statements", title: "Company Statements", description: "Work with comparative and common-size statements.", tag: "CORE" },
  { id: "cas", title: "Computerised Accounting", description: "Explore chart of accounts, validation, spreadsheets and CAS.", tag: "ICT" },
];

const ACCOUNTING_TERMS = [
  ["Asset", "A resource controlled by the entity from which future economic benefits are expected."],
  ["Liability", "A present obligation arising from past events."],
  ["Capital", "Owner's claim in the business after liabilities are considered."],
  ["Drawings", "Withdrawals by the owner for personal use."],
  ["Revenue", "Income arising from the ordinary activities of the business."],
  ["Expense", "Cost incurred to earn revenue during an accounting period."],
  ["Trade Discount", "Reduction in list price, normally not recorded separately in the books."],
  ["Cash Discount", "Discount allowed or received for prompt payment, recorded in the books."],
  ["Accrual Basis", "Transactions are recognised when they arise, not merely when cash moves."],
  ["Going Concern", "The entity is assumed to continue operating for the foreseeable future."],
];

function SectionTitle({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text?: string;
}) {
  return (
    <div className="mb-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700">{eyebrow}</p>
      <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">{title}</h2>
      {text && <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">{text}</p>}
    </div>
  );
}

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>{children}</div>;
}

function Field({
  label,
  value,
  onChange,
  type = "number",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold text-slate-600">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold text-slate-600">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
      >
        {options.map((x) => <option key={x}>{x}</option>)}
      </select>
    </label>
  );
}

function EquationLab() {
  const [cash, setCash] = useState("100000");
  const [furniture, setFurniture] = useState("20000");
  const [loan, setLoan] = useState("30000");
  const [drawings, setDrawings] = useState("5000");
  const [profit, setProfit] = useState("12000");
  const assets = num(cash) + num(furniture);
  const liabilities = num(loan);
  const capital = assets - liabilities;
  const adjustedCapital = capital + num(profit) - num(drawings);
  const balanced = Math.abs(assets - (liabilities + capital)) < 0.01;

  return (
    <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <Card className="p-5">
        <SectionTitle eyebrow="Accounting Equation" title="Build the balance" text="Change the inputs and observe the dual-aspect relationship." />
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Cash" value={cash} onChange={setCash} />
          <Field label="Furniture" value={furniture} onChange={setFurniture} />
          <Field label="Loan / liabilities" value={loan} onChange={setLoan} />
          <Field label="Profit" value={profit} onChange={setProfit} />
          <Field label="Drawings" value={drawings} onChange={setDrawings} />
        </div>
        <div className="mt-5 rounded-xl bg-slate-950 p-4 text-white">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Adjusted owner&apos;s capital</span><span>{money(adjustedCapital)}</span>
          </div>
          <div className="mt-2 text-lg font-bold">
            Assets = Liabilities + Capital
          </div>
          <div className="mt-2 text-sm font-mono">
            {money(assets)} = {money(liabilities)} + {money(capital)}
          </div>
        </div>
      </Card>
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Live effect</p>
            <h3 className="mt-1 text-lg font-bold text-slate-950">Statement of position</h3>
          </div>
          <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${balanced ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
            {balanced ? "BALANCED" : "CHECK INPUTS"}
          </span>
        </div>
        <div className="mt-6 space-y-3">
          {[
            ["Assets", assets],
            ["Liabilities", liabilities],
            ["Capital before profit/drawings", capital],
            ["Capital after profit/drawings", adjustedCapital],
          ].map(([label, value]) => (
            <div key={label as string} className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-sm text-slate-600">{label}</span>
              <span className="font-semibold text-slate-950">{money(value as number)}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-xl bg-blue-50 p-4 text-sm leading-6 text-blue-950">
          Profit increases capital; drawings decrease it. Every transaction has a corresponding effect somewhere in the accounting equation.
        </div>
      </Card>
    </div>
  );
}

function JournalLab() {
  const [amount, setAmount] = useState("10000");
  const [gst, setGst] = useState("18");
  const [discount, setDiscount] = useState("0");
  const [kind, setKind] = useState("Credit purchase");
  const tax = num(amount) * num(gst) / 100;
  const gross = num(amount) + tax;
  const discountValue = gross * num(discount) / 100;
  const net = gross - discountValue;
  const rows =
    kind === "Cash sale"
      ? [["Cash / Bank A/c", net, "Dr."], ["Sales A/c", num(amount), "Cr."], ["Output GST A/c", tax, "Cr."]]
      : kind === "Credit purchase"
        ? [["Purchases A/c", num(amount), "Dr."], ["Input GST A/c", tax, "Dr."], ["Creditor A/c", net, "Cr."]]
        : [["Expense A/c", num(amount), "Dr."], ["Input GST A/c", tax, "Dr."], ["Cash / Bank A/c", net, "Cr."]];

  return (
    <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
      <Card className="p-5">
        <SectionTitle eyebrow="Books of Original Entry" title="Journal entry builder" text="A compact transaction engine for simple CBSE XI-style entries." />
        <div className="space-y-3">
          <Select label="Transaction type" value={kind} onChange={setKind} options={["Credit purchase", "Cash sale", "Business expense"]} />
          <Field label="Base amount" value={amount} onChange={setAmount} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="GST rate %" value={gst} onChange={setGst} />
            <Field label="Discount %" value={discount} onChange={setDiscount} />
          </div>
        </div>
      </Card>
      <Card className="overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Journal</p>
          <h3 className="mt-1 text-lg font-bold text-slate-950">Generated entry</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white text-left text-[11px] uppercase tracking-wide text-slate-400">
              <tr><th className="px-5 py-3">Account</th><th className="px-5 py-3">Debit</th><th className="px-5 py-3">Credit</th></tr>
            </thead>
            <tbody>
              {rows.map(([name, value, side]) => (
                <tr key={name as string} className="border-t border-slate-100">
                  <td className="px-5 py-4 font-medium text-slate-800">{name}</td>
                  <td className="px-5 py-4 font-mono">{side === "Dr." ? money(value as number) : "—"}</td>
                  <td className="px-5 py-4 font-mono">{side === "Cr." ? money(value as number) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-200 px-5 py-4 text-xs text-slate-500">
          Net consideration after the entered discount: <strong className="text-slate-800">{money(net)}</strong>. Trade discount is normally deducted before recording; cash discount is recorded separately when earned or allowed.
        </div>
      </Card>
    </div>
  );
}

function DepreciationLab() {
  const [cost, setCost] = useState("100000");
  const [residual, setResidual] = useState("10000");
  const [life, setLife] = useState("5");
  const [rate, setRate] = useState("20");
  const [method, setMethod] = useState("SLM");
  const years = Math.max(1, Math.floor(num(life)));
  const rows = Array.from({ length: years }, (_, i) => {
    const opening = i === 0 ? num(cost) : 0;
    if (method === "SLM") {
      const dep = (num(cost) - num(residual)) / years;
      return { year: i + 1, dep, closing: Math.max(num(residual), num(cost) - dep * (i + 1)) };
    }
    const openingWDV = i === 0 ? num(cost) : num(cost) * Math.pow(1 - num(rate) / 100, i);
    const dep = openingWDV * num(rate) / 100;
    return { year: i + 1, dep, closing: Math.max(num(residual), openingWDV - dep) };
  });

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-200 bg-slate-50 p-5">
        <SectionTitle eyebrow="Asset Accounting" title="Depreciation simulator" text="CBSE XI scope: Straight Line Method and Written Down Value Method. Change-of-method calculations are intentionally excluded." />
        <div className="grid gap-3 md:grid-cols-4">
          <Field label="Asset cost" value={cost} onChange={setCost} />
          <Field label="Residual value" value={residual} onChange={setResidual} />
          <Field label="Useful life (years)" value={life} onChange={setLife} />
          <Field label="WDV rate %" value={rate} onChange={setRate} />
        </div>
        <div className="mt-3 max-w-xs"><Select label="Method" value={method} onChange={setMethod} options={["SLM", "WDV"]} /></div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-white text-left text-[11px] uppercase tracking-wide text-slate-400">
            <tr><th className="px-5 py-3">Year</th><th className="px-5 py-3">Depreciation</th><th className="px-5 py-3">Closing book value</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => <tr key={r.year} className="border-t border-slate-100"><td className="px-5 py-4">{r.year}</td><td className="px-5 py-4 font-mono">{money(r.dep)}</td><td className="px-5 py-4 font-mono font-semibold">{money(r.closing)}</td></tr>)}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function BRSLab() {
  const [cashBook, setCashBook] = useState("50000");
  const [chequesIssued, setChequesIssued] = useState("7000");
  const [chequesDeposited, setChequesDeposited] = useState("4000");
  const [charges, setCharges] = useState("500");
  const [directCredit, setDirectCredit] = useState("2500");
  const adjusted = num(cashBook) - num(chequesIssued) + num(chequesDeposited) - num(charges) + num(directCredit);
  return (
    <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
      <Card className="p-5">
        <SectionTitle eyebrow="Reconciliation" title="Bank Reconciliation Statement" text="Start from the cash-book balance and apply common reconciling items." />
        <div className="space-y-3">
          <Field label="Balance as per cash book" value={cashBook} onChange={setCashBook} />
          <Field label="Cheques issued but not presented" value={chequesIssued} onChange={setChequesIssued} />
          <Field label="Cheques deposited but not cleared" value={chequesDeposited} onChange={setChequesDeposited} />
          <Field label="Bank charges" value={charges} onChange={setCharges} />
          <Field label="Direct credit by bank" value={directCredit} onChange={setDirectCredit} />
        </div>
      </Card>
      <Card className="p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Reconciliation trail</p>
        <div className="mt-4 space-y-2 font-mono text-sm">
          <div className="flex justify-between"><span>Cash-book balance</span><span>{money(num(cashBook))}</span></div>
          <div className="flex justify-between text-emerald-700"><span>+ Cheques issued, not presented</span><span>{money(num(chequesIssued))}</span></div>
          <div className="flex justify-between text-rose-700"><span>− Cheques deposited, not cleared</span><span>{money(num(chequesDeposited))}</span></div>
          <div className="flex justify-between text-rose-700"><span>− Bank charges</span><span>{money(num(charges))}</span></div>
          <div className="flex justify-between text-emerald-700"><span>+ Direct credit</span><span>{money(num(directCredit))}</span></div>
          <div className="mt-4 flex justify-between border-t border-slate-200 pt-4 text-base font-bold"><span>Adjusted bank balance</span><span>{money(adjusted)}</span></div>
        </div>
      </Card>
    </div>
  );
}

function RatioLab() {
  const [currentAssets, setCurrentAssets] = useState("180000");
  const [inventory, setInventory] = useState("60000");
  const [currentLiabilities, setCurrentLiabilities] = useState("100000");
  const [debt, setDebt] = useState("120000");
  const [equity, setEquity] = useState("180000");
  const [sales, setSales] = useState("500000");
  const [grossProfit, setGrossProfit] = useState("180000");
  const [netProfit, setNetProfit] = useState("80000");
  const [investment, setInvestment] = useState("300000");

  const current = num(currentAssets) / Math.max(1, num(currentLiabilities));
  const quick = (num(currentAssets) - num(inventory)) / Math.max(1, num(currentLiabilities));
  const de = num(debt) / Math.max(1, num(equity));
  const gp = num(grossProfit) / Math.max(1, num(sales)) * 100;
  const np = num(netProfit) / Math.max(1, num(sales)) * 100;
  const roi = num(netProfit) / Math.max(1, num(investment)) * 100;

  return (
    <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <Card className="p-5">
        <SectionTitle eyebrow="Financial Statement Analysis" title="Ratio analysis lab" text="Calculation is only half the job. The output also gives the meaning of each ratio." />
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Current assets" value={currentAssets} onChange={setCurrentAssets} />
          <Field label="Inventory" value={inventory} onChange={setInventory} />
          <Field label="Current liabilities" value={currentLiabilities} onChange={setCurrentLiabilities} />
          <Field label="Debt" value={debt} onChange={setDebt} />
          <Field label="Equity" value={equity} onChange={setEquity} />
          <Field label="Sales" value={sales} onChange={setSales} />
          <Field label="Gross profit" value={grossProfit} onChange={setGrossProfit} />
          <Field label="Net profit" value={netProfit} onChange={setNetProfit} />
          <Field label="Capital employed / investment" value={investment} onChange={setInvestment} />
        </div>
      </Card>
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          ["Current Ratio", `${current.toFixed(2)} : 1`, "Liquidity"],
          ["Quick Ratio", `${quick.toFixed(2)} : 1`, "Liquidity"],
          ["Debt–Equity Ratio", `${de.toFixed(2)} : 1`, "Solvency"],
          ["Gross Profit Ratio", `${gp.toFixed(2)}%`, "Profitability"],
          ["Net Profit Ratio", `${np.toFixed(2)}%`, "Profitability"],
          ["Return on Investment", `${roi.toFixed(2)}%`, "Profitability"],
        ].map(([name, value, group]) => (
          <Card key={name} className="p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">{group}</p>
            <p className="mt-2 text-sm font-semibold text-slate-700">{name}</p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">{value}</p>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              {name === "Current Ratio" && "Shows current assets available against each rupee of current liabilities."}
              {name === "Quick Ratio" && "Measures short-term liquidity after excluding inventory."}
              {name === "Debt–Equity Ratio" && "Shows the relative weight of borrowed funds and owners' funds."}
              {name === "Gross Profit Ratio" && "Shows gross profit generated from each ₹100 of revenue."}
              {name === "Net Profit Ratio" && "Shows net profit generated from each ₹100 of revenue."}
              {name === "Return on Investment" && "Shows the return generated on the capital employed."}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}

function PartnershipLab() {
  const [profit, setProfit] = useState("120000");
  const [aRatio, setARatio] = useState("3");
  const [bRatio, setBRatio] = useState("2");
  const [interestA, setInterestA] = useState("10000");
  const [interestB, setInterestB] = useState("8000");
  const [salaryA, setSalaryA] = useState("12000");
  const totalRatio = Math.max(1, num(aRatio) + num(bRatio));
  const divisible = num(profit) - num(interestA) - num(interestB) - num(salaryA);
  const aShare = divisible * num(aRatio) / totalRatio;
  const bShare = divisible * num(bRatio) / totalRatio;
  return (
    <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
      <Card className="p-5">
        <SectionTitle eyebrow="Partnership Accounts" title="Profit & Loss Appropriation" text="Model appropriation after partner-specific charges and before division in the agreed ratio." />
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Profit available" value={profit} onChange={setProfit} />
          <Field label="Partner A ratio" value={aRatio} onChange={setARatio} />
          <Field label="Partner B ratio" value={bRatio} onChange={setBRatio} />
          <Field label="Interest on A capital" value={interestA} onChange={setInterestA} />
          <Field label="Interest on B capital" value={interestB} onChange={setInterestB} />
          <Field label="A salary" value={salaryA} onChange={setSalaryA} />
        </div>
      </Card>
      <Card className="p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Appropriation account</p>
        <div className="mt-5 space-y-3">
          {[
            ["Profit available", num(profit)],
            ["Less: interest A", -num(interestA)],
            ["Less: interest B", -num(interestB)],
            ["Less: salary A", -num(salaryA)],
            ["Profit divisible", divisible],
            ["Partner A share", aShare],
            ["Partner B share", bShare],
          ].map(([name, value]) => (
            <div key={name as string} className="flex justify-between border-b border-slate-100 pb-2 text-sm">
              <span className="text-slate-600">{name}</span><span className="font-mono font-semibold">{money(value as number)}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function GoodwillLab() {
  const [p1, setP1] = useState("50000");
  const [p2, setP2] = useState("60000");
  const [p3, setP3] = useState("70000");
  const [normal, setNormal] = useState("50000");
  const [capital, setCapital] = useState("500000");
  const [years, setYears] = useState("3");
  const avg = (num(p1) + num(p2) + num(p3)) / 3;
  const superProfit = avg - num(normal);
  const averageGoodwill = avg * num(years);
  const superGoodwill = superProfit * num(years);
  const capitalised = Math.max(0, avg / Math.max(1, num(normal)) * num(capital) - num(capital));
  return (
    <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
      <Card className="p-5">
        <SectionTitle eyebrow="Goodwill" title="Valuation methods" text="Three syllabus methods, shown side by side." />
        <div className="grid gap-3">
          <Field label="Year 1 profit" value={p1} onChange={setP1} />
          <Field label="Year 2 profit" value={p2} onChange={setP2} />
          <Field label="Year 3 profit" value={p3} onChange={setP3} />
          <Field label="Normal profit" value={normal} onChange={setNormal} />
          <Field label="Capital employed" value={capital} onChange={setCapital} />
          <Field label="Years' purchase" value={years} onChange={setYears} />
        </div>
      </Card>
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ["Average Profit", averageGoodwill, "Average profit × years' purchase"],
          ["Super Profit", superGoodwill, "Super profit × years' purchase"],
          ["Capitalisation", capitalised, "Capitalised value of profit − capital employed"],
        ].map(([name, value, formula]) => (
          <Card key={name as string} className="p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-blue-700">{name}</p>
            <p className="mt-3 text-2xl font-bold text-slate-950">{money(value as number)}</p>
            <p className="mt-3 text-xs leading-5 text-slate-500">{formula}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

function TrialBalanceLab() {
  const [cash, setCash] = useState("20000");
  const [purchases, setPurchases] = useState("50000");
  const [capital, setCapital] = useState("70000");
  const [sales, setSales] = useState("50000");
  const [creditors, setCreditors] = useState("10000");
  const debit = num(cash) + num(purchases);
  const credit = num(capital) + num(sales) + num(creditors);
  return (
    <Card className="p-5">
      <SectionTitle eyebrow="Trial Balance" title="Balance-method checker" text="This compact model focuses on the CBSE XI scope: trial balance using the balance method." />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Field label="Cash (Dr.)" value={cash} onChange={setCash} />
        <Field label="Purchases (Dr.)" value={purchases} onChange={setPurchases} />
        <Field label="Capital (Cr.)" value={capital} onChange={setCapital} />
        <Field label="Sales (Cr.)" value={sales} onChange={setSales} />
        <Field label="Creditors (Cr.)" value={creditors} onChange={setCreditors} />
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Debit total</p><p className="mt-1 text-xl font-bold">{money(debit)}</p></div>
        <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Credit total</p><p className="mt-1 text-xl font-bold">{money(credit)}</p></div>
        <div className={`rounded-xl p-4 ${Math.abs(debit-credit)<0.01 ? "bg-emerald-50" : "bg-rose-50"}`}><p className="text-xs text-slate-500">Status</p><p className="mt-1 text-xl font-bold">{Math.abs(debit-credit)<0.01 ? "Agrees ✓" : `Difference ${money(Math.abs(debit-credit))}`}</p></div>
      </div>
    </Card>
  );
}

function ErrorLab() {
  const cases = [
    { title: "Furniture recorded as Purchases", type: "Error of principle", affectsTB: "No", fix: "Debit Furniture A/c; credit Purchases A/c." },
    { title: "A credit purchase omitted entirely", type: "Error of omission", affectsTB: "No", fix: "Record the omitted transaction in full." },
    { title: "Sales book overcast by ₹2,000", type: "Error of commission / casting", affectsTB: "Yes", fix: "Correct the excess credit through rectification / suspense as applicable." },
    { title: "₹5,000 due from Rohan posted to Mohan", type: "Error of commission", affectsTB: "No", fix: "Transfer the amount from Mohan's account to Rohan's account." },
  ];
  const [selected, setSelected] = useState(0);
  const item = cases[selected];
  return (
    <div className="grid gap-5 lg:grid-cols-[0.7fr_1.3fr]">
      <Card className="p-3">
        <p className="px-2 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Cases</p>
        {cases.map((x, i) => (
          <button key={x.title} onClick={() => setSelected(i)} className={`w-full rounded-xl p-3 text-left text-sm transition ${selected === i ? "bg-slate-950 text-white" : "hover:bg-slate-50 text-slate-700"}`}>
            {x.title}
          </button>
        ))}
      </Card>
      <Card className="p-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-rose-600">Rectification lab</p>
        <h3 className="mt-2 text-xl font-bold text-slate-950">{item.title}</h3>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Classification</p><p className="mt-1 font-semibold">{item.type}</p></div>
          <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Trial balance affected?</p><p className="mt-1 font-semibold">{item.affectsTB}</p></div>
        </div>
        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-950"><strong>Rectification:</strong> {item.fix}</div>
      </Card>
    </div>
  );
}

function CashFlowLab() {
  const [pbt, setPbt] = useState("100000");
  const [dep, setDep] = useState("20000");
  const [profitSale, setProfitSale] = useState("5000");
  const [receivables, setReceivables] = useState("8000");
  const [inventory, setInventory] = useState("-6000");
  const [payables, setPayables] = useState("4000");
  const operating = num(pbt) + num(dep) - num(profitSale) - num(receivables) - num(inventory) + num(payables);
  return (
    <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
      <Card className="p-5">
        <SectionTitle eyebrow="AS 3 · Indirect Method" title="Cash Flow Statement" text="A focused operating-activities model. Investing and financing rows can be layered on top of this core." />
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Profit before tax" value={pbt} onChange={setPbt} />
          <Field label="Depreciation" value={dep} onChange={setDep} />
          <Field label="Profit on sale of asset" value={profitSale} onChange={setProfitSale} />
          <Field label="Increase in receivables" value={receivables} onChange={setReceivables} />
          <Field label="Increase / decrease in inventory" value={inventory} onChange={setInventory} />
          <Field label="Increase in payables" value={payables} onChange={setPayables} />
        </div>
      </Card>
      <Card className="p-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Operating activities</p>
        <div className="mt-5 space-y-3 font-mono text-sm">
          <div className="flex justify-between"><span>Profit before tax</span><span>{money(num(pbt))}</span></div>
          <div className="flex justify-between"><span>+ Depreciation</span><span>{money(num(dep))}</span></div>
          <div className="flex justify-between"><span>− Profit on sale</span><span>{money(num(profitSale))}</span></div>
          <div className="flex justify-between"><span>− Increase in receivables</span><span>{money(num(receivables))}</span></div>
          <div className="flex justify-between"><span>− Increase / decrease in inventory</span><span>{money(num(inventory))}</span></div>
          <div className="flex justify-between"><span>+ Increase in payables</span><span>{money(num(payables))}</span></div>
          <div className="mt-4 flex justify-between border-t border-slate-200 pt-4 text-base font-bold"><span>Cash from operations*</span><span>{money(operating)}</span></div>
        </div>
        <p className="mt-4 text-[11px] leading-5 text-slate-400">*This is a teaching model and does not replace the full AS 3 treatment of all prescribed adjustments.</p>
      </Card>
    </div>
  );
}

function CASLab() {
  const [accounts, setAccounts] = useState<string[]>(["Cash", "Capital", "Sales", "Purchases"]);
  const [newAccount, setNewAccount] = useState("");
  const add = () => {
    const value = newAccount.trim();
    if (value && !accounts.includes(value)) setAccounts([...accounts, value]);
    setNewAccount("");
  };
  return (
    <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
      <Card className="p-5">
        <SectionTitle eyebrow="Computerised Accounting" title="Chart of accounts" text="A small model of account-head creation, codification and validation." />
        <div className="flex gap-2">
          <input value={newAccount} onChange={(e) => setNewAccount(e.target.value)} placeholder="New account head" className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500" />
          <button onClick={add} className="rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white">Add</button>
        </div>
      </Card>
      <Card className="p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Account master</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {accounts.map((x, i) => <div key={x} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm"><span>{x}</span><span className="font-mono text-xs text-slate-400">{String(1000+i).slice(-4)}</span></div>)}
        </div>
        <div className="mt-5 rounded-xl bg-blue-50 p-4 text-xs leading-5 text-blue-950">A full CAS workflow should proceed from account-head hierarchy → data entry → validation → verification → adjusting entries → statements → closing/opening entries.</div>
      </Card>
    </div>
  );
}

function Overview({ mode, setLab }: { mode: ClassMode; setLab: (l: Lab) => void }) {
  const labs = mode === "XI" ? XI_LABS : XII_LABS;
  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5 md:col-span-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700">Accounting laboratory</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
            {mode === "XI" ? "From transaction to financial statements." : "From partnership and companies to analysis."}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            {mode === "XI"
              ? "A syllabus-aligned workspace for the complete sole-proprietorship accounting cycle, including GST, reconciliation, depreciation, errors and adjustments."
              : "A syllabus-aligned workspace covering partnership firms, companies, financial statement analysis, cash flow and the computerised accounting system."}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">CBSE</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">055</p>
          <p className="mt-1 text-xs text-slate-500">Accountancy</p>
          <div className="mt-5 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">Designed around the supplied 2026–27 syllabus and its stated exclusions.</div>
        </Card>
      </div>

      <div className="mt-7">
        <SectionTitle eyebrow="Interactive tools" title={mode === "XI" ? "Class XI accounting cycle" : "Class XII accounting systems"} />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {labs.map((lab) => (
            <button key={lab.id} onClick={() => setLab(lab.id)} className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-bold tracking-[0.12em] text-slate-500">{lab.tag}</span>
                <span className="text-slate-300 transition group-hover:text-blue-600">↗</span>
              </div>
              <h3 className="mt-4 font-bold text-slate-950">{lab.title}</h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">{lab.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-7">
        <SectionTitle eyebrow="Reference" title="Core accounting language" />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {ACCOUNTING_TERMS.slice(0, mode === "XI" ? 10 : 5).map(([term, definition]) => (
            <Card key={term} className="p-4">
              <p className="text-sm font-bold text-slate-950">{term}</p>
              <p className="mt-2 text-xs leading-5 text-slate-500">{definition}</p>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}

export default function AccountancyPage() {
  const [mode, setMode] = useState<ClassMode>("XI");
  const [lab, setLab] = useState<Lab>("overview");

  const labs = useMemo(() => mode === "XI" ? XI_LABS : XII_LABS, [mode]);

  const changeMode = (m: ClassMode) => {
    setMode(m);
    setLab("overview");
  };

  const title = lab === "overview"
    ? mode === "XI" ? "Accountancy Workspace" : "Accountancy Workspace"
    : labs.find((x) => x.id === lab)?.title || "Accountancy";

  const renderLab = () => {
    switch (lab) {
      case "equation": return <EquationLab />;
      case "journal": return <JournalLab />;
      case "depreciation": return <DepreciationLab />;
      case "brs": return <BRSLab />;
      case "trial": return <TrialBalanceLab />;
      case "errors": return <ErrorLab />;
      case "partnership": return <PartnershipLab />;
      case "goodwill": return <GoodwillLab />;
      case "ratios": return <RatioLab />;
      case "cashflow": return <CashFlowLab />;
      case "cas": return <CASLab />;
      case "ledger":
        return <Card className="p-6"><SectionTitle eyebrow="Ledger" title="Ledger trace" text="Use the Journal Builder as the source and follow each account's posting and balance. The full shared transaction engine is the next expansion layer." /><div className="rounded-xl bg-slate-950 p-5 text-sm text-slate-200">Dr. Account → transaction posting → Cr. Account → balance c/d</div></Card>;
      case "statements":
        return <Card className="p-6"><SectionTitle eyebrow={mode === "XI" ? "Sole Proprietorship" : "Financial Statements"} title="Statement builder" text="The production version should connect trial balance, prescribed adjustments, Trading A/c, P&L and Balance Sheet through one transaction engine." /><div className="grid gap-3 md:grid-cols-5">{["Trial Balance", "Adjustments", "Trading A/c", "P&L A/c", "Balance Sheet"].map((x, i) => <div key={x} className="rounded-xl bg-slate-50 p-4 text-center text-xs font-semibold">{i + 1}. {x}</div>)}</div></Card>;
      case "shares":
        return <Card className="p-6"><SectionTitle eyebrow="Company Accounts" title="Share capital workspace" text="Issue at par/premium, subscription, calls, forfeiture and reissue belong in this module." /><div className="rounded-xl bg-blue-50 p-5 text-sm leading-6 text-blue-950">The architecture is prepared for a journal-driven share-capital engine, including disclosure of share capital in the Balance Sheet.</div></Card>;
      default: return <Overview mode={mode} setLab={setLab} />;
    }
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-700">VGB Academic Tools · Subject Code 055</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Accountancy</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">An interactive accounting workspace built around the CBSE Class XI–XII progression.</p>
            </div>
            <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1">
              {(["XI", "XII"] as ClassMode[]).map((m) => (
                <button key={m} onClick={() => changeMode(m)} className={`rounded-lg px-5 py-2 text-sm font-bold transition ${mode === m ? "bg-slate-950 text-white shadow-sm" : "text-slate-500 hover:text-slate-900"}`}>
                  Class {m}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <button onClick={() => setLab("overview")} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${lab === "overview" ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>Overview</button>
            {labs.slice(0, 5).map((x) => <button key={x.id} onClick={() => setLab(x.id)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${lab === x.id ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{x.title}</button>)}
          </div>
        </div>

        {lab !== "overview" && (
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Class {mode}</p>
              <h2 className="mt-1 text-xl font-bold text-slate-950">{title}</h2>
            </div>
            <button onClick={() => setLab("overview")} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">← All tools</button>
          </div>
        )}

        {renderLab()}

        <footer className="mt-10 border-t border-slate-200 py-6 text-[11px] text-slate-400">
          VGB Accountancy Lab · CBSE Accountancy 055 · 2026–27 · Interactive models are for learning and verification, not a substitute for prescribed formats and textbook practice.
        </footer>
      </div>
    </main>
  );
}
