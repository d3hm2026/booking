"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { uploadCleaningPhotoAction } from "@/app/actions/cleaning";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";

interface UploadPhotoDialogProps {
  taskId: string;
  unitName: string;
  onClose: () => void;
}

export function UploadPhotoDialog({
  taskId,
  unitName,
  onClose,
}: UploadPhotoDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [preview, setPreview] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("cleaning_task_id", taskId);

    startTransition(async () => {
      const result = await uploadCleaningPhotoAction(formData);
      if (result.success) {
        toast.success("تم رفع الصورة وإغلاق المهمة");
        router.refresh();
        onClose();
      } else {
        toast.error(result.error ?? "حدث خطأ غير متوقع");
      }
    });
  }

  return (
    <Dialog title={`تنظيف — ${unitName}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-colors">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="معاينة الصورة"
              className="max-h-48 rounded-lg object-cover"
            />
          ) : (
            <>
              <Camera className="size-8 text-gray-400" />
              <span className="text-sm text-gray-500">
                اضغط لاختيار صورة أو تصويرها
              </span>
            </>
          )}
          <input
            name="photo"
            type="file"
            accept="image/*"
            capture="environment"
            required
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        <Button type="submit" loading={isPending} className="w-full">
          {isPending ? "جارٍ الرفع..." : "حفظ وإغلاق المهمة"}
        </Button>
      </form>
    </Dialog>
  );
}
