from django.urls import path
from . import views

urlpatterns = [
    path('flights/search/', views.FlightSearchView.as_view(), name='flight-search'),
    path('flights/<int:pk>/', views.FlightDetailView.as_view(), name='flight-detail'),
    path('bookings/', views.BookingCreateView.as_view(), name='booking-create'),
    path('bookings/my-trips/', views.UserBookingsView.as_view(), name='user-bookings'),
    path('bookings/<int:pk>/', views.BookingDetailView.as_view(), name='booking-detail'),
    path('admin/users/pending/', views.AdminPendingUsersView.as_view(), name='admin-pending-users'),
    path('admin/users/<int:pk>/approve/', views.AdminApproveUserView.as_view(), name='admin-approve-user'),
    path('admin/flights/', views.AdminFlightManagementView.as_view(), name='admin-flight-management'),
    path('admin/flights/<int:pk>/status/', views.AdminFlightStatusUpdateView.as_view(), name='admin-flight-status-update'),
    path('airports/', views.AirportListView.as_view(), name='airport-list'),
    path('all-flights/', views.AllFlightsView.as_view(), name='all-flights'),
    path('flights/<int:flight_id>/occupied-seats/', views.OccupiedSeatsView.as_view(), name='occupied-seats'),
]
