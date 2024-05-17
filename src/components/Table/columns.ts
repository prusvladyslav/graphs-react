import { ColumnDef } from "@tanstack/react-table";

export type Data = {
  name: string;
  korpelevich: string;
  popov: string;
  reflection: string;
};

export const columns: ColumnDef<Data>[] = [
  {
    accessorKey: "name",
    header: "",
  },
  {
    accessorKey: "korpelevich",
    header: "Метод Корпелевич",
  },
  {
    accessorKey: "popov",
    header: "Метод екстраполяції з минулого",
  },
  {
    accessorKey: "reflection",
    header: "Метод проектування з відбиттям",
  },
];
