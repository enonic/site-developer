package com.enonic.site.developer.tools.repo;

import java.io.File;
import java.io.IOException;
import java.nio.file.FileVisitResult;
import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.SimpleFileVisitor;
import java.nio.file.StandardCopyOption;
import java.nio.file.attribute.BasicFileAttributes;

import org.apache.commons.io.FileUtils;
import org.eclipse.jgit.api.CloneCommand;
import org.eclipse.jgit.api.Git;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.common.base.Preconditions;

public final class CloneRepoCommand
    extends GitCommand
{
    private final static Logger LOGGER = LoggerFactory.getLogger( CloneRepoCommand.class );

    protected static final String NO_REPO_MSG = "No repository set to clone from!";

    protected static final String NO_DEST_MSG = "No destination set to clone repo to!";

    private String destination;

    private String checkout; // Branch or commit to checkout

    public String execute()
    {
        try
        {
            return doExecute();
        }
        catch ( Throwable t )
        {
            LOGGER.error( "Failed to clone repo [" + repoName + "]", t );
            throw new RuntimeException( "Failed to clone repo [" + repoName + "]", t );
        }
    }

    private String doExecute()
        throws Exception
    {
        Preconditions.checkNotNull( repository, NO_REPO_MSG );
        Preconditions.checkNotNull( destination, NO_DEST_MSG );

        return cloneGitRepository();
    }

    private String cloneGitRepository()
        throws Exception
    {
        LOGGER.info( "Retrieving Git repository from [ " + makeUriWithCommit() + " ] ..." );

        // Creates the destination directory if it does not exist and cleans it
        final File destinationDirectory = new File( destination );
        FileUtils.deleteDirectory( destinationDirectory );
        final File temporaryDirectory = new File( destinationDirectory, ".CloneRepoTemporaryDirectory" );
        temporaryDirectory.mkdirs();

        try
        {
            // Clones the Git repository
            final CloneCommand cloneCommand = Git.cloneRepository().
                setURI( makeUri() ).
                setDirectory( temporaryDirectory );

            setSshTransportIfNeeded( cloneCommand );

            final Git git = cloneCommand.call();

            // Checks out the specified branch or commit if necessary
            if ( checkout != null )
            {
                git.checkout().setName( checkout ).call();
            }

            final String currentCommitId = git.log().call().iterator().next().getId().getName();

            //Closes the repository
            git.getRepository().close();

            // Removes Git related content
            removeFixGitContent( temporaryDirectory );

            // Copies the content from the temporary folder
            final CopyFileVisitor copyFileVisitor = new CopyFileVisitor( temporaryDirectory.toPath(), destinationDirectory.toPath() );
            Files.walkFileTree( temporaryDirectory.toPath(), copyFileVisitor );

            LOGGER.info( "Git repository retrieved." );

            return currentCommitId;
        }
        finally
        {
            // Removes the temporary folder
            FileUtils.deleteDirectory( temporaryDirectory );
        }
    }

    private void removeFixGitContent( File directory )
        throws IOException
    {
        // Removes the .git directory and README.md file
        FileUtils.deleteDirectory( new File( directory, ".git" ) );
        FileUtils.deleteQuietly( new File( directory, "README.md" ) );
    }

    private String makeUriWithCommit()
    {
        if ( checkout != null )
        {
            return repository + " : " + checkout;
        }

        return repository;
    }

    private class CopyFileVisitor
        extends SimpleFileVisitor<Path>
    {
        final Path sourcePath;

        final Path targetPath;

        private boolean rootFile = true;

        private CopyFileVisitor( Path sourcePath, Path targetPath )
        {
            this.sourcePath = sourcePath;
            this.targetPath = targetPath;
        }

        @Override
        public FileVisitResult visitFile( final Path sourceFilePath, final BasicFileAttributes attrs )
            throws IOException
        {
            final Path sourceFileSubPath = sourcePath.relativize( sourceFilePath );
            final Path targetFilePath = Paths.get( targetPath.toString(), sourceFileSubPath.toString() );
            Files.move( sourceFilePath, targetFilePath, StandardCopyOption.REPLACE_EXISTING, LinkOption.NOFOLLOW_LINKS );
            return FileVisitResult.CONTINUE;
        }

        @Override
        public FileVisitResult preVisitDirectory( final Path sourceFilePath, final BasicFileAttributes attrs )
            throws IOException
        {
            if ( rootFile )
            {
                rootFile = false;
            }
            else
            {
                final Path sourceFileSubPath = sourcePath.relativize( sourceFilePath );
                final Path targetFilePath = Paths.get( targetPath.toString(), sourceFileSubPath.toString() );

                if ( !Files.exists( targetFilePath ) )
                {
                    Files.copy( sourceFilePath, targetFilePath, StandardCopyOption.COPY_ATTRIBUTES, LinkOption.NOFOLLOW_LINKS );
                }
            }

            return FileVisitResult.CONTINUE;
        }
    }

    public void setDestination( String destination )
    {
        this.destination = destination;
    }

    public void setRepoName( String repoName )
    {
        this.repoName = repoName;
    }

    public void setCheckout( final String checkout )
    {
        this.checkout = checkout;
    }
}
