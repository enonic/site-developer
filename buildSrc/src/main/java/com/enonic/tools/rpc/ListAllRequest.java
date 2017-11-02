package com.enonic.tools.rpc;

final class ListAllRequest
    extends JsonRequest
{
    ListAllRequest()
    {
        setOperation( "listAll" );
    }
}
