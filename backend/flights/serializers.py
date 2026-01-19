from rest_framework import serializers
from .models import Flight, Booking

class FlightSerializer(serializers.ModelSerializer):
    class Meta:
        model = Flight
        fields = '__all__'

class BookingSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    flight = FlightSerializer(read_only=True)
    booking_time = serializers.ReadOnlyField()
    flight_id = serializers.PrimaryKeyRelatedField(queryset=Flight.objects.all(), write_only=True, source='flight')

    class Meta:
        model = Booking
        fields = ['id', 'user', 'flight', 'flight_id', 'booking_time', 'payment_status', 'seats_reserved']


