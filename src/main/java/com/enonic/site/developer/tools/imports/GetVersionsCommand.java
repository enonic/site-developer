package com.enonic.site.developer.tools.imports;

import java.io.File;
import java.nio.file.Path;

public class GetVersionsCommand
{
    private Path sourceDir;

    private final String versionsJsonName = "versions.json";

    public String execute()
    {
        return new LocalFileReader( sourceDir, versionsJsonName ).execute();
    }

    public void setSourceDir( final String sourceDir )
    {
        this.sourceDir = new File( sourceDir ).toPath();
    }
}
