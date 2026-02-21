import React from "react";

type StatBoostModalData = {
  characterId: number;
  characterName: string;
  race: string;
};

type StatBoostModalProps = {
  data: StatBoostModalData;
  onApply: (
    characterId: number,
    statType: "def" | "hp" | "move" | "hiton" | "resist",
  ) => void;
  onClose: () => void;
};

export default function StatBoostModal({
  data,
  onApply,
  onClose,
}: StatBoostModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 border-2 border-purple-500 rounded-lg p-6 max-w-sm w-full shadow-xl">
        <h2 className="text-2xl font-bold text-purple-400 mb-4">
          ⭐ เพิ่ม Stat
        </h2>
        <p className="text-gray-300 mb-6">
          เลือก Stat ที่ต้องการเพิ่มให้{" "}
          <span className="font-bold text-amber-400">{data.characterName}</span>
        </p>

        <div className="space-y-3 mb-6">
          <button
            onClick={() => onApply(data.characterId, "move")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded font-semibold transition text-left"
          >
            <div className="font-bold">Move +1</div>
            <div className="text-xs text-gray-300">ความเร็วเพิ่มขึ้น 1</div>
          </button>

          <button
            onClick={() => onApply(data.characterId, "hp")}
            className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded font-semibold transition text-left"
          >
            <div className="font-bold">HP +2</div>
            <div className="text-xs text-gray-300">เลือดเพิ่มขึ้น 2</div>
          </button>

          <button
            onClick={() => onApply(data.characterId, "def")}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-3 rounded font-semibold transition text-left"
          >
            <div className="font-bold">Def -1</div>
            <div className="text-xs text-gray-300">ทอยป้องกันเพิ่มขึ้น 1</div>
          </button>

          <button
            onClick={() => onApply(data.characterId, "hiton")}
            className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded font-semibold transition text-left"
          >
            <div className="font-bold">Hit On -1</div>
            <div className="text-xs text-gray-300">ทอยแม่นยำเพิ่มขึ้น 1</div>
          </button>

          <button
            onClick={() => onApply(data.characterId, "resist")}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded font-semibold transition text-left"
          >
            <div className="font-bold">Resist +1</div>
            <div className="text-xs text-gray-300">ทอยต้านทานเพิ่มขึ้น 1</div>
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded font-semibold transition"
        >
          ยกเลิก
        </button>
      </div>
    </div>
  );
}
