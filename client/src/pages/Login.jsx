import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { post, setSession } from "../api";

function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState("buyer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (!email || !password) { setError("Please enter your email and password."); return; }
    try {
      const response = await post("/auth/login", { email, password });
      if (response.user.role !== role) {
        setError(`This account is registered as ${response.user.role === "farmer" ? "Farmer" : "Buyer"}. Please select the correct role.`);
        return;
      }
      setSession(response.token, response.user);
      setSuccess("Login successful. Redirecting...");
      navigate(response.user.role === "farmer" ? "/farmer-dashboard" : "/buyer-dashboard", { replace: true });
    } catch (e) { setError(e.message); }
  };
  return (
    <div className="auth-page">

      {/* Left Side */}
      <div className="auth-left">

        <div className="auth-brand">
          <Link to="/" className="auth-logo">
            <span>🌾</span>
            AgriMind
          </Link>
        </div>

        <div className="auth-left-content">
          <p className="auth-small-title">
            SMART AGRICULTURE • DIRECT MARKET
          </p>

          <h1>
            Welcome back to
            <span> AgriMind.</span>
          </h1>

          <p>
            Connect with farmers, manage your agricultural business,
            and become part of a smarter agricultural marketplace.
          </p>

          <div className="auth-benefits">

            <div className="auth-benefit">
              <span>🌱</span>
              <div>
                <h3>Smart Farming</h3>
                <p>Manage your farm and track your production.</p>
              </div>
            </div>

            <div className="auth-benefit">
              <span>🤝</span>
              <div>
                <h3>Direct Connection</h3>
                <p>Connect farmers directly with buyers.</p>
              </div>
            </div>

            <div className="auth-benefit">
              <span>💰</span>
              <div>
                <h3>Fair Prices</h3>
                <p>Support transparent and genuine agricultural pricing.</p>
              </div>
            </div>

          </div>
        </div>

        <div className="auth-left-footer">
          Growing a better agricultural future together.
        </div>

      </div>


      {/* Right Side */}
      <div className="auth-right">

        <div className="auth-form-container">

          <div className="mobile-auth-logo">
            <Link to="/" className="auth-logo">
              <span>🌾</span>
              AgriMind
            </Link>
          </div>

          <div className="auth-heading">
            <h2>Login to AgriMind</h2>

            <p>
              Enter your details to continue
            </p>
          </div>


          {/* Role Selection */}
          <div className="role-selection">

            <p className="role-title">
              Login as
            </p>

            <div className="role-options">

              <button
                type="button"
                className={`role-option ${
                  role === "buyer" ? "active" : ""
                }`}
                onClick={() => setRole("buyer")}
              >
                <span className="role-icon">🛒</span>

                <div>
                  <strong>Buyer</strong>
                  <small>Buy fresh produce</small>
                </div>
              </button>


              <button
                type="button"
                className={`role-option ${
                  role === "farmer" ? "active" : ""
                }`}
                onClick={() => setRole("farmer")}
              >
                <span className="role-icon">👨‍🌾</span>

                <div>
                  <strong>Farmer</strong>
                  <small>Manage & sell produce</small>
                </div>
              </button>

            </div>

          </div>


          {/* Login Form */}
          <form onSubmit={handleLogin} className="auth-form">

            <div className="form-group">

              <label htmlFor="email">
                Email Address
              </label>

              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />

            </div>


            <div className="form-group">

              <div className="password-label-row">

                <label htmlFor="password">
                  Password
                </label>

                <button
                  type="button"
                  className="forgot-password"
                  onClick={() =>
                    setError("Password reset will be available soon.")
                  }
                >
                  Forgot password?
                </button>

              </div>

              <div className="password-input-wrapper">

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />

                <button
                  type="button"
                  className="show-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>

              </div>

            </div>


            {/* Error */}
            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            {success && <div className="save-message">✓ {success}</div>}


            <button
              type="submit"
              className="auth-submit-button"
            >
              Login as {role === "farmer" ? "Farmer" : "Buyer"}
              <span>→</span>
            </button>

          </form>


          <div className="auth-divider">
            <span>or</span>
          </div>


          <div className="register-link">

            <p>
              Don't have an AgriMind account?
            </p>

            <Link to="/register">
              Create an account
            </Link>

          </div>


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

export default Login;
