import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// In-memory message store
const messages: { sender: string; message: string }[] = [];

// Define the body structure
interface SendMessageBody {
  sender: string;
  message: string;
}

// POST /send-message
app.post(
  "/send-message",
  async (
    req: Request<{}, {}, SendMessageBody>,
    res: Response
  ): Promise<Response> => {
    try {
      const { sender, message } = req.body;

      if (!sender || !message) {
        return res.status(400).json({ error: "Sender and message are required." });
      }

      await new Promise((resolve) => setTimeout(resolve, 100)); // simulate async

      messages.push({ sender, message });

      return res.status(200).json({ success: true, message: "Message sent." });
    } catch (error) {
      return res.status(500).json({ error: "An unexpected error occurred." });
    }
  }
);

// GET /messages
app.get("/messages", (req: Request, res: Response) => {
  res.status(200).json(messages);
});

// Root
app.get("/", (req: Request, res: Response) => {
  res.send("Server is running!");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
