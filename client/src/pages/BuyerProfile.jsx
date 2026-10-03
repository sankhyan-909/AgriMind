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
  address: "",
  state: "",
  pincode: "",
};

function BuyerProfile() {
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
  const [changingPassword, setChangingPassword] =
    useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [passwordMessage, setPasswordMessage] =
    useState("");
  const [passwordError, setPasswordError] =
    useState("");

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
        location:
          currentUser.profile?.location || "",
        address:
          currentUser.profile?.address || "",
        state:
          currentUser.profile?.state || "",
        pincode:
          currentUser.profile?.pincode || "",
      });

      localStorage.setItem(
        "agrimindCurrentUser",
        JSON.stringify(currentUser)
      );
    } catch (err) {
      setError(
        err.message || "Unable to load profile."
      );
    } finally {
      setLoading(false);
    }
  };

  const fullName = useMemo(() => {
    const name =
      `${form.firstName} ${form.lastName}`.trim();

    return name || user?.name || "AgriMind Buyer";
  }, [
    form.firstName,
    form.lastName,
    user?.name,
  ]);

  const initials = useMemo(() => {
    const first =
      form.firstName?.trim()?.[0] || "";

    const last =
      form.lastName?.trim()?.[0] || "";

    if (first || last) {
      return `${first}${last}`.toUpperCase();
    }

    return (
      user?.name
        ?.split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "BU"
    );
  }, [
    form.firstName,
    form.lastName,
    user?.name,
  ]);

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

    setMessage("");
    setError("");

    if (!form.firstName.trim()) {
      setError("First name is required.");
      return;
    }

    if (!form.lastName.trim()) {
      setError("Last name is required.");
      return;
    }

    if (!form.email.trim()) {
      setError("Email address is required.");
      return;
    }

    if (!form.phone.trim()) {
      setError("Phone number is required.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        profile: {
          location: form.location.trim(),
          farmName: "",
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
        firstName:
          response.user.firstName || "",
        lastName:
          response.user.lastName || "",
        email:
          response.user.email || "",
        phone:
          response.user.phone || "",
        location:
          response.user.profile?.location || "",
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
        err.message ||
          "Unable to update profile."
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

    if (
      passwordForm.newPassword.length < 6
    ) {
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

  if (loading) {
    return (
      <div className="abp-page">
        <div className="abp-loading">
          <div className="abp-spinner" />
          <h3>Loading your profile...</h3>
          <p>
            Getting your AgriMind account details.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="abp-page">
      <div className="abp-container">

        {/* HEADER */}
        <header className="abp-header">
          <div className="abp-brand">
            <div className="abp-brand-icon">
              🛒
            </div>

            <div>
              <div className="abp-eyebrow">
                BUYER ACCOUNT
              </div>

              <h1>My Profile</h1>

              <p>
                Manage your account and delivery
                information.
              </p>
            </div>
          </div>

          <div className="abp-header-actions">
            <Link
              to="/buyer-dashboard"
              className="abp-dashboard-btn"
            >
              ← Dashboard
            </Link>

            <button
              type="button"
              className="abp-logout-btn"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </header>

        {/* ALERTS */}
        {message && (
          <div className="abp-alert abp-success">
            <span>✓</span>
            {message}
          </div>
        )}

        {error && (
          <div className="abp-alert abp-error">
            <span>!</span>
            {error}
          </div>
        )}

        <div className="abp-layout">

          {/* SIDEBAR */}
          <aside className="abp-sidebar">

            <section className="abp-user-card">

              <div className="abp-avatar">
                {initials}
              </div>

              <h2>{fullName}</h2>

              <p className="abp-email">
                {form.email ||
                  "No email available"}
              </p>

              <div className="abp-buyer-badge">
                🛒 BUYER ACCOUNT
              </div>

              <div className="abp-divider" />

              <div className="abp-summary">

                <div>
                  <span>PHONE</span>
                  <strong>
                    {form.phone ||
                      "Not added"}
                  </strong>
                </div>

                <div>
                  <span>LOCATION</span>
                  <strong>
                    {form.location ||
                      "Not added"}
                  </strong>
                </div>

                <div>
                  <span>STATE</span>
                  <strong>
                    {form.state ||
                      "Not added"}
                  </strong>
                </div>

              </div>
            </section>

            <section className="abp-shopping-card">

              <div className="abp-shopping-icon">
                🛍️
              </div>

              <div>
                <strong>
                  Your AgriMind Account
                </strong>

                <p>
                  Keep your delivery details
                  accurate so farmers can
                  fulfil your orders smoothly.
                </p>
              </div>

            </section>

          </aside>

          {/* MAIN */}
          <main className="abp-main">

            {/* PERSONAL INFORMATION */}
            <section className="abp-card">

              <div className="abp-card-heading">

                <div className="abp-card-icon">
                  👤
                </div>

                <div>
                  <h2>
                    Personal Information
                  </h2>

                  <p>
                    Update your basic buyer
                    account information.
                  </p>
                </div>

              </div>

              <form
                className="abp-form"
                onSubmit={saveProfile}
              >

                <div className="abp-grid">

                  <div className="abp-field">
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

                  <div className="abp-field">
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

                  <div className="abp-field">
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

                  <div className="abp-field">
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

                <div className="abp-section-divider" />

                <div className="abp-subheading">

                  <div className="abp-subheading-icon">
                    📍
                  </div>

                  <div>
                    <h3>
                      Delivery Information
                    </h3>

                    <p>
                      Where should your orders
                      be delivered?
                    </p>
                  </div>

                </div>

                <div className="abp-grid">

                  <div className="abp-field">
                    <label>
                      City / Location
                    </label>

                    <input
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      placeholder="e.g. Chandigarh"
                    />
                  </div>

                  <div className="abp-field">
                    <label>
                      State
                    </label>

                    <input
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      placeholder="e.g. Punjab"
                    />
                  </div>

                  <div className="abp-field">
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

                  <div className="abp-field abp-full">
                    <label>
                      Complete Delivery Address
                    </label>

                    <textarea
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="Enter your complete delivery address"
                      rows="4"
                    />
                  </div>

                </div>

                <div className="abp-form-footer">

                  <span>
                    Your information is stored
                    securely in AgriMind.
                  </span>

                  <button
                    type="submit"
                    className="abp-save-btn"
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : "Save Changes"}
                  </button>

                </div>

              </form>

            </section>

            {/* SECURITY */}
            <section className="abp-card">

              <div className="abp-card-heading">

                <div className="abp-card-icon abp-security-icon">
                  🔐
                </div>

                <div>
                  <h2>
                    Account Security
                  </h2>

                  <p>
                    Change your AgriMind
                    account password.
                  </p>
                </div>

              </div>

              {passwordMessage && (
                <div className="abp-alert abp-success abp-inner-alert">
                  <span>✓</span>
                  {passwordMessage}
                </div>
              )}

              {passwordError && (
                <div className="abp-alert abp-error abp-inner-alert">
                  <span>!</span>
                  {passwordError}
                </div>
              )}

              <form
                className="abp-form"
                onSubmit={changePassword}
              >

                <div className="abp-grid">

                  <div className="abp-field abp-full">
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

                  <div className="abp-field">
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

                  <div className="abp-field">
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

                <div className="abp-security-footer">

                  <div>
                    <strong>
                      Password protection
                    </strong>

                    <p>
                      Your password is handled
                      securely by the AgriMind
                      backend.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="abp-security-btn"
                    disabled={changingPassword}
                  >
                    {changingPassword
                      ? "Updating..."
                      : "Change Password"}
                  </button>

                </div>

              </form>

            </section>

            {/* ACCOUNT INFO */}
            <section className="abp-account-info">

              <div className="abp-account-check">
                ✓
              </div>

              <div>
                <strong>
                  Buyer Account
                </strong>

                <p>
                  Account type:{" "}
                  <b>Buyer</b>
                </p>

                <p>
                  Your personal and delivery
                  information is securely
                  stored in the AgriMind
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

export default BuyerProfile;