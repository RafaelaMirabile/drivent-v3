import { prisma } from "@/config";

async function findHotels() {
  return prisma.hotel.findMany();
}

async function findHotelRooms(idHotel: number) {
  return prisma.hotel.findMany({
    where: {
      id: idHotel
    },
    include: {
      Rooms: true
    }
  });
}

const hotelRepository = {
  findHotels,
  findHotelRooms
};

export default hotelRepository;
