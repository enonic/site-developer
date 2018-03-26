package com.enonic.site.developer.tools.repo;

import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;

@Component(immediate = true, configurationPid = "com.enonic.site.developer")
public final class GitConfigHandlerImpl
    implements GitConfigHandler
{
    private String sshKeyPath;

    private String sshKeyPassword;

    @Activate
    public void activate( final GitConfig config )
    {
        this.sshKeyPath = config.sshKeyPath();
        this.sshKeyPassword = config.sshKeyPassword();
    }

    public String getSshKeyPath()
    {
        return sshKeyPath;
    }

    public String getSshKeyPassword()
    {
        return sshKeyPassword;
    }
}
