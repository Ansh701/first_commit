import type { PublicFeedPost } from "@insips/contracts";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import Link from "next/link";

export function PublicUpdateList({ posts }: { posts: PublicFeedPost[] }) {
  return (
    <section className="marketing-section update-list-section" aria-labelledby="updates-title">
      <div className="section-heading-split"><div><p className="marketing-kicker">Recent public updates</p><h2 id="updates-title">Progress without invented applause.</h2></div><p>Updates carry a source organization, a date, and a clear destination. They do not need fake engagement numbers to be useful.</p></div>
      <div className="update-list">{posts.map((post) => <article className="update-row" key={post.id}><div className="update-date"><CalendarDays size={16} /><span>{post.publishedAt}</span></div><div><p className="marketing-kicker">{post.kind} · {post.organizationName}</p><h3>{post.title}</h3><p>{post.body}</p></div><Link className="icon-button" href={post.href} aria-label={`Open ${post.title}`}><ArrowUpRight size={17} /></Link></article>)}</div>
    </section>
  );
}
