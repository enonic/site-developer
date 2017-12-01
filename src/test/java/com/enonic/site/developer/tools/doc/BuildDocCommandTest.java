package com.enonic.site.developer.tools.doc;

import com.enonic.site.developer.tools.repo.BuildRepoCommand;

public class BuildDocCommandTest
{
    //@Test
    public void testBuild()
        throws Exception
    {
        final BuildRepoCommand buildRepoCommand = new BuildRepoCommand();
        buildRepoCommand.setDestination( "C:/Dev/Enonic/docs-repos/" );
        buildRepoCommand.setRepoName( "enonic/lib-xslt" );
        buildRepoCommand.execute();
    }
}
