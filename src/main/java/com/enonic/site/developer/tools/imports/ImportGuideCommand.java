package com.enonic.site.developer.tools.imports;

import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.enonic.xp.content.ContentPath;

public class ImportGuideCommand
    extends ImportCommand
{
    private final static Logger LOGGER = LoggerFactory.getLogger( ImportGuideCommand.class );

    protected void initRootDocContent()
    {
        final ContentPath repoPath = ContentPath.from( importPath );

        if ( !contentService.contentExists( repoPath ) )
        {
            LOGGER.error( "Guide at path [" + importPath + "] not found! Unable to import AsciiDocs" );
            throw new RuntimeException( "Guide at path [" + importPath + "] not found! Unable to import AsciiDocs" );
        }

        rootDocContent = Optional.of( contentService.getByPath( repoPath ) );

        if ( !rootDocContent.get().getType().toString().equals( applicationKey + ":guide" ) )
        {
            LOGGER.error( "Content at path [" + importPath + "] is not Guide! Unable to import AsciiDocs" );
            throw new RuntimeException( "Content at path [" + importPath + "] is not Guide! Unable to import AsciiDocs" );
        }
    }

}
