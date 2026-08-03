const pluginRss = require("@11ty/eleventy-plugin-rss");
const markdownIt = require("markdown-it");
const yaml = require("js-yaml");

const md = markdownIt({ html: true });

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.setLibrary("md", md);

  // Eleventy's global data files (src/_data/*) only parse json/js by
  // default — register .yml so the CMS-editable seasonal feature data loads.
  eleventyConfig.addDataExtension("yml", function (contents) {
    return yaml.load(contents);
  });

  eleventyConfig.addPassthroughCopy("CNAME");
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("src/images");

  eleventyConfig.addCollection("post", function (collectionApi) {
    return collectionApi.getFilteredByTag("post").reverse();
  });

  eleventyConfig.addCollection("event", function (collectionApi) {
    return collectionApi.getFilteredByTag("event");
  });

  eleventyConfig.addCollection("ministry", function (collectionApi) {
    return collectionApi.getFilteredByTag("ministry").sort(function (a, b) {
      return a.data.order - b.data.order;
    });
  });

  eleventyConfig.addCollection("outreach", function (collectionApi) {
    return collectionApi.getFilteredByTag("outreach").sort(function (a, b) {
      return a.data.order - b.data.order;
    });
  });

  eleventyConfig.addFilter("readableDate", function (dateObj) {
    return new Date(dateObj).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    });
  });

  eleventyConfig.addFilter("htmlDateString", function (dateObj) {
    return new Date(dateObj).toISOString().slice(0, 10);
  });

  // Safely embeds a CMS-editable string as a JS string literal inside an
  // inline <script> block — dump/JSON.stringify alone doesn't escape "<",
  // so a value containing "</script>" would otherwise truncate the page.
  eleventyConfig.addFilter("jsstring", function (str) {
    return JSON.stringify(str || "").replace(/</g, "\\u003c");
  });

  eleventyConfig.addFilter("markdown", function (str) {
    return md.render(str || "");
  });

  eleventyConfig.addFilter("markdownInline", function (str) {
    return md.renderInline(str || "");
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
    },
  };
};
