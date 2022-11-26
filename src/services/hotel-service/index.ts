import { notFoundError, unauthorizedError } from "@/errors";
import enrollmentRepository from "@/repositories/enrollment-repository";
import hotelRepository from "@/repositories/hotel-repository";
import ticketService from "../tickets-service";

async function verifyEnrollmentAndTicekt(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw unauthorizedError();
  }

  const userIdByEnrollment = enrollment.userId;
  const userTicket = await ticketService.getTicketByUserId(userIdByEnrollment);

  if (userTicket.status === "RESERVED") {
    throw unauthorizedError();
  }

  if (userTicket.TicketType.isRemote === true || userTicket.TicketType.includesHotel === false) {
    throw unauthorizedError();
  }
}

async function verifyEnrollment(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw unauthorizedError();
  }
}

async function getHotels(userId: number) {
  await verifyEnrollmentAndTicekt(userId);

  const hotels = await hotelRepository.findHotels();
  
  if (hotels.length === 0) {
    return [];
  }
  return hotels;
}

async function getHotelRooms(idHotel: number, userId: number) {
  await verifyEnrollment(userId);

  const hotelRooms = await hotelRepository.findHotelRooms(idHotel);

  return hotelRooms;
}

const hotelService = {
  getHotels,
  getHotelRooms
};

export default hotelService;
