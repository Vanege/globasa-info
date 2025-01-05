import { Button, Tooltip } from '@mantine/core';
import { IconBrandDiscord, IconInfoCircle, IconLink, IconTextSpellcheck } from '@tabler/icons-react';
import Link from 'next/link';

export default async function Header() {
  return (
    <div style={{ display: "flex", padding: "2.5rem 2.5rem 1.5rem 2.5rem", flexWrap: "wrap" }}>
      <Link href={`/`} passHref>
        <Button
          radius="xl"
          size="md"
          variant="white"
          color="var(--globasa-secondary)"
        >
          globasa.info
        </Button>
      </Link>
      <Link href={`/makale/20241220-ku-globasainfo-sen-keto`} passHref style={{ textDecoration: "none", marginLeft: "1rem" }}>
        <Tooltip label="Ku globasa.info sen keto">
          <div style={{ backgroundColor: "white", width: "42px", height: "42px", borderRadius: "1.5rem", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "18px" }}>
            <IconInfoCircle size={26} color="var(--globasa-secondary)" />
          </div>
        </Tooltip>
      </Link>
      <Link href={`https://conlang-checker.vercel.app/`} target="_blank" passHref style={{ textDecoration: "none", marginLeft: "1rem" }}>
        <Tooltip label="Lexi-li sahimonitul">
          <div style={{ backgroundColor: "white", width: "42px", height: "42px", borderRadius: "1.5rem", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "18px" }}>
            <IconTextSpellcheck size={26} color="var(--globasa-secondary)" />
          </div>
        </Tooltip>
      </Link>
      <Link href={`https://wiki.globasa.net/wiki/Globasawiki:Lista_fe_linkutul_fe_Globasa`} target="_blank" passHref style={{ textDecoration: "none", marginLeft: "1rem" }}>
        <Tooltip label="Lista fe linkutul fe Globasa">
          <div style={{ backgroundColor: "white", width: "42px", height: "42px", borderRadius: "1.5rem", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "18px" }}>
            <IconLink size={26} color="var(--globasa-secondary)" />
          </div>
        </Tooltip>
      </Link>
      <Link href={`https://discord.gg/JCaqAvapGR`} target="_blank" passHref style={{ textDecoration: "none", marginLeft: "1rem" }}>
        <Tooltip label="Resmi discord fe Globasa">
          <div style={{ backgroundColor: "white", width: "42px", height: "42px", borderRadius: "1.5rem", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "18px" }}>
            <IconBrandDiscord size={26} color="var(--globasa-secondary)" />
          </div>
        </Tooltip>
      </Link>
      <Link href={`https://www.globasa.net`} target="_blank" passHref style={{ textDecoration: "none", marginLeft: "1rem" }}>
        <Tooltip label="Resmi netodomo fe Globasa">
          <div style={{ backgroundColor: "white", width: "42px", height: "42px", borderRadius: "1.5rem", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "18px" }}>
            <img
              width="26px"
              src="/globasa_flower_transparent_128.png"
            />
          </div>
        </Tooltip>
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