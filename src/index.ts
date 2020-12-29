import fs from "fs";
import path from "path";

import { request as graphQLRequest } from "graphql-request";
import { PluginOptions, Post } from "./types";
import { LoadContext } from "@docusaurus/types";

const query = ` 
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

function formatBlogDate(date: Date): String {
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
  const { outputPath = "blog", url } = options;
  return {
    name: "wordpress-docusaurus-blog-plugin",
    async loadContent() {
      const response = await graphQLRequest(url, query);
      const { edges } = response.posts;
      edges.forEach((post: Post) => {
        const {
          content,
          date: dateStr,
          excerpt,
          featuredImage,
          slug,
          title,
        } = post.node;
        const blogDate = new Date(dateStr);
        const blogFile = `${formatBlogDate(blogDate)}-${slug}.md`;
        const blogPath = path.resolve(context.siteDir, outputPath, blogFile);
        const blogContent = content
          .replace(/<br>/g, "  \n")
          .replace(/<\/li>/g, "</li>  \n")
          .replace(/<pre class="wp-block-code"><code>/g, "\n```\n")
          .replace(/<\/code><\/pre>/g, "\n```\n")
          .replace(/<p>/g, "")
          .replace(/<\/p>/g, "  `\n");
        const blogDoc = [
          "---",
          `slug: ${slug}`,
          `title: ${title}`,
          "---",
          excerpt,
          featuredImage
            ? `<img src="${featuredImage.node.sourceUrl}" />\n`
            : null,
          "<!--truncate-->",
          blogContent,
        ].join("\n");
        fs.writeFile(blogPath, blogDoc, function (err) {
          if (err) throw err;
          console.log(`Created Blog ${blogPath}`);
        });
      });
    },
  };
}
