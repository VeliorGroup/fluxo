"use server";

import { z } from "zod";

const transactionSchema = z.object({
  amount: z.number().refine((val) => val !== 0, "Amount must be non-zero"),
  date: z.string().min(1),
  description: z.string().min(1).max(200),
  category: z.string().min(1),
  type: z.enum(["income", "expense"]),
  status: z.enum(["paid", "pending", "forecasted"]),
  company_id: z.string().min(1),
});

export async function createTransaction(formData: FormData) {
  const raw = {
    amount: Number(formData.get("amount")),
    date: formData.get("date") as string,
    description: formData.get("description") as string,
    category: formData.get("category") as string,
    type: formData.get("type") as string,
    status: formData.get("status") as string,
    company_id: formData.get("company_id") as string,
  };

  const validated = transactionSchema.safeParse(raw);

  if (!validated.success) {
    return { success: false, error: validated.error.flatten().fieldErrors };
  }

  // TODO: Insert into Supabase when credentials are configured
  // const { data, error } = await supabase
  //   .from("transactions")
  //   .insert({
  //     ...validated.data,
  //     user_id: (await supabase.auth.getUser()).data.user?.id,
  //   });

  console.log("Server Action — createTransaction:", validated.data);

  return { success: true };
}
