import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

import api from "../api/axios";
import AuthLayout from "../layouts/AuthLayout";

function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      first_name: "",
      last_name: "",
      username: "",
      email: "",
      password: "",
      confirm_password: "",
      role: "attendee",
    },
  });

  const password = watch("password");

  const onSubmit = async (values) => {
    setServerError("");

    try {
      await api.post("/auth/register", {
        first_name: values.first_name,
        last_name: values.last_name,
        username: values.username,
        email: values.email,
        password: values.password,
        role: values.role,
      });

      navigate("/login", {
        state: {
          message: "Account created successfully. You can now log in.",
        },
      });
    } catch (error) {
      const response = error.response?.data;

      setServerError(
        response?.message ||
          response?.errors?.email?.[0] ||
          response?.errors?.username?.[0] ||
          "We couldn't create your account. Please check your details."
      );
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      description="Join Event System and start discovering better experiences."
    >
      <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
        {serverError && (
          <div className="form-alert" role="alert">
            <AlertCircle size={18} />
            <span>{serverError}</span>
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="first_name">First name</label>

            <div
              className={`input-shell ${
                errors.first_name ? "input-error" : ""
              }`}
            >
              <UserRound size={18} />

              <input
                id="first_name"
                type="text"
                placeholder="Phoebe"
                autoComplete="given-name"
                {...register("first_name", {
                  required: "First name is required.",
                  minLength: {
                    value: 2,
                    message: "Enter at least 2 characters.",
                  },
                })}
              />
            </div>

            {errors.first_name && (
              <span className="field-error">
                {errors.first_name.message}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="last_name">Last name</label>

            <div
              className={`input-shell ${
                errors.last_name ? "input-error" : ""
              }`}
            >
              <UserRound size={18} />

              <input
                id="last_name"
                type="text"
                placeholder="Ochieng"
                autoComplete="family-name"
                {...register("last_name", {
                  required: "Last name is required.",
                  minLength: {
                    value: 2,
                    message: "Enter at least 2 characters.",
                  },
                })}
              />
            </div>

            {errors.last_name && (
              <span className="field-error">
                {errors.last_name.message}
              </span>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="username">Username</label>

          <div
            className={`input-shell ${
              errors.username ? "input-error" : ""
            }`}
          >
            <UserRound size={18} />

            <input
              id="username"
              type="text"
              placeholder="iamphoebe"
              autoComplete="username"
              {...register("username", {
                required: "Username is required.",
                minLength: {
                  value: 3,
                  message: "Username must have at least 3 characters.",
                },
              })}
            />
          </div>

          {errors.username && (
            <span className="field-error">
              {errors.username.message}
            </span>
          )}
        </div>


        <div className="form-group">
          <label htmlFor="role">Account type</label>

          <select
            id="role"
            {...register("role", {
              required: "Select an account type.",
            })}
          >
            <option value="attendee">Attendee</option>
            <option value="organizer">Event organizer</option>
            <option value="vendor">Food or drink vendor</option>
          </select>

          <small className="field-help">
            Choose how you plan to use the platform. Administrator accounts
            are created internally.
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="email">Email address</label>

          <div
            className={`input-shell ${
              errors.email ? "input-error" : ""
            }`}
          >
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
            <span className="field-error">
              {errors.email.message}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>

          <div
            className={`input-shell ${
              errors.password ? "input-error" : ""
            }`}
          >
            <LockKeyhole size={18} />

            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              {...register("password", {
                required: "Password is required.",
                minLength: {
                  value: 8,
                  message: "Password must have at least 8 characters.",
                },
                validate: {
                  uppercase: (value) =>
                    /[A-Z]/.test(value) ||
                    "Include at least one uppercase letter.",
                  number: (value) =>
                    /\d/.test(value) ||
                    "Include at least one number.",
                },
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
            <span className="field-error">
              {errors.password.message}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="confirm_password">Confirm password</label>

          <div
            className={`input-shell ${
              errors.confirm_password ? "input-error" : ""
            }`}
          >
            <LockKeyhole size={18} />

            <input
              id="confirm_password"
              type={showPassword ? "text" : "password"}
              placeholder="Re-enter your password"
              autoComplete="new-password"
              {...register("confirm_password", {
                required: "Please confirm your password.",
                validate: (value) =>
                  value === password || "Passwords do not match.",
              })}
            />
          </div>

          {errors.confirm_password && (
            <span className="field-error">
              {errors.confirm_password.message}
            </span>
          )}
        </div>

        <label className="terms-checkbox">
          <input
            type="checkbox"
            {...register("terms", {
              required: "You must accept the terms.",
            })}
          />

          <span>
            I agree to the <Link to="/">Terms of Service</Link> and{" "}
            <Link to="/">Privacy Policy</Link>.
          </span>
        </label>

        {errors.terms && (
          <span className="field-error">
            {errors.terms.message}
          </span>
        )}

        <button
          type="submit"
          className="button button-primary auth-submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating account..." : "Create account"}
          {!isSubmitting && <ArrowRight size={18} />}
        </button>
      </form>

      <p className="auth-switch">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </AuthLayout>
  );
}

export default Register;
