import { useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import Footer from "../components/layout/Footer";
import { Card } from "@/components/ui/card";
import { apiGet } from "../lib/api";
import { formatDate } from "../utils/format";
import { ArrowLeft } from "lucide-react";

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

type HeroProps = {
  imageUrl?: string | null;
};

const API_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://backend.grihya.in/api";
const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

function absolutize(u?: string | null): string {
  if (!u) return "";
  if (/^(?:[a-z][a-z0-9+.+-]*:)?\/\//i.test(u) || u.startsWith("data:"))
    return u;
  return `${API_ORIGIN}/${u.replace(/^\/+/, "")}`;
}

function normalizeAssetUrl(u?: string | null): string {
  if (!u) return "";
  if (/^(?:[a-z][a-z0-9+.+-]*:)?\/\//i.test(u) || u.startsWith("data:"))
    return u;
  const trimmed = u.replace(/^\/+/, "");
  if (trimmed.startsWith("storage/")) return absolutize(trimmed);
  return absolutize(`storage/${trimmed}`);
}

function unwrap<T>(r: any): T {
  if (r && typeof r === "object" && "data" in r) return r.data as T;
  return r as T;
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

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

export default function BlogDetail() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = await apiGet<any>(`/posts/${slug}`);
        const data = unwrap<Post>(raw);
        if (!mounted) return;
        setPost(data);
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

  const Hero: React.FC<HeroProps> = ({ imageUrl }) => (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="h-[55vh] w-full overflow-hidden rounded-3xl px-5 sm:h-[80vh] md:px-12 lg:mx-auto lg:max-w-7xl"
    >
      <img
        src={normalizeAssetUrl(imageUrl) || "/placeholder-hero.jpg"}
        alt={normalizeAssetUrl(imageUrl) || "/placeholder-hero.jpg"}
        className="h-full w-full rounded-3xl object-cover"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = "/placeholder-hero.jpg";
        }}
      />
    </motion.section>
  );

  const renderCallout = (
    variant: Variant | undefined,
    children: React.ReactNode,
  ) => {
    const map: Record<Variant, string> = {
      info: "bg-blue-50 border-blue-400 text-blue-800",
      success: "bg-green-50 border-green-400 text-green-800",
      warning: "bg-yellow-50 border-yellow-400 text-yellow-800",
      danger: "bg-red-50 border-red-400 text-red-800",
    };
    const cls = map[(variant || "info") as Variant];
    return (
      <div className={`${cls} mb-6 rounded-r-lg border-l-4 p-6 sm:mb-8`}>
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
            <Tag className="mb-6 text-4xl font-bold text-black sm:text-5xl">
              {block.data?.text}
            </Tag>
          </div>
        );
      }
      case "paragraph":
        return (
          <div
            key={i}
            className="mb-6 max-w-none text-balance text-lg"
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
              className="w-full rounded-xl"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/placeholder.jpg";
              }}
            />
            {data?.caption && (
              <figcaption className="mt-2 text-sm text-slate-500">
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
            className="mb-6 rounded-r-lg border-l-4 border-[#2DB8D1] bg-gray-100 p-4 sm:mb-8"
          >
            <p className="text-lg italic text-slate-700">“{data?.text}”</p>
            {data?.author && (
              <p className="mt-1 text-right text-slate-500">- {data.author}</p>
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
          />,
        );
      case "problem_solution": {
        const data = (block as ProblemSolutionBlock).data;
        return (
          <div key={i} className="mb-12">
            <h2 className="mb-6 flex items-center text-3xl font-bold text-foreground">
              <span className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-[#249aaf] text-lg font-bold text-white">
                {data?.number ?? i + 1}
              </span>
              {data?.title}
            </h2>
            <div className="mb-6 rounded-r-lg border-l-4 border-red-400 bg-red-50 p-6">
              <h3 className="mb-3 font-semibold text-red-800">The Problem:</h3>
              <p className="text-red-700">{data?.problem}</p>
            </div>
            <div className="rounded-r-lg border-l-4 border-[#2DB8D1] bg-green-50 p-6">
              <h3 className="mb-3 font-semibold text-green-800">
                The Grihya Solution:
              </h3>
              <p className="text-green-700">{data?.solution}</p>
            </div>
          </div>
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
            <ol key={i} className="mb-6 list-decimal space-y-2 pl-6 text-lg">
              {items.map((t, idx) => (
                <li key={idx} className="text-slate-800">
                  {t}
                </li>
              ))}
            </ol>
          );
        }

        return (
          <ul key={i} className="mb-6 list-disc space-y-2 pl-6 text-lg">
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
        <div className="mx-auto max-w-3xl p-8">Loading…</div>
        <Footer />
      </div>
    );

  if (err || !post)
    return (
      <div className="min-h-screen bg-[#F5F3F0]">
        <div className="mx-auto max-w-3xl p-8 text-red-600">
          Failed to load post. {err}
        </div>
        <Footer />
      </div>
    );

  const heroBlock = post.content?.find(
    (b): b is HeroBlock => b.type === "hero",
  );
  const heroImageRaw =
    heroBlock?.data?.image_url ||
    heroBlock?.data?.image ||
    post.cover_image_url;
  const heroImage = normalizeAssetUrl(heroImageRaw);

  return (
    <div className="min-h-screen bg-white">
      <div className="relative z-20 mx-auto flex h-full w-full items-center px-8">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="max-w-4xl"
        >
          <h1 className="mb-6 text-4xl font-bold leading-tight text-white md:text-6xl">
            {heroBlock?.data?.title || post.title}
          </h1>
          <div className="mb-2 flex items-center gap-3 text-white/90">
            <span className="text-lg">
              {formatDate(post.published_at || "")}
            </span>
          </div>
          <div className="flex items-center gap-3 text-white/90">
            <span className="text-lg font-medium">
              {post.author || "Grihya Team"}
            </span>
          </div>
        </motion.div>
      </div>
      <Hero imageUrl={heroImage} />

      {/* Content container */}
      <div className="mx-auto grid grid-cols-4 px-5 py-12 md:max-w-7xl md:px-12">
        <div
          className="col-span-4 mb-10 cursor-pointer text-xl font-medium sm:col-span-1 sm:mx-auto"
          onClick={() => navigate(-1)}
        >
          <div className="justify flex items-center gap-2">
            <ArrowLeft size={20} className="block sm:hidden" />
            <ArrowLeft className="hidden sm:block" />
            <p className="text-sm sm:text-base">Back to blogs</p>
          </div>
        </div>
        <div className="col-span-4 sm:col-span-3">
          <div className="w-full">
            <Card>
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
          </div>
          <div className="col-span-4 h-[0.5px] w-full bg-gray-700" />
          <div className="mt-6 flex items-center gap-4">
            <img
              src="/icon/AuthorImage.avif"
              className="h-12 w-12 rounded-full object-cover"
            />
            <div className="">
              <p className="fon-medium text-sm text-gray-600">written by:</p>
              <p className="font-medium">{post.author || "Grihya Team"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-5 sm:px-12">
        <motion.div
          variants={containerVariants}
          whileInView="visible"
          initial="hidden"
          viewport={{ once: true, amount: 0.4 }}
          className="flex flex-col items-center justify-center gap-8 rounded-[30px] bg-[#2DB8D1] py-[100px] text-white"
        >
          <motion.h3
            variants={fadeUp}
            className="text-xl font-medium tracking-tighter md:text-2xl"
          >
            Want to Book a Call?
          </motion.h3>
          <motion.h1
            variants={fadeUp}
            className="s mx-auto max-w-3xl text-center text-4xl font-medium tracking-tighter md:text-5xl"
          >
            Ready to make your step in real state? Book Now.
          </motion.h1>
          <motion.button
            variants={fadeUp}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-full bg-white px-5 py-3 text-sm tracking-tight text-black md:text-base"
            onClick={() => navigate("/properties")}
          >
            View Properties
          </motion.button>
        </motion.div>
      </section>
    </div>
  );
}

//////////////////////////////////////////////////////////////////////////////////////////
//Handle Share
{
  /* <motion.aside
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
          liked ? "bg-[#259688]" : "bg-[#2DB8D1]"
        } rounded-full px-6 py-3 font-semibold text-white hover:bg-[#259688]`}
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
          className="flex items-center justify-center rounded-xl bg-green-600 p-3 text-white hover:bg-green-700 disabled:opacity-60"
        >
          <Share2 className="h-5 w-5" />
          &nbsp; {sharing ? "Sharing…" : `Share (${formatCount(sharesCount)})`}
        </motion.button>
        {shareNotice && (
          <p className="text-center text-xs text-slate-600">{shareNotice}</p>
        )}
      </div>
    </Card>

    <Card className="p-6 shadow-lg">
      <div className="text-center">
        <h3 className="mb-2 font-semibold text-slate-900">Author</h3>
        <Avatar className="mx-auto mb-4 h-16 w-16">
          <AvatarImage src="/Easy_Lease_logo.svg" />
          <AvatarFallback>{(post.author || "ET").slice(0, 2)}</AvatarFallback>
        </Avatar>
        <h4 className="mb-2 font-semibold text-slate-900">
          {post.author || "Grihya Team"}
        </h4>
        <p className="mb-4 text-sm text-slate-600">
          Connecting people with properties, seamlessly and securely.
        </p>
        <div className="flex justify-center">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
            Property Expert
          </span>
        </div>
      </div>
    </Card>
  </div>
</motion.aside>; */
}
///////////////////////////////////////////////////////////////////////////////////////////////////
// Share Function
// Robust share
// const handleShare = async () => {
//   if (!post) return;
//   const url = window.location.href;
//   const title = post.title;
//   const text = `Check this blog on Grihya: ${post.title}`;

//   try {
//     const minimal: ShareData = { url };
//     if (canUseNativeShare(minimal)) {
//       setSharing(true);
//       await navigator.share(minimal);
//       setSharing(false);
//       const res = await apiPost<{ shares_count: number }>(
//         `/posts/${post.slug}/share`,
//       );
//       if (typeof res.shares_count === "number")
//         setSharesCount(res.shares_count);
//       return;
//     }
//   } catch {
//     setSharing(false);
//   }

//   try {
//     const full: ShareData = { title, text, url };
//     if (canUseNativeShare(full)) {
//       setSharing(true);
//       await navigator.share(full);
//       setSharing(false);
//       const res = await apiPost<{ shares_count: number }>(
//         `/posts/${post.slug}/share`,
//       );
//       if (typeof res.shares_count === "number")
//         setSharesCount(res.shares_count);
//       return;
//     }
//   } catch {
//     setSharing(false);
//   }

//   try {
//     const wa = `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`;
//     window.open(wa, "_blank", "noopener,noreferrer");
//     const res = await apiPost<{ shares_count: number }>(
//       `/posts/${post.slug}/share`,
//     );
//     if (typeof res.shares_count === "number")
//       setSharesCount(res.shares_count);
//     return;
//   } catch {}

//   const ok = await copyToClipboard(url);
//   setShareNotice(
//     ok
//       ? "Link copied to clipboard"
//       : "Unable to share. Copy the link manually.",
//   );
//   window.setTimeout(() => setShareNotice(null), ok ? 2000 : 2500);
//   try {
//     const res = await apiPost<{ shares_count: number }>(
//       `/posts/${post.slug}/share`,
//     );
//     if (typeof res.shares_count === "number")
//       setSharesCount(res.shares_count);
//     else setSharesCount((c) => c + 1);
//   } catch {}
// };
