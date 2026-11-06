"use client";
import { useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Comment } from "@/lib/types";

export default function CommentSection({ initial }: { initial: Comment[] }) {
  const [comments, setComments] = useState(initial);
  const [text, setText] = useState("");
  const [liked, setLiked] = useState<Set<string>>(new Set());

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    setComments((c) => [{ id: `local-${Date.now()}`, author: "You", text: t, time: "Just now", likes: 0 }, ...c]);
    setText("");
  };

  const toggleLike = (id: string) =>
    setLiked((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  return (
    <section aria-labelledby="comments-h" className="mt-10">
      <h2 id="comments-h" className="text-xl font-bold">
        Comments <span className="text-mist-500">({comments.length})</span>
      </h2>

      <form onSubmit={submit} className="mt-4">
        <label htmlFor="new-comment" className="sr-only">Write a comment</label>
        <textarea
          id="new-comment" rows={3} value={text} onChange={(e) => setText(e.target.value)} maxLength={500}
          placeholder="Share your thoughts. Please avoid spoilers for later episodes."
          className="w-full resize-y rounded-2xl border border-white/10 bg-white/5 p-4 text-sm placeholder:text-mist-500 focus:border-accent/60"
        />
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-mist-500">{text.length}/500</span>
          <button type="submit" disabled={!text.trim()} className="btn-accent disabled:cursor-not-allowed disabled:opacity-50">Post comment</button>
        </div>
      </form>

      <ul className="mt-6 space-y-5">
        {comments.map((c) => {
          const isLiked = liked.has(c.id);
          return (
            <li key={c.id} className="flex gap-3">
              <span aria-hidden className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent/20 font-display font-bold text-accent">
                {c.author[0].toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm">
                  <span className="font-semibold">{c.author}</span>
                  <span className="ml-2 text-xs text-mist-500">{c.time}</span>
                </p>
                <p className="mt-1 break-words text-sm leading-relaxed text-mist-300">{c.text}</p>
                <button
                  type="button" aria-pressed={isLiked} onClick={() => toggleLike(c.id)}
                  aria-label={`Like comment by ${c.author}`}
                  className={cn("mt-2 inline-flex items-center gap-1.5 text-xs font-medium transition", isLiked ? "text-accent" : "text-mist-500 hover:text-white")}
                >
                  <Heart aria-hidden className={cn("h-3.5 w-3.5", isLiked && "fill-accent")} />
                  {c.likes + (isLiked ? 1 : 0)}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}