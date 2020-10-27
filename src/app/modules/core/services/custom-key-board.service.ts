import { Injectable } from '@angular/core';
import { fontRule, CharWidth } from '../models/customKeyBoard/custom-key-board.model';

@Injectable()
export class CustomKeyBoardService {
    constructor() { }

    public getCharWidth(text: string,password: boolean): number {
        var span = document.createElement("span");
        var result: CharWidth = { width: 0 };
        result.width = span.offsetWidth;
        span.style.visibility = "hidden";
        span.style.fontSize = fontRule.size;
        span.style.fontFamily = fontRule.family;
        span.style.display = "inline-block";
        document.body.appendChild(span);
        let textPassword = "";
        for(let i=0;i<text.length;i++) {
            textPassword += "*";
        }
        if (typeof span.textContent != "undefined") {
            span.textContent = (password ? textPassword : text);
        } else {
            span.innerText = (password ? textPassword : text);
        }
        result.width = parseFloat(window.getComputedStyle(span).width) - result.width;
        document.body.removeChild(span);
        let isSpace: boolean = false;
        let num: number = 0;
        for(let i=0;i<text.length;i++) {
            if(text[i] === " ") {
                if(isSpace) {
                    num++;
                }
                isSpace = true;
            }else {
                isSpace = false;
            }
        }
        text[text.length-1]=== " " ? num++ : "";
        text[0]=== " " ? num++ : "";
        return result.width + 7.1 * num;
    }

    public selectionStart(ele: HTMLInputElement): number {
        return ele.selectionStart;
    }

}
