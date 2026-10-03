import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  clearSession,
  get,
  getCurrentUser,
  put,
} from "../api";

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  location: "",
  farmName: "",
  address: "",
  state: "",
  pincode: "",
};

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(getCurrentUser());
  const [form, setForm] = useState(EMPTY_FORM);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const isFarmer = user?.role === "farmer";

  const fullName = useMemo(() => {
    const name = `${form.firstName} ${form.lastName}`.trim();
    return name || user?.name || "AgriMind User";
  }, [form.firstName, form.lastName, user?.name]);

  const initials = useMemo(() => {
    const first = form.firstName?.trim()?.[0] || "";
    const last = form.lastName?.trim()?.[0] || "";

    if (first || last) {
      return `${first}${last}`.toUpperCase();
    }

    return user?.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AM";
  }, [form.firstName, form.lastName, user?.name]);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await get("/auth/me");
      const currentUser = response.user;

      setUser(currentUser);

      setForm({
        firstName: currentUser.firstName || "",
        lastName: currentUser.lastName || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        location: currentUser.profile?.location || "",
        farmName: currentUser.profile?.farmName || "",
        address: currentUser.profile?.address || "",
        state: currentUser.profile?.state || "",
        pincode: currentUser.profile?.pincode || "",
      });

      localStorage.setItem(
        "agrimindCurrentUser",
        JSON.stringify(currentUser)
      );
    } catch (err) {
      setError(err.message || "Unable to load profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
    setError("");
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setPasswordMessage("");
    setPasswordError("");
  };

  const saveProfile = async (event) => {
    event.preventDefault();

    if (!form.firstName.trim()) {
      setError("First name is required.");
      return;
    }

    if (!form.lastName.trim()) {
      setError("Last name is required.");
      return;
    }

    if (!form.email.trim()) {
      setError("Email is required.");
      return;
    }

    if (!form.phone.trim()) {
      setError("Phone number is required.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        profile: {
          location: form.location.trim(),
          farmName: form.farmName.trim(),
          address: form.address.trim(),
          state: form.state.trim(),
          pincode: form.pincode.trim(),
        },
      };

      const response = await put(
        "/auth/profile",
        payload
      );

      setUser(response.user);

      setForm({
        firstName: response.user.firstName || "",
        lastName: response.user.lastName || "",
        email: response.user.email || "",
        phone: response.user.phone || "",
        location:
          response.user.profile?.location || "",
        farmName:
          response.user.profile?.farmName || "",
        address:
          response.user.profile?.address || "",
        state:
          response.user.profile?.state || "",
        pincode:
          response.user.profile?.pincode || "",
      });

      localStorage.setItem(
        "agrimindCurrentUser",
        JSON.stringify(response.user)
      );

      setMessage(
        response.message ||
          "Profile updated successfully."
      );
    } catch (err) {
      setError(
        err.message || "Unable to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    if (!passwordForm.currentPassword) {
      setPasswordError(
        "Enter your current password."
      );
      return;
    }

    if (!passwordForm.newPassword) {
      setPasswordError(
        "Enter a new password."
      );
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError(
        "New password must contain at least 6 characters."
      );
      return;
    }

    if (
      passwordForm.newPassword !==
      passwordForm.confirmPassword
    ) {
      setPasswordError(
        "New passwords do not match."
      );
      return;
    }

    try {
      setChangingPassword(true);

      const response = await put(
        "/auth/password",
        {
          currentPassword:
            passwordForm.currentPassword,
          newPassword:
            passwordForm.newPassword,
        }
      );

      setPasswordMessage(
        response.message ||
          "Password changed successfully."
      );

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setPasswordError(
        err.message ||
          "Unable to change password."
      );
    } finally {
      setChangingPassword(false);
    }
  };

  const logout = () => {
    clearSession();

    navigate("/login", {
      replace: true,
    });
  };

  const dashboardPath = isFarmer
    ? "/farmer-dashboard"
    : "/buyer-dashboard";

  if (loading) {
    return (
      <div className="ap-page">
        <div className="ap-loading">
          <div className="ap-spinner" />
          <h3>Loading your profile...</h3>
          <p>
            Getting your account information.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="ap-page">
      <div className="ap-container">

        {/* HEADER */}
        <header className="ap-header">

          <div className="ap-header-left">
            <div className="ap-header-logo">
              🌾
            </div>

            <div>
              <div className="ap-eyebrow">
                ACCOUNT SETTINGS
              </div>

              <h1>My Profile</h1>

              <p>
                Manage your AgriMind account and
                personal information.
              </p>
            </div>
          </div>

          <div className="ap-header-actions">
            <Link
              to={dashboardPath}
              className="ap-dashboard-btn"
            >
              ← Dashboard
            </Link>

            <button
              className="ap-logout-btn"
              onClick={logout}
            >
              Logout
            </button>
          </div>

        </header>

        {/* GLOBAL MESSAGE */}
        {message && (
          <div className="ap-alert ap-success">
            <span>✓</span>
            {message}
          </div>
        )}

        {error && (
          <div className="ap-alert ap-error">
            <span>!</span>
            {error}
          </div>
        )}

        <div className="ap-layout">

          {/* LEFT PROFILE SUMMARY */}
          <aside className="ap-sidebar">

            <section className="ap-profile-card">

              <div className="ap-avatar">
                {initials}
              </div>

              <h2>{fullName}</h2>

              <p className="ap-email">
                {form.email ||
                  "No email available"}
              </p>

              <span className="ap-role">
                {isFarmer
                  ? "🌾 FARMER ACCOUNT"
                  : "🛒 BUYER ACCOUNT"}
              </span>

              <div className="ap-divider" />

              <div className="ap-summary-list">

                <div>
                  <span>Phone</span>
                  <strong>
                    {form.phone || "Not added"}
                  </strong>
                </div>

                <div>
                  <span>Location</span>
                  <strong>
                    {form.location ||
                      "Not added"}
                  </strong>
                </div>

                {isFarmer && (
                  <div>
                    <span>Farm</span>
                    <strong>
                      {form.farmName ||
                        "Not added"}
                    </strong>
                  </div>
                )}

                <div>
                  <span>State</span>
                  <strong>
                    {form.state ||
                      "Not added"}
                  </strong>
                </div>

              </div>

            </section>

            <section className="ap-tip-card">

              <div className="ap-tip-icon">
                💡
              </div>

              <div>
                <strong>
                  Keep your profile updated
                </strong>

                <p>
                  Accurate contact and location
                  details make your AgriMind
                  experience smoother.
                </p>
              </div>

            </section>

          </aside>

          {/* MAIN */}
          <main className="ap-main">

            {/* PERSONAL INFORMATION */}
            <section className="ap-card">

              <div className="ap-card-heading">

                <div>
                  <span className="ap-card-icon">
                    👤
                  </span>
                </div>

                <div>
                  <h2>Personal Information</h2>
                  <p>
                    Update your basic account
                    information.
                  </p>
                </div>

              </div>

              <form
                className="ap-form"
                onSubmit={saveProfile}
              >

                <div className="ap-form-grid">

                  <div className="ap-field">
                    <label>
                      First Name
                      <span>*</span>
                    </label>

                    <input
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      placeholder="Enter first name"
                    />
                  </div>

                  <div className="ap-field">
                    <label>
                      Last Name
                      <span>*</span>
                    </label>

                    <input
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      placeholder="Enter last name"
                    />
                  </div>

                  <div className="ap-field">
                    <label>
                      Email Address
                      <span>*</span>
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                    />
                  </div>

                  <div className="ap-field">
                    <label>
                      Phone Number
                      <span>*</span>
                    </label>

                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                    />
                  </div>

                </div>

                <div className="ap-form-divider" />

                <div className="ap-subheading">
                  <div className="ap-subheading-icon">
                    📍
                  </div>

                  <div>
                    <h3>
                      Location Details
                    </h3>

                    <p>
                      Add your location and
                      address information.
                    </p>
                  </div>
                </div>

                <div className="ap-form-grid">

                  <div className="ap-field">
                    <label>
                      Location / City
                    </label>

                    <input
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      placeholder="e.g. Baddi"
                    />
                  </div>

                  <div className="ap-field">
                    <label>
                      State
                    </label>

                    <input
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      placeholder="e.g. Himachal Pradesh"
                    />
                  </div>

                  {isFarmer && (
                    <div className="ap-field">
                      <label>
                        Farm Name
                      </label>

                      <input
                        name="farmName"
                        value={form.farmName}
                        onChange={handleChange}
                        placeholder="e.g. Green Valley Farm"
                      />
                    </div>
                  )}

                  <div className="ap-field">
                    <label>
                      Pincode
                    </label>

                    <input
                      name="pincode"
                      value={form.pincode}
                      onChange={handleChange}
                      placeholder="Enter pincode"
                      inputMode="numeric"
                    />
                  </div>

                  <div className="ap-field ap-full">
                    <label>
                      Full Address
                    </label>

                    <textarea
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="Enter your complete address"
                      rows="4"
                    />
                  </div>

                </div>

                <div className="ap-form-footer">

                  <span>
                    Changes are saved to your
                    AgriMind account.
                  </span>

                  <button
                    type="submit"
                    className="ap-save-btn"
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : "Save Changes"}
                  </button>

                </div>

              </form>

            </section>

            {/* PASSWORD */}
            <section className="ap-card">

              <div className="ap-card-heading">

                <div>
                  <span className="ap-card-icon ap-lock">
                    🔐
                  </span>
                </div>

                <div>
                  <h2>Security</h2>

                  <p>
                    Change your account password.
                  </p>
                </div>

              </div>

              {passwordMessage && (
                <div className="ap-alert ap-success">
                  <span>✓</span>
                  {passwordMessage}
                </div>
              )}

              {passwordError && (
                <div className="ap-alert ap-error">
                  <span>!</span>
                  {passwordError}
                </div>
              )}

              <form
                className="ap-form"
                onSubmit={changePassword}
              >

                <div className="ap-form-grid">

                  <div className="ap-field ap-full">
                    <label>
                      Current Password
                      <span>*</span>
                    </label>

                    <input
                      type="password"
                      name="currentPassword"
                      value={
                        passwordForm.currentPassword
                      }
                      onChange={
                        handlePasswordChange
                      }
                      placeholder="Enter current password"
                    />
                  </div>

                  <div className="ap-field">
                    <label>
                      New Password
                      <span>*</span>
                    </label>

                    <input
                      type="password"
                      name="newPassword"
                      value={
                        passwordForm.newPassword
                      }
                      onChange={
                        handlePasswordChange
                      }
                      placeholder="Minimum 6 characters"
                    />
                  </div>

                  <div className="ap-field">
                    <label>
                      Confirm New Password
                      <span>*</span>
                    </label>

                    <input
                      type="password"
                      name="confirmPassword"
                      value={
                        passwordForm.confirmPassword
                      }
                      onChange={
                        handlePasswordChange
                      }
                      placeholder="Re-enter new password"
                    />
                  </div>

                </div>

                <div className="ap-security-footer">

                  <div>
                    <strong>
                      Password protection
                    </strong>

                    <p>
                      Your password is securely
                      handled by the AgriMind backend.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="ap-security-btn"
                    disabled={changingPassword}
                  >
                    {changingPassword
                      ? "Updating..."
                      : "Change Password"}
                  </button>

                </div>

              </form>

            </section>

            {/* ACCOUNT INFORMATION */}
            <section className="ap-account-info">

              <div className="ap-account-info-icon">
                ✓
              </div>

              <div>
                <strong>
                  Account Information
                </strong>

                <p>
                  Account type:{" "}
                  <b>
                    {user?.role === "farmer"
                      ? "Farmer"
                      : "Buyer"}
                  </b>
                </p>

                <p>
                  Your profile information is
                  securely stored in the AgriMind
                  database.
                </p>
              </div>

            </section>

          </main>

        </div>

      </div>
    </div>
  );
}

export default Profile;