'use client';

import { useState, useEffect } from 'react';

const formatNumber = (num: number) => {
  return num.toLocaleString();
};

const parseNumber = (str: string) => {
  const val = str.replace(/,/g, '');
  return isNaN(Number(val)) ? 0 : Number(val);
};

export default function SmartCalculator() {
  const [activeTab, setActiveTab] = useState<'transfer' | 'mortgage'>('transfer');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('transfer')}
          className={`flex-1 py-4 text-sm font-medium text-center transition-colors ${
            activeTab === 'transfer'
              ? 'bg-white text-[#496f5d] border-b-2 border-[#496f5d]'
              : 'bg-gray-50 text-gray-500 hover:text-gray-700'
          }`}
        >
          🏛️ Transfer Fees
        </button>
        <button
          onClick={() => setActiveTab('mortgage')}
          className={`flex-1 py-4 text-sm font-medium text-center transition-colors ${
            activeTab === 'mortgage'
              ? 'bg-white text-[#496f5d] border-b-2 border-[#496f5d]'
              : 'bg-gray-50 text-gray-500 hover:text-gray-700'
          }`}
        >
          🏠 Mortgage Calculator
        </button>
      </div>

      <div className="p-6">
        {activeTab === 'transfer' ? <TransferFeeCalculator /> : <MortgageCalculator />}
      </div>
    </div>
  );
}

function TransferFeeCalculator() {
  const [price, setPrice] = useState<number>(5000000);
  const [appraisedValue, setAppraisedValue] = useState<number>(5000000);
  const [sellerType, setSellerType] = useState<'individual' | 'company'>('individual');
  const [yearsOwned, setYearsOwned] = useState<number>(1);
  const [inTabienBaan, setInTabienBaan] = useState<boolean>(false);

  const [results, setResults] = useState({
    transferFee: 0,
    sbt: 0,
    stampDuty: 0,
    wht: 0,
    total: 0,
  });

  useEffect(() => {
    const calculateFees = () => {
      // 1. Transfer Fee: 2% of Appraised Value
      // (Note: Using 2% as standard, ignoring temporary 1% for simplicity unless requested)
      const transferFee = appraisedValue * 0.02;

      // 2. Specific Business Tax (SBT) or Stamp Duty
      let sbt = 0;
      let stampDuty = 0;
      const baseValue = Math.max(price, appraisedValue);

      // SBT applies if owned < 5 years AND not in Tabien Baan for > 1 year
      // OR if seller is a company (Companies always pay SBT usually? No, companies pay SBT if it's their business, otherwise Stamp Duty? 
      // Actually, companies usually pay SBT (3.3%) on sale of real estate.)
      
      let paysSBT = false;
      if (sellerType === 'company') {
        paysSBT = true; // Simplified: Companies usually pay SBT
      } else {
        if (yearsOwned < 5 && !inTabienBaan) {
          paysSBT = true;
        }
      }

      if (paysSBT) {
        sbt = baseValue * 0.033;
      } else {
        stampDuty = baseValue * 0.005;
      }

      // 3. Withholding Tax (WHT)
      let wht = 0;
      if (sellerType === 'company') {
        wht = baseValue * 0.01;
      } else {
        // Individual WHT Calculation
        // Step 1: Deduction
        let deductionRate = 0.50; // Default 8+ years
        if (yearsOwned === 1) deductionRate = 0.92;
        else if (yearsOwned === 2) deductionRate = 0.84;
        else if (yearsOwned === 3) deductionRate = 0.77;
        else if (yearsOwned === 4) deductionRate = 0.71;
        else if (yearsOwned === 5) deductionRate = 0.65;
        else if (yearsOwned === 6) deductionRate = 0.60;
        else if (yearsOwned === 7) deductionRate = 0.55;

        const assessableValue = appraisedValue - (appraisedValue * deductionRate);
        const incomePerYear = assessableValue / yearsOwned;

        // Step 2: Progressive Tax on Income Per Year
        const calculateTax = (income: number) => {
          let tax = 0;
          // 0 - 150,000: Exempt (Standard PIT)
          // However, for property WHT, often the first bracket is taxed. 
          // Let's use the standard PIT brackets for estimation.
          
          if (income > 5000000) { tax += (income - 5000000) * 0.35; income = 5000000; }
          if (income > 2000000) { tax += (income - 2000000) * 0.30; income = 2000000; }
          if (income > 1000000) { tax += (income - 1000000) * 0.25; income = 1000000; }
          if (income > 750000) { tax += (income - 750000) * 0.20; income = 750000; }
          if (income > 500000) { tax += (income - 500000) * 0.15; income = 500000; }
          if (income > 300000) { tax += (income - 300000) * 0.10; income = 300000; }
          if (income > 150000) { tax += (income - 150000) * 0.05; income = 150000; }
          // 0-150k is 0
          return tax;
        };

        const taxPerYear = calculateTax(incomePerYear);
        wht = taxPerYear * yearsOwned;
      }

      setResults({
        transferFee,
        sbt,
        stampDuty,
        wht,
        total: transferFee + sbt + stampDuty + wht
      });
    };

    calculateFees();
  }, [price, appraisedValue, sellerType, yearsOwned, inTabienBaan]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price (THB)</label>
          <input
            type="text"
            value={formatNumber(price)}
            onChange={(e) => setPrice(parseNumber(e.target.value))}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#496f5d] text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Appraised Value (THB)</label>
          <input
            type="text"
            value={formatNumber(appraisedValue)}
            onChange={(e) => setAppraisedValue(parseNumber(e.target.value))}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#496f5d] text-gray-900"
          />
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-gray-500">Government assessed value. Used for Transfer Fee & WHT.</p>
            <a
              href="https://assessprice.treasury.go.th/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#496f5d] hover:text-[#3d5c4d] font-medium hover:underline flex items-center gap-1 whitespace-nowrap"
            >
              Check Appraisal Value
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Seller Type</label>
          <select
            value={sellerType}
            onChange={(e) => setSellerType(e.target.value as any)}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#496f5d] text-gray-900"
          >
            <option value="individual">Individual Person</option>
            <option value="company">Company (Juristic Person)</option>
          </select>
        </div>
        
        {sellerType === 'individual' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Years of Ownership</label>
              <input
                type="number"
                min="1"
                max="50"
                value={yearsOwned}
                onChange={(e) => setYearsOwned(Number(e.target.value))}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#496f5d] text-gray-900"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="tabien"
                checked={inTabienBaan}
                onChange={(e) => setInTabienBaan(e.target.checked)}
                className="rounded text-[#496f5d] focus:ring-[#496f5d] mr-2"
              />
              <label htmlFor="tabien" className="text-sm text-gray-700">
                Seller in Tabien Baan (House Registration) for &gt; 1 year?
              </label>
            </div>
          </>
        )}
      </div>

      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Estimated Costs</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Transfer Fee (2%)</span>
            <span className="font-medium text-gray-900">฿{results.transferFee.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
          </div>
          
          {results.sbt > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Specific Business Tax (3.3%)</span>
              <span className="font-medium text-gray-900">฿{results.sbt.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
            </div>
          )}
          
          {results.stampDuty > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Stamp Duty (0.5%)</span>
              <span className="font-medium text-gray-900">฿{results.stampDuty.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span className="text-gray-600">Withholding Tax (WHT)</span>
            <span className="font-medium text-gray-900">฿{results.wht.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
          </div>
          
          <div className="pt-4 border-t border-gray-200 mt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-gray-800">Total Fees</span>
              <span className="text-xl font-bold text-[#496f5d]">฿{results.total.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-right">
              *Estimates only. Actual fees determined by Land Department.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MortgageCalculator() {
  const [price, setPrice] = useState<number>(5000000);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [interestRate, setInterestRate] = useState<number>(5.5);
  const [loanTerm, setLoanTerm] = useState<number>(30);

  const downPaymentAmount = price * (downPaymentPercent / 100);
  const loanAmount = price - downPaymentAmount;

  // Monthly Payment Calculation (M = P [ i(1 + i)^n ] / [ (1 + i)^n – 1 ])
  const calculateMonthlyPayment = () => {
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;
    
    if (interestRate === 0) return loanAmount / numberOfPayments;

    return (
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
    );
  };

  const monthlyPayment = calculateMonthlyPayment();
  const totalPayment = monthlyPayment * loanTerm * 12;
  const totalInterest = totalPayment - loanAmount;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Property Price (THB)</label>
          <input
            type="text"
            value={formatNumber(price)}
            onChange={(e) => setPrice(parseNumber(e.target.value))}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#496f5d] text-gray-900"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Down Payment (%)</label>
          <div className="flex gap-4">
            <input
              type="range"
              min="0"
              max="100"
              value={downPaymentPercent}
              onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
              className="flex-1"
            />
            <input
              type="number"
              value={downPaymentPercent}
              onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
              className="w-20 p-2 border rounded-lg focus:ring-2 focus:ring-[#496f5d] text-gray-900"
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">Amount: ฿{downPaymentAmount.toLocaleString()}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Interest Rate (%)</label>
          <input
            type="number"
            step="0.1"
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value))}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#496f5d] text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Loan Term (Years)</label>
          <input
            type="number"
            value={loanTerm}
            onChange={(e) => setLoanTerm(Number(e.target.value))}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#496f5d] text-gray-900"
          />
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Repayment Summary</h3>
        
        <div className="space-y-4">
          <div className="text-center p-4 bg-white rounded-lg shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm mb-1">Monthly Payment</p>
            <p className="text-3xl font-bold text-[#496f5d]">฿{monthlyPayment.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Loan Amount</span>
              <span className="font-medium text-gray-900">฿{loanAmount.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Interest</span>
              <span className="font-medium text-gray-900">฿{totalInterest.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t">
              <span className="text-gray-800 font-medium">Total Payment</span>
              <span className="font-bold">฿{totalPayment.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
