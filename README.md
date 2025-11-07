# Autochek Backend Assessment

## Overview

A full-featured backend system designed to streamline AutoChek’s vehicle financing workflow - from authentication, vehicle listing, valuation requests, and loan applications, to dealer offers and loan approval.

**Problem Statement:**

Develop a backend API to support Autochek's vehicle valuation and financing services. The API should handle vehicle data ingestion, valuation model integration, and loan application processing.

---

## Project Description

This application is built with [NestJS](https://nestjs.com/), leveraging TypeORM for data persistence and SQLite for simplicity. The architecture is modular, with clear separation of concerns across resources (auth, users, dealers, customers, vehicles, valuations, offers).

### Flow of Operations

1. **Authentication**
   - Users (dealers, customers, admins) register and log in.
   - JWT-based authentication secures all endpoints.
   - Role-based access control restricts sensitive operations.

2. **Vehicle Ingestion**
   - Dealers can add vehicles to the platform via the `/vehicles` endpoints.
   - Each vehicle is associated with a dealer and includes details like make, model, year, and price.
   - Vehicles are initially marked as available: true.

3. **Valuation Request**
   - Dealers and Admins can request a valuation for any listed vehicle.
   - The system tries to fetch estimated value via the RapidAPI VIN Lookup.
   - If the external API fails, a local fallback valuation model is used.
   - The valuation is stored along with metadata (source(RAPIDAPI or SIMULATED), external response, estimated value).

4. **Loan Application**
   - Customers apply for loans on valued vehicles.
   - Eligibility scoring is performed based on customer profile and valuation.
   - Initial loan status is set to PENDING.
   - Loan applications are tracked and can be reviewed by admins.

5. **Offer Management**
   - Admins (the system) create offers for specific loans.
   - Offers are linked to loans and customers.
   - Each offer starts in PENDING state.
6. **Offer Response → Loan Approval → Vehicle Unavailability**
   - **_When a customer accepts an offer:_**  
     • Offer status → ACCEPTED.  
     • Loan status → APPROVED.  
     • Vehicle availability → false.  
     • All other offers for that loan → EXPIRED.
   - **_When a customer rejects an offer:_**.  
     • Offer status → REJECTED.

---

## Prerequisites & Local Setup

### Requirements

- Node.js v20.x or higher
- npm v9.x or higher
- (Optional) Docker & Docker Compose for containerized setup

### Installation

1. **Clone the repository:**

   ```bash
   git clone git@github.com:Timothy-py/Autochek.git
   cd Autochek
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Environment Configuration:**
   - Copy `.env.example` to `.env` and update values as needed.
   - Default configuration uses in-memory SQLite for development.

4. **Run the application:**

   ```bash
   npm run start:dev
   ```

   - The API will be available at `http://localhost:3000/api/v1`.
   - Swagger documentation: `http://localhost:3000/docs`

---

## Running with Docker Compose

1. **Build and start containers:**

   ```bash
   docker compose up --build
   ```

   - This will build the NestJS app and start it in a container.
   - The app will be accessible at `http://localhost:3000/docs`.

2. **Environment Variables:**
   - You can override environment variables by editing the `.env` file or passing them via `docker-compose.yml`.

3. **Stopping containers:**
   ```bash
   docker compose down
   ```

---

## Seeded Data

On startup, the application automatically seeds the following data for quick interaction with the api.

- **Admin:**
  - admin@autocheck.com / password123
- **Dealer:**
  - dealer@autocheck.com / password123
- **Customer:**
  - customer@autocheck.com / password123
- **Vehicles:**
  - Five demo vehicles belonging to the seeded dealer are created automatically, each with:  
    • available = true.  
    • Distinct VINs.  
    • Linked to the dealer.  
    and the first vehicle has a valid VIN that can fetch a valid valuation response from RAPIDAPI.

---

## Testing

This project includes unit and integration tests powered by Jest.

- **Run all tests:**

  ```bash
  npm run test
  ```

- **Test coverage:**

  ```bash
  npm run test:cov
  ```

  **Example Tests Included:**
  - Offer Acceptance → Loan Approval → Vehicle Unavailability.  
    • Ensures accepting an offer updates:  
    • Offer status → ACCEPTED.  
    • Loan status → APPROVED.  
    • Vehicle availability → false.
  - Valuation Request.  
    • Tests both external API call and fallback valuation logic.

---

## Architecture Highlights

- Global HTTP Module: Enables centralized HTTP service injection for external API calls.
- Dependency Injection: All modules follow NestJS DI patterns for easy testing and extensibility.
- Error Handling: Consistent use of NestJS HttpException subclasses (NotFoundException, ForbiddenException, etc.).
- DTO Validation: Ensures all inputs are validated using class-validator and class-transformer.
- Logger Integration: Provides detailed logs for service interactions and failures.

---

## 🚀 Future Improvements

- Integrate PostgreSQL for production-grade persistence.
- Implement rate-limiting and caching for external valuation API calls.
- Implement a robust, business-oriented loan eligibilty scoring for customers.
- Implement a centralized audit log module to track key activities in the system.

## Contact & Support

For questions, issues, or contributions, please open an issue on the [GitHub repository](https://github.com/Timothy-py/Autochek).

---
