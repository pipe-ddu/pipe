package com.hln.daydayup.msg;

import lombok.Data;

@Data
public class ShutDownMsg extends NettyMsg{
    {
        setType(6); //利用代码块的方式
    }
}