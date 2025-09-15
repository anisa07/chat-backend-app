Backend for a real-time chat application using Nest.js, WebSocket, TypeScript, Firestore with the following features:

- **Real-Time Communication:** Utilized WebSocket to enable instantaneous message delivery between participants, ensuring seamless real-time communication.
- **Participant Matching System:** Implemented a participant pool where users can find and connect with available participants for conversations.
- **Message Persistence:** Integrated Firestore to store conversation histories, allowing users to retrieve past messages and continue discussions seamlessly.
- **User Presence Management:** Managed typing, online and offline status of users to update message delivery mechanisms accordingly. Online users receive messages in real-time, while offline users can retrieve missed conversations upon returning.
- **Scalability and Performance:** Designed the backend to handle multiple concurrent connections efficiently, ensuring smooth performance even under heavy load.

<img src="https://github.com/anisa07/chat-backend-app/blob/main/scheme/scheme.png" />

**Important API points:**

POST Create message

```
/archive
```

GET user conversations (indexing by date)

```
/archive/:userId/:date
```

GET user conversation messages (indexing by date)

```
/archive/coversation/:userId/:conversationId/:date
```

PUT update conversation messages

```
/archive/coversation/:conversationId/messages
```
