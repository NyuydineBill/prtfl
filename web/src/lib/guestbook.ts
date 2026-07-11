export type GuestbookEntry = {
  id: string;
  name: string;
  role: string | null;
  message: string;
  status: "pending" | "approved";
  created_at: string;
};
