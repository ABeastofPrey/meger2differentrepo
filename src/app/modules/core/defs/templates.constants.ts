export const CIRCLE_UPG = `program

  dim homePosition   as joint of xyzr = {0,0,-30,0}
  dim centerPosition as joint of xyzr = {0,90,-30,0}
  dim Radius as double = 50.0 ' mm

  Attach SCARA
    SCARA.En = ON
    Move SCARA homePosition
    move SCARA centerPosition Vcruise=10
    move SCARA #{0,Radius,0,0} Vcruise=10 Abs=OFF
    waitForMotion SCARA
    ' start 5 circles with radius 50 and velocity 250 mm/sec
    Circle SCARA Angle = 360*5 CircleCenter = centerPosition Vtran = 250
    waitForMotion SCARA
  Detach SCARA

end program

`;