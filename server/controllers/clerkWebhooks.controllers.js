import User from "../models/user.models.js";
import { Webhook } from "svix";

const clerkWebhooks = async (req, res) => {
  try {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
    if (!WEBHOOK_SECRET) {
      throw new Error("You need to add CLERK_WEBHOOK_SECRET to .env file");
    }

    // Get the headers and body
    const headers = req.headers;
    const payload = req.body;

    // Get the Svix headers for verification
    const svix_id = headers["svix-id"];
    const svix_timestamp = headers["svix-timestamp"];
    const svix_signature = headers["svix-signature"];

    // If there are no Svix headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return res.status(400).send("Error occured -- no svix headers");
    }

    // Create a new Svix instance with your secret.
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt;

    // Attempt to verify the incoming webhook
    // If successful, the payload will be available from 'evt'
    // If the verification fails, error out and  return a 400
    try {
      evt = wh.verify(payload, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      });
    } catch (err) {
      console.log("Error verifying webhook:", err.message);
      return res.status(400).json({ success: false, message: err.message });
    }

    // Get the ID and type
    const { id } = evt.data;
    const eventType = evt.type;

    console.log(`Webhook with an ID of ${id} and type of ${eventType}`);

    if (eventType === "user.created") {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data;

      const user = {
        _id: id,
        email: email_addresses[0].email_address,
        username: `${first_name} ${last_name}`,
        image: image_url,
      };

      await User.create(user);
    }

    if (eventType === "user.updated") {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data;

      const user = {
        _id: id,
        email: email_addresses[0].email_address,
        username: `${first_name} ${last_name}`,
        image: image_url,
      };

      await User.findByIdAndUpdate(id, user);
    }

    if (eventType === "user.deleted") {
      const { id } = evt.data;
      await User.findByIdAndDelete(id);
    }

    return res.status(200).json({ success: true, message: "Webhook received" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default clerkWebhooks;