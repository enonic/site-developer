package com.enonic.site.developer.tools.doc;

public class BuildAsciiDocCommandTest
{
    //@Test
    public void testBuild()
        throws Exception
    {
        final BuildAsciiDocCommand buildAsciiDocCommand = new BuildAsciiDocCommand();
        buildAsciiDocCommand.setSourceDir( "C:/Dev/Enonic/docs-repos/" );
        buildAsciiDocCommand.setRepoName( "enonic/lib-xslt" );
        buildAsciiDocCommand.execute();
    }
}
