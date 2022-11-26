import { getHotelRooms, getHotels } from "@/controllers/hotel-controller";
import { authenticateToken } from "@/middlewares";
import { Router } from "express";

const hotelsRouter = Router();

hotelsRouter
  .all("/*", authenticateToken)
  .get("/", getHotels)
  .get("/:hotelId", getHotelRooms);

export default hotelsRouter;
