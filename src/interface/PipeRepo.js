var pipes = {
	ForwardPipe: {
		parameter: { pipelines: 1 }
	},
	SplitPipe: {
		inputs: 1,
		parameter: { outputs: 2 }
	},
	JoinPipe: {
		outputs: 1,
		parameter: { inputs: 2 }
	}
};
module.exports = pipes;