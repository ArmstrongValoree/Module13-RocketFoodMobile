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