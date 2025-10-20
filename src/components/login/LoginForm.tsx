"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form } from "@/components/ui/form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";

const loginSchema = z.object({
  email: z.string(),
  password: z.string().min(6).max(100),
});

export function LoginForm() {
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    await signIn("credentials", {
      email: data.email,
      password: data.password,
      callbackUrl: window.location.href, // Redirect to the current page
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="Email"
                  {...field}
                  className="w-full px-4 py-3 rounded-lg bg-white text-black placeholder-gray-500 border border-gray-300 focus:ring-2 focus:ring-[#3E7C78] focus:border-[#3E7C78] transition-colors"
                />
              </FormControl>
              <FormMessage className="text-red-500 text-sm mt-1" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Password"
                  {...field}
                  className="w-full px-4 py-3 rounded-lg bg-white text-black placeholder-gray-500 border border-gray-300 focus:ring-2 focus:ring-[#3E7C78] focus:border-[#3E7C78] transition-colors"
                />
              </FormControl>
              <FormMessage className="text-red-500 text-sm mt-1" />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full bg-[#3E7C78] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#2E5C58] transition-colors shadow-md"
        >
          Sign In
        </Button>
      </form>
    </Form>
  );
}
