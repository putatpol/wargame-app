import React from "react";

type RandomSectionProps = {
  randomCount: number;
  onChangeCount: (value: number) => void;
  onRandomTeamA: () => void;
  onRandomTeamB: () => void;
  onReset: () => void;
};

export default function RandomSection({
  randomCount,
  onChangeCount,
  onRandomTeamA,
  onRandomTeamB,
  onReset,
}: RandomSectionProps) {
  return (
    <div className="max-w-2xl mx-auto mb-8 bg-gray-800 border border-amber-500 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-amber-400 mb-4">สุ่มตัวละคร</h2>
      <div className="flex-1 min-w-37.5">
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          จำนวนตัวละครต่อทีม
        </label>
        <input
          type="number"
          min="1"
          max="10"
          value={randomCount}
          onChange={(e) =>
            onChangeCount(Math.max(1, parseInt(e.target.value) || 1))
          }
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
        />
      </div>
      <div className="flex gap-4 items-end flex-wrap mt-4 justify-center">
        <button
          onClick={onRandomTeamA}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold transition"
        >
          🎲 Random ทีม A
        </button>
        <button
          onClick={onRandomTeamB}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-semibold transition"
        >
          🎲 Random ทีม B
        </button>
        <button
          onClick={onReset}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-semibold transition"
        >
          🔄 รีเซท
        </button>
      </div>
    </div>
  );
}
