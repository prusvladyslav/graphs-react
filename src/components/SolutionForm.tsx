import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { Dispatch, SetStateAction } from "react";
import { Answer, SolutionData } from "@/App";
import { cn } from "@/lib/utils";
import { methodOptions } from "@/const";

const validateNumber = z.preprocess((value) => {
  if (typeof value === "string" && value !== "") {
    const parsed = Number(value);
    if (!isNaN(parsed) && isFinite(parsed)) {
      return parsed;
    }
  }
  return value;
}, z.number({ message: "Неправильний формат" }));

const FormSchema = z.object({
  solutionMethod: z.string(),
  c_min: validateNumber,
  c_max: validateNumber,
  lambda: z.preprocess((value) => {
    if (typeof value === "string" && value !== "") {
      const parsed = Number(value);
      if (!isNaN(parsed) && isFinite(parsed)) {
        return parsed;
      }
    }
    return value;
  }, z.number({ message: "Неправильний формат" }).min(0, "Число має бути не меншим за 0").max(1, "Число має бути не більшим за 1")),
  epsilon: z.preprocess((value) => {
    if (typeof value === "string" && value !== "") {
      console.log(value);

      const parsed = Number(value);

      if (!isNaN(parsed) && isFinite(parsed)) {
        return parsed;
      }
    }
    return value;
  }, z.number({ message: "Неправильний формат" }).min(0, "Число має бути не меншим за 0").max(1, "Число має бути не більшим за 1")),
});

type Props = {
  setSolutionData: Dispatch<SetStateAction<SolutionData | null>>;
  setAnswers: Dispatch<SetStateAction<Answer | null>>;
};

export const SolutionForm: React.FC<Props> = ({
  setSolutionData,
  setAnswers,
}) => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      c_min: 0,
      c_max: 10,
      lambda: 0.001,
      epsilon: 0.00001,
      solutionMethod: "korpelevich",
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    setAnswers(null);
    setSolutionData(data);
  }

  const { isValid } = form.formState;

  return (
      <div className="mx-auto max-w-xl p-6 space-y-6">
        <h1 className="text-2xl font-bold">Параметри Методу</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="solutionMethod">Метод</Label>
              <FormField
                  control={form.control}
                  name="solutionMethod"
                  render={({field}) => (
                      <FormItem>
                        <div className="relative w-max">
                          <FormControl>
                            <select
                                className={cn(
                                    buttonVariants({variant: "outline"}),
                                    "w-[256px] appearance-none font-normal"
                                )}
                                {...field}
                            >
                              {methodOptions.map(({value, label}) => (
                                  <option key={value} value={value}>
                                    {label}
                                  </option>
                              ))}
                            </select>
                          </FormControl>
                        </div>
                        <FormMessage/>
                      </FormItem>
                  )}
              />
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="c_min">
                Межа C<sub>min</sub> функції проектування
              </Label>
              <FormField
                  control={form.control}
                  name="c_min"
                  render={({field}) => (
                      <FormItem>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage/>
                      </FormItem>
                  )}
              />
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="c_max">
                Межа C<sub>max</sub> функції проектування
              </Label>
              <FormField
                  control={form.control}
                  name="c_max"
                  render={({field}) => (
                      <FormItem>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage/>
                      </FormItem>
                  )}
              />
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="lambda">Коефіцієнт λ</Label>
              <FormField
                  control={form.control}
                  name="lambda"
                  render={({field}) => (
                      <FormItem>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage/>
                      </FormItem>
                  )}
              />
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="epsilon">Точність ε</Label>
              <FormField
                  control={form.control}
                  name="epsilon"
                  render={({field}) => (
                      <FormItem>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage/>
                      </FormItem>
                  )}
              />
            </div>
            <div className="flex justify-end">
              <Button
                  disabled={!isValid}
                  className={cn({"bg-slate-700": !isValid})}
                  type="submit"
              >
                Розв'язати
              </Button>
            </div>
          </form>
        </Form>
      </div>
  );
};
