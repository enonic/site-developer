package com.enonic.site.developer.tools.repo;

import org.junit.Test;

public class CloneRepoCommandTest
{

    @Test
    public void clonetest()
        throws Exception
    {
        final CloneRepoCommand cloneRepoCommand = new CloneRepoCommand();
        cloneRepoCommand.setDestination( "C:/Dev/Enonic/docs-repos/clonetest" );
        cloneRepoCommand.setRepoName( "lib-menu" );
        cloneRepoCommand.setRepository( "https://github.com/enonic/lib-menu" );
//        cloneRepoCommand.setCheckout( "45ea75b4afd04477d61100f07b99ca28b0ab7b97" );
        cloneRepoCommand.execute();
    }
}
