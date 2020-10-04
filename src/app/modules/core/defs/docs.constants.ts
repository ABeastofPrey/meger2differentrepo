export const DOCS = {
  types: ['long', 'double', 'string', 'element', 'position', 'object', 'other', 'location', 'number', 'int'],
  ac_objects: ['sys'],
  keywords: [
    { name: 'long', meta: 'Variable Type' },
    { name: 'double', meta: 'Variable Type' },
    { name: 'string', meta: 'Variable Type' },
    { name: 'joint', meta: 'Variable Type' },
    { name: 'location', meta: 'Variable Type' },
    { name: 'error', meta: 'Variable Type' },
    {
      name: 'recordClose',
      meta: 'MC-Basic',
      desc: 'This command closes the record data file and enables it to be retrieved. You must issue this command before the next RECORD command is issued.'
    },
    {
      name: 'recording',
      meta: 'Function',
      desc: `This query returns the state of the data recorder. The following values are returned:<ul>
              <li>0 - recorder undefined and inactive.</li>
              <li>1 - Recorder is defined, but inactive. (The RECORDON command is needed to activate it.)</li>
              <li>2 - Recording is in progress (Data acquisition process after RECORDON was given.)</li>
              <li>3 - Recording suspended. (RECORDOFF command issued.)</li>
              <li>4 - Data acquisition completed automatically. Recorder is still defined. (RECORDCLOSE command needed to flush the data to the disk.)</li></ul>`
    },
    {
      name: 'recordOff',
      meta: 'MC-Basic',
      desc: 'The recording action is stopped using this command or if the specified number of points have been recorded.'
    },
    {
      name: 'recordOn',
      meta: 'MC-Basic',
      desc: 'This command starts the recording process.'
    },
    { name: 'SHL', meta: 'MC-Basic', desc: `SHL (shift left) shifts each bit in <Number> N places to the left. N zeros are shifted into the N rightmost positions.` },
    { name: 'SHR', meta: 'MC-Basic', desc: `SHR (shift right) shifts each bit in <Number> N places to the right. The N rightmost bits are lost.` },
    {
      name: 'filechecksum',
      meta: 'Task Function',
      afterDot: true,
      desc: 'Calculates a checksum of  the file, used by the GUI to quickly discover difference between files in the controller and copies on the PC hard disk.'
    },
    { name: 'varlist', meta: 'MC-Basic', desc: 'Returns a list of the variable and constant names defined in the system.' },
  ],
  group: [
    {
      name: 'ACCELERATIONMAXROT',
      desc: `Defines the maximum rotation acceleration of the robot. Used for both AROT and DROT. The value limits only the Cartesian motion interpolations (MOVES, CIRCLE). This parameter does not affect joint interpolated movements (MOVE).`,
      type: 1,
      short: 'AMrot',
      range: '0.1 - MaxDouble'
    },
    {
      name: 'ACCELERATIONMAXTRANS',
      desc: `Defines the maximum translation acceleration of the robot. Used for both ATRAN and DTRAN. The value limits the Cartesina motion interpolations only (MOVES, CIRCLE). This parameter does not affect joint interpolated movements (MOVE).`,
      type: 1,
      short: 'AMtran',
      range: '0.1 - MaxDouble'
    },
    {
      name: 'ACCELERATIONROT',
      desc: `Defines the rotation acceleration of the robot. Together with ATRAN, defines the acceleration of a Cartesina motion. This value is used only in two motion commands: MOVES and CIRCLE. In joint interpolated movements (MOVE), this value is ignored. The group must be defined with a robot model (model !=1). The value cannot be greater than ACCLERATIONMAXROT. The system always takes the smaller of the two with a notification message sent to the user.`,
      type: 1,
      short: 'ARot',
      range: '0.1 - MaxDouble'
    },
    {
      name: 'ACCELERATIONTRANS',
      desc: `Defines the translation acceleration of the robot. Together with AROT, defines the acceleration of a Cartesina motion.
              This value is used only in two motion commands: MOVES and CIRCLE.`,
      type: 1,
      short: 'ATran',
      range: '0.1 - MaxDouble'
    },
    {
      name: 'ARMCMD',
      desc: `Defines the working (command) robot configuration. When the target position is given as location variable, it is Cartesian point. This flag determines which of the solutions will be taken for the joint coordinates of the target position.
              <b>0(auto) / 1(Lefty) / 2(Righty)</b>`,
      type: 0,
      short: 'ACmd',
      range: '0 - 2'
    },
    {
      name: 'ARMFBK',
      desc: `Returns the actual (current) robot configuration. In SCARA  robots each Cartesian position can be obtained by two different angles of the second joint.  These two solutions represent two solutions of the robots inverse kinematics equations, or in other words the robot configurations. Usually they are called “lefty” and “righty” robot configurations.  This flag indicates which of them is taken. Also, when this flag is different from the commanded one (armcmd) no straight line motion can be made.`,
      type: 0,
      short: 'Afbk',
      range: '0 - 2',
      readOnly: true
    },
    {
      name: 'Base',
      desc: `Base is a Robot property which informs the system to use the specified location as the base transformation. It defines the position and orientation of the arm in the cell according to the WORLD reference.`,
      type: 5,
      children: [
        {
          name: 'XMAX',
          desc: `Define maximum value for Base frame X coordinate.`,
          type: 1,
          range: '0 - MaxDouble'
        },
        {
          name: 'XMIN',
          desc: `Define minimum value for Base frame X coordinate.`,
          type: 1,
          range: '0 - MaxDouble'
        },
        {
          name: 'YMAX',
          desc: `Define maximum value for Base frame Y coordinate.`,
          type: 1,
          range: '0 - MaxDouble'
        },
        {
          name: 'YMIN',
          desc: `Define minimum value for Base frame Y coordinate.`,
          type: 1,
          range: '0 - MaxDouble'
        },
        {
          name: 'ZMAX',
          desc: `Define maximum value for Base frame Z coordinate.`,
          type: 1,
          range: '0 - MaxDouble'
        },
        {
          name: 'ZMIN',
          desc: `Define minimum value for Base frame Z coordinate.`,
          type: 1,
          range: '0 - MaxDouble'
        }
      ]
    },
    {
      name: 'DECELERATIONROT',
      desc: `Defines the rotation deceleration of the robot. Together with DTRAN, defines the deceleration of a Cartesian motion. This value is used only in two motion commands: MOVES and CIRCLE. In joint interpolated movements (MOVE), this value is ignored. The group must be defined with a robot model (model !=1). The value cannot be greater than ACCLERATIONMAXROT. The system always takes the smaller of the two with a notification message sent to the user.`,
      type: 1,
      short: 'DRot',
      range: '0.1 - MaxDouble'
    },
    {
      name: 'DECELERATIONTRANS',
      desc: `Defines the translation deceleration of the robot. Together with DROT, defines the decleration of a Cartesian motion. This value is used only in two motion commands: MOVES and CIRCLE. In joint interpolated movements (MOVE), this value is ignored. The group must be defined with a robot model (model !=1). The value cannot be greater than DECLERATIONMAXTRANS. The system always takes the smaller of the two with a notification message sent to the user.`,
      type: 1,
      short: 'DTran',
      range: '0.1 - MaxDouble'
    },
    {
      name: 'ELBOWCMD',
      desc: `Defines the working (command) PUMA robot configuration. When the target position is given as location variable, it is Cartesian point. This flag determines which of the solutions will be taken for the joint coordinates of the target position.`,
      type: 0,
      short: 'ECmd',
      range: '0 - 2'
    },
    {
      name: 'ELBOWFBK',
      desc: `Returns the actual (current) robot configuration.`,
      type: 0,
      short: 'EFbk',
      range: '0 - 2',
      readOnly: true
    },
    {
      name: 'Here',
      desc: `Returns the actual robot Cartesian coordinates. This variable is computed each sampling period from the motor feedback position. It equals TOCART(PFB). It is a counterpart of SETPOINT.`,
      type: 4,
      readOnly: true
    },
    {
      name: 'JERKMAXROT',
      desc: `Defines the maximum rotation jerk of the robot. Used for limiting JROT. The value limits only the Cartesian motion interpolations (MOVES, CIRCLE). This parameter does not affect joint interpolated movements (MOVE).`,
      type: 1,
      short: 'JMRot',
      range: '0.1 - MaxDouble'
    },
    {
      name: 'JERKMAXTRANS',
      desc: `Defines the maximum translation jerk of the robot. Used for limiting JTRAN. The value limits only the Cartesina motion interpolations (MOVES, CIRCLE). This parameter does not affect joint interpolated movements (MOVE).`,
      type: 1,
      short: 'JMTran',
      range: '0.1 - MaxDouble'
    },
    {
      name: 'JERKROT',
      desc: `Defines the rotation jerk of the robot. Together with JTRAN defines the jerk value of a Cartesina motion. This value is used only in two motion commands: MOVES and CIRCLE. In joint interpolated movements (MOVE), this value is ignored. The group must be defined with a robot model (model !=1). The value cannot be greater than JERKMAXROT. The system always takes the smaller of the two with a notification message sent to the user.`,
      type: 1,
      short: 'JRot',
      range: '0.1 - MaxDouble'
    },
    {
      name: 'JERKTRANS',
      desc: `Defines the translation jerk of the robot. Together with JROT, defines the jerk value of a Cartesina motion. This value is used only in two motion commands: MOVES and CIRCLE. In joint interpolated movements (MOVE), this value is ignored. The group must be defined with a robot model (model !=1). The value cannot be greater than JERKMAXTRANS. The system always takes the smaller of the two with a notification message sent to the user.`,
      type: 1,
      short: 'JTran',
      range: '0.1 - MaxDouble'
    },
    {
      name: 'MachineTable',
      desc: `MachineTable  is a Robot property which informs the system to use the specified location as the machinetable  transformation. It defines the position and orientation machine working frame relative to the BASE reference.`,
      type: 5,
      children: [
        {
          name: 'XMAX',
          desc: `Define maximum value for MachineTable frame X coordinate.`,
          type: 1,
          range: '0 - MaxDouble'
        },
        {
          name: 'XMIN',
          desc: `Define minimum value for MachineTable frame X coordinate.`,
          type: 1,
          range: '0 - MaxDouble'
        },
        {
          name: 'YMAX',
          desc: `Define maximum value for MachineTable frame Y coordinate.`,
          type: 1,
          range: '0 - MaxDouble'
        },
        {
          name: 'YMIN',
          desc: `Define minimum value for MachineTable frame Y coordinate.`,
          type: 1,
          range: '0 - MaxDouble'
        },
        {
          name: 'ZMAX',
          desc: `Define maximum value for MachineTable frame Z coordinate.`,
          type: 1,
          range: '0 - MaxDouble'
        },
        {
          name: 'ZMIN',
          desc: `Define minimum value for MachineTable frame Z coordinate.`,
          type: 1,
          range: '0 - MaxDouble'
        }
      ]
    },
    {
      name: 'PayloadLx',
      desc: `Payload center of mass (C.M) distance of a robot in the tool's x direction.
              This value is considered during the computation of joint torques by the dynamic model.`,
      type: 1
    },
    {
      name: 'PayloadLy',
      desc: `Payload center of mass (C.M) distance of a robot in the tool's y direction.
              This value is considered during the computation of joint torques by the dynamic model.`,
      type: 1
    },
    {
      name: 'PayloadLz',
      desc: `Payload center of mass (C.M) distance of a robot in the tool's z direction.
              This value is considered during the computation of joint torques by the dynamic model.`,
      type: 1
    },
    {
      name: 'Persistent',
      desc: `<b>0</b> = allows handling members of the robot (axes) as an individual element
              <b>1</b>= axes can be manipulated only as part of the robot`,
      type: 0,
      range: '0 | 1'
    },
    {
      name: 'RMax',
      desc: `The maximal distance of the robot end-effector point from the robot base. This value is used to define a maximum radius which cannot be exceeded  by the robot path.`,
      type: 1,
      range: '0.1 - MaxDouble'
    },
    {
      name: 'RMin',
      desc: `The minimal distance of the robot end-effector point from the robot base. This value is used to define a minimum radius which cannot be exceeded  by the robot path.`,
      type: 1,
      range: '0.1 - MaxDouble'
    },
    {
      name: 'SetPoint',
      desc: `Returns the commanded robot Cartesian coordinates. This variable is computed each sampling period from the motor command position or according to the current interpolation type. Equals TOCART(PCMD). It is a counterpart of HERE.`,
      type: 4,
      readOnly: true
    },
    {
      name: 'SingularityMargin',
      desc: `Limits the cartesian-space interpolation near singular points. Setting this value will add a safety envelope around singularpoints to/from where robot can not be moved in Cartesina space. This means the motion commands MOVES & CIRCLE can not be executed from/to these points. However simple–joint interpolated motion(MOVE) from to these points is possible. Where these points are dependes on robot kinematics type.`,
      type: 1,
      range: '0 - MaxDouble'
    },
    {
      name: 'Start',
      desc: `Retrieves the current initial point of the movement in Cartesain coordinates. If the group finished its movement, it is equal to SETPOINT. If the group was stopped either by the STOP command or as a result of RESCUEMODE, the initial point of the stopped (canceled) movement is returned.`,
      type: 4,
      readOnly: true
    },
    {
      name: 'Start_Joint',
      desc: `Retrieves the current initial point of the movement in joint coordinates. If the group finished its movement, it is equal to PCMD. If the group was stopped either by the STOP command or as a result of RESCUEMODE, the initial point of the stopped (canceled) movement is returned.`,
      type: 4,
      readOnly: true
    },
    {
      name: 'Tool',
      desc: `Tool is a Robot property which informs the system to use the specified location as the tool transformation. It defines the position and orientation of the tool tip in relation to the center of the tool flange. The default tool transformation is the NULL transformation.`,
      type: 5,
      children: [
        {
          name: 'XMAX',
          desc: `Define maximum value for tool frame X coordinate.`,
          type: 1,
          range: '0 - MaxDouble'
        },
        {
          name: 'XMIN',
          desc: `Define minimum value for tool frame X coordinate.`,
          type: 1,
          range: '0 - MaxDouble'
        },
        {
          name: 'YMAX',
          desc: `Define maximum value for tool frame Y coordinate.`,
          type: 1,
          range: '0 - MaxDouble'
        },
        {
          name: 'YMIN',
          desc: `Define minimum value for tool frame Y coordinate.`,
          type: 1,
          range: '0 - MaxDouble'
        },
        {
          name: 'ZMAX',
          desc: `Define maximum value for tool frame Z coordinate.`,
          type: 1,
          range: '0 - MaxDouble'
        },
        {
          name: 'ZMIN',
          desc: `Define minimum value for tool frame Z coordinate.`,
          type: 1,
          range: '0 - MaxDouble'
        }
      ]
    },
    {
      name: 'typeOf',
      desc: `Returns the group model.`,
      type: 0,
      readOnly: true
    },
    {
      name: 'VELOCITYCOMMANDCARTESIAN',
      short: 'VCmdCart',
      desc: `Returns the carent cartesian command velocity.`,
      type: 4,
      readOnly: true
    },
    {
      name: 'VELOCITYFEEDBACKCARTESIAN',
      short: 'VFbCart',
      desc: `Returns the carent cartesian feedback velocity.`,
      type: 4,
      readOnly: true
    },
    {
      name: 'VELOCITYMAXROT',
      short: 'VMRot',
      desc: `Defines the maximum rotation velocity of the robot. Used for both VFROT and VROT. The value limits only the Cartesian motion interpolations (MOVES, CIRCLE). This parameter does not affect joint interpolated movements (MOVE).`,
      type: 1,
      range: '0.1 - MaxDouble'
    },
    {
      name: 'VELOCITYMAXTRANS',
      short: 'VMTran',
      desc: `Defines the maximum translation velocity of the robot. Used for both VFTRAN and VTRAN. The value limits the Cartesina motion interpolations only (MOVES, CIRCLE). This parameter does not affect joint interpolated movements (MOVE).`,
      type: 1,
      range: '0.1 - MaxDouble'
    },
    {
      name: 'VELOCITYROT',
      short: 'VRot',
      desc: `Defines the rotation (orientation) velocity of the robot. Together with VTRAN, defines to cruise velocity of a Cartesian motion. This value is used only in two motion commands: MOVES and CIRCLE. In joint interpolated movements (MOVE), this value is ignored. The group must be defined with a robot model (model !=1). The value cannot be greater than VELOCITYMAXROT. The system always takes a smaller of the two with a notification message sent to the user.`,
      type: 1,
      range: '0.1 - MaxDouble'
    },
    {
      name: 'VelocityRotValue',
      desc: `This query returns the rotational velocity value of the robot's tool tip, in degrees per second.`,
      type: 1,
      range: '0.1 - MaxDouble',
      readOnly: true
    },
    {
      name: 'VELOCITYTRANS',
      short: 'VTran',
      desc: `Defines the translation velocity of the robot. Together with VROT, defines the cruise velocity of a Cartesian motion.
              This value is used only in two motion commands: MOVES and CIRCLE. In joint interpolated movements (MOVE), this value is ignored. The group must be defined with a robot model (model !=1).
              The value cannot be greater than VELOCITYMAXTRANS. The system always takes the smaller of the two with a notification message sent to the user.`,
      type: 1,
      range: '0.1 - MaxDouble'
    },
    {
      name: 'VelocityTransValue',
      desc: `This query returns the translation velocity value of the robot's tool tip, in millimeters per second. This is a read-only value.`,
      type: 1,
      range: '0.1 - MaxDouble',
      readOnly: true
    },
    {
      name: 'WorkPiece',
      desc: `WorkPiece is a Robot property which informs the system to use the specified location as the workpiece  transformation. It defines the position and orientation of work-piece relative  to the MACHINE TABLE reference.`,
      type: 5,
      children: [
        {
          name: 'XMAX',
          desc: `Define maximum value for WorkPiece frame X coordinate.`,
          type: 1,
          range: '0 - MaxDouble'
        },
        {
          name: 'XMIN',
          desc: `Define minimum value for WorkPiece frame X coordinate.`,
          type: 1,
          range: '0 - MaxDouble'
        },
        {
          name: 'YMAX',
          desc: `Define maximum value for WorkPiece frame Y coordinate.`,
          type: 1,
          range: '0 - MaxDouble'
        },
        {
          name: 'YMIN',
          desc: `Define minimum value for WorkPiece frame Y coordinate.`,
          type: 1,
          range: '0 - MaxDouble'
        },
        {
          name: 'ZMAX',
          desc: `Define maximum value for WorkPiece frame Z coordinate.`,
          type: 1,
          range: '0 - MaxDouble'
        },
        {
          name: 'ZMIN',
          desc: `Define minimum value for WorkPiece frame Z coordinate.`,
          type: 1,
          range: '0 - MaxDouble'
        }
      ]
    },
    {
      name: 'WRISTCMD',
      short: 'WCmd',
      desc: `Defines the working (command) PUMA robot configuration. When the target position is given as location variable, it is Cartesian point. This flag determines which of the solutions will be taken for the joint coordinates of the target position.
              The wrist flag defines FLIP or NOFLIP configuration according:<ul>
              <li><b>FLIP</b> –  value of joint 5 is negative</li>
              <li><b>NOFLIP</b> – value of joint 5 is positive</li>
              <li><b>0</b> - Keep the current configuration or choose the closest joint-target.</li>
              <li><b>1</b> - Joint-target is NOFLIP</li>
              <li><b>2</b> - Joint-target is FLIP</li></ul>`,
      type: 0,
      range: '0 - 2'
    },
    {
      name: 'WRISTFBK',
      short: 'WFbk',
      desc: `Returns the actual (current) robot configuration.
              These two solutions represent tow solution of the robots inverse kinematics equations, or in other words the robot configurations. Usually they are called “FLIP” and “NOFLIP” robot configurations.  This flag indicates which of them is taken. Also, when this flag is different from the commanded one (wristcmd) no straight line motion can be made.
              For example in PUMA robot kinematic model this flag is computed according to the sing of position of the second joint.<ul>
              <li><b>0</b> - Keep the current configuration or choose the closest joint-target.</li>
              <li><b>1</b> - Joint-target is NOFLIP</li>
              <li><b>2</b> - Joint-target is FLIP</li></ul>`,
      type: 0,
      range: '0 - 2',
      readOnly: true
    },
    {
      name: 'XMax',
      desc: `This value is used in the pre-computation phase of the robot Cartesian movements (MOVES, CIRCLE).  Vlaues of Xmin, Xmax,Ymin,Ymax,Zmin,Zmax allow definition of save workspace area in cartesian coordinates. These limits will be chakces in addition to other robot space limitations as joint pmin & pmax values ad workspace radius limits (rmin & rmax).`,
      type: 1,
      range: '0.1 - MaxDouble'
    },
    {
      name: 'XMin',
      desc: `This value is used in the pre-computation phase of the robot Cartesian movements (MOVES, CIRCLE).  Vlaues of Xmin, Xmax,Ymin,Ymax,Zmin,Zmax allow definition of save workspace area in cartesian coordinates. These limits will be chakces in addition to other robot space limitations as joint pmin & pmax values ad workspace radius limits (rmin & rmax).`,
      type: 1,
      range: '0.1 - MaxDouble'
    },
    {
      name: 'YMax',
      desc: `This value is used in the pre-computation phase of the robot Cartesian movements (MOVES, CIRCLE).  Vlaues of Xmin, Xmax,Ymin,Ymax,Zmin,Zmax allow definition of save workspace area in cartesian coordinates. These limits will be chakces in addition to other robot space limitations as joint pmin & pmax values ad workspace radius limits (rmin & rmax).`,
      type: 1,
      range: '0.1 - MaxDouble'
    },
    {
      name: 'YMin',
      desc: `This value is used in the pre-computation phase of the robot Cartesian movements (MOVES, CIRCLE).  Vlaues of Xmin, Xmax,Ymin,Ymax,Zmin,Zmax allow definition of save workspace area in cartesian coordinates. These limits will be chakces in addition to other robot space limitations as joint pmin & pmax values ad workspace radius limits (rmin & rmax).`,
      type: 1,
      range: '0.1 - MaxDouble'
    },
    {
      name: 'ZMax',
      desc: `This value is used in the pre-computation phase of the robot Cartesian movements (MOVES, CIRCLE).  Vlaues of Xmin, Xmax,Ymin,Ymax,Zmin,Zmax allow definition of save workspace area in cartesian coordinates. These limits will be chakces in addition to other robot space limitations as joint pmin & pmax values ad workspace radius limits (rmin & rmax).`,
      type: 1,
      range: '0.1 - MaxDouble'
    },
    {
      name: 'ZMin',
      desc: `This value is used in the pre-computation phase of the robot Cartesian movements (MOVES, CIRCLE).  Vlaues of Xmin, Xmax,Ymin,Ymax,Zmin,Zmax allow definition of save workspace area in cartesian coordinates. These limits will be chakces in addition to other robot space limitations as joint pmin & pmax values ad workspace radius limits (rmin & rmax).`,
      type: 1,
      range: '0.1 - MaxDouble'
    }
  ],
  axis: [
    {
      name: 'ACCELERATIONCOMMAND',
      short: 'AccelCmd',
      desc: `This property returns the acceleration command generated by the motion profiler.`,
      type: 1,
      range: '+- MaxDouble',
      readOnly: true
    },
    {
      name: 'CoulombFriction',
      desc: `Coulomb (constant) friction parameter of an axis.`,
      type: 1
    },
    {
      name: 'DECELERATIONSTOP',
      short: 'DecStop',
      desc: `DecStop present the stopping deceleration in case of stop command from type DecStopOnPath. An additional use is done in internal system stopping procedure as when kill-task is operated (and slave=0 is given when conveyer tracking is on). This value is used when stop interrupts the next cases? -single axis movement,? or group movement from type Move or Circle.`,
      type: 1,
      range: '0.01 - MaxDouble'
    },
    {
      name: 'DISABLETIMEOUT',
      short: 'DTimeout',
      desc: `Maximum time the softMC waits from disabling the drive until the drive becomes disabled. If the drive fails to disable after this time, the softMC returns error 12008 “Axis cannot be disabled.” and the SERCOS phase is set to 0.`,
      type: 0,
      range: '0 - MaxLong'
    },
    {
      name: 'DISPLACEMENT',
      short: 'Disp',
      desc: `This property stores an offset to the actual axis position. It is used to change the way the values of POSITIONCOMMAND and POSITIONFEEDBACK appear.`,
      type: 1,
      range: '+- MaxDouble'
    },
    {
      name: 'Feedback',
      desc: `This property sets the source of the position feedback for the motion. The position feedback comes from either the motor (usually), or the load. The load feedback is commonly used when working in the dual loop mode. Dual loop is set during the SERCOS phase run-up.
              When the feedback is set to external, the POSITIONFEEDBACK property is used to get feedback and calculate position following error. The POSITIONFEEDBACK units are defined by POSITIONFACTOR and not by POSITIONEXTERNALFACTOR.`,
      type: 0,
      range: '0 | 1'
    },
    {
      name: 'POSITIONEXTERNAL',
      short: 'PExt',
      desc: `This read-only property returns the position of a device connected to the external feedback connector on the drive. This is available only when using telegram type 7 PEXT is added to the PDO list,means, with the external feedback being returned in the cyclic data stream.
              The position of the motor is read using the POSITIONFEEDBACK axis property.`,
      type: 1,
      range: '> 0',
      readOnly: true
    },
    {
      name: 'POSITIONMAX',
      short: 'PMax',
      desc: `This property is a software limit defining the upper limit of the axis. Motion commands with target positions above this limit are not be allowed. If an axis has passed the limit, motion commands to move it away from the limit are allowed. The upper position limit is enabled or disabled using the POSITIONMAXENABLE property.`,
      type: 1,
      range: '+- MaxDouble'
    },
    {
      name: 'POSITIONMAXENABLE',
      short: 'PMaxEn',
      desc: `This property is used to enable or disable the upper position limit.`,
      type: 0,
      range: '0 | 1'
    },
    {
      name: 'POSITIONMIN',
      short: 'PMin',
      desc: `This property is a software limit defining the lower limit of the axis. Motion commands with target positions below this limit are not allowed. If an axis has passed the limit, motion commands to move it away from the limit are allowed. The lower position limit is enabled or disabled using the POSITIONMINENABLE property.`,
      type: 1,
      range: '+- MaxDouble'
    },
    {
      name: 'POSITIONMINENABLE',
      short: 'PMinEn',
      desc: `This property is used to enable or disable the lower position limit.`,
      type: 0,
      range: '0 | 1'
    },
    {
      name: 'Simulated',
      desc: `This property is used to define the axis mode of operation as simulated or real. In simulated mode, motion commands are not sent to the drives as the axis is not associated with a physical drive. Simulated axes need to be enabled (using <axis>.ENABLE=ON) before a motion command is applied.`,
      type: 0,
      range: '0 | 1'
    },
    {
      name: 'TORQUEADDCOMMAND',
      short: 'TAddCmd',
      desc: `Axis additive torque command value.`,
      type: 1,
      readOnly: true
    },
    {
      name: 'TORQUEERROR',
      short: 'TE',
      desc: `Axis torque error value. The real-time (on-line) difference between TorqueAddCommand and TorqueFeedback.
              If this value exceeds the TorqueErrorMax, the torque-error collision procedures (Stop and Disable) are activated according the user-defined setup in TorqueErrorStopType and TorqueErrorDisableType. A motion error is issued.`,
      type: 1,
      range: '+- MaxDouble',
      readOnly: true
    },
    {
      name: 'TORQUEERRORMAX',
      short: 'TEMax',
      desc: `Axis torque error threshold value. If the TorqueError value exceeds the TorqueErrorMax, the torque-error collision procedures (Stop and Disable) are activated according the user-defined setup in TorqueErrorStopType and TorqueErrorDisableType. A motion error is issued.`,
      type: 1,
      range: '0 - MaxDouble'
    },
    {
      name: 'TorqueLimit',
      desc: `Queries the (highest) torque, which can be applied to the motor at current velocity (Vcmd) according to the motor torque characteristics.`,
      type: 1,
      readOnly: true
    },
    {
      name: 'TorqueLimitVelocityMax',
      short: 'TlimVmax',
      desc: `Sets the motor torque characteristics. The highest torque that can be applied to the motor at Vmax.`,
      type: 1
    },
    {
      name: 'TorqueMax',
      short: 'TMax',
      desc: `Maximum allowed torque / force of an axis.`,
      type: 1,
      range: '0 - MaxDouble',
    },
    {
      name: 'TorqueThreshold',
      desc: `The axis torque threshold value used to check the limits of the TADDCOMMAND value.`,
      type: 1,
      range: '+- MaxDouble',
      readOnly: true
    },
    {
      name: 'VELOCITYADDITIVECOMMAND',
      short: 'VaddCmd',
      desc: `Axis additive velocity command value.`,
      type: 1,
      range: '+- MaxDouble',
      readOnly: true
    },
    {
      name: 'VELOCITYEXTERNAL',
      short: 'VExt',
      desc: `This property returns the velocity of the device connected to the external position feedback connector of the drive. This property is available only when using telegram type 7, with the external feedback being returned in the cyclic data stream.`,
      type: 1,
      range: '+- MaxDouble',
      readOnly: true
    },
    {
      name: 'ViscousFriction',
      desc: `Viscous (velocity dependent) friction parameter of an axis.`,
      type: 1,
      range: '+- MaxDouble'
    },

  ],
  element: [
    {
      name: 'ABSOLUTE',
      desc: `Defines whether the commands to the element are absolute or incremental. In absolute mode, the position commands to the element are the required absolute position. In incremental mode, the position commands are the required change in position. This property can be used inside a motion command to override the permanent value.`,
      type: 0,
      short: 'Abs',
      range: '0 - Incremental | 1 - Absolute'
    },
    {
      name: 'ACCELERATION',
      type: 1,
      desc: `This property sets the acceleration rate of the motion profile. When executing a motion command, ACCELERATION should be less than or equal to ACCELERATIONMAX. If it is greater, the motion is executed using the ACCELERATIONMAX value. This property can be used inside a motion command to override the permanent value.`,
      short: 'Acc',
      range: '> 0'
    },
    {
      name: 'ACCELERATIONMAX',
      desc: `Defines the maximum allowed element acceleration. If you specify an acceleration higher than ACCELERATIONMAX, the system sets the value to ACCELERATIONMAX and notifies you.`,
      short: 'AMax',
      type: 1,
      range: '> 0'
    },
    {
      name: 'ACCELERATIONRATE',
      desc: `This property defines the element acceleration maximum scaling factor. Maximum values of acceleration can be scaled independently of velocity, deceleration or jerk.`,
      short: 'ARate',
      type: 1,
      range: '0.1 - 100'
    },
    {
      name: 'AScale',
      desc: `This property specifies percentage of desired acceleration and deceleration compared to maximal possible velocity for this type of movement. The motion generator attempts to reach this velocity during motion commands. The ability of the motion generator to reach this value is constrained by the value of ACCELERATION, DECELERATION, SMOOTHFACTOR and the final position. This properties used inside a motion command to override the permanent value.
            Active only when VelocitySettings is set to 1.`,
      type: 1,
      range: '0.1 - 100'
    },
    {
      name: 'ArchNo',
      desc: 'ArchNo.',
      type: 9,
      range: '[1,7]'
    },
    {
      name: 'AttachedTo',
      desc: `Returns name of an attached task to the given element.\n\n<b>Note</b> - If a group is not attached but the axes belonging to it are, the list of active axes and their tasks is returned. If the element is not attached to any program, an empty string is returned.`,
      type: 2,
      readOnly: true
    },
    {
      name: 'BlendingFactor',
      desc: `Percentage of the movement’s length that will be not blended with the next movement. Works with BLENDINGMETHOD = 2 only (SP Blending)!\n\n<b>0%</b> – blending of second movement started from the beginning of the first one.\n<b>100%</b> – blending of second movement started from the end of the first one (NO BLENDING).`,
      type: 1,
      range: '0 - 100'
    },
    {
      name: 'BlendingFactorPrevious',
      desc: `The BF of the previous motion meant to be applied between the previous motion and the current one. If no such overwriting is desired BFPrev must be set to -1.\n\nPercentage of the movement length that will be not blended with the next movement.\n\n<b>0%</b> – blending of second movement started from the beginning of the first one.\n<b>100%</b> – blending of second movement started from the end of the first one (no blending).`,
      short: 'BFPrev',
      type: 1,
      range: '-1 - 100'
    },
    {
      name: 'BlendingMethod',
      desc: `Selects which blending method (algorithm) which is to be used:<ul>
      <li>0 – no blending</li>
      <li>1 – CP (continuous path, defined by CP value)</li>
      <li>2 – SP (superposition, defined by BLENDINGFACTOR value)</li>
      <li>3 – AI (advance interpolation)</li>
      <li>4 - CP (same as 1, just instead of distance CP blending is defined by percentage with BlendingFactor )</li>
      </ul>`,
      type: 0,
      range: '0 - 4'
    },
    {
      name: 'BlendingStartCondition',
      desc: `Defines if the third motion in a blending sequence is blended with the first motion in the case that the second motion is finished before the first one.
              <b>0</b> – do not blend third motion with the first
              <b>1</b> – blend the third motion with the first if the second is finished before the first.`,
      type: 0,
      range: '0 | 1'
    },
    {
      name: 'BlendProtected',
      desc: `Sets the protected part of the move that is guaranteed not going to be blended.
              Percentage of the current motion path (measured from the end) that is going to be executed completely separated from the previous or next motions.
              Defines the smallest amount at the motion end that is not blended, which means that according to the blending conditions the un-blended part of the move can be longer but not shorter then the given percentage given in BlendProtected.`,
      type: 1,
      range: '0 - 100'
    },
    {
      name: 'CP',
      desc: `Activates the continuous path mode (for blending) and sets the blend radius value.`,
      type: 1,
      range: '0 - MaxDouble'
    },
    {
      name: 'CPPrev',
      desc: `The CP of the previous motion meant to be applied between the previous motion and the current one. The meaning of the range is the same as with CP If no such overwriting is desired CPPrev must be set to -1.`,
      type: 1,
      range: '0 - MaxDouble'
    },
    {
      name: 'DECELERATION',
      desc: `This property sets the deceleration rate of the motion profile. When executing a motion command, deceleration should be less than or equal to DECELERATIONMAX. If it is greater, the motion is executed at the DECELERATIONMAX value.
              This property can be used inside a motion command to override the permanent value.`,
      short: 'Dec',
      type: 1,
      range: ' > 0'
    },
    {
      name: 'DECELERATIONMAX',
      desc: `Defines the maximum allowed element deceleration. If you specify a deceleration rate greater than DECELERATIONMAX, the system sets the value to DECELERATIONMAX and notifies you.`,
      short: 'DMax',
      type: 1,
      range: ' > 0'
    },
    {
      name: 'DECELERATIONRATE',
      desc: `This property defines the element Deceleration maximum scaling factor. Maximum values of Deceleration can be scaled independently of velocity, acceleration or jerk.`,
      short: 'DRate',
      type: 1,
      range: '0.1 - 100'
    },
    {
      name: 'Dest',
      desc: `Retrieves the current destination point of the movement in user units. If the element finished its movement, it is equal to PCMD. If the element was stopped either by the STOP command or as a result of RESCUEMODE, the destination of the stopped (canceled) movement is returned.`,
      type: 1,
      readOnly: true
    },
    {
      name: 'DOUBLEMODE',
      desc: `Queries the DOUBLEMODE interpolation status during blending of two movements.
      Possible values are:
      <b>0</b> – blending has not yet started
      <b>1</b> – blending is in progress`,
      short: 'DMode',
      type: 0,
      range: '0 | 1',
      readOnly: true
    },
    {
      name: 'DynamicModel',
      desc: `The dynamic model calculates needed torques/forces during a commanded motion. The torques are then sent to the drives as "additional torque command" (torque feed forward), which helps to improve the motion performance.`,
      type: 0,
      range: '-1 - 15',
      readOnly: false
    },
    {
      name: 'DynamicParameter[1]',
      desc: `Parameters for the dynamic model of a element.`,
      type: 1,
      readOnly: false
    },
    {
      name: 'ElementID',
      desc: `For axis - Returns unique ID of the axis.
              For group - Returns the group that include generic group ID`,
      type: 0,
      range: `Axis: 1-64 | Group: 65-96`,
      readOnly: true
    },
    {
      name: 'ElementName',
      desc: `Returns the element name in a string.`,
      type: 2,
      readOnly: true
    },
    {
      name: 'ElementSize',
      desc: `Returns how many axes are belonging to this element.`,
      type: 0,
      readOnly: true,
      range: `For axis: always 0 | For groups: 1-64`
    },
    {
      name: 'ElementStatus',
      desc: `Returns the line number of the program from where the currently executing motion was invoked. Due to the buffering mechanism of motion commands, program execution can continue far from the line where motion was given. Therefore when querying the task status, the line number returned has no relation to the line number from where the currently executing motion was issued. In order to get the line number from where the currently executing motion was commanded this command should be used.`,
      type: 2,
      readOnly: true
    },
    {
      name: 'Enable',
      short: 'En',
      desc: `This property enables or disables the drive. The property encapsulates operation of drive status bit 15, and causes an active disable of the drive when set to 0. The softMC interpreter is held until the requested state is actually achieved on the drive.
            <b>0 (OFF)</b> - Drive disable
            <b>1 (ON)</b> - Drive enable

            <b>For axis</b> - When the drive is disabled, the motion controller of that axis is in a following mode, so the command follows the feedback. A message is generated by the softMC that the axis is now in following mode. Motion commands are not allowed when the drive is disabled.`,
      type: 0,
      range: `0 | 1`
    },
    {
      name: 'InterpolationType',
      short: 'IType',
      desc: `Returns the interpolation type of the current or interrupted movements:<ul>
            <li>0 or 1 = MOVE joint-interpolation</li>
            <li>2 = CIRCLE circular-interpolation</li>
            <li>3 = JOG movement</li>
            <li>6 = MOVES straight-line movement</li>
            <li>7 = DELAY</li>
            <li>8 = Advanced interpolation</li>
            <li>14 = Torque interpolation</li>
            <li>15 = DOPASS</li>
            <li>16 = Kino-Dynamic interpolation</li>
            <li>17 = Sine Wave interpolation</li></ul>

            <b>For axis only</b> - Returns the type of interpolation of the current or interrupted movements:<ul>
            <li>1 = MOVE interpolation
            <li>3 = JOG movement</li></ul>`,
      type: 0,
      range: `<b>Group:</b> 0-3 | 6-8 | 14-17 | <b>Axis:</b> 1-3`,
      readOnly: true
    },
    {
      name: 'IsMoving',
      desc: `This property indicates whether the motion profiler is active. This flag indicates the motion profiler phase.
            <ul>
            <li>0 – element is not moving</li>
            <li>1 – element is at the first motion phase (reaching cruise velocity ). If cruise velocity is greater than initial velocity, it indicates that the axes are accelerating.</li>
            <li>2 – element is at constant velocity phase (cruise)</li>
            <li>3 – element is at the third motion phase (reaching final velocity ). If final velocity is less than cruise velocity, it indicates that the axes are decelerating.</li></ul>

            Special modes:<ul>
            <li>-1 – When element is a slave (gear or cam) relevant for axis only.</li>
            <li>-2 – In drive procedure command (homing, tuning ,...)</li>
            <li>-4 – Moving Frame tracking mode (the value is returned unless an incremental move is issued).</li></ul>`,
      type: 0,
      range: `-4 | -2 - 3`,
      readOnly: true
    },
    {
      name: 'IsSettled',
      desc: `This flag indicates whether the actual element position is within the specified settling range. The settling range is defined by the PESETTLE property and is further qualified by the TIMESETTLE property.
            When the motion profiler has completed, the absolute value of the position error (Target Position - Actual Position) is compared to the PESETTLE property. When the result is less than or equal to this property for the time given by TIMESETTLE, the ISSETTLED flag is set. The TIMESETTLEMAX property sets a limit on the time to settle from the time the profiler has completed.
             <b>0</b> – Not in position
             <b>1</b> – In position`,
      type: 0,
      range: `0 | 1`,
      readOnly: true
    },
    {
      name: 'Jerk',
      desc: `This property is used to set the jerk (rate of change of acceleration) on the element. It is manifested in the amount of smoothing applied to the motion profile. It is frequently more convenient to use SMOOTHFACTOR to set the smoothing being applied to the profile. This property can be used inside a motion command to override the permanent value.`,
      type: 1,
      range: `> 0`
    },
    {
      name: 'JerkMax',
      short: 'JMax',
      desc: `Defines the maximum allowed jerk. If the trajectory generator issues a JERK command higher than JERKMAX, the system sets the value to JERKMAX and notifies you.`,
      type: 1,
      range: `> 0`
    },
    {
      name: 'JerkRate',
      short: 'JRate',
      desc: `This property defines the element Jerk maximum scaling factor. Maximum values of Jerk can be scaled independently of velocity, acceleration or deceleration.
              Changing JerkRate factors of a group automatically changes the relevant factor of each axis to the new value.`,
      type: 1,
      range: `0.1 - 100`
    },
    {
        name: 'Limz',
        desc: 'Limz.',
        type: 8,
        range: '[-300,10]'
      },
    {
      name: 'Motion',
      desc: `The MOTION value must be 1 (ON) for any motion command to be executed successfully. In addition, the status of MOTION is terminated by the servo interrupt. If MOTION switches to 0 (OFF), any motion currently in progress is aborted and any motion in the motion buffers is flushed. The drive can be enabled if MOTION is off.

            <b>Notice:</b> In addition to the <element>.MOTION flag, the SYSTEM.MOTION flag must also be ON in order for motion to be commanded.`,
      type: 0,
      range: `0 | 1`
    },
    {
      name: 'MotionOverlap',
      desc: `The MOTIONOVERLAP property defines a condition whether the interpreter will execute the next motion command.
              It means that when the property is set to 0 (Off), the next motion command will be executed only if the previous motion command has completed.
              If set to 1 (ON), the interpreter will execute the next motion command as usual.
              <b>1</b> = ON
              <b>0</b> = OFF`,
      type: 0,
      range: `0 | 1`
    },
    {
      name: 'PayloadInertia',
      desc: `Payload inertia of mass around the axis of the last joint.
              This value is considered during the computation of joint torques by the dynamic model.`,
      type: 1
    },
    {
      name: 'PayloadMass',
      desc: `Payload mass of an element.
              This value is considered during the computation of joint torques by the dynamic model.`,
      type: 1
    },
    {
      name: 'PayloadMassRMass',
      desc: `Payload mass times the distance to the center of mass (C.M) distance in the tool's z direction - M*Lz.
              This value is considered during the computation of joint torques by the dynamic model.`,
      type: 1
    },
    {
      name: 'PayloadMassRMassG',
      desc: `Payload mass times the distance to the center of mass (C.M) distance in the tool's z direction times gravity - M*Lz*G.
              This value is considered during the computation of joint torques by the dynamic model.`,
      type: 1
    },
    {
      name: 'PayloadMassRMassSqIxx',
      desc: `Payload mass times the distance to the center of mass (C.M) distance in the tool's z direction squared plus the Inertia of the payload in the tool's x direction - M*Lz^2 + Ixx.
              This value is considered during the computation of joint torques by the dynamic model.`,
      type: 1
    },
    {
      name: 'PayloadMax',
      desc: `The maximum allowed mass for the payload of the element.
              If paylodMass property is set to a larger value, an error is thrown.`,
      type: 1
    },
    {
      name: 'PLSSource',
      desc: `Defines the type of position that toggles the PLS output.
              PLSSource can be based either on an absolute position (either XYZ or axis), or on a position relative to the current movement.`,
      type: 6
    },
    {
      name: 'POSITIONCOMMAND',
      short: 'PCmd',
      desc: `This property returns the position command generated by the motion profiler. When an axis in the group is in following mode, the position command is set to the value of the position feedback. An axis is in following mode when the drive is disabled or when you explicitly put the axis in following mode using the <axis>.FOLLOWINGMODE property.`,
      type: 1,
      range: `+- MaxDouble`,
      readOnly: true
    },
    {
      name: 'PositionError',
      short: 'PE',
      desc: `This property returns the position following error, which is the difference between position command and the position feedback. The calculation takes the SERCOS delay into account, such that the position feedback is subtracted from the command issued two cycles previously. It is calculated every sample time and compared to maximum position error (PEMAX). If it exceeds the value of PEMAX, the element is brought to an immediate stop. If the element is at rest when the error is detected, the drive is disabled.
              The following error is at a minimum when the drive is properly tuned. An additional servo delay is added when microinterpolation is enabled on the CDHD drive. In this case, the position error calculated by the softMC is slightly larger, but the motion is smoother.
              The calculation takes into account the position error delay, such that the position feedback is subtracted from the command issued a number of cycles previously, as defined in the POSITIONERRORDELAY property.`,
      type: 1,
      range: `0 - MaxDouble`,
      readOnly: true
    },
    {
      name: 'PositionErrorMax',
      short: 'PEMax',
      desc: `Defines the maximum allowed error between position command and the position feedback. the position following error (PE) is calculated every sample time and compared to maximum position error PEMAX. If it exceeds the value of PEMAX, the element is brought to an immediate stop. If the element is at rest when the error is detected, the drives in the element are disabled. For a group, the position following error is calculated as the square root of the sum of the squares of each axis’ position error. The position following error on a group is Terminaled only when the group is in motion, or as long as it is attached by a task.`,
      type: 1,
      range: `0 - MaxDouble`
    },
    {
      name: 'PositionErrorSettle',
      short: 'PESettle',
      desc: `This property defines the range in which the element is defined as settled. When the motion profiler is complete, the absolute value of the position error (Target Position - Actual Position) is compared to the PESETTLE value. When the the result is less than or equal to this value, for the time given by TIMESETTLE, the ISSETTLED flag is set.`,
      type: 1,
      range: `0 - MaxDouble`
    },
    {
      name: 'PositionFeedback',
      short: 'PFb',
      desc: `This property returns the actual position of the element. The value is returned as a vector of the respective axis positions.`,
      type: 1,
      range: `+- MaxDouble`,
      readOnly: true
    },
    {
      name: 'ProceedType',
      desc: `This property defines the action to be taken by the PROCEED command. It can be set as a permanent value (modal), or it can be used within (nodal) a PROCEED command to temporarily override the permanent value.<ul>
              <li>1 (CONTINUE) – Continue with stopped motion. In case there are two motions in the buffer it executes both (one that was executed and one that was pending while the STOP command was issued).</li>
              <li>2 (NEXTMOTION) – Abort current motion and execute the next motion command in the motion buffer. One that was executing during STOP is forgotten and the one that was pending is executed).</li>
              <li>3 (CLEARMOTION) – Abort all motion commands in the motion buffer. Actually clears the motion buffers from complete history</li>
              <li>4 (INTERRUPTED) - Execute only the interrupted motion but not the pending one (Note: program will not continue, in order to release the waiting program you need to issue PENDING option)</li>
              <li>5 (PENDING) - Execute the pending motion and release the waiting task. (Note: can be issue only after INTERRUPTED option has been executed.)</li></ul>`,
      type: 0,
      range: `1 - 5`
    },
    {
      name: 'StartType',
      desc: `This property determines the point in time at which the next motion command begins. It is relevant when a motion command is issued while a previous motion command is still being executed. The INPOSITION option is the most stringent condition for motion completion.
              This property is used inside a motion command to override the permanent value.<ul>
              <li>1 - IMMEDIATE:  The motion command is executed immediately from the system current position does not wait for the current motion command to complete. The current move is cancelled and any buffered move is delayed until the IMMEDIATE command is executed.</li>
              <li>2 - INPOSITION:  The motion command is executed when the ISSETTLED flag is set. This means the system accomplished its previous motion and reached the required position.</li>
              <li>3 - GENERATORCOMPLETED:  The motion command executes when the profiler has completed the generation of the last motion command reference.</li>
              <li>4 - SYNC: The start of the motion is synchronized by the SYNCSTART command.</li>
              <li>5 - SUPERIMMEDIATE: Similar to IMMEDIATE, but the computation of the command is done in realtime rather than in the background.</li></ul>`,
      type: 0,
      range: `1 - 5`
    },
    {
      name: 'StopType',
      desc: `This property defines how the motion is stopped in response to the STOP command. The property is used within a STOP command to override the permanent value for that STOP command.<ul>
      <li>1 - IMMEDIATE: Immediate stop using maximum deceleration.</li>
      <li>2 - ONPATH: Immediate stop on the path of the motion. This is useful for stopping group motion so all axes remain on the original path of travel during the stop. For a single axis, IMMEDIATE and ONPATH are the same.</li>
      <li>3 - ENDMOTION: Stop at the end of the current motion command.</li>
      <li>4 - ABORT: Stop the current motion immediate but do not wait for proceed to start next motion. Only the accepted motion commands are stopped, the commands coming after this stoptype will be executed regularly</li>
      <li>5 - DecStopOnPath: the stopping procedure is started immediately according to DecStop value or DecStopTran and DecStopRot values (for ROBOT ). As those parameters are modal so their values must be updated before executing the motion command.  Contrary to stop immediate in this case the Robot is stopped as a whole group on the movement path.</li></ul>`,
      type: 0,
      range: `1 - 5`
    },
    {
      name: 'TORQUEFEEDBACK',
      short: 'TFb',
      desc: `Element torque feedback value`,
      type: 1,
      readOnly: true
    },
    {
      name: 'VELOCITYCOMMAND',
      short: 'VCmd',
      desc: `This property returns the velocity command. This value is generated by the motion profiler.`,
      type: 1,
      range: `+- MaxDouble`,
      readOnly: true
    },
    {
      name: 'VELOCITYFEEDBACK',
      short: 'VFb',
      desc: `This property returns the actual spatial velocity of the element.`,
      type: 1,
      range: `+- MaxDouble`,
      readOnly: true
    },
    {
      name: 'VELOCITYMAX',
      short: 'VMax',
      desc: `Defines the maximum allowed velocity of the element. The system limits element velocity commands to this value. In practice, it is limited by physical parameters (especially maximum motor speed).`,
      type: 1,
      range: `>0`
    },
    {
      name: 'VELOCITYOVERRIDE',
      short: 'Vord',
      desc: `Modifies the actual element velocity by multiplying the velocity by the specified override value. Unlike other motion properties, it takes effect immediately. The actual velocity rate of change is limited by the axis deceleration value. the SYSTEM.VELOCITYOVERRIDE also affects the actual element velocity, and functions as an additional multiplier. Changing VELOCITYOVERRIDE takes 4 cycles (if the axis is moving), and delays the task execution by this amount of time. The axis velocity override has no effect when the axis is being moved as part of a group.`,
      type: 1,
      range: `0.1 - 100000`
    },
    {
      name: 'VELOCITYRATE',
      short: 'VRate',
      desc: `This property defines the element velocity maximum scaling factor. Maximum values of velocity can be scaled independently of acceleration, deceleration or jerk.
              Changing VelocityRate factors of a group automatically changes the relevant factor of each axis to the new value.`,
      type: 1,
      range: `0.1 - 100`
    },
    {
      name: 'VSCALE',
      desc: `VSCALE.`,
      type: 0,
      range: `1 - 100`
    },
  ],
	objects: {
		sys: [
      {
        name: 'ACCELERATIONRATE',
        type: 1,
        desc: `This property defines the all system acceleration maximum scaling factor. Maximum values of acceleration can be scaled independently of velocity, deceleration or jerk.
              System acceleration override multiplies corresponding group and axis AccelerationRate.`,
        short: 'ARate',
        range: '0.1 - 100'
      },
      {
        name: 'AVERAGELOAD',
        type: 0,
        desc: `This query returns the average realtime load on the CPU measured during a 0.5 second interval, expressed in percent.`,
        short: 'ALoad',
        range: '0 - 100'
      },
      {
        name: 'CLOCK',
        type: 0,
        desc: `Returns the number of system clock ticks. This is the clock run by the operating system. One clock tick corresponds to 1 millisecond.`,
        range: '0 - MaxLong'
      },
      {
        name: 'INFORMATION',
        type: 2,
        desc: `Returns information found during system power-up. Measures the average cycle time of the motion bus. The result is the average cycle time found in the test. The test duration is 500 ms.`,
      },
      {
        name: 'IPAddressMask',
        type: 2,
        desc: `Returns the IP of the softMC controller, as specified in FWCONFIG`,
      },
      {
        name: 'NAME',
        type: 2,
        desc: `This property sets the name of the controller. The query returns the name of the controller. If the no name was set (or an empty string), the reply is, "no name."`,
      },
    ],
	},
	commands: {
    attach: [
			{
				syntax: 'Attach',
				desc: 'Attaches a task to a motion element (group or axis). Attachment is necessary to perform certain operations (such as MOVE or JOG) on a motion element from within a task. The attachment prevents other tasks from accessing the element.'
			},
			{
				syntax: 'Attach [element]',
				desc: 'Attaches a task to a motion element (group or axis). Attachment is necessary to perform certain operations (such as MOVE or JOG) on a motion element from within a task. The attachment prevents other tasks from accessing the element.'
			},
    ],
    circle: [
			{
				syntax: 'Circle [element] Angle=[double] CircleCenter=[position]',
        optionalType: 1, // will use optionals[1]
				desc: 'Issues a circular (arc) path trajectory for the specified element, with the given angle and the circle center.'
      },
      {
				syntax: 'Circle Angle=[double] CircleCenter=[position]',
        optionalType: 1, // will use optionals[1]
				desc: 'Issues a circular (arc) path trajectory, with the given angle and the circle center.'
      },
      {
				syntax: 'Circle [element] CirclePoint=[position] TargetPoint=[position]',
        optionalType: 2, // will use optionals[2]
				desc: 'Issues a circular (arc) path trajectory for the specified element, with a circle point and the final point of the arc.'
      },
      {
				syntax: 'Circle CirclePoint=[position] TargetPoint=[position]',
        optionalType: 2, // will use optionals[2]
				desc: 'Issues a circular (arc) path trajectory, with a circle point and the final point of the arc.'
			}
    ],
    jump: [
        {
            syntax:	'Jump [element] [position]',
        optionalType: 8,
        desc: 'Jump to the target position with specified element'
        },
        {
            syntax:	'Jump [position]',
        optionalType: 8,
            desc: 'Jump to the target position'
        }
    ],

    jump3: [
        {
            syntax: 'Jump3 [element] AscendingPoint=[position] DescendingPoint=[position] TargetPoint=[position]',
            optionalType: 9,
            desc: 'Jump to the target position depends on Ascending Point and Descending Point with specified element'
        },
        {
            syntax: 'Jump3 AscendingPoint=[position] DescendingPoint=[position] TargetPoint=[position]',
            optionalType: 9,
            desc: 'Jump to the target position depends on Ascending Point and Descending Point'
        }
    ],

    jump3cp: [
        {
            syntax: 'Jump3cp [element] AscendingPoint=[position] DescendingPoint=[position] TargetPoint=[position]',
            optionalType: 10,
            desc: 'Jump to the target position depends on Ascending Point and Descending Point with specified element'
        },
        {
            syntax: 'Jump3cp AscendingPoint=[position] DescendingPoint=[position] TargetPoint=[position]',
            optionalType: 10,
            desc: 'Jump to the target position depends on Ascending Point and Descending Point'
        },
    ],
    detach: [
			{
				syntax: 'Detach',
				desc: 'This command is used to detach the calling task from a motion element, freeing it for use by another task. Motion element may be axis or group.'
			},
			{
				syntax: 'Detach [element]',
				desc: 'This command is used to detach the calling task from a motion element, freeing it for use by another task. Motion element may be axis or group.'
			},
    ],
    load: [
			{
				syntax: 'Load [filename]',
        desc: 'Attaches a task to a motion element (group or axis). Attachment is necessary to perform certain operations (such as MOVE or JOG) on a motion element from within a task. The attachment prevents other tasks from accessing the element.',
        optionalType: 4, // will use optionals[4]
			}
    ],
    load$: [
			{
				syntax: 'Load$ [filename]',
        desc: `@param [filename] is a <b>string</b> (i.e: "file1.upg")

              This command loads programs and libraries from the Flash Disk into RAM, from where it may be executed. In the process, the program or library is checked for syntax errors. Syntax errors are written to the TRN.ERR file, which may be retrieved to see which errors occurred. Only programs without syntax errors may be executed. Programs are executed using the STARTTASK command. The Priority sets the <priority level> at which the task is run within the system. The highest priority is 1, which causes the task to be run after all realtime tasks have run. The lowest priority is 16. Tasks with the same priority level run using a round-robin procedure, which gives equal time to each task. A low priority task cannot interrupt a high priority task.
              The StackSize optional parameter sets the size of local (Dim) variables’ stack. It’s value is a actually a floating point multiplier of an internal basic stack size.  This basic stack size is the lowest size allowed for local data stack (when size multiplier is 1), whereas the highest value depends on the amount of freememory available.
              The <task name> defines the new task name, what the loaded task gets. This option lets user load the same task several times with different names.`,
        optionalType: 5, // will use optionals[5]
			}
    ],
		move: [ // array of overloads
			{
				syntax: 'Move [element] [position]',
        optionalType: 0, // will use optionals[0]
				desc: 'Move the specified element to the target position.'
			},
			{
				syntax: 'Move [position]',
        optionalType: 0, // will use optionals[0]
				desc: 'Move to the target position.'
			},
    ],
    moves: [ // array of overloads
			{
				syntax: 'Moves [element] [position]',
				optionalType: 11, // will use optionals[11] 
				desc: 'Move the specified element along a straight line in world-space.'
			},
			{
				syntax: 'Moves [position]',
        optionalType: 11, // will use optionals[11]
				desc: 'Move along a straight line in world-space.'
			},
    ],
    moveskd: [ // array of overloads
			{
				syntax: 'MoveSKD [element] [position]',
        optionalType: 11, // will use optionals[0]
				desc: 'Kino-Dynamic Straight Line move command. Straight line moment that uses maximum available joint capabilities (VNAX,AMAX,JMAX).The path is a straight line from current position to the given target position.'
			},
			{
				syntax: 'MoveSKD [position]',
        optionalType: 11, // will use optionals[0]
				desc: 'Kino-Dynamic Straight Line move command. Straight line moment that uses maximum available joint capabilities (VNAX,AMAX,JMAX).The path is a straight line from current position to the given target position.'
			},
    ],
    "power_off()": [
      {
        syntax: 'power_off()',
        desc: 'Disables the robot'
      }
    ],
    "power_on()": [
      {
        syntax: 'power_on()',
        desc: 'Enables the robot'
      }
    ],
    printpoint: [
      {
        syntax: 'printPoint [location]',
        desc: 'PrintPoint prints only variables that were declared as a cartesian location.'
      }
    ],
    printpointusing: [
      {
        syntax: 'printPointUsing [string] ; [location]',
        desc: `Prints formatted numeric variables of type point, using the specified format string. The format string contains literal text to be printed, as well as characters for formatting numeric expressions. The following characters can be used formatting numeric expressions:<ul>
        <li><b>#</b>  - digital position</li>
        <li><b>.</b>  - decimal position</li>
        <li><b>+</b>  - prints the sign of the expression</li></ul>`,
        format: {
          1: '"#.###"'
        }
      }
    ],
    printu$: [
      {
        syntax: 'printU$ [string] , [string] ; [number]',
        desc: `Prints formatted numeric variables of type point, using the specified format string. The format string contains literal text to be printed, as well as characters for formatting numeric expressions. The following characters can be used formatting numeric expressions:<ul>
        <li><b>#</b>  - digital position</li>
        <li><b>.</b>  - decimal position</li>
        <li><b>+</b>  - prints the sign of the expression</li></ul>`,
        format: {
          1: '',
          3: '"Value is #.###"'
        }
      }
    ],
    proceed: [
			{
				syntax: 'Proceed',
        desc: 'This command is required to continue executing motion after that motion had been stopped by a STOP command from a different context. Thus PROCEED is not required when the STOP command appears in the same task as the move commands, but it is required when the STOP command is issued by a task other than the one moving the axis or group.',
        optionalType: 6,
			},
			{
				syntax: 'Proceed [element]',
        desc: 'This command is required to continue executing motion after that motion had been stopped by a STOP command from a different context. Thus PROCEED is not required when the STOP command appears in the same task as the move commands, but it is required when the STOP command is issued by a task other than the one moving the axis or group.',
        optionalType: 6,
			},
    ],
    sinewave: [
			{
				syntax: 'SineWave [double] SineWaveFreq=[double]',
        desc: 'Performs endless sine-wave motion on the given axis or group.',
        format: {
          1: '{0 , 0}',
          2: '{0.1 , 0.1}',
        }
			},
			{
				syntax: 'SineWave [element] [location]',
				desc: 'Performs endless sine-wave motion on the given axis or group.'
			},
    ],
    starttask: [
			{
				syntax: 'startTask [filename]',
        desc: 'Starts task execution from the beginning of the task. Priority sets the priority level for task execution. The highest priority is 1, which causes the task to run after all realtime tasks have run. The lowest priority is 16. Tasks with the same priority level run via a round-robin procedure, which gives equal time to each task. A low priority task cannot interrupt a high priority task. If a task is killed, it can be restarted with this command. A task can be started and specified to run for a number of execution loops, then stop.',
        optionalType: 7
			}
    ],
    starttask$: [
			{
				syntax: 'startTask$ [string]',
        desc: 'Starts task execution from the beginning of the task. Priority sets the priority level for task execution. The highest priority is 1, which causes the task to run after all realtime tasks have run. The lowest priority is 16. Tasks with the same priority level run via a round-robin procedure, which gives equal time to each task. A low priority task cannot interrupt a high priority task. If a task is killed, it can be restarted with this command. A task can be started and specified to run for a number of execution loops, then stop.',
        optionalType: 7,
        format: {
          1: '"MYTASK.PRG"'
        }
			}
    ],
    stop: [ // array of overloads
			{
				syntax: 'Stop [element]',
				optionalType: 3,
				desc: 'Move the specified element along a straight line in world-space.'
			},
			{
				syntax: 'Stop',
				optionalType: 3,
				desc: 'Move along a straight line in world-space.'
			},
    ],
    waitformotion: [ // array of overloads
			{
				syntax: 'waitForMotion [element]',
				desc: 'This command causes the program to wait until the currently executing motion is completed, only after that the next line will be executed.'
			},
			{
				syntax: 'waitForMotion',
				desc: 'This command causes the program to wait until the currently executing motion is completed, only after that the next line will be executed.'
			},
		]
  },
  snippets: {
    "abs": {
      syntax: 'ABS([number])',
      desc: `Returns the absolute value of the argument.`,
      availableMidSentence: true,
      meta: 'Function'
    },
    "accept": {
      syntax: 'Accept(#[listening_device_number](optional),#[accepting device number], [port])',
      desc: `Binds a TCP socket to specific port and accepts a connection. Listens to a TCP socket. The <port number> defines TCP port.`,
      availableMidSentence: true,
      meta: 'Function'
    },
    "acos": {
      syntax: 'acos([number])',
      desc: `Returns the inverse cosine of the expression in radians.`,
      availableMidSentence: true,
      meta: 'Function'
    },
    "arraysize": {
      syntax: 'ArraySize([array],[dimension])',
      desc: `Returns the size of an array’s dimension according to the dimension number (1 for the first dimension, 2 for the second dimension, etc...).
            Returns zero if the dimension number is larger than the number of dimensions defined for the array. Also returns zero if the dimension number is zero or negative.`,
      availableMidSentence: true,
      meta: 'Function'
    },
    "asc": {
      syntax: 'ASC([string])',
      desc: `Returns an ASCII character value from within an ASCII-8 string, and the Unicode value from within a UTF-8 string.`,
      availableMidSentence: true,
      meta: 'Function'
    },
    "asin": {
      syntax: 'ASIN([number])',
      desc: `Returns the inverse sine of the expression in radians.`,
      availableMidSentence: true,
      meta: 'Function'
    },
    "atan2": {
      syntax: 'ATAN2([y_value],[x_value])',
      desc: `ATAN2 is used when it is necessary to know both the absolute value of the angle and the quadrant. The first expression is the value on the y axis and the second is the value on the x axis. The result gives the real angle in the range ±π radians.`,
      availableMidSentence: true,
      meta: 'Function'
    },
    "atn": {
      syntax: 'ATN([number])',
      desc: `Returns the inverse tangent of the expression in radians. The expression is the ratio of the length on the y-axis to the length on the x-axis, and the result is in the range ±π/2 radians.`,
      availableMidSentence: true,
      meta: 'Function'
    },
    "attachto": {
      syntax: 'AttachTo [element](optional) File=[task]',
      desc: `Attach the given element to the given task. Same functionality as ATTACH but from external context.`,
      meta: 'MC-Basic'
    },
    "attachto$": {
      syntax: 'AttachTo$ [element](optional) File="[task]"',
      desc: `Attach the given element to the given task (STRING). Same functionality as ATTACH but from external context.`,
      meta: 'MC-Basic'
    },
    "bin$": {
      syntax: 'BIN$([number])',
      desc: `Returns the string representation of a number in a binary format.`,
      availableMidSentence: true,
      meta: 'Function'
    },
    "call": {
      syntax: "Call [subroutine name]",
      desc: `The CALL command transfers execution of the task to the subprogram being referenced. When the subprogram has completed, execution returns to the point in the task at which the subprogram was called.`,
      meta: 'MC-Basic'
    },
    "chr$": {
      syntax: 'CHR$([number])',
      desc: `Returns a one-character string corresponding to a given ASCII value.`,
      availableMidSentence: true,
      meta: 'Function'
    },
    "close": {
      syntax: "Close #[device_handle]",
      desc: `Ends I/O to a serial communication device.`,
      meta: 'MC-Basic'
    },
    "connect": {
      syntax: "Connect(#[device_number],[ip],[port],[timeout](optional) )",
      desc: `Requests a TCP connection from the remote host.`,
      meta: 'MC-Basic'
    },
    "cos": {
      syntax: 'COS([number])',
      desc: `Returns the cosine of the expression in radians.`,
      availableMidSentence: true,
      meta: 'Function'
    },
    "delay": {
      syntax: "Delay [element (optional)] [time in ms.]",
      desc: `This command causes the motion to be delayed on the specified axis, for the specified period of time given in milliseconds.`,
      meta: 'MC-Basic'
    },
    "delete": {
      syntax: "Delete [filename]",
      desc: `This command is used to delete a file from the Flash Disk.`,
      meta: 'MC-Basic'
    },
    "delete$": {
      syntax: 'Delete$ "[filename]"',
      desc: `Deletes a file from the Flash Disk.`,
      meta: 'MC-Basic'
    },
    "deletePLS": {
      syntax: "DeletePLS [pls_name]",
      desc: `Deletes a defined PLS and all actions associated with that PLS.`,
      meta: 'MC-Basic'
    },
    "detachFrom": {
      syntax: 'detachFrom [element](optional) File=[task]',
      desc: `Detach given element from the given task. Same functionality as DETACH but from external context.`,
      meta: 'MC-Basic'
    },
    "detachFrom$": {
      syntax: 'detachFrom$ [element](optional) File="[task]"',
      desc: `Detach given element from the given task. Same functionality as DETACH but from external context.`,
      meta: 'MC-Basic'
    },
    "dir": {
      syntax: 'dir [file](optional)',
      desc: `This command lists files that exist on the RAM disk and on the Flash disk. <file> may contain the * and ? wildcard characters to refine the list. The character * signifies any combination of letters, and the ? character signifies any letter. When invoked without a wildcard, all the files are listed.
            The RAM disk is for used to store internal files (to which you do not have access), and stores the record data files (*.rec). The Flash disk stores the user programs (*.prg) and CAM files (*.cam). The contents of the Flash disk are preserved at power off, but the contents of the RAM disk are lost.`,
      meta: 'MC-Basic',
      terminalOnly: true
    },
    "dir$": {
      syntax: 'dir$("[file]")',
      desc: `This command lists files that exist on the RAM disk and on the Flash disk. <file> may contain the * and ? wildcard characters to refine the list. The character * signifies any combination of letters, and the ? character signifies any letter. When invoked without a wildcard, all the files are listed.
            The RAM disk is for used to store internal files (to which you do not have access), and stores the record data files (*.rec). The Flash disk stores the user programs (*.prg) and CAM files (*.cam). The contents of the Flash disk are preserved at power off, but the contents of the RAM disk are lost.`,
      meta: 'MC-Basic'
    },
    "distl": {
      syntax: 'DISTL([loc1],[loc2])',
      desc: `Returns the distance (in LENGTH units) between two points`,
      availableMidSentence: true,
      meta: 'Function'
    },
    "distr": {
      syntax: 'DISTR([loc1],[loc2])',
      desc: `Returns the distance (in ANGLE units) between two points`,
      availableMidSentence: true,
      meta: 'Function'
    },
    "exp": {
      syntax: 'EXP([number])',
      desc: `The exponent math function that calculates the exponential function.(e raised to the power of a numeric expression).`,
      availableMidSentence: true,
      meta: 'Function'
    },
    "error": {
      syntax: 'error',
      desc: `Queries the last system error message. If the keyword is prefixed with a task name, the error message corresponding to the last error in that task is returned.`,
      availableMidSentence: true,
      meta: 'Function'
    },
    "filesize": {
      syntax: 'fileSize [file_name]',
      desc: `Returns the size of a file in bytes.`,
      availableMidSentence: true,
      meta: 'MC-Basic'
    },
    "for": {
      syntax: `for [var_name] = [startIndex] to [endIndex]\n&nbsp;&nbsp;...\nnext`,
      desc: `The FOR...NEXT loop repeats the statements enclosed in the loop a number of times, counting from a starting value to an ending value by incrementing or decrementing a loop counter. The loop continues to execute as long as the loop counter has not reached the ending value.`,
      meta: 'MC-Basic'
    },
    "gohome": {
      syntax: `goHome([VScale])`,
      desc: `Move the robot to the home position.
              If VScale is <b>-1</b> then current VScale will be used.`,
      meta: 'Subroutine'
    },
    "goto": {
      syntax: `GoTo [label]`,
      desc: `The GOTO statement is used to perform an unconditional branch to another section of code. It references a label that must appear in the code.
            Labels are written as a name followed by a colon. Labels must appear on their own lines and they may be commented.`,
      meta: 'MC-Basic'
    },
    "hex$": {
      syntax: 'HEX$([number])',
      desc: `Returns the string representation of a number in a hexadecimal format, in UPPER-CASE.`,
      availableMidSentence: true,
      meta: 'Function'
    },
    "if": {
      syntax: `if [condition] then\n&nbsp;&nbsp;...\nend if`,
      desc: `This decision construct enables one section of code or another to be executed, depending on the state of a specified condition. A condition is an expression that, when evaluated, is TRUE if the result is not zero, and FALSE if the result is zero. IF statements may be nested within each other.`,
      meta: 'MC-Basic'
    },
    "if...else...": {
      syntax: `if [condition] then\n&nbsp;&nbsp;...\nelse\n&nbsp;&nbsp;...\nend if`,
      desc: `This decision construct enables one section of code or another to be executed, depending on the state of a specified condition. A condition is an expression that, when evaluated, is TRUE if the result is not zero, and FALSE if the result is zero. The ELSE section is optional, but must be followed by at least one statement. IF statements may be nested within each other. There is no ELSE IF command. If you use an IF after ELSE, you must place IF on a new line.`,
      meta: 'MC-Basic'
    },
    "import": {
      syntax: `import [lib_name]`,
      desc: `Imports a library file into a task. To use a subroutine defined in a library file, the lib file must first be imported at the top of the program and then called by one of its defined subroutines.`,
      meta: 'MC-Basic'
    },
    "instr": {
      syntax: 'INSTR([expression],<i>[search_string](optional),[sub_string](optional)</i>)',
      desc: `Returns the position of the starting character of a substring in a string.
            <b>expression</b>: optional expression indicating the position of the character within <search_string> where searching is to begin. If omitted, the searching starts at the first character.
            <b>search_string</b>: string expression to be searched for the occurrence of sub_string.
            <b>sub_string</b>: string expression containing the sub_string to be searched for within the search_string.
            If one of the input strings is of UTF-8 type and the other is not, the code of the non-UTF-8 input string will be implicitly converted to the UTF-8 codingmethod.`,
      availableMidSentence: true,
      meta: 'Function'
    },
    "isopen": {
      syntax: 'isOpen([device_handle])',
      desc: `Returns the status of port, defined by [DeviceHandle] .`,
      availableMidSentence: true,
      meta: 'Function'
    },
    "grp_close": {
      syntax: `GRP_CLOSE_GRIPPER("[end effector]","[gripper]")`,
      desc: `Close the currently active gripper`,
      meta: 'Subroutine'
    },
    "grp_open": {
      syntax: `GRP_OPEN_GRIPPER("[end effector]","[gripper]")`,
      desc: `Open the currently active gripper`,
      meta: 'Subroutine'
    },
    "grp_reset": {
      syntax: `GRP_RESET_ACTIVE_GRIPPER()`,
      desc: `Resets the end effector's properties to default values`,
      meta: 'Subroutine'
    },
    "grp_set": {
      syntax: `GRP_SET_ACTIVE_GRIPPER("[end effector]","[gripper]")`,
      desc: `Select the specified gripper as the current gripper`,
      meta: 'Subroutine'
    },
    "lcase$": {
      syntax: 'LCASE$([string])',
      desc: `Returns a copy of the string passed to it with all the uppercase letters converted to lowercase.`,
      availableMidSentence: true,
      meta: 'Function'
    },
    "left$": {
      syntax: 'LEFT$([string],[number])',
      desc: `Returns the specified number of characters from the left-hand side of the string.`,
      availableMidSentence: true,
      meta: 'Function'
    },
    "len": {
      syntax: 'LEN([string])',
      desc: `Returns the length of the given string.`,
      availableMidSentence: true,
      meta: 'Function'
    },
    "loc": {
      syntax: 'LOC([device_handle])',
      desc: `Returns the number of characters waiting in the input buffer.`,
      availableMidSentence: true,
      meta: 'Function'
    },
    "log": {
      syntax: 'LOG([number])',
      desc: `Returns the natural logarithm of the expression.`,
      availableMidSentence: true,
      meta: 'Function'
    },
    "logger": {
      syntax: 'logger [error_name]',
      desc: `Logs an application exception. Only the actions of printing and logging the exception are performed. [error name] is the exception name defined by the user.`,
      meta: 'MC-Basic'
    },
    "ltrim$": {
      syntax: 'LTRIM$([string])',
      desc: `Returns the right-hand part of a string after removing any blank spaces at the beginning.`,
      availableMidSentence: true,
      meta: 'Function'
    },
    "mid$": {
      syntax: 'MID$([string],[start_index],[number_of_chars])',
      desc: `Returns the specified number of characters from the string, starting at the character at position [start]. If [start] is greater than the length of [string], an empty string will return.`,
      availableMidSentence: true,
      meta: 'Function'
    },
    "open": {
      syntax: 'Open [comport] BaudRate=[number] Parity=[number] DataBits=[number] StopBit=[number] XOnOff=[number] as #[device_handle]',
      desc: `Opens the serial port for asynchronous ASCII protocol connection.`,
      meta: 'MC-Basic'
    },
    "opensocket": {
      syntax: 'openSocket Options=[number] as #[device_handle]',
      desc: `Creates a TCP socket and put socked descriptor to the specified device handle.`,
      meta: 'MC-Basic'
    },
    "pausetask": {
      syntax: `pauseTask [task_name]`,
      desc: `Stops the task at the closest PAUSE.`,
      meta: 'MC-Basic'
    },
    "pausetask$": {
      syntax: `pauseTask$ [task_name]`,
      desc: `Stops the task at the closest PAUSE. @param task_name is a <b>string</b>.`,
      meta: 'MC-Basic'
    },
    "pay_set": {
      syntax: `PAY_SET_PAYLOAD("[payload]")`,
      desc: `Select the specified payload as the current payload`,
      meta: 'Subroutine'
    },
    "plslist": {
      syntax: 'PlsList [pls_name](optional)',
      desc: `This query returns a list of the PLS names defined in the system`,
      meta: 'MC-Basic',
      terminalOnly: true
    },
    "plt_entry": {
      syntax: `PLT_MOVE_TO_ENTRY_POSITION([robot],"[pallet_name]")`,
      desc: `Move the specified robot to the pallet's entry position`,
      meta: 'Subroutine'
    },
    "plt_pick": {
      syntax: `PLT_PICK_FROM_PALLET([robot],"[pallet_name]")`,
      desc: `Use the specified robot to pick an item for the given pallet`,
      meta: 'Subroutine'
    },
    "plt_place": {
      syntax: `PLT_PLACE_ON_PALLET([robot],"[pallet_name]")`,
      desc: `Use the specified robot to place an item for the given pallet`,
      meta: 'Subroutine'
    },
    "plt_retract": {
      syntax: `PLT_RETRACT_FROM_ITEM([robot],"[pallet_name]")`,
      desc: `Move the specified robot to the pallet's retract position`,
      meta: 'Subroutine'
    },
    "plt_set_index": {
      syntax: `PLT_SET_INDEX_STATUS("[pallet_name]",index)`,
      desc: `Set the specified pallet's index`,
      meta: 'Subroutine'
    },
    "print": {
      syntax: 'print [string]',
      desc: `Multiple strings and expressions are printed, separated by either a comma or a semicolon. The semicolon puts the two expressions next to each other while the comma puts a tab between them.`,
      meta: 'MC-Basic'
    },
    "printu": {
      syntax: 'printU [format_string] ; [expression]',
      desc: `Prints formatted numeric variables, using the specified format string. The format string contains literal text to be printed, as well as characters for formatting numeric expressions. The following characters can be used formatting numeric expressions:<ul>
        <li><b>#</b>  - digital position</li>
        <li><b>.</b>  - decimal position</li>
        <li><b>+</b>  - prints the sign of the expression</li></ul>`,
      meta: 'MC-Basic'
    },
    "printutobuff": {
      syntax: 'printUToBuff #1 [format_string] ; [expression]',
      desc: `Prints formatted numeric variables to the serial port using the specified format <string> to buffer.The format string contains literal text to be printed and characters for formatting numeric expressions. Only a single formatting string (containing text and formatting characters) followed by the expressions to print is allowed.`,
      meta: 'MC-Basic'
    },
    "program": {
      syntax: `program\n&nbsp;&nbsp;...\nend program`,
      desc: `The PROGRAM…END PROGRAM keywords are used to delimit the main section of code in a task. Task variables, defined using DIM SHARED, must appear before the Program keyword. Local variables (defined using DIM alone), appear after the Program keyword, but before the code. Subprograms must appear after the End Program keywords.`,
      meta: 'MC-Basic'
    },
    "record": {
      syntax: `RECORD [file_name] [number of points] [Gap = record_gap](optional) RecData = [param1, param2, ...]`,
      desc: `This command is used to arm (not trigger) data recording. Data are recorded into the specified file, which is then retrieved for viewing. The record file must always have the extension REC. The recorded data file is stored on RAM drive, so the file is lost after power off.
              You must specify the <number of points> to be recorded, where one point is a set of data recorded at a given instant in time. The recorder may be stopped before the specified number of points have been recorded (using RECORDOFF).`,
      meta: 'MC-Basic'
    },
    "record$": {
      syntax: `RECORD$ [file_name] [number of points] [Gap = record_gap](optional) RecData = [param1, param2, ...]`,
      desc: `<b>@param file_name is a string</b>
              This command is used to arm (not trigger) data recording. Data are recorded into the specified file, which is then retrieved for viewing. The record file must always have the extension REC. The recorded data file is stored on RAM drive, so the file is lost after power off.
              You must specify the <number of points> to be recorded, where one point is a set of data recorded at a given instant in time. The recorder may be stopped before the specified number of points have been recorded (using RECORDOFF).`,
      meta: 'MC-Basic'
    },
    "right$": {
      syntax: 'RIGHT$([string],[number])',
      desc: `Returns the specified number of characters from the right-hand side of the string.`,
      availableMidSentence: true,
      meta: 'Function'
    },
    "round": {
      syntax: 'ROUND([number])',
      desc: `Rounds the argument to the nearest even whole number so the cumulative error in a random sample is never more than 0.5.`,
      availableMidSentence: true,
      meta: 'Function'
    },
    "rtrim$": {
      syntax: 'RTRIM$([string])',
      desc: `Returns the left-hand part of a string after removing any blank spaces at the beginning.`,
      availableMidSentence: true,
      meta: 'Function'
    },
    "seek": {
      syntax: 'seek([device_handle],[IPointer])',
      desc: `Moves file pointer to specified location.`,
      meta: 'MC-Basic'
    },
    "select": {
      syntax: `select case [var_name]\n&nbsp;&nbsp;case [val1]\n&nbsp;&nbsp;&nbsp;&nbsp;...\n&nbsp;&nbsp;case [val2]\n&nbsp;&nbsp;&nbsp;&nbsp;...\nend select`,
      desc: `This decision construct enables one of a number of code sections to be executed, depending on the value of a <var_name>. On the first line of a CASE block of commands, you specify the variable or expression you want tested.After you have specified the variable or expression, list one or more values or value ranges that the variable can take. There are four ways you can specify cases: Exact Value, Logical Condition, Range, Else.`,
      meta: 'MC-Basic'
    },
    "selecttool": {
      syntax: 'SelectTool("name")',
      desc: `Select tool for the robot.`,
      meta: 'Subroutine'
    },
    "selectbase": {
      syntax: 'SelectBase("name")',
      desc: `Select base for the robot.`,
      meta: 'Subroutine'
    },
    "sgn": {
      syntax: 'SGN([number])',
      desc: `Returns the sign of the expression: 1 for positive, -1 for negative and 0 otherwise.`,
      availableMidSentence: true,
      meta: 'Function'
    },
    "sin": {
      syntax: 'SIN([number])',
      desc: `Returns the sine of an angle in radians.`,
      availableMidSentence: true,
      meta: 'Function'
    },
    "size": {
      syntax: 'SIZE([string])',
      desc: `Returns the number of bytes taken up by the input string. In ASCII-8 strings SIZE()’s value is equal to LEN()’s value, whereas in UTF-8 string SIZE()’s value might be remarkably bigger than LEN()’s value.`,
      availableMidSentence: true,
      meta: 'Function'
    },
    "sleep": {
      syntax: `sleep [time]`,
      desc: `This command delays the task for a specified period of time (in milliseconds). The delay starts when the preceding command ends.`,
      meta: 'MC-Basic'
    },
    "space$": {
      syntax: 'SPACE$([num_of_spaces])',
      desc: `Returns a string consisting of the specified number of blank spaces.`,
      availableMidSentence: true,
      meta: 'Function'
    },
    "sqrt": {
      syntax: 'SQRT([number])',
      desc: `Returns the square root of the numeric expression.`,
      availableMidSentence: true,
      meta: 'Function'
    },
    "str$": {
      syntax: 'STR$([number])',
      desc: `Returns the string representation of a number.`,
      availableMidSentence: true,
      meta: 'Function'
    },
    "strd$": {
      syntax: 'STRD$([number],[format_string])',
      desc: `Returns the string representation of a double-type number.
            <b>format_string</b>: a valid sprintf() floating point format:
            %f - a non-exponential display
            %e, %E - an exponential display
            %g, %G - type of display depends on the value of the input `,
      availableMidSentence: true,
      meta: 'Function'
    },
    "string$": {
      syntax: 'STRING$([number],[string | ascii_code])',
      desc: `Returns a new string with the specified number of characters. Each character is the first character of the specified string argument or the specified ASCII code.`,
      availableMidSentence: true,
      meta: 'Function'
    },
    "strl$": {
      syntax: 'STRL$([number],[format_string])',
      desc: `Returns the string representation of a long-type number.
            <b>format_string</b>: a valid sprintf() integer format:<ul>
            <li>%d, %i - signed decimal</li>
            <li>%u - unsigned decimal</li>
            <li>%o - octal</li>
            <li>%x, %X - hexadecimal</li>
            <li>%c - unsigned char</li></ul>`,
      availableMidSentence: true,
      meta: 'Function'
    },
    "tan": {
      syntax: 'TAN([number])',
      desc: `Returns the tangent of an angle in radians.`,
      availableMidSentence: true,
      meta: 'Function'
    },
    "tell": {
      syntax: 'tell(#[device_handle])',
      desc: `Returns current file pointer, offset from the beginning of the file. Value has meaning only for Seek command to move file pointer within a file.`,
      meta: 'Function'
    },
    "toascii8$": {
      syntax: 'ToAscii8$([string])',
      desc: `Converts the UTF-8 coding format of the input string into the ASCII-8 coding format. Symbols located outside ASCII-8 range (Unicode value higher than 0xFF) are replaced by question marks.`,
      availableMidSentence: true,
      meta: 'Function'
    },
    "tocart": {
      syntax: 'toCart([robot],[joint])',
      desc: `Converts a joint point to a location point  The Direct Kinematics function implementation.`,
      availableMidSentence: true,
      meta: 'Function'
    },
    "tojoint": {
      syntax: 'toJoint([robot],[joint],[config])',
      desc: `Converts a location point to a joint point the inverse kinematics function implementation.`,
      availableMidSentence: true,
      meta: 'Function'
    },
    "toutf8$": {
      syntax: 'ToUTF8$([string])',
      desc: `Converts the ASCII-8 coding format of the input string into the UTF-8 coding format.`,
      availableMidSentence: true,
      meta: 'Function'
    },
    "typeof": {
      syntax: 'typeof([string])',
      desc: `Returns a number representing the type of the string:<ul>
            <li>0 - no-type</li>
            <li>1 - ASCII-8</li>
            <li>2 - UTF-8</li></ul>`,
      availableMidSentence: true,
      meta: 'Function'
    },
    "ucase$": {
      syntax: 'UCASE$([string])',
      desc: `Returns a copy of the string passed to it with all the lowercase letters converted to uppercase.`,
      availableMidSentence: true,
      meta: 'Function'
    },
    "unload": {
      syntax: "Unload [task_name]",
      desc: `Remove loaded program from the RAM.`,
      meta: 'MC-Basic'
    },
    "unload$": {
      syntax: "Unload$ [task_name]",
      desc: `Remove loaded program from the RAM. <b>@param task_name is a string.</b>`,
      meta: 'MC-Basic'
    },
    "utf$": {
      syntax: 'UTF$([unicode_val])',
      desc: `Returns a UTF-8 string corresponding to a given Unicode value.`,
      availableMidSentence: true,
      meta: 'Function'
    },
    "utfstring$": {
      syntax: 'UTFSTRING$([number],[string | unicode_value])',
      desc: `Returns a new UTF-8 string with the specified number of symbols. Each symbol is the first symbol of the specified string argument or the specified Unicode value.`,
      availableMidSentence: true,
      meta: 'Function'
    },
    "val": {
      syntax: 'val([string])',
      desc: `Returns the real value represented by the characters in the input string. The input string can be a number in decimal mode, scientific mode, scientific notation, or hexadecimal mode (but not binary mode).`,
      availableMidSentence: true,
      meta: 'Function'
    },
    "while": {
      syntax: `while [condition]\n&nbsp;&nbsp;...\nend while`,
      desc: `While and End While keywords delimit a WHILE loop. While loops are used to execute a section of code for as long as a specified condition remains true. The condition is evaluated before any statements in the construct are executed and consequently, the body statements may never be executed. Statements are optional. If none are included, the WHILE….End WHILE acts as a delay. You can have any number of statements to be executed.
              All looping constructs (FOR, WHILE, DO) use the CPU as long as a task of higher priority is not interrupting them. The condition is evaluated as frequently as allowed by the speed of the CPU. Sometimes a WHILE loop may be waiting on a condition that does not require frequent checking. In such instances, it is advisable to insert a SLEEP command into the loop to enable other tasks (perhaps lower priority tasks) to use the CPU.`,
      meta: 'MC-Basic'
    }
  },
  optionals: [
		{ // used in move
      VScale: { type: 0, desc: 'VScale (1-100)' }
    },
    { // used in circle type 1
      VTran: { type: 1, desc: 'Defines the translation velocity of the robot.' },
      CirclePlane: {
        type: 0,
        desc: 'Defines the plane in which the circle will be executed.',
        options: [{ val: 0, desc: 'XY' }, { val: 1, desc: 'XZ' }, { val: 2, desc: 'YZ' }]
      }
    },
    { // used in circle type 2
      VTran: { type: 1, desc: 'Defines the translation velocity of the robot.' },
    },
    { // used in STOP
      StopType: {
        type: 1,
        desc: `This property defines how the motion is stopped in response to the STOP command. The property is used within a STOP command to override the permanent value for that STOP command.`,
        options: [
          { val: 'IMMEDIATE', desc: 'Immediate stop using maximum deceleration' },
          { val: 'ONPATH', desc: ' Immediate stop on the path of the motion' },
          { val: 'ENDMOTION', desc: 'Stop at the end of the current motion command' },
          { val: 'ABORT', desc: 'Stop the current motion immediate but do not wait for proceed to start next motion' }
        ]
      },
    },
    { // used in LOAD
      priority: { type: 0, desc: `Priority level` },
      stackSize: { type: 1, desc: `StackSize multiplier` },
      with: { type: 6, desc: `LibraryName`, hideEqSign: true },
    },
    { // used in LOAD$
      as: { type: 2, desc: `Task Name`, hideEqSign: true },
      priority: { type: 0, desc: `Priority level` },
      stackSize: { type: 1, desc: `StackSize multiplier` },
    },
    { // used in PROCEED
      ProceedType: {
        type: 0,
        desc: `This property defines the action to be taken by the PROCEED command.`,
        options: [
          { val: 'CONTINUE', desc: 'Continue with stopped motion. In case there are two motions in the buffer it executes both (one that was executed and one that was pending while the STOP command was issued).' },
          { val: 'NEXTMOTION', desc: 'Abort current motion and execute the next motion command in the motion buffer. One that was executing during STOP is forgotten and the one that was pending is executed).' },
          { val: 'CLEARMOTION', desc: 'Abort all motion commands in the motion buffer. Actually clears the motion buffers from complete history' }
        ]
      },
    },
    { // used in STARTTASK and STARTTASK$
      priority: { type: 0, desc: `Priority level` },
      numberOfLoops: { type: 0, desc: `A task can be started and specified to run for a number of execution loops, then stop.` }
    },
    {
      ArchNo: { type: 9, desc: 'interge [1,7] , Select the depart length and approach length.' },
      Limz: { type: 8, desc: 'Limz [-300,10],Defines the limit of z direction.' },
      Vscale: { type: 8, desc: 'Defines the translation velocity of the robot.' },
      Ascale: { type: 8, desc: 'Defines the translation acceleration of the robot.' }
    },
    {
      ArchNo: { type: 9, desc: 'interge [1,7] , Select the depart length and approach length.' },
      VTran: { type: 8, desc: 'Defines the translation velocity of the robot.' },
      Ascale: { type: 8, desc: 'Defines the translation acceleration of the robot.' }
    },
    {
      ArchNo: { type: 9, desc: 'interge [1,7] , Select the depart length and approach length.' },
      VTran: { type: 8, desc: 'Defines the translation velocity of the robot.' },
      Ascale: { type: 8, desc: 'Defines the translation acceleration of the robot.' }
    },
    { // used in moves
			VTran: { type: 1, desc: 'VTran'}
    },
	]
};
