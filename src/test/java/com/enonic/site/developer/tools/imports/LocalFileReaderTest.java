package com.enonic.site.developer.tools.imports;

import java.io.File;
import java.nio.file.Path;

import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;

import static org.junit.Assert.*;

public class LocalFileReaderTest
{
    @Rule
    public final ExpectedException exception = ExpectedException.none();

    @Test
    public void testFileRead()
        throws Exception
    {
        final LocalFileReader localFileReader = new LocalFileReader( getPath( "versions" ), "versions.json" );
        final String result = localFileReader.execute();

        assertNotNull( result );
    }

    @Test
    public void testExceptionThrownWhenSourceDirNotExists()
        throws Exception
    {
        final LocalFileReader localFileReader = new LocalFileReader( new File( "non_existing_path" ).toPath(), "file.txt" );

        exception.expect( RuntimeException.class );

        localFileReader.execute();
    }

    @Test
    public void testNoFileReturnsNull()
        throws Exception
    {
        final LocalFileReader localFileReader = new LocalFileReader( getPath( "versions_not_exist" ), "versions.json" );
        final String result = localFileReader.execute();

        assertNull( result );
    }

    private Path getPath( final String path )
    {
        return new File( getClass().getResource( path ).getFile() ).toPath();
    }
}
