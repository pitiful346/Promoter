export interface OrganizationFollow {
  id: string; // Format: `${userId}_${organizationId}`
  user_id: string;
  organization_id: string;
  created_at: string;
}

export interface FollowerStats {
  total_followers: number;
  new_this_month: number;
  growth_percentage: number;
}
