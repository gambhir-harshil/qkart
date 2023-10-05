import { AddShoppingCartOutlined } from "@mui/icons-material";
import {
  Button,
  Card,
  CardActions,
  CardActionArea,
  CardContent,
  CardMedia,
  Rating,
  Typography,
} from "@mui/material";
import React from "react";
import "./ProductCard.css";

const ProductCard = ({ product, handleAddToCart }) => {
  const { _id, cost, image, rating, name } = product;

  return (
    <Card className="card">
      <CardActionArea>
        <CardMedia
          component="img"
          height="240"
          image={image}
          alt={name}
          style={{ objectFit: "cover" }}
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {name}
          </Typography>
          <Typography>${cost}</Typography>
          <Typography>
            <Rating name="read-only" value={rating} readOnly />
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions>
        <Button
          fullWidth
          color="primary"
          variant="contained"
          value={_id}
          onClick={handleAddToCart}
        >
          <AddShoppingCartOutlined /> add to cart
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;
