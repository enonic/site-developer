package com.enonic.site.developer.tools.repo;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.eclipse.jgit.lib.ObjectId;
import org.eclipse.jgit.lib.ObjectIdRef;
import org.eclipse.jgit.lib.Ref;
import org.junit.Test;

import static org.junit.Assert.*;

public class GetBranchesCommandTest
{
    @Test
    public void testNoRepoThrowsException()
        throws Exception
    {
        try
        {
            new GetBranchesCommand().execute();
        }
        catch ( final Exception e )
        {
            assertEquals( GetBranchesCommand.NO_REPO_MSG, e.getCause().getMessage() );
            return;
        }

        assertTrue( false ); // Not supposed to reach this line
    }

    @Test
    public void testResultIsOk()
    {
        final GetBranchesCommand getBranchesCommand = new GetBranchesCommandExt();
        getBranchesCommand.setRepository( "some-test-repo" );

        final List<GitBranch> result = getBranchesCommand.execute();

        assertTrue( result.size() == 3 );
        assertEquals( "branch_0", result.get( 0 ).getName() );
        assertEquals( "0123456789012345678901234567890123456780", result.get( 0 ).getCommitId() );
        assertEquals( "branch_1", result.get( 1 ).getName() );
        assertEquals( "0123456789012345678901234567890123456781", result.get( 1 ).getCommitId() );
        assertEquals( "branch_2", result.get( 2 ).getName() );
        assertEquals( "0123456789012345678901234567890123456782", result.get( 2 ).getCommitId() );
    }

    private final class GetBranchesCommandExt
        extends GetBranchesCommand
    {
        @Override
        protected Collection<Ref> listGitRefsFromRepo()
            throws Exception
        {
            final List<Ref> refs = new ArrayList<>();

            for ( int i = 0; i < 3; i++ )
            {
                final ObjectId objectId = ObjectId.fromString( "012345678901234567890123456789012345678" + i );
                final Ref ref = new ObjectIdRef.PeeledNonTag( Ref.Storage.NETWORK, "refs/heads/branch_" + i, objectId );
                refs.add( ref );
            }

            return refs;
        }
    }
}

