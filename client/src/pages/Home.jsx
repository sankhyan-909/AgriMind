import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="home-page">

      {/* Navigation Bar */}
      <nav className="navbar">

        <div className="logo">
          <span className="logo-icon">🌾</span>
          <span className="logo-text">AgriMind</span>
        </div>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#about">About Us</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#features">Features</a>
        </div>

        <div className="nav-buttons">
          <Link to="/login" className="login-button">
            Login
          </Link>
          <Link to="/register" className="register-button">
            Register
          </Link>
        </div>

      </nav>


      {/* Hero Section */}
      <section className="hero-section" id="home">

        <div className="hero-content">

          <p className="hero-small-text">
            SMART FARMING • DIRECT MARKET • FAIR PRICES
          </p>

          <h1>
            Growing a Better
            <span> Future Together.</span>
          </h1>

          <p className="hero-description">
            AgriMind connects farmers directly with buyers, helping farmers to
            manage their farms, sell their produce at genuine prices, and
            giving buyers access to fresh agricultural products directly
            from the source.
          </p>

          <div className="hero-buttons">

            <Link to="/register" className="primary-button">
              Get Started
              <span>→</span>
            </Link>

            <a href="#how-it-works" className="secondary-button">
              Explore AgriMind
            </a>

          </div>

          <div className="hero-stats">

            <div className="stat">
              <h3>Direct</h3>
              <p>Farmer to Buyer</p>
            </div>

            <div className="stat">
              <h3>Fair</h3>
              <p>Genuine Pricing</p>
            </div>

            <div className="stat">
              <h3>Smart</h3>
              <p>Farm Management</p>
            </div>

          </div>

        </div>


        {/* Hero Illustration */}
        <div className="hero-visual">

          <div className="farm-card">

            <div className="sun"></div>

            <div className="farm-land">

              <div className="crop-row">
                🌱 🌱 🌱 🌱 🌱
              </div>

              <div className="crop-row second-row">
                🌱 🌱 🌱 🌱 🌱
              </div>

              <div className="crop-row third-row">
                🌱 🌱 🌱 🌱 🌱
              </div>

            </div>

            <div className="farmer-emoji">
              👨‍🌾
            </div>

          </div>

        </div>

      </section>


      {/* About Section */}
      <section className="about-section" id="about">

        <div className="section-heading">

          <p>WHY AGRIMIND?</p>

          <h2>
            Technology that works
            <span> for agriculture.</span>
          </h2>

          <p className="section-description">
            Agriculture is more than just growing crops. It is about
            connecting the people who grow our food with the people who
            depend on it.
          </p>

        </div>


        <div className="feature-cards">

          <div className="feature-card">

            <div className="feature-icon">
              👨‍🌾
            </div>

            <h3>For Farmers</h3>

            <p>
              Manage your farm, track crop production, maintain stock,
              and sell your produce directly to buyers.
            </p>

          </div>


          <div className="feature-card">

            <div className="feature-icon">
              🛒
            </div>

            <h3>For Buyers</h3>

            <p>
              Discover fresh fruits, vegetables and crops directly
              from farmers at transparent and genuine prices.
            </p>

          </div>


          <div className="feature-card">

            <div className="feature-icon">
              📊
            </div>

            <h3>Smart Management</h3>

            <p>
              Keep track of production, storage and sales while
              making better decisions for your farm.
            </p>

          </div>

        </div>

      </section>


      {/* How It Works */}
      <section className="how-section" id="how-it-works">

        <div className="section-heading">

          <p>HOW IT WORKS</p>

          <h2>
            One platform.
            <span> Two experiences.</span>
          </h2>

        </div>


        <div className="steps-container">

          <div className="step">

            <div className="step-number">
              01
            </div>

            <h3>Choose Your Role</h3>

            <p>
              Register as a farmer or buyer according to how you
              want to use AgriMind.
            </p>

          </div>


          <div className="step">

            <div className="step-number">
              02
            </div>

            <h3>Connect</h3>

            <p>
              Farmers list their produce while buyers discover
              products directly from farmers.
            </p>

          </div>


          <div className="step">

            <div className="step-number">
              03
            </div>

            <h3>Trade Directly</h3>

            <p>
              Buyers purchase fresh produce and farmers receive
              direct access to the market.
            </p>

          </div>

        </div>

      </section>


      {/* Features Section */}
      <section className="features-section" id="features">

        <div className="section-heading">

          <p>WHAT AGRIMIND OFFERS</p>

          <h2>
            Built for the
            <span> real world.</span>
          </h2>

        </div>


        <div className="features-grid">

          <div className="feature-item">
            <span>🌱</span>
            <h3>Farm Management</h3>
            <p>
              Track crops, production, storage and sales in one place.
            </p>
          </div>

          <div className="feature-item">
            <span>💰</span>
            <h3>Genuine Market Rates</h3>
            <p>
              Help farmers understand current government and market
              rates for agricultural products.
            </p>
          </div>

          <div className="feature-item">
            <span>🥕</span>
            <h3>Fresh Produce</h3>
            <p>
              Buyers can discover fruits, vegetables and crops
              directly from farmers.
            </p>
          </div>

          <div className="feature-item">
            <span>📦</span>
            <h3>Inventory Tracking</h3>
            <p>
              Maintain records of produced, stored and sold quantities.
            </p>
          </div>

        </div>

      </section>


      {/* Final Call To Action */}
      <section className="cta-section">

        <div>

          <p>READY TO GET STARTED?</p>

          <h2>
            Let's build a smarter
            <span> agricultural future.</span>
          </h2>

          <p className="cta-description">
            Join AgriMind and become part of a connected agricultural
            marketplace.
          </p>

          <Link to="/register" className="primary-button">
            Join AgriMind
            <span>→</span>
          </Link>

        </div>

      </section>


      {/* Footer */}
      <footer className="footer">

        <div className="footer-logo">
          🌾 AgriMind
        </div>

        <p>
          Connecting farmers. Empowering buyers. Growing together.
        </p>

        <p className="copyright">
          © 2026 AgriMind. All rights reserved.
        </p>

      </footer>

    </div>
  );
}

export default Home;