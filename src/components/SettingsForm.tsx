import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

const validateNumber = z.preprocess((value) => {
  if (typeof value === "string") {
    const parsed = Number(value);
    if (!isNaN(parsed) && isFinite(parsed)) {
      return parsed;
    }
  }
  return value;
}, z.number({message: 'Неправильний формат'}).int("Число має бути цілим").min(1, "Число має бути не меншим за 1"));

const FormSchema = z.object({
  nC: validateNumber,
  nB: validateNumber,
  nD: validateNumber,
  nR: validateNumber,
});

export default function SettingsForm() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      nC: 1,
      nB: 1,
      nD: 1,
      nR: 1,
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log(data);
  }

  return (
    <div className="mx-auto max-w-xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">Параметри Графа</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 items-center gap-4">
            <Label htmlFor="nC">
              Кількість пунктів добування (n<sub>C</sub>)
            </Label>
            <FormField
              control={form.control}
              name="nC"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field}  />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <Label htmlFor="nC">
              Кількість нафтових центрів (n<sub>B</sub>)
            </Label>
            <FormField
              control={form.control}
              name="nB"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field}  />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <Label htmlFor="nD">
              Кількість розподільчих центрів (n<sub>D</sub>)
            </Label>
            <FormField
              control={form.control}
              name="nD"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field}  />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <Label htmlFor="nR">
              Кількість точок попиту (n<sub>R</sub>)
            </Label>
            <FormField
              control={form.control}
              name="nR"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit">Побудувати граф</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
