from django.db import models
from django.conf import settings
from django.utils import timezone

class Flight(models.Model):
    flight_number = models.CharField(max_length=10)
    departure_airport = models.CharField(max_length=100)
    arrival_airport = models.CharField(max_length=100)
    departure_time = models.DateTimeField()
    arrival_time = models.DateTimeField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    available_seats = models.PositiveIntegerField()
    total_seats = models.PositiveIntegerField(default=150) # Assuming a default of 150 for existing flights
    STATUS_CHOICES = [
        ('on_time', 'On Time'),
        ('delayed', 'Delayed'),
        ('cancelled', 'Cancelled'),
    ]
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='on_time',
    )

    def __str__(self):
        return self.flight_number

class Booking(models.Model):
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
    ]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    flight = models.ForeignKey(Flight, on_delete=models.CASCADE)
    booking_time = models.DateTimeField(default=timezone.now)
    seats_reserved = models.JSONField(default=list)
    payment_status = models.CharField(
        max_length=10,
        choices=PAYMENT_STATUS_CHOICES,
        default='pending',
    )

    def __str__(self):
        return f'{self.user} - {self.flight}'
