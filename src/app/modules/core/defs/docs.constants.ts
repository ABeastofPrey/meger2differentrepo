export const DOCS = {
  types: ['long','double','string','element','position'],
  ac_objects: ['sys'],
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
          name: 'NAME',
          type: 2,
          desc: `This property sets the name of the controller. The query returns the name of the controller. If the no name was set (or an empty string), the reply is, "no name."`,
        },
			],
		group: [],
		axis: []
	},
	commands: {
    attach: [
      {
        syntax: 'Attach',
        desc: 'Attach'
      },
      {
        syntax: 'Attach [element]',
        desc: 'Attach to the specified element'
      },
    ],
    call: [
      {
        syntax: 'Call {SubName}',
        desc: 'Executes the subroutine {SubName}'
      }
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
		]
		
	},
	optionals: [ 
		{ // used in move
			VCruise: { type: 1, desc: 'Cruise velocity'}
    },
    { // used in circle type 1
      VTran: { type: 1, desc: 'Defines the translation velocity of the robot.'},
			CirclePlane : { 
        type: 0,
        desc: 'Defines the plane in which the circle will be executed.',
        options: [{val:0, desc: 'XY'},{val:1, desc: 'XZ'},{val:2, desc: 'YZ'}]
      }
    },
    { // used in circle type 2
      VTran: { type: 1, desc: 'Defines the translation velocity of the robot.'},
    }
	]
};