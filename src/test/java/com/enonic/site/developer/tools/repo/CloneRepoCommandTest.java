package com.enonic.site.developer.tools.repo;

import org.junit.Test;

import com.enonic.site.developer.tools.CommonTest;

import static org.junit.Assert.*;

public class CloneRepoCommandTest
    extends CommonTest
{
    @Test
    public void testNoRepoThrowsException()
        throws Exception
    {
        try
        {
            new CloneRepoCommand().execute();
        }
        catch ( final Exception e )
        {
            assertEquals( CloneRepoCommand.NO_REPO_MSG, e.getCause().getMessage() );
            return;
        }

        assertTrue( false ); // Not supposed to reach this line
    }

    @Test
    public void testNoDestinationThrowsException()
        throws Exception
    {
        try
        {
            final CloneRepoCommand cloneRepoCommand = new CloneRepoCommand();
            cloneRepoCommand.setRepository( "some-test-repo" );
            cloneRepoCommand.execute();
        }
        catch ( final Exception e )
        {
            assertEquals( CloneRepoCommand.NO_DEST_MSG, e.getCause().getMessage() );
            return;
        }

        assertTrue( false ); // Not supposed to reach this line
    }
}
