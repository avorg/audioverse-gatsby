const _ = require(`lodash`),
    path = require(`path`),
    constants = require(`../constants.js`),
    queries = require(`../helpers/queries`)

const queryBuilder = ({language, cursor}) => `
query {
  avorg {
    sermons(language: ${language}, first: 50, after: "${cursor}") {
      nodes {
        title
        id
        presenters {
          name
          photoWithFallback {
            url(size: 50)
          }
        }
        mediaFiles {
          url
        }
        recordingDate
        description
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
}`

const getSermons = async (graphql, language = "ENGLISH") => {
    const pages = await queries.getPages(
        graphql,
        queryBuilder,
        {language},
        'data.avorg.sermons'
    )

    return pages.map(p => p.nodes).flat()
}

const createSermon = async (createPage, node, pathPrefix) => {
    const nodeId = _.get(node, 'id')

    await createPage({
        path: `${pathPrefix}/sermons/${nodeId}`,
        component: path.resolve(`./src/templates/sermon.js`),
        context: {node}
    })
}

const createLanguageSermons = async (graphql, createPage, pathPrefix, language) => {
    const sermons = await getSermons(graphql, language)

    await Promise.all(sermons.map(node => createSermon(createPage, node, pathPrefix)))
}

exports.createPages = async (graphql, createPage) => {
    await Promise.all(Object.keys(constants.languages).map((language) => {
        return createLanguageSermons(
            graphql,
            createPage,
            constants.languages[language].base_url,
            language
        )
    }))
};
