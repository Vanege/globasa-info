import { Button } from '@mantine/core';
import Link from 'next/link';

export default async function Header() {
  return (
    <div style={{ display: "flex", padding: "2.5rem 2.5rem 1.5rem 2.5rem" }}>
      <Link href={`/`} passHref>
        <Button
          radius="xl"
          size="md"
          variant="white"
        >
          globasa.info
        </Button>
      </Link>
      <Link href={`/makale/20241220-ku-globasainfo-sen-keto`} passHref style={{ textDecoration: "none", marginLeft: "1rem" }}>
        <div style={{ backgroundColor: "white", width: "42px", height: "42px", borderRadius: "1.5rem", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "18px" }}>
          ❓
        </div>
      </Link>

      {/*
      <Link href={`/search`} passHref>
        <Button
          style={{ marginLeft: "1.5rem" }}
          radius="xl"
          size="md"
          variant="white"
        >
          🔎
        </Button>
      </Link>

      {typeof window !== "undefined" && window.location?.pathname === "/search" &&
        <div id="extra-header-item" />
      }
      */}
    </div>
  );
}