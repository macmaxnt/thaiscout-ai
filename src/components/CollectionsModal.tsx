"use client";

import React, { useState } from "react";
import { Folder, FolderPlus, Trash2, MapPin, X, Eye, Edit2, Check, GripVertical, ChevronUp, ChevronDown } from "lucide-react";
import { IconFolder, IconMapPin, IconBulb } from "@tabler/icons-react";

export interface Collection {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  locations: any[];
}

interface CollectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  collections: Collection[];
  onSelectCollection: (colId: string) => void;
  onCreateCollection: (name: string, description?: string) => void;
  onRenameCollection?: (colId: string, newName: string) => void;
  onDeleteCollection: (colId: string) => void;
  onRemoveLocationFromCollection: (colId: string, locId: string) => void;
  onReorderLocations?: (colId: string, newLocations: any[]) => void;
  onSelectLocationOnMap: (loc: any) => void;
  activeCollectionId: string | null;
}

export default function CollectionsModal({
  isOpen,
  onClose,
  collections,
  onSelectCollection,
  onCreateCollection,
  onRenameCollection,
  onDeleteCollection,
  onRemoveLocationFromCollection,
  onReorderLocations,
  onSelectLocationOnMap,
  activeCollectionId,
}: CollectionsModalProps) {
  const [selectedColId, setSelectedColId] = useState<string>(
    activeCollectionId || (collections.length > 0 ? collections[0].id : "")
  );

  // Drag and Drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  React.useEffect(() => {
    if (activeCollectionId) {
      setSelectedColId(activeCollectionId);
    } else if (collections.length > 0 && !collections.some((c) => c.id === selectedColId)) {
      setSelectedColId(collections[0].id);
    }
  }, [activeCollectionId, collections, selectedColId]);

  const [newColName, setNewColName] = useState("");
  const [newColDesc, setNewColDesc] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Rename state
  const [editingColId, setEditingColId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentCollection = collections.find((c) => c.id === selectedColId);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;
    onCreateCollection(newColName.trim(), newColDesc.trim());
    setNewColName("");
    setNewColDesc("");
    setIsCreating(false);
  };

  const handleStartRename = (col: Collection, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingColId(col.id);
    setEditingName(col.name);
  };

  const handleSaveRename = (colId: string, e?: React.FormEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (editingName.trim() && onRenameCollection) {
      onRenameCollection(colId, editingName.trim());
    }
    setEditingColId(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="collections-modal-title"
        className="bg-white border-[3px] border-[#285185] rounded-[24px] shadow-[6px_6px_0px_#183354] w-full max-w-4xl max-h-[88vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#f0f5f8] border-b-2 border-[#ccd9e2] px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-[#285185] text-white p-2 rounded-xl shadow-[2px_2px_0px_#183354]">
              <Folder className="w-5 h-5" />
            </div>
            <div>
              <h2 id="collections-modal-title" className="text-lg sm:text-xl font-black text-[#1b3558] flex items-center gap-2">
                คลังเซฟโลเคชัน (Collections)
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#ccd9e2] text-[#1b3558]">
                  {collections.length} กล่อง
                </span>
              </h2>
              <p className="text-xs font-semibold text-slate-500">
                จัดกลุ่มสถานที่ถ่ายทำแยกตามโปรเจกต์ เช่น &quot;MV ริมเล&quot;, &quot;ซีนแอ็กชัน&quot;, &quot;แคมเปญโฆษณา&quot;
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดหน้าต่างคลังเซฟโลเคชัน"
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#285185]/30 focus-visible:ring-offset-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Split view (Collections List on Left, Contents on Right) */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          
          {/* Left: Collections Navigation */}
          <div className="md:col-span-4 border-r-2 border-slate-200 p-4 flex flex-col gap-3 bg-slate-50 overflow-y-auto max-h-[40vh] md:max-h-full">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-500 tracking-wider font-mono">
                โฟลเดอร์ทั้งหมด
              </span>
              <button
                onClick={() => setIsCreating(!isCreating)}
                className="btn text-xs px-2.5 py-1 rounded-lg font-black bg-[#285185] text-white hover:bg-[#1b3558] flex items-center gap-1 shadow-sm"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>+ กล่องใหม่</span>
              </button>
            </div>

            {/* Create New Collection Form */}
            {isCreating && (
              <form onSubmit={handleCreate} className="bg-white border-2 border-[#285185] rounded-xl p-3 shadow-sm flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="ชื่อกล่อง เช่น ถ่าย MV ริมทะเล..."
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  autoFocus
                  className="w-full text-xs font-bold p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#285185]"
                />
                <input
                  type="text"
                  placeholder="คำอธิบายสั้นๆ (ถ้ามี)"
                  value={newColDesc}
                  onChange={(e) => setNewColDesc(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none"
                />
                <div className="flex items-center gap-1.5 justify-end">
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
                    บันทึก
                  </button>
                </div>
              </form>
            )}

            {/* List of Collections */}
            <div className="flex flex-col gap-1.5">
              {collections.map((col) => {
                const isSelected = col.id === selectedColId;
                const isEditing = editingColId === col.id;

                return (
                  <div
                    key={col.id}
                    onClick={() => setSelectedColId(col.id)}
                    className={`p-3 rounded-xl border-2 transition cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected
                        ? "bg-white border-[#285185] shadow-[2px_2px_0px_#183354]"
                        : "bg-white/60 border-slate-200 hover:bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden flex-1">
                      <Folder className={`w-4 h-4 shrink-0 ${isSelected ? "text-[#285185] fill-[#285185]/20" : "text-slate-400"}`} />
                      
                      {isEditing ? (
                        <form 
                          onSubmit={(e) => handleSaveRename(col.id, e)} 
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 flex-1"
                        >
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Escape") setEditingColId(null);
                            }}
                            className="w-full text-xs font-bold p-1 bg-white border border-[#285185] rounded-md focus:outline-none"
                          />
                          <button
                            type="submit"
                            className="p-1 rounded bg-[#285185] text-white hover:bg-[#183354] shrink-0"
                            title="บันทึกชื่อใหม่"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingColId(null);
                            }}
                            className="p-1 rounded bg-slate-200 text-slate-600 hover:bg-slate-300 shrink-0"
                            title="ยกเลิก"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </form>
                      ) : (
                        <div className="truncate">
                          <div className="text-xs sm:text-sm font-black text-slate-900 truncate">
                            {col.name}
                          </div>
                          <div className="text-[10px] font-bold text-slate-500">
                            {col.locations.length} สถานที่
                          </div>
                        </div>
                      )}
                    </div>

                    {!isEditing && (
                      <div className="flex items-center gap-1 shrink-0">
                        {/* Rename button */}
                        <button
                          type="button"
                          onClick={(e) => handleStartRename(col, e)}
                          className="p-1 rounded-md text-slate-400 hover:text-[#285185] hover:bg-[#ccd9e2]/30 transition"
                          title="เปลี่ยนชื่อกล่อง"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`คุณต้องการลบกล่อง "${col.name}" ใช่หรือไม่?`)) {
                              onDeleteCollection(col.id);
                              if (selectedColId === col.id) {
                                const remaining = collections.filter((c) => c.id !== col.id);
                                setSelectedColId(remaining.length > 0 ? remaining[0].id : "");
                              }
                            }
                          }}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="ลบกล่องนี้"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Contents of Selected Collection */}
          <div className="md:col-span-8 p-4 sm:p-5 flex flex-col gap-3 overflow-y-auto bg-white max-h-[50vh] md:max-h-full">
            {currentCollection ? (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 flex-wrap gap-2">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-[#1b3558] flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5"><IconFolder size={15} /> {currentCollection.name}</span>
                      <button
                        type="button"
                        onClick={(e) => handleStartRename(currentCollection, e)}
                        className="p-1 rounded-md text-slate-400 hover:text-[#285185] hover:bg-[#ccd9e2]/30 transition"
                        title="เปลี่ยนชื่อกล่องนี้"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-mono font-bold bg-[#f0f5f8] border border-[#ccd9e2] text-[#1b3558] px-2 py-0.5 rounded-full">
                        {currentCollection.locations.length} รายการ
                      </span>
                    </h3>
                    {currentCollection.description && (
                      <p className="text-xs font-semibold text-slate-500 mt-0.5">
                        {currentCollection.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onSelectCollection(currentCollection.id);
                        onClose();
                      }}
                      className="btn text-xs px-3.5 py-1.5 rounded-xl font-black bg-[#285185] text-white hover:bg-[#1b3558] flex items-center gap-1.5 shadow-[2px_2px_0px_#183354]"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>แสดงกล่องนี้บนบอร์ดและแผนที่</span>
                    </button>
                  </div>
                </div>

                {/* Locations inside this collection */}
                {currentCollection.locations.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center">
                    <Folder className="w-12 h-12 opacity-30 mb-2" />
                    <p className="text-sm font-bold text-slate-600">ยังไม่มีสถานที่ในกล่องนี้</p>
                    <p className="text-xs text-slate-400 mt-1">
                      คุณสามารถกดปุ่ม &quot;+ เซฟเข้ากล่อง&quot; จากการ์ดสถานที่เพื่อเพิ่มเข้ามาที่นี่ได้เลย
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {currentCollection.locations.map((loc, idx) => {
                      const isBeingDragged = draggedIndex === idx;
                      const isTargetOver = dragOverIndex === idx;

                      const handleMove = (fromIdx: number, toIdx: number) => {
                        if (toIdx < 0 || toIdx >= currentCollection.locations.length) return;
                        const updated = [...currentCollection.locations];
                        const [moved] = updated.splice(fromIdx, 1);
                        updated.splice(toIdx, 0, moved);
                        if (onReorderLocations) {
                          onReorderLocations(currentCollection.id, updated);
                        }
                      };

                      return (
                        <div
                          key={loc.id}
                          draggable
                          onDragStart={(e) => {
                            setDraggedIndex(idx);
                            e.dataTransfer.effectAllowed = "move";
                            e.dataTransfer.setData("text/plain", idx.toString());
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = "move";
                            if (dragOverIndex !== idx) {
                              setDragOverIndex(idx);
                            }
                          }}
                          onDragLeave={() => {
                            if (dragOverIndex === idx) {
                              setDragOverIndex(null);
                            }
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (draggedIndex !== null && draggedIndex !== idx) {
                              handleMove(draggedIndex, idx);
                            }
                            setDraggedIndex(null);
                            setDragOverIndex(null);
                          }}
                          onDragEnd={() => {
                            setDraggedIndex(null);
                            setDragOverIndex(null);
                          }}
                          className={`bg-[#f8fafc] border-2 rounded-xl p-2.5 sm:p-3 flex items-center justify-between gap-2 sm:gap-3 transition select-none ${
                            isBeingDragged
                              ? "opacity-40 border-dashed border-[#d67940] scale-[0.98]"
                              : isTargetOver
                              ? "border-[#d67940] bg-[#fff7ed] shadow-md -translate-y-0.5"
                              : "border-slate-200 hover:border-[#285185]"
                          }`}
                        >
                          <div className="flex items-center gap-2 sm:gap-3 overflow-hidden flex-1 min-w-0">
                            {/* Drag Handle & Up/Down Controls */}
                            <div className="flex items-center gap-0.5 shrink-0">
                              <div 
                                className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-[#285185] rounded"
                                title="ลากเพื่อเปลี่ยนลำดับตำแหน่ง"
                              >
                                <GripVertical className="w-4 h-4" />
                              </div>
                              <div className="flex flex-col -space-y-1">
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMove(idx, idx - 1);
                                  }}
                                  className="p-0.5 text-slate-400 hover:text-[#285185] disabled:opacity-20 disabled:hover:text-slate-400 cursor-pointer disabled:cursor-not-allowed"
                                  title="ย้ายขึ้น"
                                >
                                  <ChevronUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === currentCollection.locations.length - 1}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMove(idx, idx + 1);
                                  }}
                                  className="p-0.5 text-slate-400 hover:text-[#285185] disabled:opacity-20 disabled:hover:text-slate-400 cursor-pointer disabled:cursor-not-allowed"
                                  title="ย้ายลง"
                                >
                                  <ChevronDown className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <span className="w-6 h-6 rounded-lg bg-[#285185] text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                              {idx + 1}
                            </span>

                            <div className="truncate flex-1 min-w-0">
                              <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate">
                                {loc.name_th}
                                {loc.name_en && (
                                  <span className="text-[11px] font-medium text-slate-500 ml-1.5">
                                    ({loc.name_en})
                                  </span>
                                )}
                              </h4>
                              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 mt-0.5">
                                <span className="text-[#0284c7] inline-flex items-center gap-1"><IconMapPin size={13} /> {loc.province}</span>
                                <span>·</span>
                                <span className="truncate">{loc.category || loc.sub_type || "สถานที่"}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                onSelectLocationOnMap(loc);
                                onClose();
                              }}
                              className="btn text-[11px] px-2.5 py-1 rounded-lg font-bold bg-white border border-slate-300 hover:border-[#285185] text-slate-700 flex items-center gap-1 shadow-2xs cursor-pointer"
                              title="ดูจุดนี้บนแผนที่"
                            >
                              <MapPin className="w-3 h-3 text-rose-600" />
                              <span className="hidden sm:inline">ดูหมุด</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => onRemoveLocationFromCollection(currentCollection.id, loc.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                              title="นำออกจากกล่องนี้"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <div className="py-12 text-center text-slate-400">
                เลือกกล่องทางซ้ายเพื่อดูสถานที่ด้านใน
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#f0f5f8] border-t-2 border-[#ccd9e2] px-5 py-3 flex items-center justify-between shrink-0">
          <span className="text-xs font-bold text-slate-500">
            <span className="inline-flex items-center gap-1.5"><IconBulb size={14} /> ข้อมูลทุกกล่องและสถานที่ถูกบันทึกไว้ในเบราว์เซอร์ของคุณ (LocalStorage) เปิดใหม่ก็ยังอยู่</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-xs px-4 py-2 rounded-lg font-black bg-white border border-[#b9cede] text-[#285185] hover:bg-[#eaf2f7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#285185]/30 focus-visible:ring-offset-2"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
}
