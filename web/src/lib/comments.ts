export type Comment = {
  id: string;
  post_id: string;
  parent_id: string | null;
  name: string;
  body: string;
  status: "pending" | "approved";
  created_at: string;
};
