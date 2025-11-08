import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { Share2, MessageSquare } from "lucide-react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiGet, apiPost } from "../lib/api";
import { formatCount, formatDate } from "../utils/format";

const API_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://backend.easylease.services/api";
const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

function absolutize(u?: string | null): string {
  if (!u) return "";
  if (/^(?:[a-z][a-z0-9+.+-]*:)?\/\//i.test(u) || u.startsWith("data:"))
    return u;
  return `${API_ORIGIN}/${u.replace(/^\/+/, "")}`;
}

// Map disk paths (e.g., "blog/x.jpg") to public "/storage/..." then absolutize
function normalizeAssetUrl(u?: string | null): string {
  if (!u) return "";
  if (/^(?:[a-z][a-z0-9+.+-]*:)?\/\//i.test(u) || u.startsWith("data:"))
    return u;
  const trimmed = u.replace(/^\/+/, "");
  if (trimmed.startsWith("storage/")) return absolutize(trimmed);
  return absolutize(`storage/${trimmed}`);
}

// Unwrap Laravel Resource { data: {...} } → {...}
function unwrap<T>(r: any): T {
  if (r && typeof r === "object" && "data" in r) return r.data as T;
  return r as T;
}

// Types
type Variant = "info" | "success" | "warning" | "danger";

type HeadingBlock = { type: "heading"; data: { text: string; level?: number } };
type ParagraphBlock = { type: "paragraph"; data: { html: string } };
type ImageBlock = {
  type: "image";
  data: {
    src_url?: string;
    src?: string;
    image_url?: string;
    image?: string;
    alt?: string;
    caption?: string;
  };
};
type QuoteBlock = { type: "quote"; data: { text: string; author?: string } };
type CalloutBlock = {
  type: "callout";
  data: { variant?: Variant; html: string };
};
type ProblemSolutionBlock = {
  type: "problem_solution";
  data: { number?: number; title: string; problem: string; solution: string };
};
type HeroBlock = {
  type: "hero";
  data: { image_url?: string; image?: string; title?: string };
};
type ListBlock = {
  type: "list";
  data: { style?: "ul" | "ol"; items?: string[] };
};

type Block =
  | HeadingBlock
  | ParagraphBlock
  | ImageBlock
  | QuoteBlock
  | CalloutBlock
  | ProblemSolutionBlock
  | HeroBlock
  | ListBlock;

type Post = {
  id: number;
  slug: string;
  title: string;
  excerpt?: string | null;
  author?: string | null;
  published_at?: string | null | Date;
  likes_count: number;
  shares_count: number;
  comments_count: number;
  cover_image_url?: string | null;
  content?: Block[];
};

type CommentT = {
  id: number;
  name?: string | null;
  email?: string | null;
  body: string;
  created_at?: string;
  parent_id?: number | null;
};

function getErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  try {
    return JSON.stringify(e);
  } catch {
    return "Unknown error";
  }
}

// Share helpers
function isMobileUA() {
  if (typeof navigator === "undefined") return false;
  return /android|iphone|ipad|ipod/i.test(navigator.userAgent);
}
function canUseNativeShare(shareData?: ShareData) {
  if (typeof window === "undefined" || typeof navigator === "undefined")
    return false;
  const secure = window.isSecureContext;
  const hasShare = "share" in navigator;
  const canShare =
    typeof navigator.canShare === "function"
      ? navigator.canShare(shareData || {})
      : true;
  return secure && hasShare && isMobileUA() && canShare;
}
async function copyToClipboard(text: string) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* empty */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    return true;
  } catch {
    return false;
  }
}

export default function BlogDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string>("");

  const [likeCount, setLikeCount] = useState<number>(0);
  const [liked, setLiked] = useState<boolean>(false);

  const [sharesCount, setSharesCount] = useState<number>(0);
  const [sharing, setSharing] = useState(false);
  const [shareNotice, setShareNotice] = useState<string | null>(null);

  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = await apiGet<any>(`/posts/${slug}`);
        const data = unwrap<Post>(raw);
        if (!mounted) return;
        setPost(data);
        setLikeCount(data.likes_count || 0);
        setSharesCount(data.shares_count || 0);
      } catch (e: unknown) {
        if (mounted) setErr(getErrorMessage(e) || "Failed to load post");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [slug]);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (post) {
      const wasLiked = localStorage.getItem(`blog_liked_${post.id}`) === "1";
      setLiked(wasLiked);
    }
  }, [post]);

  const likedKey = useMemo(() => (post ? `blog_liked_${post.id}` : ""), [post]);

  // Toggle like/unlike with rollback and server sync
  const handleLike = async () => {
    if (!post) return;
    const prevLiked = liked;
    const prevCount = likeCount;

    try {
      if (liked) {
        setLiked(false);
        setLikeCount((c) => Math.max(0, c - 1));
        localStorage.removeItem(likedKey);
        const res = await apiPost<{ likes_count: number }>(
          `/posts/${post.slug}/unlike`
        );
        if (typeof res.likes_count === "number") setLikeCount(res.likes_count);
      } else {
        setLiked(true);
        setLikeCount((c) => c + 1);
        localStorage.setItem(likedKey, "1");
        const res = await apiPost<{ likes_count: number }>(
          `/posts/${post.slug}/like`
        );
        if (typeof res.likes_count === "number") setLikeCount(res.likes_count);
      }
    } catch {
      // rollback on error
      setLiked(prevLiked);
      setLikeCount(prevCount);
      if (prevLiked) localStorage.setItem(likedKey, "1");
      else localStorage.removeItem(likedKey);
    }
  };

  // Robust share
  const handleShare = async () => {
    if (!post) return;
    const url = window.location.href;
    const title = post.title;
    const text = `Check this blog on EasyLease: ${post.title}`;

    try {
      const minimal: ShareData = { url };
      if (canUseNativeShare(minimal)) {
        setSharing(true);
        await navigator.share(minimal);
        setSharing(false);
        const res = await apiPost<{ shares_count: number }>(
          `/posts/${post.slug}/share`
        );
        if (typeof res.shares_count === "number")
          setSharesCount(res.shares_count);
        return;
      }
    } catch {
      setSharing(false);
    }

    try {
      const full: ShareData = { title, text, url };
      if (canUseNativeShare(full)) {
        setSharing(true);
        await navigator.share(full);
        setSharing(false);
        const res = await apiPost<{ shares_count: number }>(
          `/posts/${post.slug}/share`
        );
        if (typeof res.shares_count === "number")
          setSharesCount(res.shares_count);
        return;
      }
    } catch {
      setSharing(false);
    }

    try {
      const wa = `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`;
      window.open(wa, "_blank", "noopener,noreferrer");
      const res = await apiPost<{ shares_count: number }>(
        `/posts/${post.slug}/share`
      );
      if (typeof res.shares_count === "number")
        setSharesCount(res.shares_count);
      return;
    } catch {}

    const ok = await copyToClipboard(url);
    setShareNotice(
      ok
        ? "Link copied to clipboard"
        : "Unable to share. Copy the link manually."
    );
    window.setTimeout(() => setShareNotice(null), ok ? 2000 : 2500);
    try {
      const res = await apiPost<{ shares_count: number }>(
        `/posts/${post.slug}/share`
      );
      if (typeof res.shares_count === "number")
        setSharesCount(res.shares_count);
      else setSharesCount((c) => c + 1);
    } catch {}
  };

  type HeroProps = {
    imageUrl?: string | null;
    title: string;
    date?: string | Date | null;
    author?: string | null;
  };

  const Hero: React.FC<HeroProps> = ({ imageUrl, title, date, author }) => (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative mx-4 mt-4 h-[70vh] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden rounded-3xl"
    >
      <div className="absolute inset-0 bg-black/50 z-10 rounded-3xl" />
      <img
        src={normalizeAssetUrl(imageUrl) || "/placeholder-hero.jpg"}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover rounded-3xl"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = "/placeholder-hero.jpg";
        }}
      />

      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="absolute top-8 left-8 z-20"
      >
        <button
          type="button"
          aria-label="Go back"
          onClick={() => navigate(-1)}
          className="inline-flex h-9 w-9 -ml-1 items-center justify-center bg-transparent text-gray-800 hover:text-gray-900 active:scale-95"
          title="Back"
        >
          <span className="text-2xl font-extrabold leading-none rounded-full bg-white/90 hover:bg-white text-slate-900">
            <img src="/less_than_icon.png" alt="Back Button" />
          </span>
        </button>
      </motion.div>

      <div className="relative z-20 container mx-auto px-8 h-full flex items-center">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="max-w-4xl"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            {title}
          </h1>
          <div className="flex items-center gap-3 text-white/90 mb-2">
            <span className="text-lg">{formatDate(date || "")}</span>
          </div>
          <div className="flex items-center gap-3 text-white/90">
            <span className="font-medium text-lg">
              {author || "EasyLease Team"}
            </span>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );

  const renderCallout = (
    variant: Variant | undefined,
    children: React.ReactNode
  ) => {
    const map: Record<Variant, string> = {
      info: "bg-blue-50 border-blue-400 text-blue-800",
      success: "bg-green-50 border-green-400 text-green-800",
      warning: "bg-yellow-50 border-yellow-400 text-yellow-800",
      danger: "bg-red-50 border-red-400 text-red-800",
    };
    const cls = map[(variant || "info") as Variant];
    return (
      <div className={`${cls} border-l-4 p-6 rounded-r-lg mb-8`}>
        {children}
      </div>
    );
  };

  const renderBlock = (block: Block, i: number): React.ReactNode => {
    if (!block) return null;
    switch (block.type) {
      case "heading": {
        const lvl = Math.min(Math.max(Number(block.data?.level || 2), 1), 4);
        const Tag = `h${lvl}` as keyof JSX.IntrinsicElements;
        return (
          <div key={i}>
            <Tag className="text-3xl font-bold text-slate-900 mb-6">
              {block.data?.text}
            </Tag>
          </div>
        );
      }
      case "paragraph":
        return (
          <div
            key={i}
            className="prose prose-lg max-w-none mb-6"
            dangerouslySetInnerHTML={{
              __html: (block as ParagraphBlock).data?.html || "",
            }}
          />
        );
      case "image": {
        const data = (block as ImageBlock).data;
        const raw =
          data?.src_url || data?.src || data?.image_url || data?.image || "";
        const src = normalizeAssetUrl(raw);
        return (
          <figure key={i} className="my-8">
            <img
              src={src || "/placeholder.jpg"}
              alt={data?.alt || ""}
              className="rounded-xl w-full"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/placeholder.jpg";
              }}
            />
            {data?.caption && (
              <figcaption className="text-sm text-slate-500 mt-2">
                {data.caption}
              </figcaption>
            )}
          </figure>
        );
      }
      case "quote": {
        const data = (block as QuoteBlock).data;
        return (
          <div
            key={i}
            className="border-l-4 border-[#2AB09C] pl-6 py-4 bg-slate-50 rounded-r-lg mb-8"
          >
            <p className="text-lg italic text-slate-700">“{data?.text}”</p>
            {data?.author && (
              <p className="text-right mt-2 text-slate-500">- {data.author}</p>
            )}
          </div>
        );
      }
      case "callout":
        return renderCallout(
          (block as CalloutBlock).data?.variant,
          <div
            style={{ overflowWrap: "anywhere" }}
            key={i}
            dangerouslySetInnerHTML={{
              __html: (block as CalloutBlock).data?.html || "",
            }}
          />
        );
      case "problem_solution": {
        const data = (block as ProblemSolutionBlock).data;
        return (
          <motion.div
            key={i}
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold text-foreground mb-6 flex items-center">
              <span className="bg-gradient-to-r from-[#2AB09C] to-[#125A4F] text-white rounded-full w-10 h-10 flex items-center justify-center text-lg font-bold mr-4">
                {data?.number ?? i + 1}
              </span>
              {data?.title}
            </h2>
            <div className="bg-red-50 border-l-4 border-red-400 p-6 mb-6 rounded-r-lg">
              <h3 className="font-semibold text-red-800 mb-3">The Problem:</h3>
              <p className="text-red-700">{data?.problem}</p>
            </div>
            <div className="bg-green-50 border-l-4 border-[#2AB09C] p-6 rounded-r-lg">
              <h3 className="font-semibold text-green-800 mb-3">
                The EasyLease Solution:
              </h3>
              <p className="text-green-700">{data?.solution}</p>
            </div>
          </motion.div>
        );
      }

      case "list": {
        const data = (block as ListBlock).data || {};
        const items = Array.isArray(data.items)
          ? data.items.filter((t) => typeof t === "string" && t.trim() !== "")
          : [];

        if (!items.length) return null;

        if ((data.style || "ul") === "ol") {
          return (
            <ol key={i} className="list-decimal pl-6 mb-6 space-y-2">
              {items.map((t, idx) => (
                <li key={idx} className="text-slate-800">
                  {t}
                </li>
              ))}
            </ol>
          );
        }

        return (
          <ul key={i} className="list-disc pl-6 mb-6 space-y-2">
            {items.map((t, idx) => (
              <li key={idx} className="text-slate-800">
                {t}
              </li>
            ))}
          </ul>
        );
      }

      case "hero":
        return null;
      default:
        return null;
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#F5F3F0]">
        <Header />
        <div className="max-w-3xl mx-auto p-8">Loading…</div>
        <Footer />
      </div>
    );

  if (err || !post)
    return (
      <div className="min-h-screen bg-[#F5F3F0]">
        <Header />
        <div className="max-w-3xl mx-auto p-8 text-red-600">
          Failed to load post. {err}
        </div>
        <Footer />
      </div>
    );

  const heroBlock = post.content?.find(
    (b): b is HeroBlock => b.type === "hero"
  );
  const heroImageRaw =
    heroBlock?.data?.image_url ||
    heroBlock?.data?.image ||
    post.cover_image_url;
  const heroImage = normalizeAssetUrl(heroImageRaw);

  return (
    <div className="min-h-screen bg-[#F5F3F0]">
      <Header />

      <Hero
        imageUrl={heroImage}
        title={heroBlock?.data?.title || post.title}
        date={post.published_at || ""}
        author={post.author || "EasyLease Team"}
      />

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="p-8 shadow-lg">
              <article className="prose prose-lg max-w-none">
                {post.content
                  ?.filter((b) => b.type !== "hero")
                  .map((b, i) => renderBlock(b, i))}
                {(!post.content || post.content.length === 0) && (
                  <p className="text-slate-600">
                    No content available for this article.
                  </p>
                )}
              </article>
            </Card>
          </motion.div>

          <motion.aside
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-8 space-y-6">
              <Card className="p-6 text-center shadow-lg">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleLike}
                  className={`w-full ${
                    liked ? "bg-[#259688]" : "bg-[#2AB09C]"
                  } hover:bg-[#259688] text-white font-semibold py-3 px-6 rounded-full`}
                  aria-pressed={liked}
                >
                  {liked ? "Unlike" : "Like"} ({formatCount(likeCount)})
                </motion.button>
              </Card>

              <Card className="p-6 shadow-lg">
                <div className="grid grid-cols-1 gap-3">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleShare}
                    disabled={sharing}
                    className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white p-3 rounded-xl flex items-center justify-center"
                  >
                    <Share2 className="w-5 h-5" />
                    &nbsp;{" "}
                    {sharing
                      ? "Sharing…"
                      : `Share (${formatCount(sharesCount)})`}
                  </motion.button>
                  {shareNotice && (
                    <p className="text-xs text-slate-600 text-center">
                      {shareNotice}
                    </p>
                  )}
                </div>
              </Card>

              <Card className="p-6 shadow-lg">
                <div className="text-center">
                  <h3 className="font-semibold text-slate-900 mb-2">Author</h3>
                  <Avatar className="w-16 h-16 mx-auto mb-4">
                    <AvatarImage src="/Easy_Lease_logo.svg" />
                    <AvatarFallback>
                      {(post.author || "ET").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <h4 className="font-semibold text-slate-900 mb-2">
                    {post.author || "EasyLease Team"}
                  </h4>
                  <p className="text-sm text-slate-600 mb-4">
                    Connecting people with properties, seamlessly and securely.
                  </p>
                  <div className="flex justify-center">
                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm">
                      Property Expert
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </motion.aside>
        </div>
      </div>

      <Comments slug={post.slug} initialCount={post.comments_count || 0} />

      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 bg-[#2AB09C] hover:bg-[#259688] text-white p-3 rounded-full shadow-lg"
          aria-label="Scroll to top"
        >
          ↑
        </button>
      )}
      <Footer />
    </div>
  );
}

function Comments({
  slug,
  initialCount = 0,
}: {
  slug: string;
  initialCount?: number;
}) {
  const [comments, setComments] = useState<CommentT[]>([]);
  const [count, setCount] = useState<number>(initialCount);
  const [body, setBody] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [posting, setPosting] = useState<boolean>(false);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = await apiGet<any>(`/posts/${slug}/comments`);
        const list = Array.isArray(raw) ? raw : raw?.data ?? [];
        if (mounted) {
          setComments(list);
          setCount(list.length);
        }
      } catch (e: unknown) {
        if (mounted) setErr(getErrorMessage(e) || "Failed to load comments");
      }
    })();
    return () => {
      mounted = false;
    };
  }, [slug, initialCount]);

  const submit = async () => {
    if (!body.trim()) return;
    setPosting(true);
    setErr("");
    try {
      const payload: Partial<CommentT> = { body, name: name || undefined };
      const c = await apiPost<CommentT, typeof payload>(
        `/posts/${slug}/comments`,
        payload
      );
      setComments([c, ...comments]);
      setBody("");
      setCount((n) => n + 1);
    } catch (e: unknown) {
      setErr(getErrorMessage(e) || "Failed to post comment");
    } finally {
      setPosting(false);
    }
  };

  return (
    <motion.section
      initial={{ y: 50, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1 }}
      className="mt-16 max-w-4xl m-auto px-4"
    >
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="w-6 h-6 text-[#2AB09C]" />
        <h2 className="text-2xl font-bold">Comments ({count})</h2>
      </div>

      {err && <p className="text-red-600 mb-4">{err}</p>}

      <div className="space-y-6 mb-8">
        {comments.map((comment) => (
          <motion.div
            key={comment.id}
            initial={{ x: -20, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            className="flex gap-4 p-4 bg-muted/30 rounded-xl"
          >
            <Avatar>
              <AvatarFallback>
                {(comment.name || "G")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-sm">
                  {comment.name || "Guest"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {comment.created_at
                    ? new Date(comment.created_at).toLocaleString()
                    : ""}
                </span>
              </div>
              <p className="text-sm">{comment.body}</p>
            </div>
          </motion.div>
        ))}
        {comments.length === 0 && (
          <p className="text-sm text-slate-500">No comments yet.</p>
        )}
      </div>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Add a comment</h3>
        <div className="grid gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name (optional)"
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2AB09C]"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full p-3 border rounded-xl resize-none h-24 focus:outline-none focus:ring-2 focus:ring-[#2AB09C]"
          />
          <Button
            onClick={submit}
            disabled={posting}
            className="text-white bg-[#2AB09C] hover:bg-[#259688] rounded-full px-6 py-3"
          >
            {posting ? "Posting…" : "Post Comment"}
          </Button>
        </div>
      </Card>
    </motion.section>
  );
}
