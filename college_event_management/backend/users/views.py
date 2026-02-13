import os

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from .serializers import GoogleAuthSerializer, UserSerializer

# Google OAuth Configuration
GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID', 'YOUR_GOOGLE_CLIENT_ID_HERE')


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def register(self, request):
        """
        Register a new user with role selection.
        
        Expected payload:
        {
            "email": "user@example.com",
            "password": "securepassword123",
            "first_name": "John",
            "last_name": "Doe",
            "role": "participant"  # optional, defaults to 'participant', can be 'participant', 'organizer'
        }
        """
        try:
            email = request.data.get('email')
            password = request.data.get('password')
            first_name = request.data.get('first_name', '')
            last_name = request.data.get('last_name', '')
            role = request.data.get('role', 'participant')

            # Validation
            if not email or not password:
                return Response(
                    {"error": "Email and password are required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Validate role
            valid_roles = ['participant', 'organizer']
            if role not in valid_roles:
                return Response(
                    {"error": f"Invalid role. Must be one of: {', '.join(valid_roles)}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if len(password) < 6:
                return Response(
                    {"error": "Password must be at least 6 characters long"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Check if user already exists
            if User.objects.filter(email=email).exists():
                return Response(
                    {"error": "Email already registered"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Create new user with selected role
            user = User.objects.create_user(
                username=email,  # Use email as username
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
                role=role
            )

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)

            user_data = UserSerializer(user).data

            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': user_data,
                'message': 'Registration successful! You are now logged in.'
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {"error": f"Registration failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def login(self, request):
        """
        Login with email, password, and role.
        
        Expected payload:
        {
            "email": "participant@example.com",
            "password": "securepassword123",
            "role": "participant"  # optional, defaults to 'participant'
        }
        """
        try:
            email = request.data.get('email')
            password = request.data.get('password')
            role = request.data.get('role', 'participant')

            if not email or not password:
                return Response(
                    {"error": "Email and password are required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Get user
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return Response(
                    {"error": "Invalid email or password"},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            # Check password
            if not user.check_password(password):
                return Response(
                    {"error": "Invalid email or password"},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            # Verify role matches (for non-organizer users)
            if user.role != 'organizer' and user.role != role:
                return Response(
                    {"error": f"This account is not registered as a {role}. Please select the correct user type."},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            user_data = UserSerializer(user).data

            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': user_data,
                'message': 'Login successful'
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": f"Login failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def profile(self, request):
        user = request.user
        serializer = self.get_serializer(user)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def google_login(self, request):
        """
        Handle Google OAuth login.
        
        Expected payload:
        {
            "token": "google_id_token",
            "name": "User Full Name",
            "email": "user@example.com",
            "picture": "https://...",
            "branch": "cse"  // optional
        }
        """
        serializer = GoogleAuthSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"errors": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # For development: skip token verification if GOOGLE_CLIENT_ID not set
            # In production, verify the token with Google
            if GOOGLE_CLIENT_ID != 'YOUR_GOOGLE_CLIENT_ID_HERE':
                try:
                    # Token verification would be done here in production
                    # id_info = id_token.verify_oauth2_token(...)
                    pass
                except Exception as e:
                    return Response(
                        {"error": f"Token verification failed: {str(e)}"},
                        status=status.HTTP_401_UNAUTHORIZED
                    )
            
            # Create or update user
            user, created = serializer.create_or_update_user()
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            user_data = UserSerializer(user).data
            
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': user_data,
                'message': 'Google login successful'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"error": f"Google login failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def enrollments(self, request):
        """Get all participant enrollments (for organizer)"""
        if request.user.role != 'organizer':
            return Response(
                {"error": "Only organizers can access this endpoint"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get participant information 
        participants = User.objects.filter(role='participant').values(
            'id', 'email', 'first_name', 'last_name', 'branch', 'created_at'
        )
        return Response({
            'count': participants.count(),
            'participants': list(participants)
        })
