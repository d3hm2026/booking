// أنواع TypeScript تطابق جداول قاعدة البيانات تماماً
// هذا يمنع أخطاء كتابة أسماء حقول غلط ويعطي autocomplete في الكود

export type UserRole = "admin" | "owner" | "cleaner";
export type UnitStatus = "active" | "inactive" | "maintenance";
export type DepositStatus = "none" | "held" | "returned" | "forfeited";
export type PaymentStatus = "unpaid" | "partial" | "paid";
export type BookingStatus = "confirmed" | "cancelled" | "completed";
export type PaymentType = "booking" | "deposit" | "refund" | "other";
export type CleaningStatus = "pending" | "done";

export interface Owner {
  id: string;
  name: string;
  phone: string;
  commission_percent: number;
  notes: string | null;
  created_at: string;
}

export interface AppUser {
  id: string;
  role: UserRole;
  phone: string;
  password_code: string;
  owner_id: string | null;
  full_name: string;
  is_active: boolean;
  created_at: string;
}

export interface Unit {
  id: string;
  owner_id: string | null;
  name: string;
  location: string | null;
  status: UnitStatus;
  capacity: number | null;
  notes: string | null;
  created_at: string;
}

export interface UnitDailyPrice {
  id: string;
  unit_id: string;
  price_date: string; // YYYY-MM-DD
  price: number;
  created_at: string;
}

export interface UnitBlock {
  id: string;
  unit_id: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  created_at: string;
}

export interface Booking {
  id: string;
  unit_id: string;
  guest_name: string;
  guest_phone: string;
  check_in: string;
  check_out: string;
  total_price: number;
  deposit_amount: number;
  deposit_status: DepositStatus;
  payment_status: PaymentStatus;
  booking_status: BookingStatus;
  source: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  payment_type: PaymentType;
  amount: number;
  paid_date: string;
  bank_name: string | null;
  transfer_reference: string | null;
  notes: string | null;
  created_at: string;
}

export interface CleaningTask {
  id: string;
  unit_id: string;
  booking_id: string | null;
  assigned_user_id: string | null;
  status: CleaningStatus;
  visit_timestamp: string | null;
  notes: string | null;
  created_at: string;
}

export interface CleaningPhoto {
  id: string;
  cleaning_task_id: string;
  photo_url: string;
  taken_at: string;
  created_at: string;
}

export interface BookingLog {
  id: string;
  booking_id: string;
  action: string;
  note: string | null;
  created_at: string;
}

export interface Expense {
  id: string;
  unit_id: string;
  category: string;
  amount: number;
  expense_date: string;
  notes: string | null;
  created_at: string;
}
