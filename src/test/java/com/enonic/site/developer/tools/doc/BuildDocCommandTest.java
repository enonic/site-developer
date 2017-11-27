package com.enonic.site.developer.tools.doc;

import org.junit.Test;

public class BuildDocCommandTest
{
    //@Test
    public void testBuild()
        throws Exception
    {
        final BuildDocCommand buildDocCommand = new BuildDocCommand();
        buildDocCommand.setDestination( "C:/Dev/Enonic/docs-repos/" );
        buildDocCommand.setName( "enonic/lib-xslt" );
        buildDocCommand.execute();
    }
}
