package com.enonic.site.developer.tools.imports;

import java.io.File;

import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;

import static org.junit.Assert.*;

public class GetVersionsCommandTest
{
    @Rule
    public final ExpectedException exception = ExpectedException.none();

    @Test
    public void testVersionsFileRead()
        throws Exception
    {
        final GetVersionsCommand getVersionsCommand = new GetVersionsCommand();
        getVersionsCommand.setSourceDir( getPath( "versions" ) );
        final String result = getVersionsCommand.execute();

        assertNotNull( result );
    }

    @Test
    public void testExceptionThrownWhenNoDirectoryForVersionsExist()
        throws Exception
    {
        final GetVersionsCommand getVersionsCommand = new GetVersionsCommand();
        getVersionsCommand.setSourceDir( "non_existing_path" );

        exception.expect( RuntimeException.class );

        getVersionsCommand.execute();
    }

    @Test
    public void testNoVersionsReturnNull()
        throws Exception
    {
        final GetVersionsCommand getVersionsCommand = new GetVersionsCommand();
        getVersionsCommand.setSourceDir( getPath( "versions_not_exist" ) );
        final String result = getVersionsCommand.execute();

        assertNull( result );
    }

    private String getPath( final String path )
    {
        return new File( getClass().getResource( path ).getFile() ).getAbsolutePath();
    }
}
