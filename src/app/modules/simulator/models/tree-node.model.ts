export class TreeNode {
  name: string;
  type: string;
  children: TreeNode[] = [];
  parent: TreeNode;
  position: {x: number, y: number, z:number} = {x:0,y:0,z:0};
  rotation: {x: number, y: number, z:number} = {x:0,y:0,z:0};
  
  constructor(name:string,typeStr:string,parent: TreeNode) {
    this.name = name;
    this.type = typeStr;
    this.parent = parent;
  }
}
