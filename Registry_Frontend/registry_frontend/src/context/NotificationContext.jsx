import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api.jsx';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const loadNotifications = async () => {
        // Only load notifications if user is authenticated
        if (!user) {
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

        try {
            setLoading(true);
            const response = await api.get('/notifications/');
            setNotifications(response.data);
            setUnreadCount(response.data.filter(n => !n.is_read).length);
        } catch (error) {
            console.error('Failed to load notifications:', error);
            // Don't show error if it's just authentication issue
            if (error.response?.status !== 401) {
                console.error('Notification error:', error);
            }
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await api.patch(`/notifications/${notificationId}/`, { is_read: true });
            setNotifications(prev => 
                prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const unreadNotifications = notifications.filter(n => !n.is_read);
            await Promise.all(
                unreadNotifications.map(n => 
                    api.patch(`/notifications/${n.id}/`, { is_read: true })
                )
            );
            setNotifications(prev => 
                prev.map(n => ({ ...n, is_read: true }))
            );
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            await api.delete(`/notifications/${notificationId}/`);
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
            setUnreadCount(prev => {
                const deletedNotification = notifications.find(n => n.id === notificationId);
                return deletedNotification && !deletedNotification.is_read ? prev - 1 : prev;
            });
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    useEffect(() => {
        loadNotifications();
        // Refresh notifications every 30 seconds only if user is authenticated
        const interval = setInterval(loadNotifications, 30000);
        return () => clearInterval(interval);
    }, [user]); // Re-run when user changes

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            loading,
            loadNotifications,
            markAsRead,
            markAllAsRead,
            deleteNotification
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    return useContext(NotificationContext);
};
