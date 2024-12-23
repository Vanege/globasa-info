import Link from 'next/link';
import { EnrichedArticle } from './types';
import { createSlug } from './utils';

export default function Article({ article }: { article: EnrichedArticle }) {
  return (
    <Link
      key={article.publishDate}
      href={`/makale/${article.publishDate}-${createSlug(article.title)}`}
      style={{ margin: "1rem" }}
      className="outlineOnHover"
    >
      <div style={{ width: "300px", height: "300px", borderRadius: "1.5rem", overflow: "hidden", backgroundColor: "white", position: "relative" }}>
        <div style={{ color: "--globasa-secondary", backgroundColor: "white", position: "absolute", bottom: "0px", padding: "10px 20px 10px 20px", opacity: "0.8", width: "100%", fontWeight: "500" }}>
          {article.title}
        </div>
        <div style={{ flexGrow: "1" }}>
          {article.imageUrl && <img
            src={article.imageUrl}
            alt={article.imageDescription}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />}
        </div>
      </div>
    </Link>
  );
}