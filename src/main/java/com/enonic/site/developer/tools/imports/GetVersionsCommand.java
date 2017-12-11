package com.enonic.site.developer.tools.imports;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.NoSuchFileException;
import java.nio.file.Path;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class GetVersionsCommand
{
    private final static Logger LOGGER = LoggerFactory.getLogger( GetVersionsCommand.class );

    private Path localPath;

    private final String versionsJsonName = "versions.json";

    public String execute()
    {
        try
        {
            return doExecute();
        }
        catch ( final Exception e )
        {
            LOGGER.error( "Failed to fetch versions json in  [" + localPath + "]", e );
            throw new RuntimeException( "Failed to fetch versions json in [" + localPath + "]", e );
        }
    }

    private String doExecute()
        throws Exception
    {
        checkPathToLookForVersionsExists();

        localPath = localPath.resolve( versionsJsonName );

        if ( !localPath.toFile().exists() )
        {
            LOGGER.warn( "No [versions.json] found at path [" + localPath + "]" );
            return null;
        }

        return new String( Files.readAllBytes( localPath ) );
    }

    private void checkPathToLookForVersionsExists()
        throws NoSuchFileException
    {
        if ( !localPath.toFile().exists() )
        {
            throw new NoSuchFileException( "Path to look for [versions.json] does not exist [" + localPath + "]" );
        }
    }

    public void setLocalPath( final String localPath )
    {
        this.localPath = new File( localPath ).toPath();
    }
}
