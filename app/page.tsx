import { getAllArticles } from './articles';
import ArticleCards from './ArticleCards';

export default async function Home() {
  const initialArticles = await getAllArticles();

  return <div style={{ margin: "0 2.5rem 0 2.5rem" }}>
    <ArticleCards initialArticles={initialArticles} />
  </div>
}