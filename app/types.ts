export type Article = {
  // will also appear as title
  title: string;
  author?: string;
  imageUrl?: string;
  // licenseinfo should be here
  imageDescription?: string;
  isPublished: boolean;
  // Markdown
  content: string;
  // disabled because filtering on the title should be enough
  // categories: ("globasa" | "globasayen" | "kreaxey" | "intrepala" | "ijen")[];
  // links in the article itself are enough
  // relatedArticles: string[];
}

export type EnrichedArticle = Article & {
  publishDate: string;
  originalIndex: number;
};