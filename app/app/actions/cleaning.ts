"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireRole } from "@/lib/require-role";
import { revalidatePath } from "next/cache";
import type { CleaningTask, Unit } from "@/lib/types";

const BUCKET = "cleaning-photos";

export interface CleaningTaskWithUnit extends CleaningTask {
  unit: Unit | null;
}

export async function getCleaningTasksForCleaner(): Promise<
  CleaningTaskWithUnit[]
> {
  await requireRole(["cleaner"]);
  const supabase = supabaseAdmin();

  const { data, error } = await supabase
    .from("cleaning_tasks")
    .select("*, unit:units(*)")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error("فشل تحميل مهام التنظيف: " + error.message);
  }

  return (data ?? []) as unknown as CleaningTaskWithUnit[];
}

export interface ActionResult {
  success: boolean;
  error?: string;
}

async function ensureBucketExists() {
  const supabase = supabaseAdmin();
  const { error } = await supabase.storage.createBucket(BUCKET, {
    public: false,
  });
  if (error && !error.message.includes("already exists")) {
    throw new Error(error.message);
  }
}

export async function uploadCleaningPhotoAction(
  formData: FormData
): Promise<ActionResult> {
  await requireRole(["cleaner"]);
  const supabase = supabaseAdmin();

  const cleaningTaskId = formData.get("cleaning_task_id") as string;
  const file = formData.get("photo") as File | null;

  if (!cleaningTaskId || !file || file.size === 0) {
    return { success: false, error: "اختر صورة قبل الحفظ" };
  }

  await ensureBucketExists();

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${cleaningTaskId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type });

  if (uploadError) {
    return { success: false, error: "فشل رفع الصورة" };
  }

  const { error: insertError } = await supabase
    .from("cleaning_photos")
    .insert({ cleaning_task_id: cleaningTaskId, photo_url: path });

  if (insertError) {
    return { success: false, error: "فشل حفظ بيانات الصورة" };
  }

  const { error: updateError } = await supabase
    .from("cleaning_tasks")
    .update({ status: "done", visit_timestamp: new Date().toISOString() })
    .eq("id", cleaningTaskId)
    .eq("status", "pending");

  if (updateError) {
    return { success: false, error: "فشل تحديث حالة المهمة" };
  }

  revalidatePath("/cleaner");
  revalidatePath("/owner");
  return { success: true };
}
