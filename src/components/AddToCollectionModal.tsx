"use client";

import React, { useState } from "react";
import { Folder, FolderPlus, Check, X } from "lucide-react";
import { Collection } from "./CollectionsModal";

interface AddToCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: any; // Can be a single location or an array of locations
  collections: Collection[];
  onToggleLocationInCollection: (colId: string, location: any) => void;
  onAddMultipleToCollection?: (colId: string, locations: any[]) => void;
  onCreateCollection: (name: string, description?: string) => void;
}

export default function AddToCollectionModal({
  isOpen,
  onClose,
  location,
  collections,
  onToggleLocationInCollection,
  onAddMultipleToCollection,
  onCreateCollection,
}: AddToCollectionModalProps) {
  const [newColName, setNewColName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  if (!isOpen || !location) return null;

  const isMultiple = Array.isArray(location);
  const locationList = isMultiple ? location : [location];

  const handleCreateAndAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;
    onCreateCollection(newColName.trim());
    setNewColName("");
    setIsCreating(false);
  };

  const handleSelectCollection = (colId: string) => {
    if (isMultiple && onAddMultipleToCollection) {
      onAddMultipleToCollection(colId, locationList);
    } else {
      onToggleLocationInCollection(colId, location);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white border-[3px] border-[#285185] rounded-[22px] shadow-[6px_6px_0px_#183354] w-full max-w-md flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#f0f5f8] border-b-2 border-[#ccd9e2] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Folder className="w-5 h-5 text-[#285185]" />
            <div>
              <h3 className="text-sm sm:text-base font-black text-[#1b3558]">
                {isMultiple ? "บันทึกทั้งหมดเข้าคอลเลกชัน" : "บันทึกเข้าคอลเลกชัน"}
              </h3>
              <p className="text-[11px] font-bold text-slate-500 truncate max-w-[260px]">
                {isMultiple
                  ? `เลือกคลังเพื่อเพิ่มสถานที่ทั้ง ${locationList.length} แห่ง`
                  : `${location.name_th} (${location.province})`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of Collections */}
        <div className="p-4 flex flex-col gap-2 max-h-[50vh] overflow-y-auto">
          <span className="text-xs font-black text-slate-500 font-mono uppercase">
            เลือกกล่องที่ต้องการเซฟ:
          </span>

          {collections.map((col) => {
            const isInCollection = isMultiple
              ? locationList.every((l) => col.locations.some((cl) => cl.id === l.id))
              : col.locations.some((l) => l.id === location.id);
            return (
              <button
                key={col.id}
                type="button"
                onClick={() => handleSelectCollection(col.id)}
                className={`w-full p-3 rounded-xl border-2 transition flex items-center justify-between text-left cursor-pointer ${
                  isInCollection
                    ? "bg-emerald-50 border-emerald-500 shadow-sm"
                    : "bg-white border-slate-200 hover:border-[#285185] hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Folder className={`w-4 h-4 ${isInCollection ? "text-emerald-600 fill-emerald-600/20" : "text-slate-400"}`} />
                  <div>
                    <div className="text-xs sm:text-sm font-black text-slate-900">
                      {col.name}
                    </div>
                    <div className="text-[10px] font-bold text-slate-400">
                      {col.locations.length} สถานที่
                    </div>
                  </div>
                </div>

                <div className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition ${
                  isInCollection 
                    ? "bg-emerald-600 border-emerald-600 text-white" 
                    : "border-slate-300 bg-white"
                }`}>
                  {isInCollection && <Check className="w-4 h-4" />}
                </div>
              </button>
            );
          })}

          {/* Create new collection inline */}
          {isCreating ? (
            <form onSubmit={handleCreateAndAdd} className="mt-2 bg-slate-50 border-2 border-[#285185] rounded-xl p-2.5 flex flex-col gap-2">
              <input
                type="text"
                placeholder="ชื่อกล่องใหม่..."
                value={newColName}
                onChange={(e) => setNewColName(e.target.value)}
                autoFocus
                className="w-full text-xs font-bold p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#285185]"
              />
              <div className="flex items-center justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="text-xs font-bold text-slate-500 px-2 py-1 hover:underline"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="btn text-xs px-3 py-1 rounded-lg font-black bg-[#285185] text-white"
                >
                  สร้างกล่อง
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className="mt-1 w-full py-2.5 border-2 border-dashed border-slate-300 hover:border-[#285185] rounded-xl text-xs font-bold text-slate-600 hover:text-[#285185] flex items-center justify-center gap-1.5 transition"
            >
              <FolderPlus className="w-4 h-4" />
              <span>+ สร้างกล่อง Collection ใหม่</span>
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#f0f5f8] border-t-2 border-[#ccd9e2] px-4 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="btn text-xs px-4 py-1.5 rounded-xl font-black bg-[#285185] text-white hover:bg-[#1b3558]"
          >
            เสร็จสิ้น
          </button>
        </div>
      </div>
    </div>
  );
}
