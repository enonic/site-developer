package com.enonic.site.developer.tools.repo;

import java.io.FileNotFoundException;
import java.io.InputStream;
import java.net.URL;

import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class GetVersionsCommand
{
    private static final Logger LOGGER = LoggerFactory.getLogger( GetVersionsCommand.class );

    private static final String VERSIONS_JSON_PATH = "/master/docs/versions.json";

    private static final String GITHUB_RAW = "https://raw.githubusercontent.com/";

    private String repository;

    public String execute()
    {
        try
        {
            return doExecute();
        }
        catch ( final FileNotFoundException fnf )
        {
            LOGGER.info( "No [" + VERSIONS_JSON_PATH + "] found in [" + repository + "]" );
            return null;
        }
        catch ( final Throwable t )
        {
            LOGGER.error( "Failed to fetch [" + VERSIONS_JSON_PATH + "] from [" + repository + "]", t );
            throw new RuntimeException( "Failed to fetch [" + VERSIONS_JSON_PATH + "] from [" + repository + "]", t );
        }
    }

    private String doExecute()
        throws Exception
    {
        LOGGER.info( "Fetching [" + VERSIONS_JSON_PATH + "] from [" + repository + "] ..." );

        try (final InputStream inputStream = new URL( GITHUB_RAW + repository + VERSIONS_JSON_PATH ).openStream())
        {
            final String result = IOUtils.toString( inputStream );
            LOGGER.info( "Fetched [versions.json]" );
            return result;
        }
    }

    public void setRepository( final String repository )
    {
        this.repository = repository;
    }

}
