import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '../AuthContext';
import Flights from './Flights';

jest.mock('axios');

const mockAirports = ['JFK', 'LAX', 'MIA', 'ORD'];
const mockFlights = [
    {
        id: 1,
        flight_number: 'AA100',
        departure_airport: 'JFK',
        arrival_airport: 'LAX',
        departure_time: '2026-01-20T10:00:00Z',
        arrival_time: '2026-01-20T13:00:00Z',
        price: 300.00,
        available_seats: 150,
        status: 'on_time',
    },
];

const renderComponent = () => {
    return render(
        <Router>
            <AuthProvider>
                <Flights />
            </AuthProvider>
        </Router>
    );
};

describe('Flights Component', () => {
    beforeEach(() => {
        axios.get.mockImplementation((url) => {
            if (url.includes('/api/airports/')) {
                return Promise.resolve({ data: mockAirports });
            }
            if (url.includes('/api/all-flights/')) {
                return Promise.resolve({ data: mockFlights });
            }
            if (url.includes('/api/flights/search/')) {
                return Promise.resolve({ data: mockFlights });
            }
            return Promise.reject(new Error('not found'));
        });
        localStorage.setItem('access_token', 'test_token');
    });

    afterEach(() => {
        jest.clearAllMocks();
        localStorage.removeItem('access_token');
    });

    test('renders the component and search form', () => {
        renderComponent();
        expect(screen.getByText('Search Flights')).toBeInTheDocument();
        expect(screen.getByLabelText('Departure Airport')).toBeInTheDocument();
        expect(screen.getByLabelText('Arrival Airport')).toBeInTheDocument();
        expect(screen.getByLabelText('Flight')).toBeInTheDocument();
        expect(screen.getByLabelText('Departure Date')).toBeInTheDocument();
    });

    test('populates the airport and flight dropdowns', async () => {
        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('JFK')).toBeInTheDocument();
            expect(screen.getByText('LAX')).toBeInTheDocument();
            expect(screen.getByText('MIA')).toBeInTheDocument();
            expect(screen.getByText('ORD')).toBeInTheDocument();
            expect(screen.getByText('AA100: JFK to LAX')).toBeInTheDocument();
        });
    });

    test('searches for flights and displays the results', async () => {
        renderComponent();

        fireEvent.change(screen.getByLabelText('Departure Airport'), { target: { value: 'JFK' } });
        fireEvent.change(screen.getByLabelText('Arrival Airport'), { target: { value: 'LAX' } });
        fireEvent.click(screen.getByText('Search Flights'));

        await waitFor(() => {
            expect(screen.getByText('AA100: JFK to LAX')).toBeInTheDocument();
            expect(screen.getByText('Depart: 2026-01-20 10:00')).toBeInTheDocument();
            expect(screen.getByText('Arrive: 2026-01-20 13:00')).toBeInTheDocument();
            expect(screen.getByText('Price: $300')).toBeInTheDocument();
            expect(screen.getByText('Available Seats: 150')).toBeInTheDocument();
            expect(screen.getByText('Status: ON TIME')).toBeInTheDocument();
            expect(screen.getByText('Book Now')).toBeInTheDocument();
        });
    });

    test('displays a message when no flights are found', async () => {
        axios.get.mockImplementation((url) => {
            if (url.includes('/api/flights/search/')) {
                return Promise.resolve({ data: [] });
            }
            return Promise.resolve({ data: {} });
        });

        renderComponent();

        fireEvent.click(screen.getByText('Search Flights'));

        await waitFor(() => {
            expect(screen.getByText('No flights found for your search criteria.')).toBeInTheDocument();
        });
    });
});
