import User from "../models/user.models.js";
import { Webhook } from "svix";

const clerkWebhooks = async (req, res) => {
  try {
    console.log("Webhook endpoint hit!");
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);

    // Get the headers and body
    const headers = req.headers;
    const payload = req.body;

    // Get the Svix headers for verification
    const svix_id = headers["svix-id"];
    const svix_timestamp = headers["svix-timestamp"];
    const svix_signature = headers["svix-signature"];

    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.error("Missing Svix headers");
      return res.status(400).json({ 
        error: "Missing required Svix headers",
        details: {
          "svix-id": !!svix_id,
          "svix-timestamp": !!svix_timestamp,
          "svix-signature": !!svix_signature
        }
      });
    }

    // Create a new Svix instance with your secret.
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    let evt;

    // Attempt to verify the incoming webhook
    try {
      evt = wh.verify(payload, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      });
    } catch (err) {
      console.error("Webhook verification failed:", err);
      return res.status(400).json({ 
        error: "Webhook verification failed",
        details: err.message
      });
    }

    // Get the ID from the data object
    const eventId = evt.data.id;
    const eventType = evt.type;

    console.log(`Received ${eventType} event for ID: ${eventId}`);
    console.log("Full event data:", JSON.stringify(evt.data, null, 2));

    // Handle different event types
    switch(eventType) {
      case "user.created":
        try {
          // Get user data from the event
          const userData = evt.data;
          
          const user = {
            _id: userData.id,
            email: userData.email_addresses[0].email_address,
            username: `${userData.first_name} ${userData.last_name}`,
            image: userData.image_url,
          };
          
          console.log("Creating user:", user);
          const createdUser = await User.create(user);
          console.log("User created successfully:", createdUser);
          
          return res.status(200).json({ 
            success: true, 
            message: "User created successfully",
            user: createdUser
          });
        } catch (err) {
          console.error("Error creating user:", err);
          return res.status(500).json({ 
            error: "Failed to create user",
            details: err.message
          });
        }
        break;

      case "user.updated":
        try {
          const userData = evt.data;
          
          const user = {
            _id: userData.id,
            email: userData.email_addresses[0].email_address,
            username: `${userData.first_name} ${userData.last_name}`,
            image: userData.image_url,
          };

          console.log("Updating user:", user);
          const updatedUser = await User.findByIdAndUpdate(userData.id, user, { new: true });
          console.log("User updated successfully:", updatedUser);
          
          return res.status(200).json({ 
            success: true, 
            message: "User updated successfully",
            user: updatedUser
          });
        } catch (err) {
          console.error("Error updating user:", err);
          return res.status(500).json({ 
            error: "Failed to update user",
            details: err.message
          });
        }
        break;

      case "user.deleted":
        try {
          console.log("Deleting user with ID:", eventId);
          const deletedUser = await User.findByIdAndDelete(eventId);
          console.log("User deleted successfully:", deletedUser);
          
          return res.status(200).json({ 
            success: true, 
            message: "User deleted successfully",
            user: deletedUser
          });
        } catch (err) {
          console.error("Error deleting user:", err);
          return res.status(500).json({ 
            error: "Failed to delete user",
            details: err.message
          });
        }
        break;

      default:
        console.log(`Unhandled event type: ${eventType}`);
        return res.status(200).json({ 
          success: true, 
          message: "Webhook received but event type not handled"
        });
    }

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
          
          return res.status(200).json({ 
            success: true, 
            message: "User created successfully",
            user: createdUser
          });
        } catch (err) {
          console.error("Error creating user:", err);
          return res.status(500).json({ 
            error: "Failed to create user",
            details: err.message
          });
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
          
          return res.status(200).json({ 
            success: true, 
            message: "User updated successfully",
            user: updatedUser
          });
        } catch (err) {
          console.error("Error updating user:", err);
          return res.status(500).json({ 
            error: "Failed to update user",
            details: err.message
          });
        }
        break;

      case "user.deleted":
        try {
          console.log("Deleting user with ID:", id);
          const deletedUser = await User.findByIdAndDelete(id);
          console.log("User deleted successfully:", deletedUser);
          
          return res.status(200).json({ 
            success: true, 
            message: "User deleted successfully",
            user: deletedUser
          });
        } catch (err) {
          console.error("Error deleting user:", err);
          return res.status(500).json({ 
            error: "Failed to delete user",
            details: err.message
          });
        }
        break;

      default:
        console.log(`Unhandled event type: ${eventType}`);
        return res.status(200).json({ 
          success: true, 
          message: "Webhook received but event type not handled"
        });
    }

  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(500).json({ 
      error: error.message,
      stack: error.stack
    });
  }
};

export default clerkWebhooks;