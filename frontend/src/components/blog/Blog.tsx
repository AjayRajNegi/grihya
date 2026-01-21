import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "@/lib/api";
import { motion, Variants } from "framer-motion";

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

const PostCard: React.FC<{ post: Post }> = ({ post }) => {
  const imgSrc = post.cover_image_url || "/placeholder.jpg";
  const blogHref = `/blog/${encodeURIComponent(post.slug)}`;

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Link
      to={blogHref}
      className="group flex items-center gap-4 rounded-2xl border-[0.5px] border-[#2DB8D1] bg-white transition-all duration-300 hover:shadow-lg"
    >
      {/* Image */}
      <div className="relative h-[140px] w-[180px] flex-shrink-0 overflow-hidden rounded-xl">
        <img
          src={imgSrc}
          alt={post.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = "/placeholder.jpg";
          }}
        />
      </div>

      {/* Content */}
      <div className="flex flex-col justify-center gap-2">
        {/* Date */}
        <span className="text-sm text-gray-500">
          {formatDate(post.published_at)}
        </span>

        {/* Title */}
        <h3 className="text-lg font-normal leading-snug text-gray-900 transition-colors group-hover:text-gray-700">
          {post.title}
        </h3>
      </div>
    </Link>
  );
};

export default function BlogSection({
  header,
  title,
  highlight,
  description,
}: {
  header?: string;
  title: string;
  highlight: string;
  description: string;
}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await apiGet<Post[] | ApiPaginated<Post>>("/posts?limit=3");
        const list = isPaginated<Post>(res) ? res.data : res;
        if (mounted) setPosts(list || []);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 1.2,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const cardVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 40,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-12">
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
        {/* Left Side - Header */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="my-auto lg:w-[280px] lg:flex-shrink-0"
        >
          <h2 className="mb-4 text-3xl font-normal leading-tight text-gray-900 lg:text-4xl">
            {`${title}`} <span className="text-cyan-500">{`${highlight}`}</span>
          </h2>
          {header && (
            <h2 className="mb-4 text-3xl font-normal leading-tight text-gray-900 lg:text-4xl">
              {header}
            </h2>
          )}
          <p className="text-base text-gray-600">{`${description}`}</p>
        </motion.div>

        {/* Right Side - Articles Grid */}
        {loading ? (
          <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-[160px] animate-pulse rounded-2xl bg-gray-100"
              />
            ))}
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-2"
          >
            {posts.map((post) => (
              <motion.div key={post.id} variants={cardVariants}>
                <PostCard post={post} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
