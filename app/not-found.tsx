import Link from "next/link";

export default function NotFound() {
  return <main className="not-found"><span className="kicker">404 / OFF COURSE</span><h1>Wrong turn.<br/><em>Good discovery.</em></h1><p>这个页面不存在，也许它还只是一个尚未发布的想法。</p><Link className="button dark" href="/">Back to home <span>→</span></Link></main>;
}
