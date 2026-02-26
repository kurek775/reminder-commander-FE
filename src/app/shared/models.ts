export interface SheetIntegration {
  id: string;
  user_id: string;
  google_sheet_id: string;
  sheet_name: string;
  is_active: boolean;
  token_expires_at?: string;
}
