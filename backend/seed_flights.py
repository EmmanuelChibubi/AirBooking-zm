import os
import django
from django.utils import timezone
from datetime import timedelta

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flight_booking.settings')
django.setup()

from flights.models import Flight

def seed_flights():
    if Flight.objects.count() > 0:
        print("Flights already exist. Skipping seeding.")
        return

    flights_data = [
        {
            "flight_number": "AB101",
            "departure_airport": "Lusaka International Airport (LUN)",
            "arrival_airport": "Copperbelt International Airport (NLA)",
            "departure_time": timezone.now() + timedelta(days=1, hours=10),
            "arrival_time": timezone.now() + timedelta(days=1, hours=11),
            "price": 1200.00,
            "available_seats": 150,
            "total_seats": 150,
            "status": "on_time"
        },
        {
            "flight_number": "AB102",
            "departure_airport": "Copperbelt International Airport (NLA)",
            "arrival_airport": "Lusaka International Airport (LUN)",
            "departure_time": timezone.now() + timedelta(days=2, hours=14),
            "arrival_time": timezone.now() + timedelta(days=2, hours=15),
            "price": 1150.00,
            "available_seats": 150,
            "total_seats": 150,
            "status": "on_time"
        },
        {
            "flight_number": "AB201",
            "departure_airport": "Lusaka International Airport (LUN)",
            "arrival_airport": "Livingstone (Harry Mwanga Nkumbula) (LVI)",
            "departure_time": timezone.now() + timedelta(days=1, hours=8),
            "arrival_time": timezone.now() + timedelta(days=1, hours=9),
            "price": 1500.00,
            "available_seats": 150,
            "total_seats": 150,
            "status": "on_time"
        },
        {
            "flight_number": "AB202",
            "departure_airport": "Livingstone (Harry Mwanga Nkumbula) (LVI)",
            "arrival_airport": "Lusaka International Airport (LUN)",
            "departure_time": timezone.now() + timedelta(days=3, hours=16),
            "arrival_time": timezone.now() + timedelta(days=3, hours=17),
            "price": 1450.00,
            "available_seats": 150,
            "total_seats": 150,
            "status": "on_time"
        },
        {
            "flight_number": "AB301",
            "departure_airport": "Mfuwe Airport (MFU)",
            "arrival_airport": "Lusaka International Airport (LUN)",
            "departure_time": timezone.now() + timedelta(days=5, hours=9),
            "arrival_time": timezone.now() + timedelta(days=5, hours=10, minutes=30),
            "price": 1800.00,
            "available_seats": 150,
            "total_seats": 150,
            "status": "on_time"
        }
    ]

    for data in flights_data:
        Flight.objects.create(**data)
    
    print(f"Successfully seeded {len(flights_data)} flights.")

if __name__ == "__main__":
    seed_flights()
