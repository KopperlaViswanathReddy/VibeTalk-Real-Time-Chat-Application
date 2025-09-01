import { useSelector } from "react-redux";

const MessagesList = () => {
  const { messages } = useSelector((state) => state.chat);
  const currentUserId = localStorage.getItem("userId"); // Assuming you're storing logged-in user ID

  return (
    <div className="flex flex-col gap-3 p-4 overflow-y-auto h-[calc(100vh-150px)] bg-white">
      {messages.map((msg) => {
        const isSender = msg.senderId === currentUserId;

        return (
          <div
            key={msg._id}
            className={`flex ${isSender ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs p-3 rounded-lg text-sm shadow-md ${
                isSender
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-gray-200 text-black rounded-bl-none"
              }`}
            >
              {/* Show media if available */}
              {msg.media && msg.media.includes("http") && (
                <div className="mb-2">
                  {msg.media.endsWith(".mp4") ? (
                    <video
                      src={msg.media}
                      controls
                      className="max-w-[200px] rounded-md"
                    />
                  ) : (
                    <img
                      src={msg.media}
                      alt="media"
                      className="max-w-[200px] rounded-md"
                    />
                  )}
                </div>
              )}

              {/* Show text */}
              {msg.text}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessagesList;
