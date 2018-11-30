/**
 * The key of jump command parameter error.
 */
export enum JumpParameterErrorKey {
  Required = 'required',
  InValidLimitZ = 'inValidLimitZ',
  InValidSpeed = 'inValidSpeed',
  InValidAcceleration = 'inValidAcceleration',
  InValidArcNumber = 'inValidArcNumber',
  InValidBlending = 'inValidBlending'
}

/**
 * The parameter enum of the jump command.
 */
export enum JumpParameter {
  MotionElement = 'motionElement',
  DestinationFrame = 'destinationFrame',
  LimitZ = 'InValidLimitZ',
  Speed = 'InValidSpeed',
  Acceleration = 'InValidAcceleration',
  ArcNumber = 'InValidArcNumber',
  Blending = 'InValidBlending'
}
