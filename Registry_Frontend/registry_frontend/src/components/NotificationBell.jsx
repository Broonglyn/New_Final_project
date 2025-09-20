import React, { useState } from 'react';
import { Badge, Dropdown, ListGroup, Button, Spinner } from 'react-bootstrap';
import { FaBell, FaCheck, FaTrash, FaTimes } from 'react-icons/fa';
import { useNotifications } from '../context/NotificationContext';

function NotificationBell() {
    const { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
    const [showDropdown, setShowDropdown] = useState(false);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);
        
        if (diffInHours < 1) {
            const diffInMinutes = Math.floor(diffInHours * 60);
            return `${diffInMinutes}m ago`;
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)}h ago`;
        } else {
            return date.toLocaleDateString();
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'application_approved':
                return '✅';
            case 'application_rejected':
                return '❌';
            case 'application_ready':
                return '📦';
            case 'status_update':
                return '🔄';
            default:
                return '🔔';
        }
    };

    const handleNotificationClick = (notification) => {
        if (!notification.is_read) {
            markAsRead(notification.id);
        }
    };

    return (
        <Dropdown show={showDropdown} onToggle={setShowDropdown}>
            <Dropdown.Toggle 
                variant="outline-light" 
                className="position-relative border-0 bg-transparent"
                style={{ fontSize: '1.2rem' }}
            >
                <FaBell />
                {unreadCount > 0 && (
                    <Badge 
                        bg="danger" 
                        className="position-absolute top-0 start-100 translate-middle rounded-pill"
                        style={{ fontSize: '0.7rem', minWidth: '18px', height: '18px' }}
                    >
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                )}
            </Dropdown.Toggle>

            <Dropdown.Menu 
                align="end" 
                className="shadow-lg border-0"
                style={{ minWidth: '350px', maxHeight: '400px', overflowY: 'auto' }}
            >
                <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
                    <h6 className="mb-0 fw-bold">Notifications</h6>
                    <div>
                        {unreadCount > 0 && (
                            <Button 
                                variant="link" 
                                size="sm" 
                                className="text-primary p-0 me-2"
                                onClick={markAllAsRead}
                            >
                                <FaCheck className="me-1" />
                                Mark all read
                            </Button>
                        )}
                        <Button 
                            variant="link" 
                            size="sm" 
                            className="text-muted p-0"
                            onClick={() => setShowDropdown(false)}
                        >
                            <FaTimes />
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center p-3">
                        <Spinner animation="border" size="sm" />
                        <div className="mt-2">Loading notifications...</div>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="text-center p-4 text-muted">
                        <FaBell className="mb-2" style={{ fontSize: '2rem', opacity: 0.3 }} />
                        <div>No notifications yet</div>
                    </div>
                ) : (
                    <ListGroup variant="flush">
                        {notifications.slice(0, 10).map((notification) => (
                            <ListGroup.Item
                                key={notification.id}
                                className={`border-0 px-3 py-2 cursor-pointer ${
                                    !notification.is_read ? 'bg-light' : ''
                                }`}
                                onClick={() => handleNotificationClick(notification)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="d-flex align-items-start">
                                    <div className="me-2" style={{ fontSize: '1.2rem' }}>
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div className="flex-grow-1">
                                        <div className="d-flex justify-content-between align-items-start">
                                            <h6 className={`mb-1 ${!notification.is_read ? 'fw-bold' : 'fw-normal'}`}>
                                                {notification.title}
                                            </h6>
                                            <Button
                                                variant="link"
                                                size="sm"
                                                className="text-muted p-0 ms-2"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteNotification(notification.id);
                                                }}
                                            >
                                                <FaTrash style={{ fontSize: '0.8rem' }} />
                                            </Button>
                                        </div>
                                        <p className="mb-1 text-muted small">
                                            {notification.message}
                                        </p>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <small className="text-muted">
                                                {formatDate(notification.created_at)}
                                            </small>
                                            {notification.application_reference && (
                                                <Badge bg="secondary" className="small">
                                                    {notification.application_reference}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                )}

                {notifications.length > 10 && (
                    <div className="text-center p-2 border-top">
                        <small className="text-muted">
                            Showing latest 10 notifications
                        </small>
                    </div>
                )}
            </Dropdown.Menu>
        </Dropdown>
    );
}

export default NotificationBell;
