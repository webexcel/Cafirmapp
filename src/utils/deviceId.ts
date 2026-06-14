import DeviceInfo from "react-native-device-info";

export const getDeviceId = async (): Promise<string> => {
	return DeviceInfo.getUniqueId();
};
