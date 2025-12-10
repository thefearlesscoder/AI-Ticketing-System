import {inngest} from "../inngest/client.js";
import User from "../../models/user.js";
import { sendEmail } from "../../utils/mailer.js";
import { NonRetriableError } from "inngest";
import Ticket from "../../models/ticket.js";
import analyzeTicket from "../../utils/aiTicketAgent.js";

export const onTicketCreated = inngest.createFunction(
  { id: "on-ticket-created", retries: 2 },
  { event: "ticket/created" },
async ({event, step}) => {
    try {
        const ticketId = event.data;
        // fetch ticket details from database
       const ticket = await step.run("fetch-ticket", async() => {
            const ticketObject = await Ticket.findById(ticketId).populate('createdBy');
            if(!ticketObject){
                throw new NonRetriableError("Ticket no longer exists in our database");
            }
            return ticketObject;
       })

       await step.run("update-ticket-status", async() => {
            await Ticket.findByIdAndUpdate(ticket._id, {status: "TODO"});
       })

       const aiResponse = await analyzeTicket(ticket);

       const relatedSkills = await step.run("ai-processing", async() =>{
            let skills = [];
            if(aiResponse) {
                await Ticket.findByIdAndUpdate(ticket._id, {
                    priority: !["low, medium, high"].includes(aiResponse.priority) ? "medium" : aiResponse.priority,
                    helpfulNotes: aiResponse.helpfulNotes,
                    status: "IN_PROGRESS",
                    relatedSkills: aiResponse.relatedSkills,
                });
                skills = aiResponse.relatedSkills;
            }
            return skills;
       });

       // anext step -> assign to the moderator with matching skills
       const moderator = await step.run("assign-moderator", async() => {
            let user = await User.findOne({ role: "moderator", skills: { $in: relatedSkills } });

            if(!user){
                user = await User.findOne({role: "admin"});
            }
            await Ticket.findByIdAndUpdate(ticket._id, {
                assignedTo: user?._id || null,
            });
            return user;
       })

       // ticket assign krne ke baad email bhejna hai moderator/ admin ko.
       await step.run("send-assignment-email", async() => {
            const finalTicket = await Ticket.findById(ticket._id);
            await sendEmail(
                moderator.email,
                "Ticket Assignment Notification",
                `New Ticket Assigned: ${finalTicket.title}`,
            )
       })
       return { success: true };

    } catch (error) {
        console.error("❌ Error running step", error.message);
        return { success: false}
    }
}
);