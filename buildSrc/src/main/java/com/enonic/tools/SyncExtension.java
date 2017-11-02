package com.enonic.tools;

import java.io.File;

import org.gradle.api.Project;

public class SyncExtension
{
    public final static String NAME = "syncOpts";

    private String docsAuthKey;

    private String docsEndpoint;

    private File docsBaseDir;

    public SyncExtension( final Project project )
    {
        this.docsBaseDir = new File( project.getProjectDir(), "docs" );
    }

    public String getDocsAuthKey()
    {
        return this.docsAuthKey;
    }

    public void setDocsAuthKey( final String docsAuthKey )
    {
        this.docsAuthKey = docsAuthKey;
    }

    public String getDocsEndpoint()
    {
        return this.docsEndpoint;
    }

    public void setDocsEndpoint( final String docsEndpoint )
    {
        this.docsEndpoint = docsEndpoint;
    }

    public File getDocsBaseDir()
    {
        return this.docsBaseDir;
    }

    public void setDocsBaseDir( final File docsBaseDir )
    {
        this.docsBaseDir = docsBaseDir;
    }
}