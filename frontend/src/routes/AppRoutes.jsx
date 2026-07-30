import { BrowserRouter, Route, Routes } from "react-router-dom";

import ProtectedRoute from "../components/ProtectedRoute";
import Checkout from "../pages/Checkout";
import CreateEvent from "../pages/CreateEvent";
import CreateTicketTypes from "../pages/CreateTicketTypes";
import Dashboard from "../pages/Dashboard";
import EditEvent from "../pages/EditEvent";
import EventDetails from "../pages/EventDetails";
import Events from "../pages/Events";
import Home from "../pages/Home";
import Login from "../pages/Login";
import MyEvents from "../pages/MyEvents";
import Register from "../pages/Register";
import Unauthorized from "../pages/Unauthorized";

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
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["organizer", "admin"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/events"
          element={
            <ProtectedRoute allowedRoles={["organizer", "admin"]}>
              <MyEvents />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/events/create"
          element={
            <ProtectedRoute allowedRoles={["organizer", "admin"]}>
              <CreateEvent />
            </ProtectedRoute>
          }
        />


        <Route
          path="/dashboard/events/:eventId/edit"
          element={
            <ProtectedRoute allowedRoles={["organizer", "admin"]}>
              <EditEvent />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/events/:eventId/tickets"
          element={
            <ProtectedRoute allowedRoles={["organizer", "admin"]}>
              <CreateTicketTypes />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
