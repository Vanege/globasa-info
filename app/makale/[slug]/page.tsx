import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Markdown from 'react-markdown';
import { getAllArticles } from '../../articles';
import { createSlug } from '../../utils';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function contentIntoDescription(content: string, maxLength: number = 150): string {
  if (content.length <= maxLength) return content;
  const truncated = content.slice(0, maxLength).split(' ').slice(0, -1).join(' ');
  return `${truncated}...`;
}

export async function generateStaticParams() {
  const articles = await getAllArticles();
  return articles.map((article) => ({
    slug: `${article.publishDate}-${createSlug(article.title)}`,
  }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const resolvedParams = await params;
  const articles = await getAllArticles();
  const [publishDate] = resolvedParams.slug.split('-');
  const article = articles.find(a => a.publishDate === publishDate);

  if (!article) {
    return {};
  }

  const description = contentIntoDescription(article.content);

  return {
    title: article.title,
    description,
    openGraph: {
      title: article.title,
      description,
      images: [article?.imageUrl ?? ""],
      type: 'article',
      authors: [article?.author ?? ""],
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const resolvedParams = await params;
  const articles = await getAllArticles();
  const [publishDate] = resolvedParams.slug.split('-');
  const titleInSlug = resolvedParams.slug.substring(resolvedParams.slug.indexOf('-') + 1);
  const article = articles.find(a => a.publishDate === publishDate && createSlug(a.title) === titleInSlug && a.isPublished === true);

  if (!article) {
    notFound();
  }

  return (
    <article style={{ flexGrow: 1, width: "100%", backgroundColor: "white", marginTop: "1rem", padding: "0.5rem 2.5rem 2rem 2.5rem" }}>
      <h1 style={{ marginBottom: 0 }}>{article.title}</h1>
      <div style={{ display: "flex" }}>
        {article.author &&
          <address>fal {article.author}</address>
        }
        <div style={{ marginLeft: "20px" }}>fe {article.publishDate.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3")}</div>
      </div>
      {article.imageUrl &&
        <figure style={{ marginLeft: "0px", marginRight: "0px" }}>
          <img
            src={article.imageUrl}
            alt={article.imageDescription}
          />
          <figcaption style={{ fontSize: "14px", color: "gray" }}>{article.imageDescription}</figcaption>
        </figure>
      }

      <div>
        <Markdown>{article.content}</Markdown>
      </div>
    </article>
  );
}