package com.enonic.site.developer.tools.env;

import java.io.File;
import java.util.Properties;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.common.base.Strings;

public class EnvironmentResolver
{
	private final static Logger LOGGER = LoggerFactory.getLogger( EnvironmentResolver.class );

	private static String XP_HOME_DIR;

	protected final static String XP_HOME_DIR_PROP = "xp.home";

	protected static String XP_HOME_DIR_ENV = "XP_HOME";

	protected static String XP_INSTALL_DIR_PROP = "xp.install";

	protected static String XP_HOME_DIR_NAME = "home";

	public static String getXPHomeDir()
	{
		if ( XP_HOME_DIR == null )
		{
			XP_HOME_DIR = resolveHomeDir();
		}

		return XP_HOME_DIR;
	}

	private static String resolveHomeDir()
	{
		final Properties systemProperties = System.getProperties();

		final String xpHomeProperty = systemProperties.getProperty( XP_HOME_DIR_PROP );
		if ( !Strings.isNullOrEmpty( xpHomeProperty ) )
		{
			LOGGER.info( "Using " + XP_HOME_DIR_PROP );
			return xpHomeProperty;
		}

		final String xpHomeEnvProperty = System.getenv( XP_HOME_DIR_ENV );
		if ( !Strings.isNullOrEmpty( xpHomeEnvProperty ) )
		{
			LOGGER.info( "Using " + XP_HOME_DIR_ENV );
			return xpHomeEnvProperty;
		}

		final String xpInstallProperty = systemProperties.getProperty( XP_INSTALL_DIR_PROP );
		if ( !Strings.isNullOrEmpty( xpInstallProperty ) )
		{
			LOGGER.info( "Using " + XP_INSTALL_DIR_PROP );
			return xpInstallProperty + File.separator + XP_HOME_DIR_NAME;
		}

		return null;
	}
}
