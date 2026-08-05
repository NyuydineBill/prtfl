import { ImageResponse } from "next/og";
import { profile } from "@/lib/data/profile";

export const alt = `${profile.name} — ${profile.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0b0f14",
          color: "#f4f7fb",
          padding: "64px",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontSize: 22,
            color: "#5fd0e8",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          nyuydine.online
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 980 }}>
          <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.1 }}>
            {profile.name}
          </div>
          <div style={{ fontSize: 30, color: "#9aa7b5", lineHeight: 1.35 }}>
            {profile.role}
          </div>
          <div style={{ fontSize: 24, color: "#c5d0db", lineHeight: 1.4, maxWidth: 860 }}>
            AI product engineering · Full-stack development · Architecture consulting · Mentoring
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 22,
            color: "#9aa7b5",
          }}
        >
          <span>Available for select remote engagements</span>
          <span style={{ color: "#5fd0e8" }}>Hire · Collaborate · Learn</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
