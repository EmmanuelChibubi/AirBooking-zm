from rest_framework import generics, permissions, status
from rest_framework.exceptions import NotAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Flight, Booking
from users.models import User
from .serializers import FlightSerializer, BookingSerializer
from users.serializers import UserSerializer
from django.core.mail import send_mail
from django.conf import settings

class AirportListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        departure_airports = Flight.objects.values_list('departure_airport', flat=True).distinct()
        arrival_airports = Flight.objects.values_list('arrival_airport', flat=True).distinct()
        airports = sorted(list(set(list(departure_airports) + list(arrival_airports))))
        return Response(airports)

class AllFlightsView(generics.ListAPIView):
    queryset = Flight.objects.all()
    serializer_class = FlightSerializer
    permission_classes = [permissions.AllowAny]

class FlightSearchView(generics.ListAPIView):
    serializer_class = FlightSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Flight.objects.all()
        departure_airport = self.request.query_params.get('departure_airport')
        arrival_airport = self.request.query_params.get('arrival_airport')
        departure_date = self.request.query_params.get('departure_date')
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')

        if departure_airport:
            queryset = queryset.filter(departure_airport__icontains=departure_airport)
        if arrival_airport:
            queryset = queryset.filter(arrival_airport__icontains=arrival_airport)
        if departure_date:
            queryset = queryset.filter(departure_time__date=departure_date)
        
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        if start_date:
            queryset = queryset.filter(departure_time__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(departure_time__date__lte=end_date)
            
        return queryset

class FlightDetailView(generics.RetrieveAPIView):
    queryset = Flight.objects.all()
    serializer_class = FlightSerializer
    permission_classes = [permissions.IsAuthenticated]

class BookingCreateView(generics.CreateAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        flight = serializer.validated_data['flight']
        seats_reserved = serializer.validated_data.get('seats_reserved', [])
        num_seats_reserved = len(seats_reserved)

        if flight.available_seats >= num_seats_reserved:
            flight.available_seats -= num_seats_reserved
            flight.save()
            booking = serializer.save(user=self.request.user)
            
            # Send booking confirmation email
            subject = 'Your Flight Booking Confirmation'
            message = f"""
            Dear {booking.user.username},

            Your flight booking has been confirmed.

            Booking Details:
            Flight Number: {booking.flight.flight_number}
            Departure Airport: {booking.flight.departure_airport}
            Arrival Airport: {booking.flight.arrival_airport}
            Departure Time: {booking.flight.departure_time}
            Seats Reserved: {", ".join(seats_reserved)}

            Thank you for booking with us.

            Best regards,
            The AirBooking Team
            """
            from_email = settings.DEFAULT_FROM_EMAIL
            recipient_list = [booking.user.email]
            send_mail(subject, message, from_email, recipient_list)
            
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        else:
            return Response({'error': 'Not enough available seats on this flight.'}, status=status.HTTP_400_BAD_REQUEST)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class UserBookingsView(generics.ListAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user)

class BookingDetailView(generics.RetrieveAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

class AdminPendingUsersView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        return User.objects.filter(approval_status='pending')

class AdminApproveUserView(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

    def perform_update(self, serializer):
        user = serializer.instance
        if user.approval_status != 'approved':
            user.approval_status = 'approved'
            serializer.save()
            # Synchronous email sending
            subject = 'Your AirBooking Account Has Been Approved!'
            message = f'Dear {user.username},\n\nYour account on AirBooking has been approved. You can now log in and start booking flights!\n\nBest regards,\nThe AirBooking Team'
            from_email = settings.DEFAULT_FROM_EMAIL
            recipient_list = [user.email]
            try:
                send_mail(subject, message, from_email, recipient_list)
                print(f"Approval email sent synchronously to {user.email}")
            except Exception as e:
                print(f"Failed to send approval email to {user.email}: {e}")
        else:
            serializer.save()

class AdminFlightManagementView(generics.ListCreateAPIView):
    queryset = Flight.objects.all()
    serializer_class = FlightSerializer
    permission_classes = [permissions.IsAdminUser]

class AdminFlightStatusUpdateView(generics.UpdateAPIView):
    queryset = Flight.objects.all()
    serializer_class = FlightSerializer
    permission_classes = [permissions.IsAdminUser]

class OccupiedSeatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, flight_id, *args, **kwargs):
        occupied_seats = []
        bookings = Booking.objects.filter(flight_id=flight_id)
        for booking in bookings:
            if booking.seats_reserved:
                occupied_seats.extend(booking.seats_reserved)
        # Return unique occupied seats
        return Response(list(set(occupied_seats)))

