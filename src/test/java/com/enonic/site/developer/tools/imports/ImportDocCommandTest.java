package com.enonic.site.developer.tools.imports;

import java.util.Arrays;
import java.util.List;
import java.util.function.Supplier;
import java.util.stream.Collectors;

import org.junit.Before;
import org.junit.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;

import com.enonic.site.developer.tools.CommonTest;
import com.enonic.xp.content.Content;
import com.enonic.xp.content.ContentId;
import com.enonic.xp.content.ContentPath;
import com.enonic.xp.content.ContentService;
import com.enonic.xp.content.CreateContentParams;
import com.enonic.xp.content.CreateMediaParams;
import com.enonic.xp.content.EditableContent;
import com.enonic.xp.content.Media;
import com.enonic.xp.content.UpdateContentParams;
import com.enonic.xp.schema.content.ContentTypeName;
import com.enonic.xp.script.bean.BeanContext;

import static org.junit.Assert.*;

public class ImportDocCommandTest
    extends CommonTest
{
    private ContentService contentService;

    private String importPath = "/developersite/doctest";

    private ImportDocCommand importDocCommand;

    @Before
    public void setUp()
    {
        contentService = Mockito.mock( ContentService.class );
        importDocCommand = new ImportDocCommand();
        importDocCommand.setImportPath( importPath );
        importDocCommand.setSourceDir( getPath( "docs" ) );
        importDocCommand.setLabel( "beta" );

        final BeanContext beanContext = Mockito.mock( BeanContext.class );
        final Supplier<ContentService> serviceSupplier = Mockito.mock( Supplier.class );
        Mockito.when( beanContext.getService( ContentService.class ) ).thenReturn( serviceSupplier );
        Mockito.when( serviceSupplier.get() ).thenReturn( contentService );
        Mockito.when( contentService.create( Mockito.any( CreateContentParams.class ) ) ).thenReturn(
            Content.create().name( "beta" ).parentPath( ContentPath.ROOT ).build() );
        importDocCommand.initialize( beanContext );
    }

    @Test
    public void testContentTreeCreated()
        throws Exception
    {
        Mockito.when( contentService.contentExists( Mockito.any( ContentPath.class ) ) ).thenReturn( false );
        Mockito.when( contentService.getByPath( Mockito.any( ContentPath.class ) ) ).thenReturn(
            Content.create().id( ContentId.from( "testId" ) ).name( "name" ).parentPath( ContentPath.ROOT ).build() );

        importDocCommand.execute();

        Mockito.verify( contentService, Mockito.times( 9 ) ).create( Mockito.any( CreateContentParams.class ) );
        Mockito.verify( contentService, Mockito.times( 4 ) ).create( Mockito.any( CreateMediaParams.class ) );
    }

    @Test
    public void testContentPathsAreCorrect()
        throws Exception
    {
        final List<String> contentPaths =
            Arrays.asList( makeRepoPath( "beta/images" ), makeRepoPath( "beta/images/secondary" ), makeRepoPath( "beta/includes" ) );

        Mockito.when( contentService.contentExists( Mockito.any( ContentPath.class ) ) ).thenReturn( false );
        Mockito.when( contentService.getByPath( Mockito.any( ContentPath.class ) ) ).thenReturn(
            Content.create().id( ContentId.from( "testId" ) ).name( "name" ).parentPath( ContentPath.ROOT ).build() );
        final ArgumentCaptor<CreateContentParams> createContentParamsArgumentCaptor = ArgumentCaptor.forClass( CreateContentParams.class );

        importDocCommand.execute();

        Mockito.verify( contentService, Mockito.times( 9 ) ).create( createContentParamsArgumentCaptor.capture() );

        assertTrue( createContentParamsArgumentCaptor.getAllValues().stream().map(
            params -> params.getParent() + "/" + params.getDisplayName() ).collect( Collectors.toList() ).containsAll( contentPaths ) );
    }

    @Test
    public void testMediaPathsAreCorrect()
        throws Exception
    {
        final List<String> mediaPaths =
            Arrays.asList( makeRepoPath( "beta/images/kitchen.jpg" ), makeRepoPath( "beta/images/secondary/bedroom.jpg" ),
                           makeRepoPath( "beta/images/song.mp3" ) );

        Mockito.when( contentService.contentExists( Mockito.any( ContentPath.class ) ) ).thenReturn( false );
        Mockito.when( contentService.getByPath( Mockito.any( ContentPath.class ) ) ).thenReturn(
            Content.create().id( ContentId.from( "testId" ) ).name( "name" ).parentPath( ContentPath.ROOT ).build() );
        final ArgumentCaptor<CreateMediaParams> createMediaParamsArgumentCaptor = ArgumentCaptor.forClass( CreateMediaParams.class );

        importDocCommand.execute();

        Mockito.verify( contentService, Mockito.times( 4 ) ).create( createMediaParamsArgumentCaptor.capture() );

        assertTrue(
            createMediaParamsArgumentCaptor.getAllValues().stream().map( params -> params.getParent() + "/" + params.getName() ).collect(
                Collectors.toList() ).containsAll( mediaPaths ) );
    }

    @Test
    public void testImgUrlsAreRewritten()
        throws Exception
    {
        Mockito.when( contentService.contentExists( Mockito.any( ContentPath.class ) ) ).thenReturn( false );
        Mockito.when( contentService.getByPath( Mockito.any( ContentPath.class ) ) ).thenReturn(
            Media.create().id( ContentId.from( "testid" ) ).name( "name" ).type( ContentTypeName.imageMedia() ).parentPath(
                ContentPath.ROOT ).build() );
        final ArgumentCaptor<UpdateContentParams> updateContentParamsArgumentCaptor = ArgumentCaptor.forClass( UpdateContentParams.class );

        importDocCommand.execute();

        Mockito.verify( contentService, Mockito.times( 5 ) ).update( updateContentParamsArgumentCaptor.capture() );

        final EditableContent content = updateContentParamsArgumentCaptor.getAllValues().stream().map( params -> {
            final EditableContent editableContent =
                new EditableContent( Content.create().name( "beta" ).parentPath( ContentPath.ROOT ).build() );
            params.getEditor().edit( editableContent );
            return editableContent;
        } ).filter( editableContent -> editableContent.displayName != null &&
            editableContent.displayName.equals( "Linked doc at root level" ) ).findFirst().get();

        assertTrue( content.data.getString( "html" ).contains( "image://testid" ) );
    }

    private String makeRepoPath( final String path )
    {
        return importPath + "/" + path;
    }
}
