export type NotificationType =
  | "PROMOTER_NEW_EVENT"
  | "RADAR_TEASER_REVEALED"
  | "RADAR_REVEAL_APPROACHING"
  | "EVENT_TICKETS_AVAILABLE"
  | "EVENT_TIME_CHANGED"
  | "EVENT_VENUE_CHANGED"
  | "EVENT_CANCELLED";

export type NotificationCategory =
  | "FOLLOWED_PROMOTERS"
  | "RADAR_REVEALS"
  | "SAVED_EVENTS"
  | "RECOMMENDATIONS"
  | "MARKETING";

export interface DeepLinkPayload {
  scheme: "lotus://";
  target: "event" | "teaser" | "promoter";
  target_id: string;
  url: string; // e.g. "lotus://event/event_1"
}

export interface SystemNotificationLog {
  id: string;
  organization_id: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  body: string;
  deep_link: DeepLinkPayload;
  recipients_count: number;
  delivered_count: number;
  open_count: number;
  status: "SENT" | "SCHEDULED" | "FAILED";
  trigger_event_id?: string;
  trigger_teaser_id?: string;
  created_at: string;
}

export interface DeviceToken {
  id: string; // token hash
  user_id: string;
  token: string;
  platform: "ios" | "android" | "web";
  is_valid: boolean;
  last_used_at: string;
}

export interface UserNotificationPreferences {
  user_id: string;
  followed_promoters: boolean;
  radar_reveals: boolean;
  saved_events: boolean;
  recommendations: boolean;
  marketing: boolean;
}
