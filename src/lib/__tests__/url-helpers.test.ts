import assert from "node:assert";
import { describe, it } from "node:test";
import {
  ensureHref,
  githubLabel,
  linkedinLabel,
  websiteLabel,
  getSafeCallbackUrl,
} from "../url-helpers";

describe("url-helpers", () => {
  it("keeps http/https URLs unchanged", () => {
    assert.strictEqual(
      ensureHref("https://example.com"),
      "https://example.com",
    );
    assert.strictEqual(ensureHref("http://example.com"), "http://example.com");
  });

  it("prefixes protocol for plain hostnames", () => {
    assert.strictEqual(ensureHref("example.com"), "https://example.com");
  });

  it("maps email-like input to mailto", () => {
    assert.strictEqual(
      ensureHref("user@example.com"),
      "mailto:user@example.com",
    );
  });

  it("returns empty string for empty input", () => {
    assert.strictEqual(ensureHref(""), "");
  });

  it("returns stable display labels", () => {
    assert.strictEqual(websiteLabel(), "Portfolio");
    assert.strictEqual(linkedinLabel(), "LinkedIn");
    assert.strictEqual(githubLabel(), "GitHub");
  });

  it("only allows same-site paths as callback URLs", () => {
    assert.strictEqual(getSafeCallbackUrl("/dashboard"), "/dashboard");
    assert.strictEqual(
      getSafeCallbackUrl("/vi/builder/1?tab=x"),
      "/vi/builder/1?tab=x",
    );

    for (const unsafe of [
      null,
      "",
      "javascript:alert(1)",
      "https://evil.example",
      "//evil.example",
      "/\\evil.example",
      "/\t/evil.example",
    ]) {
      assert.strictEqual(getSafeCallbackUrl(unsafe), "/dashboard");
    }
  });
});
