package com.enonic.tools.rpc;

abstract class JsonRequest
{
    private String operation;

    final String getOperation()
    {
        return operation;
    }

    final void setOperation( final String operation )
    {
        this.operation = operation;
    }
}
