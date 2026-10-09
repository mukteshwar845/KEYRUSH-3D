/**
 * KeyRush Notifications & Daily Reminders
 * Manages Web Notifications, push reminders, and quiet hours.
 */

export class NotificationManager {
  static async requestPermission() {
    if (!('Notification' in window)) {
      return 'unsupported';
    }
    const permission = await Notification.requestPermission();
    return permission;
  }

  static getPermissionState() {
    if (!('Notification' in window)) return 'unsupported';
    return Notification.permission;
  }

  static sendLocalNotification(title, options = {}) {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return false;
    }

    // Check quiet hours (e.g. 10 PM to 7 AM)
    const currentHour = new Date().getHours();
    if (currentHour >= 22 || currentHour < 7) {
      console.log('Notification suppressed during quiet hours');
      return false;
    }

    try {
      new Notification(title, {
        icon: '/pwa-icon-192.png',
        badge: '/pwa-icon-192.png',
        body: options.body || 'Ready for another lap? Keep your daily streak alive!',
        ...options
      });
      return true;
    } catch (e) {
      console.warn('Could not trigger notification:', e);
      return false;
    }
  }

  static scheduleDailyReminder(streakDays = 1) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    // Check last reminder timestamp
    const lastReminder = localStorage.getItem('keyrush_last_reminder_day');
    const today = new Date().toDateString();

    if (lastReminder !== today) {
      // Show friendly motivational nudge
      this.sendLocalNotification('🔥 Maintain Your Streak!', {
        body: `You are on a ${streakDays}-day typing streak. Hit the track for 5 minutes today!`
      });
      localStorage.setItem('keyrush_last_reminder_day', today);
    }
  }
}
