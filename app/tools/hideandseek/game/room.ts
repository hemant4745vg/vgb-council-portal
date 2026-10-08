import { createClient } from "@/lib/supabase/client";
import type { Phase, Role } from "./rules";

export type RoomPlayer = { user_id: string; role: Role; x: number; z: number; hidden: boolean };

function code() {
  return Math.random().toString(36).slice(2, 6).toUpperCase();
}

export async function createRoom(role: Role) {
  const supabase = createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw new Error("Sign in before opening a room.");
  const roomCode = code();
  const { data, error } = await supabase.from("hide_rounds").insert({ code: roomCode, phase: "hide", host_id: userData.user.id, time_left: 8 }).select("id, code").single();
  if (error) throw new Error(error.message);
  await supabase.from("hide_players").insert({ round_id: data.id, user_id: userData.user.id, role, x: 24, z: -70, hidden: false });
  return { id: data.id as string, code: data.code as string, userId: userData.user.id };
}

export async function joinRoom(roomCode: string, role: Role) {
  const supabase = createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw new Error("Sign in before joining a room.");
  const { data, error } = await supabase.from("hide_rounds").select("id, code").eq("code", roomCode.trim().toUpperCase()).single();
  if (error || !data) throw new Error("No room with that code.");
  await supabase.from("hide_players").upsert({ round_id: data.id, user_id: userData.user.id, role, x: 40, z: -60, hidden: false });
  return { id: data.id as string, code: data.code as string, userId: userData.user.id };
}

export function subscribeRoom(roundId: string, onPlayers: (players: RoomPlayer[]) => void, onPhase: (phase: Phase, timeLeft: number) => void) {
  const supabase = createClient();
  const channel = supabase.channel(`hide-${roundId}`).on("postgres_changes", { event: "*", schema: "public", table: "hide_players", filter: `round_id=eq.${roundId}` }, async () => {
    const { data } = await supabase.from("hide_players").select("user_id, role, x, z, hidden").eq("round_id", roundId);
    onPlayers((data ?? []) as RoomPlayer[]);
  }).on("postgres_changes", { event: "UPDATE", schema: "public", table: "hide_rounds", filter: `id=eq.${roundId}` }, (payload) => {
    const row = payload.new as { phase: Phase; time_left: number };
    onPhase(row.phase, row.time_left);
  }).subscribe();
  return () => { supabase.removeChannel(channel); };
}

export async function pushPosition(roundId: string, userId: string, position: { x: number; z: number; hidden: boolean; role: Role }) {
  const supabase = createClient();
  await supabase.from("hide_players").update({ x: position.x, z: position.z, hidden: position.hidden, role: position.role }).eq("round_id", roundId).eq("user_id", userId);
}

export async function pushPhase(roundId: string, phase: Phase, timeLeft: number) {
  const supabase = createClient();
  await supabase.from("hide_rounds").update({ phase, time_left: Math.ceil(timeLeft) }).eq("id", roundId);
}
