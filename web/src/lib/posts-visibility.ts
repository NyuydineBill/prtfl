/** A post is public only when published and its publish time has arrived. */
export function isPostLive(post: {
  status: string;
  published_at: string | null;
}, now = new Date()) {
  if (post.status !== "published" || !post.published_at) return false;
  return new Date(post.published_at).getTime() <= now.getTime();
}

export function postScheduleLabel(post: {
  status: string;
  published_at: string | null;
}, now = new Date()) {
  if (post.status === "draft") return "Draft";
  if (post.status === "published" && post.published_at) {
    const at = new Date(post.published_at);
    if (at.getTime() > now.getTime()) {
      return `Scheduled · ${at.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })}`;
    }
    return "Published";
  }
  return post.status;
}
