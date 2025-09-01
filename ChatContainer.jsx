import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMessages } from "../store/slices/chatSlice";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import ChatHeader from "./ChatHeader";

function ChatContainer() {
  const { messages, isMessagesLoading, selectedUser } = useSelector(
    (state) => state.chat
  );
  const { authUser } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const messageEndRef = useRef(null);

  // Fetch messages when selected user changes
  useEffect(() => {
    if (selectedUser?._id) {
      dispatch(getMessages(selectedUser._id));
    }
  }, [selectedUser?._id, dispatch]);

  // Auto-scroll to the latest message
  useEffect(() => {
    if (messageEndRef.current && messages.length > 0) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Format message time
  function formatMessageTime(date) {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  // Loading state
  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      <ChatHeader />

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length > 0 ? (
          messages.map((message, index) => {
            const isSender =
              message.senderId?.toString() === authUser?._id?.toString();

            return (
              <div
                key={message._id || index}
                ref={index === messages.length - 1 ? messageEndRef : null}
                className={`flex items-end ${
                  isSender ? "justify-end" : "justify-start"
                }`}
              >
                {/* Receiver Avatar */}
                {!isSender && (
                  <div className="w-10 h-10 rounded-full overflow-hidden border shrink-0 mr-3">
                    <img
                      src={selectedUser?.avatar?.url || "/avatar-holder.avif"}
                      alt="receiver-avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`max-w-xs sm:max-w-sm md:max-w-md px-4 py-2 rounded-xl text-sm shadow ${
                    isSender
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-gray-200 text-black rounded-bl-none"
                  }`}
                >
                  {/* Handle media messages */}
                  {message.media && (
                    <>
                      {message.media.match(/\.(mp4|webm|mov)$/) ? (
                        <video
                          src={message.media}
                          controls
                          className="w-full rounded-md mb-2"
                        />
                      ) : (
                        <img
                          src={message.media}
                          alt="Attachment"
                          className="w-full rounded-md mb-2"
                        />
                      )}
                    </>
                  )}

                  {/* Text message */}
                  {message.text && <p>{message.text}</p>}

                  {/* Time */}
                  <span className="block text-[10px] mt-1 text-right opacity-70">
                    {message.pending
                      ? "Sending..."
                      : formatMessageTime(message.createdAt)}
                  </span>
                </div>

                {/* Sender Avatar */}
                {isSender && (
                  <div className="w-10 h-10 rounded-full overflow-hidden border shrink-0 ml-3">
                    <img
                      src={authUser?.avatar?.url || "/avatar-holder.avif"}
                      alt="sender-avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="flex justify-center items-center h-full text-gray-400">
            No messages yet. Start the conversation!
          </div>
        )}
      </div>

      {/* Message Input */}
      <MessageInput />
    </div>
  );
}

export default ChatContainer;
