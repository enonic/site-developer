package com.enonic.site.developer.tools.imports;

import java.nio.file.Files;
import java.nio.file.NoSuchFileException;
import java.nio.file.Path;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

class LocalFileReader
{
    private final static Logger LOGGER = LoggerFactory.getLogger( LocalFileReader.class );

    private final Path sourceDir;

    private final String fileName;

    LocalFileReader( final Path sourceDir, final String fileName )
    {
        this.sourceDir = sourceDir;
        this.fileName = fileName;
    }

    String execute()
    {
        try
        {
            return doExecute();
        }
        catch ( final Exception e )
        {
            LOGGER.error( "Failed to fetch [" + fileName + "] in  [" + sourceDir + "]", e );
            throw new RuntimeException( "Failed to fetch [" + fileName + "] in [" + sourceDir + "]", e );
        }
    }

    private String doExecute()
        throws Exception
    {
        checkSourcePathExists();

        final Path filePath = sourceDir.resolve( fileName );

        if ( !filePath.toFile().exists() )
        {
            LOGGER.warn( "No [" + fileName + "] found at path [" + filePath + "]" );
            return null;
        }

        return new String( Files.readAllBytes( filePath ) );
    }

    private void checkSourcePathExists()
        throws NoSuchFileException
    {
        if ( !sourceDir.toFile().exists() )
        {
            throw new NoSuchFileException( "Path to look for [" + fileName + "] does not exist [" + sourceDir + "]" );
        }
    }

}
