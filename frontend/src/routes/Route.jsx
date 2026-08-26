import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router";
import Home from "../pages/Home";
import CreateRoom from "../pages/CreateRoom";
import JoinRoom from "../pages/JoinRoom";
import Room from "../pages/Room";
import MyRooms from "../pages/MyRooms";

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route>
        <Route path="/">
            <Route index element={<Home/>}/>
            <Route path="create-room" element={<CreateRoom/>}/>
            <Route path="rooms" element={<MyRooms/>}/>
            <Route path="join-room" element={<JoinRoom/>}/>
            <Route path="room/:roomId" element={<Room/>}/>
        </Route>
        </Route>
    )
)

export default router