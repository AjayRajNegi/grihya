import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaHeart, FaComment, FaShare, FaArrowRight } from "react-icons/fa";
import { apiGet } from "@/lib/api";
import { formatCount, formatDate } from "@/utils/format";

type Variant = "info" | "success" | "warning" | "danger";

type HeadingBlock = { type: "heading"; data: { text: string; level?: number } };
type ParagraphBlock = { type: "paragraph"; data: { html: string } };
type ImageBlock = {
  type: "image";
  data: { src_url?: string; src?: string; alt?: string; caption?: string };
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

type Block =
  | HeadingBlock
  | ParagraphBlock
  | ImageBlock
  | QuoteBlock
  | CalloutBlock
  | ProblemSolutionBlock
  | HeroBlock;

export type Post = {
  id: number;
  slug: string;
  title: string;
  excerpt?: string | null;
  author?: string | null;
  published_at?: string | null;
  likes_count: number;
  shares_count: number;
  comments_count: number;
  cover_image_url?: string | null;
  content?: Block[];
};

type ApiPaginated<T> = { data: T[]; meta?: unknown; links?: unknown };

function isPaginated<T>(v: unknown): v is ApiPaginated<T> {
  return (
    !!v &&
    typeof v === "object" &&
    "data" in (v as any) &&
    Array.isArray((v as any).data)
  );
}

function getErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  try {
    return JSON.stringify(e);
  } catch {
    return "Unknown error";
  }
}

// Helpers
function isNew(iso?: string | null, days = 10): boolean {
  if (!iso) return false;
  const pub = new Date(iso).getTime();
  if (Number.isNaN(pub)) return false;
  return Date.now() - pub < days * 24 * 60 * 60 * 1000;
}

function initials(name?: string | null) {
  if (!name) return "EL";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function clampWords(s?: string | null, maxWords = 30): string {
  if (!s) return "";
  const parts = s.trim().split(/\s+/);
  if (parts.length <= maxWords) return s;
  return parts.slice(0, maxWords).join(" ") + "…";
}

// Skeleton
const SkeletonCard: React.FC = () => (
  <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
    <div className="relative h-48 w-full bg-gray-200 animate-pulse" />
    <div className="p-6">
      <div className="mb-3 h-5 w-2/3 rounded bg-gray-200 animate-pulse" />
      <div className="mb-2 h-4 w-full rounded bg-gray-200 animate-pulse" />
      <div className="mb-4 h-4 w-5/6 rounded bg-gray-200 animate-pulse" />
    </div>
    <div className="mt-auto border-t border-gray-100 bg-gray-50 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 rounded bg-gray-200 animate-pulse" />
        <div className="flex items-center gap-4">
          <div className="h-4 w-10 rounded bg-gray-200 animate-pulse" />
          <div className="h-4 w-10 rounded bg-gray-200 animate-pulse" />
          <div className="h-4 w-10 rounded bg-gray-200 animate-pulse" />
        </div>
      </div>
    </div>
  </div>
);

// Card
const PostCard: React.FC<{ post: Post }> = ({ post }) => {
  const imgSrc = post.cover_image_url || "/placeholder.jpg";
  const newBadge = isNew(post.published_at, 10);
  const blogHref = `/blog/${encodeURIComponent(post.slug)}`;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* Image */}
      <Link to={blogHref} className="relative block">
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={imgSrc}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/placeholder.jpg";
            }}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-black/0 to-transparent opacity-90" />
          {newBadge && (
            <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
              New
            </span>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="flex-1 p-6">
        <Link to={blogHref}>
          <h3 className="mb-2 line-clamp-2 text-xl font-bold text-gray-900 transition-colors hover:text-emerald-700">
            {post.title}
          </h3>
        </Link>

        {!!post.excerpt && (
          <p className="mb-4 text-sm text-gray-600">
            {clampWords(post.excerpt, 28)}
          </p>
        )}

        <div className="mb-2 flex items-center gap-3 text-xs text-gray-500">
          <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 font-semibold">
            {initials(post.author)}
          </div>
          <span className="truncate">{post.author || "Grihya Team"}</span>
          <span className="select-none text-gray-300">•</span>
          <time title={post.published_at || ""}>
            {formatDate(post.published_at || "")}
          </time>
        </div>
      </div>

      {/* Fixed bottom action bar */}
      <div className="mt-auto border-t border-gray-100 bg-gray-50 px-6 py-3">
        <div className="flex items-center justify-between">
          <Link
            to={blogHref}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
            aria-label={`Read more: ${post.title}`}
          >
            Read More <FaArrowRight className="h-3.5 w-3.5" />
          </Link>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="inline-flex items-center gap-1" title="Likes">
              <FaHeart className="text-rose-500" />{" "}
              {formatCount(post.likes_count)}
            </span>
            <span className="inline-flex items-center gap-1" title="Comments">
              <FaComment className="text-sky-500" />{" "}
              {formatCount(post.comments_count)}
            </span>
            <span className="inline-flex items-center gap-1" title="Shares">
              <FaShare className="text-emerald-600" />{" "}
              {formatCount(post.shares_count)}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};

export default function BlogSection() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await apiGet<Post[] | ApiPaginated<Post>>("/posts?limit=6");
        const list = isPaginated<Post>(res) ? res.data : res;
        if (mounted) setPosts(list || []);
      } catch (e: unknown) {
        if (mounted) setErr(getErrorMessage(e) || "Failed to load posts");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Sort latest first by published_at, fallback by id
  const sortedPosts = React.useMemo(() => {
    const getTime = (p: Post) =>
      p.published_at ? new Date(p.published_at).getTime() : 0;
    return [...posts].sort((a, b) => getTime(b) - getTime(a) || b.id - a.id);
  }, [posts]);

  const visiblePosts = sortedPosts.slice(0, 3);
  const showViewAll = sortedPosts.length > 3;

  return (
    <section className="py-16 bg-gradient-to-b from-blue-50 via-white to-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section title */}
        <div className="text-center mb-8">
          <h2 className="relative inline-block text-2xl md:text-3xl font-bold text-gray-900">
            Latest Blog Posts
            <span
              aria-hidden="true"
              className="absolute left-1/2 -bottom-2 h-1 w-20 md:w-24 -translate-x-1/2 rounded-full bg-[#2AB09C]"
            />
          </h2>
          <p className="mt-3 text-sm text-gray-600">
            Fresh insights, guides, and tips from the Grihya team
          </p>
          {err && (
            <div className="mx-auto mt-3 inline-block rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {err}
            </div>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : sortedPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <div className="mb-2 text-lg font-semibold text-gray-800">
              No blog posts found
            </div>
            <p className="mb-4 max-w-md text-sm text-gray-600">
              When new articles are published, you’ll see them here. Check back
              soon!
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full bg-[#2AB09C] px-4 py-2 text-sm font-medium text-white shadow hover:bg-[#289d89] focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
            >
              Go Home
            </Link>
          </div>
        ) : (
          <>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {visiblePosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

            {showViewAll && (
              <div className="mt-8 text-center">
                <Link
                  to="/blog"
                  className="inline-flex items-center gap-2 text-[#2AB09C] hover:text-[#1C7E70FF] font-medium"
                >
                  View All <FaArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
