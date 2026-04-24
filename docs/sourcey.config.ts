import { defineConfig } from "sourcey";

export default defineConfig({
  name: "symple",
  prettyUrls: "strip",
  theme: {
    colors: {
      primary: "#7c3aed",
      light: "#8b5cf6",
      dark: "#6d28d9",
    },
  },
  repo: "https://github.com/nilstate/symple-server",
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
            pages: ["protocol", "addressing", "presence"],
          },
          {
            group: "Server",
            pages: ["server", "authentication", "scaling"],
          },
          {
            group: "Clients",
            pages: ["javascript-client", "ruby-client", "cpp-client"],
          },
          {
            group: "Media",
            pages: ["webrtc-signalling", "call-manager", "media-players"],
          },
          {
            group: "Deployment",
            pages: ["configuration", "docker"],
          },
        ],
      },
    ],
  },
  navbar: {
    links: [
      { type: "github", href: "https://github.com/nilstate/symple-server" },
      { type: "npm", href: "https://www.npmjs.com/package/symple-client" },
    ],
  },
  footer: {
    links: [
      { type: "github", href: "https://github.com/nilstate/symple-server" },
    ],
  },
});
