const _ = require(`lodash`),
    constants = require(`../constants`)

// Must include pageInfo.hasNextPage and pageInfo.endCursor in generated queries
exports.getPages = async (graphql, query, queryArgs, pageSelector, cursor = null, pages = []) => {
    queryArgs.cursor = cursor

    const result = await graphql(query, queryArgs),
        page = _.get(result, pageSelector)

    pages.push(page)

    const hasNextPage = _.get(page, 'pageInfo.hasNextPage') &&
        pages.length < constants.query_page_limit

    if (hasNextPage) {
        const nextCursor = _.get(page, 'pageInfo.endCursor')

        return exports.getPages(
            graphql,
            query,
            queryArgs,
            pageSelector,
            nextCursor,
            pages
        )
    }

    return pages
}
