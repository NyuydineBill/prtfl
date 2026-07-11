export type Comment = {
  id: string;
  post_id: string;
  name: string;
  body: string;
  status: "pending" | "approved";
  created_at: string;
};
