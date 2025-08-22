import { inngest } from "@/lib/inngest/client";
import User from "@/models/user";
import {sendMail} from "@/lib/utils/mail";
import { NonRetriableError } from "inngest";




export const onUserSignup = inngest.createFunction(
    { id: "on-user-signup", retries: 2 },
    { event: "user/signup" },
    async ({ event, step }: { event: { data: { email: string } }, step: import("inngest").any }) => {
        try {
            const { email } = event.data;
            const user = await step.run("get-user-email", async () => {
                const userObject = await User.findOne({ email });
                if (!userObject) {
                    throw new NonRetriableError("User not found");
                }
                return userObject;
            });
            await step.run("send-welcome-email", async () => {
                const subject = "Welcome to Inngest Ticketing System";
                const message = `Hi 
                \n\n
                Thanks for signing up. we're glad to have you onboard!`;
                await sendMail({
                    to: user.email,
                    subject,
                    text: message
                });
            });
            return { success: true };
        } catch (error) {
            if (error instanceof Error) {
                console.error("Mail error:", error.message);
            } else {
                console.error("Mail error:", error);
            }
            return { success: false };
        }
    }
);