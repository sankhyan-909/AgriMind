import { useEffect, useMemo, useState } from "react";
import { get } from "../api";

const initialFilters = {
  commodity: "",
  state: "",
  district: "",
  market: "",
};

function formatMoney(value) {
  const number = Number(value);

  if (Number.isNaN(number)) return "—";

  return `₹${number.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function GovernmentRates() {
  const [rows, setRows] = useState([]);

  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [source, setSource] = useState("");
  const [fetchedAt, setFetchedAt] = useState("");

  const [showFilters, setShowFilters] = useState(false);

  async function loadRates(customFilters = appliedFilters) {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      params.set("limit", "100");

      if (customFilters.commodity.trim()) {
        params.set(
          "commodity",
          customFilters.commodity.trim()
        );
      }

      if (customFilters.state.trim()) {
        params.set(
          "state",
          customFilters.state.trim()
        );
      }

      if (customFilters.district.trim()) {
        params.set(
          "district",
          customFilters.district.trim()
        );
      }

      if (customFilters.market.trim()) {
        params.set(
          "market",
          customFilters.market.trim()
        );
      }

      const response = await get(
        `/government-rates?${params.toString()}`
      );

      const data = Array.isArray(response?.data)
        ? response.data
        : [];

      setRows(data);
      setSource(response?.source || "");
      setFetchedAt(response?.fetchedAt || "");

      if (response?.message) {
        setError(response.message);
      }
    } catch (err) {
      console.error(
        "Failed to load government rates:",
        err
      );

      setRows([]);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to fetch government mandi rates right now."
      );

      setSource(
        err?.response?.data?.source ||
          "data.gov.in / AGMARKNET"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRates(initialFilters);
  }, []);

  function handleFilterChange(event) {
    const { name, value } = event.target;

    setFilters((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function applyFilters(event) {
    if (event) {
      event.preventDefault();
    }

    setAppliedFilters(filters);
    loadRates(filters);
  }

  function clearFilters() {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
    loadRates(initialFilters);
  }

  const stats = useMemo(() => {
    if (!rows.length) {
      return {
        records: 0,
        commodities: 0,
        markets: 0,
        averageModal: 0,
        highestModal: 0,
      };
    }

    const commodities = new Set(
      rows
        .map((row) =>
          String(row.commodity || "")
            .trim()
            .toLowerCase()
        )
        .filter(Boolean)
    );

    const markets = new Set(
      rows
        .map((row) =>
          String(row.market || "")
            .trim()
            .toLowerCase()
        )
        .filter(Boolean)
    );

    const modalRates = rows
      .map((row) => Number(row.modalRate))
      .filter((value) => !Number.isNaN(value) && value > 0);

    const averageModal =
      modalRates.length > 0
        ? modalRates.reduce(
            (sum, value) => sum + value,
            0
          ) / modalRates.length
        : 0;

    const highestModal =
      modalRates.length > 0
        ? Math.max(...modalRates)
        : 0;

    return {
      records: rows.length,
      commodities: commodities.size,
      markets: markets.size,
      averageModal,
      highestModal,
    };
  }, [rows]);

  const activeFilterCount = Object.values(
    appliedFilters
  ).filter((value) => value.trim()).length;

  return (
    <div className="amgr-page">
      <div className="amgr-container">

        {/* HERO */}
        <section className="amgr-hero">
          <div className="amgr-hero-content">
            <span className="amgr-eyebrow">
              MARKET INFORMATION
            </span>

            <h1>
              Government
              <br />
              Mandi Rates
            </h1>

            <p>
              Explore available agricultural commodity
              prices from the Government of India
              data.gov.in / AGMARKNET source.
            </p>

            <div className="amgr-hero-actions">
              <button
                type="button"
                className="amgr-primary-btn"
                onClick={() =>
                  loadRates(appliedFilters)
                }
                disabled={loading}
              >
                <span>↻</span>
                {loading ? "Refreshing..." : "Refresh Rates"}
              </button>

              <div className="amgr-source-pill">
                <span className="amgr-live-dot"></span>
                Government Data Source
              </div>
            </div>
          </div>

          <div className="amgr-hero-visual">
            <div className="amgr-chart-card">
              <div className="amgr-chart-top">
                <span>MARKET PRICE</span>
                <strong>₹</strong>
              </div>

              <div className="amgr-chart-bars">
                <span style={{ height: "42%" }}></span>
                <span style={{ height: "64%" }}></span>
                <span style={{ height: "51%" }}></span>
                <span style={{ height: "82%" }}></span>
                <span style={{ height: "69%" }}></span>
                <span style={{ height: "91%" }}></span>
                <span style={{ height: "76%" }}></span>
              </div>

              <div className="amgr-chart-line">
                <span>MIN</span>
                <span>MODAL</span>
                <span>MAX</span>
              </div>
            </div>

            <div className="amgr-floating-leaf leaf-one">
              🌾
            </div>

            <div className="amgr-floating-leaf leaf-two">
              📈
            </div>
          </div>
        </section>

        {/* ERROR / API MESSAGE */}
        {error && (
          <div className="amgr-alert">
            <div className="amgr-alert-icon">
              ℹ️
            </div>

            <div>
              <strong>Government rate information</strong>
              <p>{error}</p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
            >
              ×
            </button>
          </div>
        )}

        {/* STATS */}
        <section className="amgr-stats">

          <div className="amgr-stat-card">
            <div className="amgr-stat-icon green">
              📊
            </div>

            <div>
              <span>Available Records</span>
              <strong>{stats.records}</strong>
              <small>Rate entries loaded</small>
            </div>
          </div>

          <div className="amgr-stat-card">
            <div className="amgr-stat-icon yellow">
              🌾
            </div>

            <div>
              <span>Commodities</span>
              <strong>{stats.commodities}</strong>
              <small>Different crops</small>
            </div>
          </div>

          <div className="amgr-stat-card">
            <div className="amgr-stat-icon blue">
              🏪
            </div>

            <div>
              <span>Markets</span>
              <strong>{stats.markets}</strong>
              <small>Mandi locations</small>
            </div>
          </div>

          <div className="amgr-stat-card">
            <div className="amgr-stat-icon purple">
              ₹
            </div>

            <div>
              <span>Average Modal Rate</span>
              <strong>
                {formatMoney(stats.averageModal)}
              </strong>
              <small>Across loaded records</small>
            </div>
          </div>

        </section>

        {/* INFO CARD */}
        <section className="amgr-info-card">
          <div className="amgr-info-icon">
            🏛️
          </div>

          <div className="amgr-info-content">
            <span className="amgr-section-kicker">
              OFFICIAL DATA SOURCE
            </span>

            <h2>
              Government of India Mandi Information
            </h2>

            <p>
              These rates are provided through the
              configured Government of India
              data.gov.in / AGMARKNET source. Availability
              depends on the backend API configuration
              and the data returned by the government
              service.
            </p>
          </div>

          <div className="amgr-source-name">
            <strong>
              {source || "data.gov.in / AGMARKNET"}
            </strong>

            {fetchedAt && (
              <small>
                Fetched{" "}
                {new Date(fetchedAt).toLocaleString(
                  "en-IN"
                )}
              </small>
            )}
          </div>
        </section>

        {/* RATES SECTION */}
        <section className="amgr-rates-section">

          <div className="amgr-rates-header">
            <div>
              <span className="amgr-section-kicker">
                MARKET RATES
              </span>

              <h2>
                Latest Available Rates
              </h2>

              <p>
                Search and filter commodity prices
                by location and market.
              </p>
            </div>

            <button
              type="button"
              className="amgr-filter-toggle"
              onClick={() =>
                setShowFilters((previous) => !previous)
              }
            >
              ⚙️ Filters
              {activeFilterCount > 0 && (
                <span>{activeFilterCount}</span>
              )}
            </button>
          </div>

          {/* SEARCH */}
          <form
            className="amgr-search-row"
            onSubmit={applyFilters}
          >
            <div className="amgr-search-box">
              <span>⌕</span>

              <input
                type="text"
                name="commodity"
                value={filters.commodity}
                onChange={handleFilterChange}
                placeholder="Search commodity e.g. Wheat, Rice, Maize..."
              />
            </div>

            <button
              type="submit"
              className="amgr-search-btn"
              disabled={loading}
            >
              Search
            </button>

            {activeFilterCount > 0 && (
              <button
                type="button"
                className="amgr-clear-btn"
                onClick={clearFilters}
              >
                Clear
              </button>
            )}
          </form>

          {/* ADVANCED FILTERS */}
          {showFilters && (
            <div className="amgr-advanced-filters">

              <label>
                <span>State</span>

                <input
                  type="text"
                  name="state"
                  value={filters.state}
                  onChange={handleFilterChange}
                  placeholder="e.g. Punjab"
                />
              </label>

              <label>
                <span>District</span>

                <input
                  type="text"
                  name="district"
                  value={filters.district}
                  onChange={handleFilterChange}
                  placeholder="e.g. Ludhiana"
                />
              </label>

              <label>
                <span>Market / Mandi</span>

                <input
                  type="text"
                  name="market"
                  value={filters.market}
                  onChange={handleFilterChange}
                  placeholder="e.g. Khanna"
                />
              </label>

              <button
                type="button"
                className="amgr-apply-filter-btn"
                onClick={() => applyFilters()}
                disabled={loading}
              >
                Apply Filters
              </button>
            </div>
          )}

          {/* TABLE */}
          <div className="amgr-table-wrapper">

            {loading ? (
              <div className="amgr-state">
                <div className="amgr-spinner"></div>

                <h3>
                  Fetching latest mandi rates...
                </h3>

                <p>
                  Connecting to the configured
                  government data source.
                </p>
              </div>
            ) : rows.length === 0 ? (
              <div className="amgr-state">

                <div className="amgr-empty-icon">
                  📈
                </div>

                <h3>
                  No government rates available
                </h3>

                <p>
                  No rate records were returned for
                  the current filters.
                </p>

                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    className="amgr-outline-btn"
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <table className="amgr-table">

                <thead>
                  <tr>
                    <th>Commodity</th>
                    <th>State</th>
                    <th>District</th>
                    <th>Mandi</th>
                    <th>Min Price</th>
                    <th>Modal Price</th>
                    <th>Max Price</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((row, index) => (
                    <tr
                      key={row.id || index}
                    >

                      <td>
                        <div className="amgr-commodity-cell">

                          <div className="amgr-commodity-icon">
                            🌾
                          </div>

                          <div>
                            <strong>
                              {row.commodity ||
                                row.crop ||
                                "Unknown"}
                            </strong>

                            {row.variety && (
                              <small>
                                {row.variety}
                              </small>
                            )}
                          </div>

                        </div>
                      </td>

                      <td>
                        <span className="amgr-location">
                          🇮🇳{" "}
                          {row.state || "—"}
                        </span>
                      </td>

                      <td>
                        {row.district || "—"}
                      </td>

                      <td>
                        <div className="amgr-market">
                          <strong>
                            {row.market || "—"}
                          </strong>

                          {row.grade && (
                            <small>
                              Grade: {row.grade}
                            </small>
                          )}
                        </div>
                      </td>

                      <td>
                        <span className="amgr-min-price">
                          {formatMoney(row.minRate)}
                        </span>
                      </td>

                      <td>
                        <span className="amgr-modal-price">
                          {formatMoney(row.modalRate)}
                        </span>
                      </td>

                      <td>
                        <span className="amgr-max-price">
                          {formatMoney(row.maxRate)}
                        </span>
                      </td>

                      <td>
                        <span className="amgr-date">
                          {formatDate(row.arrivalDate)}
                        </span>
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            )}

          </div>

          {rows.length > 0 && (
            <div className="amgr-table-footer">
              <span>
                Showing{" "}
                <strong>{rows.length}</strong>{" "}
                available rate records
              </span>

              <span>
                Source:{" "}
                <strong>
                  data.gov.in / AGMARKNET
                </strong>
              </span>
            </div>
          )}

        </section>

        {/* DISCLAIMER */}
        <section className="amgr-disclaimer">
          <span>ⓘ</span>

          <p>
            <strong>Important:</strong> Market-rate
            information displayed here depends on the
            configured Government of India data source.
            Always verify the latest official information
            before making commercial decisions.
          </p>
        </section>

      </div>
    </div>
  );
}