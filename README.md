🏡 Dwellio – Full Stack Accommodation Platform

Dwellio is a full-stack web application inspired by modern accommodation platforms. It enables users to explore, list, and reserve properties with a focus on real-world booking logic, scalability, and user experience.

🚀 Features
🔍 Property Discovery
Search and filter listings by categories like Trending, Mountains, Castles, Pools, Camping, Boats, Farms, Arctic Dunes
🗺️ Map Integration
Interactive location-based browsing using Mapbox
🏠 Listing Management
Users can create, edit, and manage property listings
Upload property images
📅 Advanced Reservation System
Multi-room booking support
Real-time availability calculation
Prevents overbooking using date-range logic
⚙️ Smart Booking Logic
If all rooms are booked for a date range → blocks further bookings
Displays availability dynamically
🔐 Authentication & Authorization
Secure login/signup using Passport.js
Session-based authentication
❤️ Wishlist Feature
Save favorite listings
⭐ Reviews & Ratings
Users can review and rate properties

🛠️ Tech Stack
Frontend:
HTML
CSS
JavaScript
Bootstrap
Backend:
Node.js
Express.js
Templating Engine:
EJS (Embedded JavaScript)
Database:
MongoDB
Mongoose 
Authentication & Sessions:
Passport.js (Local Strategy)
express-session:
connect-mongo (persistent session storage)

Other Integrations:
Mapbox API (maps & geolocation)
Multer + Cloudinary (image uploads)

🧠 Key Concepts Implemented
RESTful API design
MVC architecture
Middleware-based validation
Session management & authentication flow
Real-world booking system logic
Error handling using custom Express middleware
Data consistency for concurrent reservations
