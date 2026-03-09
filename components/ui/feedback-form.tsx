"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
    { id: "ai_analysis", label: "AI Pitch Analysis" },
    { id: "matching", label: "Investor Matching" },
    { id: "insights", label: "Market Insights" },
    { id: "competitive", label: "Competitive Analysis" },
    { id: "scoring", label: "Pitch Scoring" },
] as const;

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    email: z.string().email("Please enter a valid email address."),
    role: z.string({ required_error: "Please select your role." }),
    source: z.string({ required_error: "Please select how you heard about us." }),
    rating: z.enum(["1", "2", "3", "4", "5"], { required_error: "Please select a rating." }),
    valuableFeatures: z.array(z.string()).refine((value) => value.some((item) => item), {
        message: "You have to select at least one feature.",
    }),
    feedback: z
        .string()
        .min(20, "Feedback must be at least 20 characters.")
        .max(500, "Feedback must not be longer than 500 characters."),
    recommend: z.enum(["Yes, definitely", "Probably", "Not sure", "No"], {
        required_error: "Please tell us if you would recommend PitchIQ.",
    }),
    companyName: z.string().optional(),
    linkedin: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
});

export function FeedbackForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        mode: "onBlur",
        defaultValues: {
            name: "",
            email: "",
            valuableFeatures: [],
            feedback: "",
            companyName: "",
            linkedin: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);

        // Simulate API call
        // TODO: Connect to feedback API endpoint
        console.log(values);

        setTimeout(() => {
            setIsSubmitting(false);
            setIsSuccess(true);
        }, 1500);
    }

    if (isSuccess) {
        return (
            <section className="py-24 px-6 md:px-12 w-full flex justify-center bg-background">
                <Card className="w-full max-w-2xl bg-card border-border shadow-xl">
                    <CardContent className="pt-6 text-center space-y-4">
                        <div className="mx-auto w-12 h-12 bg-primary/20 text-primary rounded-full flex items-center justify-center text-2xl">
                            🎉
                        </div>
                        <h3 className="text-2xl font-bold text-foreground">Thank you for your feedback!</h3>
                        <p className="text-muted-foreground">It helps us build a better Antigravity.</p>
                    </CardContent>
                </Card>
            </section>
        );
    }

    return (
        <section className="py-24 px-6 md:px-12 w-full flex justify-center bg-background relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

            <Card className="w-full max-w-2xl bg-card border-border shadow-2xl relative z-10">
                <CardHeader className="text-center space-y-2">
                    <CardTitle className="text-3xl font-bold tracking-tight">We'd Love Your Feedback</CardTitle>
                    <CardDescription className="text-lg">
                        Help us improve Antigravity for founders everywhere
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name <span className="text-destructive">*</span></FormLabel>
                                            <FormControl>
                                                <Input placeholder="Your name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email <span className="text-destructive">*</span></FormLabel>
                                            <FormControl>
                                                <Input type="email" placeholder="your@email.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="role"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Role <span className="text-destructive">*</span></FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select your role" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Founder">Founder</SelectItem>
                                                    <SelectItem value="Investor / VC">Investor / VC</SelectItem>
                                                    <SelectItem value="Mentor / Advisor">Mentor / Advisor</SelectItem>
                                                    <SelectItem value="Other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="source"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>How did you hear about Antigravity? <span className="text-destructive">*</span></FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select source" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                                                    <SelectItem value="Twitter/X">Twitter/X</SelectItem>
                                                    <SelectItem value="Friend / Colleague">Friend / Colleague</SelectItem>
                                                    <SelectItem value="Google Search">Google Search</SelectItem>
                                                    <SelectItem value="Product Hunt">Product Hunt</SelectItem>
                                                    <SelectItem value="Other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="rating"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel>Rate your experience <span className="text-destructive">*</span></FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                className="flex space-x-4"
                                            >
                                                {["1", "2", "3", "4", "5"].map((num) => (
                                                    <FormItem className="flex items-center space-x-2 space-y-0" key={num}>
                                                        <FormControl>
                                                            <RadioGroupItem value={num} />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">
                                                            {num}
                                                        </FormLabel>
                                                    </FormItem>
                                                ))}
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="valuableFeatures"
                                render={() => (
                                    <FormItem>
                                        <div className="mb-4">
                                            <FormLabel className="text-base">What feature do you find most valuable? <span className="text-destructive">*</span></FormLabel>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {features.map((feature) => (
                                                <FormField
                                                    key={feature.id}
                                                    control={form.control}
                                                    name="valuableFeatures"
                                                    render={({ field }) => {
                                                        return (
                                                            <FormItem
                                                                key={feature.id}
                                                                className="flex flex-row items-start space-x-3 space-y-0"
                                                            >
                                                                <FormControl>
                                                                    <Checkbox
                                                                        checked={field.value?.includes(feature.id)}
                                                                        onCheckedChange={(checked) => {
                                                                            return checked
                                                                                ? field.onChange([...field.value, feature.id])
                                                                                : field.onChange(
                                                                                    field.value?.filter(
                                                                                        (value) => value !== feature.id
                                                                                    )
                                                                                )
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <FormLabel className="font-normal">
                                                                    {feature.label}
                                                                </FormLabel>
                                                            </FormItem>
                                                        )
                                                    }}
                                                />
                                            ))}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="feedback"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Your Feedback <span className="text-destructive">*</span></FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Share your experience or suggestions..."
                                                className="resize-none h-32"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription className="text-right text-xs">
                                            {field.value?.length || 0}/500
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="recommend"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel>Would you recommend Antigravity to others? <span className="text-destructive">*</span></FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                className="flex flex-col space-y-1"
                                            >
                                                {["Yes, definitely", "Probably", "Not sure", "No"].map((option) => (
                                                    <FormItem className="flex items-center space-x-3 space-y-0" key={option}>
                                                        <FormControl>
                                                            <RadioGroupItem value={option} />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">
                                                            {option}
                                                        </FormLabel>
                                                    </FormItem>
                                                ))}
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                                <FormField
                                    control={form.control}
                                    name="companyName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Your startup/company name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Startup or company name (optional)" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="linkedin"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>LinkedIn Profile</FormLabel>
                                            <FormControl>
                                                <Input placeholder="https://linkedin.com/in/yourprofile (optional)" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button
                                    type="submit"
                                    size="lg"
                                    disabled={!form.formState.isValid || isSubmitting}
                                    className="w-full sm:w-auto"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        "Submit Feedback"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </section>
    );
}
