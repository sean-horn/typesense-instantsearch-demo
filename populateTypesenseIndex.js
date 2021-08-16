/* eslint-disable */

// Start Typesense server with `npm run typesenseServer`
// Then run `npm run populateTypesenseIndex` or `node populateTypesenseIndex.js`

const Typesense = require('typesense');

module.exports = (async () => {
  const typesense = new Typesense.Client({
    nodes: [
      {
        host: 'localhost',
        port: '8108',
        protocol: 'http',
      },
    ],
    apiKey: 'xyz',
  });

  const schema = {
    name: 'docs',
    fields: [
      { name: 'title', type: 'string' },
      { name: 'authors', type: 'string[]', facet: true },
      { name: 'publication_year', type: 'int32', facet: true },
      { name: 'average_rating', type: 'float', facet: true },
      { name: 'content', type: 'string' },
      { name: 'function_url', type: 'string' }

      // Only fields that need to be searched / filtered by need to be specified in the collection's schema
      // The documents you index can still contain other additional fields.
      //  These fields not mentioned in the schema, will be returned as is as part of the search results.
      // { name: 'image_url', type: 'string' },
    ],
    default_sorting_field: 'average_rating',
  };

  console.log('Populating index in Typesense');

  try {
    await typesense.collections('docs').delete();
    console.log('Deleting existing collection: docs');
  } catch (error) {
    // Do nothing
  }

  console.log('Creating schema: ');
  console.log(JSON.stringify(schema, null, 2));
  await typesense.collections().create(schema);

  console.log('Adding records: ');
  const docs = require('./data/documentation.json');
  try {
    const returnData = await typesense
      .collections('docs')
      .documents()
      .import(docs);
    console.log(returnData);
    console.log('Done indexing.');

    const failedItems = returnData.filter(item => item.success === false);
    if (failedItems.length > 0) {
      throw new Error(
        `Error indexing items ${JSON.stringify(failedItems, null, 2)}`
      );
    }

    return returnData;
  } catch (error) {
    console.log(error);
  }
})();
