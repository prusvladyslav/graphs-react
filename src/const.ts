export const methodOptions = [
  { label: "Метод Корпелевича", value: "korpelevich" },
  { label: "Метод Попова", value: "popov" },
  {
    label: "Метод проектування з відбиттям",
    value: "reflection",
  },
  { label: "Усі три", value: "all" },
];

export const specialEdgeValues = {
  source1TargetC: {
    alpha: "1",
    c: "f^2+6*f",
    z: "0",
    r: "2*f^2",
  },
  sourceCTargetB: {
    alpha: "1",
    c: "2*f^2+7*f",
    z: "0",
    r: "0",
  },
  sourceBTargetP: {
    alpha: "1",
    c: "f^2+11*f",
    z: "0",
    r: "0",
  },
  sourcePTargetS: {
    alpha: "1",
    c: "3*f^2+11*f",
    z: "0",
    r: "0",
  },
  sourceSTargetD: {
    alpha: "1",
    c: "f^2+2*f",
    z: "0",
    r: "0",
  },
  sourceDTargetR: {
    alpha: "1",
    c: "f^2+f",
    z: "0",
    r: "0",
  },
};
