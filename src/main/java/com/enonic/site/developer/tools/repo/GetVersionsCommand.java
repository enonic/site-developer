package com.enonic.site.developer.tools.repo;

import java.io.FileNotFoundException;
import java.io.InputStream;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Preconditions;

/**
 * Class fetches versions.json if available from repo's /docs folder
 */
public class GetVersionsCommand
{
    private static final Logger LOGGER = LoggerFactory.getLogger( GetVersionsCommand.class );

    protected static final String MASTER_BRANCH = "master";

    private static final String VERSIONS_JSON_PATH = "/docs/versions.json";

    private static final String GITHUB_RAW = "https://raw.githubusercontent.com/";

    protected final static String NO_REPO_NAME_MSG = "No repository name set to fetch versions from!";

    protected final static String NO_REPO_URL_MSG = "No repository url set to fetch versions from!";

    private String repoName;

    private String repoUrl;

    public String execute()
    {
        try
        {
            return doExecute();
        }
        catch ( final Throwable t )
        {
            LOGGER.error( "Failed to fetch [" + VERSIONS_JSON_PATH + "] from [" + repoName + "]", t );
            throw new RuntimeException( "Failed to fetch [" + VERSIONS_JSON_PATH + "] from [" + repoName + "]", t );
        }
    }

    private String doExecute()
        throws Exception
    {
        Preconditions.checkNotNull( repoName, NO_REPO_NAME_MSG );
        Preconditions.checkNotNull( repoUrl, NO_REPO_URL_MSG );

        final VersionsJson versionsJson = fetchVersionsJson();

        return new ObjectMapper().writeValueAsString( versionsJson );
    }

    protected List<GitBranch> getBranches()
    {
        final GetBranchesCommand getBranchesCommand = new GetBranchesCommand();
        getBranchesCommand.setRepository( repoUrl );

        return getBranchesCommand.execute();
    }

    private VersionsJson fetchVersionsJson()
        throws Exception
    {
        final List<GitBranch> branches = getBranches();
        final String masterCommitId =
            branches.stream().filter( branch -> branch.getName().equals( MASTER_BRANCH ) ).findFirst().get().getCommitId();

        LOGGER.info( "Fetching [" + VERSIONS_JSON_PATH + "] from [" + repoName + "] ..." );

        try (final InputStream inputStream = getVersionsJsonAsStream( masterCommitId ))
        {
            final VersionsJson versionsJson = readInputStreamIntoVersionsJson( inputStream );
            setLatestVersionIfNotSet( versionsJson );
            setCommitIds( versionsJson, branches );

            LOGGER.info( "Fetched [versions.json]" );

            return versionsJson;
        }
        catch ( final FileNotFoundException fnf )
        {
            LOGGER.info( "No [" + VERSIONS_JSON_PATH + "] found in [" + repoName + "]" );
            return makeMasterOnlyVersionsJson( masterCommitId );
        }
    }

    private InputStream getVersionsJsonAsStream( final String masterCommitId )
        throws Exception
    {
        return new URL( makeUrlToVersionsJson( masterCommitId ) ).openStream();
    }

    protected String makeUrlToVersionsJson( final String masterCommitId )
    {
        return GITHUB_RAW + repoName + "/" + masterCommitId + VERSIONS_JSON_PATH;
    }

    private VersionsJson readInputStreamIntoVersionsJson( final InputStream inputStream )
        throws Exception
    {
        final ObjectMapper mapper = new ObjectMapper();
        return mapper.readValue( inputStream, VersionsJson.class );
    }

    private VersionsJson makeMasterOnlyVersionsJson( final String masterCommitId )
    {
        final VersionJson versionJson = new VersionJson();
        versionJson.setLabel( MASTER_BRANCH );
        versionJson.setLatest( true );
        versionJson.setCheckout( MASTER_BRANCH );
        versionJson.setCommitId( masterCommitId );

        final VersionsJson versionsJson = new VersionsJson();
        versionsJson.getVersions().add( versionJson );

        return versionsJson;
    }

    private void setLatestVersionIfNotSet( final VersionsJson versionsJson )
    {
        if ( !isLatestSpecified( versionsJson ) )
        {
            versionsJson.getVersions().get( 0 ).setLatest( true );
        }
    }

    private boolean isLatestSpecified( final VersionsJson versionsJson )
    {
        return versionsJson.getVersions().stream().anyMatch( version -> version.isLatest() );
    }

    private void setCommitIds( final VersionsJson versionsJson, final List<GitBranch> branches )
    {
        versionsJson.getVersions().stream().forEach(
            versionJson -> versionJson.setCommitId( getCommitId( versionJson.getCheckout(), branches ) ) );
    }

    private String getCommitId( final String checkout, final List<GitBranch> branches )
    {
        return branches.stream().filter( branch -> branch.getName().equals( checkout ) ).findFirst().orElse(
            new GitBranch( "", checkout ) ).getCommitId();
    }

    public void setRepoName( final String repoName )
    {
        this.repoName = repoName;
    }

    public void setRepoUrl( final String repoUrl )
    {
        this.repoUrl = repoUrl;
    }

    protected static final class VersionsJson
    {
        private List<VersionJson> versions = new ArrayList();

        public VersionsJson()
        {
        }

        public List<VersionJson> getVersions()
        {
            return versions;
        }

        public void setVersions( final List<VersionJson> versions )
        {
            this.versions = versions;
        }
    }

    protected static final class VersionJson
    {
        private String label;

        private String checkout;

        private String commitId;

        private boolean latest;

        public VersionJson()
        {
        }

        public String getLabel()
        {
            return label;
        }

        public void setLabel( final String label )
        {
            this.label = label;
        }

        public String getCheckout()
        {
            return checkout;
        }

        public void setCheckout( final String checkout )
        {
            this.checkout = checkout;
        }

        public String getCommitId()
        {
            return commitId;
        }

        public void setCommitId( final String commitId )
        {
            this.commitId = commitId;
        }

        public boolean isLatest()
        {
            return latest;
        }

        public void setLatest( final boolean latest )
        {
            this.latest = latest;
        }

    }
}
