package com.enonic.site.developer.tools.repo;

public @interface GitConfig
{
    String sshKeyPath() default "";

    String sshKeyPassword() default "";
}
