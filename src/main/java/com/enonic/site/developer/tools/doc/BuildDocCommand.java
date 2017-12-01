package com.enonic.site.developer.tools.doc;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang.SystemUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public final class BuildDocCommand
{
    private final static Logger LOGGER = LoggerFactory.getLogger( BuildDocCommand.class );

    private String destination;

    private String repoName;

    public void execute()
        throws Exception
    {
        try
        {
            LOGGER.info( "Building repo '" + repoName + "' ..." );
            ProcessBuilder pb = new ProcessBuilder( makeCommand() );
            pb.directory( new File( destination ) );
            pb.redirectErrorStream( true );
            Process p = pb.start();
            p.waitFor();
            p.destroyForcibly();
        }
        catch ( final Throwable t )
        {
            LOGGER.error( "Failed to build repo '" + repoName + "'", t );
            throw t;
        }

        final File buildDir = new File( destination + "/build" );
        if ( !buildDir.exists() )
        {
            LOGGER.error( "Failed to build repo '" + repoName + "'" );
            throw new Exception( "Failed to build repo '" + repoName + "'" );
        }

        LOGGER.info( "Repo '" + repoName + "' built successfully" );
    }

    private List<String> makeCommand()
    {
        final List<String> commandAndArgs = new ArrayList<>();

        if ( SystemUtils.IS_OS_WINDOWS )
        {
            commandAndArgs.addAll( Arrays.asList( "cmd", "/c", "gradlew", "buildDoc" ) );
        }
        else
        {
            commandAndArgs.addAll( Arrays.asList( "gradlew", "buildDoc" ) );
        }


        return commandAndArgs;
    }

    public void setDestination( String destination )
    {
        this.destination = destination;
    }

    public void setRepoName( String repoName )
    {
        this.repoName = repoName;
    }
}
