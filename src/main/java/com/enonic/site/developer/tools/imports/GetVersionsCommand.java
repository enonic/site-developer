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

    private Path sourceDir;

    private final String versionsJsonName = "versions.json";

    public String execute()
    {
        try
        {
            return doExecute();
        }
        catch ( final Exception e )
        {
            LOGGER.error( "Failed to fetch versions json in  [" + sourceDir + "]", e );
            throw new RuntimeException( "Failed to fetch versions json in [" + sourceDir + "]", e );
        }
    }

    private String doExecute()
        throws Exception
    {
        checkPathToLookForVersionsExists();

        sourceDir = sourceDir.resolve( versionsJsonName );

        if ( !sourceDir.toFile().exists() )
        {
            LOGGER.warn( "No [versions.json] found at path [" + sourceDir + "]" );
            return null;
        }

        return new String( Files.readAllBytes( sourceDir ) );
    }

    private void checkPathToLookForVersionsExists()
        throws NoSuchFileException
    {
        if ( !sourceDir.toFile().exists() )
        {
            throw new NoSuchFileException( "Path to look for [versions.json] does not exist [" + sourceDir + "]" );
        }
    }

    public void setSourceDir( final String sourceDir )
    {
        this.sourceDir = new File( sourceDir ).toPath();
    }
}
