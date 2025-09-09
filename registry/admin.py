from django.contrib import admin
from .models import User, DocumentType, RegistryBranch, Application, Attachment
# Register your models here.
admin.site.register(User)
admin.site.register(DocumentType)
admin.site.register(RegistryBranch)
admin.site.register(Application)
admin.site.register(Attachment)