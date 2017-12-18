package com.enonic.site.developer.tools.imports;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.enonic.site.developer.tools.asciidoc.ExtractedDoc;
import com.enonic.xp.content.ContentPath;
import com.enonic.xp.content.CreateContentParams;
import com.enonic.xp.data.PropertyTree;
import com.enonic.xp.schema.content.ContentTypeName;

public final class ImportDocCommand
    extends ImportCommand
{
    private final static Logger LOGGER = LoggerFactory.getLogger( ImportDocCommand.class );

    private String version;

    @Override
    protected void importData()
        throws IOException
    {
        createDocVersion();
        importFoldersAndMedia();
        importDocpages(); // Loading docpages after all media that docpage may refer to is loaded
    }

    private void createDocVersion()
    {
        if ( version == null || version.isEmpty() )
        {
            return;
        }

        final CreateContentParams createContentParams = CreateContentParams.create().
            contentData( new PropertyTree() ).
            displayName( version ).
            parent( ContentPath.from( importPath ) ).
            type( ContentTypeName.from( applicationKey + ":docversion" ) ).
            build();

        contentService.create( createContentParams );

        importPath = importPath + "/" + version;
    }

    private void importDocpages()
        throws IOException
    {
        this.isRootFile = true;
        Files.walk( sourceDir ).filter( path -> !isRootFile() && !isForbidden( path ) && isCompiledAsciiDoc( path ) ).forEach(
            path -> createDocpage( path ) );
    }

    private void createDocpage( final Path path )
    {
        final ContentPath repoPath = makeRepoPath( path );

        if ( contentService.contentExists( repoPath ) )
        {
            return;
        }

        LOGGER.info( "Creating docpage " + repoPath );

        final ExtractedDoc asciiDoc = getAsciiDoc( path );

        final PropertyTree data = new PropertyTree();
        data.addString( "html", asciiDoc.getHtml() );
        data.addString( "title", asciiDoc.getTitle() );
        data.addString( "raw", asciiDoc.getText() );

        final CreateContentParams createContentParams = CreateContentParams.create().
            contentData( data ).
            displayName( path.getFileName().toString() ).
            parent( repoPath.getParentPath() ).
            type( ContentTypeName.from( applicationKey + ":docpage" ) ).
            requireValid( false ).
            build();
        contentService.create( createContentParams );
    }

    public void setVersion( final String version )
    {
        this.version = version;
    }
}


