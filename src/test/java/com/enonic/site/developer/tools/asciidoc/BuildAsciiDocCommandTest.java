package com.enonic.site.developer.tools.asciidoc;

import java.io.File;
import java.util.Arrays;

import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;

import com.enonic.site.developer.tools.CommonTest;

import static org.junit.Assert.*;

public class BuildAsciiDocCommandTest
    extends CommonTest
{
    @Rule
    public ExpectedException thrown = ExpectedException.none();

    //@Test
    public void testDocIsBuilt()
        throws Exception
    {
        final BuildAsciiDocCommand buildAsciiDocCommand = new BuildAsciiDocCommand();
        final String buildPath = getPath( "docbuild" );
        buildAsciiDocCommand.setSourceDir( buildPath );
        buildAsciiDocCommand.setRepoName( "test-repo" );
        buildAsciiDocCommand.execute();

        assertTrue( Arrays.asList( new File( buildPath ).list() ).stream().anyMatch( s -> s.equals( "testbuild.html" ) ) );
    }

    //@Test
    public void testExceptionThrownWhenSourceDirIsNull()
        throws Exception
    {
        thrown.expect( RuntimeException.class );
        new BuildAsciiDocCommand().execute();
    }

}
