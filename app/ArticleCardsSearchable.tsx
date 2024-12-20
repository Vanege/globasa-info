"use client";

import { Portal } from '@mantine/core';
import { useSearchParam } from './hooks';
import { useMemo, useState } from 'react';
import { EnrichedArticle } from './types';
import Search from './Search';
import Article from './Article';

export default function ArticleCards({ initialArticles }: { initialArticles: EnrichedArticle[] }) {
  const [search] = useSearchParam("xerca", "");

  const filteredArticles = useMemo<EnrichedArticle[]>(() => {
    return initialArticles.filter(article =>
      search ? `${article.title} ${article.content}`.toLowerCase().includes(search.toLowerCase()) : true
    );
  }, [search, initialArticles])

  return (
    <div style={{ display: "flex", flexWrap: "wrap", marginTop: "1rem", marginRight: "-1rem", marginLeft: "-1rem" }}>
      {filteredArticles.map(article => <Article article={article} />)}
      <Portal target="#extra-header-item">
        <Search />
      </Portal>
    </div>
  );
}