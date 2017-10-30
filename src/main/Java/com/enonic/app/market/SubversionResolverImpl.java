package com.enonic.app.market;

import java.util.Set;
import java.util.stream.Collectors;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

import com.enonic.xp.aggregation.BucketAggregation;
import com.enonic.xp.aggregation.Buckets;
import com.enonic.xp.content.ContentQuery;
import com.enonic.xp.content.ContentService;
import com.enonic.xp.content.FindContentIdsByQueryResult;
import com.enonic.xp.query.aggregation.TermsAggregationQuery;
import com.enonic.xp.query.parser.QueryParser;

@Component(immediate = true)
public class SubversionResolverImpl
    implements SubversionResolver
{
    private ContentService contentService;

    @Override
    public Set<Version> resolve( final Version version, final String versionFieldName )
    {
        final String aggregationName = "versions";

        final ContentQuery query = createAggregationQuery( version, aggregationName, versionFieldName );

        final FindContentIdsByQueryResult result = this.contentService.find( query );

        final BucketAggregation aggregation = (BucketAggregation) result.getAggregations().get( aggregationName );

        final Buckets buckets = aggregation.getBuckets();

        return buckets.stream().
            filter( ( bucket ) -> version.isCompatible( Version.from( bucket.getKey() ) ) ).
            map( ( bucket ) -> Version.from( bucket.getKey() ) ).
            collect( Collectors.toSet() );
    }

    private ContentQuery createAggregationQuery( final Version version, final String aggregationName, final String versionFieldName )
    {
        return ContentQuery.create().
            queryExpr( QueryParser.parse( createLikeStatement( version, versionFieldName ) ) ).
            size( 0 ).
            aggregationQuery( TermsAggregationQuery.create( aggregationName ).
                fieldName( versionFieldName ).
                size( 1000 ).
                orderDirection( TermsAggregationQuery.Direction.DESC ).
                orderType( TermsAggregationQuery.Type.DOC_COUNT ).
                build() ).
            build();
    }

    private String createLikeStatement( final Version version, final String versionFieldName )
    {
        return versionFieldName + " LIKE '" + version.getMajor() + ".*'";
    }

    @Reference
    public void setContentService( final ContentService contentService )
    {
        this.contentService = contentService;
    }
}
