export class Archive {
  id: string;
  name: string;
  images: ArchiveImg[];
}

class ArchiveImg {
  page: number;
  image: string;
}