import qrcode
from io import BytesIO
from django.core.files import File
import math, random

def generate_reference_number(reference_name):
    prefix = (reference_name[:2] if reference_name and len(reference_name) >= 2 else "NA")
    reference_number = prefix + '-'
    for i in range(10):
        reference_number += random.choice('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ')
    return reference_number.upper()

def generate_qr_code(reference_number):
    qr = qrcode.make(str(reference_number))
    buffer = BytesIO()
    qr.save(buffer, format='PNG')
    buffer.seek(0)
    return File(buffer, name=f'{reference_number}.png')

from twilio.rest import Client
from django.conf import settings

def send_sms(to, message):
    try:
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        message_obj = client.messages.create(
            body=message,
            from_=settings.TWILIO_PHONE_NUMBER,
            to=to
        )
        return True
    except Exception as e:
        print(f"SMS sending failed: {e}")
        raise e