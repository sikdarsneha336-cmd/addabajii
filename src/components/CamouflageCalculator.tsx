import React, { useState } from 'react';

interface CamouflageCalculatorProps {
  onClose: () => void;
}

export const CamouflageCalculator: React.FC<CamouflageCalculatorProps> = ({ onClose }) => {
  const [display, setDisplay] = useState('0');
  const [prev, setPrev] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [clearNext, setClearNext] = useState(false);

  const handleDigit = (d: string) => {
    if (display === '0' || clearNext) {
      setDisplay(d);
      setClearNext(false);
    } else {
      setDisplay(display + d);
    }
  };

  const handleOp = (operator: string) => {
    setPrev(parseFloat(display));
    setOp(operator);
    setClearNext(true);
  };

  const handleEquals = () => {
    if (op && prev !== null) {
      const current = parseFloat(display);
      let res = 0;
      if (op === '+') res = prev + current;
      if (op === '-') res = prev - current;
      if (op === '×') res = prev * current;
      if (op === '÷') res = current !== 0 ? prev / current : 0;
      setDisplay(String(res));
      setPrev(null);
      setOp(null);
      setClearNext(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPrev(null);
    setOp(null);
    setClearNext(false);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#faf7fd] text-[#241236] flex flex-col p-6 items-center justify-between select-none font-sans">
      <div className="w-full flex items-center justify-between max-w-xs mx-auto">
        <span className="text-xs text-purple-700 font-mono font-semibold">CALCULATOR v2.4</span>
        <button
          onClick={onClose}
          className="text-xs px-3 py-1.5 rounded-full bg-purple-100 text-purple-900 hover:bg-purple-200 transition-colors flex items-center gap-1 font-medium cursor-pointer border border-purple-200"
        >
          <span className="material-symbols-outlined text-[14px]">close</span>
          <span>Exit Camouflage</span>
        </button>
      </div>

      <div className="w-full max-w-xs flex flex-col gap-3">
        <div className="bg-white border border-purple-200 rounded-2xl p-4 text-right shadow-sm">
          <div className="text-purple-600 text-xs font-mono h-4">
            {prev !== null && `${prev} ${op || ''}`}
          </div>
          <div className="text-4xl font-light tracking-tight font-mono text-purple-950 overflow-x-auto whitespace-nowrap py-1">
            {display}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 text-lg font-medium">
          <button onClick={handleClear} className="h-14 rounded-xl bg-purple-100 text-pink-700 hover:bg-purple-200 font-bold cursor-pointer">AC</button>
          <button onClick={() => setDisplay(String(-parseFloat(display)))} className="h-14 rounded-xl bg-purple-100 text-purple-900 hover:bg-purple-200 cursor-pointer">±</button>
          <button onClick={() => setDisplay(String(parseFloat(display) / 100))} className="h-14 rounded-xl bg-purple-100 text-purple-900 hover:bg-purple-200 cursor-pointer">%</button>
          <button onClick={() => handleOp('÷')} className="h-14 rounded-xl bg-pink-600 text-white hover:bg-pink-700 font-bold cursor-pointer">÷</button>

          <button onClick={() => handleDigit('7')} className="h-14 rounded-xl bg-white border border-purple-100 text-purple-950 hover:bg-purple-50 shadow-sm cursor-pointer">7</button>
          <button onClick={() => handleDigit('8')} className="h-14 rounded-xl bg-white border border-purple-100 text-purple-950 hover:bg-purple-50 shadow-sm cursor-pointer">8</button>
          <button onClick={() => handleDigit('9')} className="h-14 rounded-xl bg-white border border-purple-100 text-purple-950 hover:bg-purple-50 shadow-sm cursor-pointer">9</button>
          <button onClick={() => handleOp('×')} className="h-14 rounded-xl bg-pink-600 text-white hover:bg-pink-700 font-bold cursor-pointer">×</button>

          <button onClick={() => handleDigit('4')} className="h-14 rounded-xl bg-white border border-purple-100 text-purple-950 hover:bg-purple-50 shadow-sm cursor-pointer">4</button>
          <button onClick={() => handleDigit('5')} className="h-14 rounded-xl bg-white border border-purple-100 text-purple-950 hover:bg-purple-50 shadow-sm cursor-pointer">5</button>
          <button onClick={() => handleDigit('6')} className="h-14 rounded-xl bg-white border border-purple-100 text-purple-950 hover:bg-purple-50 shadow-sm cursor-pointer">6</button>
          <button onClick={() => handleOp('-')} className="h-14 rounded-xl bg-pink-600 text-white hover:bg-pink-700 font-bold cursor-pointer">-</button>

          <button onClick={() => handleDigit('1')} className="h-14 rounded-xl bg-white border border-purple-100 text-purple-950 hover:bg-purple-50 shadow-sm cursor-pointer">1</button>
          <button onClick={() => handleDigit('2')} className="h-14 rounded-xl bg-white border border-purple-100 text-purple-950 hover:bg-purple-50 shadow-sm cursor-pointer">2</button>
          <button onClick={() => handleDigit('3')} className="h-14 rounded-xl bg-white border border-purple-100 text-purple-950 hover:bg-purple-50 shadow-sm cursor-pointer">3</button>
          <button onClick={() => handleOp('+')} className="h-14 rounded-xl bg-pink-600 text-white hover:bg-pink-700 font-bold cursor-pointer">+</button>

          <button onClick={() => handleDigit('0')} className="col-span-2 h-14 rounded-xl bg-white border border-purple-100 text-purple-950 hover:bg-purple-50 shadow-sm cursor-pointer pl-6 text-left">0</button>
          <button onClick={() => !display.includes('.') && setDisplay(display + '.')} className="h-14 rounded-xl bg-white border border-purple-100 text-purple-950 hover:bg-purple-50 shadow-sm cursor-pointer">.</button>
          <button onClick={handleEquals} className="h-14 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:opacity-90 font-bold shadow-md shadow-pink-600/25 cursor-pointer">=</button>
        </div>
      </div>

      <div className="text-center text-xs text-purple-600 font-mono">
        Double tap top right or enter code to reveal secure grid
      </div>
    </div>
  );
};
