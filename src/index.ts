import path from "path";
const existsSync = require("fs").existsSync;
const fsPromises = require("fs").promises;
const statSync = require("fs").statSync;
const utimesSync = require("fs").utimesSync;

import { request as graphQLRequest } from "graphql-request";
import {
  CreateFrontmatterCallback,
  CreatePreviewCallback,
  LoadContent,
  PluginOptions,
  Post,
  TranslateContentCallback,
} from "./types";
import { LoadContext } from "@docusaurus/types";

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
                  content,
                  modifiedGmt
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
      .replace(/<pre [^>]*class="wp-block-code"[^>]*><code [^>]*>/g, "\n```\n")
      .replace(/<\/code><\/pre>/g, "\n```\n")
      // remove WP width and height from images
      .replace(
        /(<img[^\>]*) height="[^\"]*"(.*)/g,
        (_match: string, match1: string, match2: string) => `${match1}${match2}`
      )
      // paragraphs to markdown paragraphs
      .replace(/<p[^>]*>/g, "")
      .replace(/<\/p>/g, "  \n")
      .replace(/style="[^"]*"/g, "")
      .replace(/class="/g, 'className="')
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

const writePost = (
  post: Post,
  outputPath: string,
  {
    createFrontmatter,
    createPreview,
    translateContent,
  }: {
    createFrontmatter: CreateFrontmatterCallback;
    createPreview: CreatePreviewCallback;
    translateContent: TranslateContentCallback;
  }
) => {
  const { content, modifiedGmt } = post.node;
  const blogModifiedDate = new Date(modifiedGmt);
  const blogDoc = [
    "---",
    createFrontmatter(post),
    "---",
    createPreview(post),
    "",
    "<!--truncate-->",
    translateContent(content, post),
  ].join("\n");
  return fsPromises
    .writeFile(outputPath, blogDoc)
    .then(() => {
      utimesSync(outputPath, blogModifiedDate, blogModifiedDate);
      console.log(`Saved ${outputPath}`);
      return content;
    })
    .catch((err: Error) => {
      console.error(`Error Saving ${outputPath} - ${err}`);
    });
};

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
    async loadContent(): Promise<LoadContent[]> {
      const content = await graphQLRequest(url, query);
      const { posts: { edges = [] } = {} } = content;
      const postPromises: Array<Promise<LoadContent>> = edges.reduce(
        (results: Array<Promise<LoadContent>>, post: Post) => {
          const { date: dateStr, slug, modifiedGmt } = post.node;
          const blogDate = new Date(dateStr);
          const blogFile = `${formatBlogDate(blogDate)}-${slug}.mdx`;
          const blogOutputPath = path.resolve(
            context.siteDir,
            outputPath,
            blogFile
          );
          const blogModifiedDate = new Date(modifiedGmt);
          const isExistingPost = existsSync(blogOutputPath);
          if (isExistingPost) {
            const localFile = statSync(blogOutputPath);
            const localModifiedGmt = new Date(localFile.mtime);
            if (
              blogModifiedDate.toISOString() === localModifiedGmt.toISOString()
            ) {
              console.warn(
                `The remote version of ${blogOutputPath} has not changed`
              );
              return [...results, Promise.resolve(content)];
            } else if (localModifiedGmt > blogModifiedDate) {
              console.warn(
                [
                  `The local version of ${blogOutputPath} has been modified, so will not be updated.`,
                  "Remove the local file/change to restore to the remote version",
                ].join("\n")
              );
              return [...results, Promise.resolve(content)];
            }
          }
          const writeBlogPromise = writePost(post, blogOutputPath, {
            createFrontmatter,
            createPreview,
            translateContent,
          });
          return [...results, writeBlogPromise];
        },
        []
      );
      return Promise.all(postPromises);
    },
  };
}
