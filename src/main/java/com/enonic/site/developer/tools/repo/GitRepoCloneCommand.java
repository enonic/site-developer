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
import org.eclipse.jgit.api.errors.GitAPIException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public final class GitRepoCloneCommand
{
    private final static Logger LOGGER = LoggerFactory.getLogger( GitRepoCloneCommand.class );

    private static final String GITHUB_URL = "https://github.com/";

    private static final String ENONIC_REPOSITORY_PREFIX = "enonic/";

    private static final String GIT_REPOSITORY_SUFFIX = ".git";

    public String destination;

    public String repository;

    public String repoName;

    public void execute()
    {
        try
        {
            doExecute();
        }
        catch ( Throwable t )
        {
            LOGGER.error( "Failed to clone repo [" + repoName + "]", t );
            throw new RuntimeException( "Failed to clone repo [" + repoName + "]", t );
        }
    }

    private void doExecute() throws Exception
    {
        String gitRepositoryUri = resolveGitRepositoryUri();
        cloneGitRepository( gitRepositoryUri );
    }

    private String resolveGitRepositoryUri()
    {
        if ( repository.contains( ":/" ) )
        {
            return repository;
        }
        if ( repository.contains( "/" ) )
        {
            return GITHUB_URL + repository + GIT_REPOSITORY_SUFFIX;
        }
        return GITHUB_URL + ENONIC_REPOSITORY_PREFIX + repository + GIT_REPOSITORY_SUFFIX;
    }

    private void cloneGitRepository( final String gitRepositoryUri )
        throws GitAPIException, IOException
    {
        LOGGER.info( "Retrieving Git repository from \"" + gitRepositoryUri + "\" ..." );

        // Creates the destination directory if it does not exist
        File destinationDirectory = new File( destination );
        File temporaryDirectory = new File( destinationDirectory, ".InitAppTemporaryDirectory" );
        temporaryDirectory.mkdirs();

        try
        {
            // Clones the Git repository
            final CloneCommand cloneCommand = Git.cloneRepository().
                setURI( gitRepositoryUri ).
                setDirectory( temporaryDirectory );

            Git git = cloneCommand.call();

            //Closes the repository
            git.getRepository().close();

            // Removes Git related content
            removeFixGitContent( temporaryDirectory );

            // Copies the content from the temporary folder
            final CopyFileVisitor copyFileVisitor = new CopyFileVisitor( temporaryDirectory.toPath(), destinationDirectory.toPath() );
            Files.walkFileTree( temporaryDirectory.toPath(), copyFileVisitor );
        }
        finally
        {
            // Removes the temporary folder
            FileUtils.deleteDirectory( temporaryDirectory );
        }

        LOGGER.info( "Git repository retrieved." );
    }

    private void removeFixGitContent( File directory )
        throws IOException
    {
        // Removes the .git directory and README.md file
        FileUtils.deleteDirectory( new File( directory, ".git" ) );
        FileUtils.deleteQuietly( new File( directory, "README.md" ) );
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

    public void setRepository( String repository )
    {
        this.repository = repository;
    }

    public void setRepoName( String repoName )
    {
        this.repoName = repoName;
    }
}
