export interface PluginOptions {
  /** URL of the Wordpress GraphQL endpoint **/
  url: string;
  /** Output sub-directory, below site dir (default blog) */
  outputPath?: string;
}

export interface Image {
  /** URL of image */
  node: {
    sourceUrl: string;
  };
}

export interface Post {
  node: {
    /** Content of post */
    content: string;
    /** Date of post */
    date: string;
    /** Post excerpt, used by Blog index */
    excerpt: string;
    /** Featured image */
    featuredImage?: Image;
    /** Post id */
    slug: string;
    /** Post title description */
    title: string;
  };
}
