import { promises as fs } from 'fs';
import path from 'path';
import { EnrichedArticle } from './types';

let enrichedArticles: EnrichedArticle[] = [];

async function fetchArticles() {
  const articlesDirectory = path.join(process.cwd(), '/app/articles');
  const fileNames = await fs.readdir(articlesDirectory);
  const articleFiles = fileNames.filter(file => file.endsWith('.ts'));

  enrichedArticles = await Promise.all(
    articleFiles.map(async (file) => {
      const { article } = await import(`./articles/${file}`);
      const publishDate = file.slice(0, 8); // Extract YYYYMMDD from filename

      return {
        ...article,
        publishDate,
      } as EnrichedArticle;
    })
  );
}

export async function getAllArticles(search = ""): Promise<EnrichedArticle[]> {
  if (enrichedArticles.length <= 0) {
    await fetchArticles();
  }

  return enrichedArticles
    .filter(article => article.isPublished)
    .filter(article => `${article.title} ${article.content}`.includes(search))
    .sort((a, b) => b.publishDate.localeCompare(a.publishDate));
}