import { defineConfig } from "sourcey";

export default defineConfig({
  name: "symple",
  theme: {
    colors: {
      primary: "#4a90d9",
      light: "#5ea0e9",
      dark: "#3a7bc8",
    },
  },
  repo: "https://github.com/nilstate/symple-docs",
  editBranch: "main",
  editBasePath: "docs",
  navigation: {
    tabs: [
      {
        tab: "Documentation",
        slug: "",
        groups: [
          {
            group: "Getting Started",
            pages: ["introduction", "quickstart"],
          },
          {
            group: "Protocol",
            pages: ["protocol", "signalling"],
          },
        ],
      },
    ],
  },
  navbar: {
    links: [
      { type: "github", href: "https://github.com/nilstate/symple-server" },
    ],
  },
  footer: {
    links: [
      { type: "github", href: "https://github.com/nilstate/symple-server" },
    ],
  },
});
