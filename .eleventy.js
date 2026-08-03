const fs = require("fs");
const path = require("path");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const markdownIt = require("markdown-it");

const md = markdownIt({ html: true });

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.setLibrary("md", md);

  eleventyConfig.addPassthroughCopy("CNAME");
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("src/images");

  eleventyConfig.addCollection("post", function (collectionApi) {
    return collectionApi.getFilteredByTag("post").reverse();
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

  eleventyConfig.addCollection("seasonalFeature", function (collectionApi) {
    let activeSlug;
    try {
      const pointerPath = path.join(__dirname, "src/_data/currentSeasonalFeature.json");
      activeSlug = JSON.parse(fs.readFileSync(pointerPath, "utf8")).active;
    } catch (err) {
      return [];
    }
    return collectionApi.getFilteredByTag("seasonal-feature").filter(function (item) {
      return item.fileSlug === activeSlug;
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
