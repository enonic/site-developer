package com.enonic.site.developer.tools.repo;

import java.io.FileNotFoundException;
import java.io.InputStream;
import java.net.URL;

import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.common.base.Preconditions;

/**
 * Class fetches versions.json if available from repo's /docs folder
 */
public class GetVersionsCommand
{
    private static final Logger LOGGER = LoggerFactory.getLogger( GetVersionsCommand.class );

    private static final String VERSIONS_JSON_PATH = "/master/docs/versions.json";

    private static final String GITHUB_RAW = "https://raw.githubusercontent.com/";

    protected final static String NO_REPO_MSG = "No repository set to fetch versions from!";

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
        Preconditions.checkNotNull( repository, NO_REPO_MSG );

        LOGGER.info( "Fetching [" + VERSIONS_JSON_PATH + "] from [" + repository + "] ..." );

        try (final InputStream inputStream = getVersionsJsonAsStream())
        {
            final String result = IOUtils.toString( inputStream );
            LOGGER.info( "Fetched [versions.json]" );
            return result;
        }
    }

    private InputStream getVersionsJsonAsStream()
        throws Exception
    {
        return new URL( makeUrlToVersionsJson() ).openStream();
    }

    protected String makeUrlToVersionsJson()
    {
        return GITHUB_RAW + repository + VERSIONS_JSON_PATH;
    }

    public void setRepository( final String repository )
    {
        this.repository = repository;
    }

}
