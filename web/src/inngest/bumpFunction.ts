import { Inngest } from "inngest";

const inngest = new Inngest({ name: "My app" });
export default inngest.createFunction(
  "Find match for bump",   // The name of your function, used for observability.
  "bump.created", // The event that triggers this function.
  // This code will be called every time an event payload is received
  ({event}) => {
    console.log("Hello world");
    const { user, RequestTime } = event.data;
    console.log(user, RequestTime);
    
    return {success: true}
  },
)