from rest_framework import generics, status
from rest_framework.generics import get_object_or_404
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

from . import serializers, models


class ObtainTokenPairView(TokenObtainPairView):
    permission_classes = (AllowAny,)
    serializer_class = serializers.CustomTokenObtainPairSerializer


class CommentPagination(PageNumberPagination):
    page_size = 5


class UserView(generics.RetrieveAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = serializers.UserSerializer

    def get_object(self):
        return self.request.user


class RegisterView(generics.GenericAPIView):
    serializer_class = serializers.RegisterSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {
                "user": serializers.RegisterSerializer(
                    user, context=self.get_serializer_context()
                ).data
            }
        )


class PostListCreateView(generics.ListCreateAPIView):
    permission_classes = (
        AllowAny,
        IsAuthenticated,
    )
    serializer_class = serializers.PostSerializer
    pagination_class = PageNumberPagination

    def get_queryset(self):
        rubric = self.request.query_params.get('rubric', None)
        sort_by = self.request.query_params.get('sort_by', '-created_at')
        queryset = models.Post.objects.all().order_by(sort_by)
        if rubric is not None and rubric != "all":
            queryset = queryset.filter(rubric=rubric)
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class PostDeleteView(generics.DestroyAPIView):
    permission_classes = (IsAuthenticated,)
    queryset = models.Post.objects.all()
    serializer_class = serializers.PostSerializer

    def delete(self, request, *args, **kwargs):
        post = get_object_or_404(models.Post, id=self.kwargs["pk"])
        user = request.user
        if post.user != user:
            return Response({"detail": "You do not have permission to delete this post"},
                            status=status.HTTP_403_FORBIDDEN)
        return self.destroy(request, *args, **kwargs)


class PostUpdateView(generics.UpdateAPIView):
    permission_classes = (IsAuthenticated,)
    queryset = models.Post.objects.all()
    serializer_class = serializers.PostSerializer

    def update(self, request, *args, **kwargs):
        post = get_object_or_404(models.Post, id=self.kwargs["pk"])
        user = request.user
        if post.user != user:
            return Response({"detail": "You do not have permission to update this post"},
                            status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)


class CommentCreateView(generics.CreateAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = serializers.CommentSerializer

    def perform_create(self, serializer):
        post = get_object_or_404(models.Post, id=self.kwargs["post_id"])
        serializer.save(user=self.request.user, post=post)


class CommentListView(generics.ListAPIView):
    serializer_class = serializers.CommentSerializer
    pagination_class = CommentPagination

    def get_queryset(self):
        post = get_object_or_404(models.Post, id=self.kwargs["post_id"])
        return post.comments.all().order_by('-created_at')


class CommentDeleteView(generics.DestroyAPIView):
    permission_classes = (IsAuthenticated,)
    queryset = models.Comment.objects.all()
    serializer_class = serializers.PostSerializer

    def delete(self, request, *args, **kwargs):
        post = get_object_or_404(models.Comment, id=self.kwargs["pk"])
        user = request.user
        if post.user != user:
            return Response({"detail": "You do not have permission to delete this post"},
                            status=status.HTTP_403_FORBIDDEN)
        return self.destroy(request, *args, **kwargs)


class PostReactionView(generics.UpdateAPIView):
    permission_classes = (IsAuthenticated,)
    queryset = models.Post.objects.all()
    serializer_class = serializers.PostSerializer

    def update(self, request, *args, **kwargs):
        post = self.get_object()
        user = request.user
        action = self.kwargs.get("action")
        if action == "like":
            if user in post.liked_by.all():
                return Response({"detail": "You have already liked this comment"}, status=status.HTTP_400_BAD_REQUEST)
            post.likes += 1
            post.liked_by.add(user)
            if user in post.disliked_by.all():
                post.dislikes -= 1
                post.disliked_by.remove(user)
        elif action == "dislike":
            if user in post.disliked_by.all():
                return Response({"detail": "You have already disliked this comment"},
                                status=status.HTTP_400_BAD_REQUEST)
            post.dislikes += 1
            post.disliked_by.add(user)
            if user in post.liked_by.all():
                post.likes -= 1
                post.liked_by.remove(user)
        else:
            return Response({"detail": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)
        post.save()
        return Response(self.get_serializer(post).data, status=status.HTTP_200_OK)
