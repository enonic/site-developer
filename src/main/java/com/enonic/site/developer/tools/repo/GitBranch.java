package com.enonic.site.developer.tools.repo;

public class GitBranch
{
    private final String name;

    private final String commitId;

    public GitBranch( final String name, final String commitId )
    {
        this.name = name;
        this.commitId = commitId;
    }

    public String getName()
    {
        return name;
    }

    public String getCommitId()
    {
        return commitId;
    }
}
