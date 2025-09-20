import os
from twilio.rest import Client
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class SMSService:
    def __init__(self):
        # Twilio credentials - these should be set in environment variables or Django settings
        self.account_sid = getattr(settings, 'TWILIO_ACCOUNT_SID', os.environ.get('TWILIO_ACCOUNT_SID'))
        self.auth_token = getattr(settings, 'TWILIO_AUTH_TOKEN', os.environ.get('TWILIO_AUTH_TOKEN'))
        self.from_number = getattr(settings, 'TWILIO_PHONE_NUMBER', os.environ.get('TWILIO_PHONE_NUMBER'))
        
        # Initialize Twilio client if credentials are available
        if self.account_sid and self.auth_token:
            self.client = Client(self.account_sid, self.auth_token)
        else:
            self.client = None
            logger.warning("Twilio credentials not configured. SMS notifications will be disabled.")

    def send_sms(self, to_phone, message):
        """
        Send SMS message to a phone number
        
        Args:
            to_phone (str): Phone number in international format (e.g., +263712345678)
            message (str): Message content
            
        Returns:
            dict: Result with success status and message
        """
        if not self.client:
            return {
                'success': False,
                'message': 'SMS service not configured. Please contact administrator.'
            }
        
        if not to_phone:
            return {
                'success': False,
                'message': 'Phone number not provided'
            }
        
        try:
            # Clean phone number (remove spaces, dashes, etc.)
            clean_phone = ''.join(filter(str.isdigit, to_phone))
            if not clean_phone.startswith('+'):
                # Assume Zimbabwe number if no country code
                if clean_phone.startswith('0'):
                    clean_phone = '+263' + clean_phone[1:]
                elif clean_phone.startswith('263'):
                    clean_phone = '+' + clean_phone
                else:
                    clean_phone = '+263' + clean_phone
            
            # Send SMS
            message_obj = self.client.messages.create(
                body=message,
                from_=self.from_number,
                to=clean_phone
            )
            
            logger.info(f"SMS sent successfully to {clean_phone}. Message SID: {message_obj.sid}")
            
            return {
                'success': True,
                'message': 'SMS sent successfully',
                'message_sid': message_obj.sid
            }
            
        except Exception as e:
            logger.error(f"Failed to send SMS to {to_phone}: {str(e)}")
            return {
                'success': False,
                'message': f'Failed to send SMS: {str(e)}'
            }

    def send_application_status_sms(self, user, application, old_status, new_status):
        """
        Send SMS notification for application status change
        
        Args:
            user: User object
            application: Application object
            old_status: Previous status
            new_status: New status
            
        Returns:
            dict: Result with success status and message
        """
        if not user.phone_number:
            return {
                'success': False,
                'message': 'User phone number not available'
            }
        
        if not getattr(user, 'sms_notifications_enabled', True):
            return {
                'success': False,
                'message': 'SMS notifications disabled by user'
            }
        
        # Get branch information
        branch_info = ""
        if application.branch:
            branch_info = f"\nBranch: {application.branch.name}"
            if application.branch.location:
                branch_info += f"\nLocation: {application.branch.location}"
            if application.branch.contact_info:
                branch_info += f"\nContact: {application.branch.contact_info}"
        
        # Create detailed SMS message based on status
        status_messages = {
            'submitted': f'✅ APPLICATION SUBMITTED\n\nRef: {application.reference_number}\nDocument: {application.document_type.name}\nStatus: Submitted for Review{branch_info}\n\nYour application has been received and is under review.',
            'review': f'🔍 APPLICATION UNDER REVIEW\n\nRef: {application.reference_number}\nDocument: {application.document_type.name}\nStatus: Under Review{branch_info}\n\nYour application is currently being reviewed by our team.',
            'approved': f'🎉 APPLICATION APPROVED\n\nRef: {application.reference_number}\nDocument: {application.document_type.name}\nStatus: Approved{branch_info}\n\nGreat news! Your application has been approved and will be processed.',
            'printed': f'🖨️ DOCUMENT PRINTED\n\nRef: {application.reference_number}\nDocument: {application.document_type.name}\nStatus: Printed{branch_info}\n\nYour document has been printed and is being processed.',
            'ready': f'📋 READY FOR COLLECTION\n\nRef: {application.reference_number}\nDocument: {application.document_type.name}\nStatus: Ready for Collection{branch_info}\n\nYour document is ready! Please visit the branch to collect it.',
            'collected': f'✅ DOCUMENT COLLECTED\n\nRef: {application.reference_number}\nDocument: {application.document_type.name}\nStatus: Collected{branch_info}\n\nYour document has been successfully collected.',
            'rejected': f'❌ APPLICATION REJECTED\n\nRef: {application.reference_number}\nDocument: {application.document_type.name}\nStatus: Rejected{branch_info}\n\nUnfortunately, your application has been rejected. Please contact us for more information.'
        }
        
        message = status_messages.get(new_status, f'📄 APPLICATION UPDATE\n\nRef: {application.reference_number}\nDocument: {application.document_type.name}\nStatus: {new_status}{branch_info}\n\nYour application status has been updated.')
        
        # Add QR code info and system signature
        if application.qr_code:
            message += f'\n\nQR Code: {application.qr_code}'
        
        message += '\n\nCivil Registry System'
        
        return self.send_sms(user.phone_number, message)

    def send_application_submission_sms(self, user, application):
        """
        Send SMS notification when citizen submits application
        
        Args:
            user: User object
            application: Application object
            
        Returns:
            dict: Result with success status and message
        """
        if not user.phone_number:
            return {
                'success': False,
                'message': 'User phone number not available'
            }
        
        if not getattr(user, 'sms_notifications_enabled', True):
            return {
                'success': False,
                'message': 'SMS notifications disabled by user'
            }
        
        # Get branch information
        branch_info = ""
        if application.branch:
            branch_info = f"\nBranch: {application.branch.name}"
            if application.branch.location:
                branch_info += f"\nLocation: {application.branch.location}"
            if application.branch.contact_info:
                branch_info += f"\nContact: {application.branch.contact_info}"
        
        # Create detailed submission SMS
        message = f'📝 APPLICATION SUBMITTED\n\nRef: {application.reference_number}\nDocument: {application.document_type.name}\nStatus: Submitted for Review{branch_info}\n\nYour application has been successfully submitted and is now under review. You will receive updates via SMS as the status changes.'
        
        # Add QR code info if available
        if application.qr_code:
            message += f'\n\nQR Code: {application.qr_code}'
        
        message += '\n\nCivil Registry System'
        
        return self.send_sms(user.phone_number, message)

    def send_welcome_sms(self, user):
        """
        Send welcome SMS to new user
        
        Args:
            user: User object
            
        Returns:
            dict: Result with success status and message
        """
        if not user.phone_number:
            return {
                'success': False,
                'message': 'User phone number not available'
            }
        
        message = f"Welcome to Civil Registry System, {user.full_name or user.username}! You can now submit applications for various documents. Visit our website to get started."
        
        return self.send_sms(user.phone_number, message)

# Create global instance
sms_service = SMSService()
