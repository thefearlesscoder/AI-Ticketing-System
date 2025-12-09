import { Inngest } from "inngest";

export const inngest = new Inngest({ id: "ticketing-system" });
// all the finction would be kept under this id.

// when using for multiple services, make sure each service has its own inngest client with unique id.