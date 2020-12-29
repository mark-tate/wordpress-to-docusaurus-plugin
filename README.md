# wordpress-to-docusaurus-plugin

A Docusaurus Plugin which will import content from Wordpress based on a GraphQL query.

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
          // Output sub-directory, below site dir (default: '/blog')  
          outputPath: '/blog',  
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


