/**
 * Smoke test works for Node.js 7 and newer.
 */

const Dotenv = require("dotenv");
const {
  config,
  getJson,
  getHtml,
  getJsonBySearchId,
  getHtmlBySearchId,
  getAccount,
  getLocations,
} = require("serpapi");

Dotenv.config();
const apiKey = process.env.SERPAPI_TEST_KEY;

const run = async () => {
  console.log("running", process.versions.node);

  const params = {
    q: "Coffee",
    api_key: apiKey,
  };

  let searchId;

  {
    console.log("getJson async await");
    const page1 = await getJson(Object.assign({ engine: "google" }, params));
    searchId = page1["search_metadata"]["id"];
    if (!page1["organic_results"]) throw new Error("No organic results");
    if (page1.next) {
      const page2 = await page1.next();
      if (!page2["organic_results"]) throw new Error("No organic results");
    }
  }

  {
    console.log("getJson callback");
    getJson(Object.assign({ engine: "google" }, params), (page1) => {
      if (!page1["organic_results"]) throw new Error("No organic results");
      if (page1.next) {
        page1.next((page2) => {
          if (!page2["organic_results"]) throw new Error("No organic results");
        });
      }
    });
  }

  {
    console.log("getJson using global config");
    config.api_key = apiKey;
    const page1 = await getJson({ engine: "google", q: "Coffee" });
    if (!page1["organic_results"]) throw new Error("No organic results");
    if (page1.next) {
      const page2 = await page1.next();
      if (!page2["organic_results"]) throw new Error("No organic results");
    }
  }

  {
    console.log("getJson (old API) async await");
    const page1 = await getJson("google", params);
    searchId = page1["search_metadata"]["id"];
    if (!page1["organic_results"]) throw new Error("No organic results");
    if (page1.next) {
      const page2 = await page1.next();
      if (!page2["organic_results"]) throw new Error("No organic results");
    }
  }

  {
    console.log("getJson (old API) callback");
    getJson("google", params, (page1) => {
      if (!page1["organic_results"]) throw new Error("No organic results");
      if (page1.next) {
        page1.next((page2) => {
          if (!page2["organic_results"]) throw new Error("No organic results");
        });
      }
    });
  }

  {
    console.log("getJson (old API) using global config");
    config.api_key = apiKey;
    const page1 = await getJson("google", { q: "Coffee" });
    if (!page1["organic_results"]) throw new Error("No organic results");
    if (page1.next) {
      const page2 = await page1.next();
      if (!page2["organic_results"]) throw new Error("No organic results");
    }
  }

  {
    console.log("getJson pagination loop (async/await)");
    const links = [];
    let page = await getJson("google", params);
    while (page) {
      links.push(...page.organic_results.map((r) => r.link));
      if (links.length >= 30) break;
      page = page.next ? await page.next() : undefined;
    }
    if (links.length < 30) throw new Error("Incorrect number of links");
  }

  {
    console.log("getJson pagination loop (callback)");
    const links = [];
    getJson("google", params, (page) => {
      links.push(...page.organic_results.map((r) => r.link));
      if (links.length < 30 && page.next) {
        page.next();
      } else {
        if (links.length < 30) throw new Error("Incorrect number of links");
      }
    });
  }

  {
    console.log("getHtml");
    const html = await getHtml(Object.assign({ engine: "google" }, params));
    if (html.length < 1000) throw new Error("Incorrect HTML");

    getHtml(Object.assign({ engine: "google" }, params), (html) => {
      if (html.length < 1000) throw new Error("Incorrect HTML");
    });
  }

  {
    console.log("getHtml (old API)");
    const html = await getHtml("google", params);
    if (html.length < 1000) throw new Error("Incorrect HTML");

    getHtml("google", params, (html) => {
      if (html.length < 1000) throw new Error("Incorrect HTML");
    });
  }

  {
    console.log("getJsonBySearchId");
    config.api_key = apiKey;
    const json = await getJsonBySearchId(searchId);
    if (!json["organic_results"]) throw new Error("No organic results");

    getJsonBySearchId(searchId, {}, (json) => {
      if (!json["organic_results"]) throw new Error("No organic results");
    });
  }

  {
    console.log("getHtmlBySearchId");
    config.api_key = apiKey;
    const html = await getHtmlBySearchId(searchId);
    if (html.length < 1000) throw new Error("Incorrect HTML");

    getHtmlBySearchId(searchId, {}, (html) => {
      if (html.length < 1000) throw new Error("Incorrect HTML");
    });
  }

  {
    console.log("getAccount");
    config.api_key = apiKey;
    const info = await getAccount();
    if (!info["account_email"]) throw new Error("Incorrect account info");

    getAccount({}, (info) => {
      if (!info["account_email"]) throw new Error("Incorrect account info");
    });
  }

  {
    console.log("getLocations");
    const locations = await getLocations({ limit: 3 });
    if (locations.length !== 3) throw new Error("Incorrect locations length");

    getLocations({ limit: 3 }, (locations) => {
      if (locations.length !== 3) throw new Error("Incorrect locations length");
    });
  }

  console.log("success", process.versions.node);
};

run().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
