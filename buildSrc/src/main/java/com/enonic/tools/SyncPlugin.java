package com.enonic.tools;

import org.gradle.api.Plugin;
import org.gradle.api.Project;

import com.enonic.tools.tasks.SyncDocsTask;

public class SyncPlugin
    implements Plugin<Project>
{
    @Override
    public void apply( final Project project )
    {
        // Create extension.
        project.getExtensions().create( SyncExtension.NAME, SyncExtension.class, project );

        // Create tasks.
        project.getTasks().create( "syncDocs", SyncDocsTask.class );
    }
}
