import connectDB from "../../lib/db";
import Article from "../../models/Article";
import { notFound } from "next/navigation";
import { MoveLeft, Calendar, User } from "lucide-react";
import Link from "next/link";

async function getArticle(id) {
  try {
    await connectDB();
    const article = await Article.findById(id).lean();
    if (!article) return null;
    // Serializable JSON
    return JSON.parse(JSON.stringify(article));
  } catch (error) {
    console.error("Error fetching article:", error);
    return null;
  }
}

export default async function ArticlePage({ params }) {
  const { id } = await params;
  const article = await getArticle(id);

  if (!article) {
    notFound();
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back Button */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-black mb-8 transition-colors"
      >
        <MoveLeft size={20} />
        <span className="font-medium">Back to News</span>
      </Link>

      {/* Header */}
      <header className="mb-10">
        <div className="flex flex-wrap gap-4 items-center text-sm text-gray-500 mb-6 font-medium">
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full capitalize">
            {article.category}
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={16} />
            {new Date(article.publishedAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>

        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
          {article.title}
        </h1>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
            <User size={24} />
          </div>
          <div>
            <p className="text-gray-900 font-semibold">{article.author}</p>
            <p className="text-gray-500 text-xs">Author</p>
          </div>
        </div>
      </header>

      {/* Hero Image */}
      {article.imageUrl && (
        <div className="relative w-full h-[400px] md:h-[500px] mb-12 rounded-2xl overflow-hidden shadow-lg">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <article className="prose prose-lg md:prose-xl max-w-none text-gray-800 leading-relaxed">
        {/* We are preserving whitespace or rendering MD if needed inside div */}
        <div className="whitespace-pre-wrap font-serif">{article.content}</div>
      </article>
    </main>
  );
}
