package com.enonic.site.developer.tools.repo;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.lib.Ref;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.common.base.Preconditions;

/**
 * Class fetches list of repo's branches
 */
public class GetBranchesCommand
{
    private final static Logger LOGGER = LoggerFactory.getLogger( GetBranchesCommand.class );

    protected final static String NO_REPO_MSG = "No repository set to fetch branches from!";

    private String repository;

    public List<GitBranch> execute()
    {
        try
        {
            return doExecute();
        }
        catch ( Throwable t )
        {
            LOGGER.error( "Failed to fetch branches of [" + repository + "]", t );
            throw new RuntimeException( "Failed to fetch branches of [" + repository + "]", t );
        }
    }

    private List<GitBranch> doExecute()
        throws Exception
    {
        Preconditions.checkNotNull( repository, NO_REPO_MSG );

        LOGGER.info( "Fetching list of branches from [" + repository + "] ..." );

        final Collection<Ref> refs = listGitRefsFromRepo();

        LOGGER.info( "Branches fetched" );

        return processRefs( refs );
    }

    protected Collection<Ref> listGitRefsFromRepo()
        throws Exception
    {
        return Git.lsRemoteRepository().setHeads( true ).setRemote( repository ).call();
    }

    private List<GitBranch> processRefs( final Collection<Ref> refs )
    {
        final List<GitBranch> result = new ArrayList<>();

        for ( final Ref ref : refs )
        {
            result.add( new GitBranch( ref.getName().replace( "refs/heads/", "" ), ref.getObjectId().getName() ) );
        }

        return result;
    }

    public void setRepository( String repository )
    {
        this.repository = repository;
    }
}
