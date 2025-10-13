import React from "react";
import { Shelter } from "../hooks/useShelters";

type Props = {
  shelter: Shelter;
  onClose: () => void;
};

export default function ShelterModal({ shelter, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex justify-center item-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-sl font-bold mb-4">{shelter.name}</h2>
        <p className="text-gray-700 mb-2">住所：{shelter.address}</p>
        <p className="text-gray-700 mb-2">避難区分：{shelter.type}</p>
        <p className="text-gray-700 mb-2">収容人数：{shelter.capacity}</p>
        <p className="text-gray-700 mb-2"></p>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
