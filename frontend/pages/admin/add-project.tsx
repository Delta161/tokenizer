import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CountryDropdown } from "@/components/ui/country-dropdown";

type FormValues = {
  title: string;
  location: string;
  imageUrl: string;
  type: string;
  tokenPrice: string;
  totalTokens: string;
  description: string;
  country: string;
};

export default function AddProjectForm() {
  const form = useForm<FormValues>({
    defaultValues: {
      title: "",
      location: "",
      imageUrl: "",
      type: "",
      tokenPrice: "",
      totalTokens: "",
      description: "",
      country: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    // Call your API
    console.log("Submitting:", data);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Add New Project</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Title" {...field} />
                </FormControl>
                <FormDescription>This is the Title field</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="Location" {...field} />
                </FormControl>
                <FormDescription>This is the Location field</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <CountryDropdown
                  value={field.value}
                  onChange={(value) => field.onChange(value)}
                  placeholder="Select a country"
                />
                <FormDescription>This is the Country field</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image URL</FormLabel>
                <FormControl>
                  <Input placeholder="Image URL" {...field} />
                </FormControl>
                <FormDescription>This is the Image URL field</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <FormControl>
                  <Input placeholder="Type" {...field} />
                </FormControl>
                <FormDescription>This is the Type field</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="tokenPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Token Price (€)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="Token Price" {...field} />
                  </FormControl>
                  <FormDescription>This is the Token Price field</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="totalTokens"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Tokens</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Total Tokens" {...field} />
                  </FormControl>
                  <FormDescription>This is the Total Tokens field</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Description" {...field} />
                </FormControl>
                <FormDescription>This is the Description field</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Submit Project</Button>
        </form>
      </Form>
    </div>
  );
}
