import { Search, SentimentDissatisfied } from "@mui/icons-material";
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import ProductCard from "./ProductCard";
import "./Products.css";
import Cart, { generateCartItemsFrom } from "./Cart";

// Definition of Data Structures used
/**
 * @typedef {Object} Product - Data on product available to buy
 *
 * @property {string} name - The name or title of the product
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} _id - Unique ID for the product
 */

const Products = () => {
  const loggedIn = window.localStorage.getItem("username");
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState("");
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [productNotFound, setProductNotFound] = useState(false);
  const [timer, setTimer] = useState("");
  const [userCart, setUserCart] = useState([]);

  console.log(userCart);

  const { enqueueSnackbar } = useSnackbar();
  // TODO: CRIO_TASK_MODULE_PRODUCTS - Fetch products data and store it
  /**
   * Make API call to get the products list and store it to display the products
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on all available products
   *
   * API endpoint - "GET /products"
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "name": "iPhone XR",
   *          "category": "Phones",
   *          "cost": 100,
   *          "rating": 4,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "v4sLtEcMpzabRyfx"
   *      },
   *      {
   *          "name": "Basketball",
   *          "category": "Sports",
   *          "cost": 100,
   *          "rating": 5,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "upLK9JbQ4rMhTwt4"
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 500
   * {
   *      "success": false,
   *      "message": "Something went wrong. Check the backend console for more details"
   * }
   */
  const performAPICall = async () => {
    try {
      setLoading(true);
      const url = config.endpoint;
      const product = await axios.get(`${url}/products`);
      setProducts(product.data);
      return product.data;
    } catch (error) {
      console.log(error.message);
    } finally {
      setLoading(false);
    }
  };

  //console.log(products);

  useEffect(() => {
    async function onLoad() {
      const product = await performAPICall();
      let token = localStorage.getItem("token");
      if (token) {
        setToken(token);
        const cartItems = await fetchCart(token);
        setUserCart(cartItems);
        const cart = generateCartItemsFrom(cartItems, product);
        setCart(cart);
      }
    }
    onLoad();
  }, []);

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Implement search logic
  /**
   * Definition for search handler
   * This is the function that is called on adding new search keys
   *
   * @param {string} text
   *    Text user types in the search bar. To filter the displayed products based on this text.
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on filtered set of products
   *
   * API endpoint - "GET /products/search?value=<search-query>"
   *
   */
  const performSearch = async (text) => {
    try {
      const url = config.endpoint;
      const product = await axios
        .get(`${url}/products/search?value=${text}`)
        .catch((e) => setProductNotFound(true));

      if (product.data) {
        setProductNotFound(false);
        setProducts(product.data);
      }
    } catch (e) {
      console.log(e.message);
    }
  };

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Optimise API calls with debounce search implementation
  /**
   * Definition for debounce handler
   * With debounce, this is the function to be called whenever the user types text in the searchbar field
   *
   * @param {{ target: { value: string } }} event
   *    JS event object emitted from the search input field
   *
   * @param {NodeJS.Timeout} debounceTimeout
   *    Timer id set for the previous debounce call
   *
   */
  const debounceSearch = (event, debounceTimeout) => {
    clearTimeout(debounceTimeout);

    const newTimer = setTimeout(() => performSearch(event), 500);
    setTimer(newTimer);
  };

  async function fetchCart(token) {
    if (!token) return;

    try {
      let url = config.endpoint + "/cart";
      let cartData = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return cartData.data;
    } catch (e) {
      if (e.response && e.response.status === 400) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not fetch cart details. Check if the backend is running, reachable and returns a valid JSON.",
          {
            variant: "error",
          }
        );
      }
      return null;
    }
  }

  const isItemInCart = (items, productId) => {
    for (let i = 0; i < items.length; i++) {
      if (items[i]["_id"] === productId) {
        enqueueSnackbar(
          "Item already in cart. Use the cart sidebar to update quantity or remove item.",
          { variant: "warning" }
        );
        return true;
      }
    }
    return false;
  };

  const addToCart = async (
    token,
    items,
    products,
    productId,
    qty,
    options = { preventDuplicate: false }
  ) => {
    console.log(items);
    if (options.preventDuplicate === true) {
      try {
        let url = config.endpoint + "/cart";
        let res = await axios.post(
          url,
          { productId: productId, qty: qty },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const cartData = await generateCartItemsFrom(res.data, products);
        setCart(cartData);
      } catch (e) {
        console.log(e);
      }
    } else {
      let index;
      for (let i = 0; i < items.length; i++) {
        if (items[i]["productId"] === productId) {
          index = i;
        }
        console.log(index);
      }
      if (options.preventDuplicate === "handleAdd") {
        items[index]["qty"]++;
      } else {
        items[index]["qty"]--;
      }
      let url = config.endpoint + "/cart";
      let res = await axios.post(
        url,
        { productId: productId, qty: items[index]["qty"] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const cartData = await generateCartItemsFrom(res.data, products);
      setCart(cartData);
    }
  };

  let addItems = (e) => {
    if (!loggedIn) {
      enqueueSnackbar("Login to add an item to the Cart", {
        variant: "warning",
      });
    } else {
      let result = isItemInCart(cart, e.target.value);
      if (!result) {
        addToCart(token, userCart, products, e.target.value, 1, {
          preventDuplicate: true,
        });
      } else {
        enqueueSnackbar(
          "Item already in cart. Use the cart sidebar to update quantity or remove item.",
          { variant: "warning" }
        );
      }
    }
  };

  const onButtonClick = (id, handle) => {
    console.log(id);
    addToCart(token, userCart, products, id, null, {
      preventDuplicate: handle,
    });
  };

  return (
    <>
      <div>
        <Header hasHiddenAuthButtons={false}>
          {/* TODO: CRIO_TASK_MODULE_PRODUCTS - Display search bar in the header for Products page */}
          <TextField
            className="search-desktop"
            size="small"
            placeholder="Search for items/categories"
            name="search"
            onChange={(e) => debounceSearch(e.target.value, timer)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Search color="primary" />
                </InputAdornment>
              ),
            }}
          />
        </Header>

        {/* Search view for mobiles */}
        <TextField
          className="search-mobile"
          size="small"
          fullWidth
          onChange={(e) => debounceSearch(e.target.value, timer)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Search color="primary" />
              </InputAdornment>
            ),
          }}
          placeholder="Search for items/categories"
          name="search"
        />
        <Grid container>
          <Grid item className="product-grid">
            <Box className="hero">
              <p className="hero-heading">
                India’s <span className="hero-highlight">FASTEST DELIVERY</span>{" "}
                to your door step
              </p>
            </Box>
          </Grid>
        </Grid>
        <Box
          sx={{ flexGrow: 1 }}
          style={{ padding: "1rem", marginLeft: "1rem", marginRight: "1rem" }}
        >
          {loading ? (
            <div className="loading">
              <CircularProgress />
              <h3>Loading Products...</h3>
            </div>
          ) : !productNotFound ? (
            <>
              <Grid container>
                <Grid item xs={12} md={9}>
                  <Grid
                    container
                    spacing={{ xs: 2, md: 3, lg: 3 }}
                    display="flex"
                  >
                    {products.map((product, id) => (
                      <Grid item md={3} xs={6} mt={2} mb={2} key={id}>
                        <ProductCard
                          product={product}
                          handleAddToCart={addItems}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
                {loggedIn && (
                  <Grid item md={3} sm={12} sx={{ backgroundColor: "#E9F5E1" }}>
                    <Cart
                      products={products}
                      items={cart}
                      handleQuantity={onButtonClick}
                    />
                  </Grid>
                )}
              </Grid>
            </>
          ) : (
            <div className="loading">
              <SentimentDissatisfied />
              <h3>No Products Found!</h3>
            </div>
          )}
        </Box>
        <Footer />
      </div>
    </>
  );
};

export default Products;
