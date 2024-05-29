from django.urls import path
from rest_framework_simplejwt import views as jwt_views

from . import views

urlpatterns = [
    path("token/", views.ObtainTokenPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", jwt_views.TokenRefreshView.as_view(), name="token_refresh"),
    path("user/create/", views.RegisterView.as_view()),
    path('user/', views.UserView.as_view()),
    path("post/", views.PostListCreateView.as_view()),
    path("posts/<int:pk>/delete/", views.PostDeleteView.as_view()),
    path("posts/<int:pk>/update/", views.PostUpdateView.as_view()),
    path("comments/<int:pk>/delete/", views.CommentDeleteView.as_view()),
    path("posts/<int:post_id>/add_comment/", views.CommentCreateView.as_view()),
    path("posts/<int:post_id>/comments/", views.CommentListView.as_view()),
    path("posts/<int:pk>/<str:action>/", views.PostReactionView.as_view()),
]
