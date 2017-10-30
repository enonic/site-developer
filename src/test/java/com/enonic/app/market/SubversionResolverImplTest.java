package com.enonic.app.market;

import java.util.List;
import java.util.Set;

import org.junit.Before;
import org.junit.Test;
import org.mockito.Mockito;

import com.enonic.xp.aggregation.Aggregations;
import com.enonic.xp.aggregation.Bucket;
import com.enonic.xp.aggregation.BucketAggregation;
import com.enonic.xp.aggregation.Buckets;
import com.enonic.xp.content.ContentQuery;
import com.enonic.xp.content.ContentService;
import com.enonic.xp.content.FindContentIdsByQueryResult;

import static org.junit.Assert.*;

public class SubversionResolverImplTest
{

    private ContentService contentService;

    @Before
    public void setUp()
        throws Exception
    {
        this.contentService = Mockito.mock( ContentService.class );
    }

    @Test
    public void resolve()
        throws Exception
    {
        Mockito.when( this.contentService.find( Mockito.isA( ContentQuery.class ) ) ).
            thenReturn( FindContentIdsByQueryResult.create().
                aggregations( Aggregations.from( BucketAggregation.bucketAggregation( "versions" ).
                    buckets( Buckets.create().
                        add( Bucket.create().
                            key( "1.0.0" ).
                            docCount( 1 ).
                            build() ).
                        add( Bucket.create().
                            key( "1.1.0" ).
                            docCount( 1 ).
                            build() ).
                        build() ).
                    build() ) ).
                build() );

        final SubversionResolverImpl resolver = new SubversionResolverImpl();
        resolver.setContentService( this.contentService );
        final Set<Version> versions = resolver.resolve( Version.from( "1.2.3" ), "myField" );

        assertEquals( 2, versions.size() );
    }
}