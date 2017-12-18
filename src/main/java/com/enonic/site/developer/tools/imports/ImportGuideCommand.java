package com.enonic.site.developer.tools.imports;

import java.nio.file.Path;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.enonic.site.developer.tools.asciidoc.ExtractedDoc;
import com.enonic.xp.content.Content;
import com.enonic.xp.content.ContentPath;
import com.enonic.xp.content.UpdateContentParams;

public class ImportGuideCommand
    extends ImportCommand
{
    private final static Logger LOGGER = LoggerFactory.getLogger( ImportGuideCommand.class );

    @Override
    protected void importData()
        throws Exception
    {
        importFoldersAndMedia();
        importGuide();
    }

    private void importGuide()
    {
        final ContentPath repoPath = ContentPath.from( importPath );

        if ( !contentService.contentExists( repoPath ) )
        {
            return;
        }

        final Content guide = contentService.getByPath( repoPath );

        LOGGER.info( "Creating guide " + repoPath );

        final Path asciiDocPath = sourceDir.resolve( DEFAULT_ASCIIDOC_NAME );
        final ExtractedDoc asciiDoc = getAsciiDoc( asciiDocPath );

        final UpdateContentParams updateContentParams = new UpdateContentParams().
            contentId( guide.getId() ).
            editor( edit -> {
                edit.data.setString( "html", asciiDoc.getHtml() );
                edit.data.setString( "title", asciiDoc.getTitle() );
                edit.data.setString( "raw", asciiDoc.getText() );
            } );

        contentService.update( updateContentParams );
    }
}
