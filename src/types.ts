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

export interface LoadedContent {
  posts: {
    readonly edges: ReadonlyArray<Post>;
  };
}

export interface PluginOptions {
  /** Create Frontmatter function */
  createFrontmatter?: (post: Post) => string;
  /** Create Preview function */
  createPreview?: (post: Post) => string;
  /** Output sub-directory, below site dir (default blog) */
  outputPath?: string;
  /** GraphQL query */
  query?: string;
  /** Translate content function */
  translateContent?: (content: string, post: Post) => string;
  /** URL of the Wordpress GraphQL endpoint **/
  url: string;
  /** Array of css files to load */
  theme?: string[];
}
