import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { post } from "../api";

function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState("farmer");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (event) => {
    event.preventDefault(); setError(""); setSuccess("");
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    try {
      await post("/auth/register", { firstName, lastName, email, phone, password, role });
      setSuccess("Account created successfully. Redirecting to login...");
      setTimeout(() => navigate("/login", { replace: true }), 600);
    } catch (e) { setError(e.message); }
  };
  return (
    <div className="auth-page">

      {/* =====================================================
          LEFT SIDE
          ===================================================== */}

      <div className="auth-left">

        <div className="auth-brand">

          <Link to="/" className="auth-logo">
            <span>🌾</span>
            AgriMind
          </Link>

        </div>


        <div className="auth-left-content">

          <p className="auth-small-title">
            JOIN THE AGRICULTURAL COMMUNITY
          </p>

          <h1>
            Grow with
            <span> AgriMind.</span>
          </h1>

          <p>
            Whether you grow agricultural products or want to buy
            them directly from farmers, AgriMind gives you the
            tools to connect and grow together.
          </p>


          <div className="auth-benefits">

            <div className="auth-benefit">

              <span>👨‍🌾</span>

              <div>
                <h3>For Farmers</h3>
                <p>
                  Manage your farm, crops, stock and sales.
                </p>
              </div>

            </div>


            <div className="auth-benefit">

              <span>🛒</span>

              <div>
                <h3>For Buyers</h3>
                <p>
                  Discover fresh produce directly from farmers.
                </p>
              </div>

            </div>


            <div className="auth-benefit">

              <span>🤝</span>

              <div>
                <h3>Direct Marketplace</h3>
                <p>
                  Connect farmers and buyers without unnecessary
                  middlemen.
                </p>
              </div>

            </div>

          </div>

        </div>


        <div className="auth-left-footer">
          Connecting farmers. Empowering buyers. Growing together.
        </div>

      </div>


      {/* =====================================================
          RIGHT SIDE
          ===================================================== */}

      <div className="auth-right">

        <div className="auth-form-container">

          {/* Mobile Logo */}

          <div className="mobile-auth-logo">

            <Link to="/" className="auth-logo">
              <span>🌾</span>
              AgriMind
            </Link>

          </div>


          {/* Heading */}

          <div className="auth-heading">

            <h2>
              Create your account
            </h2>

            <p>
              Join AgriMind and start your journey
            </p>

          </div>


          {/* =================================================
              ROLE SELECTION
              ================================================= */}

          <div className="role-selection">

            <p className="role-title">
              I want to join as
            </p>


            <div className="role-options">

              {/* Farmer */}

              <button
                type="button"
                className={`role-option ${
                  role === "farmer" ? "active" : ""
                }`}
                onClick={() => setRole("farmer")}
              >

                <span className="role-icon">
                  👨‍🌾
                </span>

                <div>

                  <strong>
                    Farmer
                  </strong>

                  <small>
                    Manage & sell produce
                  </small>

                </div>

              </button>


              {/* Buyer */}

              <button
                type="button"
                className={`role-option ${
                  role === "buyer" ? "active" : ""
                }`}
                onClick={() => setRole("buyer")}
              >

                <span className="role-icon">
                  🛒
                </span>

                <div>

                  <strong>
                    Buyer
                  </strong>

                  <small>
                    Buy fresh produce
                  </small>

                </div>

              </button>

            </div>

          </div>


          {/* =================================================
              REGISTRATION FORM
              ================================================= */}

          <form
            onSubmit={handleRegister}
            className="auth-form"
          >

            {/* Name */}

            <div className="form-group">

              <label htmlFor="name">
                Full Name
              </label>

              <input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
              />

            </div>


            {/* Email */}

            <div className="form-group">

              <label htmlFor="register-email">
                Email Address
              </label>

              <input
                id="register-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
              />

            </div>


            {/* Phone */}

            <div className="form-group">

              <label htmlFor="phone">
                Phone Number
              </label>

              <input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(event) =>
                  setPhone(event.target.value)
                }
              />

            </div>


            {/* Password */}

            <div className="form-group">

              <label htmlFor="register-password">
                Password
              </label>


              <div className="password-input-wrapper">

                <input
                  id="register-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Create a password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                />


                <button
                  type="button"
                  className="show-password"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? "Hide" : "Show"}
                </button>

              </div>

            </div>


            {/* Confirm Password */}

            <div className="form-group">

              <label htmlFor="confirm-password">
                Confirm Password
              </label>


              <div className="password-input-wrapper">

                <input
                  id="confirm-password"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                />


                <button
                  type="button"
                  className="show-password"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                >
                  {showConfirmPassword
                    ? "Hide"
                    : "Show"}
                </button>

              </div>

            </div>


            {/* Error */}

            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}


            {/* Submit */}

            <button
              type="submit"
              className="auth-submit-button"
            >

              Create {role === "farmer" ? "Farmer" : "Buyer"} Account

              <span>
                →
              </span>

            </button>

          </form>


          {/* =================================================
              LOGIN LINK
              ================================================= */}

          <div className="auth-divider">
            <span>
              or
            </span>
          </div>


          <div className="register-link">

            <p>
              Already have an AgriMind account?
            </p>

            <Link to="/login">
              Login
            </Link>

          </div>


          {/* Back Home */}

          <div className="back-home">

            <Link to="/">
              ← Back to Home
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Register;
