package com.enonic.site.developer.tools.repo;

import java.nio.file.Paths;

import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;

import com.enonic.site.developer.tools.CommonTest;

import static org.junit.Assert.*;

public class GetVersionsCommandTest
    extends CommonTest
{
    @Rule
    public ExpectedException exception = ExpectedException.none();

    @Test
    public void testNoRepoThrowsException()
        throws Exception
    {
        try
        {
            new GetVersionsCommand().execute();
        }
        catch ( final Exception e )
        {
            assertEquals( GetVersionsCommand.NO_REPO_MSG, e.getCause().getMessage() );
            return;
        }

        assertTrue( false ); // Not supposed to reach this line
    }

    @Test
    public void testNoVersionsReturnsNull()
        throws Exception
    {
        final GetVersionsCommand getVersionsCommand = new GetVersionsCommandExt( makeUrlToFile( "non-existing-path" ) );
        getVersionsCommand.setRepository( "some-test-repo" );
        final String result = getVersionsCommand.execute();

        assertNull( result );
    }

    @Test
    public void testVersionsJsonReturned()
        throws Exception
    {
        final String path = getPath( "getversions/versions.json" );
        final GetVersionsCommand getVersionsCommand = new GetVersionsCommandExt( makeUrlToFile( path ) );
        getVersionsCommand.setRepository( "some-test-repo" );
        final String result = getVersionsCommand.execute();

        assertNotNull( result );
        assertTrue( result.contains( "versions" ) );
        assertTrue( result.contains( "checkout" ) );
    }

    private String makeUrlToFile( final String path )
        throws Exception
    {
        return Paths.get( path ).toUri().toURL().toString();
    }

    private final class GetVersionsCommandExt
        extends GetVersionsCommand
    {
        final String url;

        private GetVersionsCommandExt( final String url )
        {
            this.url = url;
        }

        @Override
        protected String makeUrlToVersionsJson()
        {
            return url;
        }
    }
}
