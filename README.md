# wordpress-to-docusaurus-plugin

A Docusaurus Plugin which will import content from Wordpress based on a GraphQL query.

Designed to work with Blog posts but could be used as an example for anyone, trying to  
create something bespoke.  

## Configuration

`yarn add wordpress-to-docusaurus-plugin`

or

`npm install --save wordpress-to-docusaurus-plugin`

Add this plugin to the plugins array in `docusaurus.config.js`.

```
module.exports = {  
  // ...  
  plugins: [  
    [require.resolve('wordpress-to-docusaurus-plugin'),  
        {  
          // URL of the Wordpress GraphQL endpoint   
          url: 'http://my-wordpress-instance/graphql',   
        }  
    ]  
  ]  
}  
```

## Extending

###  outputPath 

`outputPath?: string`

The `outputPath` option can be ued to define a custom output path (default=blog).  

###  query

`query?: string`

The `query` option can be ued to define a cutom query.  

###  translateContent

`translateContent: (content: string, post: Post) => string`

The`translateContent` option can be configured to convert the basic WP html semantics back to 
markdown, you can extend the default translate function or replace it.

###  createFrontmatter

`createFrontmatter: (post: Post) => string`

The`createFrontmatter` option can be configured to create custom Frontmatter.

###  createPreview

`createPreview: (post: Post) => string`

The`createPreview` option can be configured to create a custom preview.

###  Sample config

```
import { defaultTranslate } from 'wordpress-to-docusaurus-plugin';

const myCreateFrontmatter = (post:Post):string => {
    return ''; // return your frontmatter
}

const myCreatePreview = (post:Post):string => {
    return ''; // return your preview
}

const myTranslateContent = content => {
    return defaultTranslate(content).replace('some html', 'some markdown');
}

const myQuery = ` 
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

module.exports = {  
  // ...  
  plugins: [  
    [require.resolve('wordpress-to-docusaurus-plugin'),  
        {  
          // Custom Frontmatter creator   
          createFrontmatter: myCreateFrontmatter,
          // Custom Preview creator   
          createPreview: myCreatePreview,
          // Output sub-directory, below site dir (default: 'blog')  
          outputPath: 'my/custom/path', 
          // Custom query   
          query: myQuery,
          // Custom Content translator   
          translateContent: myTranslateContent,
          // URL of the Wordpress GraphQL endpoint   
          url: 'http://my-wordpress-instance/graphql',   
        }  
    ]  
  ]  
}  

``` 

## Usage

When your site is built, the GraphQL endpoint for your configured `url` will be  
used to import posts to the path specified by `outputPath`.

From your Docusaurus project root directory

`yarn start`

or

`yarn build`


