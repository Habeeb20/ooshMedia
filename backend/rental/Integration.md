# Wiring the rental system into your existing Estores backend

## 1. Install what's new
```
npm install socket.io swagger-jsdoc swagger-ui-express
```
(`jsonwebtoken` and `mongoose` you already have.)

## 2. Environment variables
```
PAYSTACK_SECRET_KEY=sk_...
JWT_SECRET=your_existing_jwt_secret
API_BASE_URL=https://your-domain.com
```

## 3. File placement
Drop these into your existing project structure (adjust import paths if your
folders are named differently):

```
models/Category.js
models/RentalItem.js
models/RentalBooking.js
models/Review.js
controllers/categoryController.js
controllers/rentalItemController.js
controllers/rentalBookingController.js
controllers/videoSubscriptionController.js
routes/categoryRoutes.js
routes/rentalItemRoutes.js
routes/rentalBookingRoutes.js
routes/videoSubscriptionRoutes.js
sockets/socket.js
utils/paystack.js
swagger.js
```

`../middleware/auth.js` is referenced by the route files as `protect` (attaches
`req.user` from your existing JWT) and `restrictTo(role)` (used for admin-only
category management). Point these at whatever your current auth middleware is
called — I didn't reinvent it since you already have a working User/auth setup.

## 4. Server entry point (e.g. server.js / app.js)

```js
import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger.js';
import { initSocket } from './sockets/socket.js';

import categoryRoutes from './routes/categoryRoutes.js';
import rentalItemRoutes from './routes/rentalItemRoutes.js';
import rentalBookingRoutes from './routes/rentalBookingRoutes.js';
import videoSubscriptionRoutes from './routes/videoSubscriptionRoutes.js';

const app = express();
app.use(express.json());

// ... your existing routes/middleware ...

app.use('/api/rentals/categories', categoryRoutes);
app.use('/api/rentals/items', rentalItemRoutes);
app.use('/api/rentals', rentalBookingRoutes); // booking/payment/return/extend/review routes are nested under /api/rentals
app.use('/api/rentals/video-subscription', videoSubscriptionRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const server = http.createServer(app);
initSocket(server); // must run on the same HTTP server instance

mongoose.connect(process.env.MONGO_URI).then(() => {
  server.listen(process.env.PORT || 5000, () =>
    console.log(`Server running — Swagger docs at /api-docs`)
  );
});
```

Swagger UI will be live at `GET /api-docs`, generated straight from the
`@swagger` JSDoc comments already in the route files — no separate spec file
to keep in sync by hand. Add new endpoints by adding a new `@swagger` block
above the route.

## 5. Frontend responsibilities (not built here, per your instructions)
- Upload images/videos directly to Cloudinary from the client, then send only
  `{ url, publicId }` pairs to `POST /api/rentals/items`.
- Connect Socket.IO with the user's JWT:
  ```js
  import { io } from 'socket.io-client';
  const socket = io(API_URL, { auth: { token: userJwt } });
  socket.on('rental:new_request', (payload) => { /* alert the owner */ });
  socket.on('rental:booking_confirmed', (payload) => { /* alert the renter */ });
  socket.on('rental:item_collected', (payload) => { /* ... */ });
  socket.on('rental:return_requested', (payload) => { /* ... */ });
  socket.on('rental:completed', (payload) => { /* ... */ });
  socket.on('rental:extended', (payload) => { /* ... */ });
  socket.on('rental:availability_changed', (payload) => { /* refresh calendar if viewing that item */ });
  ```
- After Paystack redirects back (or via your Paystack webhook route), call
  `GET /api/rentals/bookings/verify/:reference` (and the equivalent for
  extensions/video subscription) to finalize the transaction server-side.

## 6. Booking status flow (for reference)
```
pending_payment -> confirmed -> item_collected -> return_requested -> completed
                       |                                                 ^
                       └────────────────── (owner confirms directly) ────┘
                       |
                    cancelled  (only allowed from pending_payment or confirmed)
```

## 7. Design notes worth knowing
- **Availability**: an item's `bookedRanges` only gets a real entry once
  payment is verified (`confirmed`), so unpaid requests never block dates.
  The range is removed the moment a booking reaches `completed`, so the item
  becomes bookable again immediately after return is confirmed.
- **Extensions**: charged at the same per-unit rate the booking was made at,
  for the extra time only. The extension checks that nobody else has already
  booked the gap before charging, and on successful payment simply pushes the
  existing `bookedRanges` entry's `to` date forward.
- **Videos**: gated by `user.videoSubscription.creditsRemaining`, which is
  the same field already on your User schema — this reuses it rather than
  creating a parallel credit system.
- **Reviews**: one `renter_to_owner` and one `owner_to_renter` review per
  booking (enforced by a unique index), so both sides always get exactly one
  say per rental. The item's `ratingAverage`/`ratingCount` are recalculated
  from `renter_to_owner` reviews whenever a new one comes in.