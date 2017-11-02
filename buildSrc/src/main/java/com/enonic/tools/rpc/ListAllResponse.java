package com.enonic.tools.rpc;

import java.util.Set;

final class ListAllResponse
    extends JsonResponse
{
    private Set<String> keys;

    public Set<String> getKeys()
    {
        return this.keys;
    }

    public void setKeys( final Set<String> keys )
    {
        this.keys = keys;
    }
}
