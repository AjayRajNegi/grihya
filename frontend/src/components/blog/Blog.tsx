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

  function getRandomCategory() {
    const categories = ["Articles", "Resources", "Blog"];
    const randomIndex = Math.floor(Math.random() * categories.length);
    return categories[randomIndex];
  }
  const category = getRandomCategory();

  return (
    <article className="group flex flex-col gap-3 md:gap-5">
      {/* Image */}
      <Link
        to={blogHref}
        className="relative aspect-[4/3] overflow-hidden rounded-3xl"
      >
        <img
          src={imgSrc}
          alt={post.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = "/placeholder.jpg";
          }}
        />
      </Link>

      {/* Category */}
      <span className="inline-flex w-fit rounded-full bg-[#EDF3FF] px-4 py-2 text-sm font-medium text-[#2DB8D1]">
        {category}
      </span>

      {/* Title */}
      <Link to={blogHref}>
        <h3 className="text-xl font-[400] leading-snug tracking-tight text-gray-900 transition-colors hover:text-sky-600 md:text-2xl">
          {post.title}
        </h3>
      </Link>
    </article>
  );
};

export default function BlogSection() {
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
    <div className="mx-4 mt-8 max-w-7xl rounded-3xl bg-white px-2 md:mx-auto md:px-6 lg:px-12">
      {/* Header Section */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mx-auto"
      >
        <div className="mb-6 flex items-center gap-2">
          <div className="h-2 w-2 rounded-sm bg-cyan-500"></div>
          <span className="text-base font-medium text-gray-700">Blogs</span>
        </div>

        <h1 className="mb-8 max-w-4xl text-4xl tracking-tighter text-gray-900 md:text-5xl">
          Expert advice and market <br /> updates on real estate
        </h1>
      </motion.div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-[320px] animate-pulse rounded-3xl bg-gray-100"
            />
          ))}
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3"
        >
          {posts.map((post) => (
            <motion.div key={post.id} variants={cardVariants}>
              <PostCard post={post} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
