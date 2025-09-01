import { Image, Send, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { sendMessage, pushNewMessage, updatePendingMessage } from "../store/slices/chatSlice";
import { getSocket } from "../lib/socket";
import { v4 as uuid } from "uuid";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [mediaPreview, setMediaPreview] = useState(null);
  const [media, setMedia] = useState(null);
  const [mediaType, setMediaType] = useState("");

  const fileInputRef = useRef(null);
  const dispatch = useDispatch();
  const { selectedUser } = useSelector((state) => state.chat);

  // Handle file selection
  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setMedia(file);
    const type = file.type;

    if (type.startsWith("image/")) {
      setMediaType("image");
      const reader = new FileReader();
      reader.onload = () => setMediaPreview(reader.result);
      reader.readAsDataURL(file);
    } else if (type.startsWith("video/")) {
      setMediaType("video");
      setMediaPreview(URL.createObjectURL(file));
    } else {
      toast.error("Please select an image or video file.");
      setMedia(null);
      setMediaPreview(null);
      setMediaType("");
    }
  };

  // Remove attached media
  const removeMedia = () => {
    setMedia(null);
    setMediaPreview(null);
    setMediaType("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!selectedUser?._id) {
      toast.error("Please select a user before sending a message.");
      return;
    }
    if (!text.trim() && !media) return;

    const formData = new FormData();
    formData.append("text", text.trim());
    if (media) formData.append("media", media);

    // Create a temporary ID for optimistic updates
    const tempId = uuid();
    const tempMessage = {
      _id: tempId,
      text,
      media: mediaPreview || null,
      senderId: localStorage.getItem("userId"), // assuming userId is stored in localStorage
      receiverId: selectedUser._id,
      createdAt: new Date().toISOString(),
      isTemp: true,
    };

    // Push message immediately to UI
    dispatch(pushNewMessage(tempMessage));

    // Dispatch sendMessage to server
    const resultAction = await dispatch(
      sendMessage({ data: formData, receiverId: selectedUser._id, tempId })
    );

    if (sendMessage.fulfilled.match(resultAction)) {
      dispatch(
        updatePendingMessage({
          tempId,
          serverMessage: resultAction.payload.serverMessage,
        })
      );
      setText("");
      removeMedia();
    }
  };

  // Listen for new messages via socket
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      if (
        newMessage.senderId === selectedUser?._id ||
        newMessage.receiverId === selectedUser?._id
      ) {
        dispatch(pushNewMessage(newMessage));
      }
    };

    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [selectedUser?._id, dispatch]);

  return (
    <div className="p-4 w-full">
      {/* Media Preview */}
      {mediaPreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            {mediaType === "image" ? (
              <img
                src={mediaPreview}
                alt="Preview"
                className="w-20 h-20 object-cover rounded-lg border border-gray-700"
              />
            ) : (
              <video
                src={mediaPreview}
                controls
                className="w-32 h-20 object-cover rounded-lg border border-gray-700"
              />
            )}
            <button
              onClick={removeMedia}
              type="button"
              className="absolute -top-2 right-2 w-5 h-5 bg-zinc-800 text-white rounded-full flex items-center justify-center hover:bg-black"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          {/* Hidden File Input */}
          <input
            type="file"
            accept="image/*,video/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleMediaChange}
          />

          {/* Attach Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 hover:border-gray-400 transition ${
              mediaPreview ? "text-emerald-500" : "text-gray-400"
            }`}
          >
            <Image size={20} />
          </button>
        </div>

        {/* Send Button */}
        <button
          type="submit"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
          disabled={!text.trim() && !media}
        >
          <Send size={22} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
