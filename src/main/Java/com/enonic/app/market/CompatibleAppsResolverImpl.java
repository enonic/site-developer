package com.enonic.app.market;

import java.util.Collection;
import java.util.Set;
import java.util.stream.Collectors;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

import com.enonic.xp.aggregation.Aggregations;
import com.enonic.xp.content.ContentIds;
import com.enonic.xp.content.ContentPropertyNames;
import com.enonic.xp.content.ContentQuery;
import com.enonic.xp.content.ContentService;
import com.enonic.xp.content.FindContentIdsByQueryResult;
import com.enonic.xp.query.expr.QueryExpr;
import com.enonic.xp.query.filter.BooleanFilter;
import com.enonic.xp.query.filter.Filter;
import com.enonic.xp.query.filter.Filters;
import com.enonic.xp.query.filter.ValueFilter;
import com.enonic.xp.query.parser.QueryParser;

@Component(immediate = true)
public class CompatibleAppsResolverImpl
    implements CompatibleAppsResolver
{
    private ContentService contentService;

    private SubversionResolver subversionResolver;

    @Override
    public FindContentIdsByQueryResult resolve( final ListApplicationsParams params )
    {
        final Set<Version> subVersions = this.subversionResolver.resolve( params.getXpVersion(), params.getVersionFieldName() );

        if ( subVersions.size() == 0 )
        {
            return FindContentIdsByQueryResult.create().
                contents( ContentIds.empty() ).
                hits( 0L ).
                totalHits( 0L ).
                aggregations( Aggregations.empty() ).
                build();
        }

        return getAllCompatibleApps( params, subVersions );
    }

    private FindContentIdsByQueryResult getAllCompatibleApps( final ListApplicationsParams params, final Collection<Version> subVersions )
    {
        final ContentQuery.Builder queryBuilder = ContentQuery.create().
            size( params.getSize() ).
            from( params.getFrom() ).
            queryExpr( createQueryExpression( params ) ).
            queryFilter( createFilters( params, subVersions ) );

        return this.contentService.find( queryBuilder.build() );
    }

    private QueryExpr createQueryExpression( final ListApplicationsParams params )
    {
        return params.getOrderBy() != null ? QueryParser.parse( "order by " + params.getOrderBy() ) : null;
    }

    private Filter createFilters( final ListApplicationsParams params, final Collection<Version> subVersions )
    {
        final Filters.Builder filterBuilder = Filters.create();

        addSupportsVersionsFilter( params, subVersions, filterBuilder );
        addAppNameFilter( params, filterBuilder );
        addContentTypeFilter( params, filterBuilder );
        addIdsFilter( params, filterBuilder );

        return wrapInBooleanIfNecessary( filterBuilder.build() );
    }

    private void addContentTypeFilter( final ListApplicationsParams params, final Filters.Builder filterBuilder )
    {
        if ( params.getContentTypeName() != null && !params.getContentTypeName().isEmpty() )
        {
            filterBuilder.add( ValueFilter.create().
                fieldName( ContentPropertyNames.TYPE ).
                addValues( params.getContentTypeName() ).
                build() );
        }
    }

    private void addAppNameFilter( final ListApplicationsParams params, final Filters.Builder filterBuilder )
    {
        final String[] appNames = params.getNames();

        if ( appNames != null && appNames.length > 0 )
        {
            filterBuilder.add( ValueFilter.create().
                fieldName( "_name" ).
                addValues( appNames ).
                build() );
        }
    }

    private void addSupportsVersionsFilter( final ListApplicationsParams params, final Collection<Version> subVersions,
                                            final Filters.Builder filterBuilder )
    {
        filterBuilder.add( ValueFilter.create().
            fieldName( params.getVersionFieldName() ).
            addValues( subVersions.stream().map( Version::toString ).collect( Collectors.toList() ) ).
            build() );
    }

    private void addIdsFilter( final ListApplicationsParams params, final Filters.Builder filterBuilder )
    {
        final String[] ids = params.getIds();
        if ( ids != null && ids.length > 0 )
        {
            filterBuilder.add( ValueFilter.create().
                fieldName( "_name" ).
                addValues( ids ).
                build() );
        }
    }

    private Filter wrapInBooleanIfNecessary( final Filters filters )
    {
        if ( filters.getSize() > 1 )
        {
            final BooleanFilter.Builder builder = BooleanFilter.create();

            filters.forEach( builder::must );

            return builder.build();
        }
        return filters.get( 0 );
    }

    @Reference
    public void setContentService( final ContentService contentService )
    {
        this.contentService = contentService;
    }

    @Reference
    public void setSubversionResolver( final SubversionResolver subversionResolver )
    {
        this.subversionResolver = subversionResolver;
    }
}
