from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
# urls.py
from rest_framework.routers import DefaultRouter
from registry.views import *
from django.conf import settings
from django.conf.urls.static import static
from registry.views import RegisterView
from registry.views import LoginView
from registry.views import RegistryBranchList
from registry.views import track_by_reference


router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'document-types', DocumentTypeViewSet)
router.register(r'branches', RegistryBranchViewSet)
router.register(r'applications', ApplicationViewSet)
router.register(r'attachments', AttachmentViewSet)
router.register(r'notifications', NotificationViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/login/', LoginView.as_view(), name='login'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/registry-branches/', RegistryBranchList.as_view(), name='registry-branch-list'),

    path('api/track-by-reference/', track_by_reference, name='track-by-reference'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)