var libs = {
    portal: require('/lib/xp/portal'),
    thymeleaf: require('/lib/xp/thymeleaf'),
    content: require('/lib/xp/content'),
    market: require('/lib/enonic/market')
};

// Handle GET request
exports.get = handleGet;

function handleGet(req) {
    var paginationCount = (req.params.c == parseInt(req.params.c, 10)) ? req.params.c : 4;
    var paginationStart = (req.params.s == parseInt(req.params.s, 10)) ? req.params.s : 0;
    var paginationCty = req.params.cty ? req.params.cty : '';

    var view = resolve('search-result.html');
    var model = createModel();

    function createModel() {
        var model = {};

        model.searchTerm = req.params.q;
        model.itemsOnly = req.params.preq ? true : false;

        //var software = getSoftware(model.query, model.count, model.start);

        //model.software = software.hits;


        if (model.itemsOnly) {
            model.products = getResults(model.searchTerm, [app.name + ':' + paginationCty], paginationCount, paginationStart);
        }
        else {
            model.aggregations = getAggregations(model.searchTerm);
        }




        model.serviceUrl = libs.portal.serviceUrl({
            service: 'software-search'
        });

        model.searchResultPageUrl = libs.portal.pageUrl({});

       // model.aggregations = getAggregations(software.aggregations.contentTypes.buckets, );








        //log.info('UTIL log %s', JSON.stringify(model, null, 4));

        return model;
    }

    function getResults(searchTerm, contentTypes, count, start) {
        var result = libs.content.query({
            query: "ngram('displayName', '" + searchTerm + "', 'AND') ",
            count: count,
            start: start,
            contentTypes: contentTypes
        });

        for (var i=0; i <result.hits.length; i++) {
            result.hits[i].softwareIcon = libs.market.getSoftwareIconUrl(result.hits[i]);

        }

        return result.hits;
    }

    function getAggregations(searchTerm) {

        var selectedSoftwareTypes = [
            app.name + ':application',
            app.name + ':library',
            app.name + ':starter',
            app.name + ':vendor'
        ];

        var result = libs.content.query({
            //query: "ngram('_allText', '" + searchTerm + "', 'AND') ",
            query: "ngram('displayName', '" + searchTerm + "', 'AND') ",
            count: 0,
            contentTypes: selectedSoftwareTypes,
            aggregations: {
                contentTypes: {
                    terms: {
                        field: "type",
                        order: "_term ASC"
                    }
                }
            }
        });

        var aggregations = result.aggregations.contentTypes.buckets;

        aggregations.forEach(function(e) {
            switch (e.key) {
                case app.name + ':library':
                    e.name = 'Libraries';
                    break;
                case app.name + ':application':
                    e.name = 'Applications';
                    break;
                case app.name + ':starter':
                    e.name = 'Starter Kits';
                    break;
                case app.name + ':vendor':
                    e.name = 'Authors';
                    break;
            }

            e.hits = getResults(searchTerm, [e.key], 4, 0);

            e.pagination = {
                url: libs.portal.componentUrl({
                    params: {
                        q: searchTerm,
                        preq: true,
                        cty: e.key.split(':').pop()
                    }
                }),
                count: paginationCount,
                start: paginationStart,
                total: e.docCount
            };


        });

        return aggregations;
    }



    return {
        body: libs.thymeleaf.render(view, model)
    };
}