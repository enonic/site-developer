package com.enonic.tools.tasks;

import org.gradle.api.DefaultTask;

import com.enonic.tools.SyncExtension;

public abstract class AbstractTask
    extends DefaultTask
{
    protected SyncExtension extension;

    public AbstractTask()
    {
        this.extension = getProject().getExtensions().findByType( SyncExtension.class );
    }
}
