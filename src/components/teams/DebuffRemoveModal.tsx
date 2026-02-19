import React from "react";
import Image from "next/image";
import { StatusBuff } from "@/interface/status";

type DebuffRemoveModalProps = {
  pendingRemove: null | {
    characterId: number;
    buffId: number;
    buff?: StatusBuff | null;
  };
  removeStatusBuff: (characterId: number, buffId: number) => void;
  setShowRemoveModal: (show: boolean) => void;
  setPendingRemove: React.Dispatch<React.SetStateAction<{ characterId: number; buffId: number; buff?: StatusBuff | undefined; } | null>>;
  reduceAp: (characterId: number, amount: number) => void;
};

const DebuffRemoveModal = ({ pendingRemove, removeStatusBuff, setShowRemoveModal, setPendingRemove, reduceAp }: DebuffRemoveModalProps) => {
  const confirmRemove = () => {
    if (pendingRemove) {
      removeStatusBuff(pendingRemove.characterId, pendingRemove.buffId);
    }
    setShowRemoveModal(false);
    setPendingRemove(null);
  };

  const confirmRemoveAP = () => {
    if (!pendingRemove) return;

    const apCost = pendingRemove.buff?.resist?.ap ?? 0;
    if (apCost > 0) {
      // reduce AP from the character
      reduceAp(pendingRemove.characterId, apCost);
      // then remove the status buff
      removeStatusBuff(pendingRemove.characterId, pendingRemove.buffId);
    }

    setShowRemoveModal(false);
    setPendingRemove(null);
  };

  const cancelRemove = () => {
    setShowRemoveModal(false);
    setPendingRemove(null);
  };

  if (!pendingRemove) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 border-2 border-red-500 rounded-lg p-6 max-w-md w-full shadow-xl">
        <div className="flex items-start gap-4">
          {pendingRemove.buff?.image ? (
            <div className="shrink-0">
              <Image
                src={pendingRemove.buff.image}
                alt={pendingRemove.buff?.thaiName ?? "status"}
                width={72}
                height={72}
                className="rounded-lg object-cover"
              />
            </div>
          ) : (
            <div className="w-16 h-16 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold">!
            </div>
          )}

          <div className="flex-1">
            <h3 className="text-lg font-bold text-red-400 mb-1">ยืนยันการลบสถานะ</h3>
            <p className="mb-2 text-white font-semibold">{pendingRemove.buff?.thaiName ?? `#${pendingRemove.buffId}`}</p>

            <div className="text-sm text-gray-300 space-y-1 mb-4">
              <p>ทอยแก้: <span className="text-white">{pendingRemove.buff?.resist?.dice ?? "-"}</span></p>
              <p>AP: <span className="text-white">{pendingRemove.buff?.resist?.ap ?? "-"}</span></p>
              <p>ครบกำหนดเทิร์น: <span className="text-white">{pendingRemove.buff?.resist?.turn ?? "-"}</span></p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button onClick={cancelRemove} className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded font-semibold transition">
                ยกเลิก
              </button>
              {pendingRemove.buff?.resist?.ap && (
                <button onClick={confirmRemoveAP} className="w-full bg-violet-500 hover:bg-violet-600 text-white px-4 py-2 rounded font-semibold transition">
                  ใช้ AP
                </button>
              )}
              <button onClick={confirmRemove} className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-semibold transition">
                ตกลง
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebuffRemoveModal;
