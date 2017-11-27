package com.enonic.site.developer.tools.repo;

import com.enonic.xp.toolbox.app.InitAppCommand;

public final class GitRepoCloneCommand
{
    public String destination;

    public String repository;

    public String name;

    public void execute()
    {
        InitAppCommand initAppCommand = new InitAppCommand();
        initAppCommand.repository = repository;
        initAppCommand.destination = destination + name;
        initAppCommand.name = name;
        initAppCommand.run();
    }

    public void setDestination( String destination )
    {
        this.destination = destination;
    }

    public void setRepository( String repository )
    {
        this.repository = repository;
    }

    public void setName( String name )
    {
        this.name = name;
    }
}
