const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const config = {
	resolver: {
		unstable_conditionNames: ['browser', 'require'],
	},
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
