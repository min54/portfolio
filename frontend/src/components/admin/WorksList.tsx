"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { updateOrderAction } from "@/app/admin/actions";
import WorkItem from "./WorkItem";
import type { Work } from "@/types/database";

interface Props {
  initialWorks: Work[];
}

export default function WorksList({ initialWorks }: Props) {
  const [works, setWorks] = useState<Work[]>(initialWorks);

  const sensors = useSensors(useSensor(PointerSensor));

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = works.findIndex((w) => w.id === active.id);
    const newIndex = works.findIndex((w) => w.id === over.id);
    const reordered = arrayMove(works, oldIndex, newIndex);

    setWorks(reordered);

    await updateOrderAction(
      reordered.map((w, i) => ({ id: w.id, order_index: i })),
    );
  }

  return (
    <DndContext id="works-dnd" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={works.map((w) => w.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {works.map((work) => (
            <WorkItem
              key={work.id}
              work={work}
              onDelete={(id) => setWorks((prev) => prev.filter((w) => w.id !== id))}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
