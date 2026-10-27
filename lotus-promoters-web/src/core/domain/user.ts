export type SubscriptionTier = "free" | "premium" | "founder";

export interface UserProfile {
  uid: string;
  email: string;
  display_name: string;
  photo_url?: string;
  phone_number?: string;
  is_promoter: boolean;
  subscription_tier?: SubscriptionTier | string;
  events_published_this_month?: number;
  last_reset_date?: string;
  created_time: string;
}
