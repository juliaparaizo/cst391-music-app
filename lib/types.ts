export interface Track {
  id?: number;
  number: number;
  title: string;
  lyrics?: string | null;
  video?: string | null;
}

export interface Album {
  id?: number;
  title: string;
  artist: string;
  year: number;
  image?: string | null;
  description?: string | null;
  tracks: Track[];
}

export interface Rule {
  id: number;
  name: string;
  criteria_field: string;
  criteria_value: string;
  created_by: string;
  role_required: string;
  created_at: string;
}

export interface Recommendation {
  id: number;
  rule_name: string;
  album_title: string;
  artist: string;
  year: number;
  album_id: number;
  rule_id: number;
}

export interface SessionUser {
  userId: number;
  username: string;
  role: 'admin' | 'customer';
}
