import { createClient } from "@/services/supabase/server";
import type { Reservation } from "@/types";
import { getSettings } from "@/services/settingsService";

export async function createReservation(bookId: string, memberId: string) {
  const supabase = await createClient();
  const settings = await getSettings();
  const expiresAt = new Date();
  expiresAt.setDate(
    expiresAt.getDate() + (settings.reservation_expiry_days ?? 7)
  );

  const { data, error } = await supabase
    .from("reservations")
    .insert({
      book_id: bookId,
      member_id: memberId,
      expires_at: expiresAt.toISOString(),
    })
    .select("id")
    .single();

  if (error) throw new Error(`createReservation failed: ${error.message}`);
  return data;
}

export async function getMemberReservations(memberId: string): Promise<Reservation[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reservations")
    .select(
      "id, book_id, member_id, status, reserved_at, expires_at, collected_at, book:books(title, cover_url)"
    )
    .eq("member_id", memberId)
    .order("reserved_at", { ascending: false });

  if (error) throw new Error(`getReservations failed: ${error.message}`);
  return (data ?? []) as unknown as Reservation[];
}
