const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const reps = [
  ['bg-slate-50', 'bg-[#F2E8DF]'],
  ['text-slate-800', 'text-[#4A525A]'],
  ['text-slate-700', 'text-[#5A5A40]'],
  ['text-slate-600', 'text-[#7C8578]'],
  ['text-slate-500', 'text-[#828E7D]'],
  ['text-slate-400', 'text-[#8C7A6B]'],
  ['border-slate-100', 'border-[#E5DACE]'],
  ['border-slate-200', 'border-[#E5DACE]'],
  ['border-slate-300', 'border-[#E5DACE]'],
  ['shadow-slate-200', 'shadow-[#E5DACE]'],
  ['bg-slate-100', 'bg-[#E5DACE]'],
  ['bg-slate-300', 'bg-[#E5DACE]'],
  ['hover:bg-slate-200', 'hover:bg-[#C97D60] hover:text-white'],
  ['bg-white', 'bg-[#FDFBF7]'],

  ['bg-indigo-600', 'bg-[#5A5A40]'],
  ['hover:bg-indigo-700', 'hover:bg-[#4a4a35]'],
  ['text-indigo-600', 'text-[#5A5A40]'],
  ['text-indigo-500', 'text-[#828E7D]'],
  ['hover:text-indigo-800', 'hover:text-[#4a4a35]'],
  ['text-indigo-800', 'text-[#4a4a35]'],
  ['text-indigo-900', 'text-[#4a4a35]'],
  ['border-indigo-400/50', 'border-[#E5DACE]'],
  ['border-indigo-400', 'border-[#828E7D]'],
  ['border-indigo-300', 'border-[#E5DACE]'],
  ['border-indigo-600', 'border-[#5A5A40]'],
  ['ring-indigo-100', 'ring-[#E5DACE]'],
  ['ring-indigo-500', 'ring-[#828E7D]'],
  ['bg-indigo-50/30', 'bg-[#F9F4F0]'],
  ['bg-indigo-50', 'bg-[#F9F4F0]'],
  ['bg-indigo-100', 'bg-[#E5DACE]'],
  ['shadow-indigo-200', 'shadow-[#5a5a4033]'],
  ['text-indigo-200', 'text-[#828E7D]'],
  ['hover:bg-indigo-100', 'hover:bg-[#E5DACE]'],

  ['bg-pink-600', 'bg-[#C97D60]'],
  ['hover:bg-pink-700', 'hover:bg-[#A86146]'],
  ['text-pink-600', 'text-[#C97D60]'],
  ['text-pink-500', 'text-[#C97D60]'],
  ['border-pink-400', 'border-[#C97D60]'],
  ['border-pink-300', 'border-[#C97D60]'],
  ['border-pink-600', 'border-[#C97D60]'],
  ['ring-pink-500', 'ring-[#C97D60]'],
  ['ring-pink-100', 'ring-[#E5DACE]'],
  ['bg-pink-50/30', 'bg-[#F9F4F0]'],
  ['bg-pink-50', 'bg-[#F9F4F0]'],
  ['border-pink-100', 'border-[#E5DACE]'],
  ['shadow-pink-200', 'shadow-[#c97d6033]'],

  ['text-orange-700', 'text-[#C97D60]'],
  ['text-orange-600', 'text-[#C97D60]'],
  ['bg-orange-50', 'bg-[#FDFBF7]'],
  ['bg-orange-100', 'bg-[#F9F4F0]'],
  ['border-orange-500', 'border-[#C97D60]'],

  ['text-blue-700', 'text-[#4A525A]'],
  ['text-blue-600', 'text-[#5A5A40]'],
  ['bg-blue-50', 'bg-[#FDFBF7]'],
  ['bg-blue-100', 'bg-[#F9F4F0]'],
  ['border-blue-500', 'border-[#5A5A40]'],
  ['hover:text-blue-800', 'hover:text-[#4a4a35]'],
  ['hover:bg-blue-100', 'hover:bg-[#E5DACE]'],

  ['text-green-600', 'text-[#828E7D]'],
  ['text-green-700', 'text-[#5A5A40]'],
  ['bg-green-50', 'bg-[#F9F4F0]'],
  ['bg-green-500', 'bg-[#828E7D]'],
  ['border-green-100', 'border-[#E5DACE]'],

  ['text-red-500', 'text-[#C97D60]'],
  ['text-red-600', 'text-[#C97D60]'],
  ['text-red-400', 'text-[#E5DACE]'],
  ['text-red-700', 'text-[#A86146]'],
  ['bg-red-50', 'bg-[#FDFBF7]'],
  ['bg-red-100', 'bg-[#F9F4F0]'],
  ['hover:text-red-600', 'hover:text-[#C97D60]'],
  ['hover:bg-red-100', 'hover:bg-[#E5DACE]'],
  ['border-red-100', 'border-[#E5DACE]'],

  ['shadow-sm', ''],
  ['rounded-2xl', 'rounded-[32px]'],
  ['rounded-xl', 'rounded-[16px]'],

  // App specific layout touches based on layout pattern instruction
  // The header in the app is sticky, Let's adjust header styling 
  ['<header className="bg-[#5A5A40] text-white shadow-md sticky top-0 z-20">', '<header className="bg-[#F2E8DF] text-[#4A525A] sticky top-0 z-20 pb-4">'],
  ['border-[#E5DACE] text-center', 'border-[#E5DACE] text-center uppercase tracking-widest text-sm'],
  // Change "border-white text-white" in header active tab
  ['border-white text-white', 'border-[#C97D60] text-[#C97D60]'],
  ['text-white', 'text-[#F2E8DF]'], // Some text white maps to F2E8DF (button text etc)
  ['text-[#F2E8DF] hidden peer-checked:block', 'text-white hidden peer-checked:block'],
  ['text-[#5A5A40] px-6 py-3', 'bg-[#5A5A40] text-[#F2E8DF] px-8 py-4'], // buttons
  ['<h1 className="text-xl font-bold tracking-wide">', '<h1 className="text-xl font-serif italic tracking-wide text-[#5A5A40]">']
];

for (const [from, to] of reps) {
  code = code.split(from).join(to);
}

fs.writeFileSync('src/App.tsx', code);
