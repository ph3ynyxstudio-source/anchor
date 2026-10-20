export interface MoodEntry {
  id: string;
  created_at: string;
  updated_at: string;
  emotion_1_label: string;
  emotion_1_intensity: number;
  emotion_2_label?: string | null;
  emotion_2_intensity?: number | null;
  emotion_3_label?: string | null;
  emotion_3_intensity?: number | null;
  dominant_event: string;
  is_deleted: number;
}

export interface MoodEntryInput {
  emotion_1_label: string;
  emotion_1_intensity: number;
  emotion_2_label?: string | null;
  emotion_2_intensity?: number | null;
  emotion_3_label?: string | null;
  emotion_3_intensity?: number | null;
  dominant_event: string;
}

export interface SyncInfo {
  ip: string;
  port: number;
  sync_url: string;
}
