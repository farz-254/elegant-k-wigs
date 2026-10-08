import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  // =========================
  // CART & CHECKOUT STATE
  // =========================
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    location: "",
    notes: "",
  });

  // =========================
  // PRODUCTS
  // =========================
  const products = [
    {
      id: 1,
      name: "Silky Straight",
      price: 12500,
      rating: "4.9",
      badge: "BEST SELLER",
      image:
        "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=700&q=80",
    },
    {
      id: 2,
      name: "Luxury Body Wave",
      price: 14500,
      rating: "4.8",
      badge: "NEW",
      image:
        "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=700&q=80",
    },
    {
      id: 3,
      name: "Soft Curly",
      price: 13000,
      rating: "4.9",
      badge: "POPULAR",
      image:
        "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=700&q=80",
    },
  ];

  // =========================
  // CATEGORIES
  // =========================
  const categories = [
    {
      name: "Human Hair",
      description: "Natural texture & premium quality",
      image:
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Curly Wigs",
      description: "Bold curls, effortless beauty",
      image:
        "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Bob Wigs",
      description: "Chic, classy & timeless",
      image:
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Lace Front",
      description: "Flawless & natural-looking",
      image:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    },
  ];

  // =========================
  // ADD TO CART
  // =========================
  const addToCart = (product) => {
    setCart((currentCart) => {
      const existing = currentCart.find(
        (item) => item.id === product.id
      );

      if (existing) {
        return currentCart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...currentCart,
        {
          ...product,
          quantity: 1,
        },
      ];
    });
  };

  // =========================
  // REMOVE FROM CART
  // =========================
  const removeFromCart = (id) => {
    setCart((currentCart) =>
      currentCart.filter((item) => item.id !== id)
    );
  };

  // =========================
  // CHANGE QUANTITY
  // =========================
  const changeQuantity = (id, amount) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: item.quantity + amount,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // =========================
  // CART TOTALS
  // =========================
  const totalItems = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const totalPrice = cart.reduce(
    (total, item) =>
      total + item.price * item.quantity,
    0
  );
// =========================
// PAY WITH M-PESA
// =========================

const payWithMpesa = async () => {
  // Check required customer information
  if (
    !customer.name ||
    !customer.phone ||
    !customer.location
  ) {
    alert(
      "Please fill in your name, phone number and delivery location."
    );
    return;
  }

  // Make sure cart isn't empty
  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  // ==========================================
  // FORMAT PHONE NUMBER FOR M-PESA
  // ==========================================

  let phoneNumber = customer.phone
    .trim()
    .replace(/\s+/g, "");

  // Convert +254712345678 -> 254712345678
  if (phoneNumber.startsWith("+254")) {
    phoneNumber = phoneNumber.substring(1);
  }

  // Convert 0712345678 -> 254712345678
  else if (phoneNumber.startsWith("0")) {
    phoneNumber = "254" + phoneNumber.substring(1);
  }

  // ==========================================
  // VALIDATE KENYAN PHONE NUMBER
  // ==========================================

  if (!/^254(7|1)\d{8}$/.test(phoneNumber)) {
    alert(
      "Please enter a valid Kenyan phone number, for example 0712345678."
    );
    return;
  }

  try {
    console.log("Sending M-Pesa payment request...");
    console.log("Formatted phone number:", phoneNumber);
    console.log("Amount:", totalPrice);

    const response = await fetch(
      "http://localhost:5001/api/mpesa/stkpush",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          phone: phoneNumber,
          amount: totalPrice,
        }),
      }
    );

    // Read response as text first
    const responseText = await response.text();

    console.log(
      "M-Pesa backend response:",
      responseText
    );

    let data;

    // Convert response to JSON
    try {
      data = JSON.parse(responseText);
    } catch (jsonError) {
      console.error(
        "M-Pesa backend did not return JSON:",
        responseText
      );

      throw new Error(
        "The M-Pesa server returned an invalid response."
      );
    }

    // Check backend response
    if (!response.ok || !data.success) {
      throw new Error(
        data.message ||
          "M-Pesa payment request failed."
      );
    }

    console.log(
      "M-Pesa STK Push successful:",
      data
    );

    alert(
      "M-Pesa payment request sent! Check your phone for the M-Pesa prompt."
    );

  } catch (error) {
    console.error(
      "M-Pesa payment error:",
      error
    );

    alert(
      "M-Pesa payment failed. Check the browser Console and backend terminal for the exact error."
    );
  }
};
// =========================
// PLACE ORDER
// =========================
const placeOrder = async () => {    // Check required customer information
    if (
      !customer.name ||
      !customer.phone ||
      !customer.location
    ) {
      alert(
        "Please fill in your name, phone number and delivery location."
      );
      return;
    }

    // Make sure cart isn't empty
    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    try {
      // =========================
      // SEND ORDER TO BACKEND
      // =========================

      const response = await fetch(
        "http://localhost:5001/api/orders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customer: customer,
            items: cart,
            total: totalPrice,
          }),
        }
      );

      // Read the response as text first
      // so we can see exactly what the server sends
      const responseText = await response.text();

      console.log(
        "Backend response:",
        responseText
      );

      // Try to convert the response to JSON
      let data;

      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error(
          "Backend did not return JSON:",
          responseText
        );

        throw new Error(
          "The backend returned an invalid response."
        );
      }

      // Check whether the backend accepted the order
      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to send order"
        );
      }

      console.log(
        "Order successfully sent to backend:",
        data
      );

      // =========================
      // CREATE WHATSAPP MESSAGE
      // =========================

      const message = cart
        .map(
          (item) =>
            `${item.name} x${item.quantity} - KSh ${(
              item.price * item.quantity
            ).toLocaleString()}`
        )
        .join("\n");

      const whatsappMessage = `Hello Elegant K Wigs

I would like to place an order.

CUSTOMER DETAILS
Name: ${customer.name}
Phone: ${customer.phone}
Delivery Location: ${customer.location}

ORDER
${message}

TOTAL: KSh ${totalPrice.toLocaleString()}

Notes:
${customer.notes || "None"}

Please let me know the next steps for payment and delivery.`;

      // =========================
      // WHATSAPP NUMBER
      // =========================

      const whatsappNumber = "254708374149";

      // =========================
      // OPEN WHATSAPP
      // =========================

      window.open(
        `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
          whatsappMessage
        )}`,
        "_blank"
      );

      // Success message
      alert(
        "Your order has been received. WhatsApp will now open."
      );
    } catch (error) {
      console.error(
        "Order submission error:",
        error
      );

      alert(
        "Could not send your order to the server. Check the browser Console for the exact error."
      );
    }
  };
  // =========================
  // APP
  // =========================
  return (
    <div
      style={{
        backgroundColor: "#242424",
        color: "#f5f1eb",
        minHeight: "100vh",
      }}
    >
      {/* =========================
          NAVBAR
      ========================= */}
      <nav
        className="navbar navbar-expand-lg py-3 sticky-top"
        style={{
          backgroundColor: "#171717",
          borderBottom: "1px solid #3d3d3d",
        }}
      >
        <div className="container">
          <a
            className="navbar-brand fw-bold fs-3"
            href="#"
            style={{
              color: "#f5f1eb",
              fontStyle: "italic",
              fontFamily:
                "Playfair Display, serif",
            }}
          >
            Elegant{" "}
            <span style={{ color: "#c89b6d" }}>
              K
            </span>{" "}
            Wigs
          </a>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div
            className="collapse navbar-collapse"
            id="navbarNav"
          >
            <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-3">
              <li className="nav-item">
                <a
                  className="nav-link fw-semibold"
                  href="#"
                  style={{ color: "#f5f1eb" }}
                >
                  Home
                </a>
              </li>

              <li className="nav-item">
                <a
                  className="nav-link"
                  href="#categories"
                  style={{ color: "#f5f1eb" }}
                >
                  Collections
                </a>
              </li>

              <li className="nav-item">
                <a
                  className="nav-link"
                  href="#products"
                  style={{ color: "#f5f1eb" }}
                >
                  Shop
                </a>
              </li>

              <li className="nav-item">
                <button
                  onClick={() =>
                    setShowCart(true)
                  }
                  className="btn btn-dark rounded-pill px-4 position-relative"
                >
                  🛍 Cart

                  {totalItems > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                      {totalItems}
                    </span>
                  )}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* =========================
          HERO
      ========================= */}
      <section className="py-5">
        <div className="container py-5">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <p
                className="text-uppercase fw-bold"
                style={{
                  letterSpacing: "4px",
                  color: "#9b6b43",
                }}
              >
                ELEGANCE REDEFINED
              </p>

              <h1
                className="display-2 fw-bold"
                style={{
                  lineHeight: "1.05",
                  fontStyle: "italic",
                  fontFamily:
                    "Playfair Display, serif",
                }}
              >
                Your Beauty.
                <br />
                Your{" "}
                <i
                  style={{
                    color: "#c89b6d",
                  }}
                >
                  Crown.
                </i>
              </h1>

              <p
                className="lead mt-4"
                style={{
                  color: "#bdb8b0",
                  maxWidth: "550px",
                }}
              >
                Premium wigs crafted for women who
                love effortless elegance, confidence
                and unforgettable style.
              </p>

              <a
                href="#products"
                className="btn btn-dark btn-lg rounded-pill px-5 mt-3"
              >
                Shop Collection
              </a>
            </div>

            <div className="col-lg-6">
              <div
                style={{
                  borderRadius: "40px",
                  overflow: "hidden",
                  height: "500px",
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1000&q=85"
                  alt="Elegant wig"
                  className="w-100 h-100"
                  style={{
                    objectFit: "cover",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          CATEGORIES
      ========================= */}
      <section
        id="categories"
        className="py-5"
        style={{
          backgroundColor: "#1f1f1f",
        }}
      >
        <div className="container py-5">
          <div className="text-center mb-5">
            <p
              className="fw-bold text-uppercase"
              style={{
                letterSpacing: "3px",
                color: "#9b6b43",
              }}
            >
              SHOP BY STYLE
            </p>

            <h2 className="display-5 fw-bold">
              Find Your Perfect Look
            </h2>

            <p className="text-secondary">
              Explore our signature collections.
            </p>
          </div>

          <div className="row g-4">
            {categories.map((category) => (
              <div
                className="col-12 col-md-6 col-lg-3"
                key={category.name}
              >
                <div
                  className="card border-0 h-100"
                  style={{
                    borderRadius: "25px",
                    overflow: "hidden",
                    backgroundColor: "#303030",
                    color: "#f5f1eb",
                  }}
                >
                  <img
                    src={category.image}
                    alt={category.name}
                    style={{
                      height: "300px",
                      objectFit: "cover",
                    }}
                  />

                  <div className="card-body p-4">
                    <h4 className="fw-bold">
                      {category.name}
                    </h4>

                    <p
                      style={{
                        color: "#aaa",
                      }}
                    >
                      {category.description}
                    </p>

                    <a
                      href="#products"
                      className="fw-semibold text-decoration-none"
                      style={{
                        color: "#c89b6d",
                      }}
                    >
                      Explore Collection →
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================
          PRODUCTS
      ========================= */}
      <section
        id="products"
        className="py-5"
      >
        <div className="container py-5">
          <div className="text-center mb-5">
            <p
              className="fw-bold text-uppercase"
              style={{
                letterSpacing: "3px",
                color: "#9b6b43",
              }}
            >
              OUR PICKS
            </p>

            <h2 className="display-5 fw-bold">
              Featured Wigs
            </h2>
          </div>

          <div className="row g-4">
            {products.map((product) => (
              <div
                className="col-md-6 col-lg-4"
                key={product.id}
              >
                <div
                  className="card border-0 shadow-sm h-100"
                  style={{
                    borderRadius: "25px",
                    overflow: "hidden",
                    backgroundColor: "#303030",
                    color: "#f5f1eb",
                  }}
                >
                  <div
                    style={{
                      height: "390px",
                      position: "relative",
                    }}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-100 h-100"
                      style={{
                        objectFit: "cover",
                      }}
                    />

                    <span
                      className="badge position-absolute top-0 start-0 m-3 px-3 py-2 rounded-pill"
                      style={{
                        backgroundColor: "#171717",
                      }}
                    >
                      {product.badge}
                    </span>
                  </div>

                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center">
                      <h4
                        className="fw-bold mb-0"
                        style={{
                          fontStyle: "italic",
                          fontFamily:
                            "Playfair Display, serif",
                        }}
                      >
                        {product.name}
                      </h4>

                      <span
                        style={{
                          color: "#ddd",
                        }}
                      >
                        ⭐ {product.rating}
                      </span>
                    </div>

                    <p
                      className="fw-bold fs-5 mt-3"
                      style={{
                        color: "#c89b6d",
                      }}
                    >
                      KSh{" "}
                      {product.price.toLocaleString()}
                    </p>

                    <button
                      onClick={() =>
                        addToCart(product)
                      }
                      className="btn btn-dark w-100 rounded-pill py-2"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================
          BRAND STATEMENT
      ========================= */}
      <section
        className="py-5 text-white text-center"
        style={{
          backgroundColor: "#171717",
          borderTop:
            "1px solid #3d3d3d",
          borderBottom:
            "1px solid #3d3d3d",
        }}
      >
        <div className="container py-5">
          <p
            className="text-uppercase fw-bold"
            style={{
              letterSpacing: "4px",
              color: "#c89b6d",
            }}
          >
            ELEGANT K WIGS
          </p>

          <h2
            className="display-5 fw-bold"
            style={{
              fontStyle: "italic",
              fontFamily:
                "Playfair Display, serif",
            }}
          >
            Because every woman deserves
            <br />
            to feel{" "}
            <span
              style={{
                color: "#c89b6d",
              }}
            >
              extraordinary.
            </span>
          </h2>
        </div>
      </section>

      {/* =========================
          FOOTER
      ========================= */}
      <footer
        className="py-5"
        style={{
          backgroundColor: "#171717",
          color: "#f5f1eb",
        }}
      >
        <div className="container text-center">
          <h4
            className="fw-bold"
            style={{
              fontStyle: "italic",
              fontFamily:
                "Playfair Display, serif",
            }}
          >
            Elegant{" "}
            <span
              style={{
                color: "#c89b6d",
              }}
            >
              K
            </span>{" "}
            Wigs
          </h4>

          <p
            style={{
              color: "#aaa",
            }}
          >
            Premium beauty. Effortless elegance.
          </p>

          <small
            style={{
              color: "#777",
            }}
          >
            © 2026 Elegant K Wigs. All rights
            reserved.
          </small>
        </div>
      </footer>

      {/* =========================
          CART
      ========================= */}
      {showCart && (
        <>
          {/* CART BACKDROP */}
          <div
            onClick={() =>
              setShowCart(false)
            }
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor:
                "rgba(0,0,0,0.45)",
              zIndex: 1999,
            }}
          ></div>

          {/* CART PANEL */}
          <div
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              width: "400px",
              maxWidth: "100%",
              height: "100vh",
              backgroundColor: "#242424",
              color: "#f5f1eb",
              zIndex: 2000,
              boxShadow:
                "-5px 0 25px rgba(0,0,0,0.35)",
              padding: "30px",
              overflowY: "auto",
            }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <h3 className="fw-bold">
                Your Cart
              </h3>

              <button
                onClick={() =>
                  setShowCart(false)
                }
                className="btn btn-light rounded-circle"
              >
                ✕
              </button>
            </div>

            <hr
              style={{
                borderColor: "#444",
              }}
            />

            {cart.length === 0 ? (
              <div className="text-center py-5">
                <div
                  style={{
                    fontSize: "50px",
                  }}
                >
                  🛍️
                </div>

                <h5 className="mt-3">
                  Your cart is empty
                </h5>

                <p
                  style={{
                    color: "#aaa",
                  }}
                >
                  Add a beautiful wig to get
                  started.
                </p>
              </div>
            ) : (
              <>
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="border-bottom pb-3 mb-3"
                  >
                    <div className="d-flex gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{
                          width: "80px",
                          height: "80px",
                          objectFit: "cover",
                          borderRadius: "12px",
                        }}
                      />

                      <div className="flex-grow-1">
                        <h6 className="fw-bold">
                          {item.name}
                        </h6>

                        <p
                          className="mb-2 fw-semibold"
                          style={{
                            color: "#c89b6d",
                          }}
                        >
                          KSh{" "}
                          {item.price.toLocaleString()}
                        </p>

                        <div className="d-flex align-items-center gap-2">
                          <button
                            onClick={() =>
                              changeQuantity(
                                item.id,
                                -1
                              )
                            }
                            className="btn btn-sm"
                            style={{
                              backgroundColor:
                                "#3a3a3a",
                              color: "#f5f1eb",
                            }}
                          >
                            −
                          </button>

                          <span>
                            {item.quantity}
                          </span>

                          <button
                            onClick={() =>
                              changeQuantity(
                                item.id,
                                1
                              )
                            }
                            className="btn btn-sm"
                            style={{
                              backgroundColor:
                                "#3a3a3a",
                              color: "#f5f1eb",
                            }}
                          >
                            +
                          </button>

                          <button
                            onClick={() =>
                              removeFromCart(
                                item.id
                              )
                            }
                            className="btn btn-sm text-danger ms-auto"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* CART TOTAL */}
                <div className="mt-4">
                  <div className="d-flex justify-content-between fs-5 fw-bold">
                    <span>Total</span>

                    <span>
                      KSh{" "}
                      {totalPrice.toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setShowCart(false);
                      setShowCheckout(true);
                    }}
                    className="btn btn-dark w-100 rounded-pill mt-4 py-3"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* =========================
          CHECKOUT
      ========================= */}
      {showCheckout && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor:
              "rgba(25,20,15,0.72)",
            zIndex: 3000,
            overflowY: "auto",
            padding: "30px 15px",
          }}
        >
          <div
            className="mx-auto p-4 p-md-5"
            style={{
              maxWidth: "650px",
              borderRadius: "28px",
              backgroundColor: "#f7f1e8",
              color: "#24201c",
              border: "1px solid #ded0bd",
              boxShadow:
                "0 25px 70px rgba(0,0,0,0.35)",
            }}
          >
            {/* CHECKOUT HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <p
                  className="text-uppercase fw-bold mb-1"
                  style={{
                    letterSpacing: "4px",
                    color: "#a8784e",
                    fontSize: "12px",
                  }}
                >
                  YOUR ELEGANT K EXPERIENCE
                </p>

                <h2
                  className="fw-bold mb-0"
                  style={{
                    fontStyle: "italic",
                    fontFamily:
                      "Playfair Display, serif",
                    fontSize: "42px",
                  }}
                >
                  Complete Your Order
                </h2>
              </div>

              <button
                onClick={() =>
                  setShowCheckout(false)
                }
                className="btn btn-light rounded-circle"
              >
                ✕
              </button>
            </div>

            <hr
              style={{
                borderColor: "#d8c8b5",
                opacity: 1,
              }}
            />

            {/* DELIVERY DETAILS */}
            <h5
              className="fw-bold mb-3"
              style={{
                fontFamily:
                  "Playfair Display, serif",
                fontStyle: "italic",
                color: "#2a241f",
              }}
            >
              Delivery Details
            </h5>

            {/* NAME */}
            <div className="mb-3">
              <label className="form-label fw-semibold">
                Full Name
              </label>

              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="Enter your full name"
                value={customer.name}
                onChange={(e) =>
                  setCustomer({
                    ...customer,
                    name: e.target.value,
                  })
                }
              />
            </div>

            {/* PHONE */}
            <div className="mb-3">
              <label className="form-label fw-semibold">
                Phone Number
              </label>

              <input
                type="tel"
                className="form-control form-control-lg"
                placeholder="07XXXXXXXX"
                value={customer.phone}
                onChange={(e) =>
                  setCustomer({
                    ...customer,
                    phone: e.target.value,
                  })
                }
              />
            </div>

            {/* LOCATION */}
            <div className="mb-3">
              <label className="form-label fw-semibold">
                Delivery Location
              </label>

              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="e.g. Ruai, Nairobi"
                value={customer.location}
                onChange={(e) =>
                  setCustomer({
                    ...customer,
                    location: e.target.value,
                  })
                }
              />
            </div>

            {/* NOTES */}
            <div className="mb-4">
              <label className="form-label fw-semibold">
                Order Notes{" "}
                <span className="text-secondary">
                  (Optional)
                </span>
              </label>

              <textarea
                className="form-control"
                rows="3"
                placeholder="Any special instructions?"
                value={customer.notes}
                onChange={(e) =>
                  setCustomer({
                    ...customer,
                    notes: e.target.value,
                  })
                }
              />
            </div>

            {/* ORDER SUMMARY */}
            <div
              className="p-4 mb-4"
              style={{
                backgroundColor: "#eee4d6",
                borderRadius: "20px",
                border:
                  "1px solid #d8c8b5",
              }}
            >
              <h5 className="fw-bold mb-3">
                Order Summary
              </h5>

              {cart.map((item) => (
                <div
                  key={item.id}
                  className="d-flex justify-content-between mb-2"
                >
                  <span>
                    {item.name} × {item.quantity}
                  </span>

                  <span className="fw-semibold">
                    KSh{" "}
                    {(
                      item.price *
                      item.quantity
                    ).toLocaleString()}
                  </span>
                </div>
              ))}

              <hr />

              <div className="d-flex justify-content-between fs-5 fw-bold">
                <span>Total</span>

                <span
                  style={{
                    color: "#9b6b43",
                  }}
                >
                  KSh{" "}
                  {totalPrice.toLocaleString()}
                </span>
              </div>
            </div>

          

            {/* PAY WITH M-PESA */}
<button
  onClick={payWithMpesa}
  className="btn btn-lg w-100 rounded-pill py-3 mb-3"
  style={{
    backgroundColor: "#198754",
    border: "none",
    color: "white",
    fontWeight: "600",
  }}
>
  Pay with M-Pesa
</button>

{/* PLACE ORDER ON WHATSAPP */}
<button
  onClick={placeOrder}
  className="btn btn-lg w-100 rounded-pill py-3"
  style={{
    backgroundColor: "#9b6b43",
    border: "none",
    color: "white",
    fontWeight: "600",
  }}
>
  Place Order on WhatsApp
</button>

<p className="text-center text-secondary mt-3 mb-0">
  Choose M-Pesa for payment or WhatsApp to confirm your order.
</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;