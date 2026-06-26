

// Local fallback image
const FALLBACK_IMG = "https://picsum.photos/1200/800";

function timeAgo(dateString) {
  if (!dateString) return "";
  const d = new Date(dateString);
  const diff = Date.now() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
}

export default function HotTopics({ article, onMouseEnter, onMouseLeave }) {
  if (!article) {
    return null;
  }

  const image = article.urlToImage || FALLBACK_IMG;

  return (
    <div
      className="w-full flex flex-col lg:flex-row gap-6 items-stretch"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="relative lg:w-3/5 rounded-xl overflow-hidden shadow-lg">
        <img
          src={image}
          alt={article.title}
          className="w-full h-72 lg:h-[360px] object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col justify-end p-6">
          <h2 className="text-3xl lg:text-4xl text-white font-bold max-w-[80%] leading-tight">
            {article.title}
          </h2>

          <div className="flex items-center gap-4 text-white/90 mt-4 text-sm">
            <span>{timeAgo(article.publishedAt)}</span>
            <span>•</span>
            <span>{article.source?.name}</span>
          </div>
        </div>
      </div>

      <div className="lg:w-2/5 flex flex-col justify-center pr-4">
        <p className="text-xl lg:text-2xl font-serif text-gray-800 mb-4 leading-relaxed">
          {article.description?.slice(0, 200) || ""}
        </p>

        {article.description && (
          <p className="text-gray-600 text-sm leading-relaxed">
            {article.description}{" "}
            <a
              href={article.url}
              target="_blank"
              className="text-gray-700 underline ml-1 cursor-pointer hover:text-black"
            >
              read more
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
