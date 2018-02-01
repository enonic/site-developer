package com.enonic.site.developer.tools.repo;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.lib.Ref;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class GetBranchesCommand
{
    private final static Logger LOGGER = LoggerFactory.getLogger( GetBranchesCommand.class );

    private String repository;

    public List<String> execute()
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

    private List<String> doExecute()
        throws Exception
    {
        LOGGER.info( "Fetching list of branches from [" + repository + "] ..." );

        final Collection<Ref> refs = Git.lsRemoteRepository().setHeads( true ).setRemote( repository ).call();

        final List<String> result = new ArrayList<>();

        for ( final Ref ref : refs )
        {
            result.add( ref.getName().replace( "refs/heads/", "" ) + "=" + ref.getObjectId().getName() );
        }

        LOGGER.info( "Branches fetched" );

        return result;
    }

    public void setRepository( String repository )
    {
        this.repository = repository;
    }
}
