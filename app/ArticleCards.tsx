import { EnrichedArticle } from './types';
import Article from './Article';

export default function ArticleCards({ initialArticles }: { initialArticles: EnrichedArticle[] }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", marginRight: "-1rem", marginLeft: "-1rem" }}>
      {initialArticles.map(article => <Article article={article} />)}
    </div>
  );
}