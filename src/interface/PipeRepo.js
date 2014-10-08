var pipes = {
	ForwardPipe: {
		parameter: {
			cardinality: 1,
			sync: true
		}
	},
	SplitPipe: {
		inputs: 1,
		parameter: {
			outputs: 2,
			sync: false
		}
	},
	JoinPipe: {
		outputs: 1,
		parameter: {
			inputs: 2,
			sync: false
		}
	}
};
module.exports = pipes;