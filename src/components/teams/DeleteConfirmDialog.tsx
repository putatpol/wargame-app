import React from "react";

type DeleteConfirmData = {
  characterId: number;
  characterName: string;
  team: "A" | "B";
};

type DeleteConfirmDialogProps = {
  data: DeleteConfirmData;
  onCancel: () => void;
  onConfirm: (data: DeleteConfirmData) => void;
};

export default function DeleteConfirmDialog({
  data,
  onCancel,
  onConfirm,
}: DeleteConfirmDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 border-2 border-red-500 rounded-lg p-6 max-w-sm w-full shadow-xl">
        <h2 className="text-2xl font-bold text-red-400 mb-4">
          ยืนยันการลบ
        </h2>
        <p className="text-gray-300 mb-6">
          คุณต้องการลบ{" "}
          <span className="font-bold text-amber-400">
            {data.characterName}
          </span>{" "}
          ออกจากทีม <span className="font-bold">{data.team}</span> หรือไม่
        </p>
        <div className="flex gap-4">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded font-semibold transition"
          >
            ยกเลิก
          </button>
          <button
            onClick={() => onConfirm(data)}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold transition"
          >
            ลบ
          </button>
        </div>
      </div>
    </div>
  );
}
