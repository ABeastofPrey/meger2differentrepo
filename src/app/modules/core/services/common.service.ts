import {Injectable} from "@angular/core";
import {Platform} from "@angular/cdk/platform";
import * as screenfull from "screenfull";
import {Screenfull} from "screenfull";

@Injectable()
export class CommonService {
  
  constructor(private platform: Platform) {
    
  }
  
  get isTablet() : boolean {
    const result = this.platform.ANDROID || this.platform.IOS;
    return result;
  }
  
  goFullScreen() {
    const s = <Screenfull> screenfull;
    if (s.enabled) {
      s.request();
    }
  }
  
}