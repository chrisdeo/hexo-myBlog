---
title: 一个兴趣使然的前端开发
date: 2018-11-12 17:45:24
---

<style>
    pre:not(:empty) {
        overflow: auto;
        background: rgb(48, 48, 48);
        border: 1px solid #ccc;
        max-height: 45vh;
        width: 49%;
        font-size: 14px;
        font-family: monospace;
        padding: 1vh 0.5vw;
        white-space: pre-wrap;
        outline: 0;
        /*   margin: 1vh 0.5vw; */
    }

    #descripttion {
        position: absolute;
        color: #FFFFFF;
        transition: all 1s;
    }
</style>

<pre contenteditable id="descripttion" style="box-shadow: -4px 4px 2px 0 rgba(0,0,0,0.3)"></pre>

<script>
    let preTarget = document.getElementById('descripttion');
    let text = 'Not everything that counts can be counted. （并不是每一件算得出来的事 都有意义）    -- Albert Einstein';
    let idx = 0;
    let printOut = () => {
    preTarget.innerHTML += (text[idx++]);
    if (idx === text.length) clearInterval(handler);
    }
    let handler = setInterval(printOut, 66);
</script>