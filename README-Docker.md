# Docker Setup for Business Operating System

This project contains a Laravel backend and React frontend configured to run with Docker.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose

## Quick Start

1. Clone the repository and navigate to the project root

2. Build and start all services:
```bash
docker-compose up --build
```

3. The services will be available at:
- Frontend (React): http://localhost:3000
- Backend (Laravel): http://localhost:8000
- MySQL Database: localhost:3307

## Services

### Frontend (React)
- Port: 3000
- Hot reload enabled for development
- Environment variable `REACT_APP_API_URL` points to backend

### Backend (Laravel)
- Port: 8000
- Automatically runs migrations on startup
- Connected to MySQL database
- Environment variables configured for Docker

### Database (MySQL)
- Port: 3307 (mapped from container port 3306)
- Database: `laravel`
- Username: `laravel`
- Password: `password`
- Root password: `root`

## Development

To stop the containers:
```bash
docker-compose down
```

To rebuild after changes:
```bash
docker-compose up --build
```

To view logs:
```bash
docker-compose logs [service_name]
```

## Database Access

You can connect to the MySQL database using any MySQL client with the credentials above, or use:
```bash
docker-compose exec mysql mysql -u laravel -p laravel
``` 