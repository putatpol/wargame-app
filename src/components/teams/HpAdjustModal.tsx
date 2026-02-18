import React from "react";

type HpAdjustModalData = {
  characterId: number;
  characterName: string;
  currentHp: number;
};

type HpAdjustModalProps = {
  modal: HpAdjustModalData;
  hpAdjustValue: number;
  setHpAdjustValue: (value: number) => void;
  onReset: (characterId: number) => void;
  onClose: () => void;
  onConfirm: (characterId: number, newHp: number) => void;
};

export default function HpAdjustModal({
  modal,
  hpAdjustValue,
  setHpAdjustValue,
  onReset,
  onClose,
  onConfirm,
}: HpAdjustModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 border-2 border-yellow-500 rounded-lg p-6 max-w-sm w-full shadow-xl">
        <div className="flex justify-between mb-4">
          <h2 className="text-2xl font-bold text-yellow-400">ปรับ HP</h2>
          <button
            className=" text-white bg-gray-600 hover:bg-gray-700 px-2 rounded"
            onClick={() => onReset(modal.characterId)}
          >
            reset
          </button>
        </div>
        <p className="text-gray-300">
          <span className="font-bold text-amber-400">
            {modal.characterName}
          </span>
          <br />
          เลือดปัจจุบัน:{" "}
          <span className="text-red-400 font-bold">{modal.currentHp}</span>
        </p>

        <div className="mb-4">
          <label className="text-sm text-gray-300 block mb-2">
            เพิ่ม/ลดเลือด:
          </label>
          <input
            type="number"
            value={hpAdjustValue}
            onChange={(e) => setHpAdjustValue(parseInt(e.target.value) || 0)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-center"
          />
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setHpAdjustValue(hpAdjustValue - 3)}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded font-semibold"
          >
            -3
          </button>
          <button
            onClick={() => setHpAdjustValue(hpAdjustValue + 3)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded font-semibold"
          >
            +3
          </button>
        </div>

        <p className="text-sm text-gray-400 mb-4 text-center">
          เลือดสุดท้าย:{" "}
          <span className="font-bold text-white">
            {Math.max(0, modal.currentHp + hpAdjustValue)}
          </span>
        </p>

        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded font-semibold transition"
          >
            ยกเลิก
          </button>
          <button
            onClick={() => {
              const newHp = Math.max(0, modal.currentHp + hpAdjustValue);
              onConfirm(modal.characterId, newHp);
            }}
            className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-black px-4 py-2 rounded font-semibold transition"
          >
            ยืนยัน
          </button>
        </div>
      </div>
    </div>
  );
}
