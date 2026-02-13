from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import CategoryViewSet, DepartmentViewSet, EventViewSet, VenueViewSet

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'venues', VenueViewSet, basename='venue')
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'events', EventViewSet, basename='event')

urlpatterns = [
    path('', include(router.urls)),
]
