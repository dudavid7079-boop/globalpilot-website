import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const alt = "GlobalPilot — Build beyond borders";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(<div style={{ width:"100%", height:"100%", display:"flex", flexDirection:"column", justifyContent:"space-between", padding:"70px", background:"#f1efe8", color:"#102b2b", fontFamily:"Arial" }}><div style={{ display:"flex", alignItems:"center", fontSize:28, fontWeight:700 }}><span style={{ width:45, height:45, borderRadius:"50%", background:"#102b2b", color:"white", display:"flex", alignItems:"center", justifyContent:"center", marginRight:16 }}>G</span>GlobalPilot</div><div style={{ display:"flex", flexDirection:"column", fontSize:92, fontWeight:700, letterSpacing:"-5px", lineHeight:.95 }}><span>Make ideas</span><span style={{ color:"#ff5b35" }}>travel further.</span></div><div style={{ display:"flex", justifyContent:"space-between", fontSize:20 }}><span>AI PRODUCTS · AUTOMATION · GLOBAL GROWTH</span><span>{new URL(siteConfig.url).hostname} ↗</span></div></div>, size);
}
