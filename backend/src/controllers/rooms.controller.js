import Room from "../models/rooms.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import crypto from "crypto";

// CREATE ROOM
export const createRoom = asyncHandler(async (req, res) => {
    const {
        name,
        password,
        isPrivate,
        maxParticipants,
    } = req.body;

    if (!name?.trim()) {
        throw new apiError(400, "Room name is required.");
    }

    if (isPrivate && !password?.trim()) {
        throw new apiError(
            400,
            "Password is required for a private room."
        );
    }

    const room = await Room.create({
        name: name.trim(),

        // IMPORTANT
        roomId: crypto.randomBytes(6).toString("hex"),

        password: isPrivate ? password.trim() : null,

        isPrivate: Boolean(isPrivate),

        maxParticipants: maxParticipants || 10,
    });

    return res.status(201).json(
        new apiResponse(
            201,
            {
                roomId: room._id,
                roomCode: room.roomId,
                name: room.name,
                isPrivate: room.isPrivate,
                maxParticipants: room.maxParticipants,
            },
            "Room created successfully."
        )
    );
});


// UPDATE ROOM
export const updateRoom = asyncHandler(async (req, res) => {
    const { roomId } = req.params;
    const {
        name,
        password,
        isPrivate,
        maxParticipants,
    } = req.body;

    const room = await Room.findOne({ roomId });

    if (!room) {
        throw new apiError(404, "Room not found.");
    }

    if (name !== undefined) {
        if (!name.trim()) {
            throw new apiError(400, "Room name cannot be empty.");
        }

        room.name = name.trim();
    }

    if (isPrivate !== undefined) {
        room.isPrivate = isPrivate;
    }

    if (maxParticipants !== undefined) {
        room.maxParticipants = maxParticipants;
    }

    if (password !== undefined) {
        room.password = password || null;
    }

    // Don't keep a password if room is public
    if (!room.isPrivate) {
        room.password = null;
    }

    await room.save();

    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                room,
                "Room updated successfully."
            )
        );
});


// DELETE ROOM
export const deleteRoom = asyncHandler(async (req, res) => {
    const { roomId } = req.params;

    const room = await Room.findOne({ roomId });

    if (!room) {
        throw new apiError(404, "Room not found.");
    }

    await Room.deleteOne({ _id: room._id });

    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                null,
                "Room deleted successfully."
            )
        );
});


// TOGGLE ROOM STATUS
export const toggleRoomStatus = asyncHandler(async (req, res) => {
    const { roomId } = req.params;

    const room = await Room.findOne({ roomId });

    if (!room) {
        throw new apiError(404, "Room not found.");
    }

    room.isActive = !room.isActive;

    await room.save();

    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                room,
                `Room ${
                    room.isActive ? "activated" : "deactivated"
                } successfully.`
            )
        );
});


// GET ROOM
export const getRoom = asyncHandler(async (req, res) => {
    const { roomId } = req.params;

    const room = await Room.findOne({ roomId });

    if (!room) {
        throw new apiError(404, "Room not found.");
    }

    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                room,
                "Room fetched successfully."
            )
        );
});


// JOIN ROOM
export const joinRoom = asyncHandler(async (req, res) => {
    const { roomId } = req.params;
    const { password } = req.body;

    const room = await Room.findOne({ roomId });

    if (!room) {
        throw new apiError(404, "Room not found.");
    }

    if (!room.isActive) {
        throw new apiError(
            400,
            "Room is currently inactive."
        );
    }

    if (room.isPrivate) {
        if (!password) {
            throw new apiError(
                400,
                "Password is required."
            );
        }

        const isCorrect = await room.isPasswordCorrect(password);

        if (!isCorrect) {
            throw new apiError(
                401,
                "Incorrect room password."
            );
        }
    }

    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                {
                    roomId: room._id,
                    roomCode: room.roomId,
                    name: room.name,
                    isPrivate: room.isPrivate,
                    maxParticipants: room.maxParticipants,
                },
                "Joined room successfully."
            )
        );
});