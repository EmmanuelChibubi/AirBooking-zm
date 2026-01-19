from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from .models import Flight, Booking
from users.models import User
from django.core import mail

class FlightAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpassword', email='test@example.com', approval_status='approved')
        self.client = APIClient()
        
        # Get JWT token
        response = self.client.post(reverse('token_obtain_pair'), {'username': 'testuser', 'password': 'testpassword'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        self.unauthenticated_client = APIClient()

        self.flight1 = Flight.objects.create(
            flight_number='AA100',
            departure_airport='JFK',
            arrival_airport='LAX',
            departure_time='2026-01-20T10:00:00Z',
            arrival_time='2026-01-20T13:00:00Z',
            price=300.00,
            available_seats=1
        )
        self.flight2 = Flight.objects.create(
            flight_number='UA200',
            departure_airport='LAX',
            arrival_airport='ORD',
            departure_time='2026-01-21T15:00:00Z',
            arrival_time='2026-01-21T19:00:00Z',
            price=250.00,
            available_seats=100
        )
        self.flight3 = Flight.objects.create(
            flight_number='DL300',
            departure_airport='JFK',
            arrival_airport='MIA',
            departure_time='2026-01-22T08:00:00Z',
            arrival_time='2026-01-22T11:00:00Z',
            price=200.00,
            available_seats=0
        )

    def test_airport_list_view(self):
        url = reverse('airport-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 4)
        self.assertEqual(response.data, ['JFK', 'LAX', 'MIA', 'ORD'])

    def test_all_flights_view(self):
        url = reverse('all-flights')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)

    def test_flight_search_view_unauthenticated(self):
        url = reverse('flight-search')
        response = self.unauthenticated_client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_flight_search_view_authenticated(self):
        url = reverse('flight-search')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_flight_search_by_departure_airport(self):
        url = reverse('flight-search')
        response = self.client.get(url, {'departure_airport': 'JFK'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_flight_search_by_arrival_airport(self):
        url = reverse('flight-search')
        response = self.client.get(url, {'arrival_airport': 'LAX'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_flight_search_by_departure_date(self):
        url = reverse('flight-search')
        response = self.client.get(url, {'departure_date': '2026-01-20'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_successful_booking(self):
        url = reverse('booking-create')
        response = self.client.post(url, {'flight_id': self.flight1.id, 'seats_reserved': ['1A']}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.flight1.refresh_from_db()
        self.assertEqual(self.flight1.available_seats, 0)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].subject, 'Your Flight Booking Confirmation')
        self.assertEqual(mail.outbox[0].to, ['test@example.com'])

    def test_unsuccessful_booking_zero_seats(self):
        url = reverse('booking-create')
        response = self.client.post(url, {'flight_id': self.flight3.id, 'seats_reserved': ['1A']}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.flight3.refresh_from_db()
        self.assertEqual(self.flight3.available_seats, 0)
        self.assertEqual(len(mail.outbox), 0)

    def test_successful_booking_with_seat_selection(self):
        url = reverse('booking-create')
        seats_to_reserve = ['1A', '1B']
        response = self.client.post(url, {'flight_id': self.flight2.id, 'seats_reserved': seats_to_reserve}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.flight2.refresh_from_db()
        self.assertEqual(self.flight2.available_seats, 98)
        booking = Booking.objects.get(id=response.data['id'])
        self.assertEqual(booking.seats_reserved, seats_to_reserve)

    def test_unsuccessful_booking_not_enough_seats(self):
        url = reverse('booking-create')
        seats_to_reserve = ['1A', '1B', '1C']
        # Clear the outbox before this test
        mail.outbox = []
        response = self.client.post(url, {'flight_id': self.flight1.id, 'seats_reserved': seats_to_reserve}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.flight1.refresh_from_db()
        self.assertEqual(self.flight1.available_seats, 1)
        self.assertEqual(len(mail.outbox), 0)

    def test_user_bookings_view(self):
        # Create a booking for the user
        Booking.objects.create(user=self.user, flight=self.flight1, seats_reserved=['1A'])
        url = reverse('user-bookings')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        booking_data = response.data[0]
        self.assertEqual(booking_data['flight']['flight_number'], self.flight1.flight_number)
        self.assertEqual(booking_data['seats_reserved'], ['1A'])

    def test_flight_search_by_min_price(self):
        url = reverse('flight-search')
        response = self.client.get(url, {'min_price': 250})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertIn('AA100', [f['flight_number'] for f in response.data])
        self.assertIn('UA200', [f['flight_number'] for f in response.data])

    def test_flight_search_by_max_price(self):
        url = reverse('flight-search')
        response = self.client.get(url, {'max_price': 250})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertIn('UA200', [f['flight_number'] for f in response.data])
        self.assertIn('DL300', [f['flight_number'] for f in response.data])

    def test_flight_search_by_min_max_price(self):
        url = reverse('flight-search')
        response = self.client.get(url, {'min_price': 200, 'max_price': 250})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertIn('UA200', [f['flight_number'] for f in response.data])
        self.assertIn('DL300', [f['flight_number'] for f in response.data])

    def test_flight_search_by_start_date(self):
        url = reverse('flight-search')
        response = self.client.get(url, {'start_date': '2026-01-21'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertIn('UA200', [f['flight_number'] for f in response.data])
        self.assertIn('DL300', [f['flight_number'] for f in response.data])

    def test_flight_search_by_end_date(self):
        url = reverse('flight-search')
        response = self.client.get(url, {'end_date': '2026-01-21'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertIn('AA100', [f['flight_number'] for f in response.data])
        self.assertIn('UA200', [f['flight_number'] for f in response.data])

    def test_flight_search_by_start_end_date(self):
        url = reverse('flight-search')
        response = self.client.get(url, {'start_date': '2026-01-20', 'end_date': '2026-01-21'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertIn('AA100', [f['flight_number'] for f in response.data])
        self.assertIn('UA200', [f['flight_number'] for f in response.data])
