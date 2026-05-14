export interface Template {
  id: number;
  name: string;
  subject: string;
  category: string;
  html_body: string;
  created_at: string;
}

export interface TargetUser {
  id: number;
  name: string;
  email: string;
  department: string | null;
}

export interface Campaign {
  id: number;
  name: string;
  description: string | null;
  template_id: number;
  template_name: string | null;
  status: "draft" | "active" | "completed";
  target_count: number;
  click_count: number;
  submit_count: number;
  click_rate: number;
  submit_rate: number;
  created_at: string;
  sent_at: string | null;
}

export interface TrackingEvent {
  id: number;
  campaign_id: number;
  user_id: number;
  user_name: string | null;
  user_email: string | null;
  event_type: "click" | "submit" | "open";
  ip_address: string | null;
  created_at: string;
}

export interface GlobalStats {
  total_campaigns: number;
  active_campaigns: number;
  total_users: number;
  total_templates: number;
  total_sent: number;
  total_clicks: number;
  total_submits: number;
  click_rate: number;
  submit_rate: number;
}

export interface CampaignStats {
  campaign_id: number;
  campaign_name: string;
  total_targets: number;
  click_count: number;
  submit_count: number;
  click_rate: number;
  submit_rate: number;
  safe_users: TargetUser[];
  risky_users: TargetUser[];
  high_risk_users: TargetUser[];
  events: TrackingEvent[];
}
