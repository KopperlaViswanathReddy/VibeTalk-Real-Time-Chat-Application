import { X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedUser } from "../store/slices/chatSlice";

const ChatHeader = () => {
  const { selectedUser } = useSelector((state) => state.chat);
  const { onlineUsers } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  if (!selectedUser) return null; // Avoid errors if no user is selected

  const isOnline = onlineUsers.includes(selectedUser._id);

  return (
    <div className="p-3 border-b bg-gray-200 ring-1 ring-gray-300">
      <div className="flex items-center justify-between">
        {/* USER INFO */}
        <div className="flex items-center gap-3">
          {/* AVATAR */}
          <div className="relative w-10 h-10">
            <img
              src={selectedUser.avatar?.url || "/avatar-holder.avif"}
              alt={`${selectedUser.fullName} avatar`}
              className="w-full h-full object-cover rounded-full"
            />
            {isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-white border-2 rounded-full" />
            )}
          </div>

          {/* NAME & STATUS */}
          <div>
            <h3 className="font-medium text-base text-black truncate max-w-[140px] lg:max-w-[200px]">
              {selectedUser.fullName}
            </h3>
            <p className="text-sm text-black">{isOnline ? "Online" : "Offline"}</p>
          </div>
        </div>

        {/* CLOSE BUTTON */}
        <button
          onClick={() => dispatch(setSelectedUser(null))}
          aria-label="Close chat"
          className="text-gray-800 hover:text-black hover:bg-gray-300 rounded-full p-1 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
