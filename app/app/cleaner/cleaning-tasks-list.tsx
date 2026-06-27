"use client";

import { useState } from "react";
import type { CleaningTaskWithUnit } from "@/app/actions/cleaning";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadPhotoDialog } from "./upload-photo-dialog";
import { Building2, Camera } from "lucide-react";

export function CleaningTasksList({
  tasks,
}: {
  tasks: CleaningTaskWithUnit[];
}) {
  const [activeTask, setActiveTask] = useState<CleaningTaskWithUnit | null>(
    null
  );

  if (tasks.length === 0) {
    return (
      <Card className="p-10 text-center text-gray-400 text-sm">
        لا توجد مهام تنظيف معلّقة حالياً 🎉
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <Card key={task.id} className="p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-amber-50 text-amber-600 rounded-lg p-2.5">
              <Building2 className="size-5" />
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {task.unit?.name ?? "وحدة"}
              </p>
              <p className="text-xs text-gray-400">
                {new Date(task.created_at).toLocaleDateString("ar")}
              </p>
            </div>
          </div>
          <Button onClick={() => setActiveTask(task)} size="sm">
            <Camera className="size-4" />
            تم التنظيف
          </Button>
        </Card>
      ))}

      {activeTask && (
        <UploadPhotoDialog
          taskId={activeTask.id}
          unitName={activeTask.unit?.name ?? "الوحدة"}
          onClose={() => setActiveTask(null)}
        />
      )}
    </div>
  );
}
