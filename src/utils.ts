import { config } from "./config.ts";
import { InvalidTimeoutError, MissingApiKeyError } from "./errors.ts";

type UrlParameters = Record<
  string,
  string | number | boolean | undefined | null
>;

export function validateApiKey(value: string | undefined | null): string;
export function validateApiKey(
  value: string | undefined | null,
  allowNull: boolean,
): string | undefined;
export function validateApiKey(
  value: string | undefined | null,
  allowNull = false,
): string | undefined {
  // `api_key` can be null to support unmetered queries.
  if (allowNull && value === null) {
    return undefined;
  }
  const key = value ?? config.api_key;
  if (!key) throw new MissingApiKeyError();
  return key;
}

export function validateTimeout(value: number | undefined): number {
  const timeout = value ?? config.timeout;
  if (timeout <= 0) throw new InvalidTimeoutError();
  return timeout;
}

/**
 * This `_internals` object is needed to support stubbing/spying of
 * fetch, execute and getBaseUrl.
 * https://deno.land/manual@v1.28.3/basics/testing/mocking
 *
 * If fetch is stubbed via `globalThis`, the test phase of the npm build fails.
 * ```ts
 * const fetchStub = stub(globalThis, "fetch", resolvesNext([new Response("data")]));
 * ```
 *
 * [`dnt`](https://github.com/denoland/dnt) shims `fetch` by relying on the
 * `undici` package. It replaces all references to `fetch` with `dntShim.fetch`.
 * As a side effect, stubbing `globalThis.fetch` becomes incorrect; we want to
 * stub `dntShim.fetch` instead.
 *
 * As a workaround, the `_internals` object serves as an indirection and we
 * stub the `fetch` key of this object instead.
 */
export const _internals = {
  fetch: fetch,
  execute: execute,
  getBaseUrl: getBaseUrl,
};

/** Facilitates stubbing in tests, e.g. localhost as the base url */
function getBaseUrl() {
  return "https://serpapi.com";
}

// TODO(seb): get module version too
function getSource() {
  try {
    // Check if running in Node.js
    // deno-lint-ignore no-explicit-any
    if ((globalThis as any)?.process?.version) {
      // deno-lint-ignore no-explicit-any
      const nodeVersion = (globalThis as any).process.version.replace("v", "");
      return `nodejs@${nodeVersion}`;
    }

    // Assumes running in Deno instead
    return `deno@${Deno.version.deno}`;
  } catch {
    // If something unexpectedly occurs, revert to "nodejs".
    return "nodejs";
  }
}

export function buildUrl<P extends UrlParameters>(
  path: string,
  parameters: P,
): string {
  const nonUndefinedParams: [string, string][] = Object.entries(parameters)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => [key, `${value}`]);
  const searchParams = new URLSearchParams(nonUndefinedParams);
  return `${_internals.getBaseUrl()}${path}?${searchParams}`;
}

export async function execute<P extends UrlParameters>(
  path: string,
  parameters: P,
  timeout: number,
): Promise<Response> {
  const url = buildUrl(path, {
    ...parameters,
    source: getSource(),
  });
  return await _internals.fetch(url, {
    signal: AbortSignal.timeout(timeout),
  });
}
