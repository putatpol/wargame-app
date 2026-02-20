import Image from "next/image";
import React from "react";
import { StatusBuff } from "@/interface/status";

type StatusModalData = {
  characterId: number;
  characterName: string;
};

type StatusBuffModalProps = {
  data: StatusModalData;
  statusBuffs: StatusBuff[];
  onSelectBuff: (characterId: number, buffId: number) => void;
  onClose: () => void;
};

export default function StatusBuffModal({
  data,
  statusBuffs,
  onSelectBuff,
  onClose,
}: StatusBuffModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 border-2 border-purple-500 rounded-lg p-6 max-w-xl w-full shadow-xl">
        <h2 className="text-2xl font-bold text-purple-400 mb-4">
          เลือกสถานะให้ {data.characterName}
        </h2>
        <p className="text-gray-300 mb-4">
          เลือก action / buff / debuff จากรายการ
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6 max-h-80 overflow-auto">
          {statusBuffs.map((s) => (
            <button
              key={s.id}
              onClick={() => onSelectBuff(data.characterId, s.id)}
              className="w-full text-left bg-gray-700 hover:bg-gray-600 px-4 py-3 rounded transition"
            >
              <div className="flex gap-2">
                <Image
                  src={s.image}
                  alt={s.thaiName}
                  width={32}
                  height={32}
                  className="object-contain"
                />
                <div>
                  <div className="font-bold text-white">
                    <div>
                      {s.thaiName}{" "}
                      <span className="text-xs text-gray-300">
                        ({s.engName})
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">{s.description}</div>
                </div>
              </div>
            </button>
          ))}
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
