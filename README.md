# Rocket Food Delivery - Mobile Application

## Student Information

**Name:** Valoree Armstrong
**Module:** 13 - Mobile Development 1
**Project:** React Native Food Delivery App

---

## Background Research

### 1. Native vs Cross-Platform Mobile Applications

**Native Mobile Applications:**
A native mobile application is built specifically for one operating system, like iOS or Android. Developers use languages such as Swift or Kotlin to create these apps. Native apps usually run faster, feel smoother, and have full access to phone features like the camera and GPS. However, they cost more and take longer to build because you must create a separate app for each platform.

**Cross-Platform Mobile Applications:**
A cross-platform mobile application is built once and works on both iOS and Android using frameworks like React Native or Flutter. These apps are cheaper and faster to develop because one codebase is shared across platforms. They are great for startups and small teams. However, they may not perform quite as smoothly as native apps and sometimes need extra work to access advanced device features.

---

### 2. React vs React Native

**React:**
React is a JavaScript library used to build user interfaces, especially for websites. Developers use React to build fast, interactive web applications by creating reusable components (small pieces of UI). It is mainly used for building web apps that run in a browser.

**React Native:**
React Native is a framework that allows developers to build real mobile apps for iOS and Android using JavaScript. With React Native, you write JavaScript, but it builds actual native mobile components instead of web pages. It is used for building mobile applications, not websites.

**Key Differences:**
The first key difference is the platform they are built for. React is used to build web applications that run inside a browser, while React Native is used to build mobile applications that run directly on iOS and Android devices.

The second difference is the UI elements they use. React uses HTML elements like `<div>` and `<h1>` to build web pages. React Native does not use HTML. Instead, it uses mobile-specific components like `<View>` and `<Text>` that are translated into real native mobile interface elements.

The third difference is how they render content. React renders content to the browser's DOM (Document Object Model). React Native does not use the DOM. Instead, it connects to native mobile APIs and renders real mobile UI components on the device.

The fourth difference is styling. React uses regular CSS files to style web pages. React Native does not use traditional CSS. Instead, it uses JavaScript objects to style components directly within the app.

---

### 3. Wireframe Analysis & API Planning

**App Functionalities:**

1. **Authentication/Login**
   - Required API: POST /api/auth/login
   - Purpose: User authentication and JWT token retrieval

2. **Restaurant List**
   - Required API: GET /api/restaurants
   - Purpose: Fetch all restaurants with ratings and prices
   - Filtering: Client-side filtering by rating and price

3. **Restaurant Menu**
   - Required API: GET /api/restaurants/{id}/menu
   - Purpose: Fetch menu items for selected restaurant

4. **Create Order**
   - Required API: POST /api/orders
   - Purpose: Submit new order with selected menu items

5. **Order History**
   - Required API: GET /api/orders/user/{userId}
   - Purpose: Fetch all orders for logged-in user

6. **Order Details**
   - Required API: GET /api/orders/{orderId}
   - Purpose: Fetch detailed information for specific order

---

## Environment Setup

### Technologies Used

- React Native
- Expo Platform
- React Navigation
- React Native AsyncStorage
- React Bootstrap
- Font Awesome Icons

### Installation Instructions

[Will be added after project setup]

---

## Project Structure

[Will be updated as project develops]
