import app, { init } from "@/app";
import faker from "@faker-js/faker";
import httpStatus from "http-status";
import supertest from "supertest";
import { createEnrollmentWithAddress, createTicket, createTicketType, createTicketTypeNoRemoteWhithHotel, createUser } from "../factories";
import { cleanDb, generateValidToken } from "../helpers";
import * as jwt from "jsonwebtoken";
import { createHotel, createRoom } from "../factories/hotel-factory";
import { TicketStatus } from "@prisma/client";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe("GET /hotels", () => {
  it("should respond with satus 401 if no token is given", async () => {
    const response = await server.get("/hotels");
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if token is not valid", async () => {
    const token = faker.lorem.word();
    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with sattus 401 if there is not session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/hotels").set("Authorizaion", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 401 when there is no enrollment", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should recive 401 if enrollment exists and ticket is reserved", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
    
    it("should respond with status 401 when enrollment exist and there is no accommodation included or no paid out ticket", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should return 200 and empty array when there are not registered hotels", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeNoRemoteWhithHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.OK);
    });

    it("should respond with status 200 when enrollmet exist and accommodation is included and ticket is paid", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeNoRemoteWhithHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const hotel = await createHotel();
      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: hotel.id,
            name: hotel.name,
            image: hotel.image,
            createdAt: hotel.createdAt.toISOString(),
            updatedAt: hotel.updatedAt.toISOString()
          })
        ])
      );
    });
  });
});

describe("GET /hotels/:hotelId", () => {
  it("should respond with satus 401 if no token is given", async () => {
    const response = await server.get("/hotels/:hotelId");
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if token is not valid", async () => {
    const token = faker.lorem.word();
    const response = await server.get("/hotels/:hotelId").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with sattus 401 if there is not session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/hotels/:hotelId").set("Authorizaion", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 401 when there is no enrollment", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 400 when hotelId isNan", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.get("/hotels/:hotelId").set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    it("should response with 200 and empty array when there is enrollment but HotelId dont exist", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);
      const hotel = await createHotel();

      const response = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.OK);
    });

    it("should respond with 200 when there is enrollment and hotelsRooms", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);
      const hotel = await createHotel();
      const room = await createRoom(hotel.id);

      const response = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: hotel.id,
            name: hotel.name,
            image: hotel.image,
            createdAt: hotel.createdAt.toISOString(),
            updatedAt: hotel.updatedAt.toISOString(),
            Rooms: expect.arrayContaining([
              expect.objectContaining({
                id: room.id,
                name: room.name,
                capacity: room.capacity,
                hotelId: hotel.id,
                createdAt: room.createdAt.toISOString(),
                updatedAt: room.updatedAt.toISOString()
              })
            ])
          })
        ])
      );
    });
  });
});

