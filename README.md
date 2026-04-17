# Rocket Food Delivery

A cross-platform mobile food delivery app built with Expo and React Native. Supports two user roles — customers can browse restaurants and place orders, couriers can view and manage deliveries.

## Features

- **Dual-role auth** — A single account can have customer access, courier access, or both
- **Role selection** — Users with both roles choose which mode to enter on login
- **Customer flow** — Browse restaurants, filter by rating and price range, view menus, place orders with email/SMS notification options, view order history
- **Courier flow** — View active deliveries, update delivery status, view delivery history
- **Account pages** — Profile view for both customer and courier roles

## Tech Stack

**Mobile Client**
- Expo + React Native
- Expo Router (file-based routing)
- FontAwesome icons (`@fortawesome/react-native-fontawesome`)
- AsyncStorage for session persistence

**Server**
- Java Spring Boot
- Maven

## Project Structure

```
client/     Expo React Native app
server/     Spring Boot API (Maven)
```

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo`)
- Java 17+ (for the server)
- Maven (for the server)
- Expo Go app on a physical device, or an Android/iOS emulator

### Server Setup

```bash
cd server
./mvnw spring-boot:run
```

### Client Setup

```bash
cd client
npm install
```

Create `client/.env`:

```
EXPO_PUBLIC_API_URL=http://your-server-ip:8080
```

> Use your machine's local network IP (not `localhost`) when testing on a physical device.

```bash
npm start
```

Scan the QR code with Expo Go, or press `a` for Android emulator / `i` for iOS simulator.

## Try the App

This app is designed to run on a real mobile device via **Expo Go** (free on iOS and Android).

1. Install [Expo Go](https://expo.dev/go) on your phone
2. Scan the QR code below *(to be added after Expo publish)*
3. The app loads instantly — no install required

> The Spring Boot API is deployed on Render. Free-tier services spin down after inactivity — the first request may take 30–60 seconds.

**Demo credentials** — all three accounts use password `password`

| Email | Role |
|-------|------|
| `both@gmail.com` | Customer + Courier (dual-role) |
| `customer@gmail.com` | Customer only |
| `courier@gmail.com` | Courier only |

## Portfolio Updates vs. Original Assignments (Modules 13 & 14)

This project was originally built across two modules: Module 13 introduced the customer mobile app with a Spring Boot backend, and Module 14 added the Courier app, account management, dual-role login, and SMS/email order notifications. The following changes were made for portfolio deployment:

| Change | Why |
|--------|-----|
| Implemented **JWT token generation** in `JwtUtil` | `JwtUtil` was an empty stub — the server never generated tokens, so the client fell back to a hardcoded `"temp-token"` string |
| Implemented **JWT validation** in `JwtTokenFilter` | The filter passed every request through without checking — all endpoints were effectively public |
| Switched from `NoOpPasswordEncoder` to **BCryptPasswordEncoder** | Plaintext password storage is a baseline security requirement to fix before any public deployment |
| Added `@Autowired JwtUtil` to `AuthController` and set `accessToken` on the login response | The `AuthResponseSuccessDTO` had an `accessToken` field that was never populated |
| Locked down all routes except `/api/auth` in `SecurityConfig` | All API routes were `permitAll()` — authentication was declared but not enforced |
| Externalized all secrets and DB config to **environment variables** | DB credentials, JWT secret, and Twilio keys were hardcoded in `application.properties` |
| Fixed **CORS** to use `app.cors.allowed-origins` env var | `allowedOrigins("*")` accepted requests from any domain — appropriate for development, not production |
| Replaced dead ngrok URL in `client/.env` with `localhost:8080` | The dev `.env` pointed to a temporary tunnel URL that no longer resolves |
| Added `application.properties.example` and `client/.env.example` | No templates existed — contributors had no way to know what configuration was required |

## App Structure

```
app/
  index.js              Login screen
  selection.js          Role selection (customer vs. courier)
  customer/
    restaurant/
      list.js           Restaurant list with filters
      menu.js           Menu + order placement
    history.js          Order history
    account.js          Customer profile
  courier/
    deliveries.js       Active and past deliveries
    account.js          Courier profile
services/
  restaurantService.js  Restaurant API calls
  productService.js     Product/menu API calls
  orderService.js       Order creation and history
```