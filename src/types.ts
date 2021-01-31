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
    /** Last modified date of post */
    modifiedGmt: string;
    /** Post id */
    slug: string;
    /** Post title description */
    title: string;
  };
}

export interface LoadContent {
  posts: {
    readonly edges: ReadonlyArray<Post>;
  };
}

export type CreateFrontmatterCallback = (post: Post) => string;
export type CreatePreviewCallback = (post: Post) => string;
export type TranslateContentCallback = (content: string, post: Post) => string;

export interface PluginOptions {
  /** Create Frontmatter function */
  createFrontmatter?: CreateFrontmatterCallback;
  /** Create Preview function */
  createPreview?: CreatePreviewCallback;
  /** Output sub-directory, below site dir (default blog) */
  outputPath?: string;
  /** GraphQL query */
  query?: string;
  /** Translate content function */
  translateContent?: TranslateContentCallback;
  /** URL of the Wordpress GraphQL endpoint **/
  url: string;
  /** Array of css files to load */
  theme?: string[];
}
