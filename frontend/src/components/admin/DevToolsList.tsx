"use client";

import { useState } from "react";
import Link from "next/link";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { deleteDevToolAction, updateDevToolOrderAction } from "@/app/admin/devtools/actions";
import type { DevTool } from "@/types/devtool";

function DevToolItem({ item, onDelete }: { item: DevTool; onDelete: (id: string) => void }) {
  const [deleting, setDeleting] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };

  async function handleDelete() {
    if (!confirm(`"${item.title}" 을 삭제할까요?`)) return;
    setDeleting(true);
    const { error } = await deleteDevToolAction(item.id);
    if (error) { alert(error); setDeleting(false); return; }
    onDelete(item.id);
  }

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-4 p-3 bg-zinc-900 border border-zinc-800 rounded-lg group">
      <button {...attributes} {...listeners} className="text-zinc-600 hover:text-zinc-400 cursor-grab active:cursor-grabbing px-1 touch-none">⠿</button>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{item.title}</p>
        {item.url && <p className="text-xs text-zinc-600 truncate mt-0.5">{item.url}</p>}
        <p className="text-xs text-zinc-600 mt-0.5">{item.is_published ? "공개" : "비공개"}</p>
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Link href={`/admin/devtools/edit/${item.id}`} className="px-3 py-1.5 text-xs text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors">편집</Link>
        <button onClick={handleDelete} disabled={deleting} className="px-3 py-1.5 text-xs text-red-400 bg-zinc-800 hover:bg-red-900/40 rounded-md transition-colors disabled:opacity-50">
          {deleting ? "..." : "삭제"}
        </button>
      </div>
    </div>
  );
}

export default function DevToolsList({ initialItems }: { initialItems: DevTool[] }) {
  const [items, setItems] = useState(initialItems);
  const sensors = useSensors(useSensor(PointerSensor));

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = items.findIndex((i) => i.id === active.id);
    const newIdx = items.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(items, oldIdx, newIdx);
    setItems(reordered);
    await updateDevToolOrderAction(reordered.map((i, idx) => ({ id: i.id, order_index: idx })));
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {items.map((item) => (
            <DevToolItem key={item.id} item={item} onDelete={(id) => setItems((prev) => prev.filter((i) => i.id !== id))} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
