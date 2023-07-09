import { build, emptyDir } from "https://deno.land/x/dnt@0.34.0/mod.ts";
import { version } from "../version.ts";

await emptyDir("./npm");

await build({
  test: false, // Turned off to avoid publishing tests
  typeCheck: false,
  entryPoints: ["./mod.ts"],
  rootTestDir: "./tests",
  outDir: "./npm",
  shims: {
    // Tests require `Deno.test` and `Deno.env`.
    // Although `Deno.version` is used, it doesn't need to be shimmed since
    // it won't be used when the user runs the module in Node.
    deno: "dev",

    // https://deno.land/std/async/delay.ts relies on DOMException.
    // This is only used in tests.
    domException: "dev", //  Only used in tests.
  },
  compilerOptions: {
    // https://github.com/microsoft/TypeScript/wiki/Node-Target-Mapping
    lib: ["es2022"],
    target: "ES2021",
  },
  package: {
    name: "@subho57/serpapi",
    version,
    description:
      "Scrape and parse search engine results using SerpApi with Browser support",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/subho57/serpapi-javascript.git",
    },
    homepage: "https://subho57.github.io/serpapi-javascript",
    bugs: {
      url: "https://github.com/subho57/serpapi-javascript/issues",
    },
    sideEffects: false,
    publishConfig: {
      "access": "public",
    },
    keywords: [
      "serpapi",
      "serp api",
      "scrape",
      "google",
      "search",
      "api",
      "query",
      "json",
      "html",
      "image",
      "automated",
      "localization",
      "news",
      "seo",
      "walmart",
      "yahoo",
      "yandex",
      "scholar",
      "bing",
      "baidu",
      "ebay",
      "youtube",
      "apple",
      "store",
      "app",
      "homedepot",
      "naver",
      "duckduckgo",
    ],
    contributors: [
      { name: "Sebastian Quek", email: "sebastian@serpapi.com" },
      { name: "Yicheng Zhou", email: "zyc9012@gmail.com" },
      { name: "Subhankar Pal", email: "developer.subho57@gmail.com" },
    ],
  },
});

Deno.copyFileSync("LICENSE", "npm/LICENSE");
Deno.copyFileSync("README.md", "npm/README.md");
