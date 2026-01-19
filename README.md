# AirBooking-zm

This project is a flight booking application with a Django backend and a React frontend.

## Prerequisites

Before running this application, make sure you have the following installed:
- **Python 3.8+** - [Download Python](https://www.python.org/downloads/)
- **Node.js 14+** and **npm** - [Download Node.js](https://nodejs.org/)
- **Git** - [Download Git](https://git-scm.com/)

## Project Structure

```
AirBooking-zm/
├── backend/          # Django REST API
│   ├── manage.py
│   ├── requirements.txt
│   └── ...
├── frontend/         # React application
│   ├── package.json
│   ├── src/
│   └── ...
└── README.md
```

## Setup Instructions

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment:**
   
   On Windows:
   ```bash
   python -m venv venv
   ```
   
   On macOS and Linux:
   ```bash
   python3 -m venv venv
   ```

3. **Activate the virtual environment:**
   
   On Windows:
   ```bash
   venv\Scripts\activate
   ```
   
   On macOS and Linux:
   ```bash
   source venv/bin/activate
   ```

4. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Run database migrations:**
   ```bash
   python manage.py migrate
   ```

6. **(Optional) Create a superuser for admin access:**
   ```bash
   python manage.py createsuperuser
   ```

7. **Start the Django development server:**
   ```bash
   python manage.py runserver
   ```
   
   The backend server will be running on `http://127.0.0.1:8000/`

### Frontend Setup

1. **Open a new terminal and navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install npm dependencies:**
   ```bash
   npm install
   ```

3. **Start the React development server:**
   ```bash
   npm start
   ```
   
   The frontend development server will be running on `http://localhost:3000/`

## Running the Application

1. Make sure the **backend server** is running on `http://127.0.0.1:8000/`
2. Make sure the **frontend server** is running on `http://localhost:3000/`
3. Open your browser and navigate to `http://localhost:3000/`

## API Endpoints

The backend provides the following main API endpoints:

- `/api/flights/` - List and search flights
- `/api/bookings/` - Manage flight bookings
- `/api/airports/` - Get available airports
- `/api/auth/` - User authentication

## Troubleshooting

### Backend Issues

- **ModuleNotFoundError**: Make sure you've activated the virtual environment and installed all dependencies
- **Database errors**: Try running `python manage.py migrate` again
- **Port already in use**: Stop any other processes using port 8000 or specify a different port: `python manage.py runserver 8001`

### Frontend Issues

- **npm install fails**: Try deleting `node_modules` and `package-lock.json`, then run `npm install` again
- **Port already in use**: The app will prompt you to use a different port (usually 3001)
- **API connection errors**: Ensure the backend server is running on `http://127.0.0.1:8000/`

## Contributing

1. Fork the repository
2. Create a new branch for your feature
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.