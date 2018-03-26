package com.enonic.site.developer.tools.repo;

import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.TransportCommand;
import org.eclipse.jgit.transport.JschConfigSessionFactory;
import org.eclipse.jgit.transport.OpenSshConfig;
import org.eclipse.jgit.transport.SshTransport;
import org.eclipse.jgit.util.FS;

import com.jcraft.jsch.JSch;
import com.jcraft.jsch.JSchException;
import com.jcraft.jsch.Session;

import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;

abstract class GitCommand
    implements ScriptBean
{
    private GitConfigHandlerImpl gitConfigHandlerImpl;

    private boolean isRepoPrivate;

    protected String repository;

    protected String repoName;

    protected void setSshTransportIfNeeded( final TransportCommand transportCommand )
        throws Exception
    {
        if ( !isRepoPrivate )
        {
            return;
        }

        setSshTransport( transportCommand );
    }

    private void setSshTransport( final TransportCommand transportCommand )
        throws Exception
    {
        transportCommand.setTransportConfigCallback( transport -> {
            SshTransport sshTransport = (SshTransport) transport;
            sshTransport.setSshSessionFactory( new GitSshSessionFactory() );
        } );
    }

    protected String makeUri()
    {
        if ( !isRepoPrivate )
        {
            return repository;
        }

        // making ssh url
        final String result = repository.replace( "https://github.com/", "git@github.com:" );

        if ( result.endsWith( ".git" ) )
        {
            return result;
        }

        return result + ".git";
    }

    public void setRepository( String repository )
    {
        this.repository = repository;
        this.isRepoPrivate = isRepoPrivate();
    }

    private boolean isRepoPrivate()
    {
        try
        {
            Git.lsRemoteRepository().setHeads( true ).setRemote( repository ).call();
        }
        catch ( final Exception e )
        {
            return ( e.getMessage().contains( "Authentication is required" ) );
        }

        return false;
    }

    public void setRepoName( String repoName )
    {
        this.repoName = repoName;
    }

    @Override
    public void initialize( final BeanContext context )
    {
        gitConfigHandlerImpl = (GitConfigHandlerImpl) context.getService( GitConfigHandler.class ).get();
    }

    private final class GitSshSessionFactory
        extends JschConfigSessionFactory
    {
        @Override
        protected void configure( final OpenSshConfig.Host host, final Session session )
        {
            session.setPassword( gitConfigHandlerImpl.getSshKeyPassword() );
        }

        @Override
        protected JSch createDefaultJSch( final FS fs )
            throws JSchException
        {
            final JSch defaultJSch = super.createDefaultJSch( fs );
            defaultJSch.addIdentity( gitConfigHandlerImpl.getSshKeyPath() );
            return defaultJSch;
        }
    }
}
