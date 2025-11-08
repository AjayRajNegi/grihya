import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { Search as SearchIcon, Clock as ClockIcon } from 'lucide-react';
import { apiGet } from '@/lib/api';
import { formatCount, formatDate } from '@/utils/format';
import { FaHeart, FaComment, FaShare, FaArrowRight } from 'react-icons/fa';

// Types (kept in sync with your BlogSection)
type Variant = 'info' | 'success' | 'warning' | 'danger';
type HeadingBlock = { type: 'heading'; data: { text: string; level?: number } };
type ParagraphBlock = { type: 'paragraph'; data: { html: string } };
type ImageBlock = { type: 'image'; data: { src_url?: string; src?: string; alt?: string; caption?: string } };
type QuoteBlock = { type: 'quote'; data: { text: string; author?: string } };
type CalloutBlock = { type: 'callout'; data: { variant?: Variant; html: string } };
type ProblemSolutionBlock = { type: 'problem_solution'; data: { number?: number; title: string; problem: string; solution: string } };
type HeroBlock = { type: 'hero'; data: { image_url?: string; image?: string; title?: string } };
type Block = HeadingBlock | ParagraphBlock | ImageBlock | QuoteBlock | CalloutBlock | ProblemSolutionBlock | HeroBlock;

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

type ApiPaginated<T> = { data: T[]; meta?: { current_page?: number; last_page?: number; per_page?: number; total?: number }; links?: unknown };
function isPaginated<T>(v: unknown): v is ApiPaginated<T> {
    return !!v && typeof v === 'object' && 'data' in (v as any) && Array.isArray((v as any).data);
}

// Helpers
function getErrorMessage(e: unknown): string {
    if (e instanceof Error) return e.message;
    if (typeof e === 'string') return e;
    try { return JSON.stringify(e); } catch { return 'Unknown error'; }
}
function isNew(iso?: string | null, days = 10): boolean {
    if (!iso) return false;
    const pub = new Date(iso).getTime();
    if (Number.isNaN(pub)) return false;
    return Date.now() - pub < days * 24 * 60 * 60 * 1000;
}
function stripHtml(html?: string | null) {
    if (!html) return '';
    return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}
function readingTimeFromBlocks(blocks?: Block[]) {
    const text = (blocks || [])
        .map(b => {
            if (b.type === 'paragraph') return stripHtml((b as any).data?.html);
            if (b.type === 'heading') return (b as any).data?.text || '';
            if (b.type === 'quote') return (b as any).data?.text || '';
            if (b.type === 'callout') return stripHtml((b as any).data?.html);
            if (b.type === 'problem_solution') return `${(b as any).data?.problem || ''} ${(b as any).data?.solution || ''}`;
            return '';
        })
        .join(' ');
    const words = text.split(/\s+/).filter(Boolean).length;
    const mins = Math.max(1, Math.round(words / 200));
    return `${mins} min read`;
}
function clampWords(s?: string | null, maxWords = 30): string {
    if (!s) return '';
    const parts = s.trim().split(/\s+/);
    if (parts.length <= maxWords) return s;
    return parts.slice(0, maxWords).join(' ') + '…';
}
function initials(name?: string | null) {
    if (!name) return 'EL';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
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

// Card (identical styling to BlogSection)
const PostCard: React.FC<{ post: Post }> = ({ post }) => {
    const imgSrc = post.cover_image_url || '/placeholder.jpg';
    const blogHref = `/blog/${encodeURIComponent(post.slug)}`;
    const showNew = isNew(post.published_at, 10);

    return (
        <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <Link to={blogHref} className="relative block">
                <div className="relative h-48 w-full overflow-hidden">
                    <img
                        src={imgSrc}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={e => { (e.currentTarget as HTMLImageElement).src = '/placeholder.jpg'; }}
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-black/0 to-transparent opacity-90" />
                    {/* {showNew && (
                        <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
                            New
                        </span>
                    )} */}
                </div>
            </Link>

            <div className="flex-1 p-6">
                <Link to={blogHref}>
                    <h3 className="mb-2 line-clamp-2 text-xl font-bold text-gray-900 transition-colors hover:text-emerald-700">
                        {post.title}
                    </h3>
                </Link>
                {!!post.excerpt && <p className="mb-4 text-sm text-gray-600">{clampWords(post.excerpt, 28)}</p>}
                <div className="mb-2 flex items-center gap-3 text-xs text-gray-500">
                    <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 font-semibold">
                        {initials(post.author)}
                    </div>
                    <span className="truncate">{post.author || 'EasyLease Team'}</span>
                    <span className="select-none text-gray-300">•</span>
                    <time title={post.published_at || ''}>{formatDate(post.published_at || '')}</time>
                    {/* <span className="select-none text-gray-300">•</span> */}
                    {/* <span className="inline-flex items-center gap-1">
                        <ClockIcon className="h-3.5 w-3.5" /> {readingTimeFromBlocks(post.content)}
                    </span> */}
                </div>
            </div>

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
                            <FaHeart className="text-rose-500" /> {formatCount(post.likes_count)}
                        </span>
                        <span className="inline-flex items-center gap-1" title="Comments">
                            <FaComment className="text-sky-500" /> {formatCount(post.comments_count)}
                        </span>
                        <span className="inline-flex items-center gap-1" title="Shares">
                            <FaShare className="text-emerald-600" /> {formatCount(post.shares_count)}
                        </span>
                    </div>
                </div>
            </div>
        </article>
    );
};

const AllBlogs: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const page = Number(searchParams.get('page') || 1);
    const perPage = 12;
    const navigate = useNavigate();

    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);
    const [total, setTotal] = useState(0);
    const [lastPage, setLastPage] = useState(1);
    const [q, setQ] = useState(searchParams.get('q') || '');

    useEffect(() => {
        let mounted = true;
        (async () => {
            setLoading(true);
            setErr(null);
            try {
                const qs = new URLSearchParams();
                qs.set('limit', String(perPage));
                qs.set('page', String(page));

                const res = await apiGet<Post[] | ApiPaginated<Post>>(`/posts?${qs.toString()}`);
                if (!mounted) return;

                if (isPaginated<Post>(res)) {
                    setPosts(res.data || []);
                    setTotal(res.meta?.total ?? res.data.length);
                    setLastPage(res.meta?.last_page ?? 1);
                } else {
                    setPosts(res || []);
                    setTotal((res || []).length);
                    setLastPage(1);
                }
            } catch (e) {
                if (mounted) setErr(getErrorMessage(e) || 'Failed to load posts');
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [page, q]);

    const setPage = (p: number) => {
        const next = new URLSearchParams(searchParams);
        next.set('page', String(p));
        if (q.trim()) next.set('q', q.trim()); else next.delete('q');
        setSearchParams(next);
    };
    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const next = new URLSearchParams(searchParams);
        if (q.trim()) next.set('q', q.trim()); else next.delete('q');
        next.set('page', '1');
        setSearchParams(next);
    };

    const list = useMemo(() => {
        const needle = q.trim().toLowerCase();
        if (!needle) return posts;
        return posts.filter(p => (p.title || '').toLowerCase().includes(needle));
    }, [posts, q]);

    return (
        <div className="bg-gray-50 min-h-screen">
            <Header />

            {/* Hero */}
            <section className="bg-gradient-to-br from-emerald-50 via-white to-cyan-50 border-b border-slate-200/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="mb-6 flex items-center gap-3">
                            <button
                                type="button"
                                aria-label="Go back"
                                onClick={() => navigate(-1)}
                                className="inline-flex h-9 w-9 -ml-1 items-center justify-center bg-transparent text-gray-800 hover:text-gray-900 active:scale-95 cursor-pointer"
                                title="Back"
                            >
                                <span className="text-2xl md:text-3xl font-extrabold leading-none">
                                    <img src="/less_than_icon.png" alt="Back-Icon" />
                                </span>
                            </button>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-slate-900">All Blog Posts</h1>
                                <p className="mt-1 text-slate-600">Insights, tips and guides to help you make smarter decisions.</p>
                            </div>
                        </div>


                        <form onSubmit={onSubmit} className="w-full sm:w-auto">
                            <div className="relative">
                                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                    placeholder="Search articles…"
                                    className="w-full sm:w-80 pl-9 pr-3 py-2 rounded-md border border-slate-300 bg-white text-sm focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                            </div>
                        </form>
                    </div>
                </div>
            </section>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Error */}
                {err && <div className="mb-4 rounded bg-red-50 text-red-700 p-3">{err}</div>}

                {/* Loading */}
                {loading ? (
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : list.length === 0 ? (
                    <div className="rounded-xl bg-white p-8 shadow-sm text-center">
                        <h3 className="text-xl font-semibold text-slate-800 mb-1">No posts found</h3>
                        <p className="text-slate-600">Try a different keyword.</p>
                    </div>
                ) : (
                    <>
                        {/* Grid (same card design) */}
                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {list.map(post => <PostCard key={post.id} post={post} />)}
                        </div>

                        {/* Pagination */}
                        {lastPage > 1 && (
                            <div className="mt-10 flex items-center justify-center gap-3">
                                <button
                                    className="px-3 py-1.5 rounded border border-slate-300 disabled:opacity-50"
                                    disabled={page <= 1}
                                    onClick={() => setPage(page - 1)}
                                >
                                    Prev
                                </button>
                                <span className="text-sm text-slate-700">Page {page} of {lastPage} · {total} total</span>
                                <button
                                    className="px-3 py-1.5 rounded border border-slate-300 disabled:opacity-50"
                                    disabled={page >= lastPage}
                                    onClick={() => setPage(page + 1)}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default AllBlogs;