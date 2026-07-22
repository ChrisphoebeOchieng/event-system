import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import api from "../api/axios";
import AuthLayout from "../layouts/AuthLayout";

function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values) => {
    setServerError("");

    try {
      const response = await api.post("/auth/login", values);
      const { access_token, refresh_token, user } = response.data.data;

      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
      localStorage.setItem("user", JSON.stringify(user));

      const redirectPath = searchParams.get("redirect") || "/dashboard";
      const ticketId = searchParams.get("ticket");
      const quantity = searchParams.get("quantity");

      if (ticketId && quantity) {
        localStorage.setItem(
          "pending_booking",
          JSON.stringify({
            ticket_type_id: ticketId,
            quantity: Number(quantity),
          })
        );
      }

      navigate(redirectPath);
    } catch (error) {
      setServerError(
        error.response?.data?.message ||
          "We couldn't log you in. Please check your details and try again."
      );
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      description="Log in to manage bookings, tickets and events."
    >
      <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
        {serverError && (
          <div className="form-alert" role="alert">
            <AlertCircle size={18} />
            <span>{serverError}</span>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="email">Email address</label>

          <div className={`input-shell ${errors.email ? "input-error" : ""}`}>
            <Mail size={18} />

            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              {...register("email", {
                required: "Email address is required.",
              })}
            />
          </div>

          {errors.email && (
            <span className="field-error">{errors.email.message}</span>
          )}
        </div>

        <div className="form-group">
          <div className="label-row">
            <label htmlFor="password">Password</label>

            <Link to="/forgot-password" className="text-link">
              Forgot password?
            </Link>
          </div>

          <div className={`input-shell ${errors.password ? "input-error" : ""}`}>
            <LockKeyhole size={18} />

            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              autoComplete="current-password"
              {...register("password", {
                required: "Password is required.",
              })}
            />

            <button
              type="button"
              className="password-toggle"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((current) => !current)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {errors.password && (
            <span className="field-error">{errors.password.message}</span>
          )}
        </div>

        <button
          type="submit"
          className="button button-primary auth-submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Logging in..." : "Log in"}
          {!isSubmitting && <ArrowRight size={18} />}
        </button>
      </form>

      <p className="auth-switch">
        New to Event System? <Link to="/register">Create an account</Link>
      </p>
    </AuthLayout>
  );
}

export default Login;
