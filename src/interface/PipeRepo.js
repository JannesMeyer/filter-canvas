var pipes = {
	ForwardingPipe: {
		inputs: 1,
		outputs: 1,
		parameter: {
			pipelines: 1
		}
	},
	SplitPipe: {
		inputs: 1,
		outputs: 2,
		parameter: {
			outputs: 2
		}
	},
	JoinPipe: {
		inputs: 2,
		outputs: 1,
		parameter: {
			inputs: 2
		}
	}
};
module.exports = pipes;