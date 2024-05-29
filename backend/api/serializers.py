from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
import uuid

from . import models


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.User
        fields = ('username', 'uuid')


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token["username"] = user.username
        return token


class RegisterSerializer(serializers.ModelSerializer):
    username = serializers.CharField(
        validators=[
            UniqueValidator(
                queryset=models.User.objects.all(),
                message="A user with this name already exists.",
            )
        ]
    )
    password = serializers.CharField(write_only=True, required=True)
    uuid = serializers.CharField(read_only=True, required=False)

    class Meta:
        model = models.User
        fields = ("id", "uuid", "password", "username")
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        user = models.User.objects.create_user(
            username=validated_data["username"],
            uuid=uuid.uuid4(),
            password=validated_data["password"],
        )
        user.save()
        return user

    def validate(self, attrs):
        return attrs


class PostSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()

    class Meta:
        model = models.Post
        fields = "__all__"
        read_only_fields = (
            "user", "created_at", "updated_at", "comments", "liked_by", "disliked_by", "likes", "dislikes")


class CommentSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = models.Comment
        fields = "__all__"
        read_only_fields = ("user", "created_at", "updated_at", "post")

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)
