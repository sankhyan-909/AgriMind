import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { get, post, put } from "../api";

function Checkout() {
  const navigate=useNavigate();
  const [cart,setCart]=useState([]); const [orderPlaced,setOrderPlaced]=useState(false); const [orderId,setOrderId]=useState(""); const [message,setMessage]=useState("");
  const [form,setForm]=useState({fullName:"",phone:"",address:"",city:"",state:"",pincode:"",paymentMethod:"Cash on Delivery"});
  useEffect(()=>{Promise.all([get("/shop/cart"),get("/auth/me")]).then(([cr,ur])=>{setCart((cr.data?.items||[]).map(i=>({id:i.product?i.product._id:i.product,name:i.product?.name||"Product",category:i.product?.category||"Produce",price:Number(i.product?.price||0),unit:i.product?.unit||"kg",quantity:Number(i.quantity||0),availableQuantity:Number(i.product?.quantity||1),farmer:i.product?.farmer?.name||"Local Farmer",location:i.product?.location||"India",emoji:i.product?.emoji||"🌱",icon:i.product?.emoji||"🌱"})));const u=ur.user;setForm(p=>({...p,fullName:u.name||"",phone:u.phone||"",address:u.profile?.address||"",city:u.profile?.location||"",state:u.profile?.state||"",pincode:u.profile?.pincode||""}));}).catch(e=>setMessage(e.message));},[]);
  const subtotal=useMemo(()=>cart.reduce((t,i)=>t+Number(i.price)*Number(i.quantity),0),[cart]); const deliveryCharge=cart.length?40:0; const total=subtotal+deliveryCharge;
  const handleChange=e=>{const {name,value}=e.target;setForm(p=>({...p,[name]:value}))};
  const placeOrder=async e=>{e.preventDefault();setMessage("");if(!cart.length){setMessage("Your cart is empty.");return;}if(!form.fullName.trim()||!form.address.trim()||!form.city.trim()||!form.state.trim()){setMessage("Please fill all delivery details.");return;}if(!/^\d{10}$/.test(form.phone.trim())){setMessage("Please enter a valid 10-digit phone number.");return;}if(!/^\d{6}$/.test(form.pincode.trim())){setMessage("Please enter a valid 6-digit PIN code.");return;}try{const r=await post("/orders",{items:cart.map(i=>({productId:i.id,quantity:Number(i.quantity)})),customer:form,paymentMethod:form.paymentMethod});await put("/shop/cart",{items:[]});setOrderId(r.data?.orderNumber||"AGRI-ORDER");setOrderPlaced(true);}catch(e){setMessage(e.message)}};
  if (orderPlaced) return (
    <div style={styles.successPage}>
      <div style={styles.successCard}>
        <div style={styles.successIcon}>✓</div>
        <div style={styles.successBadge}>ORDER CONFIRMED</div>
        <h1 style={styles.successTitle}>Your order is on its way! 🌱</h1>
        <p style={styles.successText}>Thank you for choosing AgriMind. Your order has been successfully placed and will be processed by the farmer.</p>
        <div style={styles.orderNumberBox}><span style={styles.orderLabel}>ORDER ID</span><strong style={styles.orderId}>{orderId}</strong></div>
        <div style={styles.successActions}>
          <button style={styles.primaryButton} onClick={()=>navigate('/buyer-orders')}>📦 View My Orders</button>
          <button style={styles.secondaryButton} onClick={()=>navigate('/buyer-dashboard')}>🛒 Continue Shopping</button>
        </div>
      </div>
    </div>
  );

  if (cart.length === 0) return (
    <div style={styles.emptyPage}>
      <div style={styles.emptyCard}>
        <div style={styles.emptyIcon}>🛒</div>
        <h2 style={styles.emptyTitle}>Your cart is empty</h2>
        <p style={styles.emptyText}>Add some fresh farm products before proceeding to checkout.</p>
        <button style={styles.primaryButton} onClick={()=>navigate('/buyer-dashboard')}>Explore Products</button>
      </div>
    </div>
  );



  return (
    <div style={styles.page}>
      {/* HEADER */}

      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div
            style={styles.logo}
            onClick={() => navigate("/buyer-dashboard")}
          >
            <div style={styles.logoIcon}>🌱</div>

            <div>
              <div style={styles.logoText}>
                AgriMind
              </div>

              <div style={styles.logoSubtext}>
                Farm to Buyer
              </div>
            </div>
          </div>

          <div style={styles.secureHeader}>
            <div style={styles.lockIcon}>🔒</div>

            <div>
              <strong style={styles.secureTitle}>
                Secure Checkout
              </strong>

              <small style={styles.secureSubtitle}>
                Your order is protected
              </small>
            </div>
          </div>
        </div>
      </header>

      {/* CHECKOUT PROGRESS */}

      <div style={styles.progressWrapper}>
        <div style={styles.progress}>
          <div style={styles.progressStep}>
            <span style={styles.progressDone}>✓</span>
            <span>Cart</span>
          </div>

          <div style={styles.progressLine}></div>

          <div style={styles.progressStep}>
            <span style={styles.progressActive}>2</span>
            <strong>Checkout</strong>
          </div>

          <div style={styles.progressLine}></div>

          <div style={styles.progressStep}>
            <span style={styles.progressInactive}>3</span>
            <span>Confirmation</span>
          </div>
        </div>
      </div>

      {/* MAIN */}

      <main style={styles.main}>
        <button
          style={styles.backButton}
          onClick={() => navigate("/cart")}
        >
          ← Back to Cart
        </button>

        {message && <div style={{...styles.section, marginBottom: "20px", color: "#2f7d3d" }}>{message}</div>}

        <div style={styles.heading}>
          <div style={styles.headingLabel}>
            COMPLETE YOUR PURCHASE
          </div>

          <h1 style={styles.headingTitle}>
            Checkout
          </h1>

          <p style={styles.headingDescription}>
            Just a few details and your farm-fresh
            products will be on their way.
          </p>
        </div>

        <form onSubmit={placeOrder}>
          <div style={styles.checkoutGrid}>
            {/* =========================
                LEFT SIDE
            ========================== */}

            <div>
              {/* DELIVERY INFORMATION */}

              <section style={styles.section}>
                <div style={styles.sectionHeader}>
                  <div style={styles.sectionNumber}>
                    1
                  </div>

                  <div>
                    <h2 style={styles.sectionTitle}>
                      Delivery Information
                    </h2>

                    <p style={styles.sectionDescription}>
                      Tell us where you'd like your
                      order delivered.
                    </p>
                  </div>
                </div>

                <div style={styles.formGrid}>
                  <div style={styles.field}>
                    <label style={styles.label}>
                      Full Name
                      <span style={styles.required}>
                        *
                      </span>
                    </label>

                    <input
                      style={styles.input}
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      placeholder="e.g. Aryan Chandel"
                    />
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>
                      Phone Number
                      <span style={styles.required}>
                        *
                      </span>
                    </label>

                    <input
                      style={styles.input}
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="10-digit mobile number"
                      maxLength="10"
                      inputMode="numeric"
                    />
                  </div>

                  <div
                    style={{
                      ...styles.field,
                      gridColumn: "1 / -1",
                    }}
                  >
                    <label style={styles.label}>
                      Delivery Address
                      <span style={styles.required}>
                        *
                      </span>
                    </label>

                    <textarea
                      style={{
                        ...styles.input,
                        ...styles.textarea,
                      }}
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="House number, street, locality..."
                      rows="3"
                    />
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>
                      City
                      <span style={styles.required}>
                        *
                      </span>
                    </label>

                    <input
                      style={styles.input}
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      placeholder="Your city"
                    />
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>
                      State
                      <span style={styles.required}>
                        *
                      </span>
                    </label>

                    <input
                      style={styles.input}
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      placeholder="Your state"
                    />
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>
                      PIN Code
                      <span style={styles.required}>
                        *
                      </span>
                    </label>

                    <input
                      style={styles.input}
                      name="pincode"
                      value={form.pincode}
                      onChange={handleChange}
                      placeholder="6-digit PIN"
                      maxLength="6"
                      inputMode="numeric"
                    />
                  </div>
                </div>
              </section>

              {/* PAYMENT */}

              <section style={styles.section}>
                <div style={styles.sectionHeader}>
                  <div style={styles.sectionNumber}>
                    2
                  </div>

                  <div>
                    <h2 style={styles.sectionTitle}>
                      Payment Method
                    </h2>

                    <p style={styles.sectionDescription}>
                      Choose how you'd like to pay.
                    </p>
                  </div>
                </div>

                <div style={styles.paymentOptions}>
                  {/* COD */}

                  <label
                    style={{
                      ...styles.paymentOption,
                      ...(form.paymentMethod ===
                      "Cash on Delivery"
                        ? styles.paymentSelected
                        : {}),
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Cash on Delivery"
                      checked={
                        form.paymentMethod ===
                        "Cash on Delivery"
                      }
                      onChange={handleChange}
                      style={styles.radio}
                    />

                    <div style={styles.paymentIcon}>
                      💵
                    </div>

                    <div style={styles.paymentText}>
                      <strong>
                        Cash on Delivery
                      </strong>

                      <span>
                        Pay when your order arrives
                      </span>
                    </div>

                    {form.paymentMethod ===
                      "Cash on Delivery" && (
                      <div style={styles.selectedCheck}>
                        ✓
                      </div>
                    )}
                  </label>

                  {/* ONLINE */}

                  <label
                    style={{
                      ...styles.paymentOption,
                      ...(form.paymentMethod ===
                      "UPI / Online Payment"
                        ? styles.paymentSelected
                        : {}),
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="UPI / Online Payment"
                      checked={
                        form.paymentMethod ===
                        "UPI / Online Payment"
                      }
                      onChange={handleChange}
                      style={styles.radio}
                    />

                    <div style={styles.paymentIcon}>
                      📱
                    </div>

                    <div style={styles.paymentText}>
                      <strong>
                        UPI / Online Payment
                      </strong>

                      <span>
                        Secure online payment
                      </span>
                    </div>

                    <div style={styles.demoBadge}>
                      DEMO
                    </div>

                    {form.paymentMethod ===
                      "UPI / Online Payment" && (
                      <div style={styles.selectedCheck}>
                        ✓
                      </div>
                    )}
                  </label>
                </div>
              </section>
            </div>

            {/* =========================
                RIGHT SIDE
            ========================== */}

            <aside style={styles.summary}>
              <div style={styles.summaryHeader}>
                <div>
                  <h2 style={styles.summaryTitle}>
                    Order Summary
                  </h2>

                  <span style={styles.summaryCount}>
                    {cart.length}{" "}
                    {cart.length === 1
                      ? "item"
                      : "items"}
                  </span>
                </div>

                <span style={styles.summaryLeaf}>
                  🌱
                </span>
              </div>

              {/* PRODUCTS */}

              <div style={styles.summaryItems}>
                {cart.map((item) => (
                  <div
                    key={item.id}
                    style={styles.summaryItem}
                  >
                    <div style={styles.summaryProductIcon}>
                      {item.emoji || "🌱"}
                    </div>

                    <div style={styles.summaryProductInfo}>
                      <strong style={styles.productName}>
                        {item.name}
                      </strong>

                      <span style={styles.productQuantity}>
                        {item.quantity} × ₹{item.price}
                      </span>
                    </div>

                    <strong style={styles.itemPrice}>
                      ₹
                      {(
                        Number(item.price) *
                        Number(item.quantity)
                      ).toFixed(2)}
                    </strong>
                  </div>
                ))}
              </div>

              <div style={styles.divider}></div>

              <div style={styles.priceRow}>
                <span>Subtotal</span>

                <strong>
                  ₹{subtotal.toFixed(2)}
                </strong>
              </div>

              <div style={styles.priceRow}>
                <span>
                  Delivery
                  <small style={styles.deliverySmall}>
                    Standard delivery
                  </small>
                </span>

                <strong>
                  ₹{deliveryCharge.toFixed(2)}
                </strong>
              </div>

              <div style={styles.divider}></div>

              <div style={styles.totalRow}>
                <div>
                  <span>Total Amount</span>

                  <small>
                    Inclusive of all charges
                  </small>
                </div>

                <strong>
                  ₹{total.toFixed(2)}
                </strong>
              </div>

              <button
                type="submit"
                style={styles.placeOrderButton}
              >
                <span>🔒</span>
                <span>Place Order</span>
                <span>→</span>
              </button>

              {/* TRUST */}

              <div style={styles.trustRow}>
                <div style={styles.trustItem}>
                  <span>🚚</span>
                  <small>Farm Direct</small>
                </div>

                <div style={styles.trustItem}>
                  <span>🌱</span>
                  <small>Fresh Produce</small>
                </div>

                <div style={styles.trustItem}>
                  <span>🔒</span>
                  <small>Secure</small>
                </div>
              </div>
            </aside>
          </div>
        </form>
      </main>
    </div>
  );
}

/* =========================================
   STYLES
========================================= */

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f4f7f5",
    color: "#17251e",
    fontFamily:
      "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  /* HEADER */

  header: {
    background: "#ffffff",
    borderBottom: "1px solid #e4e9e6",
  },

  headerInner: {
    maxWidth: "1240px",
    margin: "0 auto",
    padding: "14px 28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  logo: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
    cursor: "pointer",
  },

  logoIcon: {
    width: "43px",
    height: "43px",
    borderRadius: "12px",
    background: "#e5f3e9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "23px",
  },

  logoText: {
    fontSize: "21px",
    fontWeight: "800",
    color: "#146c38",
    letterSpacing: "-0.4px",
  },

  logoSubtext: {
    fontSize: "10px",
    color: "#75817a",
    marginTop: "1px",
  },

  secureHeader: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    color: "#166534",
  },

  lockIcon: {
    width: "34px",
    height: "34px",
    borderRadius: "9px",
    background: "#eef8f1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  secureTitle: {
    display: "block",
    fontSize: "13px",
  },

  secureSubtitle: {
    display: "block",
    color: "#7a857e",
    fontSize: "10px",
    marginTop: "2px",
  },

  /* PROGRESS */

  progressWrapper: {
    background: "#ffffff",
    borderBottom: "1px solid #e5e9e7",
  },

  progress: {
    maxWidth: "650px",
    margin: "0 auto",
    padding: "17px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  progressStep: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    fontSize: "12px",
    color: "#7b857f",
    whiteSpace: "nowrap",
  },

  progressDone: {
    width: "25px",
    height: "25px",
    borderRadius: "50%",
    background: "#dff1e4",
    color: "#16703b",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
  },

  progressActive: {
    width: "25px",
    height: "25px",
    borderRadius: "50%",
    background: "#176d39",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
  },

  progressInactive: {
    width: "25px",
    height: "25px",
    borderRadius: "50%",
    background: "#edf0ee",
    color: "#87918b",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
  },

  progressLine: {
    width: "65px",
    height: "1px",
    background: "#dce4df",
    margin: "0 10px",
  },

  /* MAIN */

  main: {
    maxWidth: "1240px",
    margin: "0 auto",
    padding: "27px 28px 70px",
  },

  backButton: {
    border: "none",
    background: "transparent",
    color: "#176d39",
    fontSize: "13px",
    fontWeight: "750",
    padding: 0,
    cursor: "pointer",
  },

  heading: {
    margin: "22px 0 27px",
  },

  headingLabel: {
    color: "#188044",
    fontSize: "10px",
    fontWeight: "800",
    letterSpacing: "1.4px",
    marginBottom: "6px",
  },

  headingTitle: {
    margin: 0,
    fontSize: "34px",
    lineHeight: 1.1,
    color: "#17251e",
  },

  headingDescription: {
    margin: "7px 0 0",
    color: "#69756e",
    fontSize: "14px",
  },

  /* GRID */

  checkoutGrid: {
    display: "grid",
    gridTemplateColumns:
      "minmax(0, 1.55fr) minmax(320px, 0.78fr)",
    gap: "22px",
    alignItems: "start",
  },

  /* SECTION */

  section: {
    background: "#ffffff",
    border: "1px solid #e0e7e2",
    borderRadius: "17px",
    padding: "24px",
    marginBottom: "18px",
    boxShadow:
      "0 3px 15px rgba(20,55,35,0.035)",
  },

  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "23px",
  },

  sectionNumber: {
    flexShrink: 0,
    width: "35px",
    height: "35px",
    borderRadius: "11px",
    background: "#176d39",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "850",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "19px",
    color: "#17251e",
  },

  sectionDescription: {
    margin: "3px 0 0",
    color: "#7b857f",
    fontSize: "12px",
  },

  /* FORM */

  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "17px",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },

  label: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#37443d",
  },

  required: {
    color: "#dc2626",
    marginLeft: "3px",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #d9e1dc",
    background: "#fbfcfb",
    borderRadius: "9px",
    padding: "11px 12px",
    fontSize: "13px",
    color: "#17251e",
    outline: "none",
    fontFamily: "inherit",
  },

  textarea: {
    resize: "vertical",
    minHeight: "80px",
  },

  /* PAYMENT */

  paymentOptions: {
    display: "grid",
    gap: "11px",
  },

  paymentOption: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    border: "1px solid #dfe6e1",
    borderRadius: "13px",
    padding: "15px",
    cursor: "pointer",
  },

  paymentSelected: {
    borderColor: "#27804a",
    background: "#f2f9f4",
    boxShadow:
      "0 0 0 2px rgba(39,128,74,0.08)",
  },

  radio: {
    accentColor: "#176d39",
    cursor: "pointer",
  },

  paymentIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    background: "#edf6ef",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "21px",
  },

  paymentText: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    flex: 1,
  },

  paymentTextStrong: {
    fontSize: "13px",
  },

  paymentTextSpan: {
    color: "#7a857f",
    fontSize: "11px",
  },

  demoBadge: {
    fontSize: "9px",
    fontWeight: "800",
    color: "#a16207",
    background: "#fef3c7",
    padding: "4px 7px",
    borderRadius: "5px",
  },

  selectedCheck: {
    width: "21px",
    height: "21px",
    borderRadius: "50%",
    background: "#176d39",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: "800",
  },

  /* SUMMARY */

  summary: {
    background: "#ffffff",
    border: "1px solid #dfe7e2",
    borderRadius: "17px",
    padding: "22px",
    position: "sticky",
    top: "18px",
    boxShadow:
      "0 5px 20px rgba(20,55,35,0.05)",
  },

  summaryHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  summaryTitle: {
    margin: 0,
    fontSize: "19px",
    color: "#17251e",
  },

  summaryCount: {
    display: "block",
    color: "#8a938e",
    fontSize: "11px",
    marginTop: "3px",
  },

  summaryLeaf: {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    background: "#edf7ef",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "19px",
  },

  summaryItems: {
    display: "grid",
    gap: "13px",
    marginTop: "20px",
  },

  summaryItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  summaryProductIcon: {
    flexShrink: 0,
    width: "45px",
    height: "45px",
    borderRadius: "10px",
    background: "#eef7f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
  },

  summaryProductInfo: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    minWidth: 0,
  },

  productName: {
    fontSize: "13px",
    color: "#1f2c25",
  },

  productQuantity: {
    fontSize: "11px",
    color: "#7b857f",
  },

  itemPrice: {
    fontSize: "13px",
    color: "#17251e",
  },

  divider: {
    borderTop: "1px solid #e6ebe8",
    margin: "18px 0",
  },

  priceRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
    color: "#65716a",
    fontSize: "13px",
  },

  deliverySmall: {
    display: "block",
    color: "#9aa29d",
    fontSize: "9px",
    marginTop: "2px",
  },

  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
  },

  totalRowLabel: {
    fontSize: "14px",
    fontWeight: "750",
    display: "block",
  },

  totalRowSmall: {
    display: "block",
    color: "#9aa39e",
    fontSize: "9px",
    fontWeight: "400",
    marginTop: "3px",
  },

  totalAmount: {
    color: "#176d39",
    fontSize: "23px",
  },

  placeOrderButton: {
    width: "100%",
    border: "none",
    background: "#176d39",
    color: "#ffffff",
    borderRadius: "11px",
    padding: "14px 15px",
    marginTop: "21px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "9px",
    fontSize: "14px",
    fontWeight: "850",
    cursor: "pointer",
    boxShadow:
      "0 6px 15px rgba(23,109,57,0.18)",
  },

  trustRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "5px",
    borderTop: "1px solid #edf0ee",
    marginTop: "18px",
    paddingTop: "15px",
  },

  trustItem: {
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    gap: "3px",
  },

  trustItemIcon: {
    fontSize: "15px",
  },

  trustItemText: {
    color: "#8a948e",
    fontSize: "8px",
  },

  /* SUCCESS */

  successPage: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #f2f8f4 0%, #e7f3ea 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "25px",
    fontFamily:
      "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  successCard: {
    background: "#ffffff",
    maxWidth: "580px",
    width: "100%",
    borderRadius: "22px",
    padding: "45px 35px",
    textAlign: "center",
    border: "1px solid #dce8df",
    boxShadow:
      "0 15px 45px rgba(23,77,43,0.10)",
  },

  successIcon: {
    width: "75px",
    height: "75px",
    borderRadius: "50%",
    background: "#dff3e5",
    color: "#16803e",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "40px",
    fontWeight: "900",
    margin: "0 auto 12px",
  },

  successBadge: {
    color: "#16803e",
    fontSize: "10px",
    fontWeight: "850",
    letterSpacing: "1.5px",
  },

  successTitle: {
    margin: "13px 0 11px",
    fontSize: "28px",
    color: "#17251e",
  },

  successText: {
    color: "#68746d",
    lineHeight: 1.65,
    maxWidth: "450px",
    margin: "0 auto 25px",
    fontSize: "14px",
  },

  orderNumberBox: {
    background: "#f1f8f3",
    border: "1px solid #dcecdf",
    borderRadius: "12px",
    padding: "15px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    marginBottom: "20px",
  },

  orderLabel: {
    color: "#789181",
    fontSize: "9px",
    fontWeight: "800",
    letterSpacing: "1px",
  },

  orderId: {
    color: "#176d39",
    fontSize: "21px",
    letterSpacing: "0.5px",
  },

  successInfo: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    marginBottom: "25px",
  },

  successInfoItem: {
    background: "#f8faf8",
    border: "1px solid #e7ece9",
    borderRadius: "11px",
    padding: "12px",
    display: "flex",
    alignItems: "center",
    gap: "9px",
    textAlign: "left",
  },

  successInfoIcon: {
    fontSize: "21px",
  },

  successActions: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
  },

  primaryButton: {
    border: "none",
    background: "#176d39",
    color: "#ffffff",
    borderRadius: "10px",
    padding: "13px 16px",
    cursor: "pointer",
    fontWeight: "750",
  },

  secondaryButton: {
    border: "1px solid #176d39",
    background: "#ffffff",
    color: "#176d39",
    borderRadius: "10px",
    padding: "13px 16px",
    cursor: "pointer",
    fontWeight: "750",
  },

  /* EMPTY */

  emptyPage: {
    minHeight: "100vh",
    background: "#f4f7f5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "25px",
  },

  emptyCard: {
    background: "#ffffff",
    maxWidth: "450px",
    width: "100%",
    textAlign: "center",
    padding: "45px 30px",
    borderRadius: "18px",
    border: "1px solid #e2e8e4",
    boxShadow:
      "0 10px 35px rgba(20,55,35,0.06)",
  },

  emptyIcon: {
    fontSize: "55px",
    marginBottom: "12px",
  },

  emptyTitle: {
    margin: "0 0 8px",
    color: "#17251e",
  },

  emptyText: {
    color: "#6b756f",
    lineHeight: 1.6,
    marginBottom: "22px",
  },
};



export default Checkout;
