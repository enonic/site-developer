package com.enonic.site.developer.tools.imports;

import java.io.File;
import java.util.Arrays;
import java.util.List;
import java.util.function.Supplier;
import java.util.stream.Collectors;

import org.junit.Before;
import org.junit.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;

import com.enonic.xp.app.ApplicationKey;
import com.enonic.xp.content.Content;
import com.enonic.xp.content.ContentId;
import com.enonic.xp.content.ContentPath;
import com.enonic.xp.content.ContentService;
import com.enonic.xp.content.CreateContentParams;
import com.enonic.xp.content.CreateMediaParams;
import com.enonic.xp.content.Media;
import com.enonic.xp.schema.content.ContentTypeName;
import com.enonic.xp.script.bean.BeanContext;

import static org.junit.Assert.*;

public class ImportLocalFilesCommandTest
{
    private ContentService contentService;

    private ApplicationKey applicationKey;

    private String importPath = "/developersite/doctest";

    private ImportLocalFilesCommand importLocalFilesCommand;

    @Before
    public void setUp()
    {
        contentService = Mockito.mock( ContentService.class );
        applicationKey = ApplicationKey.from( "myapplication" );
        importLocalFilesCommand = new ImportLocalFilesCommand();
        importLocalFilesCommand.setImportPath( importPath );
        importLocalFilesCommand.setLocalPath( getPath( "docs" ) );

        final BeanContext beanContext = Mockito.mock( BeanContext.class );
        final Supplier<ContentService> serviceSupplier = Mockito.mock( Supplier.class );
        Mockito.when( beanContext.getService( ContentService.class ) ).thenReturn( serviceSupplier );
        Mockito.when( serviceSupplier.get() ).thenReturn( contentService );
        importLocalFilesCommand.initialize( beanContext );
    }

    @Test
    public void testVerifyContentTreeCreated()
        throws Exception
    {
        Mockito.when( contentService.contentExists( Mockito.any( ContentPath.class ) ) ).thenReturn( false );
        Mockito.when( contentService.getByPath( Mockito.any( ContentPath.class ) ) ).thenReturn(
            Content.create().name( "name" ).parentPath( ContentPath.ROOT ).build() );

        importLocalFilesCommand.execute();

        Mockito.verify( contentService, Mockito.times( 3 ) ).create( Mockito.any( CreateContentParams.class ) );
        Mockito.verify( contentService, Mockito.times( 3 ) ).create( Mockito.any( CreateMediaParams.class ) );
    }

    @Test
    public void testVerifyPaths()
        throws Exception
    {
        final List<String> contentPaths =
            Arrays.asList( makeRepoPath( "images" ), makeRepoPath( "images/secondary" ), makeRepoPath( "index.html" ) );
        final List<String> mediaPaths =
            Arrays.asList( makeRepoPath( "images/kitchen.jpg" ), makeRepoPath( "images/secondary/bedroom.jpg" ), makeRepoPath( "images/song.mp3" ) );

        Mockito.when( contentService.contentExists( Mockito.any( ContentPath.class ) ) ).thenReturn( false );
        Mockito.when( contentService.getByPath( Mockito.any( ContentPath.class ) ) ).thenReturn(
            Content.create().name( "name" ).parentPath( ContentPath.ROOT ).build() );
        ArgumentCaptor<CreateContentParams> createContentParamsArgumentCaptor = ArgumentCaptor.forClass( CreateContentParams.class );
        ArgumentCaptor<CreateMediaParams> createMediaParamsArgumentCaptor = ArgumentCaptor.forClass( CreateMediaParams.class );

        importLocalFilesCommand.execute();

        Mockito.verify( contentService, Mockito.times( 3 ) ).create( createContentParamsArgumentCaptor.capture() );
        Mockito.verify( contentService, Mockito.times( 3 ) ).create( createMediaParamsArgumentCaptor.capture() );

        assertTrue( createContentParamsArgumentCaptor.getAllValues().stream().map( params -> params.getParent() + "/" + params.getDisplayName() ).collect(
            Collectors.toList() ).containsAll( contentPaths ) );
        assertTrue( createMediaParamsArgumentCaptor.getAllValues().stream().map( params -> params.getParent() + "/" + params.getName() ).collect(
            Collectors.toList() ).containsAll( mediaPaths ) );
    }

    @Test
    public void testImgUrlsAreRewritten() throws Exception
    {
        Mockito.when( contentService.contentExists( Mockito.any( ContentPath.class ) ) ).thenReturn( false );
        Mockito.when( contentService.getByPath( Mockito.any( ContentPath.class ) ) ).thenReturn(
            Media.create().id( ContentId.from( "testid" ) ).name( "name" ).type( ContentTypeName.imageMedia() ).parentPath( ContentPath.ROOT ).build() );
        ArgumentCaptor<CreateContentParams> createContentParamsArgumentCaptor = ArgumentCaptor.forClass( CreateContentParams.class );

        importLocalFilesCommand.execute();

        Mockito.verify( contentService, Mockito.times( 3 ) ).create( createContentParamsArgumentCaptor.capture() );

        CreateContentParams docpageContentParams = createContentParamsArgumentCaptor.getAllValues().stream().filter( params -> params.getDisplayName().equals( "index.html" ) ).findFirst().get();

        assertTrue( docpageContentParams.getData().getString( "html" ).contains( "image://testid" ) );
    }

    private String makeRepoPath( final String path )
    {
        return importPath + "/" + path;
    }

    private String getPath( final String path )
    {
        return new File( getClass().getResource( path ).getFile() ).getAbsolutePath();
    }
}
