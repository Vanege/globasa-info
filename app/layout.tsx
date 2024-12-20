import "@mantine/core/styles.css";
import "./globals.css"
import React, { Suspense } from "react";
import {
  MantineProvider,
  ColorSchemeScript,
  mantineHtmlProps,
} from "@mantine/core";
import { theme } from "../theme";
import Header from "./Header";

export const siteConfig = {
  name: 'globasa.info',
  url: 'https://globasa.info',
  description: 'Multi-kultural jurna fe multi-kultural linguaje',
};

export const metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export default function RootLayout({ children }: { children: any }) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
        <link rel="shortcut icon" href="/favicon.svg" />
        <link
          rel="preload"
          href="/subtle-prism.svg"
          as="image"
          type="image/svg+xml"
        />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body style={{ backgroundColor: "#00820b" }} className="background">
        <MantineProvider theme={theme}>
          <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <Suspense>
              <Header />
            </Suspense>
            {children}
          </div>
        </MantineProvider>
      </body>
    </html>
  );
}