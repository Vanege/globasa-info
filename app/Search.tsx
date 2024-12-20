"use client";

import { Input } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useSearchParam } from './hooks';

export default function Search() {
  const [search, setSearch] = useSearchParam("xerca", "");

  return (
    <Input
      value={search}
      onChange={(event) => setSearch(event.currentTarget.value)}
      leftSection={<IconSearch size={16} />}
      ml="1.5rem"
      size="md"
      radius="lg"
      placeholder='xerca...'
    />
  );
}