var filters = {
	SourceFilterExample: {
		inputs: 0,
		outputs: 1,
		parameter: {
			waitMin: 10,
			waitMax: 500000
		}
	},
	WorkFilterExample: {
		inputs: 1,
		outputs: 1,
		parameter: {
			waitMin: 10,
			waitMax: 500000
		}
	},
	EndFilterExample: {
		inputs: 1,
		outputs: 0,
		parameter: {
			waitMin: 10,
			waitMax: 500000
		}
	},
	EndFilter: {
		inputs: 3,
		outputs: 0
	},
	OpenCVImageSource: {
		inputs: 1,
		outputs: 1
	},
	RgbToGrayFilter: {
		inputs: 1,
		outputs: 0
	},
	FindEdges: {
		inputs: 1,
		outputs: 0
	},
	GLFWImageSink: {
		inputs: 1,
		outputs: 0
	},
	W: {
		inputs: 2,
		outputs: 1
	},
	E: {
		inputs: 2,
		outputs: 0
	}
};
module.exports = filters;