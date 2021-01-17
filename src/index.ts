import path from "path";
const fs = require("fs").promises;

import { request as graphQLRequest } from "graphql-request";
import { LoadedContent, PluginOptions, Post } from "./types";
import { LoadContext, PluginContentLoadedActions } from "@docusaurus/types";

const defaultQuery = ` 
    query { 
        posts { 
            edges { 
                node { 
                  id
                  slug
                  title
                  date
                  excerpt
                  featuredImage {
                    node {
                      sourceUrl
                    }
                  }
                  content
                } 
            } 
        } 
    }
`;

export function defaultTranslateContent(content: string): string {
  return (
    content
      // replace newlines
      .replace(/<br>/g, "  \n")
      // move lists to a new line
      .replace(/<\/li>/g, "</li>  \n")
      // code-blocks to markdown code block
      .replace(/<pre class="wp-block-code"><code>/g, "\n```\n")
      .replace(/<\/code><\/pre>/g, "\n```\n")
      // remove WP width and height from images
      .replace(
        /(<img[^\>]*) height="[^\"]*"(.*)/g,
        (_match: string, match1: string, match2: string) => `${match1}${match2}`
      )
      // paragraphs to markdown paragraphs
      .replace(/<p>/g, "")
      .replace(/<\/p>/g, "  `\n")
  );
}

export function defaultCreateFrontmatter(post: Post): string {
  const { slug, title } = post.node;
  return [`slug: ${slug}`, `title: ${title}`].join("\n");
}
export function defaultCreatePreview(post: Post): string {
  const { excerpt, featuredImage } = post.node;
  let preview = [excerpt];
  if (featuredImage && featuredImage.node.sourceUrl) {
    preview.push(`<img src="${featuredImage.node.sourceUrl}" />`);
  }
  return preview.join("\n");
}

function formatBlogDate(date: Date): string {
  var yyyy = date.getFullYear().toString();
  var mm = (date.getMonth() + 1).toString();
  var dd = date.getDate().toString();

  var mmChars = mm.split("");
  var ddChars = dd.split("");

  return (
    yyyy +
    "-" +
    (mmChars[1] ? mm : "0" + mmChars[0]) +
    "-" +
    (ddChars[1] ? dd : "0" + ddChars[0])
  );
}

export default function pluginWordpressToDocusaurus(
  context: LoadContext,
  options: PluginOptions
) {
  const {
    createFrontmatter = defaultCreateFrontmatter,
    createPreview = defaultCreatePreview,
    query = defaultQuery,
    outputPath = "blog",
    translateContent = defaultTranslateContent,
    url,
    theme,
  } = options;
  return {
    name: "wordpress-docusaurus-blog-plugin",
    getClientModules() {
      return theme;
    },
    async loadContent(): Promise<LoadedContent> {
      const response = await graphQLRequest(url, query);
      return response;
    },
    async contentLoaded({
      content,
    }: {
      readonly content: LoadedContent;
      readonly actions: PluginContentLoadedActions;
    }): Promise<string[]> {
      const { posts: { edges = [] } = {} } = content;
      const postPromises = edges.map(async (post: Post) => {
        const { content, date: dateStr, slug } = post.node;
        const blogDate = new Date(dateStr);
        const blogFile = `${formatBlogDate(blogDate)}-${slug}.mdx`;
        const blogPath = path.resolve(context.siteDir, outputPath, blogFile);
        const blogDoc = [
          "---",
          createFrontmatter(post),
          "---",
          createPreview(post),
          "",
          "<!--truncate-->",
          translateContent(content, post),
        ].join("\n");
        return fs
          .writeFile(blogPath, blogDoc)
          .then(() => {
            console.log(`Saved ${blogPath}`);
          })
          .catch((err: Error) => {
            console.error(`Error Saving ${blogPath} - ${err}`);
          });
      });
      return await Promise.all(postPromises);
    },
  };
}
