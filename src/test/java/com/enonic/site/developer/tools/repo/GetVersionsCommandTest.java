package com.enonic.site.developer.tools.repo;

import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;

import com.fasterxml.jackson.databind.ObjectMapper;

import com.enonic.site.developer.tools.CommonTest;

import static org.junit.Assert.*;

public class GetVersionsCommandTest
    extends CommonTest
{
    private static final String MASTER_COMMIT_ID = "d843a5af87ed28b09465d8e17c206c189542c522";
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
            assertEquals( GetVersionsCommand.NO_REPO_NAME_MSG, e.getCause().getMessage() );
            return;
        }

        assertTrue( false ); // Not supposed to reach this line
    }

    @Test
    public void testNoVersionsReturnsVersionsWithMasterOnly()
        throws Exception
    {
        final GetVersionsCommand getVersionsCommand = new GetVersionsCommandExt( makeUrlToFile( "non-existing-path" ) );
        getVersionsCommand.setRepoName( "test-repo-name" );
        getVersionsCommand.setRepoUrl( "test-repo-url" );

        final String result = getVersionsCommand.execute();

        final GetVersionsCommand.VersionsJson versionsJson = new ObjectMapper().readValue( result, GetVersionsCommand.VersionsJson.class );
        assertTrue( versionsJson.getVersions().size() == 1 );

        final GetVersionsCommand.VersionJson versionJson = versionsJson.getVersions().get( 0 );
        assertTrue( versionJson.isLatest() );
        assertEquals( versionJson.getLabel(), GetVersionsCommand.MASTER_BRANCH );
        assertEquals( versionJson.getCheckout(), GetVersionsCommand.MASTER_BRANCH );
        assertEquals( versionJson.getCommitId(), MASTER_COMMIT_ID );
    }

    @Test
    public void testVersionsJsonReturned()
        throws Exception
    {
        final String path = getPath( "getversions/versions.json" );
        final GetVersionsCommand getVersionsCommand = new GetVersionsCommandExt( makeUrlToFile( path ) );
        getVersionsCommand.setRepoName( "test-repo-name" );
        getVersionsCommand.setRepoUrl( "test-repo-url" );
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
        protected String makeUrlToVersionsJson( final String masterCommitId )
        {
            return url;
        }

        @Override
        protected List<GitBranch> getBranches()
        {
            final List<GitBranch> branches = new ArrayList<>();
            branches.add( new GitBranch( MASTER_BRANCH, MASTER_COMMIT_ID ) );
            return branches;
        }
    }
}
