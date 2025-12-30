import { educationData } from "../educationData";

interface SubMenuItem {
  name: string;
  path?: string;
  children?: SubMenuItem[];
}

export function getEducationHeaderMenu(): SubMenuItem[] {
  return educationData.audiences.flatMap((aud) =>
    aud.streams.map((stream) => ({
      name: stream.title, // Level 1
      children: stream.categories.map((cat) => ({
        name: cat.title,    // Level 2 (clickable)
        path: cat.path,
      })),
    }))
  );
}
