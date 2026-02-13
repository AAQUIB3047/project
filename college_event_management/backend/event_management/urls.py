"""
URL configuration for event_management project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Including another URLconf:
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
import os
from pathlib import Path

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path
from django.views.decorators.http import require_http_methods
from django.views.static import serve


@require_http_methods(["GET"])
def api_root(request):
    """API root endpoint - returns API status"""
    return JsonResponse({
        "status": "ok",
        "message": "EventHub API is running",
        "version": "1.0.0",
        "endpoints": {
            "auth": "/api/auth/",
            "users": "/api/users/",
            "events": "/api/events/",
            "registrations": "/api/registrations/",
            "attendance": "/api/attendance/",
            "reports": "/api/reports/",
            "dashboard": "/api/dashboard/",
            "admin": "/api/admin/",
            "admin_panel": "/admin/"
        }
    })

def serve_react_app(request, path=''):
    """Serve React app - fallback to index.html for SPA routing"""
    frontend_dist = Path(__file__).resolve().parent.parent.parent / 'frontend' / 'dist'
    
    if path and os.path.isfile(os.path.join(frontend_dist, path)):
        return serve(request, path, document_root=str(frontend_dist))
    
    # Fallback to index.html for React Router
    return serve(request, 'index.html', document_root=str(frontend_dist))

urlpatterns = [
    # API routes MUST come first to avoid being caught by React SPA catch-all
    path('admin/', admin.site.urls),
    path('accounts/', include('allauth.urls')),
    path('api/auth/', include('login.urls')),
    path('api/dashboard/', include('dashboard.urls')),
    path('api/admin/', include('admin_app.urls')),
    path('api/users/', include('users.urls')),
    path('api/events/', include('events.urls')),
    path('api/registrations/', include('registrations.urls')),
    path('api/attendance/', include('attendance.urls')),
    path('api/reports/', include('reports.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# React SPA routes - MUST come last
if settings.DEBUG:
    urlpatterns += [
        path('', serve_react_app),  # Root - serve React app
        path('<path:path>', serve_react_app),  # All other paths - serve React app for SPA routing
    ]
