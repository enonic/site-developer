package com.enonic.site.developer.tools.env;

import java.io.File;

import static com.enonic.site.developer.tools.env.EnvironmentResolver.XP_HOME_DIR_PROP;
import static com.enonic.site.developer.tools.env.EnvironmentResolver.XP_INSTALL_DIR_PROP;
import static org.junit.Assert.*;

public class EnvironmentResolverTest
{

	//	@Test
	public void xpHomeDirPropertySet()
	{
		final String prop = "homeDirProp";
		System.setProperty( XP_HOME_DIR_PROP, prop );
		assertEquals( prop, EnvironmentResolver.getXPHomeDir() );
	}

	//	@Test
	public void xpHomeInstallDirPropertySet()
	{
		final String prop = "homeDirInstallProp";
		System.setProperty( XP_INSTALL_DIR_PROP, prop );
		assertEquals( prop + File.separator + XP_INSTALL_DIR_PROP, EnvironmentResolver.getXPHomeDir() );
	}

	//	@Test
	public void noPropertiesWereSet()
	{
		assertNull( EnvironmentResolver.getXPHomeDir() );
	}
}
