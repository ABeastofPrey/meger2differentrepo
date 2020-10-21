import { Injectable } from '@angular/core';
import { fontRule, CharWidth } from '../models/customKeyBoard/custom-key-board.model';

@Injectable()
export class CustomKeyBoardService {
    constructor() { }

    public getCharWidth(text: string): number {
        var span = document.createElement("span");
        var result: CharWidth = { width: 0 };
        result.width = span.offsetWidth;
        span.style.visibility = "hidden";
        span.style.fontSize = fontRule.size;
        span.style.fontFamily = fontRule.family;
        span.style.display = "inline-block";
        document.body.appendChild(span);
        if (typeof span.textContent != "undefined") {
            span.textContent = text;
        } else {
            span.innerText = text;
        }
        result.width = parseFloat(window.getComputedStyle(span).width) - result.width;
        document.body.removeChild(span);
        return result.width;
    }

    public selectionStart(ele: HTMLInputElement): number {
        return ele.selectionStart;
    }

}
