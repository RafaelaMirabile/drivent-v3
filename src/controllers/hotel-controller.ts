import { AuthenticatedRequest } from "@/middlewares";
import hotelService from "@/services/hotel-service";
import { Response } from "express";
import httpStatus from "http-status";

export async function getHotels(req: AuthenticatedRequest, res: Response) {
  try {
    const { userId } = req;
    const hotelList = await hotelService.getHotels(userId);

    if (hotelList.length === 0) {
      return res.status(httpStatus.OK).send([]);
    }
    return res.status(httpStatus.OK).send(hotelList);
  } catch (error) {
    if (error.name === "UnauthorizedError") {
      return res.sendStatus(httpStatus.UNAUTHORIZED);
    }
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}

export async function getHotelRooms(req: AuthenticatedRequest, res: Response) {
  try {
    const { hotelId } = req.params;
    const { userId } = req;

    const idHotel = Number(hotelId);

    if (isNaN(idHotel)) {
      return res.sendStatus(httpStatus.BAD_REQUEST);
    }

    const hotelRooms = await hotelService.getHotelRooms(idHotel, userId);

    return res.status(httpStatus.OK).send(hotelRooms);
  } catch (error) {
    if (error.name === "UnauthorizedError") {
      return res.sendStatus(httpStatus.UNAUTHORIZED);
    }
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}

