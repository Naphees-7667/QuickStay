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
    try {
      evt = wh.verify(payload, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      });
    } catch (err) {
      console.error("Error verifying webhook:", err.message);
      console.error("Headers:", headers);
      console.error("Payload:", payload);
      return res.status(400).json({ success: false, message: err.message });
    }

    // Get the ID and type
    const { id } = evt.data;
    const eventType = evt.type;

    console.log(`Webhook received - ID: ${id}, Type: ${eventType}`);
    console.log("Event data:", evt.data);

    // Handle different event types
    switch(eventType) {
      case "user.created":
        try {
          const { id, email_addresses, first_name, last_name, image_url } = evt.data;
          
          const user = {
            _id: id,
            email: email_addresses[0].email_address,
            username: `${first_name} ${last_name}`,
            image: image_url,
          };
          
          console.log("Creating user:", user);
          const createdUser = await User.create(user);
          console.log("User created successfully:", createdUser);
        } catch (err) {
          console.error("Error creating user:", err);
          throw err;
        }
        break;

      case "user.updated":
        try {
          const { id, email_addresses, first_name, last_name, image_url } = evt.data;
          
          const user = {
            _id: id,
            email: email_addresses[0].email_address,
            username: `${first_name} ${last_name}`,
            image: image_url,
          };

          console.log("Updating user:", user);
          const updatedUser = await User.findByIdAndUpdate(id, user, { new: true });
          console.log("User updated successfully:", updatedUser);
        } catch (err) {
          console.error("Error updating user:", err);
          throw err;
        }
        break;

      case "user.deleted":
        try {
          console.log("Deleting user with ID:", id);
          const deletedUser = await User.findByIdAndDelete(id);
          console.log("User deleted successfully:", deletedUser);
        } catch (err) {
          console.error("Error deleting user:", err);
          throw err;
        }
        break;

      default:
        console.log(`Unhandled event type: ${eventType}`);
        break;
    }

    return res.status(200).json({ success: true, message: "Webhook received" });
  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(500).json({ 
      success: false, 
      message: error.message,
      error: error.toString()
    });
  }
};

export default clerkWebhooks;