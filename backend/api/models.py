from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    username = models.CharField(max_length=32, unique=True)
    uuid = models.UUIDField(unique=True)


class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=128)
    rubric = models.CharField(max_length=64)
    likes = models.IntegerField(default=0, null=True, blank=True)
    dislikes = models.IntegerField(default=0, null=True, blank=True)
    liked_by = models.ManyToManyField(User, related_name="liked_comments", blank=True)
    disliked_by = models.ManyToManyField(User, related_name="disliked_comments", blank=True)
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, related_name="comments", on_delete=models.CASCADE)
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
