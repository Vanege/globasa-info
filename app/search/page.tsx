import { Suspense } from "react";
import { getAllArticles } from "../articles";
import ArticleCardsSearchable from "../ArticleCardsSearchable";

export default async function Search() {
  const initialArticles = await getAllArticles();

  // I wanted to have the search feature in the home page itself
  // but the search requires useSearchParam that requires useSearchParams
  // it requires "client-only" meaning the list of articles won't appear in the static export...

  // this page still does not work properly on SSG...

  return <Suspense>
    <ArticleCardsSearchable initialArticles={initialArticles} />
  </Suspense>
}