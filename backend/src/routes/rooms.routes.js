import Router from "router"
import { createRoom, deleteRoom, getRoom, joinRoom, toggleRoomStatus, updateRoom } from "../controllers/rooms.controller.js"

const router = Router()

router.route("/create-room").post(createRoom)
router.route("/update-room/:roomId").post(updateRoom)
router.route("/delete-room/:roomId").post(deleteRoom)
router.route("/get-room/roomId").get(getRoom)
router.route("toggleStatus/:roomId").post(toggleRoomStatus)
router.route("/join-room/:roomId").post(joinRoom)

export default router