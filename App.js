import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();
  const notificationIds = useRef({});

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      setExpoPushToken(token || '');
      console.log("Expo Push Token:", token);
    });

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log("Notification received:", notification);
      setNotification(notification);
    });


    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log("Notification response:", response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);


  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const handleConfirmDate = (selectedDate) => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - 1);
    if (selectedDate < now) {
      Alert.alert("Некоректний час", "Будь ласка, виберіть майбутній час для нагадування.");
    } else {
      setDate(selectedDate);
    }
    hideDatePicker();
  };


  const scheduleNotification = async (taskTitle, taskDescription, scheduleTime) => {
    try {
      const trigger = new Date(scheduleTime);

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: taskTitle,
          body: taskDescription || 'Нагадування!',
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger,
      });

      console.log('Сповіщення заплановано, ID:', id);
      return id;
    } catch (error) {
      console.error('Помилка планування сповіщення:', error);
      Alert.alert('Помилка', `Не вдалося запланувати сповіщення: ${error.message}`);
      return null;
    }
  };

  const cancelNotification = async (notificationId) => {
    if (!notificationId) {
      console.warn("Спроба скасувати сповіщення без ID.");
      return;
    }

    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log('Сповіщення скасовано успішно, ID:', notificationId);
    } catch (error) {
      console.error('Помилка скасування сповіщення:', error);
    }
  };


  const addTask = async () => {
    if (!title.trim()) {
      Alert.alert('Порожня назва', 'Будь ласка, введіть назву задачі.');
      return;
    }

    const now = new Date();
    if (!date || date <= now) {
      Alert.alert('Некоректний час', 'Будь ласка, оберіть майбутній час для нагадування.');
      return;
    }

    const notificationId = await scheduleNotification(title, description, date);
    if (notificationId) {
      const newTask = {
        id: Date.now().toString(),
        title: title.trim(),
        description: description.trim(),
        date: date,
        notificationId: notificationId,
      };

      setTasks(prevTasks => [...prevTasks, newTask]);
      notificationIds.current[newTask.id] = notificationId;

      setTitle('');
      setDescription('');
      const nextDefaultDate = new Date();
      nextDefaultDate.setMinutes(nextDefaultDate.getMinutes() + 5);
      setDate(nextDefaultDate);
    } else {
      console.log('Не вдалося додати задачу через помилку планування сповіщення.');
    }
  };

  const deleteTask = (taskId) => {
    const notificationIdToCancel = notificationIds.current[taskId];

    Alert.alert(
      'Видалити задачу?',
      'Ви впевнені, що хочете видалити цю задачу та її нагадування?',
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Видалити',
          style: 'destructive',
          onPress: async () => {
            if (notificationIdToCancel) {
              await cancelNotification(notificationIdToCancel);
              delete notificationIds.current[taskId];
            } else {
              console.log(`Не знайдено notificationId для задачі ${taskId} для скасування.`);
            }
            setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderTask = ({ item }) => (
    <View style={styles.taskItem}>
      <View style={styles.taskTextContainer}>
        <Text style={styles.taskTitle}>{item.title}</Text>
        {item.description ? <Text style={styles.taskDescription}>{item.description}</Text> : null}
        <Text style={styles.taskDate}>
          Нагадати: {item.date.toLocaleDateString('uk-UA', { day: '2-digit', month: 'long', year: 'numeric' })} о {item.date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
      <TouchableOpacity onPress={() => deleteTask(item.id)} style={styles.deleteButton}>
        <Text style={styles.deleteButtonText}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={Platform.OS === 'ios' ? 'dark-content' : 'default'} />
      <View style={styles.container}>
        <Text style={styles.header}>To-Do Reminder</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Назва задачі"
            value={title}
            onChangeText={setTitle}
            placeholderTextColor="#999"
          />
          <TextInput
            style={styles.input}
            placeholder="Опис (необов'язково)"
            value={description}
            onChangeText={setDescription}
            placeholderTextColor="#999"
          />
          <View style={styles.dateContainer}>
            <Text style={styles.dateLabel}>Час нагадування:</Text>
            <Button
              title={date ? date.toLocaleString('uk-UA', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }) : "Обрати час"}
              onPress={showDatePicker}
            />
          </View>
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="datetime"
            date={date || new Date()}
            onConfirm={handleConfirmDate}
            onCancel={hideDatePicker}
            minimumDate={new Date()}
            locale="uk-UA"
            confirmTextIOS="Підтвердити"
            cancelTextIOS="Скасувати"
            headerTextIOS="Оберіть дату та час"
          />
          <Button
            title="Додати нагадування"
            onPress={addTask}
            disabled={!title.trim() || !date || date <= new Date()}
            color="#007AFF"
          />
          {!expoPushToken && (
            <TouchableOpacity
              onPress={() => registerForPushNotificationsAsync().then(token => setExpoPushToken(token || ''))}
              style={styles.registerButton}
            >
              <Text style={styles.warningText}>Для сповіщень потрібні дозволи. Натисніть, щоб дозволити.</Text>
            </TouchableOpacity>
          )}
        </View>
        <FlatList
          data={tasks}
          renderItem={renderTask}
          keyExtractor={item => item.id}
          style={styles.list}
          ListEmptyComponent={<Text style={styles.emptyListText}>Список задач порожній</Text>}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>
    </SafeAreaView>
  );
};


async function registerForPushNotificationsAsync() {
  let token;

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

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }

    token = (await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId || undefined,
    })).data;
    console.log('Expo Push Token:', token);
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  container: {
    flex: 1,
    padding: 15,
  },
  header: {
    fontSize: 26,
    fontWeight: '600',
    marginBottom: 25,
    textAlign: 'center',
    color: '#1C1C1E',
  },
  inputContainer: {
    marginBottom: 25,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    height: 50,
    borderColor: '#D1D1D6',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    fontSize: 16,
    color: '#000000',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingVertical: 5,
  },
  dateLabel: {
    fontSize: 16,
    color: '#3C3C43',
  },
  list: {
    flex: 1,
    marginTop: 10,
  },
  taskItem: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 12,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  taskTextContainer: {
    flex: 1,
    marginRight: 15,
  },
  taskTitle: {
    fontSize: 17,
    fontWeight: '500',
    color: '#000000',
  },
  taskDescription: {
    fontSize: 14,
    color: '#8A8A8E',
    marginTop: 5,
  },
  taskDate: {
    fontSize: 13,
    color: '#8A8A8E',
    marginTop: 6,
  },
  deleteButton: {
    padding: 5,
    marginLeft: 5,
  },
  deleteButtonText: {
    fontSize: 22,
    color: '#FF3B30',
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#8A8A8E',
  },
  warningText: {
    textAlign: 'center',
    color: '#FF9500',
    fontSize: 13,
    marginTop: 10,
    marginBottom: 5,
  },
  registerButton: {
    padding: 10,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    marginTop: 10,
  },
});

export default App;