import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg,#fffaf0,#ead8b9)",
          color: "#171717",
          borderRadius: 36
        }}
      >
        <div style={{ width: 58, height: 58, borderRadius: 999, background: "#c89538", marginBottom: 12 }} />
        <div style={{ width: 104, height: 12, borderRadius: 999, background: "#171717" }} />
        <div style={{ width: 72, height: 8, borderRadius: 999, background: "#c89538", marginTop: 10 }} />
      </div>
    ),
    size
  );
}
