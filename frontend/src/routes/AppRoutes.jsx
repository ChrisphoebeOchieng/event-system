import { BrowserRouter, Route, Routes } from "react-router-dom";

import ProtectedRoute from "../components/ProtectedRoute";
import AdminRefunds from "../pages/AdminRefunds";
import AdminVendors from "../pages/AdminVendors";
import Checkout from "../pages/Checkout";
import CreateEvent from "../pages/CreateEvent";
import CreateTicketTypes from "../pages/CreateTicketTypes";
import Dashboard from "../pages/Dashboard";
import EditEvent from "../pages/EditEvent";
import EventDetails from "../pages/EventDetails";
import Events from "../pages/Events";
import Home from "../pages/Home";
import Login from "../pages/Login";
import MyBookings from "../pages/MyBookings";
import MyEvents from "../pages/MyEvents";
import MyRefunds from "../pages/MyRefunds";
import Register from "../pages/Register";
import Unauthorized from "../pages/Unauthorized";
import VendorDashboard from "../pages/VendorDashboard";

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
          path="/bookings"
          element={
            <ProtectedRoute
              allowedRoles={["attendee", "organizer", "vendor", "admin"]}
            >
              <MyBookings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/refunds"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminRefunds />
            </ProtectedRoute>
          }
        />

        <Route
          path="/refunds"
          element={
            <ProtectedRoute
              allowedRoles={["attendee", "organizer", "vendor", "admin"]}
            >
              <MyRefunds />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/vendors"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminVendors />
            </ProtectedRoute>
          }
        />

        <Route
          path="/vendor"
          element={
            <ProtectedRoute allowedRoles={["vendor", "admin"]}>
              <VendorDashboard />
            </ProtectedRoute>
          }
        />

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
