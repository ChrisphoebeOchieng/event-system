import { BrowserRouter, Route, Routes } from "react-router-dom";

import Checkout from "../pages/Checkout";
import CreateEvent from "../pages/CreateEvent";
import CreateTicketTypes from "../pages/CreateTicketTypes";
import Dashboard from "../pages/Dashboard";
import EventDetails from "../pages/EventDetails";
import Events from "../pages/Events";
import Home from "../pages/Home";
import MyEvents from "../pages/MyEvents";
import Login from "../pages/Login";
import Register from "../pages/Register";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:eventId" element={<EventDetails />} />
        <Route path="/checkout/:bookingId" element={<Checkout />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
<Route path="/dashboard/events" element={<MyEvents />} />
        <Route
          path="/dashboard/events/create"
          element={<CreateEvent />}
        />
        <Route
          path="/dashboard/events/:eventId/tickets"
          element={<CreateTicketTypes />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
