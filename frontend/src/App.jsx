import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Homepage from "./views/Homepage";
import Login from "./views/Login";
import Signup from "./views/Signup";
import MainContainer from "./layouts/MainContainer";
import Videopage from "./views/Videopage";
import Profilepage from "./views/Profilepage";
import ChannelVideos from "./components/ChannelVideos";
import Postpage from "./views/Postpage";
import ChannelPosts from "./components/ChannelPosts";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import PlaylistsPage from "./views/Playlistpage";
import PlaylistDetails from "./pages/PlaylistDetails";
import AuthCallback from "./components/AuthCallback";
import History from "./pages/History";
import Likedpage from "./pages/Likedpage";

function App() {
  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Homepage />}>
          <Route index element={<MainContainer />} />
          <Route path="video/:videoId" element={<Videopage />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="profile" element={<Profilepage />} />
          <Route path="channel/:channelId" element={<ChannelVideos />} />
          <Route path="post/:userId" element={<ChannelPosts />} />
          <Route path="posts" element={<Postpage />} />
          <Route path="/playlists" element={<PlaylistsPage />} />
          <Route path="/playlists/:playlistId" element={<PlaylistDetails />} />
          <Route path="/history" element={<History />} />
          <Route path="/liked" element={<Likedpage />} />
        </Route>
        <Route path="/auth-callback" element={<AuthCallback />} />
      </Routes>
    </>
  );
}

export default App;
