package com.enonic.app.market;

import org.junit.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;

import com.google.common.collect.Sets;

import com.enonic.xp.content.ContentQuery;
import com.enonic.xp.content.ContentService;
import com.enonic.xp.query.filter.BooleanFilter;
import com.enonic.xp.query.filter.ValueFilter;

import static org.junit.Assert.*;
import static org.mockito.Mockito.times;

public class CompatibleAppsResolverImplTest
{
    private ContentService contentService = Mockito.mock( ContentService.class );

    private SubversionResolver subversionResolver = Mockito.mock( SubversionResolver.class );

    @Test
    public void filters_applied()
        throws Exception
    {
        final CompatibleAppsResolverImpl resolver = new CompatibleAppsResolverImpl();
        resolver.setContentService( this.contentService );
        resolver.setSubversionResolver( this.subversionResolver );

        Mockito.when( this.subversionResolver.resolve( Version.from( "9.1.0" ), "myField" ) ).
            thenReturn( Sets.newHashSet( Version.from( "1.0.0" ), Version.from( "1.2.0" ) ) );

        final ListApplicationsParams params = new ListApplicationsParams();
        params.setNames( new String[]{"fisk", "ost"} );
        params.setVersionFieldName( "myField" );
        params.setContentTypeName( "myContentType" );
        params.setXpVersion( "9.1.0" );
        params.setOrderBy( "displayName ASC" );
        params.setSize( 10 );
        params.setFrom( 0 );

        ArgumentCaptor<ContentQuery> queryCaptor = ArgumentCaptor.forClass( ContentQuery.class );

        resolver.resolve( params );

        Mockito.verify( this.contentService, times( 1 ) ).find( queryCaptor.capture() );

        final ContentQuery sentQuery = queryCaptor.getValue();
        assertEquals( 1, sentQuery.getQueryFilters().getSize() );
        assertTrue( sentQuery.getQueryFilters().get( 0 ) instanceof BooleanFilter );
        final BooleanFilter filter = (BooleanFilter) sentQuery.getQueryFilters().get( 0 );
        assertEquals( 3, filter.getMust().size() );
    }

    @Test
    public void no_name_filter()
        throws Exception
    {
        final CompatibleAppsResolverImpl resolver = new CompatibleAppsResolverImpl();
        resolver.setContentService( this.contentService );
        resolver.setSubversionResolver( this.subversionResolver );

        Mockito.when( this.subversionResolver.resolve( Version.from( "9.1.0" ), "myField" ) ).
            thenReturn( Sets.newHashSet( Version.from( "1.0.0" ), Version.from( "1.2.0" ) ) );

        final ListApplicationsParams params = new ListApplicationsParams();
        params.setVersionFieldName( "myField" );
        params.setXpVersion( "9.1.0" );
        params.setSize( 10 );
        params.setFrom( 0 );

        ArgumentCaptor<ContentQuery> queryCaptor = ArgumentCaptor.forClass( ContentQuery.class );

        resolver.resolve( params );

        Mockito.verify( this.contentService, times( 1 ) ).find( queryCaptor.capture() );

        final ContentQuery sentQuery = queryCaptor.getValue();
        assertEquals( 1, sentQuery.getQueryFilters().getSize() );
        assertTrue( sentQuery.getQueryFilters().get( 0 ) instanceof ValueFilter );
    }
}