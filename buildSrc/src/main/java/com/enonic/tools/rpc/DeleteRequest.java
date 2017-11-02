package com.enonic.tools.rpc;

final class DeleteRequest
    extends JsonRequest
{
    private String key;

    DeleteRequest()
    {
        setOperation( "delete" );
    }

    public String getKey()
    {
        return key;
    }

    public void setKey( final String key )
    {
        this.key = key;
    }
}
