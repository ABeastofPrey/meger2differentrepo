import { Injectable } from '@angular/core';
import {MCProject} from '../models/project/mc-project.model';

@Injectable()
export class ProjectManagerService {

  constructor() { }
  
  getMCProjects() {
    
    //TODO: GET FROM SERVER - THIS IS CURRENTLY A MOCKUP
    
    let result : MCProject[] = [];
    let prj = new MCProject('PRJ1');
    prj.apps.push({
      name: 'App1',
      libs: ['LIB1.LIB','LIB2.LIB']
    });
    prj.apps.push({
      name: 'App2',
      libs: []
    });
    prj.dependencies.push('PNP.LIB','TEST.LIB');
    prj.macros.push({
      key: 'F1',
      app: 'App1'
    });
    result.push(prj);
    return Promise.resolve(result);
  }
}
