import { useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const useNotifications = () => {
  const [hasPermission, setHasPermission] = useState<boolean>(false);

  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  async function registerForPushNotificationsAsync() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      setHasPermission(finalStatus === 'granted');
    } else {
      setHasPermission(true);
    }
  }

  const scheduleMealReminders = async (enabled: boolean) => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();

      if (!enabled) return;

      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        console.log("No notification permissions");
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🍳 Time for Breakfast!",
          body: "Start your day right with a healthy meal.",
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 8,
          minute: 0,
        },
      });

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🥗 Lunch Time!",
          body: "Time to refuel with a nutritious lunch.",
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 13,
          minute: 0,
        },
      });

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🍽️ Dinner Time!",
          body: "Wrap up your day with a healthy dinner.",
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 19,
          minute: 0,
        },
      });
    } catch (error) {
      console.error("Error scheduling notifications:", error);
    }
  };

  return {
    hasPermission,
    scheduleMealReminders,
  };
};
